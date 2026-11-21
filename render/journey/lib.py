"""Helpers for the journey scene: unit mapping, mesh builders and physically based materials.

Scene coordinates match the site's timeline (x right, y up, z away from the first camera, metres).
Blender is Z-up, so a scene point (x, y, z) becomes Blender (x, z, y).
"""
import math
import os
import random

import bmesh
import bpy
from mathutils import Matrix, Vector

HERE = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.normpath(os.path.join(HERE, "..", "assets"))


def V(x, y, z):
    return Vector((x, z, y))


def srgb(hex_):
    """Hex colour to linear RGBA for shader inputs."""
    h = hex_.lstrip("#")
    c = [int(h[i : i + 2], 16) / 255 for i in (0, 2, 4)]
    lin = [x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c]
    return (*lin, 1.0)


# ---------------------------------------------------------------- collections and state

CHAPTER_KEY = "ks_ch"
UNTIL_KEY = "ks_until"


def collection(name, parent=None):
    c = bpy.data.collections.get(name) or bpy.data.collections.new(name)
    p = parent or bpy.context.scene.collection
    if c.name not in [x.name for x in p.children]:
        p.children.link(c)
    return c


class Ctx:
    """Where new objects go and which chapter builds them."""

    chapter = 0
    until = None
    coll = None


def tag(obj, chapter=None, until=None):
    obj[CHAPTER_KEY] = Ctx.chapter if chapter is None else chapter
    u = Ctx.until if until is None else until
    if u is not None:
        obj[UNTIL_KEY] = u
    return obj


def link(obj):
    (Ctx.coll or bpy.context.scene.collection).objects.link(obj)
    return tag(obj)


def set_state(state):
    """Show what is built once chapters 0..state are done; apply finish material swaps."""
    for o in bpy.data.objects:
        if CHAPTER_KEY not in o:
            continue
        on = o[CHAPTER_KEY] <= state and (UNTIL_KEY not in o or state < o[UNTIL_KEY])
        o.hide_render = not on
        o.hide_viewport = not on
        if "ks_swap_at" in o and o.data and hasattr(o.data, "materials") and len(o.data.materials):
            name = o["ks_swap_mat"] if state >= o["ks_swap_at"] else o["ks_base_mat"]
            o.data.materials[0] = bpy.data.materials[name]


def swap_later(obj, at, mat):
    obj["ks_swap_at"] = at
    obj["ks_swap_mat"] = mat.name
    obj["ks_base_mat"] = obj.data.materials[0].name


# ---------------------------------------------------------------- meshes

def mesh_obj(name, bm, mat=None, loc=(0, 0, 0)):
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    if mat:
        me.materials.append(mat)
    ob = bpy.data.objects.new(name, me)
    ob.location = loc
    return link(ob)


def box(name, lo, hi, mat, bevel=0.0, segments=2, smooth=False):
    """Axis-aligned box from scene-space corners. The origin sits at the centre, unscaled."""
    a, b = V(*lo), V(*hi)
    mn = Vector((min(a.x, b.x), min(a.y, b.y), min(a.z, b.z)))
    mx = Vector((max(a.x, b.x), max(a.y, b.y), max(a.z, b.z)))
    c, d = (mn + mx) / 2, mx - mn
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts:
        v.co = Vector((v.co.x * d.x, v.co.y * d.y, v.co.z * d.z))
    ob = mesh_obj(name, bm, mat, c)
    if bevel > 0:
        m = ob.modifiers.new("bevel", "BEVEL")
        m.width = min(bevel, min(d) * 0.45)
        m.segments = segments
        m.limit_method = "ANGLE"
        m.harden_normals = False
        smooth = smooth or segments > 1
    if smooth:
        for p in ob.data.polygons:
            p.use_smooth = True
    return ob


def cylinder(name, base, top, radius, mat, verts=24, radius_top=None, cap=True):
    """Cylinder between two scene-space points."""
    a, b = V(*base), V(*top)
    axis = b - a
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=cap, segments=verts, radius1=radius, radius2=radius if radius_top is None else radius_top, depth=axis.length)
    for f in bm.faces:
        f.smooth = True
    ob = mesh_obj(name, bm, mat, (a + b) / 2)
    ob.rotation_mode = "QUATERNION"
    ob.rotation_quaternion = axis.normalized().to_track_quat("Z", "Y")
    return ob


