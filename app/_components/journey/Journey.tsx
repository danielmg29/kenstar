"use client";

import Image from "next/image";
import { useCallback, useLayoutEffect, useRef, useSyncExternalStore } from "react";
import { JOURNEY, JOURNEY_LINE, JOURNEY_TITLE, type FieldNote } from "../../_content/journey";
import { ArrowRight } from "../icons";
import { FRAMES, focusOf, paint, prefetch, stillOf, toStage, viewFor, whenLoaded, type View } from "./player";
import { TOTAL, chapterRead, chapterStart, frameAt, noteAt, type Frame, type Stage } from "./timeline";

/**
 * The making of a space: a first-person walk from the road to a finished, lit room, in six chapters.
 * Scroll is the camera. Each chapter walks in (pre-rendered frames), traces its new work as a line
 * drawing, dissolves to the finished render from the same camera, then holds while real Kenstar
 * photographs open as Field Notes pinned to the scene. With reduced motion, each chapter is a still
 * with its notes open.
 */
export function Journey() {
  const still = useSyncExternalStore(subscribeMotion, () => matchMedia(REDUCE).matches, () => false);
  return still ? <JourneyStills /> : <JourneyScroll />;
}

const REDUCE = "(prefers-reduced-motion: reduce)";
function subscribeMotion(cb: () => void) {
  const m = matchMedia(REDUCE);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
}

/** Notes that must open on one side so they do not cover what the chapter is about. */
const NOTE_SIDE: Record<string, 1 | -1> = { "06.2": 1 };

const STAGE_NAMES: Record<Stage | "intro", string> = { intro: "Setting out", wireframe: "Wireframe", render: "Environment", notes: "Evidence" };

// ---------------------------------------------------------------- shared pieces

