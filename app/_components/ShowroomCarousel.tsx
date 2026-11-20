"use client";

import Image from "next/image";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { ArrowRight, Chat, ChevronLeft, ChevronRight } from "./icons";
import { useOpenStatus } from "./OpenStatus";
import { SHOWROOM, SHOWROOM_START } from "../_content/showroom";
import { ADDRESS_LINE, MAPS_DIRECTIONS_URL, TOWN } from "../_content/site";

gsap.registerPlugin(SplitText);

const COUNT = SHOWROOM.length;
const pad = (n: number) => String(n).padStart(2, "0");
const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

/** The logo's house (walls under a 45-degree roof), scaled by `s` about a point low in the doorway. */
function house(s: number, cx = 50, cy = 64) {
  const p = (x: number, y: number) => `${(cx + (x - cx) * s).toFixed(3)}% ${(cy + (y - cy) * s).toFixed(3)}%`;
  return `polygon(${p(50, 0)}, ${p(100, 37.5)}, ${p(100, 100)}, ${p(0, 100)}, ${p(0, 37.5)})`;
}

// Motion, from the approved system: the door opens over 900ms; text follows in steps; input waits 300ms.
const OPEN_FOR = 0.9;
const TEXT_OUT = 0.12;
const INPUT_LOCK = 300;

/**
 * The homepage's first section: six showroom ranges seen through house-shaped portals.
 * One range is active at a time and drives the photograph, headline, description, both actions
 * and the index. Moving between ranges walks through a doorway into the next room. Manual only.
 */