def beam(name, a, b, w, h, mat, up=(0, 1, 0)):
    """A rectangular member from scene point a to b (w across, h in the 'up' direction)."""
    pa, pb = V(*a), V(*b)
    axis = pb - pa
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts:
        v.co = Vector((v.co.x * w, v.co.y * h, v.co.z * axis.length))
    ob = mesh_obj(name, bm, mat, (pa + pb) / 2)
    z = axis.normalized()
    upv = V(*up)
    x = upv.cross(z)
    if x.length < 1e-6:
        x = Vector((1, 0, 0)).cross(z)
    x.normalize()
    y = z.cross(x)
    ob.matrix_world = Matrix.Translation((pa + pb) / 2) @ Matrix((x, y, z)).transposed().to_4x4()
    return ob


def plane(name, corners, mat):
    """A quad from four scene-space corners."""
    bm = bmesh.new()
    vs = [bm.verts.new(V(*c)) for c in corners]
    bm.faces.new(vs)
    return mesh_obj(name, bm, mat)


def grid_plane(name, x0, z0, x1, z1, y, mat, nx=1, nz=1, height=None):
    """A subdivided level surface; height(x, z) can lift vertices."""
    bm = bmesh.new()
    rows = []
    for j in range(nz + 1):
        row = []
        for i in range(nx + 1):
            x = x0 + (x1 - x0) * i / nx
            z = z0 + (z1 - z0) * j / nz
            yy = y + (height(x, z) if height else 0.0)
            row.append(bm.verts.new(V(x, yy, z)))
        rows.append(row)
    for j in range(nz):
        for i in range(nx):
            f = bm.faces.new((rows[j][i], rows[j][i + 1], rows[j + 1][i + 1], rows[j + 1][i]))
            f.smooth = True
    return mesh_obj(name, bm, mat)


def add_bevel(ob, width=0.01, segments=2):
    m = ob.modifiers.new("bevel", "BEVEL")
    m.width = width
    m.segments = segments
    m.limit_method = "ANGLE"
    for p in ob.data.polygons:
        p.use_smooth = True
    return ob


def subsurf(ob, levels=2):
    m = ob.modifiers.new("subsurf", "SUBSURF")
    m.levels = levels
    m.render_levels = levels
    for p in ob.data.polygons:
        p.use_smooth = True
    return ob


def instance(src, name, loc, rot_y=0.0, scale=1.0):
    """A linked duplicate of src at a scene-space location, turned about the vertical."""
    ob = src.copy()
    ob.name = name
    ob.location = V(*loc)
    ob.rotation_mode = "XYZ"
    ob.rotation_euler = (src.rotation_euler.x, src.rotation_euler.y, rot_y)
    ob.scale = (scale, scale, scale) if isinstance(scale, (int, float)) else scale
    return link(ob)


# ---------------------------------------------------------------- materials

def _new_mat(name):
    m = bpy.data.materials.get(name)
    if m:
        return m, None
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    for n in list(nt.nodes):
        nt.nodes.remove(n)
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    bsdf = nt.nodes.new("ShaderNodeBsdfPrincipled")
    nt.links.new(bsdf.outputs[0], out.inputs[0])
    return m, bsdf


def setin(node, name, value):
    if name in node.inputs:
        node.inputs[name].default_value = value


def principled(name, color="#ffffff", rough=0.5, metal=0.0, **kw):
    m, b = _new_mat(name)
    if b is None:
        return m
    setin(b, "Base Color", srgb(color) if isinstance(color, str) else color)
    setin(b, "Roughness", rough)
    setin(b, "Metallic", metal)
    for k, v in kw.items():
        setin(b, k, v)
    return m


def _img(nt, path, non_color=False):
    n = nt.nodes.new("ShaderNodeTexImage")
    n.image = bpy.data.images.load(path, check_existing=True)
    if non_color:
        n.image.colorspace_settings.name = "Non-Color"
    n.projection = "BOX"
    n.projection_blend = 0.3
    return n


def _maps(tex):
    d = os.path.join(ASSETS, "textures", tex)
    files = os.listdir(d) if os.path.isdir(d) else []
    pick = lambda key: next((os.path.join(d, f) for f in files if key in f.lower()), None)
    return pick("diff") or pick("albedo") or pick("col_1"), pick("rough"), pick("nor_gl")


