"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import { EMBU, LETTERS, PANES, STAR } from "../brand";
import { EyeDirector, planOpening } from "./eyes";

// ---------- Geometry (lockup units, viewBox 0 0 880 280) ----------
const STAR_BOX = { x: 576, y: 46.4, w: 144, h: 132.8 };
const STAR_CENTRE = { x: 648, y: 112.8 };
// Scale origin for the opening: high in the star so the house notch leaves frame downwards.
const ORIGIN = { fx: 0.5, fy: 0.3 };
const STAR_MASK = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='${STAR_BOX.x} ${STAR_BOX.y} ${STAR_BOX.w} ${STAR_BOX.h}'><path d='${STAR}'/></svg>`,
)}")`;

// The resting frame: the star centred, filling 42% of the viewport's short side. The SVG fills the
// screen with `meet`, so this square viewBox needs no JavaScript and is ready before hydration.
const END_SIZE = STAR_BOX.h / 0.42;
const END_VIEWBOX = [STAR_CENTRE.x - END_SIZE / 2, STAR_CENTRE.y - END_SIZE / 2, END_SIZE, END_SIZE].map((n) => n.toFixed(2)).join(" ");

/** The intro's opening frame: the whole lockup, min(84vw, 760px) wide, centred. */
function startViewBox() {
  const short = Math.min(innerWidth, innerHeight);
  const size = (880 * short) / Math.min(0.84 * innerWidth, 760);
  return [440 - size / 2, 140 - size / 2, size, size].map((n) => n.toFixed(2)).join(" ");
}

// Construction geometry, taken from the lockup's own coordinates.
const GUIDES = {
  datums: ["M40 76H840", "M40 172H840"], // cap line and baseline
  stems: [72, 180.8, 276.8, 390.4, 492.8, 723.2].map((x) => `M${x} 62V186`), // left edges of K E N S T R
  chamfers: ["M418 67.6L382 103.6", "M781.2 67.6L818 104.4"], // the 45-degree cuts of S and R, extended
  star: ["M648 30V196", "M566 99.2H730"], // star axis; line through the side tips
  roof: ["M606.4 157.6L676 88", "M689.6 157.6L620 88"], // the 45-degree roof, crossing at the ridge
  window: ["M648 140V165.6", "M635.2 152.8H660.8"], // mullions
};
const STAR_CIRCLE = { cx: 648, cy: 121.9, r: 75.5 }; // through the top tip and both side tips
const WINDOW = { x: 639.2, y: 144, s: 17.6 };

// ---------- Timing (seconds) ----------
// The eyes wake as the camera arrives (it lands at 1.75s).
const T = { draw: 0.3, fill: 0.95, resolve: 1.05, zoom: 1.15, zoomFor: 0.6, eyes: 1.45, openFor: 0.6, groundFor: 0.25 };
const REVEAL_WAIT = 1200; // longest wait for the page's first image, in ms
const OPENING_BUDGET = { intro: 3000, loader: 1500 }; // wall-clock ms the eyes' opening may take
const HARD_CAP = { intro: 7000, loader: 8000 }; // the page is uncovered after this, whatever happens

type Mode = "intro" | "loader";
type Showing = { finish: () => void; abort: () => void };

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/** Resolves when the page's first image can be shown, or after REVEAL_WAIT. */
function revealReady() {
  const img = document.querySelector<HTMLImageElement>("[data-loader-reveal]");
  const decoded = img?.decode ? img.decode().catch(() => undefined) : Promise.resolve();
  return Promise.race([decoded, wait(REVEAL_WAIT)]);
}

const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * One showing of the loader. In intro mode the logo is constructed and the camera moves to the
 * star; in loader mode the star is already there. Either way the eyes perform until both their
 * opening is done and the page is ready, then the star opens onto the page.
 */
