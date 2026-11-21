/**
 * Plays the journey's pre-rendered frames on a canvas: walking frames while the camera moves, the
 * chapter's line drawing traced stroke by stroke over a pale wash of the scene, then the finished render
 * dissolving in from the same camera. Frames are 4:3 masters, cropped to the stage like object-fit: cover.
 * They are rendered in Blender (render/journey) and listed in frames.json by render/encode.mjs.
 */
import manifest from "./frames.json";
import type { Frame } from "./timeline";

type Chapter = { before: string | null; after: string | null; dusk: string | null; night: string | null; walk: number; lines: string | null };
type Cam = { m: number[]; tan: number; shift: number; aspect: number };
export const FRAMES = manifest as unknown as { chapters: Chapter[]; anchors: Record<string, [number, number]>; cameras: Cam[] };

const ASPECT = 4 / 3;
const SHEET = "#f2efe8";
const INK = "52 58 64";

// ---------------------------------------------------------------- images

const cache = new Map<string, HTMLImageElement | "loading">();
let onLoad: () => void = () => {};
export const whenLoaded = (cb: () => void) => (onLoad = cb);

function image(src: string | null): HTMLImageElement | null {
  if (!src) return null;
  const hit = cache.get(src);
  if (hit && hit !== "loading") return hit;
  if (!hit) {
    cache.set(src, "loading");
    const img = new Image();
    img.decoding = "async";
    img.src = src;
    img
      .decode()
      .then(() => {
        cache.set(src, img);
        onLoad();
      })
      .catch(() => cache.delete(src));
  }
  return null;
}

const walkSrc = (c: number, i: number) => `/journey/c${c}-walk-${String(i).padStart(3, "0")}.webp`;

/** Starts loading what a chapter needs (and the next one's walk), nearest first. */
export function prefetch(c: number) {
  for (const k of [c, c + 1]) {
    const ch = FRAMES.chapters[k];
    if (!ch) continue;
    image(ch.before);
    image(ch.after);
    image(ch.dusk);
    image(ch.night);
    lines(k);
    for (let i = 0; i < ch.walk; i++) image(walkSrc(k, i));
  }
}

// ---------------------------------------------------------------- line drawings

type Stroke = { pts: Float32Array; cum: Float32Array; len: number };
const strokes = new Map<number, Stroke[][] | "loading">();

function lines(c: number): Stroke[][] | null {
  const ch = FRAMES.chapters[c];
  if (!ch?.lines) return null;
  const hit = strokes.get(c);
  if (hit && hit !== "loading") return hit;
  if (!hit) {
    strokes.set(c, "loading");
    fetch(ch.lines)
      .then((r) => r.json())
      .then((d: { scale: number; groups: Record<string, number[][]> }) => {
        const groups: Stroke[][] = Array.from({ length: 10 }, () => []);
        for (const [g, list] of Object.entries(d.groups)) {
          for (const flat of list) {
            const n = flat.length / 2;
            const pts = new Float32Array(flat.length);
            const cum = new Float32Array(n);
            let len = 0;
            for (let i = 0; i < n; i++) {
              pts[i * 2] = flat[i * 2] / d.scale;
              pts[i * 2 + 1] = flat[i * 2 + 1] / d.scale;
              if (i) len += Math.hypot(pts[i * 2] - pts[i * 2 - 2], pts[i * 2 + 1] - pts[i * 2 - 1]);
              cum[i] = len;
            }
            groups[Number(g)].push({ pts, cum, len });
          }
        }
        strokes.set(c, groups);
        onLoad();
      })
      .catch(() => strokes.delete(c));
  }
  return null;
}

// ---------------------------------------------------------------- framing

export type View = { s: number; ox: number; oy: number; w: number; h: number };

/** Where the 4:3 frame sits on the stage: cover-fit, centred on the chapter's notes on narrow screens. */
export function viewFor(W: number, H: number, focus: number): View {
  const s = Math.max(W, H * ASPECT);
  const fw = s, fh = s / ASPECT;
  const ox = Math.min(0, Math.max(W - fw, W / 2 - focus * fw));
  const oy = (H - fh) * 0.45;
  return { s, ox, oy, w: fw, h: fh };
}

/** The horizontal point a chapter's crop centres on: its Field Notes, or the middle. */
export function focusOf(c: number, notes: string[]) {
  const xs = notes.map((n) => FRAMES.anchors[n]?.[0]).filter((x): x is number => typeof x === "number");
  if (c < 0 || !xs.length) return 0.56;
  return Math.min(0.75, Math.max(0.3, xs.reduce((a, b) => a + b, 0) / xs.length));
}

export const toStage = (v: View, [u, w]: [number, number]): [number, number] => [v.ox + u * v.w, v.oy + w * v.h];

// ---------------------------------------------------------------- drawing

function draw(ctx: CanvasRenderingContext2D, img: HTMLImageElement | null, v: View, alpha = 1) {
  if (!img || alpha <= 0) return false;
  ctx.globalAlpha = alpha;
  ctx.drawImage(img, v.ox, v.oy, v.w, v.h);
  ctx.globalAlpha = 1;
  return true;
}

