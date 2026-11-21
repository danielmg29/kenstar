import type { Metadata } from "next";
import Image from "next/image";
import { SiteHeader } from "../_components/SiteHeader";
import { SiteFooter } from "../_components/SiteFooter";
import { MobileActionBar } from "../_components/MobileActionBar";
import { EnquiryForm } from "../_components/EnquiryForm";
import { ArrowDown, ArrowRight } from "../_components/icons";
import { ROOMS, STAY, STAY_UNCONFIRMED, askStay } from "../_content/stay";
import "./accommodation.css";

export const metadata: Metadata = {
  title: "Furnished accommodation | Kenstar Limited",
  description:
    "Kenstar's furnished accommodation: lounge, kitchen and bedroom, photographed as they are. Ask whether your dates are free.",
};

export default function AccommodationPage() {
  return (
    <>
      <SiteHeader />
      <main className="k-page st env-white">
        {/* The spread: a headline in open white, the lounge crossing the gutter, credits along the base. */}
        <section className="st-spread" aria-labelledby="st-title">
          <div className="st-left">
            <h1 id="st-title" className="st-h1">
              A furnished stay.
            </h1>
            <p className="st-lede">Lounge, kitchen and bedroom, photographed as they are. Ask which dates are free.</p>
            <div className="st-ask">
              <a href="#availability" className="k-btn k-btn-primary k-btn-lg">
                Ask about availability <ArrowDown size={18} />
              </a>
            </div>
          </div>
          <figure className="st-hero">
            <Image src={STAY.loungeTv.src} alt={STAY.loungeTv.alt} fill preload sizes="(min-width: 1024px) 64vw, 100vw" />
          </figure>
          <nav className="st-credits" aria-label="Rooms">
            <ol>
              {ROOMS.map((r, i) => (
                <li key={r.slug}>
                  <a href={`#${r.slug}`}>
                    <span className="st-credit-n">{String(i + 1).padStart(2, "0")}</span>
                    {r.name}
                  </a>
                </li>
              ))}
            </ol>
            <p className="st-credit-note">Location, rates and booking on request</p>
          </nav>
        </section>

        {ROOMS.map((room, i) => (
          <section key={room.slug} id={room.slug} className="st-room" data-flip={i % 2 === 1 || undefined} aria-labelledby={`${room.slug}-h`}>
            <figure className="st-room-main">
              <Image src={room.photo.src} alt={room.photo.alt} fill sizes="(min-width: 1024px) 58vw, 100vw" style={{ objectPosition: room.photo.position ?? "50% 50%" }} />
            </figure>
            <div className="st-room-page">
              <h2 id={`${room.slug}-h`} className="st-room-name">
                {room.name}
              </h2>
              <ul className="st-notes">
                {room.notes.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
              <div className="st-plates">
                {room.more.map((m) => (
                  <figure key={m.src} className="st-plate" data-tall={m.height > m.width || undefined}>
                    <span className="st-plate-ph">
                      <Image src={m.src} alt={m.alt} fill sizes="(min-width: 1024px) 18vw, 45vw" style={{ objectPosition: m.position ?? "50% 50%" }} />
                    </span>
                    <figcaption>{m.caption}</figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </section>
        ))}

        <section className="st-unknown" aria-labelledby="st-unknown-h">
          <h2 id="st-unknown-h" className="st-unknown-h">
            Still to be confirmed
          </h2>
          <p className="st-unknown-lede">
            Kenstar has not published these yet, so this page does not guess. Ask, and you will get the answer for your dates.
          </p>
          <ul className="st-unknown-list">
            {STAY_UNCONFIRMED.map((u) => (
              <li key={u.label}>
                <span>{u.label}</span>
                <a className="k-link" href={askStay(`Hello Kenstar, about the furnished accommodation: could you tell me ${u.ask}?`)} target="_blank" rel="noopener noreferrer">
                  Ask on WhatsApp<span className="sr-only">: {u.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section id="availability" className="st-enquire env-midnight" aria-labelledby="availability-h">
          <div className="st-enquire-in k-wrap">
            <div>
              <h2 id="availability-h" className="t-display-2">
                Ask whether your dates are free.
              </h2>
              <p className="t-body t-soft st-enquire-note" id="availability-note">
                This is an enquiry, not a booking. Your message opens in WhatsApp or your email app, ready to send.
              </p>
              <p className="st-enquire-back">
                <a className="k-link" href="#lounge">
                  See the rooms again <ArrowRight size={16} />
                </a>
              </p>
            </div>
            <EnquiryForm kind="stay" describedBy="availability-note" />
          </div>
        </section>
      </main>
      <SiteFooter />
      <MobileActionBar />
    </>
  );
}
