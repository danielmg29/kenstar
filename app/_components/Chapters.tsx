"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { CALLOUTS, Drawing } from "./drawings";
import { ArrowRight, Chat } from "./icons";
import { CHAPTER_PHOTOS, RANGES, whatsappLink, type Range } from "../_content/site";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const PAPER = "#f3f6f9";
const NAVY = "#0b2d52";
const NAVY_DEEP = "#06203d";
const TOTAL = String(RANGES.length).padStart(2, "0");

function Chapter({ r, isFinal }: { r: Range; isFinal: boolean }) {
  const photo = CHAPTER_PHOTOS[r.drawing];
  const keyText = CALLOUTS[r.drawing].map((t, i) => `${i + 1} ${t}`).join(" · ");
  return (
    <article
      id={`ch-${r.slug}`}
      data-final={isFinal ? "true" : undefined}
      aria-labelledby={`ch-${r.slug}-title`}
      className={`chapter relative lg:h-[165vh] motion-reduce:lg:h-auto ${isFinal ? "on-navy text-paper" : ""}`}
    >
      {/* Final light: a full-bleed navy field behind the chapter, navy by default in CSS (the index column stays on top). */}
      {isFinal && <div aria-hidden="true" className="final-bleed absolute inset-y-0 -left-[100vw] -right-[100vw] -z-10 bg-navy" />}
      {/* The stage holds still (CSS sticky) while the drawing becomes the photograph. */}
      <div className="grid gap-8 py-14 md:py-20 lg:sticky lg:top-[var(--header-h)] lg:h-[calc(100vh-var(--header-h))] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center lg:gap-12 lg:py-8 motion-reduce:lg:static motion-reduce:lg:h-auto motion-reduce:lg:py-24">
        <div className="order-2 lg:order-1">
          <h3 id={`ch-${r.slug}-title`} className="flex items-center gap-4">
            {/* Drafting grid bubble carrying the chapter number */}
            <span className="letter grid h-12 w-12 shrink-0 place-items-center rounded-full border border-current [--ls:0.95rem]">{r.number}</span>
            <span className="display text-[clamp(2.6rem,5vw,4.5rem)]">{r.chapter}</span>
          </h3>
          <p className="heading mt-4 text-[1.45rem]">{r.name}</p>
          <p className="lede mt-4 opacity-85">{r.line}</p>
          {r.items.length > 0 && (
            <ul className="mt-7 max-w-md border-t border-current/20">
              {r.items.map((it) => (
                <li key={it} className="border-b border-current/20 py-2.5 font-label text-[1.02rem]">
                  {it}
                </li>
              ))}
            </ul>
          )}
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={whatsappLink(`Hello Kenstar, I'd like to ask about ${r.name.toLowerCase()}.`)}
              target="_blank"
              rel="noopener noreferrer"
              className={`btn ${isFinal ? "btn-gold" : "btn-navy"}`}
            >
              <Chat size={18} />
              Ask about {r.name.split(" ")[0].toLowerCase()}
            </a>
            {isFinal && (
              <a href="#showroom" className="btn btn-line">
                See it lit in Embu
                <ArrowRight size={18} className="nudge-x" />
              </a>
            )}
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <figure
            className={`ch-figure sheet ${
              isFinal ? "bg-navy-deep text-paper [--plate:#06203d] [--plate-ink:#f3f6f9]" : "bg-paper text-navy"
            }`}
          >
            <div className="letter flex items-center justify-between gap-4 border-b border-current/20 px-4 py-2.5">
              <span>
                Detail {r.number}: {r.name}
              </span>
              <span className="shrink-0 opacity-70">
                Sheet {r.number} of {TOTAL}
              </span>
            </div>
            <div className="relative aspect-[3/2] overflow-hidden">
              {photo && (
                <div className="ch-photo absolute inset-0">
                  <Image src={photo.src} alt={photo.alt} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
                </div>
              )}
              {isFinal && (
                <div
                  className="ch-glow pointer-events-none absolute inset-0 mix-blend-screen"
                  style={{
                    background:
                      "radial-gradient(circle at 49.7% 53%, rgb(255 200 110 / 0.6), transparent 16%), radial-gradient(circle at 68.3% 60%, rgb(255 200 110 / 0.55), transparent 14%), radial-gradient(circle at 56.3% 79.5%, rgb(255 200 110 / 0.55), transparent 15%)",
                  }}
                />
              )}
              {photo && <div className="ch-rule pointer-events-none absolute inset-y-0 left-0 w-[2px] bg-gold opacity-0" />}
              <Drawing id={r.drawing} className={`ch-drawing absolute inset-0 h-full w-full ${photo ? "has-photo" : ""}`} />
            </div>
            {(photo || keyText) && (
              <figcaption className="border-t border-current/20 px-4 py-2.5 text-[0.9rem]">
                {photo ? <span className="opacity-80">{photo.alt}.</span> : <span className="opacity-80">No photo of this range yet.</span>}
                {keyText && <span className="mt-1 block font-label text-[0.92rem] md:hidden">Key: {keyText}</span>}
              </figcaption>
            )}
          </figure>
        </div>
      </div>
    </article>
  );
}

