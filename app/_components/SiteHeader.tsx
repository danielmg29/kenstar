"use client";

import { useEffect, useState } from "react";
import { Wordmark } from "./brand";
import { Chat, Close, Menu, Phone } from "./icons";
import { PHONE_DISPLAY, PHONE_TEL, whatsappLink } from "../_content/site";

const NAV = [
  { href: "#ranges", label: "Ranges" },
  { href: "#showroom", label: "Showroom" },
  { href: "#services", label: "Construction" },
  { href: "#enquire", label: "Enquire" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="on-paper sticky top-0 z-50 border-b border-[var(--line)] bg-paper/95 backdrop-blur-[2px]">
      <div className="mx-auto flex h-[var(--header-h)] max-w-[1600px] items-center gap-6 px-[var(--gutter)]">
        <a href="#top" className="-ml-1 block shrink-0 p-1" aria-label="Kenstar Limited, back to top">
          <Wordmark className="h-9 w-auto md:h-10" title="Kenstar Limited, Embu" />
        </a>

        <nav aria-label="Main" className="ml-auto hidden lg:block">
          <ul className="flex items-center gap-7">
            {NAV.map((n) => (
              <li key={n.href}>
                <a href={n.href} className="font-label text-[0.98rem] font-medium tracking-[0.01em] text-navy no-underline decoration-[var(--gold)] decoration-2 underline-offset-[0.5em] hover:underline">
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-4">
          <a href={PHONE_TEL} className="hidden items-center gap-2 px-2 font-label font-semibold text-navy no-underline xl:inline-flex" aria-label={`Call ${PHONE_DISPLAY}`}>
            <Phone size={18} />
            {PHONE_DISPLAY}
          </a>
          {/* Phones get WhatsApp from the bottom action bar instead. */}
          <span className="hidden sm:block">
            <a href={whatsappLink("Hello Kenstar, I have a question.")} target="_blank" rel="noopener noreferrer" className="btn btn-navy !min-h-[2.6rem] !py-2">
              <Chat size={18} />
              WhatsApp us
            </a>
          </span>
          <button
            type="button"
            className="grid h-11 w-11 place-items-center text-navy lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <Close size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <div
        id="mobile-nav"
        hidden={!open}
        className="fixed inset-x-0 bottom-0 top-[var(--header-h)] z-40 overflow-y-auto border-t border-[var(--line)] bg-paper lg:hidden"
      >
        <nav aria-label="Mobile" className="px-[var(--gutter)] py-6">
          <ul className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
            {NAV.map((n) => (
              <li key={n.href}>
                <a href={n.href} onClick={() => setOpen(false)} className="heading flex items-center justify-between py-5 text-[1.75rem] text-navy no-underline">
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-8 grid gap-3">
            <a href={whatsappLink("Hello Kenstar, I have a question.")} target="_blank" rel="noopener noreferrer" className="btn btn-navy">
              <Chat size={18} /> WhatsApp us
            </a>
            <a href={PHONE_TEL} className="btn btn-line text-navy">
              <Phone size={18} /> Call {PHONE_DISPLAY}
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}
