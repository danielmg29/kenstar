"""The journey's material library. Scanned CC0 textures (Poly Haven) where they exist, procedural otherwise."""
import bpy

from lib import emission, noise_bump, principled, setin, srgb, textured


def _bsdf(m):
    return next(n for n in m.node_tree.nodes if n.type == "BSDF_PRINCIPLED")


def stone_blocks(name="stone_blocks"):
    """Machine-cut stone in 450 x 225 mm courses with thin mortar, as Kenyan builders lay it."""
    m = bpy.data.materials.get(name)
    if m:
        return m
    m = textured(name, "rough_concrete", size=0.9, tint="#c9c2b2", tint_mix=0.55, normal=0.8, rough_add=0.05)
    nt = m.node_tree
    b = _bsdf(m)
    geo = nt.nodes.new("ShaderNodeNewGeometry")
    sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    nt.links.new(geo.outputs["Position"], sep.inputs[0])
    nsep = nt.nodes.new("ShaderNodeSeparateXYZ")
    nt.links.new(geo.outputs["Normal"], nsep.inputs[0])
    absx = nt.nodes.new("ShaderNodeMath")
    absx.operation = "ABSOLUTE"
    nt.links.new(nsep.outputs[0], absx.inputs[0])
    gt = nt.nodes.new("ShaderNodeMath")
    gt.operation = "GREATER_THAN"
    gt.inputs[1].default_value = 0.5
    nt.links.new(absx.outputs[0], gt.inputs[0])
    u = nt.nodes.new("ShaderNodeMix")
    u.data_type = "FLOAT"
    nt.links.new(gt.outputs[0], u.inputs[0])
    nt.links.new(sep.outputs[0], u.inputs[2])
    nt.links.new(sep.outputs[1], u.inputs[3])
    comb = nt.nodes.new("ShaderNodeCombineXYZ")
    nt.links.new(u.outputs[0], comb.inputs[0])
    nt.links.new(sep.outputs[2], comb.inputs[1])
    br = nt.nodes.new("ShaderNodeTexBrick")
    br.offset = 0.5
    br.inputs["Scale"].default_value = 1.0
    br.inputs["Brick Width"].default_value = 0.45
    br.inputs["Row Height"].default_value = 0.225
    br.inputs["Mortar Size"].default_value = 0.011
    br.inputs["Mortar Smooth"].default_value = 0.25
    br.inputs["Color1"].default_value = srgb("#d3ccbc")
    br.inputs["Color2"].default_value = srgb("#bdb4a2")
    br.inputs["Mortar"].default_value = srgb("#8f8a80")
    nt.links.new(comb.outputs[0], br.inputs["Vector"])
    base = b.inputs["Base Color"].links[0].from_socket
    mul = nt.nodes.new("ShaderNodeMix")
    mul.data_type = "RGBA"
    mul.blend_type = "MULTIPLY"
    mul.inputs["Factor"].default_value = 1.0
    nt.links.new(base, mul.inputs[6])
    nt.links.new(br.outputs["Color"], mul.inputs[7])
    over = nt.nodes.new("ShaderNodeMix")
    over.data_type = "RGBA"
    over.blend_type = "OVERLAY"
    over.inputs["Factor"].default_value = 0.6
    nt.links.new(mul.outputs[2], over.inputs[6])
    nt.links.new(br.outputs["Color"], over.inputs[7])
    nt.links.new(over.outputs[2], b.inputs["Base Color"])
    bump = nt.nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.6
    bump.inputs["Distance"].default_value = 0.004
    inv = nt.nodes.new("ShaderNodeMath")
    inv.operation = "SUBTRACT"
    inv.inputs[0].default_value = 1.0
    nt.links.new(br.outputs["Fac"], inv.inputs[1])
    nt.links.new(inv.outputs[0], bump.inputs["Height"])
    if b.inputs["Normal"].is_linked:
        nt.links.new(b.inputs["Normal"].links[0].from_socket, bump.inputs["Normal"])
    nt.links.new(bump.outputs[0], b.inputs["Normal"])
    return m


