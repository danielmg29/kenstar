import Link from "next/link";
import {
  ADDRESS_LINE,
  EMAIL,
  HOURS_SUMMARY,
  MAPS_DIRECTIONS_URL,
  PHONE_DISPLAY,
  PHONE_TEL,
  PO_BOX,
  TIKTOK_URL,
  TOWN,
  whatsappLink,
} from "../_content/site";

const EXPLORE = [
  { href: "/products", label: "Products" },
  { href: "/construction", label: "Construction" },
  { href: "/accommodation", label: "Accommodation" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export function SiteFooter() {
  return (
    <footer className="kf env-midnight env-deep">
      <div className="k-wrap">
        <p className="kf-closing">From the first line to the final&nbsp;light.</p>
        <div className="kf-cols">
          <div className="kf-col">
            <h2 className="t-tech">Visit</h2>
            <address className="not-italic">
              <p>{ADDRESS_LINE}</p>
              <p>{PO_BOX}</p>
            </address>
            <p className="mt-2">
              <a href={MAPS_DIRECTIONS_URL} target="_blank" rel="noopener noreferrer" className="k-link">
                Get directions
              </a>
            </p>
          </div>
          <div className="kf-col">
            <h2 className="t-tech">Hours</h2>
            <ul>
              {HOURS_SUMMARY.map((h) => (
                <li key={h.days} className="[font-variant-numeric:tabular-nums]">
                  {h.days}, {h.time}
                </li>
              ))}
            </ul>
          </div>
          <div className="kf-col">
            <h2 className="t-tech">Contact</h2>
            <ul>
              <li>
                <a href={PHONE_TEL}>{PHONE_DISPLAY}</a>
              </li>
              <li>
                <a href={whatsappLink("Hello Kenstar, I have a question.")} target="_blank" rel="noopener noreferrer">
                  WhatsApp
                </a>
              </li>
              <li>
                <a href={`mailto:${EMAIL}`} className="break-all">
                  {EMAIL}
                </a>
              </li>
            </ul>
          </div>
          <nav aria-label="Footer" className="kf-col">
            <h2 className="t-tech">Explore</h2>
            <ul>
              {EXPLORE.map((n) => (
                <li key={n.href}>
                  <Link href={n.href}>{n.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="kf-base">
          <p>© Kenstar Limited, {TOWN}</p>
          <a href={TIKTOK_URL} target="_blank" rel="noopener noreferrer" className="k-link">
            Kenstar on TikTok
          </a>
        </div>
      </div>
    </footer>
  );
}
