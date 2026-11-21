/**
 * The journey's timing, measured in screens of scroll.
 *
 * Each chapter: the camera walks to its next position (pre-rendered frames, eased in and out), then,
 * with the camera still, the chapter's new work draws in as lines over the scene, the finished render dissolves in from the same
 * camera, then the camera holds at each Field Note for 0.45 of a screen (the design system asks for at
 * least 0.4). Arrival adds dusk and the final light. Everything is a pure function of scroll position,
 * so it reverses exactly. The frames themselves are rendered in Blender (render/journey).
 */
import { JOURNEY } from "../../_content/journey";

type Window = [number, number];
export type ChapterTime = {
  start: number;
  end: number;
  travel: Window;
  wire: Window;
  fill: Window;
  dusk?: Window;
  light?: Window;
  notes: Window[];
};

export const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t);
export const span = (t: number, [a, b]: Window) => clamp01((t - a) / (b - a));
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export const INTRO = 0.6;
const HOLD = 0.45;

function build() {
  const chapters: ChapterTime[] = [];
  let t = INTRO;
  JOURNEY.forEach((ch, i) => {
    const last = i === JOURNEY.length - 1;
    const s = t;
    const at = (x: number): number => s + x;
    const notesFrom = last ? 1.6 : 1.2;
    const notes = ch.notes.map((_, k): Window => [at(notesFrom + HOLD * k), at(notesFrom + HOLD * (k + 1))]);
    const end = notes.length ? notes[notes.length - 1][1] + (last ? 0.35 : 0.05) : at(notesFrom + 0.3);
    chapters.push({
      start: s,
      end,
      travel: [at(0), at(0.5)],
      wire: [at(0.5), at(0.88)],
      fill: [at(0.85), at(1.15)],
      ...(last ? { dusk: [at(1.12), at(1.4)] as Window, light: [at(1.36), at(1.52)] as Window } : {}),
      notes,
    });
    t = end;
  });
  return { chapters, total: t };
}

export const TIMELINE = build();
export const TOTAL = TIMELINE.total;

export type Stage = "wireframe" | "render" | "notes";
export type Frame = {
  chapter: number; // -1 before the first chapter
  walk: number; // 0..1 along the chapter's walking frames (eased)
  fill: number; // how far the chapter's finished render has dissolved in
  wire: number;
  wireAlpha: number;
  grid: number;
  gridAlpha: number;
  dusk: number;
  lights: number;
  note: number; // the open Field Note, or -1
  pinned: boolean; // the chapter's reticles are showing
  stage: Stage;
};

export function frameAt(P: number): Frame {
  const chs = TIMELINE.chapters;
  if (P < chs[0].start) {
    return { chapter: -1, walk: 0, fill: 0, wire: 0, wireAlpha: 0, grid: span(P, [0.04, 0.5]), gridAlpha: 1, dusk: 0, lights: 0, note: -1, pinned: false, stage: "wireframe" };
  }
  let c = chs.findIndex((ch) => P < ch.end);
  if (c < 0) c = chs.length - 1;
  const ch = chs[c];
  const fill = span(P, ch.fill);
  const notesFrom = ch.notes.length ? ch.notes[0][0] : ch.end;
  let note = -1;
  if (P >= notesFrom) {
    note = ch.notes.findIndex(([a, b]) => P >= a && P < b);
    if (note < 0) note = ch.notes.length - 1;
  }
  return {
    chapter: c,
    walk: easeInOut(span(P, ch.travel)),
    fill,
    wire: span(P, ch.wire),
    wireAlpha: 1 - span(P, [ch.fill[0] + (ch.fill[1] - ch.fill[0]) * 0.25, ch.fill[1]]),
    grid: 1,
    gridAlpha: c === 0 ? 1 - fill : 0,
    dusk: ch.dusk ? span(P, ch.dusk) : 0,
    lights: ch.light ? span(P, ch.light) : 0,
    note,
    pinned: P >= notesFrom,
    stage: P < ch.fill[0] ? "wireframe" : P < notesFrom ? "render" : "notes",
  };
}

/** Scroll positions (in screens) used by the chapter index and by keyboard focus. */
export const chapterStart = (c: number) => TIMELINE.chapters[c].start;
export const chapterRead = (c: number) => TIMELINE.chapters[c].fill[1];
export const noteAt = (c: number, k: number) => (TIMELINE.chapters[c].notes[k][0] + TIMELINE.chapters[c].notes[k][1]) / 2;