def marble(name="marble", tile=None, gloss=0.07):
    """Polished white marble with soft grey and warm veins. With tile=(w, h), laid as porcelain slabs with fine grout."""
    m = bpy.data.materials.get(name)
    if m:
        return m
    m = principled(name, "#efebe5", rough=gloss, **{"Coat Weight": 0.35, "Coat Roughness": 0.03})
    nt = m.node_tree
    b = _bsdf(m)
    geo = nt.nodes.new("ShaderNodeNewGeometry")
    vec = geo.outputs["Position"]
    if tile:
        br = nt.nodes.new("ShaderNodeTexBrick")
        br.offset = 0.0
        br.inputs["Brick Width"].default_value = tile[0]
        br.inputs["Row Height"].default_value = tile[1]
        br.inputs["Mortar Size"].default_value = 0.0025
        br.inputs["Mortar Smooth"].default_value = 0.0
        br.inputs["Color1"].default_value = (0, 0, 0, 1)
        br.inputs["Color2"].default_value = (1, 1, 1, 1)
        br.inputs["Bias"].default_value = 0.0
        sep = nt.nodes.new("ShaderNodeSeparateXYZ")
        nt.links.new(vec, sep.inputs[0])
        comb = nt.nodes.new("ShaderNodeCombineXYZ")
        nt.links.new(sep.outputs[0], comb.inputs[0])
        nt.links.new(sep.outputs[1], comb.inputs[1])
        nt.links.new(comb.outputs[0], br.inputs["Vector"])
        # Each slab samples the vein pattern at its own offset, so neighbours never continue a vein.
        off = nt.nodes.new("ShaderNodeVectorMath")
        off.operation = "MULTIPLY_ADD"
        off.inputs[1].default_value = (37.0, 53.0, 11.0)
        nt.links.new(br.outputs["Color"], off.inputs[0])
        nt.links.new(vec, off.inputs[2])
        vec = off.outputs[0]
    # Veins: thin lines where a warped noise field crosses its midpoint, in two scales, on warm white.
    def veins(scale, width, strength, seed):
        nz = nt.nodes.new("ShaderNodeTexNoise")
        nz.inputs["Scale"].default_value = scale
        nz.inputs["Detail"].default_value = 5
        nz.inputs["Roughness"].default_value = 0.58
        nz.inputs["Distortion"].default_value = 1.4
        shift = nt.nodes.new("ShaderNodeVectorMath")
        shift.inputs[1].default_value = (seed * 3.1, seed * 1.7, seed * 2.3)
        nt.links.new(vec, shift.inputs[0])
        nt.links.new(shift.outputs[0], nz.inputs["Vector"])
        sub = nt.nodes.new("ShaderNodeMath")
        sub.operation = "SUBTRACT"
        sub.inputs[1].default_value = 0.5
        nt.links.new(nz.outputs["Fac"], sub.inputs[0])
        ab = nt.nodes.new("ShaderNodeMath")
        ab.operation = "ABSOLUTE"
        nt.links.new(sub.outputs[0], ab.inputs[0])
        mr = nt.nodes.new("ShaderNodeMapRange")
        mr.inputs["From Min"].default_value = 0.0
        mr.inputs["From Max"].default_value = width
        mr.inputs["To Min"].default_value = strength
        mr.inputs["To Max"].default_value = 0.0
        nt.links.new(ab.outputs[0], mr.inputs["Value"])
        return mr.outputs[0]

    v1 = veins(0.42, 0.007, 0.5, 1.3)
    v2 = veins(1.3, 0.0035, 0.28, 7.1)
    add = nt.nodes.new("ShaderNodeMath")
    add.operation = "ADD"
    add.use_clamp = True
    nt.links.new(v1, add.inputs[0])
    nt.links.new(v2, add.inputs[1])
    cloud = nt.nodes.new("ShaderNodeTexNoise")
    cloud.inputs["Scale"].default_value = 0.8
    cloud.inputs["Detail"].default_value = 2
    nt.links.new(vec, cloud.inputs["Vector"])
    base = nt.nodes.new("ShaderNodeValToRGB")
    base.color_ramp.elements[0].color = srgb("#ece8e1")
    base.color_ramp.elements[1].color = srgb("#f6f4ef")
    nt.links.new(cloud.outputs["Fac"], base.inputs[0])
    ramp = nt.nodes.new("ShaderNodeMix")
    ramp.data_type = "RGBA"
    nt.links.new(add.outputs[0], ramp.inputs[0])
    nt.links.new(base.outputs[0], ramp.inputs[6])
    ramp.inputs[7].default_value = srgb("#9d9891")
    out = ramp.outputs[2]
    if tile:
        grout = nt.nodes.new("ShaderNodeMix")
        grout.data_type = "RGBA"
        nt.links.new(br.outputs["Fac"], grout.inputs[0])
        nt.links.new(out, grout.inputs[6])
        grout.inputs[7].default_value = srgb("#bfb8ae")
        out = grout.outputs[2]
        bump = nt.nodes.new("ShaderNodeBump")
        bump.inputs["Strength"].default_value = 0.4
        bump.inputs["Distance"].default_value = 0.001
        inv = nt.nodes.new("ShaderNodeMath")
        inv.operation = "SUBTRACT"
        inv.inputs[0].default_value = 1.0
        nt.links.new(br.outputs["Fac"], inv.inputs[1])
        nt.links.new(inv.outputs[0], bump.inputs["Height"])
        nt.links.new(bump.outputs[0], b.inputs["Normal"])
    nt.links.new(out, b.inputs["Base Color"])
    return m


