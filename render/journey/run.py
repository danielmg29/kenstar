"""Renders the journey. Run with Blender:

  blender -b --factory-startup -P render/journey/run.py -- <job> [args]

Jobs
  preview <chapter> <state> <light> [width]      quick low-sample look at a rest pose
  still <chapter> <state> <light> <name>         full-quality rest still (1920 x 1440)
  travel <chapter> <first> <last>                walking frames into a chapter (1280 x 960)
  lines <chapter>                                the chapter's line drawing, as vector strokes (JSON)
  anchors                                        Field Note anchors in each rest frame (JSON)

<light> is day, dusk or night (dusk with the fittings lit). Output goes to render/out/.
"""
import json
import math
import os
import sys
import time

import bpy
from bpy_extras.object_utils import world_to_camera_view
from mathutils import Vector

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lib  # noqa: E402
import materials  # noqa: E402
import world  # noqa: E402

OUT = os.path.normpath(os.path.join(HERE, "..", "out"))
os.makedirs(OUT, exist_ok=True)
HDRI = os.path.join(lib.ASSETS, "hdri")

STILL = (1600, 1200)
TRAVEL = (800, 600)
TRAVEL_FRAMES = 12
H_FOV = 78.0
SHIFT_X = -0.06  # the optical centre sits right of middle, clear of the title block

# ---------------------------------------------------------------- camera path (mirrors app/_components/journey/timeline.ts)

REST = [
    dict(p=(1.4, 1.7, -14), t=(-2.6, 1.15, 20)),
    dict(p=(5.6, 1.7, 46.5), t=(0, 3.3, 67)),
    dict(p=(-5.2, 1.7, 45.2), t=(0.8, 3.6, 62)),
    dict(p=(-0.6, 1.9, 63.3), t=(6.9, 1.45, 66.6)),
    dict(p=(5.6, 1.9, 63.0), t=(-2.0, 0.95, 70.0)),
    dict(p=(5.7, 1.82, 64.3), t=(0.2, 1.85, 71.0)),
]
VIA = [
    [],
    [dict(p=(2.2, 1.7, 24), t=(0.5, 2.2, 62))],
    [],
    [dict(p=(-1.75, 1.72, 58.6), t=(-1.75, 1.65, 70)), dict(p=(-1.75, 1.86, 62.5), t=(-0.6, 1.75, 72))],
    [],
    [],
]
EXPOSURE = {"day_out": 0.0, "day_in": 4.3, "dusk": 3.6, "night": 0.7}


def _angles(pose):
    d = [pose["t"][i] - pose["p"][i] for i in range(3)]
    return math.atan2(d[0], d[2]), math.atan2(d[1], math.hypot(d[0], d[2]))


def _catmull(p0, p1, p2, p3, t):
    t2, t3 = t * t, t * t * t
    return 0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3)


def walk(poses, e):
    if len(poses) == 1 or e <= 0:
        return poses[0]
    if e >= 1:
        return poses[-1]
    lens = [math.dist(poses[i + 1]["p"], poses[i]["p"]) + 0.6 for i in range(len(poses) - 1)]
    d, i = e * sum(lens), 0
    while i < len(lens) - 1 and d > lens[i]:
        d -= lens[i]
        i += 1
    u = d / lens[i]
    P = lambda k: poses[max(0, min(len(poses) - 1, k))]
    yaws = []
    for k, p in enumerate(poses):
        y = _angles(p)[0]
        if k:
            while y - yaws[-1] > math.pi:
                y -= 2 * math.pi
            while yaws[-1] - y > math.pi:
                y += 2 * math.pi
        yaws.append(y)
    Y = lambda k: yaws[max(0, min(len(yaws) - 1, k))]
    pos = [_catmull(P(i - 1)["p"][a], P(i)["p"][a], P(i + 1)["p"][a], P(i + 2)["p"][a], u) for a in range(3)]
    yaw = _catmull(Y(i - 1), Y(i), Y(i + 1), Y(i + 2), u)
    pitch = _catmull(*[_angles(P(i + k))[1] for k in (-1, 0, 1, 2)], u)
    dirv = (math.sin(yaw) * math.cos(pitch), math.sin(pitch), math.cos(yaw) * math.cos(pitch))
    return dict(p=tuple(pos), t=tuple(pos[a] + dirv[a] * 10 for a in range(3)))


# ---------------------------------------------------------------- scene setup

