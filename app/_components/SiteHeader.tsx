"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Wordmark } from "./brand";
import { ArrowRight, Close, Menu } from "./icons";
import { StatusLine } from "./StatusLine";
import { ADDRESS_LINE, TOWN, whatsappLink } from "../_content/site";

export const NAV = [
  { href: "/products", label: "Products" },
  { href: "/construction", label: "Construction" },
  { href: "/accommodation", label: "Accommodation" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

// Midnight on every page: the logo reversed with its gold star. Phones get a 60px bar and a full
// sheet; WhatsApp, Call and Directions live in the action bar there.
export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  const current = (href: string) => (pathname === href || pathname.startsWith(href + "/") ? "page" : undefined);

  return (
    <header className="kh env-midnight">
      <div className="kh-bar k-wrap">
        <Link href="/" className="kh-logo" aria-label="Kenstar Limited, home">
          <Wordmark tone="white" title="Kenstar Limited, Embu" />
        </Link>

        <nav aria-label="Main" className="kh-nav">
          <ul>
            {NAV.map((n) => (
              <li key={n.href}>
                <Link href={n.href} aria-current={current(n.href)}>
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="kh-right">
          <StatusLine className="kh-status" />
          {/* Outlined everywhere: each page's own primary action is the one brass, cut-corner control in view. */}
          <a href={whatsappLink("Hello Kenstar, I have a question.")} target="_blank" rel="noopener noreferrer" className="kh-wa k-btn k-btn-sm k-btn-secondary">
            WhatsApp us
          </a>
          <button
            type="button"
            className="kh-menu k-icon-btn"
            aria-expanded={open}
            aria-controls="site-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <Close size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <div id="site-menu" hidden={!open} className="kh-sheet env-midnight">
        <nav aria-label="Menu">
          <ul>
            <li>
              <Link href="/" className="kh-sheet-link" aria-current={pathname === "/" ? "page" : undefined} onClick={() => setOpen(false)}>
                Home <ArrowRight size={20} />
              </Link>
            </li>
            {NAV.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="kh-sheet-link" aria-current={current(n.href)} onClick={() => setOpen(false)}>
                  {n.label} <ArrowRight size={20} />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <StatusLine className="kh-sheet-status" />
        <p className="t-small t-soft kh-sheet-address">
          {ADDRESS_LINE}, {TOWN}
        </p>
      </div>
    </header>
  );
}