def velvet(name, color, size=0.35):
    m = bpy.data.materials.get(name)
    if m:
        return m
    m = textured(name, "velour_velvet", size=size, normal=0.6, rough_scale=0.4, rough_add=0.55)
    nt = m.node_tree
    b = _bsdf(m)
    for l in list(b.inputs["Base Color"].links):
        nt.links.remove(l)
    setin(b, "Base Color", srgb(color))
    setin(b, "Sheen Weight", 0.9)
    setin(b, "Sheen Roughness", 0.32)
    setin(b, "Sheen Tint", (1, 1, 1, 1))
    return m


def curtain_sheer(name="sheer"):
    m = bpy.data.materials.get(name)
    if m:
        return m
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    for n in list(nt.nodes):
        nt.nodes.remove(n)
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    tr = nt.nodes.new("ShaderNodeBsdfTransparent")
    tl = nt.nodes.new("ShaderNodeBsdfTranslucent")
    tl.inputs[0].default_value = srgb("#f4f1ea")
    df = nt.nodes.new("ShaderNodeBsdfDiffuse")
    df.inputs[0].default_value = srgb("#f2efe8")
    m1 = nt.nodes.new("ShaderNodeMixShader")
    m1.inputs[0].default_value = 0.5
    nt.links.new(tl.outputs[0], m1.inputs[1])
    nt.links.new(df.outputs[0], m1.inputs[2])
    m2 = nt.nodes.new("ShaderNodeMixShader")
    m2.inputs[0].default_value = 0.55
    nt.links.new(tr.outputs[0], m2.inputs[1])
    nt.links.new(m1.outputs[0], m2.inputs[2])
    nt.links.new(m2.outputs[0], out.inputs[0])
    return m


def water(name="water"):
    m = principled(name, "#3d4a3c", rough=0.04, **{"Transmission Weight": 0.85, "IOR": 1.33})
    nt = m.node_tree
    b = _bsdf(m)
    if not b.inputs["Normal"].is_linked:
        nz = nt.nodes.new("ShaderNodeTexNoise")
        nz.inputs["Scale"].default_value = 3.0
        nz.inputs["Detail"].default_value = 6
        bp = nt.nodes.new("ShaderNodeBump")
        bp.inputs["Strength"].default_value = 0.25
        nt.links.new(nz.outputs[0], bp.inputs["Height"])
        nt.links.new(bp.outputs[0], b.inputs["Normal"])
    return m


def artwork(name="art"):
    """A large abstract canvas in limestone, umber and brass leaf."""
    m = bpy.data.materials.get(name)
    if m:
        return m
    m = principled(name, "#ffffff", rough=0.75)
    nt = m.node_tree
    b = _bsdf(m)
    geo = nt.nodes.new("ShaderNodeNewGeometry")
    nz = nt.nodes.new("ShaderNodeTexNoise")
    nz.inputs["Scale"].default_value = 0.9
    nz.inputs["Detail"].default_value = 3
    nz.inputs["Distortion"].default_value = 2.5
    nt.links.new(geo.outputs["Position"], nz.inputs["Vector"])
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    cr = ramp.color_ramp
    cr.interpolation = "CONSTANT"
    cr.elements[0].color = srgb("#e9e2d6")
    cr.elements[1].position = 0.62
    cr.elements[1].color = srgb("#b98d5a")
    for pos, col in ((0.42, "#d8cdbd"), (0.5, "#6f5a46"), (0.56, "#2f3a44")):
        e = cr.elements.new(pos)
        e.color = srgb(col)
    nt.links.new(nz.outputs["Fac"], ramp.inputs[0])
    nt.links.new(ramp.outputs[0], b.inputs["Base Color"])
    noise_bump(m, 120, 0.15, 0.001)
    return m