def camera():
    cam = bpy.data.objects.get("cam")
    if cam:
        return cam
    cd = bpy.data.cameras.new("cam")
    cd.sensor_fit = "HORIZONTAL"
    cd.angle = math.radians(H_FOV)
    cd.shift_x = SHIFT_X
    cd.clip_start = 0.05
    cd.clip_end = 3000
    cam = bpy.data.objects.new("cam", cd)
    bpy.context.scene.collection.objects.link(cam)
    bpy.context.scene.camera = cam
    return cam


def set_pose(pose):
    cam = camera()
    p, t = lib.V(*pose["p"]), lib.V(*pose["t"])
    cam.location = p
    cam.rotation_mode = "QUATERNION"
    cam.rotation_quaternion = (t - p).to_track_quat("-Z", "Y")
    bpy.context.view_layer.update()


def _hdri_sun(path):
    """Finds the sun in an equirectangular sky: returns (azimuth, elevation) in Blender's convention."""
    img = bpy.data.images.load(path, check_existing=True)
    small = img.copy()
    small.scale(256, 128)
    px = list(small.pixels)
    best, bi = -1, 0
    for i in range(0, len(px), 4):
        l = px[i] * 0.2126 + px[i + 1] * 0.7152 + px[i + 2] * 0.0722
        if l > best:
            best, bi = l, i // 4
    x, y = bi % 256, bi // 256
    u, v = (x + 0.5) / 256, (y + 0.5) / 128
    bpy.data.images.remove(small)
    return -(u - 0.5) * 2 * math.pi, (v - 0.5) * math.pi


def setup_world(light):
    sc = bpy.context.scene
    w = bpy.data.worlds.get("ks_world") or bpy.data.worlds.new("ks_world")
    sc.world = w
    w.use_nodes = True
    nt = w.node_tree
    for n in list(nt.nodes):
        nt.nodes.remove(n)
    out = nt.nodes.new("ShaderNodeOutputWorld")
    if light == "day":
        path = os.path.join(HDRI, next(f for f in os.listdir(HDRI) if f.startswith("kloofendal")))
        env = nt.nodes.new("ShaderNodeTexEnvironment")
        env.image = bpy.data.images.load(path, check_existing=True)
        az, el = _hdri_sun(path)
        # Turn the sky so its sun comes from the front left, as the site's sketches have it.
        want = math.atan2(-0.38, -0.5)
        tc = nt.nodes.new("ShaderNodeTexCoord")
        mp = nt.nodes.new("ShaderNodeMapping")
        mp.inputs["Rotation"].default_value = (0, 0, az - want)
        nt.links.new(tc.outputs["Generated"], mp.inputs[0])
        nt.links.new(mp.outputs[0], env.inputs[0])
        bg = nt.nodes.new("ShaderNodeBackground")
        bg.inputs[1].default_value = 1.0
        nt.links.new(env.outputs[0], bg.inputs[0])
        nt.links.new(bg.outputs[0], out.inputs[0])
        sc["ks_sun"] = (az - (az - want), el)
    else:
        sky = nt.nodes.new("ShaderNodeTexSky")
        sky.sky_type = "NISHITA" if "NISHITA" in [i.identifier for i in sky.bl_rna.properties["sky_type"].enum_items] else sky.sky_type
        try:
            sky.sun_elevation = math.radians(-3.5)
            sky.sun_rotation = math.radians(220)
            sky.sun_disc = False
            sky.air_density = 1.4
            sky.dust_density = 1.6
        except Exception:
            pass
        bg = nt.nodes.new("ShaderNodeBackground")
        bg.inputs[1].default_value = 0.6
        nt.links.new(sky.outputs[0], bg.inputs[0])
        nt.links.new(bg.outputs[0], out.inputs[0])


ENGINE = os.environ.get("KS_ENGINE", "CYCLES")


def _try(obj, **kw):
    for k, v in kw.items():
        try:
            setattr(obj, k, v)
        except Exception as e:
            print("SKIP", k, e)


