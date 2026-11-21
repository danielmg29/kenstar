"""Builds the journey's world in Blender: six chapters, from the road to a finished, furnished, lit room.

Every object is tagged with the chapter that builds it (lib.Ctx.chapter), so lib.set_state(n) shows the
site as it stands once chapter n is done. Scene coordinates are the site's: x right, y up, z forward.
"""
import math
import os
import random

import bmesh
import bpy
from mathutils import Matrix, Vector, noise

import assets_prep as A
import lib
from lib import V, Ctx, beam, box, cylinder, grid_plane, link, plane

R = random.Random(11)
FLOOR = 0.3  # top of the plinth slab
FFL = 0.32  # finished floor level (tiles)
HOUSE = dict(x0=-7, x1=7, z0=62, z1=72)
COLS_X = [-7, -3.5, 0, 3.5, 7]
FRONT_BAYS = [(-6.85, -3.65), (-3.35, -0.15), (0.15, 3.35), (3.65, 6.85)]
SIDE_BAYS = [(62.15, 66.85), (67.15, 71.85)]
DOOR = (-2.5, -1.0, 2.55)

ANCHORS = {}
LIGHTS = []  # (object, energy when on)


def chapter(n, until=None):
    Ctx.chapter = n
    Ctx.until = until
    Ctx.coll = lib.collection(f"ch{n}")


def anchor(note_id, p):
    ANCHORS[note_id] = V(*p)


def order(ob, k):
    """Drawing order within the chapter's line drawing (0 first, 1 last)."""
    ob["ks_order"] = k
    return ob


# ---------------------------------------------------------------- shapes

def cushion(name, lo, hi, mat, round_=0.05, puff=0.25):
    ob = box(name, lo, hi, mat, bevel=round_, segments=4)
    c = ob.modifiers.new("puff", "CAST")
    c.factor = puff
    c.cast_type = "SPHERE"
    lib.subsurf(ob, 1)
    return ob


def ribbon_ring(name, center, radius, width, height, mat, segs=120, twist=0.0, wobble=0.0):
    """A flat metal ribbon bent into a ring (the gold pendant in Kenstar's lighting hall)."""
    bm = bmesh.new()
    rings = []
    for i in range(segs):
        a = 2 * math.pi * i / segs
        r = radius * (1 + wobble * math.sin(3 * a))
        yy = center[1] + 0.05 * wobble * math.sin(2 * a + twist)
        ca, sa = math.cos(a), math.sin(a)
        pts = []
        for dr, dh in ((-width / 2, -height / 2), (width / 2, -height / 2), (width / 2, height / 2), (-width / 2, height / 2)):
            pts.append(bm.verts.new(V(center[0] + (r + dr) * ca, yy + dh, center[2] + (r + dr) * sa)))
        rings.append(pts)
    for i in range(segs):
        a, b = rings[i], rings[(i + 1) % segs]
        for k in range(4):
            f = bm.faces.new((a[k], a[(k + 1) % 4], b[(k + 1) % 4], b[k]))
            f.smooth = True
    return lib.mesh_obj(name, bm, mat)


def prism_mesh():
    """One cut-crystal drop: an elongated octagonal bipyramid."""
    me = bpy.data.meshes.get("crystal_drop")
    if me:
        return me
    bm = bmesh.new()
    n = 8
    top = bm.verts.new((0, 0, 0.0))
    ring_a = [bm.verts.new((0.012 * math.cos(2 * math.pi * i / n), 0.012 * math.sin(2 * math.pi * i / n), -0.03)) for i in range(n)]
    ring_b = [bm.verts.new((0.012 * math.cos(2 * math.pi * i / n), 0.012 * math.sin(2 * math.pi * i / n), -0.11)) for i in range(n)]
    tip = bm.verts.new((0, 0, -0.14))
    for i in range(n):
        j = (i + 1) % n
        bm.faces.new((top, ring_a[i], ring_a[j]))
        bm.faces.new((ring_a[i], ring_b[i], ring_b[j], ring_a[j]))
        bm.faces.new((ring_b[i], tip, ring_b[j]))
    me = bpy.data.meshes.new("crystal_drop")
    bm.to_mesh(me)
    bm.free()
    return me


def crystal(name, p, mat, scale=1.0):
    ob = bpy.data.objects.new(name, prism_mesh())
    if not ob.data.materials:
        ob.data.materials.append(mat)
    ob.location = V(*p)
    ob.scale = (scale, scale, scale)
    return link(ob)


def point_light(name, p, watts, color=(1.0, 0.66, 0.38), radius=0.03, kind="POINT", direction=None, spot=1.2):
    ld = bpy.data.lights.new(name, kind)
    ld.energy = 0.0
    ld.color = color
    if kind in ("POINT", "SPOT"):
        ld.shadow_soft_size = radius
    if kind == "SPOT":
        ld.spot_size = spot
        ld.spot_blend = 0.6
    if kind == "AREA":
        ld.shape = "RECTANGLE"
    ob = bpy.data.objects.new(name, ld)
    ob.location = V(*p)
    if direction:
        ob.rotation_mode = "QUATERNION"
        ob.rotation_quaternion = (-V(*direction)).normalized().to_track_quat("Z", "Y")
    link(ob)
    LIGHTS.append((ob, watts))
    return ob


def pleated(name, x0, x1, y0, y1, plane_at, along, mat, depth=0.06, pleat=0.14, gather=1.0):
    """A pleated curtain panel hanging in a vertical plane. along='x' hangs parallel to the x axis."""
    width = abs(x1 - x0)
    nu = max(8, int(width / pleat * 6))
    nv = 6
    bm = bmesh.new()
    rows = []
    for j in range(nv + 1):
        y = y0 + (y1 - y0) * j / nv
        row = []
        for i in range(nu + 1):
            u = x0 + (x1 - x0) * i / nu
            d = depth * gather * (0.5 + 0.5 * math.sin(2 * math.pi * (u - x0) / pleat)) * (0.85 + 0.15 * j / nv)
            p = (u, y, plane_at - d) if along == "x" else (plane_at - d, y, u)
            row.append(bm.verts.new(V(*p)))
        rows.append(row)
    for j in range(nv):
        for i in range(nu):
            f = bm.faces.new((rows[j][i], rows[j][i + 1], rows[j + 1][i + 1], rows[j + 1][i]))
            f.smooth = True
    ob = lib.mesh_obj(name, bm, mat)
    s = ob.modifiers.new("thick", "SOLIDIFY")
    s.thickness = 0.004
    return ob


# ---------------------------------------------------------------- 01 Approach

def terrain_height(x, z):
    """Gentle Embu ground: flat along the road and on the plot, rolling beyond, carved by the stream."""
    road = max(0.0, min(1.0, (abs(x) - 9) / 22))
    plot = 0.0 if (-26 < x < 26 and 48 < z < 96) else 1.0
    lift = road * plot
    n = noise.noise(Vector((x * 0.025, z * 0.025, 0.3))) * 2.4 + noise.noise(Vector((x * 0.08, z * 0.08, 1.7))) * 0.35
    h = lift * (n + 0.6 * road)
    if 15.2 < z < 20.8 and abs(x) > 5.4:
        t = 1 - abs(z - 18) / 2.8
        h -= 0.85 * math.sin(max(0.0, min(1.0, t)) * math.pi / 2) ** 1.4
    return h


