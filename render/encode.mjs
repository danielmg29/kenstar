// Encodes the journey renders for the site. Run after the Blender jobs: node render/encode.mjs
//   render/out/*.png          -> public/journey/*.webp
//   render/out/lines_c*.json  -> public/journey/lines-c*.json (simplified strokes)
//   anchors + cameras         -> app/_components/journey/frames.json (the manifest the player imports)
import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const sharpDir = (await readdir(path.join(ROOT, "node_modules/.pnpm"))).find((d) => d.startsWith("sharp@"));
const sharp = require(path.join(ROOT, "node_modules/.pnpm", sharpDir, "node_modules/sharp"));
const OUT = path.join(ROOT, "render/out");
const PUB = path.join(ROOT, "public/journey");
await mkdir(PUB, { recursive: true });

const files = await readdir(OUT);
const has = (f) => files.includes(f);
const CHAPTERS = 6;
const walkCount = (c) => files.filter((f) => f.startsWith(`travel_c${c}_`) && f.endsWith(".png")).length;

async function webp(src, dst, quality) {
  await sharp(path.join(OUT, src)).webp({ quality, effort: 6, smartSubsample: true }).toFile(path.join(PUB, dst));
}

// Ramer–Douglas–Peucker on one stroke, in normalised frame units.
function simplify(pts, eps) {
  if (pts.length < 3) return pts;
  const [ax, ay] = pts[0], [bx, by] = pts[pts.length - 1];
  let max = 0, idx = 0;
  const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy) || 1e-9;
  for (let i = 1; i < pts.length - 1; i++) {
    const d = Math.abs(dy * pts[i][0] - dx * pts[i][1] + bx * ay - by * ax) / len;
    if (d > max) (max = d), (idx = i);
  }
  if (max <= eps) return [pts[0], pts[pts.length - 1]];
  return [...simplify(pts.slice(0, idx + 1), eps).slice(0, -1), ...simplify(pts.slice(idx), eps)];
}

const manifest = { chapters: [], anchors: {}, cameras: [] };
let bytes = 0;
for (let c = 0; c < CHAPTERS; c++) {
  const ch = { before: null, after: null, dusk: null, night: null, walk: 0, lines: null };
  for (const kind of ["before", "after", "dusk", "night"]) {
    const src = `c${c}-${kind}.png`;
    if (has(src)) {
      await webp(src, `c${c}-${kind}.webp`, 82);
      ch[kind] = `/journey/c${c}-${kind}.webp`;
    }
  }
  const n = walkCount(c);
  for (let i = 0; i < n; i++) await webp(`travel_c${c}_${String(i).padStart(3, "0")}.png`, `c${c}-walk-${String(i).padStart(3, "0")}.webp`, 74);
  ch.walk = n;
  if (has(`lines_c${c}.json`)) {
    const raw = JSON.parse(await readFile(path.join(OUT, `lines_c${c}.json`), "utf8"));
    const groups = {};
    let kept = 0;
    for (const [g, strokes] of Object.entries(raw.groups)) {
      groups[g] = strokes
        .map((s) => simplify(s, 0.00045))
        .filter((s) => {
          let l = 0;
          for (let i = 1; i < s.length; i++) l += Math.hypot(s[i][0] - s[i - 1][0], s[i][1] - s[i - 1][1]);
          return l > 0.0025;
        })
        .map((s) => s.flatMap(([x, y]) => [Math.round(x * 10000), Math.round(y * 10000)]));
      kept += groups[g].length;
    }
    await writeFile(path.join(PUB, `lines-c${c}.json`), JSON.stringify({ scale: 10000, groups }));
    ch.lines = `/journey/lines-c${c}.json`;
    console.log(`lines c${c}: ${kept} strokes`);
  }
  manifest.chapters.push(ch);
}
if (has("anchors.json")) manifest.anchors = JSON.parse(await readFile(path.join(OUT, "anchors.json"), "utf8"));
if (has("cameras.json")) manifest.cameras = JSON.parse(await readFile(path.join(OUT, "cameras.json"), "utf8"));
await writeFile(path.join(ROOT, "app/_components/journey/frames.json"), JSON.stringify(manifest, null, 1));
for (const f of await readdir(PUB)) bytes += (await import("node:fs")).statSync(path.join(PUB, f)).size;
console.log("public/journey", (bytes / 1048576).toFixed(1), "MB");