def setup_eevee(res, samples, exposure):
    """EEVEE (the GPU rasteriser): ray-traced reflections, soft shadows, screen-space and probe GI."""
    sc = bpy.context.scene
    for name in ("BLENDER_EEVEE", "BLENDER_EEVEE_NEXT"):
        try:
            sc.render.engine = name
            break
        except Exception:
            pass
    e = sc.eevee
    _try(e, taa_render_samples=samples, use_shadows=True, shadow_ray_count=3, shadow_step_count=8, shadow_resolution_scale=1.0,
         use_raytracing=True, ray_tracing_method="SCREEN", use_fast_gi=True, fast_gi_method="GLOBAL_ILLUMINATION",
         fast_gi_resolution="2", fast_gi_step_count=12, fast_gi_distance=4.0, use_volumetric_shadows=False)
    if hasattr(e, "ray_tracing_options"):
        _try(e.ray_tracing_options, resolution_scale="1", trace_max_roughness=0.5, use_denoise=True, screen_trace_quality=0.6, screen_trace_thickness=0.4)
    w = sc.world
    _try(w, sun_threshold=8.0, sun_angle=math.radians(1.2), use_sun_shadow=True)
    sc.render.resolution_x, sc.render.resolution_y = res
    sc.render.resolution_percentage = 100
    sc.render.film_transparent = False
    sc.render.image_settings.file_format = "PNG"
    sc.render.image_settings.color_mode = "RGB"
    sc.render.image_settings.compression = 15
    vs = sc.view_settings
    try:
        vs.view_transform = "AgX"
        vs.look = "AgX - Medium High Contrast"
    except Exception:
        pass
    vs.exposure = exposure


PROBES = {}


def bake_probes(state):
    """Bakes the indirect light inside the house for the current build state (EEVEE only)."""
    if ENGINE != "EEVEE" or state < 2 or PROBES.get("state") == state:
        return
    vol = bpy.data.objects.get("gi_volume")
    if not vol:
        pd = bpy.data.lightprobes.new("gi_volume", "VOLUME")
        _try(pd, grid_resolution_x=14, grid_resolution_y=10, grid_resolution_z=5, grid_bake_samples=1024, grid_surface_bias=0.05, grid_escape_bias=0.1)
        vol = bpy.data.objects.new("gi_volume", pd)
        vol.location = lib.V(0, 1.65, 67)
        vol.scale = (6.85, 4.85, 1.35)
        bpy.context.scene.collection.objects.link(vol)
        for nm, p in (("refl_living", (-3.5, 1.6, 67.5)), ("refl_dining", (3.2, 1.6, 68.5))):
            sd = bpy.data.lightprobes.new(nm, "SPHERE")
            ob = bpy.data.objects.new(nm, sd)
            ob.location = lib.V(*p)
            bpy.context.scene.collection.objects.link(ob)
    t = time.time()
    try:
        bpy.ops.object.lightprobe_cache_bake(subset="ALL")
    except Exception as ex:
        print("BAKE FAILED", ex, flush=True)
    PROBES["state"] = state
    print(f"BAKED probes for state {state} in {time.time() - t:.1f}s", flush=True)


def setup_render(res, samples, exposure):
    sc = bpy.context.scene
    if ENGINE == "EEVEE":
        return setup_eevee(res, max(64, samples), exposure)
    sc.render.engine = "CYCLES"
    prefs = bpy.context.preferences.addons["cycles"].preferences
    # This laptop's NVIDIA driver is too old for Blender 5.3's GPU kernels, so Cycles runs on the CPU
    # unless KS_DEVICE says otherwise (after a driver update: KS_DEVICE=OPTIX or CUDA).
    kind = os.environ.get("KS_DEVICE", "CPU")
    if kind == "CPU":
        sc.cycles.device = "CPU"
        sc.render.threads_mode = "AUTO"
    else:
        prefs.compute_device_type = kind
        prefs.get_devices()
        for d in prefs.devices:
            d.use = d.type == kind
        sc.cycles.device = "GPU"
    sc.cycles.samples = samples
    sc.cycles.use_adaptive_sampling = True
    sc.cycles.adaptive_threshold = 0.015
    sc.cycles.use_denoising = True
    try:
        sc.cycles.denoiser = "OPENIMAGEDENOISE"
    except Exception:
        pass
    sc.cycles.max_bounces = 4
    sc.cycles.diffuse_bounces = 2
    sc.cycles.glossy_bounces = 2
    sc.cycles.transmission_bounces = 4
    sc.cycles.transparent_max_bounces = 10
    sc.cycles.sample_clamp_indirect = 3.0
    sc.cycles.use_denoising = True
    try:
        sc.cycles.denoising_use_gpu = False
        sc.cycles.denoising_input_passes = "RGB_ALBEDO_NORMAL"
        sc.cycles.denoising_prefilter = "ACCURATE"
    except Exception:
        pass
    sc.cycles.blur_glossy = 1.0
    sc.cycles.caustics_reflective = False
    sc.cycles.caustics_refractive = False
    sc.render.resolution_x, sc.render.resolution_y = res
    sc.render.resolution_percentage = 100
    sc.render.use_persistent_data = True
    sc.render.film_transparent = False
    sc.render.image_settings.file_format = "PNG"
    sc.render.image_settings.color_mode = "RGB"
    sc.render.image_settings.compression = 15
    vs = sc.view_settings
    try:
        vs.view_transform = "AgX"
        vs.look = "AgX - Medium High Contrast"
    except Exception:
        pass
    vs.exposure = exposure