function runShowing(el: HTMLDivElement, mode: Mode, pageReady: Promise<unknown>, fadeIn: boolean, onDone: () => void): Showing {
  const html = document.documentElement;
  const q = gsap.utils.selector(el);
  const ground = el.querySelector<HTMLElement>(".ll-ground")!;
  const svg = el.querySelector<SVGSVGElement>(".ll-svg")!;
  const starEl = el.querySelector<SVGPathElement>(".ll-star")!;
  const [eyeL, eyeR] = Array.from(el.querySelectorAll<SVGPathElement>(".ll-eye"));
  const skipButton = el.querySelector<HTMLButtonElement>(".ll-skip") ?? undefined;

  html.dataset.ll = mode;
  html.classList.add("ll-on", "ll-running");

  // While it shows, the page underneath is out of reach. The overlay takes the clicks, scrolling is
  // off, and focus is held inside the overlay. (The page itself is left untouched: it may still be
  // hydrating, and React must find it exactly as the server rendered it.)
  const prevOverflow = html.style.overflow;
  html.style.overflow = "hidden";
  const focusHome = () => (mode === "intro" && skipButton ? skipButton : el);
  const holdFocus = (e: FocusEvent) => {
    if (!el.contains(e.target as Node)) focusHome().focus({ preventScroll: true });
  };
  document.addEventListener("focusin", holdFocus);
  focusHome().focus({ preventScroll: true });

  const director = new EyeDirector(eyeL, eyeR);
  // Built paused: it starts on the first free frame (below), after the page has finished its own
  // setup, so that setup cannot eat the opening of the animation.
  const tl = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } });
  let begin!: () => void;
  const started = new Promise<void>((r) => (begin = r));
  let openTl: gsap.core.Timeline | null = null;
  let done = false;
  let timeout = 0;

  const restore = () => {
    tl.kill();
    openTl?.kill();
    director.reset();
    clearTimeout(timeout);
    gsap.ticker.lagSmoothing(500, 33); // GSAP's default, for the page's own animations
    html.style.overflow = prevOverflow;
    document.removeEventListener("focusin", holdFocus);
    if (el.contains(document.activeElement)) (document.activeElement as HTMLElement).blur();
    document.removeEventListener("keydown", onKey);
    skipButton?.removeEventListener("click", finish);
    // Hand the visuals back to CSS so the next showing starts clean.
    gsap.set(q(".ll-draw, .ll-guide, .ll-guides, .ll-skip, .ll-ground"), { clearProps: "all" });
    svg.setAttribute("viewBox", END_VIEWBOX);
  };

  function finish() {
    if (done) return;
    done = true;
    restore();
    html.classList.remove("ll-on", "ll-running");
    onDone();
  }

  /** Stops without uncovering the page, so the same showing can be started again (development remounts). */
  function abort() {
    if (done) return;
    done = true;
    restore();
  }

  const onKey = (e: KeyboardEvent) => e.key === "Escape" && finish();
  document.addEventListener("keydown", onKey);
  skipButton?.addEventListener("click", finish);
  timeout = window.setTimeout(finish, HARD_CAP[mode]);

  // ----- The star opens -----
  const hole = { s: 0 };
  const placeHole = () => {
    const r = starEl.getBoundingClientRect();
    const w = r.width * hole.s;
    const h = r.height * hole.s;
    const ox = r.left + r.width * ORIGIN.fx;
    const oy = r.top + r.height * ORIGIN.fy;
    ground.style.setProperty("--mw", `${w}px`);
    ground.style.setProperty("--mh", `${h}px`);
    ground.style.setProperty("--mx", `${ox - w * ORIGIN.fx}px`);
    ground.style.setProperty("--my", `${oy - h * ORIGIN.fy}px`);
  };
  // The mask is attached only now: a masked full-screen layer repaints every frame it exists.
  const attachMask = () => {
    const s = ground.style;
    for (const p of ["-webkit-mask", "mask"]) {
      s.setProperty(`${p}-image`, `${STAR_MASK}, linear-gradient(#000, #000)`);
      s.setProperty(`${p}-repeat`, "no-repeat");
      s.setProperty(`${p}-size`, "var(--mw, 0px) var(--mh, 0px), 100% 100%");
      s.setProperty(`${p}-position`, "var(--mx, 0px) var(--my, 0px), 0 0");
    }
    s.setProperty("-webkit-mask-composite", "xor");
    s.setProperty("mask-composite", "exclude");
  };
  const open = async () => {
    if (done) return;
    await director.stop();
    if (done) return;
    hole.s = 1;
    placeHole();
    attachMask();
    openTl = gsap.timeline({ onComplete: finish });
    openTl
      .to(starEl, { fillOpacity: 0, strokeOpacity: 0, duration: 0.12 }, 0)
      .to(q(".ll-pane"), { opacity: 0, duration: 0.12 }, 0)
      .to(hole, { s: 16, duration: T.openFor, ease: "expo.in", onUpdate: placeHole }, 0.02)
      .to(ground, { opacity: 0, duration: T.groundFor, ease: "power1.in" }, T.openFor - T.groundFor)
      .to(q(".ll-skip"), { opacity: 0, duration: 0.2 }, T.openFor - T.groundFor);
  };

  // ----- The eyes, and the wait -----
  let openingDone!: () => void;
  const opening = new Promise<void>((r) => (openingDone = r));
  const startEyes = () => director.play(planOpening(mode), openingDone);
  // The star opens once the eyes have performed their opening (or its time is up) and the page is ready.
  const budget = started.then(() => wait(OPENING_BUDGET[mode]));
  Promise.all([Promise.race([opening, budget]), pageReady]).then(open);

  // ----- Entrance -----
  if (mode === "intro") {
    svg.setAttribute("viewBox", startViewBox());
    // 1. Construction: datums, column lines and chamfers, then the star's own geometry.
    tl.to(q(".g-datum"), { strokeDashoffset: 0, duration: 0.45, stagger: 0.06, ease: "power2.inOut" }, 0)
      .to(q(".g-stem, .g-chamfer"), { strokeDashoffset: 0, duration: 0.35, stagger: 0.03, ease: "power2.out" }, 0.08)
      .to(q(".g-star"), { strokeDashoffset: 0, duration: 0.5, stagger: 0.05, ease: "power2.inOut" }, 0.12)
      .to(q(".g-roof, .g-window"), { strokeDashoffset: 0, duration: 0.36, stagger: 0.04, ease: "power2.out" }, 0.3)
      // 2. The lockup is traced over its construction, then filled.
      .to(q(".ll-draw"), { strokeDashoffset: 0, duration: 0.6, stagger: 0.03, ease: "power2.inOut" }, T.draw)
      .to(q(".ll-draw:not(.ll-star)"), { fillOpacity: 1, duration: 0.32 }, T.fill)
      .to(starEl, { fillOpacity: 1, duration: 0.32 }, T.fill + 0.05)
      // 3. The construction resolves away, leaving the finished identity.
      .to(q(".ll-guides"), { opacity: 0, duration: 0.35, ease: "power1.out" }, T.resolve)
      // 4. The camera moves to the star.
      .to(svg, { attr: { viewBox: END_VIEWBOX }, duration: T.zoomFor, ease: "expo.inOut" }, T.zoom)
      // 5. The eyes wake as the camera arrives.
      .call(startEyes, [], T.eyes);
  } else {
    if (fadeIn) tl.fromTo(ground, { opacity: 0 }, { opacity: 1, duration: 0.16, ease: "power1.out" }, 0);
    tl.call(startEyes, [], fadeIn ? 0.12 : 0.05);
  }

  // Start on the second frame from now, once the page's own effects (which measure layout) have run.
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      if (done) return;
      // While showing, a frame under a second counts in full, so a slow device does not stretch the
      // loader out; a one-off freeze longer than that costs only a quarter second of animation.
      gsap.ticker.lagSmoothing(1000, 250);
      tl.play();
      begin();
    }),
  );

  return { finish, abort };
}