def land(name="land"):
    """Embu ground: grass over red soil, patchy, with darker hollows."""
    m = bpy.data.materials.get(name)
    if m:
        return m
    m = textured(name, "red_laterite_soil_stones", size=3.0, normal=0.8)
    nt = m.node_tree
    b = _bsdf(m)
    soil = b.inputs["Base Color"].links[0].from_socket
    geo = nt.nodes.new("ShaderNodeNewGeometry")
    nz = nt.nodes.new("ShaderNodeTexNoise")
    nz.inputs["Scale"].default_value = 0.08
    nz.inputs["Detail"].default_value = 8
    nt.links.new(geo.outputs["Position"], nz.inputs["Vector"])
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    cr = ramp.color_ramp
    cr.elements[0].position = 0.35
    cr.elements[0].color = srgb("#36461f")
    cr.elements[1].position = 0.75
    cr.elements[1].color = srgb("#58612f")
    nt.links.new(nz.outputs["Fac"], ramp.inputs[0])
    patch = nt.nodes.new("ShaderNodeTexNoise")
    patch.inputs["Scale"].default_value = 0.35
    patch.inputs["Detail"].default_value = 4
    nt.links.new(geo.outputs["Position"], patch.inputs["Vector"])
    pr = nt.nodes.new("ShaderNodeMapRange")
    pr.inputs["From Min"].default_value = 0.55
    pr.inputs["From Max"].default_value = 0.7
    nt.links.new(patch.outputs["Fac"], pr.inputs["Value"])
    mix = nt.nodes.new("ShaderNodeMix")
    mix.data_type = "RGBA"
    nt.links.new(pr.outputs[0], mix.inputs[0])
    nt.links.new(ramp.outputs[0], mix.inputs[6])
    nt.links.new(soil, mix.inputs[7])
    nt.links.new(mix.outputs[2], b.inputs["Base Color"])
    return m


def hill(name="hill"):
    """Distant hills: dark green, textured by tree cover, fading into the haze with distance."""
    m = bpy.data.materials.get(name)
    if m:
        return m
    m = principled(name, "#41532f", rough=0.95)
    nt = m.node_tree
    b = _bsdf(m)
    out = next(n for n in nt.nodes if n.type == "OUTPUT_MATERIAL")
    geo = nt.nodes.new("ShaderNodeNewGeometry")
    v = nt.nodes.new("ShaderNodeTexVoronoi")
    v.inputs["Scale"].default_value = 0.4
    nt.links.new(geo.outputs["Position"], v.inputs["Vector"])
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].color = srgb("#2c3d22")
    ramp.color_ramp.elements[1].color = srgb("#5d6e3d")
    nt.links.new(v.outputs["Distance"], ramp.inputs[0])
    nt.links.new(ramp.outputs[0], b.inputs["Base Color"])
    cam = nt.nodes.new("ShaderNodeCameraData")
    mr = nt.nodes.new("ShaderNodeMapRange")
    mr.inputs["From Min"].default_value = 80
    mr.inputs["From Max"].default_value = 900
    mr.inputs["To Max"].default_value = 0.62
    nt.links.new(cam.outputs["View Distance"], mr.inputs["Value"])
    haze = nt.nodes.new("ShaderNodeEmission")
    haze.inputs[0].default_value = srgb("#b9c6cf")
    haze.inputs[1].default_value = 1.0
    mx = nt.nodes.new("ShaderNodeMixShader")
    nt.links.new(mr.outputs[0], mx.inputs[0])
    nt.links.new(b.outputs[0], mx.inputs[1])
    nt.links.new(haze.outputs[0], mx.inputs[2])
    nt.links.new(mx.outputs[0], out.inputs[0])
    return m


def channels(m, pitch=0.055):
    """Vertical channel tufting across upholstery, in object space."""
    nt = m.node_tree
    b = _bsdf(m)
    tc = nt.nodes.new("ShaderNodeTexCoord")
    w = nt.nodes.new("ShaderNodeTexWave")
    w.wave_type = "BANDS"
    w.bands_direction = "X"
    w.wave_profile = "SIN"
    w.inputs["Scale"].default_value = 1 / pitch / 6.283 * 6.283
    w.inputs["Distortion"].default_value = 0.0
    nt.links.new(tc.outputs["Object"], w.inputs["Vector"])
    bp = nt.nodes.new("ShaderNodeBump")
    bp.inputs["Strength"].default_value = 0.55
    bp.inputs["Distance"].default_value = 0.01
    nt.links.new(w.outputs["Fac"], bp.inputs["Height"])
    if b.inputs["Normal"].is_linked:
        nt.links.new(b.inputs["Normal"].links[0].from_socket, bp.inputs["Normal"])
    nt.links.new(bp.outputs[0], b.inputs["Normal"])
    return m