function NoteCard({ note, focusAt, className = "" }: { note: FieldNote; focusAt?: number; className?: string }) {
  return (
    <article className={`jr-note ${className}`} data-note={note.id} data-focus-at={focusAt} aria-label={`Field note ${note.id}, ${note.range}`}>
      <div className="jr-note-body">
        <header>
          <span className="t-tech jr-note-id">Field note {note.id}</span>
          <span className="t-tech">{note.range}</span>
        </header>
        <div className="jr-note-ph">
          {note.photo ? (
            <Image src={note.photo.src} alt={note.photo.alt} fill sizes="(min-width: 768px) 300px, 112px" className="object-cover" style={{ objectPosition: note.photo.position }} />
          ) : (
            <p className="jr-note-empty t-tech">Photograph to come</p>
          )}
        </div>
        <div className="jr-note-tx">
          <p>{note.sentence}</p>
          {note.source && <p className="t-tech jr-note-src">{note.source}</p>}
          <a className="k-link jr-note-link" href={note.link.href} {...(note.link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
            {note.link.label}
          </a>
        </div>
      </div>
    </article>
  );
}

function Reticle() {
  return (
    <svg viewBox="0 0 14 14" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true">
      <circle cx="7" cy="7" r="3.5" />
      <path d="M7 0v2.5M7 11.5V14M0 7h2.5M11.5 7H14" />
    </svg>
  );
}

// ---------------------------------------------------------------- the walk

function JourneyScroll() {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const leader = useRef<SVGPathElement>(null);
  const goTo = useRef<(at: number, smooth?: boolean) => void>(() => {});

  useLayoutEffect(() => {
    const sec = section.current!, st = stage.current!, cv = canvas.current!, path = leader.current!;
    const ctx = cv.getContext("2d")!;
    const blocks = Array.from(st.querySelectorAll<HTMLElement>("[data-block]"));
    const pins = Array.from(st.querySelectorAll<HTMLElement>(".jr-pin"));
    const cards = Array.from(st.querySelectorAll<HTMLElement>(".jr-note"));
    const steps = Array.from(st.querySelectorAll<HTMLElement>(".jr-index a"));
    const stageName = st.querySelector<HTMLElement>(".jr-stage-name")!;
    const plate = st.querySelector<HTMLElement>(".jr-plate")!;
    const focus = JOURNEY.map((ch, i) => focusOf(i, ch.notes.map((n) => n.id)));

    let W = 0, H = 0, dpr = 1, headerH = 0;
    let target = 0, shown = -1, raf = 0, last = 0;
    let drawnKey = "", domKey = "", placedKey = "";
    let pending = false;
    let view: View = viewFor(1, 1, 0.5);

    const resize = () => {
      W = st.clientWidth;
      H = st.clientHeight;
      headerH = parseFloat(getComputedStyle(st).top) || 0;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      drawnKey = placedKey = "";
    };

    const measure = () => {
      const top = sec.getBoundingClientRect().top;
      return Math.min(TOTAL, Math.max(0, (headerH - top) / Math.max(1, H)));
    };

    goTo.current = (at, smooth = false) => {
      const y = sec.getBoundingClientRect().top + window.scrollY - headerH + at * H;
      window.scrollTo({ top: y, behavior: smooth ? "smooth" : "instant" });
    };

    /** Where the frame sits: on narrow screens the crop follows the chapter's notes, easing between stops. */
    const viewAt = (fr: Frame) => {
      const c = Math.max(0, fr.chapter);
      const f = c > 0 && fr.walk < 1 ? focus[c - 1] + (focus[c] - focus[c - 1]) * fr.walk : focus[c];
      return viewFor(W, H, f);
    };

    const render = (fr: Frame) => {
      view = viewAt(fr);
      const key = `${fr.chapter}|${fr.walk.toFixed(4)}|${fr.wire.toFixed(4)}|${fr.wireAlpha.toFixed(3)}|${fr.fill.toFixed(4)}|${fr.grid.toFixed(3)}|${fr.gridAlpha.toFixed(3)}|${fr.dusk.toFixed(4)}|${fr.lights.toFixed(4)}|${W}x${H}`;
      if (key === drawnKey && !pending) return;
      drawnKey = key;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingQuality = "high";
      pending = !paint(ctx, fr, view, W, H);
      // Frames stream in chapter by chapter, and only once the journey is near.
      if (sec.getBoundingClientRect().top < window.innerHeight * 2) prefetch(Math.max(0, fr.chapter));
    };

    const syncDom = (fr: Frame) => {
      const k = `${fr.chapter}|${fr.stage}|${fr.note}|${fr.pinned}|${fr.dusk > 0.5}`;
      if (k === domKey) return;
      domKey = k;
      st.dataset.chapter = String(fr.chapter);
      st.dataset.dusk = String(fr.dusk > 0.5);
      st.dataset.noteOpen = String(fr.note >= 0);
      stageName.textContent = fr.chapter < 0 ? STAGE_NAMES.intro : STAGE_NAMES[fr.stage];
      blocks.forEach((b) => (b.dataset.active = String(Number(b.dataset.block) === fr.chapter)));
      steps.forEach((s, i) => (i === fr.chapter ? s.setAttribute("aria-current", "step") : s.removeAttribute("aria-current")));
      const open = fr.note >= 0 ? JOURNEY[fr.chapter].notes[fr.note].id : "";
      cards.forEach((c) => (c.dataset.active = String(c.dataset.note === open)));
      pins.forEach((p) => {
        const mine = Number(p.dataset.chapter) === fr.chapter && fr.pinned;
        p.dataset.state = !mine ? "off" : p.dataset.note === open ? "on" : "rest";
      });
      placedKey = "";
    };

    /** Pins the chapter's reticles to the scene and lays out the open note and its leader. */
    const place = (fr: Frame) => {
      if (fr.chapter < 0 || !fr.pinned) {
        path.style.visibility = "hidden";
        return;
      }
      const k = `${view.ox.toFixed(1)}|${view.oy.toFixed(1)}|${view.s.toFixed(1)}|${fr.note}`;
      if (k === placedKey) return;
      placedKey = k;
      const notes = JOURNEY[fr.chapter].notes;
      const pts: Record<string, [number, number] | null> = {};
      for (const n of notes) pts[n.id] = FRAMES.anchors[n.id] ? toStage(view, FRAMES.anchors[n.id]) : null;
      for (const p of pins) {
        if (p.dataset.state === "off") continue;
        const pt = pts[p.dataset.note!];
        if (!pt) continue;
        p.style.transform = `translate(${pt[0].toFixed(1)}px, ${pt[1].toFixed(1)}px)`;
      }
      const open = fr.note >= 0 ? notes[fr.note] : null;
      const card = open ? cards.find((c) => c.dataset.note === open.id) : null;
      const a = open ? pts[open.id] : null;
      if (!card || !a || W < 1280) {
        path.style.visibility = "hidden";
        return;
      }
      // The note stands beside its subject, never on it: level with the reticle, on the side with
      // room, clear of the title block. The leader rises (or falls) at 45° and then runs level.
      const CW = card.offsetWidth, CH = card.offsetHeight, M = 24, TOP = 56, RUN = 56;
      const pr = plate.getBoundingClientRect(), sr = st.getBoundingClientRect();
      const plateBox = { t: pr.top - sr.top, r: pr.right - sr.left };
      const clampTop = (t: number) => Math.min(Math.max(t, TOP), H - CH - M);
      let chosen: { x: number; y: number; sx: number; knee: number; ay: number } | null = null;
      const attachAt = (top: number) => Math.min(Math.max(a[1] - 44, top + 22), top + CH - 22);
      const prefer = NOTE_SIDE[open!.id] ?? (a[0] < W * 0.56 ? 1 : -1);
      for (const sx of [prefer, -prefer]) {
        let top = clampTop(a[1] - CH * 0.45);
        let ay = attachAt(top);
        let x = sx > 0 ? a[0] + Math.abs(ay - a[1]) + RUN : a[0] - Math.abs(ay - a[1]) - RUN - CW;
        const hitsPlate = () => x < plateBox.r + 16 && top + CH > plateBox.t - 16;
        if (hitsPlate()) {
          if (sx > 0) {
            // Slide clear of the title block; the level run of the leader grows to meet it.
            x = plateBox.r + 16;
          } else if (plateBox.t - CH - 16 >= TOP) {
            top = plateBox.t - CH - 16;
            ay = attachAt(top);
            x = a[0] - Math.abs(ay - a[1]) - RUN - CW;
          }
        }
        if (x < M || x + CW > W - M || hitsPlate()) continue;
        chosen = { x, y: top, sx, knee: a[0] + sx * Math.abs(ay - a[1]), ay };
        break;
      }
      if (!chosen) {
        // Tight screens: keep clear of the title block first, then of the reticle, with a shorter leader.
        const top = clampTop(a[1] - CH * 0.45);
        const ay = attachAt(top);
        const minX = top + CH > plateBox.t - 16 ? plateBox.r + 16 : M;
        const right = Math.min(Math.max(a[0] + 24, minX), W - M - CW);
        const left = Math.max(Math.min(a[0] - 24 - CW, W - M - CW), minX);
        const sx = right >= a[0] + 12 ? 1 : left + CW <= a[0] - 12 ? -1 : 1;
        const x = sx > 0 ? right : left;
        const dist = Math.abs((sx > 0 ? x : x + CW) - a[0]);
        chosen = { x, y: top, sx, knee: a[0] + sx * Math.max(0, Math.min(Math.abs(ay - a[1]), dist - 12)), ay };
      }
      card.style.transform = `translate(${chosen.x.toFixed(1)}px, ${chosen.y.toFixed(1)}px)`;
      const ay = chosen.ay;
      const edge = chosen.sx > 0 ? chosen.x : chosen.x + CW;
      path.setAttribute("d", `M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${chosen.knee.toFixed(1)} ${ay.toFixed(1)}L${edge.toFixed(1)} ${ay.toFixed(1)}`);
      path.style.visibility = "visible";
      const len = path.getTotalLength();
      path.style.strokeDasharray = String(len);
      path.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }], { duration: 240, easing: "cubic-bezier(0.16, 1, 0.3, 1)", fill: "both" });
    };

    const draw = (P: number) => {
      const fr = frameAt(P);
      render(fr);
      syncDom(fr);
      place(fr);
    };

    const tick = (t: number) => {
      raf = 0;
      const dt = last ? Math.min(64, t - last) : 16;
      last = t;
      if (shown < 0 || Math.abs(target - shown) > 1.5 || Math.abs(target - shown) < 0.0006) shown = target;
      else shown += (target - shown) * (1 - Math.exp(-dt / 70));
      draw(shown);
      if (shown !== target) raf = requestAnimationFrame(tick);
      else last = 0;
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const onScroll = () => {
      const r = sec.getBoundingClientRect();
      if (r.bottom < -200 || r.top > window.innerHeight * 2) return;
      target = measure();
      kick();
    };

    // A frame that was still loading is painted as soon as it arrives.
    whenLoaded(() => {
      if (!pending) return;
      drawnKey = "";
      kick();
    });
    resize();
    target = measure();
    shown = -1;
    kick();
    const ro = new ResizeObserver(() => {
      resize();
      target = measure();
      shown = target;
      drawnKey = "";
      kick();
    });
    ro.observe(st);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Keyboard focus walks the camera: focusing a hidden chapter or note scrolls to where it opens.
  const onFocus = useCallback((e: React.FocusEvent) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>("[data-focus-at]");
    if (!el || el.dataset.active === "true") return;
    goTo.current(Number(el.dataset.focusAt));
  }, []);

  return (
    <section ref={section} id="journey" aria-labelledby="journey-title" className="jr" style={{ "--jr-screens": TOTAL } as React.CSSProperties}>
      {JOURNEY.map((ch, i) => (
        <span key={ch.slug} id={`journey-${ch.slug}`} className="jr-anchor" style={{ top: `calc(var(--jr-h) * ${(chapterStart(i) + 0.01).toFixed(3)})` }} />
      ))}
      <div ref={stage} className="jr-stage" data-chapter="-1" onFocus={onFocus}>
        <canvas ref={canvas} className="jr-canvas" aria-hidden="true" />
        <p className="jr-label t-tech" aria-hidden="true">
          Visualisation
        </p>
        <svg className="jr-leader" aria-hidden="true">
          <path ref={leader} />
        </svg>
        {JOURNEY.flatMap((ch, c) =>
          ch.notes.map((n, k) => (
            <button
              key={n.id}
              type="button"
              tabIndex={-1}
              aria-hidden="true"
              className="jr-pin"
              data-note={n.id}
              data-chapter={c}
              data-state="off"
              onClick={() => goTo.current(noteAt(c, k), true)}
            >
              <span className="jr-reticle">
                <Reticle />
              </span>
              <span className="jr-pin-n">{k + 1}</span>
            </button>
          )),
        )}

        <div className="jr-plate" aria-hidden="true" />
        <nav className="jr-index" aria-label="Chapters of the journey">
          <ol>
            {JOURNEY.map((ch) => (
              <li key={ch.slug}>
                <a href={`#journey-${ch.slug}`} title={ch.name}>
                  <span aria-hidden="true">{ch.number}</span>
                  <span className="sr-only">
                    Chapter {Number(ch.number)}: {ch.name}
                  </span>
                </a>
              </li>
            ))}
          </ol>
          <p className="jr-stage-name t-tech" aria-hidden="true">
            {STAGE_NAMES.intro}
          </p>
        </nav>

        <div className="jr-block jr-intro" data-block="-1" data-active="true">
          <h2 id="journey-title" className="t-display-2">
            {JOURNEY_TITLE}
          </h2>
          <p className="jr-line">{JOURNEY_LINE}</p>
        </div>
        {JOURNEY.map((ch, i) => (
          <div key={ch.slug} className="contents">
            <div className="jr-block jr-chapter" data-block={i} data-active="false" data-focus-at={chapterRead(i)}>
              <h3 className="t-h1">{ch.name}</h3>
              <p className="jr-subject">{ch.subject}</p>
              <p className="jr-text">{ch.text}</p>
              <a className="jr-action" href={ch.action.href} {...(ch.action.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                {ch.action.label}
                <ArrowRight size={16} />
              </a>
            </div>
            {ch.notes.map((n, k) => (
              <NoteCard key={n.id} note={n} focusAt={noteAt(i, k)} className="jr-note-live" />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- reduced motion: stills

function StillFrame({ chapter, label }: { chapter: number; label: string }) {
  return (
    <div className="jr-still-frame">
      <Image src={stillOf(chapter)} alt={label} fill sizes="(min-width: 1024px) 58vw, 100vw" className="object-cover" />
      {JOURNEY[chapter].notes.map((n, k) => {
        const a = FRAMES.anchors[n.id];
        return a ? (
          <span key={n.id} className="jr-pin" data-state="on" aria-hidden="true" style={{ left: `${a[0] * 100}%`, top: `${a[1] * 100}%` }}>
            <span className="jr-pin-n">{k + 1}</span>
          </span>
        ) : null;
      })}
      <p className="jr-label t-tech" aria-hidden="true">
        Visualisation
      </p>
    </div>
  );
}

function JourneyStills() {
  return (
    <section id="journey" aria-labelledby="journey-title" className="jr-still">
      <div className="jr-still-head">
        <h2 id="journey-title" className="t-display-2">
          {JOURNEY_TITLE}
        </h2>
        <p className="jr-line">{JOURNEY_LINE}</p>
      </div>
      <ol className="jr-still-list">
        {JOURNEY.map((ch, i) => (
          <li key={ch.slug} id={`journey-${ch.slug}`} className="jr-still-ch">
            <StillFrame chapter={i} label={`Visualisation of chapter ${Number(ch.number)}, ${ch.name}: ${ch.subject.toLowerCase()}`} />
            <div className="jr-still-text">
              <h3 className="t-h1">{ch.name}</h3>
              <p className="jr-subject">{ch.subject}</p>
              <p className="jr-text">{ch.text}</p>
              <a className="jr-action" href={ch.action.href} {...(ch.action.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                {ch.action.label}
                <ArrowRight size={16} />
              </a>
            </div>
            <div className="jr-still-notes">
              {ch.notes.map((n) => (
                <NoteCard key={n.id} note={n} />
              ))}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