def textured(name, tex, size=1.0, tint=None, tint_mix=0.0, rough_scale=1.0, rough_add=0.0, normal=1.0, metal=0.0, coords="Object", rotate=0.0, **kw):
    """A material from a scanned texture set, box-projected in metres so every object shares the scale."""
    m, b = _new_mat(name)
    if b is None:
        return m
    nt = m.node_tree
    diff, rough, nor = _maps(tex)
    tc = nt.nodes.new("ShaderNodeTexCoord")
    mp = nt.nodes.new("ShaderNodeMapping")
    mp.inputs["Scale"].default_value = (1 / size, 1 / size, 1 / size)
    mp.inputs["Rotation"].default_value = (0, 0, rotate)
    nt.links.new(tc.outputs[coords], mp.inputs[0])
    if diff:
        d = _img(nt, diff)
        nt.links.new(mp.outputs[0], d.inputs[0])
        col = d.outputs[0]
        if tint:
            mix = nt.nodes.new("ShaderNodeMix")
            mix.data_type = "RGBA"
            mix.blend_type = "MULTIPLY"
            mix.inputs["Factor"].default_value = tint_mix
            nt.links.new(col, mix.inputs[6])
            mix.inputs[7].default_value = srgb(tint)
            col = mix.outputs[2]
        nt.links.new(col, b.inputs["Base Color"])
    if rough:
        r = _img(nt, rough, True)
        nt.links.new(mp.outputs[0], r.inputs[0])
        mr = nt.nodes.new("ShaderNodeMath")
        mr.operation = "MULTIPLY_ADD"
        mr.inputs[1].default_value = rough_scale
        mr.inputs[2].default_value = rough_add
        nt.links.new(r.outputs[0], mr.inputs[0])
        nt.links.new(mr.outputs[0], b.inputs["Roughness"])
    if nor:
        n = _img(nt, nor, True)
        nt.links.new(mp.outputs[0], n.inputs[0])
        nm = nt.nodes.new("ShaderNodeNormalMap")
        nm.inputs["Strength"].default_value = normal
        nt.links.new(n.outputs[0], nm.inputs[1])
        nt.links.new(nm.outputs[0], b.inputs["Normal"])
    setin(b, "Metallic", metal)
    for k, v in kw.items():
        setin(b, k, v)
    return m


def noise_bump(m, scale=40.0, strength=0.08, distance=0.002):
    """Adds a fine procedural bump (paint, plaster, fabric) to a principled material."""
    nt = m.node_tree
    b = next(n for n in nt.nodes if n.type == "BSDF_PRINCIPLED")
    nz = nt.nodes.new("ShaderNodeTexNoise")
    nz.inputs["Scale"].default_value = scale
    nz.inputs["Detail"].default_value = 8
    bp = nt.nodes.new("ShaderNodeBump")
    bp.inputs["Strength"].default_value = strength
    bp.inputs["Distance"].default_value = distance
    nt.links.new(nz.outputs[0], bp.inputs["Height"])
    if b.inputs["Normal"].is_linked:
        nt.links.new(b.inputs["Normal"].links[0].from_socket, bp.inputs["Normal"])
    nt.links.new(bp.outputs[0], b.inputs["Normal"])
    return m


def emission(name, color="#ffd9a0", strength=10.0):
    m = bpy.data.materials.get(name)
    if m:
        return m
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    for n in list(nt.nodes):
        nt.nodes.remove(n)
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    e = nt.nodes.new("ShaderNodeEmission")
    e.inputs[0].default_value = srgb(color)
    e.inputs[1].default_value = strength
    nt.links.new(e.outputs[0], out.inputs[0])
    return m


def set_emission(name, strength):
    m = bpy.data.materials.get(name)
    if not m:
        return
    for n in m.node_tree.nodes:
        if n.type == "EMISSION":
            n.inputs[1].default_value = strength
        if n.type == "BSDF_PRINCIPLED":
            setin(n, "Emission Strength", strength)


def import_gltf(asset, name=None):
    """Imports a Poly Haven glTF model into a hidden library collection and returns its root objects."""
    d = os.path.join(ASSETS, "models", asset)
    f = next((os.path.join(d, x) for x in os.listdir(d) if x.endswith(".gltf")), None)
    lib = collection("_library")
    lib.hide_render = True
    lib.hide_viewport = True
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=f)
    new = [o for o in bpy.data.objects if o not in before]
    for o in new:
        for c in list(o.users_collection):
            c.objects.unlink(o)
        lib.objects.link(o)
    return new


def asset_collection(asset):
    """Wraps an imported model as a collection that can be instanced many times cheaply."""
    name = "asset_" + asset
    c = bpy.data.collections.get(name)
    if c:
        return c
    objs = import_gltf(asset)
    c = bpy.data.collections.new(name)
    lib = bpy.data.collections["_library"]
    lib.children.link(c)
    for o in objs:
        lib.objects.unlink(o)
        c.objects.link(o)
    # Normalise: rest the model on its origin.
    return c


def place(asset, name, loc, rot_y=0.0, scale=1.0):
    """An instance of an asset collection at a scene-space location (rotation in radians about vertical)."""
    c = asset_collection(asset)
    e = bpy.data.objects.new(name, None)
    e.instance_type = "COLLECTION"
    e.instance_collection = c
    e.location = V(*loc)
    e.rotation_euler = (0, 0, rot_y)
    e.scale = (scale, scale, scale)
    return link(e)


rng = random.Random(7)
