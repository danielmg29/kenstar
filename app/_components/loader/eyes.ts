import { gsap } from "gsap";

// ---------- Shape ----------
// Each eye is one of the logo's two upper window panes. At rest it is exactly that pane: a 7.2-unit
// square. While performing, it deforms through these parameters, all in lockup units.
export type Eye = {
  dx: number; // offset from the pane's rest centre
  dy: number;
  w: number;
  h: number;
  r: number; // corner rounding
  tilt: number; // drop of the upper lid's inner corner, as a fraction of height (negative lifts it)
  top: number; // arch of the upper lid (positive bulges up)
  bottom: number; // arch of the lower lid (positive pushes up, into a crescent)
};

export const NEUTRAL: Eye = { dx: 0, dy: 0, w: 7.2, h: 7.2, r: 0, tilt: 0, top: 0, bottom: 0 };

type Side = "L" | "R";
// Rest centres of the upper panes (PANES.upperLeft and upperRight in brand.tsx).
const REST: Record<Side, { x: number; y: number }> = { L: { x: 642.8, y: 147.6 }, R: { x: 653.2, y: 147.6 } };

const f = (n: number) => n.toFixed(2);

/** The pane outline for a given eye state. At NEUTRAL it is the logo's square exactly. */
export function eyePath(e: Eye, side: Side): string {
  const c = REST[side];
  const w = Math.max(0.4, e.w);
  const h = Math.max(0.3, e.h);
  const x0 = c.x + e.dx - w / 2;
  const x1 = x0 + w;
  const yT = c.y + e.dy - h / 2;
  const yB = yT + h;
  // The inner corner is the one nearer the star's axis: right for the left eye, left for the right eye.
  const drop = e.tilt * h;
  const yTL = side === "L" ? yT : yT + drop;
  const yTR = side === "L" ? yT + drop : yT;
  const r = Math.max(0, Math.min(e.r, w / 2 - 0.01, (yB - Math.max(yTL, yTR)) / 2 - 0.01));
  const mx = (x0 + x1) / 2;
  // Arches scale with the straight run left between the rounded corners, so a nearly round eye
  // never grows a point at the top or bottom.
  const run = Math.max(0, w - 2 * r) / w;
  const topY = (yTL + yTR) / 2 - e.top * run;
  const botY = yB - e.bottom * run;
  return (
    `M${f(x0 + r)} ${f(yTL)}Q${f(mx)} ${f(topY)} ${f(x1 - r)} ${f(yTR)}` +
    `Q${f(x1)} ${f(yTR)} ${f(x1)} ${f(yTR + r)}L${f(x1)} ${f(yB - r)}` +
    `Q${f(x1)} ${f(yB)} ${f(x1 - r)} ${f(yB)}Q${f(mx)} ${f(botY)} ${f(x0 + r)} ${f(yB)}` +
    `Q${f(x0)} ${f(yB)} ${f(x0)} ${f(yB - r)}L${f(x0)} ${f(yTL + r)}Q${f(x0)} ${f(yTL)} ${f(x0 + r)} ${f(yTL)}Z`
  );
}

// ---------- Vocabulary ----------
export type Move =
  | "glanceLeft"
  | "glanceRight"
  | "lookUp"
  | "lookDown"
  | "squint"
  | "surprised"
  | "curious"
  | "happy"
  | "suspicious"
  | "blink"
  | "doubleBlink";

const LOOKS: Move[] = ["glanceLeft", "glanceRight", "lookUp", "lookDown"];
const SHAPES: Move[] = ["squint", "surprised", "curious", "happy", "suspicious"];
const BLINKS: Move[] = ["blink", "doubleBlink"];
const BIG: Move[] = ["surprised", "happy"];

type Pose = { L: Partial<Eye>; R: Partial<Eye>; in: number; ease: string; hold: [number, number] };