def approach(M):
    chapter(0)
    # Land, in a mesh fine enough to carve the stream; grass is scattered by weight.
    xs = [x for x in range(-160, 161, 4)]
    zs = sorted(set([z for z in range(-80, 221, 4)] + [z / 2 for z in range(28, 44)]))
    bm = bmesh.new()
    rows = []
    for z in zs:
        row = []
        for x in xs:
            row.append(bm.verts.new(V(x, terrain_height(x, z), z)))
        rows.append(row)
    for j in range(len(zs) - 1):
        for i in range(len(xs) - 1):
            f = bm.faces.new((rows[j][i], rows[j][i + 1], rows[j + 1][i + 1], rows[j + 1][i]))
            f.smooth = True
    land = lib.mesh_obj("land", bm, M["land"])
    weights = land.data.attributes.new("grass", "FLOAT", "POINT")
    shrubw = land.data.attributes.new("shrub", "FLOAT", "POINT")
    for v in land.data.vertices:
        x, z, y = v.co.x, v.co.y, v.co.z
        bare = abs(x) < 5.8 or (-15 < x < -11 and z < 62) or (-16 < x < 11 and 54 < z < 76) or (y < -0.45)
        near = max(0.0, 1.0 - max(0.0, abs(x) - 8) / 70) * (1.0 if -40 < z < 130 else 0.3)
        weights.data[v.index].value = 0.0 if bare else 0.08 + 0.92 * near
        shrubw.data[v.index].value = 0.0 if (bare or abs(x) < 9) else 1.0
    A.scatter_modifier(land, A.pieces("grass_medium_01"), density=7.0, attr="grass", scale=(1.6, 3.2), seed=3)
    A.scatter_modifier(land, A.pieces("shrub_02"), density=0.012, attr="shrub", scale=(0.8, 1.4), seed=9)
    A.scatter_modifier(land, A.pieces("shrub_04"), density=0.05, attr="shrub", scale=(1.5, 3.0), seed=13)
    order(land, 0.0)

    # Hills on the horizon, toward the mountain.
    for i, (cx, cz, s, h) in enumerate([(-260, 420, 260, 70), (40, 520, 320, 110), (330, 430, 240, 60), (-480, 300, 200, 45), (520, 260, 200, 40)]):
        hill = grid_plane(f"hill_{i}", cx - s, cz - s * 0.5, cx + s, cz + s * 0.5, 0, M["hill"], 40, 20,
                          height=lambda x, z, cx=cx, cz=cz, s=s, h=h: max(0.0, h * (1 - ((x - cx) / s) ** 2 - ((z - cz) / (s * 0.5)) ** 2)) * (0.8 + 0.2 * noise.noise(Vector((x * 0.01, z * 0.01, 0)))))
        hill["ks_noline"] = True

    # The road: bitumen on murram verges, lines in thermoplastic paint.
    road = box("road", (-3.5, -0.06, -80), (3.5, 0.03, 58), M["asphalt"])
    order(road, 0.05)
    for s in (-1, 1):
        order(box(f"verge_{s}", (3.5 * s if s > 0 else -5.3, -0.08, -80), (5.3 if s > 0 else -3.5, 0.015, 56), M["murram"]), 0.12)
        order(box(f"edge_line_{s}", (s * 3.3 - 0.075, 0.03, -80), (s * 3.3 + 0.075, 0.034, 56), M["marking"]), 0.2)
    z = -76.0
    while z < 52:
        order(box(f"dash_{z:.0f}", (-0.06, 0.03, z), (0.06, 0.034, z + 3), M["marking"]), 0.2)
        z += 9
    # The drive and the footpath.
    order(box("drive", (-14, -0.06, 56), (9, 0.012, 61.7), M["murram"]), 0.4)
    order(box("path_a", (-13.8, -0.06, -80), (-12.2, 0.012, 14.2), M["murram"]), 0.45)
    order(box("path_b", (-13.8, -0.06, 21.8), (-12.2, 0.012, 56), M["murram"]), 0.45)

    # The stream and its culvert under the road.
    water = box("stream_water", (-160, -0.75, 16.6), (160, -0.6, 19.4), M["water"])
    water["ks_noline"] = True
    deck = box("culvert_deck", (-5.4, -0.95, 15.4), (5.4, -0.06, 20.6), M["concrete"])
    order(deck, 0.3)
    for s in (-1, 1):
        order(box(f"headwall_{s}", (s * 5.4 - 0.25, -0.95, 15.2), (s * 5.4 + 0.25, 0.35, 20.8), M["concrete"], bevel=0.02), 0.32)
        for k, zz in enumerate((17.3, 18.7)):
            p = cylinder(f"culvert_pipe_{s}_{k}", (s * 5.2, -0.42, zz), (s * 5.75, -0.42, zz), 0.36, M["concrete"], 32)
            order(p, 0.34)
            hole = cylinder(f"culvert_void_{s}_{k}", (s * 5.3, -0.42, zz), (s * 5.76, -0.42, zz), 0.3, M["black"], 32)
            hole["ks_noline"] = True
    rocks = A.pieces("rock_moss_set_01")
    for i in range(26):
        x = R.choice([-1, 1]) * R.uniform(6.5, 40)
        zz = R.choice([16.4, 19.6]) + R.uniform(-0.5, 0.5)
        A.place(rocks, f"rock_{i}", (x, terrain_height(x, zz) - 0.15, zz), R.uniform(0, 6.28), R.uniform(0.25, 0.6))

    # The footbridge: a yellow steel truss, after Kenstar's own (work-civil-bridge-0130).
    FB = dict(x0=-14.0, x1=-12.0, z0=14.2, z1=21.8)
    for z0, z1 in ((FB["z0"] - 1.2, FB["z0"]), (FB["z1"], FB["z1"] + 1.2)):
        order(box(f"abutment_{z0:.0f}", (FB["x0"] - 0.35, -0.6, z0), (FB["x1"] + 0.35, 0.22, z1), M["concrete"], bevel=0.02), 0.5)
    order(box("fb_deck", (FB["x0"], 0.22, FB["z0"]), (FB["x1"], 0.28, FB["z1"]), M["steel_plate"], bevel=0.005), 0.52)
    for x in (FB["x0"] + 0.05, FB["x1"] - 0.05):
        order(beam(f"fb_bottom_{x:.1f}", (x, 0.18, FB["z0"]), (x, 0.18, FB["z1"]), 0.1, 0.2, M["bridge"]), 0.55)
        order(beam(f"fb_top_{x:.1f}", (x, 1.25, FB["z0"]), (x, 1.25, FB["z1"]), 0.08, 0.08, M["bridge"]), 0.6)
        order(beam(f"fb_mid_{x:.1f}", (x, 0.75, FB["z0"]), (x, 0.75, FB["z1"]), 0.04, 0.04, M["bridge"]), 0.62)
        n = 8
        for i in range(n + 1):
            zz = FB["z0"] + (FB["z1"] - FB["z0"]) * i / n
            order(beam(f"fb_post_{x:.1f}_{i}", (x, 0.28, zz), (x, 1.21, zz), 0.06, 0.06, M["bridge"], up=(0, 0, 1)), 0.6)
            if i < n:
                z2 = FB["z0"] + (FB["z1"] - FB["z0"]) * (i + 1) / n
                a, b = ((zz, z2) if i % 2 else (z2, zz))
                order(beam(f"fb_diag_{x:.1f}_{i}", (x, 0.3, a), (x, 1.2, b), 0.04, 0.04, M["bridge"], up=(1, 0, 0)), 0.64)
    for i in range(5):
        zz = FB["z0"] + (FB["z1"] - FB["z0"]) * (i + 0.5) / 5
        order(beam(f"fb_cross_{i}", (FB["x0"], 0.16, zz), (FB["x1"], 0.16, zz), 0.06, 0.1, M["bridge"]), 0.56)

    # Street lights on the left verge; a power line on timber poles on the right.
    for k, z in enumerate((-46, -14, 26, 44)):
        order(cylinder(f"lamp_pole_{k}", (-6.2, 0, z), (-6.2, 8.2, z), 0.09, M["galv"], 20, radius_top=0.05), 0.68)
        order(beam(f"lamp_arm_{k}", (-6.2, 8.1, z), (-4.4, 8.25, z), 0.06, 0.06, M["galv"]), 0.7)
        order(box(f"lamp_head_{k}", (-4.9, 8.12, z - 0.16), (-4.0, 8.24, z + 0.16), M["led"], bevel=0.02), 0.72)
    poles = (-62, -18, 26, 70)
    for k, z in enumerate(poles):
        order(cylinder(f"power_pole_{k}", (7.6, -0.5, z), (7.6, 9.2, z), 0.13, M["pole_timber"], 16, radius_top=0.1), 0.74)
        order(beam(f"power_arm_{k}", (6.6, 8.8, z), (8.6, 8.8, z), 0.1, 0.1, M["pole_timber"]), 0.76)
        for dx in (-0.9, 0.0, 0.9):
            cylinder(f"insulator_{k}_{dx}", (7.6 + dx, 8.85, z), (7.6 + dx, 9.05, z), 0.04, M["insulator"], 12)
    for dx in (-0.9, 0.0, 0.9):
        for a, b in zip(poles, poles[1:]):
            pts = []
            for i in range(25):
                t = i / 24
                sag = 0.9 * 4 * t * (1 - t)
                pts.append(V(7.6 + dx, 9.05 - sag, a + (b - a) * t))
            cd = bpy.data.curves.new(f"wire_{dx}_{a}", "CURVE")
            cd.dimensions = "3D"
            cd.bevel_depth = 0.007
            sp = cd.splines.new("POLY")
            sp.points.add(len(pts) - 1)
            for i, p in enumerate(pts):
                sp.points[i].co = (p.x, p.y, p.z, 1)
            ob = bpy.data.objects.new(f"wire_{dx}_{a}", cd)
            ob.data.materials.append(M["wire"])
            link(ob)["ks_noline"] = True

    # Trees: shade along the road and around the plot.
    tree = A.group("island_tree_01")
    TREES = [(-18, 6, 1.5), (-25, 30, 1.8), (-10.5, 40, 1.3), (14, -20, 1.6), (19.5, 9, 1.9), (12.5, 33, 1.4), (-21, -30, 1.6),
             (24, 52, 1.9), (-19, 66, 1.8), (16, 76, 1.7), (-8, 86, 2.0), (7, 92, 1.9), (30, 82, 2.2), (-34, 72, 2.1),
             (-40, 10, 2.2), (38, -6, 2.0), (-30, 100, 2.3), (34, 110, 2.1), (-12, 115, 2.0), (52, 40, 2.4)]
    for i, (x, z, s) in enumerate(TREES):
        A.place(tree, f"tree_{i}", (x, terrain_height(x, z) - 0.05, z), R.uniform(0, 6.28), s)

    anchor("01.1", (1.4, 0.03, 4))
    anchor("01.2", (-13.0, 1.25, 18.0))


# ---------------------------------------------------------------- 02 Structure

