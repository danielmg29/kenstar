"use client";

import { useEffect, useRef, useState } from "react";
import { STAGES } from "../../_content/construction";

// The page's index: five stages from the road to the finished room. It sits at the base of the
// first viewport, then stays under the header; the stage in view is lit.
export function StageStrip() {
  const [active, setActive] = useState<string>("structure");
  const listRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const line = window.innerHeight * 0.4;
      let current = "structure"; // the render above the strip shows the structure
      for (const s of STAGES) {
        const el = document.getElementById(s.slug);
        if (el && el.getBoundingClientRect().top <= line) current = s.slug;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    const list = listRef.current;
    const link = list?.querySelector<HTMLElement>(`a[href="#${active}"]`);
    if (!list || !link || list.scrollWidth <= list.clientWidth) return;
    list.scrollTo({ left: link.offsetLeft - list.clientWidth / 2 + link.offsetWidth / 2, behavior: "smooth" });
  }, [active]);

  return (
    <nav aria-label="Stages" className="cs-strip env-midnight">
      <ol ref={listRef} className="cs-strip-in k-wrap">
        {STAGES.map((s) => (
          <li key={s.slug}>
            <a href={`#${s.slug}`} aria-current={active === s.slug ? "true" : undefined}>
              <span className="cs-strip-n">{s.number}</span>
              <span className="cs-strip-name">{s.name}</span>
              <span className="cs-strip-who">{s.who}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
