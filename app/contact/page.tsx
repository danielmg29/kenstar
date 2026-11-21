import type { Metadata } from "next";
import { SiteHeader } from "../_components/SiteHeader";
import { SiteFooter } from "../_components/SiteFooter";
import { MobileActionBar } from "../_components/MobileActionBar";
import { EnquiryForm } from "../_components/EnquiryForm";
import { DoorSign } from "../_components/contact/DoorSign";
import { ArrowRight, Chat, Mail, Phone } from "../_components/icons";
import { RANGES } from "../_content/products";
import { EMAIL, PHONE_DISPLAY, PHONE_TEL, PO_BOX, whatsappLink } from "../_content/site";
import "./contact.css";

export const metadata: Metadata = {
  title: "Contact | Kenstar Limited, Embu",
  description:
    "Kenstar's showroom on Market Road, Embu: open now or closed, the week's hours, directions, WhatsApp, phone and email.",
};

const TOPICS = [
  ...RANGES.map((r) => r.name),
  "Construction & civil works",
  "Roadworks",
  "Delivery & equipment hire",
  "Furnished accommodation",
  "Something else",
];

const CHANNELS = [
  { name: "WhatsApp", detail: PHONE_DISPLAY, note: "Chat with the showroom", href: whatsappLink("Hello Kenstar, I have a question."), icon: Chat, external: true },
  { name: "Call", detail: PHONE_DISPLAY, note: "During opening hours", href: PHONE_TEL, icon: Phone, external: false },
  { name: "Email", detail: EMAIL, note: "For lists and longer questions", href: `mailto:${EMAIL}`, icon: Mail, external: false },
];

export default function ContactPage() {
  return (
    <>
      <SiteHeader />
      <main className="k-page env-limestone ct">
        <h1 className="sr-only">Contact Kenstar</h1>
        <div className="ct-top k-wrap">
          <DoorSign />
          <section className="ct-channels" aria-labelledby="ct-channels-h">
            <h2 id="ct-channels-h" className="ct-channels-h">
              Reach the showroom
            </h2>
            <ul>
              {CHANNELS.map((c) => (
                <li key={c.name}>
                  <a href={c.href} {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="ct-channel">
                    <c.icon size={22} />
                    <span className="ct-channel-text">
                      <span className="ct-channel-name">{c.name}</span>
                      <span className="ct-channel-detail">{c.detail}</span>
                      <span className="ct-channel-note">{c.note}</span>
                    </span>
                    <ArrowRight size={20} className="ct-channel-go" />
                  </a>
                </li>
              ))}
              <li>
                <div className="ct-channel ct-channel-static">
                  <span className="ct-channel-text">
                    <span className="ct-channel-name">Post</span>
                    <span className="ct-channel-detail">{PO_BOX}</span>
                  </span>
                </div>
              </li>
            </ul>
          </section>
        </div>

        <section className="ct-enquire k-wrap" aria-labelledby="ct-enquire-h">
          <div className="ct-enquire-text">
            <h2 id="ct-enquire-h" className="ct-enquire-h">
              Send an enquiry
            </h2>
            <p className="t-body t-soft" id="ct-enquire-note">
              For a list of items, a quote or a question that needs more than a line. It opens in WhatsApp or your email app, ready to send.
            </p>
          </div>
          <EnquiryForm kind="general" topics={TOPICS} describedBy="ct-enquire-note" />
        </section>
      </main>
      <SiteFooter />
      <MobileActionBar />
    </>
  );
}