/** Target pose for each held expression. `dir` picks a side for the asymmetric ones. */
function pose(move: Move, dir: 1 | -1): Pose | null {
  switch (move) {
    case "glanceLeft":
    case "glanceRight": {
      const dx = move === "glanceLeft" ? -1.9 : 1.9;
      // Eyes turning sideways foreshorten and soften.
      const p = { dx, w: 6.3, h: 7, r: 1.2 };
      return { L: p, R: p, in: 0.16, ease: "power3.out", hold: [0.32, 0.55] };
    }
    case "lookUp": {
      const p = { dy: -1.6, w: 7, h: 6.4, r: 1.6, top: 0.9 };
      return { L: p, R: p, in: 0.18, ease: "power3.out", hold: [0.3, 0.5] };
    }
    case "lookDown": {
      const p = { dy: 1.1, h: 5, r: 1, top: -0.5 };
      return { L: p, R: p, in: 0.2, ease: "power2.out", hold: [0.3, 0.45] };
    }
    case "squint": {
      // Narrowed and wider, inner lids pulled down, cheeks pushing the lower lids up.
      const p = { w: 7.7, h: 2.6, r: 0.9, tilt: 0.32, bottom: 0.9 };
      return { L: p, R: p, in: 0.14, ease: "power2.out", hold: [0.36, 0.6] };
    }
    case "surprised": {
      // Wide open, rounded towards ovals, lifted.
      const p = { w: 8.6, h: 10, r: 4.2, dy: -1, top: 0.6, bottom: -0.4 };
      return { L: p, R: p, in: 0.1, ease: "power3.out", hold: [0.34, 0.5] };
    }
    case "curious": {
      // One eye opens and lifts, the other narrows: a raised-eyebrow look towards one side.
      const open = { dx: 0.6 * dir, dy: -1.2, w: 7.8, h: 8.8, r: 2.4, top: 0.8 };
      const narrow = { dx: 0.6 * dir, dy: 0.3, w: 7, h: 4.4, r: 1.1, tilt: 0.28 };
      return dir === 1
        ? { L: narrow, R: open, in: 0.22, ease: "power2.inOut", hold: [0.45, 0.7] }
        : { L: open, R: narrow, in: 0.22, ease: "power2.inOut", hold: [0.45, 0.7] };
    }
    case "happy": {
      // Lower lids pushed right up into crescents.
      const p = { dy: -0.3, w: 7.8, h: 4, r: 1.8, top: 0.6, bottom: 3 };
      return { L: p, R: p, in: 0.16, ease: "power2.out", hold: [0.4, 0.6] };
    }
    case "suspicious": {
      // Flat, heavy lids and a slow side-eye.
      const p = { dx: 1.6 * dir, h: 3.6, r: 0.6, top: -0.4, tilt: -0.05 };
      return { L: p, R: p, in: 0.3, ease: "power2.inOut", hold: [0.4, 0.6] };
    }
    default:
      return null;
  }
}

const full = (p: Partial<Eye>): Eye => ({ ...NEUTRAL, ...p });

// ---------- Planning ----------
type Rand = () => number;
const pick = <T,>(rand: Rand, list: T[]) => list[Math.floor(rand() * list.length)];

const MEMORY_KEY = "ks-eyes";
function lastSignature(): string | null {
  try {
    return sessionStorage.getItem(MEMORY_KEY);
  } catch {
    return null;
  }
}
function remember(sig: string) {
  try {
    sessionStorage.setItem(MEMORY_KEY, sig);
  } catch {}
}

/**
 * The opening performance. The intro opens with a look, deforms at least once, then blinks or
 * looks again. The loader opens with a deformation or a look. Neither repeats the previous
 * showing's opening pair.
 */
export function planOpening(mode: "intro" | "loader", rand: Rand = Math.random): Move[] {
  const previous = lastSignature();
  let plan: Move[] = [];
  for (let attempt = 0; attempt < 20; attempt++) {
    if (mode === "intro") {
      // A look to notice the visitor, an expression, and sometimes a blink to finish.
      const first = pick(rand, LOOKS);
      const second = pick(rand, SHAPES);
      plan = rand() < 0.5 ? [first, second, pick(rand, BLINKS)] : [first, second];
    } else {
      const first = rand() < 0.65 ? pick(rand, SHAPES) : pick(rand, LOOKS);
      plan = rand() < 0.5 ? [first, pick(rand, BLINKS)] : [first];
    }
    if (plan.slice(0, 2).join(">") !== previous) break;
  }
  remember(plan.slice(0, 2).join(">"));
  return plan;
}

// ---------- Performance ----------
/**
 * Drives both eyes: plays an opening, then keeps improvising until stopped, so a loader that
 * waits longer keeps performing instead of freezing. Every frame rebuilds both pane outlines.
 */
export class EyeDirector {
  private L: Eye = { ...NEUTRAL };
  private R: Eye = { ...NEUTRAL };
  private current: gsap.core.Timeline | gsap.core.Tween | null = null;
  private running = false;
  private history: Move[] = [];
  private queue: Move[] = [];
  private onOpening: (() => void) | null = null;
  // The opening is performed briskly: shorter holds, no pauses at rest. Waiting afterwards is unhurried.
  private get brisk() {
    return this.onOpening !== null;
  }

  constructor(
    private readonly elL: SVGPathElement,
    private readonly elR: SVGPathElement,
    private readonly rand: Rand = Math.random,
  ) {}