def set_lights(on):
    for ob, watts in world.LIGHTS:
        ob.data.energy = watts if on else 0.0
    for name, s in (("bulb_warm", 40.0), ("led_strip", 18.0), ("downlight_disc", 30.0)):
        lib.set_emission(name, s if on else 0.0)


def build():
    for o in list(bpy.data.objects):
        bpy.data.objects.remove(o)
    M = materials.build()
    anchors = world.build(M)
    camera()
    return anchors


def exposure_for(chapter, light):
    if chapter == 3 and light == "day":
        return EXPOSURE["day_in"] + 0.7  # the bare shell, before plaster and paint, takes more light
    if light == "night":
        return EXPOSURE["night"]
    if light == "dusk":
        return EXPOSURE["dusk"]
    return EXPOSURE["day_in"] if chapter >= 3 else EXPOSURE["day_out"]


def render_to(path):
    bpy.context.scene.render.filepath = path
    t = time.time()
    bpy.ops.render.render(write_still=True)
    print(f"RENDERED {os.path.basename(path)} in {time.time() - t:.1f}s", flush=True)


# ---------------------------------------------------------------- line drawing

STYLE = r'''
import bpy, json
from freestyle.types import Operators, StrokeShader, UnaryPredicate1D, Nature
from freestyle.predicates import QuantitativeInvisibilityUP1D, TrueUP1D, NotUP1D, AndUP1D, OrUP1D, pyNatureUP1D
from freestyle.chainingiterators import ChainSilhouetteIterator
from freestyle.shaders import ConstantThicknessShader, SamplingShader
sc = bpy.context.scene
CH = int(sc["ks_line_chapter"])
OUT = sc["ks_line_out"]
W, H = sc.render.resolution_x, sc.render.resolution_y
LINES = {}

def group_of(name):
    ob = bpy.data.objects.get(name)
    if not ob or ob.get("ks_ch") != CH or ob.get("ks_noline"):
        return None
    return min(9, int(float(ob.get("ks_order", 0.5)) * 10))

class InGroup(UnaryPredicate1D):
    def __init__(self, g):
        UnaryPredicate1D.__init__(self)
        self.g = g
    def __call__(self, inter):
        try:
            return group_of(inter.viewshape.name) == self.g
        except Exception:
            return False

class Record(StrokeShader):
    def __init__(self, g):
        StrokeShader.__init__(self)
        self.g = g
    def shade(self, stroke):
        pts = [(round(sv.point.x / W, 5), round(1 - sv.point.y / H, 5)) for sv in stroke]
        if len(pts) > 1:
            LINES.setdefault(self.g, []).append(pts)

kinds = OrUP1D(pyNatureUP1D(Nature.SILHOUETTE), OrUP1D(pyNatureUP1D(Nature.BORDER), pyNatureUP1D(Nature.CREASE)))
for g in range(10):
    Operators.reset(delete_strokes=False)
    pred = AndUP1D(AndUP1D(QuantitativeInvisibilityUP1D(0), kinds), InGroup(g))
    Operators.select(pred)
    Operators.bidirectional_chain(ChainSilhouetteIterator(), NotUP1D(pred))
    Operators.create(TrueUP1D(), [SamplingShader(4.0), ConstantThicknessShader(1.0), Record(g)])
with open(OUT, "w") as f:
    json.dump({"w": W, "h": H, "groups": {str(k): v for k, v in sorted(LINES.items())}}, f)
'''


