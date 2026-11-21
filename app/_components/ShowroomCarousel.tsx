"use client";

import Image from "next/image";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { ArrowRight, Chat, ChevronLeft, ChevronRight, Pause, Play } from "./icons";
import { useOpenStatus } from "./OpenStatus";
import { SHOWROOM, SHOWROOM_START } from "../_content/showroom";
import { ADDRESS_LINE, MAPS_DIRECTIONS_URL, TOWN } from "../_content/site";

gsap.registerPlugin(SplitText);

const COUNT = SHOWROOM.length;
const pad = (n: number) => String(n).padStart(2, "0");
const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

// Motion, from the approved system: the window opens over 900ms; words follow in steps; input waits 300ms.
const OPEN_FOR = 0.9;
const TEXT_OUT = 0.12;
const INPUT_LOCK = 300;
// Autoplay: each range stays this long, counted only while the visitor can see it and is not using it.
const AUTOPLAY_MS = 6500;

type Inset = { t: number; r: number; b: number; l: number };
const insetCss = (i: Inset) => `inset(${i.t}px ${i.r}px ${i.b}px ${i.l}px)`;

/**
 * The homepage's first section: the showroom, one range at a time, each photograph filling the
 * screen. Choosing a range opens its photograph as a window that grows out of its thumbnail until
 * it is the whole view, its edge drawn as a hairline on the way. The active range drives the
 * photograph, headline, description, both actions and the index. It moves on by itself every
 * few seconds, holding while the visitor points at it, uses it, or cannot see it; a button pauses it.
 */
