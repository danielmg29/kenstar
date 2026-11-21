import { Chat, Phone, Pin } from "./icons";
import { MAPS_DIRECTIONS_URL, PHONE_TEL, whatsappLink } from "../_content/site";

// Phones only: one tap to WhatsApp (brass), call or get directions. It never hides on scroll.
export function MobileActionBar() {
  return (
    <nav aria-label="Quick actions" className="kab env-midnight">
      <a href={whatsappLink("Hello Kenstar, I have a question.")} target="_blank" rel="noopener noreferrer" className="kab-wa">
        <Chat size={18} />
        WhatsApp
      </a>
      <a href={PHONE_TEL}>
        <Phone size={18} />
        Call
      </a>
      <a href={MAPS_DIRECTIONS_URL} target="_blank" rel="noopener noreferrer">
        <Pin size={18} />
        Directions
      </a>
    </nav>
  );
}