def thin_glass(name="glass", tint="#eef3f2"):
    """Architectural glazing: Fresnel reflection over clear transmission, letting sun and sky into the room."""
    m = bpy.data.materials.get(name)
    if m:
        return m
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    for n in list(nt.nodes):
        nt.nodes.remove(n)
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    tr = nt.nodes.new("ShaderNodeBsdfTransparent")
    tr.inputs[0].default_value = srgb(tint)
    gl = nt.nodes.new("ShaderNodeBsdfGlossy")
    gl.inputs["Roughness"].default_value = 0.0
    fr = nt.nodes.new("ShaderNodeFresnel")
    fr.inputs["IOR"].default_value = 1.52
    mx = nt.nodes.new("ShaderNodeMixShader")
    nt.links.new(fr.outputs[0], mx.inputs[0])
    nt.links.new(tr.outputs[0], mx.inputs[1])
    nt.links.new(gl.outputs[0], mx.inputs[2])
    nt.links.new(mx.outputs[0], out.inputs[0])
    return m


def shadow_clear(m):
    """Lets light pass straight through for shadow rays (crystal around a bulb, still water)."""
    nt = m.node_tree
    out = next(n for n in nt.nodes if n.type == "OUTPUT_MATERIAL")
    src = out.inputs[0].links[0].from_socket
    lp = nt.nodes.new("ShaderNodeLightPath")
    tr = nt.nodes.new("ShaderNodeBsdfTransparent")
    mx = nt.nodes.new("ShaderNodeMixShader")
    nt.links.new(lp.outputs["Is Shadow Ray"], mx.inputs[0])
    nt.links.new(src, mx.inputs[1])
    nt.links.new(tr.outputs[0], mx.inputs[2])
    nt.links.new(mx.outputs[0], out.inputs[0])
    return m


