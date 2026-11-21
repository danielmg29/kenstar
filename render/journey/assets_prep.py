"""Prepares imported Poly Haven models for placement and scattering."""
import bpy
from mathutils import Matrix, Vector

import lib


def _bake(objs):
    """Moves every object's world transform into its mesh, so instancing keeps the right orientation."""
    for o in objs:
        if o.type == "MESH":
            if o.data.users > 1:
                o.data = o.data.copy()
            mw = o.matrix_world.copy()
            o.parent = None
            o.data.transform(mw)
            o.matrix_world = Matrix.Identity(4)
        else:
            o.parent = None
    return [o for o in objs if o.type == "MESH"]


def _bounds(objs):
    pts = [v.co for o in objs for v in o.data.vertices]
    mn = Vector((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts)))
    mx = Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)))
    return mn, mx


def _import(asset):
    every = lib.import_gltf(asset)
    meshes = _bake(every)
    for o in every:
        if o.type != "MESH":
            bpy.data.objects.remove(o)
    return meshes


def _move(o, c):
    for col in list(o.users_collection):
        col.objects.unlink(o)
    c.objects.link(o)


def group(asset):
    """One placeable model, resting on its origin. Returns the collection."""
    name = "asset_" + asset
    if name in bpy.data.collections:
        return bpy.data.collections[name]
    meshes = _import(asset)
    mn, mx = _bounds(meshes)
    shift = Matrix.Translation(Vector((-(mn.x + mx.x) / 2, -(mn.y + mx.y) / 2, -mn.z)))
    c = bpy.data.collections.new(name)
    bpy.data.collections["_library"].children.link(c)
    for o in meshes:
        o.data.transform(shift)
        _move(o, c)
    return c


def pieces(asset, min_size=0.05):
    """A model set split into separate pieces (grass clumps, shrubs, rocks), each resting on its own origin."""
    name = "pieces_" + asset
    if name in bpy.data.collections:
        return bpy.data.collections[name]
    meshes = _import(asset)
    c = bpy.data.collections.new(name)
    bpy.data.collections["_library"].children.link(c)
    for o in meshes:
        mn, mx = _bounds([o])
        if (mx - mn).length < min_size:
            bpy.data.objects.remove(o)
            continue
        o.data.transform(Matrix.Translation(Vector((-(mn.x + mx.x) / 2, -(mn.y + mx.y) / 2, -mn.z))))
        _move(o, c)
    return c


def place(c, name, loc, rot=0.0, scale=1.0):
    e = bpy.data.objects.new(name, None)
    e.instance_type = "COLLECTION"
    e.instance_collection = c
    e.location = lib.V(*loc)
    e.rotation_euler = (0, 0, rot)
    e.scale = (scale, scale, scale) if isinstance(scale, (int, float)) else scale
    e["ks_asset"] = True
    return lib.link(e)


def recolour(c, mat):
    """Gives every piece of a model one material (used to dress throw pillows in the room's velvets)."""
    for o in c.objects:
        if o.type == "MESH":
            o.data.materials.clear()
            o.data.materials.append(mat)


def scatter_modifier(obj, coll, density, attr="grass", scale=(0.7, 1.3), seed=0):
    """Scatters a collection's pieces over obj's faces, weighted by a vertex attribute (0 keeps a spot bare)."""
    ng = bpy.data.node_groups.new("scatter_" + coll.name, "GeometryNodeTree")
    ng.interface.new_socket("Geometry", in_out="INPUT", socket_type="NodeSocketGeometry")
    ng.interface.new_socket("Geometry", in_out="OUTPUT", socket_type="NodeSocketGeometry")
    N, L = ng.nodes, ng.links
    gi, go = N.new("NodeGroupInput"), N.new("NodeGroupOutput")
    dist = N.new("GeometryNodeDistributePointsOnFaces")
    dist.inputs["Density"].default_value = density
    dist.inputs["Seed"].default_value = seed
    na = N.new("GeometryNodeInputNamedAttribute")
    na.data_type = "FLOAT"
    na.inputs["Name"].default_value = attr
    ci = N.new("GeometryNodeCollectionInfo")
    ci.inputs["Collection"].default_value = coll
    ci.inputs["Separate Children"].default_value = True
    ci.inputs["Reset Children"].default_value = True
    ip = N.new("GeometryNodeInstanceOnPoints")
    ip.inputs["Pick Instance"].default_value = True
    def sock(sockets, name, kind):
        return next(x for x in sockets if x.name == name and x.type == kind and x.enabled)

    rr = N.new("FunctionNodeRandomValue")
    rr.data_type = "FLOAT_VECTOR"
    sock(rr.inputs, "Max", "VECTOR").default_value = (0, 0, 6.283)
    rr.inputs["Seed"].default_value = seed + 1
    rs = N.new("FunctionNodeRandomValue")
    rs.data_type = "FLOAT"
    sock(rs.inputs, "Min", "VALUE").default_value = scale[0]
    sock(rs.inputs, "Max", "VALUE").default_value = scale[1]
    rs.inputs["Seed"].default_value = seed + 2
    ri = N.new("FunctionNodeRandomValue")
    ri.data_type = "INT"
    sock(ri.inputs, "Min", "INT").default_value = 0
    sock(ri.inputs, "Max", "INT").default_value = 999
    ri.inputs["Seed"].default_value = seed + 3
    join = N.new("GeometryNodeJoinGeometry")
    L.new(gi.outputs[0], dist.inputs["Mesh"])
    mul = N.new("ShaderNodeMath")
    mul.operation = "MULTIPLY"
    mul.inputs[1].default_value = density
    L.new(na.outputs["Attribute"], mul.inputs[0])
    L.new(mul.outputs[0], dist.inputs["Density"])
    L.new(dist.outputs["Points"], ip.inputs["Points"])
    L.new(ci.outputs[0], ip.inputs["Instance"])
    L.new(sock(rr.outputs, "Value", "VECTOR"), ip.inputs["Rotation"])
    L.new(sock(rs.outputs, "Value", "VALUE"), ip.inputs["Scale"])
    L.new(sock(ri.outputs, "Value", "INT"), ip.inputs["Instance Index"])
    L.new(gi.outputs[0], join.inputs[0])
    L.new(ip.outputs[0], join.inputs[0])
    L.new(join.outputs[0], go.inputs[0])
    m = obj.modifiers.new("scatter_" + coll.name, "NODES")
    m.node_group = ng
    return m