export function ShowroomCarousel() {
  const [index, setIndex] = useState(SHOWROOM_START);
  const shown = useRef(SHOWROOM_START); // the range being shown or arriving
  const lockUntil = useRef(0);
  const layers = useRef<(HTMLDivElement | null)[]>([]);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const panel = useRef<HTMLDivElement>(null);
  const headline = useRef<HTMLHeadingElement>(null);
  const split = useRef<SplitText | null>(null);
  const doorway = useRef<gsap.core.Timeline | null>(null);
  const textIn = useRef<gsap.core.Timeline | null>(null);
  const firstPaint = useRef(true);
  const swap = useRef(0);
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const status = useOpenStatus();

  const range = SHOWROOM[index];

  /** Walk from one room into the next: the new photograph opens out of a doorway in the old one. */
  const openDoor = useCallback((from: number, to: number) => {
    doorway.current?.progress(1).kill();
    const incoming = layers.current[to];
    const outgoing = layers.current[from];
    if (!incoming || !outgoing) return;
    layers.current.forEach((layer, i) => {
      if (layer && i !== to && i !== from) gsap.set(layer, { visibility: "hidden", zIndex: 0, clearProps: "clipPath" });
    });
    gsap.set(outgoing, { visibility: "visible", zIndex: 1 });
    gsap.set(incoming, { visibility: "visible", zIndex: 2 });
    const inImg = incoming.querySelector("img");
    const outImg = outgoing.querySelector("img");
    const outDim = outgoing.querySelector(".sr-dim");

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set(outgoing, { visibility: "hidden", zIndex: 0 });
        gsap.set([outImg, outDim, inImg], { clearProps: "transform,opacity" });
        gsap.set(incoming, { clearProps: "clipPath" });
      },
    });
    if (reducedMotion()) {
      tl.fromTo(incoming, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: "power1.out", clearProps: "opacity" });
    } else {
      const door = { s: 0.12 };
      tl.fromTo(
        door,
        { s: 0.12 },
        { s: 1, duration: OPEN_FOR, ease: "power2.inOut", onUpdate: () => void (incoming.style.clipPath = house(door.s)) },
        0,
      )
        // The room you are entering settles as you step in; the one you leave falls back into shadow.
        .fromTo(inImg, { scale: 1.14 }, { scale: 1, duration: OPEN_FOR + 0.2, ease: "power3.out" }, 0)
        .to(outImg, { scale: 1.08, duration: OPEN_FOR, ease: "power2.inOut" }, 0)
        .to(outDim, { opacity: 0.5, duration: OPEN_FOR, ease: "power2.in" }, 0);
    }
    doorway.current = tl;
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

      openDoor(from, to);
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
    [openDoor],
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

  // Keep the plain headline on unmount.
  useLayoutEffect(
    () => () => {
      clearTimeout(swap.current);
      textIn.current?.kill();
      doorway.current?.kill();
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
    <section id="ranges" aria-labelledby="sr-title" className="env-midnight relative overflow-x-clip">
      <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-y-8 px-5 pb-14 pt-9 [grid-template-areas:'title'_'portal'_'tabs'_'panel'_'visit'] md:grid-cols-[minmax(0,1fr)_auto] md:grid-rows-[auto_1fr_auto_auto] md:gap-x-12 md:gap-y-7 md:px-10 md:py-12 md:[grid-template-areas:'title_portal'_'panel_portal'_'tabs_portal'_'visit_portal'] lg:min-h-[calc(100svh-var(--header-h))] xl:gap-x-24 xl:px-[clamp(3rem,5vw,6rem)]">
        <div className="[grid-area:title]">
          <h1 id="sr-title" className="t-display-2 max-w-[11ch]">
            The making of a space.
          </h1>
          <p className="t-lede t-soft mt-4 max-w-[36ch]">From the first line to the final light: six showroom ranges on Market Road, {TOWN}.</p>
        </div>

        {/* The active range */}
        <div
          ref={panel}
          id="sr-panel"
          role="tabpanel"
          aria-labelledby={`sr-tab-${range.slug}`}
          aria-live="polite"
          className="self-end [grid-area:panel] md:pt-6"
        >
          <h2 ref={headline} className="t-h1 max-w-[16ch]">
            {range.name}
          </h2>
          <p className="t-lede t-soft mt-4">{range.description}</p>
          <div className="mt-7 flex flex-wrap gap-3">
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

        {/* Index: one small portal per range, then previous/next with the count */}
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4 border-t border-[var(--line)] pt-5 [grid-area:tabs]">
          <div role="tablist" aria-label="Showroom ranges" className="-ml-0.5 flex gap-1 sm:gap-2 md:gap-1 lg:gap-2" onKeyDown={onTabKey}>
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
                <span className="sr-thumb sr-house">
                  <Image src={r.photo.src} alt="" fill sizes="56px" className="object-cover" style={{ objectPosition: r.photo.position }} />
                </span>
                <span className="t-tech">{r.number}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button type="button" className="k-icon-btn" aria-label="Previous range" onClick={() => go(shown.current - 1)}>
              <ChevronLeft size={20} />
            </button>
            <p className="t-tech min-w-[4.6em] text-center" aria-hidden="true">
              <span className="text-[var(--text)]">{range.number}</span> / {pad(COUNT)}
            </p>
            <button type="button" className="k-icon-btn" aria-label="Next range" onClick={() => go(shown.current + 1)}>
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* The showroom itself: open now, where, and how to get there */}
        <div className="t-small t-soft grid gap-1 [grid-area:visit]">
          <p className="flex items-center gap-2 text-[var(--text)]">
            <span className="status-dot" style={{ background: status?.open ? "var(--status-open)" : "var(--text-soft)" }} aria-hidden="true" />
            {status ? status.text : "Open daily: weekdays from 8am, weekends from 10am"}
          </p>
          <p>
            {ADDRESS_LINE}, {TOWN}.{" "}
            <a href={MAPS_DIRECTIONS_URL} target="_blank" rel="noopener noreferrer" className="k-link whitespace-nowrap font-semibold text-[var(--text)]">
              Get directions
            </a>
          </p>
        </div>

        {/* The portal */}
        <figure className="m-0 justify-self-center [grid-area:portal] md:self-start md:justify-self-end md:pt-2">
          <div
            className="sr-portal touch-pan-y select-none"
            onPointerDown={(e) => (swipe.current = { x: e.clientX, y: e.clientY })}
            onPointerUp={(e) => {
              const start = swipe.current;
              swipe.current = null;
              if (!start) return;
              const dx = e.clientX - start.x;
              if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(e.clientY - start.y)) go(shown.current + (dx < 0 ? 1 : -1));
            }}
          >
            <div className="sr-house absolute inset-0">
            {SHOWROOM.map((r, i) => (
              <div
                key={r.slug}
                ref={(el) => {
                  layers.current[i] = el;
                }}
                className="sr-layer"
                data-active={i === SHOWROOM_START ? "true" : undefined}
              >
                <Image
                  src={r.photo.src}
                  alt={i === index ? r.photo.alt : ""}
                  aria-hidden={i === index ? undefined : true}
                  fill
                  draggable={false}
                  preload={i === SHOWROOM_START}
                  loading={i === SHOWROOM_START ? undefined : "lazy"}
                  sizes="(min-width: 768px) 34rem, 92vw"
                  className="object-cover"
                  style={{ objectPosition: r.photo.position }}
                  {...(i === SHOWROOM_START ? { "data-loader-reveal": "" } : {})}
                />
                <span className="sr-dim" aria-hidden="true" />
              </div>
            ))}
            </div>
            {/* Architrave: the opening drawn 8 units outside itself, as on an elevation */}
            <svg
              className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
              viewBox="0 0 300 400"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path d="M-8 400 L-8 146.69 L150 -11.31 L308 146.69 L308 400" fill="none" stroke="var(--line-strong)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
            </svg>
          </div>
          <figcaption className="t-tech t-soft mt-4 flex justify-between gap-4">
            <span>
              {range.number} {range.name}
            </span>
            <span>{range.photo.standIn ? "Illustrative photo" : `Photographed at Kenstar, ${TOWN}`}</span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