  private render = () => {
    this.elL.setAttribute("d", eyePath(this.L, "L"));
    this.elR.setAttribute("d", eyePath(this.R, "R"));
  };

  /** Back to the logo's squares, immediately. */
  reset() {
    this.current?.kill();
    this.current = null;
    this.running = false;
    gsap.ticker.remove(this.render);
    Object.assign(this.L, NEUTRAL);
    Object.assign(this.R, NEUTRAL);
    this.render();
  }

  play(opening: Move[], onOpening?: () => void) {
    this.reset();
    this.running = true;
    this.queue = [...opening];
    this.history = [];
    this.onOpening = onOpening ?? null;
    gsap.ticker.add(this.render);
    this.next();
  }

  /** Settles both eyes back into squares, then resolves. */
  stop(): Promise<void> {
    this.running = false;
    this.current?.kill();
    return new Promise((resolve) => {
      this.current = gsap.to([this.L, this.R], {
        ...NEUTRAL,
        duration: 0.2,
        ease: "power2.inOut",
        onComplete: () => {
          gsap.ticker.remove(this.render);
          this.render();
          resolve();
        },
      });
    });
  }

  private next = () => {
    if (!this.running) return;
    if (!this.queue.length && this.onOpening) {
      const done = this.onOpening;
      this.onOpening = null;
      done();
      if (!this.running) return;
    }
    const move = this.queue.shift() ?? this.improvise();
    this.history.push(move);
    const tl = this.perform(move);
    // Sometimes the eyes come back to rest and pause before the next expression.
    if (!this.brisk && this.rand() < 0.4 && !BLINKS.includes(move)) {
      tl.to([this.L, this.R], { ...NEUTRAL, duration: 0.18, ease: "power2.inOut" });
      tl.to({}, { duration: 0.12 + this.rand() * 0.22 });
    }
    tl.eventCallback("onComplete", this.next);
    this.current = tl;
  };

  /** The next expression: never a repeat, a deformation at least every third move, big ones spaced out. */
  private improvise(): Move {
    const last = this.history[this.history.length - 1];
    const recent = this.history.slice(-3);
    const sinceShape = [...this.history].reverse().findIndex((m) => SHAPES.includes(m));
    let pool: Move[];
    if (sinceShape === -1 || sinceShape >= 2) pool = SHAPES;
    else if (last && SHAPES.includes(last)) pool = this.rand() < 0.6 ? LOOKS : BLINKS;
    else pool = this.rand() < 0.5 ? SHAPES : this.rand() < 0.6 ? LOOKS : BLINKS;
    pool = pool.filter((m) => m !== last && !(BIG.includes(m) && recent.some((r) => BIG.includes(r))));
    return pool.length ? pick(this.rand, pool) : pick(this.rand, LOOKS.filter((m) => m !== last));
  }

  private perform(move: Move): gsap.core.Timeline {
    const tl = gsap.timeline();
    if (move === "blink" || move === "doubleBlink") {
      this.addBlink(tl, 0);
      if (move === "doubleBlink") this.addBlink(tl, 0.2);
      tl.to({}, { duration: 0.15 + this.rand() * 0.2 });
      return tl;
    }
    const dir: 1 | -1 = this.rand() < 0.5 ? 1 : -1;
    const p = pose(move, dir)!;
    tl.to(this.L, { ...full(p.L), duration: p.in, ease: p.ease }, 0).to(this.R, { ...full(p.R), duration: p.in, ease: p.ease }, 0.015);
    const hold = p.hold[0] + this.rand() * (p.hold[1] - p.hold[0]);
    tl.to({}, { duration: this.brisk ? hold * 0.65 : hold });
    // A surprise often ends in a blink.
    if (move === "surprised" && this.rand() < 0.5) this.addBlink(tl, ">");
    return tl;
  }

  /** Lids close to a line and reopen to whatever shape the eye held when the blink began. */
  private addBlink(tl: gsap.core.Timeline, at: number | string) {
    const held = { L: { ...NEUTRAL }, R: { ...NEUTRAL } };
    const shut = { h: 0.5, r: 0.2, top: 0, bottom: 0, tilt: 0 };
    const reopen = (side: "L" | "R") => ({
      h: () => held[side].h,
      r: () => held[side].r,
      top: () => held[side].top,
      bottom: () => held[side].bottom,
      tilt: () => held[side].tilt,
      duration: 0.1,
      ease: "power2.out",
    });
    tl.call(() => {
      held.L = { ...this.L };
      held.R = { ...this.R };
    }, [], at)
      .to([this.L, this.R], { ...shut, duration: 0.06, ease: "power1.in" }, "<")
      .to(this.L, reopen("L"), ">")
      .to(this.R, reopen("R"), "<");
  }
}