def lines(chapter):
    sc = bpy.context.scene
    # The line drawing is a Freestyle style module (a script), which factory settings refuse to run.
    bpy.context.preferences.filepaths.use_scripts_auto_execute = True
    lib.set_state(chapter)
    set_pose(REST[chapter])
    # Vegetation, scattered grass and glass make no lines and only slow the view map down.
    for o in bpy.data.objects:
        if o.get("ks_asset") or o.name.startswith("hill_"):
            o.hide_render = True
        for m in o.modifiers:
            if m.type == "NODES":
                m.show_render = False
    setup_render(STILL, 1, 0)
    sc.cycles.use_denoising = False
    sc.render.use_freestyle = True
    vl = bpy.context.view_layer
    fs = vl.freestyle_settings
    fs.mode = "SCRIPT"
    fs.crease_angle = math.radians(128)
    fs.use_smoothness = True
    txt = bpy.data.texts.get("ks_lines") or bpy.data.texts.new("ks_lines")
    txt.clear()
    txt.write(STYLE)
    while len(fs.modules):
        fs.modules.remove(fs.modules[0])
    mod = fs.modules.new()
    mod.script = txt
    mod.use = True
    out = os.path.join(OUT, f"lines_c{chapter}.json")
    sc["ks_line_chapter"] = chapter
    sc["ks_line_out"] = out
    render_to(os.path.join(OUT, f"lines_c{chapter}_check.png"))
    with open(out) as f:
        d = json.load(f)
    print("LINES", chapter, {k: len(v) for k, v in d["groups"].items()})


# ---------------------------------------------------------------- jobs