def build():
    M = {}
    M["concrete"] = textured("concrete", "rough_concrete", size=1.4, tint="#b7b3ab", tint_mix=0.35, normal=1.0)
    M["screed"] = textured("screed", "concrete_floor_02", size=2.5, tint="#d8d2c6", tint_mix=0.55, normal=0.6, rough_add=0.05)
    M["stone"] = stone_blocks()
    M["asphalt"] = textured("asphalt", "asphalt_02", size=3.0, normal=1.0)
    M["murram"] = textured("murram", "red_laterite_soil_stones", size=2.2, normal=1.2)
    M["roof"] = textured("roof", "box_profile_metal_sheet", size=2.0, coords="UV", normal=1.4, metal=0.5, rough_add=0.1)
    M["land"] = land()
    M["sand"] = noise_bump(principled("sand", "#a98657", rough=1.0), 90, 0.8, 0.006)
    M["ballast"] = noise_bump(principled("ballast", "#7d7a74", rough=0.85), 25, 0.9, 0.012)
    M["water"] = water()
    M["marking"] = principled("marking", "#e9e6dc", rough=0.6)
    M["bridge"] = principled("bridge", "#d6a01c", rough=0.42)
    M["galv"] = principled("galv", "#9da3a6", rough=0.38, metal=0.9)
    M["pole_timber"] = textured("pole_timber", "oak_veneer_01", size=1.0, tint="#4a3626", tint_mix=0.9, rough_add=0.25)
    M["eucalyptus"] = textured("eucalyptus", "oak_veneer_01", size=0.8, tint="#8c8273", tint_mix=0.95, rough_add=0.35)
    M["plywood"] = textured("plywood", "oak_veneer_01", size=1.2, tint="#c9a77d", tint_mix=0.6, rough_add=0.25)
    M["wire"] = principled("wire", "#141516", rough=0.4)
    M["insulator"] = principled("insulator", "#6f7d70", rough=0.15)
    M["led"] = principled("led_head", "#5c6166", rough=0.35, metal=0.6)
    M["cement_bag"] = principled("cement_bag_paper", "#cdbf9f", rough=0.85)
    M["rebar"] = principled("rebar", "#5e4434", rough=0.7, metal=0.6)
    M["frame"] = principled("alu_charcoal", "#2a2d30", rough=0.32, metal=0.7)
    M["glass"] = thin_glass()
    M["fascia"] = principled("fascia", "#efece6", rough=0.5)
    M["gutter"] = principled("gutter", "#e8e5df", rough=0.35)
    M["pvc"] = principled("pvc_conduit", "#8f969c", rough=0.45)
    M["plate"] = principled("switch_plate", "#f5f3ee", rough=0.25)
    M["ceramic"] = principled("ceramic", "#f6f4f0", rough=0.08, **{"Coat Weight": 0.6})
    M["gold"] = principled("brushed_gold", "#d9ae62", rough=0.22, metal=1.0)
    M["gold_polish"] = principled("polished_gold", "#e6bd70", rough=0.08, metal=1.0)
    M["chrome"] = principled("chrome", "#e8eaec", rough=0.05, metal=1.0)
    M["copper"] = principled("copper", "#c27a4d", rough=0.3, metal=1.0)
    M["mirror"] = principled("mirror", "#eef1f2", rough=0.0, metal=1.0)
    M["paint"] = noise_bump(principled("paint_wall", "#ece7de", rough=0.82), 220, 0.05, 0.0005)
    M["paint_ext"] = noise_bump(principled("paint_exterior", "#f0ede6", rough=0.85), 90, 0.12, 0.001)
    M["ceiling"] = noise_bump(principled("ceiling_paint", "#f4f2ed", rough=0.9), 220, 0.04, 0.0005)
    M["skirting"] = principled("skirting", "#f3f1ec", rough=0.35)
    M["floor"] = marble("floor_marble", tile=(1.2, 0.6))
    M["marble"] = marble("table_marble")
    M["sofa"] = velvet("sofa_velvet", "#b5aa9a")
    M["sofa_dark"] = velvet("sofa_velvet_deep", "#7f7464")
    M["chair"] = channels(velvet("chair_velvet", "#b29d80", size=0.3))
    M["drape"] = velvet("drape_velvet", "#a29482", size=0.5)
    M["cushion_a"] = velvet("cushion_teal", "#2f4a4f", size=0.25)
    M["cushion_b"] = velvet("cushion_ochre", "#b98a45", size=0.25)
    M["cushion_c"] = velvet("cushion_ivory", "#e6dfd2", size=0.25)
    M["accent"] = velvet("accent_teal", "#2f4f55", size=0.3)
    M["rug_dining"] = noise_bump(principled("rug_dining", "#b8ad9c", rough=0.95, **{"Sheen Weight": 0.5}), 400, 0.35, 0.002)
    M["leather"] = textured("leather", "brown_leather", size=0.6, tint="#6b4a34", tint_mix=0.4, normal=0.7, rough_scale=0.7)
    M["walnut"] = textured("walnut", "oak_veneer_01", size=1.2, tint="#6e4f37", tint_mix=0.85, rough_scale=0.5, rough_add=0.15, **{"Coat Weight": 0.25, "Coat Roughness": 0.15})
    M["oak"] = textured("oak", "oak_veneer_01", size=1.2, rough_scale=0.6, rough_add=0.1)
    M["rug"] = noise_bump(principled("rug_wool", "#cfc6b8", rough=0.95, **{"Sheen Weight": 0.5}), 400, 0.35, 0.002)
    M["rug_border"] = noise_bump(principled("rug_border", "#9c8d78", rough=0.95, **{"Sheen Weight": 0.5}), 400, 0.35, 0.002)
    M["sheer"] = curtain_sheer()
    M["shade"] = shadow_clear(principled("lamp_shade", "#efe7d8", rough=0.8, **{"Subsurface Weight": 0.6, "Transmission Weight": 0.2}))
    M["tv"] = principled("tv_glass", "#0a0b0c", rough=0.05)
    M["art"] = artwork()
    M["book_a"] = principled("book_a", "#3b4652", rough=0.6)
    M["book_b"] = principled("book_b", "#c9bfae", rough=0.6)
    M["book_c"] = principled("book_c", "#8a5a3a", rough=0.6)
    M["crystal"] = shadow_clear(principled("crystal", "#ffffff", rough=0.0, **{"Transmission Weight": 1.0, "IOR": 1.6}))
    M["bulb"] = emission("bulb_warm", "#ffd7a0", 0.0)
    M["led_strip"] = emission("led_strip", "#ffcf96", 0.0)
    M["downlight"] = emission("downlight_disc", "#fff1dc", 0.0)
    M["tarp"] = principled("tarp", "#2e3f55", rough=0.6)
    M["hill"] = hill()
    M["black"] = principled("black_metal", "#1a1b1c", rough=0.4, metal=0.5)
    M["steel_plate"] = principled("steel_chequer", "#c79616", rough=0.5)
    return M
