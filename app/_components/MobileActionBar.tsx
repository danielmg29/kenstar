import { Chat, Phone, Pin } from "./icons";
import { MAPS_DIRECTIONS_URL, PHONE_TEL, whatsappLink } from "../_content/site";

// Persistent one-tap actions on phones: WhatsApp, call, directions.
export function MobileActionBar() {
  const item = "flex flex-1 flex-col items-center justify-center gap-1 py-2.5 font-label text-[0.82rem] font-semibold tracking-[0.03em] no-underline";
  return (
    <nav aria-label="Quick actions" className="on-navy fixed inset-x-0 bottom-0 z-40 flex border-t border-[var(--line-on-navy)] bg-navy pb-[env(safe-area-inset-bottom)] text-paper md:hidden">
      <a href={whatsappLink("Hello Kenstar, I have a question.")} target="_blank" rel="noopener noreferrer" className={`${item} bg-gold text-navy-deep`}>
        <Chat size={20} />
        WhatsApp
      </a>
      <a href={PHONE_TEL} className={`${item} border-r border-[var(--line-on-navy)]`}>
        <Phone size={20} />
        Call
      </a>
      <a href={MAPS_DIRECTIONS_URL} target="_blank" rel="noopener noreferrer" className={item}>
        <Pin size={20} />
        Directions
      </a>
    </nav>
  );
}