export function ShowroomCarousel() {
  const [index, setIndex] = useState(SHOWROOM_START);
  const shown = useRef(SHOWROOM_START); // the range being shown or arriving
  const lockUntil = useRef(0);
  const root = useRef<HTMLElement>(null);
  const layers = useRef<(HTMLDivElement | null)[]>([]);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const aperture = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const headline = useRef<HTMLHeadingElement>(null);
  const split = useRef<SplitText | null>(null);
  const opening = useRef<gsap.core.Timeline | null>(null);
  const textIn = useRef<gsap.core.Timeline | null>(null);
  const firstPaint = useRef(true);
  const swap = useRef(0);
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const status = useOpenStatus();
  const [playing, setPlaying] = useState(true);
  const pointerIn = useRef(false);
  const focusIn = useRef(false);
  const inView = useRef(true);
  const progress = useRef<HTMLSpanElement | null>(null);

  const range = SHOWROOM[index];

  /** The new room opens out of its own thumbnail and grows to fill the screen; the old one recedes. */
  const openWindow = useCallback((from: number, to: number) => {
    opening.current?.progress(1).kill();
    const section = root.current;
    const incoming = layers.current[to];
    const outgoing = layers.current[from];
    const frame = aperture.current;
    if (!section || !incoming || !outgoing || !frame) return;

    layers.current.forEach((layer, i) => {
      if (layer && i !== to && i !== from) gsap.set(layer, { visibility: "hidden", zIndex: 0, clearProps: "clipPath" });
    });
    gsap.set(outgoing, { visibility: "visible", zIndex: 1 });
    gsap.set(incoming, { visibility: "visible", zIndex: 2 });
    const inImg = incoming.querySelector("img");
    const outImg = outgoing.querySelector("img");
    const outDim = outgoing.querySelector(".sr-dim");

    const done = () => {
      gsap.set(outgoing, { visibility: "hidden", zIndex: 0 });
      gsap.set([outImg, outDim, inImg], { clearProps: "transform,opacity" });
      gsap.set(incoming, { clearProps: "clipPath" });
      gsap.set(frame, { visibility: "hidden" });
    };
    const tl = gsap.timeline({ onComplete: done });
    opening.current = tl;

    if (reducedMotion()) {
      tl.fromTo(incoming, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: "power1.out", clearProps: "opacity" });
      return;
    }

    // Where the window starts: the thumbnail of the range being opened.
    const s = section.getBoundingClientRect();
    const t = tabs.current[to]?.querySelector(".sr-thumb")?.getBoundingClientRect();
    const start: Inset = t
      ? { t: t.top - s.top, r: s.right - t.right, b: s.bottom - t.bottom, l: t.left - s.left }
      : { t: s.height / 2, r: s.width / 2, b: s.height / 2, l: s.width / 2 };
    const win = { ...start };
    const draw = () => {
      incoming.style.clipPath = insetCss(win);
      frame.style.inset = `${win.t}px ${win.r}px ${win.b}px ${win.l}px`;
    };
    draw();
    gsap.set(frame, { visibility: "visible", opacity: 1 });

    tl.to(win, { t: 0, r: 0, b: 0, l: 0, duration: OPEN_FOR, ease: "power3.inOut", onUpdate: draw }, 0)
      // The line that drew the window gives way to the photograph as it reaches the edges.
      .to(frame, { opacity: 0, duration: 0.24, ease: "power1.in" }, OPEN_FOR - 0.3)
      // Stepping into the new room, it settles; the one behind falls back into shadow.
      .fromTo(inImg, { scale: 1.18 }, { scale: 1, duration: OPEN_FOR + 0.25, ease: "power3.out" }, 0)
      .to(outImg, { scale: 1.06, duration: OPEN_FOR, ease: "power2.inOut" }, 0)
      .to(outDim, { opacity: 0.55, duration: OPEN_FOR, ease: "power2.in" }, 0);
  }, []);

  const go = useCallback(
    (target: number, focusTab = false) => {
      const to = (target + COUNT) % COUNT;
      const from = shown.current;
      if (to === from) return;
      const now = performance.now();
      if (now < lockUntil.current) return;
      lockUntil.current = now + INPUT_LOCK;
      shown.current = to;
      if (focusTab) tabs.current[to]?.focus();

      // Put the headline back to plain text before React changes it.
      textIn.current?.kill();
      split.current?.revert();
      split.current = null;

      openWindow(from, to);
      clearTimeout(swap.current);
      const parts = panel.current ? Array.from(panel.current.children) : [];
      if (reducedMotion() || !parts.length) {
        setIndex(to);
        return;
      }
      // The words step out, then the new range's words replace them. The swap runs on the clock, not
      // on the tween, so a busy device cannot hold the old words on screen.
      gsap.to(parts, { opacity: 0, y: -8, duration: TEXT_OUT, ease: "power1.in", overwrite: true });
      swap.current = window.setTimeout(() => setIndex(to), TEXT_OUT * 1000);
    },
    [openWindow],
  );

  // The new range's words arrive in steps: headline lines, then description, then actions.
  useLayoutEffect(() => {
    if (firstPaint.current) {
      firstPaint.current = false;
      return;
    }
    const el = panel.current;
    if (!el) return;
    const [, desc, actions] = Array.from(el.children);
    gsap.killTweensOf(el.children);
    gsap.set(el.children, { opacity: 1, y: 0 });
    if (reducedMotion()) {
      gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.2, clearProps: "opacity" });
      return;
    }
    const lines = headline.current ? SplitText.create(headline.current, { type: "lines", mask: "lines" }) : null;
    split.current = lines;
    const tl = gsap.timeline({
      onComplete: () => {
        split.current?.revert();
        split.current = null;
      },
    });
    if (lines) tl.from(lines.lines, { y: 12, opacity: 0, duration: 0.5, stagger: 0.06, ease: "power3.out" }, 0);
    tl.from(desc, { y: 12, opacity: 0, duration: 0.45, ease: "power3.out" }, 0.16).from(actions, { y: 12, opacity: 0, duration: 0.45, ease: "power3.out" }, 0.24);
    textIn.current = tl;
  }, [index]);

  // Autoplay. Time counts only while the section is on screen, the tab is visible, the loader has
  // gone, and the visitor is neither pointing at nor focused inside it; a manual change restarts the
  // count (index is a dependency). With reduced motion it never advances on its own.
  useEffect(() => {
    const bar = () => progress.current;
    if (!playing) {
      bar()?.style.setProperty("transform", "scaleX(0)");
      return;
    }
    let raf = 0;
    let last = performance.now();
    let elapsed = 0;
    const tick = (now: number) => {
      const dt = Math.min(now - last, 100);
      last = now;
      const held =
        pointerIn.current ||
        focusIn.current ||
        !inView.current ||
        document.hidden ||
        document.documentElement.classList.contains("ll-on") ||
        reducedMotion();
      if (!held) elapsed += dt;
      bar()?.style.setProperty("transform", `scaleX(${Math.min(elapsed / AUTOPLAY_MS, 1)})`);
      if (elapsed >= AUTOPLAY_MS) {
        elapsed = 0;
        go(shown.current + 1);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, go, index]);

  // Off screen, the slideshow holds.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => (inView.current = entry.isIntersecting && entry.intersectionRatio >= 0.4), {
      threshold: [0, 0.4, 1],
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Links such as the footer's "#range-lighting" open that range and bring the showroom into view.
  useEffect(() => {
    const open = () => {
      const slug = location.hash.startsWith("#range-") ? location.hash.slice(7) : "";
      const i = SHOWROOM.findIndex((r) => r.slug === slug);
      if (i < 0) return;
      lockUntil.current = 0;
      go(i);
      root.current?.scrollIntoView({ behavior: reducedMotion() ? "auto" : "smooth", block: "start" });
    };
    open();
    window.addEventListener("hashchange", open);
    return () => window.removeEventListener("hashchange", open);
  }, [go]);

  // Leave plain text and no running tweens behind on unmount.
  useLayoutEffect(
    () => () => {
      clearTimeout(swap.current);
      textIn.current?.kill();
      opening.current?.kill();
      split.current?.revert();
    },
    [],
  );

  const onTabKey = (e: React.KeyboardEvent) => {
    const keys: Record<string, number> = { ArrowRight: shown.current + 1, ArrowLeft: shown.current - 1, Home: 0, End: COUNT - 1 };
    if (!(e.key in keys)) return;
    e.preventDefault();
    go(keys[e.key], true);
  };

  return (
    <section
      ref={root}
      id="ranges"
      aria-labelledby="sr-title"
      className="env-midnight relative isolate h-[calc(100svh-var(--header-h))] min-h-[38rem] touch-pan-y overflow-hidden"
      onPointerEnter={(e) => e.pointerType === "mouse" && (pointerIn.current = true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && (pointerIn.current = false)}
      onFocus={() => (focusIn.current = true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) focusIn.current = false;
      }}
      onPointerDown={(e) => (swipe.current = { x: e.clientX, y: e.clientY })}
      onPointerUp={(e) => {
        const start = swipe.current;
        swipe.current = null;
        if (!start) return;
        const dx = e.clientX - start.x;
        if (Math.abs(dx) > 56 && Math.abs(dx) > Math.abs(e.clientY - start.y) * 1.5) go(shown.current + (dx < 0 ? 1 : -1));
      }}
    >
      {/* The photographs, full bleed */}
      <div className="absolute inset-0 -z-10 select-none">
        {SHOWROOM.map((r, i) => (
          <div
            key={r.slug}
            ref={(el) => {
              layers.current[i] = el;
            }}
            className="sr-layer"
            data-active={i === SHOWROOM_START ? "true" : undefined}
            style={{ "--pos": r.photo.position, "--pos-m": r.photo.positionMobile } as React.CSSProperties}
          >
            <Image
              src={r.photo.src}
              alt={i === index ? r.photo.alt : ""}
              aria-hidden={i === index ? undefined : true}
              fill
              draggable={false}
              preload={i === SHOWROOM_START}
              loading={i === SHOWROOM_START ? undefined : "lazy"}
              sizes="100vw"
              className="object-cover"
              {...(i === SHOWROOM_START ? { "data-loader-reveal": "" } : {})}
            />
            <span className="sr-dim" aria-hidden="true" />
          </div>
        ))}
        <div className="sr-scrim" aria-hidden="true" />
        <div ref={aperture} className="sr-aperture" aria-hidden="true" />
      </div>

      {/* The words and controls, laid over the photograph */}
      <div className="mx-auto grid h-full max-w-[1600px] grid-cols-[minmax(0,1fr)_auto] grid-rows-[auto_1fr_auto_auto_auto] gap-x-4 gap-y-4 px-5 pb-[calc(56px+1.5rem)] pt-7 [grid-template-areas:'title_title'_'._.'_'count_count'_'tabs_tabs'_'panel_panel'] md:grid-cols-[minmax(0,1fr)_auto] md:grid-rows-[auto_1fr_auto_auto] md:gap-x-12 md:gap-y-6 md:px-10 md:pb-10 md:pt-10 md:[grid-template-areas:'title_count'_'._.'_'panel_tabs'_'visit_tabs'] xl:px-[clamp(3rem,5vw,6rem)]">
        <div className="[grid-area:title]">
          <h1 id="sr-title" className="t-display-2 max-w-[11ch]">
            The making of a space.
          </h1>
          <p className="t-lede mt-3 hidden max-w-[34ch] text-[var(--text)]/85 md:block">From the first line to the final light: six showroom ranges on Market Road, {TOWN}.</p>
        </div>

        {/* Where we are, and whose photograph this is */}
        <div className="flex items-baseline justify-end gap-3 whitespace-nowrap text-right [grid-area:count] md:block">
          <p className="order-2 font-[family-name:var(--font-manrope)] text-[clamp(1.5rem,1.2rem+1.9vw,3.25rem)] font-light leading-none tracking-[-0.03em] md:order-none" aria-hidden="true">
            {range.number}
            <span className="t-soft"> / {pad(COUNT)}</span>
          </p>
          <p className="t-tech text-[var(--text)]/85 md:mt-3">
            {range.photo.standIn ? "Illustrative photo" : `Photographed at Kenstar, ${TOWN}`}
          </p>
          <button
            type="button"
            className="k-icon-btn sr-play order-first md:hidden"
            aria-label={playing ? "Pause the slideshow" : "Play the slideshow"}
            onClick={() => setPlaying((p) => !p)}
          >
            {playing ? <Pause size={18} /> : <Play size={18} />}
          </button>
        </div>

        {/* The active range */}
        <div
          ref={panel}
          id="sr-panel"
          role="tabpanel"
          aria-labelledby={`sr-tab-${range.slug}`}
          aria-live={playing ? "off" : "polite"}
          className="max-w-[34rem] [grid-area:panel] md:self-end"
        >
          <h2 ref={headline} className="t-h1 max-w-[16ch]">
            {range.name}
          </h2>
          <p className="t-lede mt-3 text-[var(--text)]/85 md:mt-4">{range.description}</p>
          <div className="mt-5 flex flex-wrap gap-3 md:mt-7">
            <a href={range.primary.href} target="_blank" rel="noopener noreferrer" className="k-btn k-btn-primary">
              <Chat size={18} />
              {range.primary.label}
            </a>
            <a href={range.secondary.href} className="k-btn k-btn-secondary">
              {range.secondary.label}
              <ArrowRight size={18} className="nudge" />
            </a>
          </div>
        </div>

        {/* The showroom itself: open now, where, and how to get there */}
        <div className="t-small hidden gap-1 border-t border-[var(--line)] pt-4 [grid-area:visit] md:grid">
          <p className="flex items-center gap-2">
            <span className="status-dot" style={{ background: status?.open ? "var(--status-open)" : "var(--text-soft)" }} aria-hidden="true" />
            {status ? status.text : "Open daily: weekdays from 8am, weekends from 10am"}
          </p>
          <p className="t-soft">
            {ADDRESS_LINE}, {TOWN}.{" "}
            <a href={MAPS_DIRECTIONS_URL} target="_blank" rel="noopener noreferrer" className="k-link whitespace-nowrap font-semibold text-[var(--text)]">
              Get directions
            </a>
          </p>
        </div>

        {/* Index: one window per range, then previous/next with the count */}
        <div className="flex items-end justify-between gap-4 [grid-area:tabs] md:flex-col md:items-end md:justify-end md:self-end">
          <div role="tablist" aria-label="Showroom ranges" className="flex w-full justify-between md:-ml-0.5 md:w-auto md:justify-start md:gap-2" onKeyDown={onTabKey}>
            {SHOWROOM.map((r, i) => (
              <button
                key={r.slug}
                ref={(el) => {
                  tabs.current[i] = el;
                }}
                id={`sr-tab-${r.slug}`}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-controls="sr-panel"
                aria-label={`${r.number} ${r.name}`}
                tabIndex={i === index ? 0 : -1}
                onClick={() => go(i)}
                className="sr-tab"
              >
                <span className="sr-thumb">
                  <Image src={r.photo.src} alt="" fill sizes="56px" className="object-cover" style={{ objectPosition: r.photo.positionMobile }} />
                  {i === index && (
                    <span
                      className="sr-progress"
                      aria-hidden="true"
                      ref={(el) => {
                        progress.current = el;
                      }}
                    />
                  )}
                </span>
                <span className="t-tech">{r.number}</span>
              </button>
            ))}
          </div>
          {/* On phones the thumbnails and a swipe do this job; the arrows join from tablet width. */}
          <div className="hidden items-center gap-3 md:flex">
            <button type="button" className="k-icon-btn sr-play" aria-label={playing ? "Pause the slideshow" : "Play the slideshow"} onClick={() => setPlaying((p) => !p)}>
              {playing ? <Pause size={18} /> : <Play size={18} />}
            </button>
            <button type="button" className="k-icon-btn" aria-label="Previous range" onClick={() => go(shown.current - 1)}>
              <ChevronLeft size={20} />
            </button>
            <button type="button" className="k-icon-btn" aria-label="Next range" onClick={() => go(shown.current + 1)}>
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