def job_preview(chapter, state, light, width=640):
    setup_world(light)
    setup_render((width, width * 3 // 4), int(os.environ.get("KS_SAMPLES", "32")), exposure_for(chapter, light))
    lib.set_state(state)
    set_lights(light == "night")
    bake_probes(state * 10 + (light == "night"))
    set_pose(REST[chapter])
    render_to(os.path.join(OUT, f"preview_c{chapter}_s{state}_{light}.png"))


def job_still(chapter, state, light, name):
    setup_world(light)
    setup_render(STILL, int(os.environ.get("KS_STILL_SAMPLES", "20")), exposure_for(chapter, light))
    lib.set_state(state)
    set_lights(light == "night")
    bake_probes(state * 10 + (light == "night"))
    set_pose(REST[chapter])
    render_to(os.path.join(OUT, f"{name}.png"))


def job_travel(chapter, first, last):
    """Frames walking from the previous rest pose into this chapter's, with only earlier chapters built."""
    setup_world("day")
    setup_render(TRAVEL, int(os.environ.get("KS_WALK_SAMPLES", "6")), exposure_for(chapter, "day"))
    lib.set_state(chapter - 1)
    set_lights(False)
    bake_probes((chapter - 1) * 10)
    poses = [REST[chapter - 1], *VIA[chapter], REST[chapter]]
    for i in range(first, last + 1):
        e = i / (TRAVEL_FRAMES - 1)
        pose = walk(poses, e)
        # Exposure eases from outdoors to indoors across the doorway, as a camera adapts.
        z = pose["p"][2]
        t = max(0.0, min(1.0, (z - 59.5) / 3.5)) if abs(pose["p"][0]) < 7 else 0.0
        out_ev = exposure_for(2, "day") if chapter == 3 else exposure_for(chapter, "day")
        bpy.context.scene.view_settings.exposure = out_ev + (exposure_for(chapter, "day") - out_ev) * t
        set_pose(pose)
        render_to(os.path.join(OUT, f"travel_c{chapter}_{i:03d}.png"))


def job_anchors():
    sc = bpy.context.scene
    setup_render(STILL, 1, 0)
    out = {}
    for c, pose in enumerate(REST):
        set_pose(pose)
        for note, p in world.ANCHORS.items():
            if note.startswith(f"0{c + 1}."):
                v = world_to_camera_view(sc, camera(), p)
                out[note] = [round(v.x, 5), round(1 - v.y, 5)]
    with open(os.path.join(OUT, "anchors.json"), "w") as f:
        json.dump(out, f, indent=1)
    # Each rest camera, so the site can project its own marks (the survey grid) into the frames.
    cams = []
    for pose in REST:
        set_pose(pose)
        m = camera().matrix_world.inverted()
        cams.append({"m": [round(m[r][k], 6) for r in range(3) for k in range(4)], "tan": round(math.tan(camera().data.angle / 2), 6), "shift": SHIFT_X, "aspect": STILL[0] / STILL[1]})
    with open(os.path.join(OUT, "cameras.json"), "w") as f:
        json.dump(cams, f)
    print("ANCHORS", out)


def bench(args):
    """Profiles what makes the room slow to path-trace (small frames, one session)."""
    setup_world("day")
    lib.set_state(4)
    set_grass(0.0)
    set_pose(REST[4])
    setup_render((320, 240), 32, 3.4)
    sc = bpy.context.scene
    sc.cycles.use_adaptive_sampling = False
    sc.cycles.use_denoising = False

    def timed(label):
        t0 = time.time()
        render_to(os.path.join(OUT, f"bench_{label}.png"))
        print("BENCH", label, round(time.time() - t0, 1), flush=True)

    timed("warm")
    timed("current")
    sc.cycles.max_bounces, sc.cycles.diffuse_bounces, sc.cycles.glossy_bounces, sc.cycles.transmission_bounces = 2, 1, 1, 2
    timed("few_bounces")
    sc.cycles.max_bounces, sc.cycles.diffuse_bounces, sc.cycles.glossy_bounces, sc.cycles.transmission_bounces = 6, 3, 3, 6
    for o in bpy.data.objects:
        if o.type == "LIGHT" and o.name.startswith("portal_"):
            o.hide_render = True
    timed("no_portals")
    for o in bpy.data.objects:
        if o.type == "LIGHT" and o.name.startswith("portal_"):
            o.hide_render = False
    hidden = [o for o in bpy.data.objects if o.get("ks_asset") and not o.hide_render]
    for o in hidden:
        o.hide_render = True
    timed("no_assets")
    for o in hidden:
        o.hide_render = False
    floor = bpy.data.objects["floor_tiles"]
    keep = floor.data.materials[0]
    floor.data.materials[0] = materials.principled("bench_plain", "#efebe5", rough=0.07)
    timed("plain_floor")
    floor.data.materials[0] = keep
    curtains = [o for o in bpy.data.objects if (o.name.startswith("sheer") or o.name.startswith("drape")) and not o.hide_render]
    for o in curtains:
        o.hide_render = True
    timed("no_curtains")
    for o in curtains:
        o.hide_render = False
    glass = [o for o in bpy.data.objects if o.name.startswith("glass_") and not o.hide_render]
    for o in glass:
        o.hide_render = True
    timed("no_glass")


def set_grass(scale):
    """Scales the scattered grass and shrubs (interiors only glimpse the garden, so they need far less)."""
    for o in bpy.data.objects:
        for md in o.modifiers:
            if md.type == "NODES" and md.node_group:
                for n in md.node_group.nodes:
                    if n.type == "MATH" and n.operation == "MULTIPLY":
                        if "ks_base" not in n:
                            n["ks_base"] = n.inputs[1].default_value
                        n.inputs[1].default_value = n["ks_base"] * scale
                md.show_render = scale > 0


def run_job(args):
    job = args[0]
    # Freestyle only for the line drawings: left on, it would trace lines (single-threaded) on every render.
    bpy.context.scene.render.use_freestyle = job == "lines"
    interior = job in ("still", "travel", "preview") and int(args[1]) >= 3
    set_grass(0.0 if interior else 1.0)
    if job == "preview":
        job_preview(int(args[1]), int(args[2]), args[3], int(args[4]) if len(args) > 4 else 640)
    elif job == "previews":
        for spec in args[1:]:
            c, st, light = spec.split(":")
            set_grass(0.0 if int(c) >= 3 else 1.0)
            job_preview(int(c), int(st), light, 640)
    elif job == "still":
        job_still(int(args[1]), int(args[2]), args[3], args[4])
    elif job == "travel":
        job_travel(int(args[1]), int(args[2]), int(args[3]))
    elif job == "lines":
        lines(int(args[1]))
    elif job == "anchors":
        job_anchors()
    elif job == "bench":
        bench(args)
    elif job == "save":
        bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT, "journey.blend"))


def main():
    """Jobs separated by '+' run in one Blender session, so the scene is built once."""
    args = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
    jobs, cur = [], []
    for a_ in args:
        if a_ == "+":
            jobs.append(cur)
            cur = []
        else:
            cur.append(a_)
    if cur:
        jobs.append(cur)
    t = time.time()
    build()
    print(f"BUILT in {time.time() - t:.1f}s; objects {len(bpy.data.objects)}", flush=True)
    for j in jobs:
        try:
            run_job(j)
        except Exception as e:  # one failed still should not cost the rest of the batch
            import traceback

            traceback.print_exc()
            print("JOB FAILED", j, e, flush=True)


main()