def structure(M):
    chapter(1)
    plinth = box("plinth_stone", (-7.35, -0.25, 61.65), (7.35, 0.22, 72.35), M["stone"])
    order(plinth, 0.0)
    slab = box("ground_slab", (-7.3, 0.22, 61.7), (7.3, FLOOR, 72.3), M["screed"], bevel=0.01)
    order(slab, 0.05)
    cols = [(x, 62) for x in COLS_X] + [(x, 72) for x in COLS_X] + [(-7, 67), (7, 67)]
    for i, (x, z) in enumerate(cols):
        c = order(box(f"col_g_{i}", (x - 0.15, FLOOR, z - 0.15), (x + 0.15, 3.0, z + 0.15), M["concrete"], bevel=0.008), 0.2)
        lib.swap_later(c, 4, M["paint_ext"])
        c = order(box(f"col_u_{i}", (x - 0.15, 3.5, z - 0.15), (x + 0.15, 6.4, z + 0.15), M["concrete"], bevel=0.008), 0.7)
        lib.swap_later(c, 4, M["paint_ext"])

    def ring(y0, y1, k):
        for nm, lo, hi in (("f", (-7.15, y0, 61.85), (7.15, y1, 62.15)), ("b", (-7.15, y0, 71.85), (7.15, y1, 72.15)),
                           ("l", (-7.15, y0, 62.15), (-6.85, y1, 71.85)), ("r", (6.85, y0, 62.15), (7.15, y1, 71.85))):
            b = order(box(f"beam_{nm}_{y0}", lo, hi, M["concrete"], bevel=0.008), k)
            lib.swap_later(b, 4, M["paint_ext"])

    ring(3.0, 3.3, 0.4)
    s1 = order(box("first_floor_slab", (-7.3, 3.3, 61.7), (7.3, 3.5, 72.3), M["concrete"], bevel=0.008), 0.55)
    lib.swap_later(s1, 4, M["paint_ext"])
    ring(6.4, 6.7, 0.85)

    # Eucalyptus props under the fresh slab, and pole scaffolding on the front: a Kenyan site.
    chapter(1, until=2)
    for x in [-6.2 + 2.05 * i for i in range(7)]:
        for z in [63.0 + 2.0 * j for j in range(5)]:
            cylinder(f"prop_{x:.1f}_{z:.1f}", (x + R.uniform(-0.1, 0.1), FLOOR, z + R.uniform(-0.1, 0.1)), (x, 3.28, z), 0.036, M["eucalyptus"], 10)
            order(bpy.data.objects[f"prop_{x:.1f}_{z:.1f}"], 0.6)
    chapter(1, until=2)
    for x in [-7.6 + 3.05 * i for i in range(6)]:
        for zz in (60.6, 61.35):
            order(cylinder(f"scaf_{x:.1f}_{zz}", (x, 0, zz), (x + R.uniform(-0.05, 0.05), 7.4, zz), 0.038, M["eucalyptus"], 10), 0.9)
    for y in (2.0, 3.8, 5.6):
        for zz in (60.6, 61.35):
            order(cylinder(f"ledger_{y}_{zz}", (-7.8, y, zz), (7.6, y + R.uniform(-0.05, 0.05), zz), 0.035, M["eucalyptus"], 10), 0.92)
        order(box(f"plank_{y}", (-7.6, y + 0.05, 60.55), (7.4, y + 0.09, 61.4), M["plywood"]), 0.94)
    for i in range(2):
        x = -7.6 + 8.6 * i
        order(cylinder(f"brace_{i}", (x, 0.2, 60.6), (x + 4.2, 6.8, 60.6), 0.032, M["eucalyptus"], 8), 0.95)
    # Sand and ballast heaps on the drive.
    chapter(1, until=4)
    for nm, (cx, cz, r, h), mat in (("sand", (10.5, 57.5, 1.9, 1.0), M["sand"]), ("ballast", (12.6, 60.2, 1.5, 0.8), M["ballast"])):
        bm = bmesh.new()
        bmesh.ops.create_uvsphere(bm, u_segments=40, v_segments=20, radius=1.0)
        for v in bm.verts:
            v.co.z = max(0.0, v.co.z)
            jitter = 1 + 0.06 * noise.noise(v.co * 3)
            v.co = Vector((v.co.x * r * jitter, v.co.y * r * jitter, v.co.z * h * jitter))
        ob = lib.mesh_obj(f"heap_{nm}", bm, mat, V(cx, 0, cz))
        for p in ob.data.polygons:
            p.use_smooth = True
        order(ob, 0.97)

    anchor("02.1", (-3.5, 1.6, 61.85))
    anchor("02.2", (7.15, 5.0, 61.85))


# ---------------------------------------------------------------- 03 Materials

def wall_bay(M, along, c, a0, a1, y0, y1, hole, k):
    def piece(p0, p1, q0, q1, tag_):
        if p1 - p0 < 0.01 or q1 - q0 < 0.01:
            return
        lo = (p0, q0, c - 0.1) if along == "x" else (c - 0.1, q0, p0)
        hi = (p1, q1, c + 0.1) if along == "x" else (c + 0.1, q1, p1)
        w = order(box(f"wall_{along}{c}_{p0:.2f}_{q0:.2f}_{tag_}", lo, hi, M["stone"]), k)
        lib.swap_later(w, 4, M["paint"])

    if not hole:
        return piece(a0, a1, y0, y1, "f")
    h0, h1, v0, v1 = hole
    piece(a0, h0, y0, y1, "l")
    piece(h1, a1, y0, y1, "r")
    piece(h0, h1, y0, v0, "b")
    piece(h0, h1, v1, y1, "t")


def portal(along, c, hole, inward):
    """A Cycles light portal in an opening, so sky light into the room is sampled cleanly."""
    h0, h1, v0, v1 = hole
    ld = bpy.data.lights.new(f"portal_{along}{c}_{h0:.1f}", "AREA")
    ld.shape = "RECTANGLE"
    ld.size, ld.size_y = (h1 - h0, v1 - v0)
    for target in (ld, getattr(ld, "cycles", None)):
        if target is not None and hasattr(target, "is_portal"):
            target.is_portal = True
    ob = bpy.data.objects.new(ld.name, ld)
    mid = ((h0 + h1) / 2, (v0 + v1) / 2, c) if along == "x" else (c, (v0 + v1) / 2, (h0 + h1) / 2)
    ob.location = V(*mid)
    ob.rotation_mode = "QUATERNION"
    d = V(*inward)
    ob.rotation_quaternion = (-d).to_track_quat("Z", "Y")
    link(ob)["ks_noline"] = True
    return ob


def window(M, along, c, hole, k, sliding=False, sill=True):
    """An aluminium window or sliding door in a 200 mm wall: frame, mullions, glass and a stone sill."""
    h0, h1, v0, v1 = hole
    # Light portals help Cycles sample the sky through openings, but on a CPU they cost more than the
    # denoiser saves; they stay available for GPU renders (KS_PORTALS=1).
    if v1 < 3.2 and os.environ.get("KS_PORTALS") == "1":
        inward = (0, 0, 1) if (along == "x" and c < 67) else (0, 0, -1) if along == "x" else ((1, 0, 0) if c < 0 else (-1, 0, 0))
        portal(along, c, hole, inward)
    fw, fd = 0.055, 0.07
    def rect(a0, a1, b0, b1, off, mat, nm):
        lo = (a0, b0, c - fd / 2 + off) if along == "x" else (c - fd / 2 + off, b0, a0)
        hi = (a1, b1, c + fd / 2 + off) if along == "x" else (c + fd / 2 + off, b1, a1)
        return order(box(nm, lo, hi, mat, bevel=0.004), k)
    tag_ = f"{along}{c}_{h0:.2f}_{v0:.2f}"
    rect(h0, h1, v0, v0 + fw, 0, M["frame"], f"win_b_{tag_}")
    rect(h0, h1, v1 - fw, v1, 0, M["frame"], f"win_t_{tag_}")
    rect(h0, h0 + fw, v0, v1, 0, M["frame"], f"win_l_{tag_}")
    rect(h1 - fw, h1, v0, v1, 0, M["frame"], f"win_r_{tag_}")
    panes = 2 if (h1 - h0) > 1.0 else 1
    if sliding:
        panes = 2
    for i in range(1, panes):
        a = h0 + (h1 - h0) * i / panes
        rect(a - fw / 2, a + fw / 2, v0, v1, 0, M["frame"], f"win_m_{tag_}_{i}")
    if not sliding and (v1 - v0) > 1.2:
        rect(h0, h1, v1 - 0.45, v1 - 0.45 + fw, 0, M["frame"], f"win_tr_{tag_}")
    g = order(box(f"glass_{tag_}", (h0, v0, c - 0.003) if along == "x" else (c - 0.003, v0, h0), (h1, v1, c + 0.003) if along == "x" else (c + 0.003, v1, h1), M["glass"]), k)
    g["ks_noline"] = True
    if sill and not sliding:
        out = -1 if (along == "x" and c < 67) or (along == "z" and c < 0) else 1
        lo = (h0 - 0.05, v0 - 0.05, c + out * 0.06) if along == "x" else (c + out * 0.06, v0 - 0.05, h0 - 0.05)
        hi = (h1 + 0.05, v0, c + out * 0.16) if along == "x" else (c + out * 0.16, v0, h1 + 0.05)
        order(box(f"sill_{tag_}", lo, hi, M["concrete"], bevel=0.005), k)