/**
 * The Kenstar logo as intro and loading screen. The first page of a session gets the full
 * construction; every later page load, and every navigation between pages, gets the star with
 * its eyes performing until the new page is ready. Each showing performs differently.
 */
export function LogoLoader() {
  const root = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const lastPath = useRef(pathname);
  const active = useRef<Showing | null>(null);
  const navLanded = useRef<(() => void) | null>(null);

  // The showing that covers this full page load, decided by the gate script in the layout.
  useLayoutEffect(() => {
    const el = root.current;
    const html = document.documentElement;
    if (!el || !html.classList.contains("ll-on")) return;
    const mode: Mode = html.dataset.ll === "intro" ? "intro" : "loader";

    // Development aid: ?intro-speed=0.2 slows every animation for inspection. Stripped from production builds.
    const speed = process.env.NODE_ENV !== "production" ? Number(new URLSearchParams(location.search).get("intro-speed")) : 0;
    if (speed > 0) gsap.globalTimeline.timeScale(speed);

    // Only play when the page arrived quickly; on a slow connection go straight to the page.
    if (performance.now() > 3000 && !(speed > 0)) {
      html.classList.remove("ll-on");
      return;
    }
    if (mode === "intro") {
      try {
        sessionStorage.setItem("ks-intro", "1");
      } catch {}
    }
    const showing = runShowing(el, mode, revealReady(), false, () => (active.current = null));
    active.current = showing;
    return () => showing.abort();
  }, []);

  // Navigations between pages: Next's <Link> clicks, and back/forward.
  useEffect(() => {
    const start = () => {
      const el = root.current;
      if (!el || active.current || reducedMotion()) return;
      const landed = new Promise<void>((r) => (navLanded.current = r));
      active.current = runShowing(el, "loader", landed.then(revealReady), true, () => {
        active.current = null;
        navLanded.current = null;
      });
    };
    const onClick = (e: MouseEvent) => {
      // Next's <Link> has already taken over the click when it reaches the document.
      if (!e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || (a.target && a.target !== "_self") || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname) return;
      start();
    };
    const onPop = () => {
      if (location.pathname !== lastPath.current) start();
    };
    document.addEventListener("click", onClick);
    window.addEventListener("popstate", onPop);
    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("popstate", onPop);
    };
  }, []);

  // The new page has rendered.
  useEffect(() => {
    if (pathname === lastPath.current) return;
    lastPath.current = pathname;
    navLanded.current?.();
  }, [pathname]);

  return (
    <div ref={root} className="ll outline-none" tabIndex={-1}>
      <div className="ll-ground absolute inset-0">
        <svg
          className="ll-svg absolute inset-0 h-full w-full overflow-visible"
          viewBox={END_VIEWBOX}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="Kenstar Limited"
        >
          <g className="ll-guides" fill="none" stroke="var(--ll-line)" strokeWidth={1} aria-hidden="true">
            {GUIDES.datums.map((d) => (
              <path key={d} className="ll-guide g-datum" pathLength={1} d={d} />
            ))}
            {GUIDES.stems.map((d) => (
              <path key={d} className="ll-guide g-stem" pathLength={1} d={d} />
            ))}
            {GUIDES.chamfers.map((d) => (
              <path key={d} className="ll-guide g-chamfer" pathLength={1} d={d} />
            ))}
            {GUIDES.star.map((d) => (
              <path key={d} className="ll-guide g-star" pathLength={1} d={d} />
            ))}
            <circle className="ll-guide g-star" pathLength={1} cx={STAR_CIRCLE.cx} cy={STAR_CIRCLE.cy} r={STAR_CIRCLE.r} />
            {GUIDES.roof.map((d) => (
              <path key={d} className="ll-guide g-roof" pathLength={1} d={d} />
            ))}
            <rect className="ll-guide g-window" pathLength={1} x={WINDOW.x} y={WINDOW.y} width={WINDOW.s} height={WINDOW.s} />
            {GUIDES.window.map((d) => (
              <path key={d} className="ll-guide g-window" pathLength={1} d={d} />
            ))}
          </g>
          <g stroke="var(--ll-ink)" strokeWidth={1.25} aria-hidden="true">
            {Object.entries(LETTERS).map(([k, d]) => (
              <path key={k} className="ll-draw" pathLength={1} d={d} fill="var(--ll-ink)" fillRule="evenodd" />
            ))}
            {EMBU.map((d) => (
              <path key={d} className="ll-draw" pathLength={1} d={d} fill="var(--ll-ink)" />
            ))}
            <path className="ll-draw ll-star" pathLength={1} d={STAR} fill="var(--ll-star)" stroke="var(--ll-star)" />
            <path className="ll-draw ll-pane ll-eye" pathLength={1} d={PANES.upperLeft} fill="var(--ll-ink)" />
            <path className="ll-draw ll-pane ll-eye" pathLength={1} d={PANES.upperRight} fill="var(--ll-ink)" />
            <path className="ll-draw ll-pane" pathLength={1} d={PANES.lowerLeft} fill="var(--ll-ink)" />
            <path className="ll-draw ll-pane" pathLength={1} d={PANES.lowerRight} fill="var(--ll-ink)" />
          </g>
        </svg>
      </div>
      <button type="button" className="ll-skip absolute bottom-6 right-6 z-10 md:bottom-8 md:right-8">
        Skip intro
      </button>
    </div>
  );
}