export function Chapters() {
  const root = useRef<HTMLElement>(null);
  const chips = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const chip = chips.current?.querySelector<HTMLElement>(`[data-i="${active}"]`);
    if (chip && chips.current) {
      chips.current.scrollTo({ left: chip.offsetLeft - 16, behavior: "smooth" });
    }
  }, [active]);

  useGSAP(
    () => {
      const section = root.current!;
      const articles = gsap.utils.toArray<HTMLElement>(".chapter", section);
      const finalEl = section.querySelector<HTMLElement>('[data-final="true"]');
      const field = finalEl?.querySelector<HTMLElement>(".final-bleed");

      articles.forEach((el, i) => {
        ScrollTrigger.create({
          trigger: el,
          start: "top 55%",
          end: "bottom 55%",
          onToggle: (self) => self.isActive && setActive(i),
        });
      });

      const mm = gsap.matchMedia();
      // Reduced motion: no scrubbing. The final field is navy in CSS already; only the phone chip bar follows it.
      mm.add("(prefers-reduced-motion: reduce)", () => {
        if (!finalEl) return;
        ScrollTrigger.create({
          trigger: finalEl,
          start: "top 60%",
          end: "bottom top",
          onToggle: (self) =>
            gsap.set(
              section,
              self.isActive ? { "--sheet": NAVY, "--ink": PAPER, "--ink-soft": "#a9bed6" } : { "--sheet": PAPER, "--ink": NAVY, "--ink-soft": "#3c5878" },
            ),
        });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        articles.forEach((el) => {
          const lines = el.querySelectorAll(".d-line");
          const notes = el.querySelectorAll(".d-note");
          const photo = el.querySelector(".ch-photo");
          const photoImg = el.querySelector(".ch-photo img");
          const rule = el.querySelector(".ch-rule");
          const glow = el.querySelector(".ch-glow");
          const figure = el.querySelector(".ch-figure");
          const isFinal = el.dataset.final === "true";

          gsap.set(lines, { strokeDasharray: 1, strokeDashoffset: 1, opacity: 1 });
          gsap.set(notes, { opacity: 0 });
          if (photo) gsap.set(photo, { clipPath: "inset(0% 100% 0% 0%)" });
          if (isFinal && field) {
            // The sheet starts as drafting paper and darkens as the last chapter arrives.
            gsap.set(field, { backgroundColor: PAPER });
            gsap.set(el, { color: NAVY });
            gsap.set(figure, { backgroundColor: PAPER, color: NAVY });
            gsap.set(photoImg, { filter: "brightness(0.32) saturate(0.45)" });
            gsap.set(glow, { opacity: 0 });
          }

          const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: { trigger: el, start: "top 65%", end: "bottom bottom", scrub: 0.6 },
          });

          if (isFinal && field) {
            tl.to(section, { "--sheet": NAVY, "--ink": PAPER, "--ink-soft": "#a9bed6", duration: 0.22 }, 0)
              .to(field, { backgroundColor: NAVY, duration: 0.22 }, 0)
              .to(el, { color: PAPER, duration: 0.22 }, 0)
              .to(figure, { backgroundColor: NAVY_DEEP, color: PAPER, duration: 0.22 }, 0);
          }

          tl.to(lines, { strokeDashoffset: 0, duration: 0.36, stagger: 0.012, ease: "power1.inOut" }, isFinal ? 0.12 : 0).to(
            notes,
            { opacity: 1, duration: 0.12, stagger: 0.03 },
            isFinal ? 0.3 : 0.2,
          );

          if (photo) {
            tl.set(rule, { opacity: 1, left: "0%" }, 0.42)
              .to(photo, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.36, ease: "power2.inOut" }, 0.42)
              .to(rule, { left: "100%", duration: 0.36, ease: "power2.inOut" }, 0.42)
              .to(rule, { opacity: 0, duration: 0.05 }, 0.79)
              .to(lines, { opacity: 0.38, duration: 0.12 }, 0.78);
          }

          if (isFinal) {
            // The light switches on.
            tl.to(photoImg, { filter: "brightness(1.06) saturate(1.08)", duration: 0.14, ease: "expo.out" }, 0.84).to(
              glow,
              { opacity: 1, duration: 0.14, ease: "expo.out" },
              0.84,
            );
          } else {
            tl.to({}, { duration: 0.1 }, 0.9);
          }
        });
      });
    },
    { scope: root },
  );

  return (
    <section
      id="making"
      ref={root}
      aria-labelledby="making-title"
      className="on-paper relative overflow-x-clip bg-[var(--sheet)] text-[var(--ink)]"
      style={{ "--sheet": PAPER, "--ink": NAVY, "--ink-soft": "#3c5878" } as React.CSSProperties}
    >
      <div className="mx-auto max-w-[1600px] px-[var(--gutter)] pt-20 md:pt-28">
        <div className="grid gap-6 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-14">
          <div className="hidden lg:block" />
          <div className="max-w-[52rem]">
            <h2 id="making-title" className="display text-[clamp(2.4rem,5.4vw,4.75rem)]">
              The making of a space
            </h2>
            <p className="lede mt-5 text-[1.125rem] text-[var(--ink-soft)]">
              Six chapters, in the order a building comes together. Each starts as a drawing and becomes the real thing, photographed on our showroom floor.
            </p>
          </div>
        </div>
      </div>

      {/* Phone chapter navigator */}
      <div className="sticky top-[var(--header-h)] z-30 mt-10 border-y border-[var(--line)] bg-[var(--sheet)] lg:hidden">
        <div ref={chips} className="flex gap-1 overflow-x-auto px-[var(--gutter)] py-2 [scrollbar-width:none]">
          {RANGES.map((r, i) => (
            <a
              key={r.slug}
              data-i={i}
              href={`#ch-${r.slug}`}
              aria-current={active === i ? "step" : undefined}
              className={`letter flex shrink-0 items-center gap-2 px-3 py-2 [--ls:0.85rem] no-underline transition-colors ${
                active === i ? "bg-[var(--ink)] text-[var(--sheet)]" : "text-[var(--ink-soft)]"
              }`}
            >
              <span>{r.number}</span>
              {r.chapter}
            </a>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-[1600px] px-[var(--gutter)]">
        <div className="isolate grid lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-14">
          {/* Sheet index */}
          <nav aria-label="Chapters" className="hidden lg:block">
            <ol className="sticky top-[calc(var(--header-h)+2.5rem)] mt-16 border-t border-[var(--line)]">
              {RANGES.map((r, i) => (
                <li key={r.slug} className="border-b border-[var(--line)]">
                  <a
                    href={`#ch-${r.slug}`}
                    aria-current={active === i ? "step" : undefined}
                    className={`group flex items-start gap-3 py-3.5 no-underline transition-colors duration-300 ${
                      active === i ? "text-[var(--ink)]" : "text-[var(--ink-soft)] hover:text-[var(--ink)]"
                    }`}
                  >
                    <span
                      className={`mt-[0.45rem] h-2 w-2 shrink-0 transition-colors duration-300 ${active === i ? "bg-[var(--ink)]" : "bg-transparent outline outline-1 outline-current"}`}
                      aria-hidden="true"
                    />
                    <span className="min-w-0">
                      <span className="letter block [--ls:0.8rem]">
                        {r.number} {r.chapter}
                      </span>
                      <span className="mt-0.5 block text-[0.95rem] leading-snug">{r.name}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div>
            {RANGES.map((r, i) => (
              <Chapter key={r.slug} r={r} isFinal={i === RANGES.length - 1} />
            ))}
          </div>
        </div>
      </div>

    </section>
  );
}