def materials_ch(M):
    chapter(2)
    G = (FLOOR, 3.0)
    U = (3.5, 6.4)
    ground = {
        "front": [(-6.0, -4.5, 1.0, 2.6), (DOOR[0], DOOR[1], FLOOR, DOOR[2]), (1.0, 2.5, 1.0, 2.6), (4.5, 6.0, 1.0, 2.6)],
        "back": [(-6.0, -4.5, 1.0, 2.6), (-3.2, -0.3, FLOOR, 2.75), (0.3, 3.2, FLOOR, 2.75), (4.4, 6.1, 1.0, 2.6)],
        "left": [(63.4, 65.6, 1.0, 2.6), None],
        "right": [None, None],
    }
    upper = {
        "front": [(a + 0.8, b - 0.8, 4.2, 5.8) for a, b in FRONT_BAYS],
        "back": [(a + 0.8, b - 0.8, 4.2, 5.8) for a, b in FRONT_BAYS],
        "side": [(a + 1.4, b - 1.4, 4.2, 5.8) for a, b in SIDE_BAYS],
    }
    for i, (a0, a1) in enumerate(FRONT_BAYS):
        wall_bay(M, "x", 62, a0, a1, *G, ground["front"][i], 0.05 + 0.04 * i)
        wall_bay(M, "x", 72, a0, a1, *G, ground["back"][i], 0.1 + 0.04 * i)
        wall_bay(M, "x", 62, a0, a1, *U, upper["front"][i], 0.3 + 0.03 * i)
        wall_bay(M, "x", 72, a0, a1, *U, upper["back"][i], 0.32 + 0.03 * i)
    for i, (a0, a1) in enumerate(SIDE_BAYS):
        wall_bay(M, "z", -7, a0, a1, *G, ground["left"][i], 0.12)
        wall_bay(M, "z", 7, a0, a1, *G, ground["right"][i], 0.14)
        wall_bay(M, "z", -7, a0, a1, *U, upper["side"][i], 0.34)
        wall_bay(M, "z", 7, a0, a1, *U, upper["side"][i], 0.36)
    for i, h in enumerate(ground["front"]):
        if i != 1:
            window(M, "x", 62, h, 0.5)
    for i, h in enumerate(ground["back"]):
        window(M, "x", 72, h, 0.52, sliding=i in (1, 2))
    window(M, "z", -7, ground["left"][0], 0.54)
    for h in upper["front"]:
        window(M, "x", 62, h, 0.56)
    for h in upper["back"]:
        window(M, "x", 72, h, 0.57)
    for h in upper["side"]:
        window(M, "z", -7, h, 0.58)
        window(M, "z", 7, h, 0.58)

    # Hipped roof in maroon box-profile sheets, white fascia and gutters.
    E = dict(x0=-7.75, x1=7.75, z0=61.25, z1=72.75, y=6.7)
    rx, ry, rz = 2.0, 9.25, 67.0
    faces = [
        [(E["x0"], E["y"], E["z0"]), (E["x1"], E["y"], E["z0"]), (rx, ry, rz), (-rx, ry, rz)],
        [(E["x1"], E["y"], E["z1"]), (E["x0"], E["y"], E["z1"]), (-rx, ry, rz), (rx, ry, rz)],
        [(E["x0"], E["y"], E["z1"]), (E["x0"], E["y"], E["z0"]), (-rx, ry, rz)],
        [(E["x1"], E["y"], E["z0"]), (E["x1"], E["y"], E["z1"]), (rx, ry, rz)],
    ]
    for i, f in enumerate(faces):
        bm = bmesh.new()
        vs = [bm.verts.new(V(*p)) for p in f]
        face = bm.faces.new(vs)
        uv = bm.loops.layers.uv.new("UVMap")
        eave = (V(*f[1]) - V(*f[0])).normalized()
        nrm = face.normal if face.normal.z > 0 else -face.normal
        up = nrm.cross(eave).normalized()
        for loop in face.loops:
            p = loop.vert.co
            loop[uv].uv = (p.dot(eave), p.dot(up))
        if face.normal.z < 0:
            face.normal_flip()
        ob = lib.mesh_obj(f"roof_{i}", bm, M["roof"])
        s = ob.modifiers.new("thick", "SOLIDIFY")
        s.thickness = 0.03
        order(ob, 0.75)
    for nm, lo, hi in (("f", (E["x0"], 6.5, E["z0"] - 0.03), (E["x1"], 6.72, E["z0"])), ("b", (E["x0"], 6.5, E["z1"]), (E["x1"], 6.72, E["z1"] + 0.03)),
                       ("l", (E["x0"] - 0.03, 6.5, E["z0"]), (E["x0"], 6.72, E["z1"])), ("r", (E["x1"], 6.5, E["z0"]), (E["x1"] + 0.03, 6.72, E["z1"]))):
        order(box(f"fascia_{nm}", lo, hi, M["fascia"]), 0.8)
    order(box("soffit", (E["x0"], 6.49, E["z0"]), (E["x1"], 6.5, E["z1"]), M["fascia"]), 0.8)
    for nm, a, b in (("f", (E["x0"], 6.55, E["z0"] - 0.1), (E["x1"], 6.55, E["z0"] - 0.1)), ("b", (E["x0"], 6.55, E["z1"] + 0.1), (E["x1"], 6.55, E["z1"] + 0.1))):
        order(cylinder(f"gutter_{nm}", a, b, 0.065, M["gutter"], 16), 0.82)

    # Supplies on the drive: cement on a pallet, a stack of stone blocks, a bundle of steel bars.
    chapter(2, until=4)
    order(box("pallet", (2.9, 0, 57.4), (4.3, 0.14, 58.6), M["plywood"], bevel=0.005), 0.15)
    bag = A.group("cement_bag")
    for layer in range(4):
        for i in range(3):
            for j in range(2):
                rot = 0 if layer % 2 == 0 else math.pi / 2
                x = 3.15 + 0.48 * i if layer % 2 == 0 else 3.25 + 0.4 * i
                zz = 57.75 + 0.62 * j if layer % 2 == 0 else 57.65 + 0.7 * j
                A.place(bag, f"bag_{layer}_{i}_{j}", (x, 0.14 + 0.17 * layer, zz), rot + R.uniform(-0.06, 0.06), (1.0, 1.0, 0.95))
    for layer in range(6):
        for i in range(3):
            for j in range(3):
                off = 0.0 if layer % 2 == 0 else 0.225
                order(box(f"block_{layer}_{i}_{j}", (4.8 + 0.46 * i + off * 0, 0.21 * layer, 57.3 + 0.24 * j), (5.25 + 0.46 * i, 0.21 * layer + 0.2, 57.52 + 0.24 * j), M["stone"], bevel=0.006), 0.18)
    for i in range(24):
        a = (i % 6) * 0.03
        b = (i // 6) * 0.028
        order(cylinder(f"rebar_{i}", (2.0, 0.12 + b, 59.3 + a), (8.2, 0.12 + b, 59.3 + a + R.uniform(-0.02, 0.02)), 0.008, M["rebar"], 8), 0.2)
    for x in (2.6, 5.0, 7.6):
        order(box(f"bearer_{x}", (x, 0, 59.15), (x + 0.12, 0.1, 59.6), M["eucalyptus"]), 0.2)

    anchor("03.1", (3.6, 0.9, 57.4))


# ---------------------------------------------------------------- 04 Systems

def systems(M):
    chapter(3, until=4)
    # First fix: conduits chased into the blockwork, boxes and drops, before plaster covers them.
    runs = [((6.88, 1.42, 64.2), (6.88, 3.0, 64.2)), ((6.88, 0.82, 65.0), (6.88, 1.3, 65.0)), ((6.88, 1.32, 64.2), (6.88, 1.32, 65.0)),
            ((6.88, 3.28, 64.2), (4.5, 3.28, 64.2)), ((4.5, 3.28, 64.2), (4.5, 3.28, 66.5)), ((4.5, 3.28, 66.5), (3.0, 3.28, 66.5)),
            ((3.0, 3.28, 66.5), (3.0, 3.28, 69.0)), ((-6.88, 0.82, 64.2), (-6.88, 3.0, 64.2)), ((-6.88, 3.28, 64.2), (-4.4, 3.28, 64.2)),
            ((-4.4, 3.28, 64.2), (-4.4, 3.28, 68.0)), ((-1.0, 1.42, 62.12), (-1.0, 3.0, 62.12))]
    for i, (a, b) in enumerate(runs):
        order(cylinder(f"conduit_{i}", a, b, 0.011, M["pvc"], 10), 0.05 + 0.02 * i)
    chapter(3, until=5)
    for i, (x, z) in enumerate(((4.5, 66.5), (3.0, 69.0), (-4.4, 68.0))):
        order(cylinder(f"rose_{i}", (x, 3.3, z), (x, 3.27, z), 0.05, M["plate"], 24), 0.4)
        order(cylinder(f"drop_{i}", (x, 3.27, z), (x, 2.95, z), 0.004, M["wire"], 6), 0.42)
        order(cylinder(f"holder_{i}", (x, 2.95, z), (x, 2.89, z), 0.018, M["black"], 16), 0.44)
    chapter(3)
    # Switches and sockets, which stay.
    for i, (lo, hi) in enumerate([((6.87, 1.307, 64.13), (6.9, 1.393, 64.27)), ((6.87, 0.7, 64.93), (6.9, 0.786, 65.07)), ((-6.9, 0.7, 64.13), (-6.87, 0.786, 64.27)),
                                  ((-1.07, 1.307, 62.1), (-0.93, 1.393, 62.13))]):
        order(box(f"plate_{i}", lo, hi, M["plate"], bevel=0.004), 0.3)
    order(box("rocker_0", (6.862, 1.33, 64.15), (6.872, 1.37, 64.25), M["gold"]), 0.31)
    # The wash-hand basin: a ceramic basin on a marble top, gold mixer, oval mirror.
    order(box("vanity_top", (6.38, 0.84, 64.75), (6.9, 0.88, 65.85), M["marble"], bevel=0.004), 0.55)
    order(box("vanity_body", (6.42, FFL, 64.8), (6.9, 0.84, 65.8), M["walnut"], bevel=0.006), 0.53)
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=48, v_segments=24, radius=1.0)
    for v in bm.verts:
        v.co = Vector((v.co.x * 0.21, v.co.y * 0.17, max(v.co.z, -0.55) * 0.13))
    basin = lib.mesh_obj("basin", bm, M["ceramic"], V(6.62, 0.95, 65.3))
    for p in basin.data.polygons:
        p.use_smooth = True
    order(basin, 0.6)
    order(cylinder("tap_body", (6.82, 0.88, 65.3), (6.82, 1.18, 65.3), 0.018, M["gold_polish"], 24), 0.68)
    order(beam("tap_spout", (6.82, 1.17, 65.3), (6.66, 1.13, 65.3), 0.024, 0.016, M["gold_polish"]), 0.7)
    order(beam("tap_lever", (6.82, 1.2, 65.3), (6.86, 1.24, 65.3), 0.012, 0.012, M["gold_polish"]), 0.7)
    bm = bmesh.new()
    bmesh.ops.create_circle(bm, cap_ends=True, segments=64, radius=1.0)
    for v in bm.verts:
        v.co = Vector((v.co.x * 0.42, v.co.y * 0.32, 0))
    mir = lib.mesh_obj("basin_mirror", bm, M["mirror"], V(6.885, 1.72, 65.3))
    mir.rotation_euler = (math.pi / 2, 0, -math.pi / 2)
    order(mir, 0.78)
    for i, (x, z) in enumerate(((6.6, 65.2), (6.6, 65.4))):
        order(cylinder(f"pipe_{i}", (x, FFL, z), (x, 0.84, z), 0.012, M["copper"], 10), 0.65)
    chapter(3, until=4)
    A.place(A.group("wooden_ladder"), "ladder", (5.6, FLOOR, 67.4), 0.4, 1.35)

    anchor("04.1", (6.87, 1.35, 64.2))
    anchor("04.2", (4.5, 3.27, 66.5))
    anchor("04.3", (6.82, 1.15, 65.3))


