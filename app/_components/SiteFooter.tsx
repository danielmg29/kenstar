import { Wordmark } from "./brand";
import { Chat, Mail, Phone, Pin } from "./icons";
import {
  ADDRESS_LINE,
  EMAIL,
  HOURS_SUMMARY,
  MAPS_DIRECTIONS_URL,
  PHONE_DISPLAY,
  PHONE_TEL,
  PO_BOX,
  RANGES,
  TIKTOK_URL,
  TOWN,
  whatsappLink,
} from "../_content/site";

export function SiteFooter() {
  return (
    <footer className="on-navy bg-navy text-paper">
      <div className="mx-auto max-w-[1600px] px-[var(--gutter)] pb-28 pt-16 md:pb-14">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div>
            <Wordmark tone="white" className="h-14 w-auto" />
            <p className="mt-6 max-w-xs text-[0.98rem] text-on-navy-soft">
              Hardware &amp; home showroom on {ADDRESS_LINE}, {TOWN}.
            </p>
          </div>
          <div>
            <h2 className="letter text-on-navy-soft">Showroom</h2>
            <address className="mt-4 not-italic leading-relaxed">
              {ADDRESS_LINE}
              <br />
              {PO_BOX}
            </address>
            <ul className="mt-4 space-y-1 text-[0.98rem] [font-variant-numeric:tabular-nums]">
              {HOURS_SUMMARY.map((h) => (
                <li key={h.days}>
                  <span className="text-on-navy-soft">{h.days}:</span> {h.time}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="letter text-on-navy-soft">Contact</h2>
            <ul className="mt-4 space-y-3">
              <li>
                <a href={PHONE_TEL} className="inline-flex items-center gap-3 no-underline hover:underline">
                  <Phone size={18} /> {PHONE_DISPLAY}
                </a>
              </li>
              <li>
                <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 no-underline hover:underline">
                  <Chat size={18} /> WhatsApp
                </a>
              </li>
              <li>
                <a href={`mailto:${EMAIL}`} className="inline-flex items-center gap-3 break-all no-underline hover:underline">
                  <Mail size={18} /> {EMAIL}
                </a>
              </li>
              <li>
                <a href={MAPS_DIRECTIONS_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 no-underline hover:underline">
                  <Pin size={18} /> Directions
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="letter text-on-navy-soft">Ranges</h2>
            <ul className="mt-4 space-y-2">
              {RANGES.map((r) => (
                <li key={r.slug}>
                  <a href={`#ch-${r.slug}`} className="no-underline hover:underline">
                    {r.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--line-on-navy)] pt-6 text-[0.9rem] text-on-navy-soft">
          <p>© Kenstar Limited, {TOWN}</p>
          <a href={TIKTOK_URL} target="_blank" rel="noopener noreferrer" className="textlink text-on-navy-soft">
            Follow us on TikTok
          </a>
        </div>
      </div>
    </footer>
  );
}
