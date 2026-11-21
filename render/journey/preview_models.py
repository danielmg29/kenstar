import bpy, os, sys, math
from mathutils import Vector
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import lib
out = sys.argv[-1]
os.makedirs(out, exist_ok=True)
names = sorted(os.listdir(os.path.join(lib.ASSETS, "models")))
sc = bpy.context.scene
for o in list(bpy.data.objects): bpy.data.objects.remove(o)
sc.render.engine = "CYCLES"
p = bpy.context.preferences.addons["cycles"].preferences; p.compute_device_type = "OPTIX"; p.get_devices()
for d in p.devices: d.use = d.type != "CPU"
sc.cycles.device = "GPU"; sc.cycles.samples = 24; sc.cycles.use_denoising = True
sc.render.resolution_x = sc.render.resolution_y = 360
w = bpy.data.worlds.new("w"); sc.world = w; w.use_nodes = True; w.node_tree.nodes["Background"].inputs[1].default_value = 1.2
cam = bpy.data.objects.new("cam", bpy.data.cameras.new("cam")); sc.collection.objects.link(cam); sc.camera = cam
sun = bpy.data.objects.new("sun", bpy.data.lights.new("sun", "SUN")); sun.data.energy = 3; sun.rotation_euler = (0.8, 0.2, 0.6); sc.collection.objects.link(sun)
for n in names:
    before = set(bpy.data.objects)
    d = os.path.join(lib.ASSETS, "models", n); f = next(os.path.join(d, x) for x in os.listdir(d) if x.endswith(".gltf"))
    bpy.ops.import_scene.gltf(filepath=f)
    new = [o for o in bpy.data.objects if o not in before]
    pts = [o.matrix_world @ Vector(c) for o in new if o.type == "MESH" for c in o.bound_box]
    mn = Vector((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts))); mx = Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)))
    c = (mn + mx) / 2; r = (mx - mn).length / 2
    cam.location = c + Vector((r * 1.6, -r * 2.2, r * 0.9)); cam.rotation_euler = (c - cam.location).to_track_quat("-Z", "Y").to_euler()
    sc.render.filepath = os.path.join(out, n + ".png")
    bpy.ops.render.render(write_still=True)
    print("MODEL", n, "size m", [round(x, 2) for x in (mx - mn)], "tris", sum(len(o.data.polygons) for o in new if o.type == "MESH"))
    for o in new: bpy.data.objects.remove(o)