# ---------------------------------------------------------------- 05 Finish

def sofa_run(M, name, start, end, depth, facing, k, arm_start=True, arm_end=True):
    """One straight run of a deep velvet sofa. facing is the unit (dx, dz) the seats face."""
    fx, fz = facing
    (x0, z0), (x1, z1) = start, end
    seat_h, base_top, back_h = 0.44, 0.3, 0.86
    lo_x, hi_x = min(x0, x1), max(x0, x1)
    lo_z, hi_z = min(z0, z1), max(z0, z1)
    if fz == 0:  # runs along z, faces +x or -x
        back = lo_x if fx > 0 else hi_x - 0.22
        base = (lo_x, FFL + 0.06, lo_z), (hi_x, FFL + base_top, hi_z)
        backbox = (back, FFL + base_top, lo_z), (back + 0.22, FFL + back_h - 0.1, hi_z)
    else:
        back = lo_z if fz > 0 else hi_z - 0.22
        base = (lo_x, FFL + 0.06, lo_z), (hi_x, FFL + base_top, hi_z)
        backbox = (lo_x, FFL + base_top, back), (hi_x, FFL + back_h - 0.1, back + 0.22)
    order(box(f"{name}_base", *base, M["sofa_dark"], bevel=0.03, segments=3), k)
    order(box(f"{name}_back", *backbox, M["sofa"], bevel=0.05, segments=4), k + 0.02)
    length = (hi_z - lo_z) if fz == 0 else (hi_x - lo_x)
    n = max(1, round(length / 0.95))
    for i in range(n):
        t0, t1 = i / n, (i + 1) / n
        if fz == 0:
            za, zb = lo_z + (hi_z - lo_z) * t0 + 0.01, lo_z + (hi_z - lo_z) * t1 - 0.01
            sx0 = lo_x + (0.22 if fx > 0 else 0.0)
            sx1 = hi_x - (0.0 if fx > 0 else 0.22)
            order(cushion(f"{name}_seat_{i}", (sx0, FFL + base_top, za), (sx1, FFL + seat_h + 0.04, zb), M["sofa"], 0.06, 0.18), k + 0.04)
            bx0 = sx0 if fx > 0 else sx1 - 0.2
            order(cushion(f"{name}_backc_{i}", (bx0, FFL + seat_h, za + 0.02), (bx0 + 0.2, FFL + back_h + 0.08, zb - 0.02), M["sofa"], 0.07, 0.3), k + 0.06)
        else:
            xa, xb = lo_x + (hi_x - lo_x) * t0 + 0.01, lo_x + (hi_x - lo_x) * t1 - 0.01
            sz0 = lo_z + (0.22 if fz > 0 else 0.0)
            sz1 = hi_z - (0.0 if fz > 0 else 0.22)
            order(cushion(f"{name}_seat_{i}", (xa, FFL + base_top, sz0), (xb, FFL + seat_h + 0.04, sz1), M["sofa"], 0.06, 0.18), k + 0.04)
            bz0 = sz0 if fz > 0 else sz1 - 0.2
            order(cushion(f"{name}_backc_{i}", (xa + 0.02, FFL + seat_h, bz0), (xb - 0.02, FFL + back_h + 0.08, bz0 + 0.2), M["sofa"], 0.07, 0.3), k + 0.06)
    for i, at in enumerate((arm_start, arm_end)):
        if not at:
            continue
        if fz == 0:
            zz = lo_z if i == 0 else hi_z - 0.2
            order(box(f"{name}_arm_{i}", (lo_x, FFL + 0.06, zz), (hi_x, FFL + 0.66, zz + 0.2), M["sofa"], bevel=0.06, segments=4), k + 0.08)
        else:
            xx = lo_x if i == 0 else hi_x - 0.2
            order(box(f"{name}_arm_{i}", (xx, FFL + 0.06, lo_z), (xx + 0.2, FFL + 0.66, hi_z), M["sofa"], bevel=0.06, segments=4), k + 0.08)


def chair(M, name, cx, cz, face, k):
    """A dining chair: tufted velvet back and seat on slim gold legs."""
    s = 0.24
    order(cushion(f"{name}_seat", (cx - s, FFL + 0.42, cz - s), (cx + s, FFL + 0.5, cz + s), M["chair"], 0.03, 0.1), k)
    for i, (dx, dz) in enumerate(((-1, -1), (1, -1), (-1, 1), (1, 1))):
        lx, lz = cx + dx * (s - 0.04), cz + dz * (s - 0.04)
        order(cylinder(f"{name}_leg_{i}", (lx + dx * 0.02, FFL, lz + dz * 0.02), (lx, FFL + 0.43, lz), 0.012, M["gold"], 12, radius_top=0.016), k + 0.01)
    fx, fz = face
    if fz:
        bz = cz - fz * (s - 0.03)
        b = order(cushion(f"{name}_back", (cx - s + 0.02, FFL + 0.5, bz - 0.035), (cx + s - 0.02, FFL + 1.02, bz + 0.035), M["chair"], 0.03, 0.12), k + 0.02)
    else:
        bx = cx - fx * (s - 0.03)
        b = order(cushion(f"{name}_back", (bx - 0.035, FFL + 0.5, cz - s + 0.02), (bx + 0.035, FFL + 1.02, cz + s - 0.02), M["chair"], 0.03, 0.12), k + 0.02)
    return b


