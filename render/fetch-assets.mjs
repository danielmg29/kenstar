// Downloads the CC0 source assets the journey renders use, from Poly Haven (polyhaven.com, CC0).
// Approved by the client on 2026-11-20. Run: node render/fetch-assets.mjs
import { mkdir, writeFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "assets");
const TEXTURES = [
  "asphalt_02", "red_laterite_soil_stones", "rough_concrete", "concrete_floor_02", "stone_block_wall", "sandstone_blocks_05",
  "box_profile_metal_sheet", "marble_01", "velour_velvet", "brown_leather", "oak_veneer_01", "fabric_pattern_07", "plastered_wall_04",
];
const MAPS = ["Diffuse", "nor_gl", "Rough"];
const MODELS = [
  "island_tree_01", "shrub_01", "shrub_02", "shrub_04", "grass_medium_01", "potted_plant_01", "potted_plant_02", "potted_plant_04",
  "cement_bag", "throw_pillows_01", "ceramic_vase_01", "ceramic_vase_03", "brass_vase_01", "decorative_book_set_01",
  "Chandelier_01", "Chandelier_02", "Chandelier_03", "rock_moss_set_01", "fancy_picture_frame_01", "wooden_ladder",
];
const HDRIS = ["kloofendal_48d_partly_cloudy_puresky", "rustig_koppie_puresky", "kloppenheim_02_puresky"];

const api = async (id) => (await fetch(`https://api.polyhaven.com/files/${id}`)).json();
let bytes = 0;
async function get(url, file) {
  try {
    await stat(file);
    return;
  } catch {}
  await mkdir(path.dirname(file), { recursive: true });
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const r = await fetch(url);
      if (!r.ok) throw new Error(`${r.status} ${url}`);
      const buf = Buffer.from(await r.arrayBuffer());
      await writeFile(file, buf);
      bytes += buf.length;
      return;
    } catch (e) {
      if (attempt === 2) throw e;
    }
  }
}

for (const id of TEXTURES) {
  const f = await api(id);
  for (const m of MAPS) {
    const e = f[m]?.["2k"]?.jpg ?? f[m]?.["2k"]?.png;
    if (e) await get(e.url, path.join(ROOT, "textures", id, path.basename(new URL(e.url).pathname)));
  }
  console.log("texture", id);
}
for (const id of MODELS) {
  const f = await api(id);
  const g = f.gltf?.["1k"]?.gltf ?? f.gltf?.["2k"]?.gltf;
  if (!g) {
    console.log("no glTF for", id);
    continue;
  }
  const dir = path.join(ROOT, "models", id);
  await get(g.url, path.join(dir, path.basename(new URL(g.url).pathname)));
  for (const [rel, inc] of Object.entries(g.include ?? {})) await get(inc.url, path.join(dir, rel));
  console.log("model", id);
}
for (const id of HDRIS) {
  const f = await api(id);
  const e = f.hdri?.["4k"]?.hdr;
  if (e) await get(e.url, path.join(ROOT, "hdri", path.basename(new URL(e.url).pathname)));
  console.log("hdri", id);
}
console.log("done", (bytes / 1048576).toFixed(1), "MB");