/** The setting-out grid on bare ground, projected through the first chapter's camera. */
function surveyGrid(ctx: CanvasRenderingContext2D, v: View, progress: number, alpha: number) {
  const cam = FRAMES.cameras[0];
  if (!cam || alpha <= 0 || progress <= 0) return;
  const m = cam.m;
  const proj = (x: number, y: number, z: number): [number, number] | null => {
    // Scene (x, y, z) is Blender (x, z, y).
    const bx = x, by = z, bz = y;
    const cx = m[0] * bx + m[1] * by + m[2] * bz + m[3];
    const cy = m[4] * bx + m[5] * by + m[6] * bz + m[7];
    const cz = m[8] * bx + m[9] * by + m[10] * bz + m[11];
    if (cz > -0.1) return null;
    const u = 0.5 + (cx / -cz) / (2 * cam.tan) - cam.shift;
    const w = 0.5 - ((cy / -cz) / (2 * cam.tan)) * cam.aspect;
    return toStage(v, [u, w]);
  };
  const reach = -70 + progress * 230;
  const seg = (a: number[], b: number[], strong: boolean) => {
    const pa = proj(a[0], a[1], a[2]), pb = proj(b[0], b[1], b[2]);
    if (!pa || !pb) return;
    const dist = Math.hypot((a[0] + b[0]) / 2 - 1.4, (a[2] + b[2]) / 2 + 14);
    const fade = Math.exp(-dist / 70);
    if (fade < 0.02) return;
    ctx.strokeStyle = `rgb(${INK} / ${((strong ? 0.32 : 0.16) * fade * alpha).toFixed(3)})`;
    ctx.beginPath();
    ctx.moveTo(pa[0], pa[1]);
    ctx.lineTo(pb[0], pb[1]);
    ctx.stroke();
  };
  ctx.lineWidth = 1;
  for (let x = -60; x <= 60; x += 5) for (let z = -12; z < reach; z += 10) seg([x, 0, z], [x, 0, Math.min(z + 10, reach)], x % 25 === 0);
  for (let z = -10; z <= reach; z += 5) for (let x = -60; x < 60; x += 10) seg([x, 0, z], [x + 10, 0, z], z % 25 === 0);
}

/** Traces the chapter's line drawing: groups in build order, each stroke drawn from its start. */
function drawing(ctx: CanvasRenderingContext2D, c: number, v: View, progress: number, alpha: number) {
  const groups = lines(c);
  if (!groups || alpha <= 0 || progress <= 0) return;
  ctx.lineWidth = 1.1;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = `rgb(${INK} / ${(0.88 * alpha).toFixed(3)})`;
  ctx.beginPath();
  groups.forEach((list, g) => {
    const f = Math.min(1, Math.max(0, (progress - g * 0.06) / 0.4));
    if (f <= 0) return;
    for (const s of list) {
      const until = s.len * f;
      const p = s.pts;
      ctx.moveTo(v.ox + p[0] * v.w, v.oy + p[1] * v.h);
      for (let i = 1; i < s.cum.length; i++) {
        if (s.cum[i] <= until) {
          ctx.lineTo(v.ox + p[i * 2] * v.w, v.oy + p[i * 2 + 1] * v.h);
        } else {
          const t = (until - s.cum[i - 1]) / Math.max(1e-6, s.cum[i] - s.cum[i - 1]);
          ctx.lineTo(v.ox + (p[i * 2 - 2] + (p[i * 2] - p[i * 2 - 2]) * t) * v.w, v.oy + (p[i * 2 - 1] + (p[i * 2 + 1] - p[i * 2 - 1]) * t) * v.h);
          break;
        }
      }
    }
  });
  ctx.stroke();
}

/** Composites one moment of the journey. Returns false while a needed frame is still loading. */
export function paint(ctx: CanvasRenderingContext2D, fr: Frame, v: View, W: number, H: number): boolean {
  ctx.fillStyle = SHEET;
  ctx.fillRect(0, 0, W, H);
  if (fr.chapter < 0) {
    surveyGrid(ctx, v, fr.grid, fr.gridAlpha);
    return true;
  }
  const c = fr.chapter;
  const ch = FRAMES.chapters[c];
  let ready = true;
  // The scene as it stood: walking frames on the way in, then the still at the stop.
  if (c > 0) {
    if (fr.walk < 1 && ch.walk > 1) {
      const x = fr.walk * (ch.walk - 1);
      const i = Math.floor(x);
      // Each frame holds crisp and hands over to the next in a short dissolve, rather than ghosting
      // two views that are metres apart for the whole step.
      const t = Math.min(1, Math.max(0, (x - i - 0.35) / 0.3));
      const a = image(walkSrc(c, i)), b = image(walkSrc(c, Math.min(ch.walk - 1, i + 1)));
      if (!draw(ctx, a, v)) ready = draw(ctx, image(ch.before), v) && false;
      if (t > 0.01) draw(ctx, b, v, t);
    } else {
      ready = draw(ctx, image(ch.before), v) && ready;
    }
  }
  // A pale wash, as if traced on paper laid over the scene, while the new work is drawn.
  if (c > 0 && fr.wire > 0 && fr.wireAlpha > 0) {
    ctx.fillStyle = `rgb(242 239 232 / ${(0.5 * fr.wireAlpha).toFixed(3)})`;
    ctx.fillRect(0, 0, W, H);
  }
  if (c === 0) surveyGrid(ctx, v, 1, fr.gridAlpha);
  drawing(ctx, c, v, fr.wire, fr.wireAlpha);
  if (fr.fill > 0) ready = draw(ctx, image(ch.after), v, fr.fill) && ready;
  if (fr.dusk > 0) draw(ctx, image(ch.dusk), v, fr.dusk);
  if (fr.lights > 0) draw(ctx, image(ch.night), v, fr.lights);
  return ready;
}

/** A finished chapter, for the reduced-motion stills. */
export const stillOf = (c: number) => {
  const ch = FRAMES.chapters[c];
  return ch.night ?? ch.after ?? "";
};