def finish(M):
    chapter(4)
    # Floor: large-format marble porcelain, skirting, and painted plaster (the wall material swaps above).
    order(box("floor_tiles", (-6.9, FLOOR, 62.1), (6.9, FFL, 71.9), M["floor"]), 0.0)
    for nm, lo, hi in (("f", (-6.9, FFL, 62.1), (6.9, FFL + 0.1, 62.115)), ("b", (-6.9, FFL, 71.885), (6.9, FFL + 0.1, 71.9)),
                       ("l", (-6.9, FFL, 62.1), (-6.885, FFL + 0.1, 71.9)), ("r", (6.885, FFL, 62.1), (6.9, FFL + 0.1, 71.9))):
        order(box(f"skirting_{nm}", lo, hi, M["skirting"]), 0.02)
    # Gypsum ceiling with two lit coffers, and downlights in the perimeter band.
    Y = 2.95
    cof = [(-6.0, -1.0, 63.6, 70.9), (1.0, 6.0, 66.4, 71.2)]
    band = [(-6.9, 6.9, 62.1, 63.6), (-6.9, -6.0, 63.6, 71.9), (-1.0, 1.0, 63.6, 71.9), (6.0, 6.9, 63.6, 71.9), (-6.0, -1.0, 70.9, 71.9),
            (1.0, 6.0, 63.6, 66.4), (1.0, 6.0, 71.2, 71.9)]
    for i, (a, b, c, d) in enumerate(band):
        order(box(f"gypsum_{i}", (a, Y, c), (b, 3.0, d), M["ceiling"]), 0.1)
    for i, (a, b, c, d) in enumerate(cof):
        order(box(f"coffer_{i}", (a, 3.22, c), (b, 3.24, d), M["ceiling"]), 0.12)
        for j, (lo, hi) in enumerate((((a, Y, c - 0.0), (b, 3.22, c + 0.01)), ((a, Y, d - 0.01), (b, 3.22, d)), ((a, Y, c), (a + 0.01, 3.22, d)), ((b - 0.01, Y, c), (b, 3.22, d)))):
            order(box(f"coffer_side_{i}_{j}", lo, hi, M["ceiling"]), 0.13)
        # The cove: a lip inside the coffer edge hides an LED strip that washes the recessed ceiling.
        for j, (lo, hi) in enumerate((((a + 0.01, 3.0, c + 0.01), (b - 0.01, 3.03, c + 0.13)), ((a + 0.01, 3.0, d - 0.13), (b - 0.01, 3.03, d - 0.01)),
                                       ((a + 0.01, 3.0, c + 0.13), (a + 0.13, 3.03, d - 0.13)), ((b - 0.13, 3.0, c + 0.13), (b - 0.01, 3.03, d - 0.13)))):
            order(box(f"cove_lip_{i}_{j}", lo, hi, M["ceiling"]), 0.14)
        for j, (lo, hi) in enumerate((((a + 0.05, 3.035, c + 0.04), (b - 0.05, 3.045, c + 0.06)), ((a + 0.05, 3.035, d - 0.06), (b - 0.05, 3.045, d - 0.04)),
                                       ((a + 0.04, 3.035, c + 0.06), (a + 0.06, 3.045, d - 0.06)), ((b - 0.06, 3.035, c + 0.06), (b - 0.04, 3.045, d - 0.06)))):
            strip = box(f"cove_led_{i}_{j}", lo, hi, M["led_strip"])
            strip["ks_noline"] = True
        cx, cz = (a + b) / 2, (c + d) / 2
        for j, (px, pz, sx, sz) in enumerate(((cx, c + 0.09, b - a - 0.2, 0.06), (cx, d - 0.09, b - a - 0.2, 0.06), (a + 0.09, cz, 0.06, d - c - 0.2), (b - 0.09, cz, 0.06, d - c - 0.2))):
            l = point_light(f"cove_light_{i}_{j}", (px, 3.06, pz), 14 * max(sx, sz), kind="AREA", direction=(0, 1, 0))
            l.data.size, l.data.size_y = sx * 1.0, sz * 1.0
            l.rotation_mode = "XYZ"
            l.rotation_euler = (math.pi, 0, 0)
            l.data.color = (1.0, 0.7, 0.42)
            l.visible_camera = False
    dl = [(x, 62.85) for x in (-5.2, -2.6, 2.6, 5.2)] + [(-6.45, z) for z in (65.0, 67.6, 70.2)] + [(0.0, z) for z in (65.2, 68.2, 71.0)] + [(6.45, z) for z in (64.4, 67.8, 70.6)]
    for i, (x, z) in enumerate(dl):
        order(cylinder(f"downlight_ring_{i}", (x, Y - 0.006, z), (x, Y, z), 0.045, M["gold"], 24), 0.16)
        cylinder(f"downlight_disc_{i}", (x, Y - 0.007, z), (x, Y - 0.006, z), 0.032, M["downlight"], 24)["ks_noline"] = True
        point_light(f"downlight_{i}", (x, Y - 0.03, z), 6, color=(1.0, 0.74, 0.5), radius=0.02, kind="SPOT", direction=(0, -1, 0), spot=1.1)

    # Front door, double, in walnut.
    order(box("door_leaf_a", (DOOR[0] + 0.02, FFL, 62.12), (DOOR[0] + 0.06, DOOR[2] - 0.02, 62.85), M["walnut"], bevel=0.004), 0.2)
    order(box("door_leaf_b", (DOOR[1] - 0.76, FFL, 62.0), (DOOR[1] - 0.02, DOOR[2] - 0.02, 62.05), M["walnut"], bevel=0.004), 0.2)
    order(box("door_pull", (DOOR[1] - 0.7, 0.9, 62.06), (DOOR[1] - 0.68, 1.8, 62.09), M["gold"], bevel=0.004), 0.21)

    # Living: an L-shaped velvet sectional, recliner, coffee tables, rug, lamps, art, plants.
    order(box("rug", (-6.3, FFL, 65.2), (-2.3, FFL + 0.012, 71.0), M["rug"]), 0.25)
    order(box("rug_inner", (-6.15, FFL + 0.012, 65.35), (-2.45, FFL + 0.0135, 70.85), M["rug_border"]), 0.25)
    order(box("rug_field", (-6.0, FFL + 0.0135, 65.5), (-2.6, FFL + 0.0145, 70.7), M["rug"]), 0.25)
    sofa_run(M, "sofa_a", (-6.86, 65.5), (-5.86, 70.86), 1.0, (1, 0), 0.3, arm_start=True, arm_end=False)
    sofa_run(M, "sofa_b", (-6.86, 70.86), (-3.3, 71.86), 1.0, (0, -1), 0.36, arm_start=False, arm_end=True)
    pillows = A.group("throw_pillows_01")
    A.recolour(pillows, M["cushion_a"])
    pillows_b = bpy.data.collections.get("pillows_b") or pillows.copy()
    pillows_b.name = "pillows_b"
    for o in list(pillows_b.objects):
        pillows_b.objects.unlink(o)
        o2 = o.copy()
        o2.data = o.data.copy()
        o2.data.materials.clear()
        o2.data.materials.append(M["cushion_b"])
        pillows_b.objects.link(o2)
    A.place(pillows, "pillows_1", (-6.45, FFL + 0.5, 66.2), -math.pi / 2, 0.6)
    A.place(pillows_b, "pillows_2", (-6.35, FFL + 0.5, 70.2), -2.2, 0.62)
    A.place(pillows, "pillows_3", (-4.0, FFL + 0.5, 71.35), math.pi, 0.6)
    # Coffee tables: two round marble tops on gold rings.
    for i, (cx, cz, r, h) in enumerate(((-4.5, 68.1, 0.5, 0.42), (-3.6, 67.5, 0.36, 0.34))):
        order(cylinder(f"coffee_top_{i}", (cx, FFL + h - 0.03, cz), (cx, FFL + h, cz), r, M["marble"], 64), 0.4 + 0.02 * i)
        order(ribbon_ring(f"coffee_ring_{i}", (cx, FFL + h - 0.05, cz), r - 0.03, 0.012, 0.03, M["gold"]), 0.41 + 0.02 * i)
        order(ribbon_ring(f"coffee_base_{i}", (cx, FFL + 0.015, cz), r - 0.05, 0.012, 0.03, M["gold"]), 0.41 + 0.02 * i)
        for j in range(3):
            a = 2 * math.pi * j / 3 + i
            order(cylinder(f"coffee_leg_{i}_{j}", (cx + (r - 0.05) * math.cos(a), FFL + 0.015, cz + (r - 0.05) * math.sin(a)), (cx + (r - 0.03) * math.cos(a), FFL + h - 0.05, cz + (r - 0.03) * math.sin(a)), 0.01, M["gold"], 10), 0.42)
    A.place(A.group("brass_vase_01"), "vase_coffee", (-4.62, FFL + 0.42, 68.0), 0.0, 0.6)
    A.place(A.group("ceramic_vase_01"), "vase_coffee_2", (-4.35, FFL + 0.42, 68.28), 0.4, 0.55)
    for i, (h, mat) in enumerate(((0.03, M["book_a"]), (0.025, M["book_b"]), (0.035, M["book_c"]))):
        order(box(f"coffee_book_{i}", (-4.62, FFL + 0.42 + 0.033 * i, 67.7), (-4.32, FFL + 0.42 + 0.033 * i + h, 67.92), mat, bevel=0.003), 0.45)
    # Recliner in leather (Kenstar's furniture floor carries recliner sets).
    rc = (-2.55, 66.3)
    order(box("recliner_base", (rc[0] - 0.45, FFL + 0.05, rc[1] - 0.45), (rc[0] + 0.45, FFL + 0.4, rc[1] + 0.45), M["leather"], bevel=0.05, segments=3), 0.5)
    order(cushion("recliner_seat", (rc[0] - 0.3, FFL + 0.4, rc[1] - 0.34), (rc[0] + 0.32, FFL + 0.52, rc[1] + 0.34), M["leather"], 0.05, 0.2), 0.52)
    order(cushion("recliner_back", (rc[0] + 0.22, FFL + 0.45, rc[1] - 0.36), (rc[0] + 0.45, FFL + 1.08, rc[1] + 0.36), M["leather"], 0.07, 0.25), 0.54)
    for s in (-1, 1):
        order(cushion(f"recliner_arm_{s}", (rc[0] - 0.45, FFL + 0.4, rc[1] + s * 0.45 - (0.12 if s > 0 else 0)), (rc[0] + 0.45, FFL + 0.68, rc[1] + s * 0.45 + (0 if s > 0 else 0.12)), M["leather"], 0.05, 0.2), 0.55)
    # Side table and lamp at the sofa's end; an arc floor lamp over the corner.
    order(cylinder("side_table_top", (-6.4, FFL + 0.55, 64.95), (-6.4, FFL + 0.58, 64.95), 0.26, M["marble"], 48), 0.6)
    order(cylinder("side_table_stem", (-6.4, FFL, 64.95), (-6.4, FFL + 0.55, 64.95), 0.03, M["gold"], 16), 0.6)
    order(cylinder("side_table_foot", (-6.4, FFL, 64.95), (-6.4, FFL + 0.02, 64.95), 0.18, M["gold"], 32), 0.6)
    order(cylinder("lamp_base", (-6.4, FFL + 0.58, 64.95), (-6.4, FFL + 0.98, 64.95), 0.07, M["ceramic"], 32, radius_top=0.04), 0.62)
    order(cylinder("lamp_shade", (-6.4, FFL + 0.95, 64.95), (-6.4, FFL + 1.25, 64.95), 0.2, M["shade"], 48, radius_top=0.16, cap=False), 0.63)
    point_light("lamp_bulb", (-6.4, FFL + 1.08, 64.95), 25, radius=0.05)
    ax, az = -3.0, 71.55
    order(cylinder("arc_base", (ax, FFL, az), (ax, FFL + 0.04, az), 0.17, M["marble"], 40), 0.64)
    pts = [(ax + 1.6 * math.sin(t) * 0.9, FFL + 0.04 + 2.0 * math.sin(t * 1.25) * (1 if t < 1.25 else 1), az - 0.9 * math.sin(t)) for t in [i / 16 * 1.25 for i in range(17)]]
    cd = bpy.data.curves.new("arc_lamp", "CURVE")
    cd.dimensions = "3D"
    cd.bevel_depth = 0.012
    sp = cd.splines.new("POLY")
    sp.points.add(len(pts) - 1)
    for i, p in enumerate(pts):
        q = V(*p)
        sp.points[i].co = (q.x, q.y, q.z, 1)
    ob = bpy.data.objects.new("arc_lamp", cd)
    ob.data.materials.append(M["gold"])
    order(link(ob), 0.65)
    tip = pts[-1]
    order(cylinder("arc_shade", (tip[0], tip[1] - 0.22, tip[2]), (tip[0], tip[1] + 0.02, tip[2]), 0.22, M["gold"], 48, radius_top=0.06, cap=False), 0.66)
    point_light("arc_bulb", (tip[0], tip[1] - 0.12, tip[2]), 30, radius=0.04)
    # Art above the sofa.
    order(box("art_frame", (-6.9, 1.42, 66.3), (-6.86, 2.42, 69.9), M["gold"], bevel=0.004), 0.7)
    order(box("art_canvas", (-6.87, 1.45, 66.33), (-6.84, 2.39, 69.87), M["art"]), 0.71)
    # Plants.
    A.place(A.group("potted_plant_01"), "plant_living", (-6.35, FFL, 63.0), 0.6, 1.35)
    A.place(A.group("potted_plant_02"), "plant_door", (-0.75, FFL, 71.35), 1.2, 1.4)
    A.place(A.group("potted_plant_02"), "plant_dining", (6.3, FFL, 71.3), 2.4, 1.3)

    # Dining: an eight-seater marble table on a gold base, velvet chairs, a fluted sideboard and mirror.
    T = dict(x=3.0, z=69.0, w=2.4, d=1.1, top=FFL + 0.75)
    order(box("dining_top", (T["x"] - T["w"] / 2, T["top"] - 0.04, T["z"] - T["d"] / 2), (T["x"] + T["w"] / 2, T["top"], T["z"] + T["d"] / 2), M["marble"], bevel=0.008, segments=3), 0.3)
    for s in (-1, 1):
        lx = T["x"] + s * 0.72
        for t in (-1, 1):
            order(beam(f"dining_leg_{s}_{t}", (lx + s * 0.08, FFL, T["z"] + t * 0.36), (lx - s * 0.05, T["top"] - 0.04, T["z"] + t * 0.3), 0.035, 0.035, M["gold"], up=(1, 0, 0)), 0.32)
        order(beam(f"dining_foot_{s}", (lx + s * 0.08, FFL + 0.02, T["z"] - 0.36), (lx + s * 0.08, FFL + 0.02, T["z"] + 0.36), 0.04, 0.04, M["gold"]), 0.33)
        order(beam(f"dining_rail_{s}", (lx - s * 0.05, T["top"] - 0.06, T["z"] - 0.3), (lx - s * 0.05, T["top"] - 0.06, T["z"] + 0.3), 0.035, 0.035, M["gold"]), 0.33)
    order(beam("dining_spine", (T["x"] - 0.72, T["top"] - 0.07, T["z"]), (T["x"] + 0.72, T["top"] - 0.07, T["z"]), 0.035, 0.035, M["gold"]), 0.34)
    k = 0.4
    for x in (T["x"] - 0.8, T["x"], T["x"] + 0.8):
        chair(M, f"chair_n_{x:.1f}", x, T["z"] - 0.82, (0, 1), k)
        chair(M, f"chair_s_{x:.1f}", x, T["z"] + 0.82, (0, -1), k + 0.05)
        k += 0.06
    chair(M, "chair_w", T["x"] - 1.62, T["z"], (1, 0), 0.6)
    chair(M, "chair_e", T["x"] + 1.62, T["z"], (-1, 0), 0.62)
    A.place(A.group("ceramic_vase_03"), "centre_vase", (T["x"] - 0.2, T["top"], T["z"]), 0.3, 1.0)
    A.place(A.group("brass_vase_01"), "centre_brass", (T["x"] + 0.18, T["top"], T["z"] + 0.05), 0.0, 0.75)
    # Sideboard on the right wall: walnut with fluted fronts, marble top, gold feet.
    S = dict(x0=6.42, x1=6.88, z0=67.7, z1=70.5, y0=FFL + 0.16, y1=FFL + 0.84)
    order(box("sideboard_body", (S["x0"], S["y0"], S["z0"]), (S["x1"], S["y1"], S["z1"]), M["walnut"], bevel=0.006), 0.7)
    order(box("sideboard_top", (S["x0"] - 0.02, S["y1"], S["z0"] - 0.02), (S["x1"], S["y1"] + 0.03, S["z1"] + 0.02), M["marble"], bevel=0.004), 0.72)
    z = S["z0"] + 0.03
    i = 0
    while z < S["z1"] - 0.03:
        cylinder(f"flute_{i}", (S["x0"] - 0.002, S["y0"] + 0.04, z), (S["x0"] - 0.002, S["y1"] - 0.04, z), 0.011, M["walnut"], 8)
        z += 0.024
        i += 1
    for t in (0, 1):
        for zz in (S["z0"] + 0.12, S["z1"] - 0.12):
            order(cylinder(f"sideboard_foot_{t}_{zz:.1f}", ((S["x0"] + 0.08) if t == 0 else (S["x1"] - 0.08), FFL, zz), ((S["x0"] + 0.08) if t == 0 else (S["x1"] - 0.08), S["y0"], zz), 0.018, M["gold"], 12), 0.71)
    A.place(A.group("ceramic_vase_01"), "sb_vase_1", (6.66, S["y1"] + 0.03, 68.2), 0.0, 0.9)
    A.place(A.group("ceramic_vase_03"), "sb_vase_2", (6.66, S["y1"] + 0.03, 68.55), 0.0, 0.85)
    A.place(A.group("brass_vase_01"), "sb_vase_3", (6.66, S["y1"] + 0.03, 70.0), 0.0, 0.7)
    for i, (h, mat) in enumerate(((0.035, M["book_c"]), (0.03, M["book_a"]), (0.028, M["book_b"]))):
        order(box(f"sb_book_{i}", (6.5, S["y1"] + 0.03 + 0.036 * i, 69.2), (6.8, S["y1"] + 0.03 + 0.036 * i + h, 69.45), mat, bevel=0.003), 0.73)
    order(box("sb_mirror_frame", (6.86, 1.42, 68.15), (6.9, 2.62, 70.05), M["gold"], bevel=0.004), 0.75)
    order(box("sb_mirror", (6.85, 1.45, 68.18), (6.865, 2.59, 70.02), M["mirror"]), 0.76)
    # Curtains: sheers across the glass, velvet drapes at the sides, from a hidden ceiling track.
    for i, (a, b) in enumerate(((-3.3, -2.75), (-0.32, 0.32), (2.75, 3.3))):
        order(pleated(f"drape_back_{i}", a, b, FFL + 0.01, Y - 0.02, 71.82, "x", M["drape"], depth=0.08, pleat=0.16), 0.8)
    for i, (a, b) in enumerate(((-2.75, -1.2), (1.2, 2.75))):
        pleated(f"sheer_back_{i}", a, b, FFL + 0.02, Y - 0.02, 71.7, "x", M["sheer"], depth=0.05, pleat=0.12)["ks_noline"] = True
    for i, (a, b) in enumerate(((-6.4, -6.0), (-4.5, -4.1), (4.0, 4.4), (6.1, 6.5))):
        order(pleated(f"drape_win_{i}", a, b, FFL + 0.01, Y - 0.02, 71.82, "x", M["drape"], depth=0.07, pleat=0.15), 0.82)
    for i, (a, b) in enumerate(((63.0, 63.4), (65.6, 66.0))):
        order(pleated(f"drape_left_{i}", a, b, FFL + 0.01, Y - 0.02, -6.82, "z", M["drape"], depth=-0.07, pleat=0.15), 0.84)

    # The garden beyond the back doors: a terrace, lawn edging, a boundary wall.
    order(box("terrace", (-4.5, -0.05, 72.3), (4.5, FLOOR - 0.04, 75.5), M["concrete"], bevel=0.01), 0.9)
    order(box("boundary_wall", (-24, 0, 84), (24, 2.4, 84.2), M["paint_ext"], bevel=0.01), 0.92)
    for i in range(10):
        A.place(A.pieces("shrub_02"), f"garden_shrub_{i}", (-20 + 4.4 * i + R.uniform(-1, 1), 0, 82.8 + R.uniform(-0.4, 0.4)), R.uniform(0, 6.28), R.uniform(0.5, 0.9))

    # A rug under the dining table, a pair of velvet accent chairs in the foreground, a tall plant by the window.
    order(box("rug_dining", (0.9, FFL, 66.8), (5.1, FFL + 0.012, 71.2), M["rug_dining"]), 0.26)
    for i, (cx, cz, rot) in enumerate(((1.15, 64.6, 0.5), (2.65, 64.3, -0.35))):
        base = order(box(f"accent_base_{i}", (cx - 0.38, FFL + 0.12, cz - 0.38), (cx + 0.38, FFL + 0.42, cz + 0.38), M["accent"], bevel=0.06, segments=4), 0.85)
        seat = order(cushion(f"accent_seat_{i}", (cx - 0.33, FFL + 0.42, cz - 0.33), (cx + 0.33, FFL + 0.5, cz + 0.3), M["accent"], 0.04, 0.12), 0.86)
        back = order(cushion(f"accent_back_{i}", (cx - 0.38, FFL + 0.42, cz + 0.24), (cx + 0.38, FFL + 0.88, cz + 0.4), M["accent"], 0.07, 0.2), 0.87)
        legs = []
        for j, (dx, dz) in enumerate(((-1, -1), (1, -1), (-1, 1), (1, 1))):
            legs.append(cylinder(f"accent_leg_{i}_{j}", (cx + dx * 0.3, FFL, cz + dz * 0.3), (cx + dx * 0.3, FFL + 0.12, cz + dz * 0.3), 0.014, M["gold"], 10))
        pivot = V(cx, 0, cz)
        turn = Matrix.Rotation(rot, 3, "Z")
        for ob in (base, seat, back, *legs):
            # Turn each part about the chair's centre (positions are set; world matrices are not yet computed).
            ob.location = pivot + turn @ (ob.location - pivot)
            if ob.rotation_mode == "QUATERNION":
                ob.rotation_quaternion = turn.to_quaternion() @ ob.rotation_quaternion
            else:
                ob.rotation_euler.z += rot
    order(cylinder("accent_table_top", (1.95, FFL + 0.5, 64.0), (1.95, FFL + 0.53, 64.0), 0.24, M["marble"], 48), 0.88)
    order(cylinder("accent_table_stem", (1.95, FFL, 64.0), (1.95, FFL + 0.5, 64.0), 0.025, M["gold"], 16), 0.88)
    order(cylinder("accent_table_foot", (1.95, FFL, 64.0), (1.95, FFL + 0.02, 64.0), 0.16, M["gold"], 32), 0.88)
    A.place(A.group("ceramic_vase_01"), "accent_vase", (1.95, FFL + 0.53, 64.0), 0.0, 0.5)
    A.place(A.group("potted_plant_01"), "plant_corner", (6.35, FFL, 62.7), 2.0, 1.55)

    anchor("05.1", (3.0, FFL + 0.75, 69.0))
    anchor("05.2", (-2.55, FFL + 0.7, 66.3))


# ---------------------------------------------------------------- 06 Arrival

def chandelier(M, name, cx, cz, top, k):
    """A tiered crystal chandelier: gold rings hung with cut-crystal drops, bulbs inside."""
    order(cylinder(f"{name}_rod", (cx, 3.22, cz), (cx, top, cz), 0.008, M["gold"], 10), k)
    order(cylinder(f"{name}_canopy", (cx, 3.2, cz), (cx, 3.22, cz), 0.08, M["gold"], 32), k)
    tiers = [(top - 0.02, 0.5, 34), (top - 0.26, 0.4, 28), (top - 0.48, 0.3, 22), (top - 0.66, 0.2, 16)]
    for t, (y, r, n) in enumerate(tiers):
        order(ribbon_ring(f"{name}_ring_{t}", (cx, y, cz), r, 0.01, 0.025, M["gold_polish"]), k + 0.02 * t)
        for i in range(n):
            a = 2 * math.pi * i / n
            for row in range(3):
                crystal(f"{name}_c_{t}_{i}_{row}", (cx + r * math.cos(a), y - 0.03 - row * 0.115, cz + r * math.sin(a)), M["crystal"], 0.9 + 0.1 * (row == 0))
        for i in range(max(3, n // 6)):
            a = 2 * math.pi * (i + 0.5) / max(3, n // 6)
            b = cylinder(f"{name}_bulb_{t}_{i}", (cx + r * 0.7 * math.cos(a), y - 0.12, cz + r * 0.7 * math.sin(a)), (cx + r * 0.7 * math.cos(a), y - 0.06, cz + r * 0.7 * math.sin(a)), 0.018, M["bulb"], 12)
            b["ks_noline"] = True
            point_light(f"{name}_light_{t}_{i}", (cx + r * 0.7 * math.cos(a), y - 0.09, cz + r * 0.7 * math.sin(a)), 9, radius=0.02)
    for i in range(24):
        a = 2 * math.pi * i / 24
        crystal(f"{name}_drop_{i}", (cx + 0.08 * math.cos(a), tiers[-1][0] - 0.33, cz + 0.08 * math.sin(a)), M["crystal"], 1.2)


def arrival(M):
    chapter(5)
    # Over the dining table: a gold ribbon pendant with three crystal lamps (Kenstar's 0981).
    px, pz, py = 3.0, 69.0, 2.3
    order(ribbon_ring("pendant_ring_a", (px, py, pz), 0.55, 0.008, 0.07, M["gold_polish"], wobble=0.06), 0.1)
    order(ribbon_ring("pendant_ring_b", (px, py + 0.06, pz), 0.42, 0.008, 0.05, M["gold_polish"], wobble=0.08, twist=1.2), 0.14)
    for i in range(3):
        a = 2 * math.pi * i / 3 + 0.5
        x, z = px + 0.55 * math.cos(a), pz + 0.55 * math.sin(a)
        order(cylinder(f"pendant_cord_{i}", (x, 3.22, z), (x, py, z), 0.003, M["gold"], 6), 0.12)
    for i in range(3):
        a = 2 * math.pi * i / 3 + 1.55
        x, z = px + 0.3 * math.cos(a), pz + 0.3 * math.sin(a)
        order(cylinder(f"pendant_stem_{i}", (x, py + 0.03, z), (x, py - 0.12, z), 0.004, M["gold"], 6), 0.16)
        order(cylinder(f"pendant_cup_{i}", (x, py - 0.12, z), (x, py - 0.15, z), 0.05, M["gold_polish"], 24), 0.18)
        order(cylinder(f"pendant_glass_{i}", (x, py - 0.15, z), (x, py - 0.36, z), 0.065, M["crystal"], 12), 0.2)
        cylinder(f"pendant_bulb_{i}", (x, py - 0.2, z), (x, py - 0.3, z), 0.022, M["bulb"], 12)["ks_noline"] = True
        point_light(f"pendant_light_{i}", (x, py - 0.25, z), 22, radius=0.03)
    # Over the living area: a tiered crystal chandelier.
    chandelier(M, "chandelier", -4.5, 68.1, 2.75, 0.4)
    # Wall brackets either side of the sideboard mirror.
    for i, z in enumerate((67.85, 70.35)):
        order(box(f"sconce_plate_{i}", (6.86, 1.82, z - 0.05), (6.9, 2.02, z + 0.05), M["gold"], bevel=0.004), 0.7)
        order(beam(f"sconce_arm_{i}", (6.88, 1.92, z), (6.72, 1.98, z), 0.015, 0.015, M["gold"]), 0.72)
        order(cylinder(f"sconce_glass_{i}", (6.72, 1.96, z), (6.72, 2.16, z), 0.05, M["crystal"], 12), 0.74)
        cylinder(f"sconce_bulb_{i}", (6.72, 2.02, z), (6.72, 2.1, z), 0.016, M["bulb"], 10)["ks_noline"] = True
        point_light(f"sconce_light_{i}", (6.72, 2.06, z), 10, radius=0.025)

    anchor("06.1", (px, py - 0.05, pz))
    anchor("06.2", (1.9, 1.8, 71.95))


# ---------------------------------------------------------------- build

def build(M):
    approach(M)
    structure(M)
    materials_ch(M)
    systems(M)
    finish(M)
    arrival(M)
    Ctx.chapter, Ctx.until, Ctx.coll = 0, None, None
    return ANCHORS
