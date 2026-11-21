import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "../_components/SiteHeader";
import { SiteFooter } from "../_components/SiteFooter";
import { MobileActionBar } from "../_components/MobileActionBar";
import { EnquiryForm } from "../_components/EnquiryForm";
import { StageStrip } from "../_components/construction/StageStrip";
import { ArrowRight } from "../_components/icons";
import { StatusLine } from "../_components/StatusLine";
import { STAGES, askAbout, type Stage } from "../_content/construction";
import { ADDRESS_LINE, HOURS_SUMMARY, MAPS_DIRECTIONS_URL, PHONE_DISPLAY, PHONE_TEL, TOWN } from "../_content/site";
import "./construction.css";

export const metadata: Metadata = {
  title: "Construction & roadworks | Kenstar Limited, Embu",
  description:
    "Building works, civil works and roadworks from Kenstar in Embu, with delivery, equipment hire and a showroom to finish the space.",
};

function StageSection({ stage, flip }: { stage: Stage; flip: boolean }) {
  const many = stage.photos.length > 1;
  const bare = stage.photos.length === 0;
  return (
    <section id={stage.slug} className="cs-stage" data-flip={flip || undefined} data-bare={bare || undefined} aria-labelledby={`${stage.slug}-h`}>
      <div className="cs-stage-in k-wrap">
        <header className="cs-stage-head">
          <span className="cs-stage-n" aria-hidden="true">
            {stage.number}
          </span>
          <h2 id={`${stage.slug}-h`} className="cs-stage-name">
            {stage.name}
          </h2>
          <p className="cs-stage-who">{stage.who}</p>
        </header>
        <div className="cs-stage-text">
          <p className="cs-stage-lede">{stage.text}</p>
          {stage.services.length > 0 && (
            <ul className="cs-services">
              {stage.services.map((s) => (
                <li key={s.code}>
                  <div>
                    <h3>{s.name}</h3>
                    <p>{s.line}</p>
                  </div>
                  <a className="k-link cs-ask" href={askAbout(s.ask)} target="_blank" rel="noopener noreferrer">
                    Ask on WhatsApp<span className="sr-only">: {s.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
          {stage.links.length > 0 && (
            <ul className="cs-links">
              {stage.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="cs-range">
                    <span className="cs-range-name">{l.label}</span>
                    <span className="cs-range-where">
                      In the showroom <ArrowRight size={18} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
        {!bare && (
        <div className={`cs-photos${many ? " cs-photos-two" : ""}`}>
          {stage.photos.map((p) => (
            <figure key={p.src} className={`cs-photo${"portrait" in p && p.portrait ? " cs-photo-tall" : ""}`}>
              <Image
                src={p.src}
                alt={p.alt}
                fill
                sizes={many ? "(min-width: 1024px) 26vw, 50vw" : "(min-width: 1024px) 50vw, 100vw"}
                style={{ objectPosition: p.position ?? "50% 50%" }}
              />
              <figcaption className="k-plate-label">{p.caption}</figcaption>
            </figure>
          ))}
        </div>
        )}
      </div>
    </section>
  );
}

export default function ConstructionPage() {
  return (
    <>
      <SiteHeader />
      <main className="k-page env-limestone cs">
        <div className="cs-run">
          <section className="cs-hero env-midnight" aria-labelledby="cs-title">
            <Image
              src="/journey/c1-after.webp"
              alt="Visualisation: a two-storey concrete frame under scaffolding, beside a new road"
              fill
              preload
              sizes="100vw"
              className="cs-hero-img"
            />
            <span className="cs-vis">Visualisation</span>
            <div className="cs-hero-in k-wrap">
              <div className="cs-copy">
                <h1 id="cs-title" className="cs-h1">
                  We build the structure. Our showroom finishes&nbsp;it.
                </h1>
                <p className="cs-lede">
                  Building works, civil works and roadworks from Kenstar in Embu, with everything to finish the space in one showroom on Market Road.
                </p>
                <div className="cs-actions">
                  <a href="#enquire" className="k-btn k-btn-primary k-btn-lg">
                    Talk about a project <ArrowRight size={18} className="nudge" />
                  </a>
                  <a href="#approach" className="k-link cs-see">
                    See the five stages
                  </a>
                </div>
              </div>
            </div>
          </section>

          <StageStrip />

          {STAGES.map((s, i) => (
            <StageSection key={s.slug} stage={s} flip={i % 2 === 1} />
          ))}
        </div>

        <section id="enquire" className="cs-enquire env-midnight" aria-labelledby="enquire-title">
          <div className="cs-enquire-in k-wrap">
            <div className="cs-enquire-text">
              <h2 id="enquire-title" className="t-h1">
                Tell us about the project.
              </h2>
              <p className="t-body t-soft" id="enquire-note">
                Say what you want built and where. The message opens in WhatsApp or your email app, ready to send.
              </p>
              <dl className="cs-facts">
                <div>
                  <dt>50+</dt>
                  <dd>Completed projects</dd>
                </div>
                <div>
                  <dt>100+</dt>
                  <dd>Satisfied clients</dd>
                </div>
              </dl>
              <p className="t-small t-soft cs-call">
                Rather talk it through? Call{" "}
                <a className="k-link" href={PHONE_TEL}>
                  {PHONE_DISPLAY}
                </a>
                .
              </p>
            </div>
            <EnquiryForm kind="project" describedBy="enquire-note" />
          </div>
        </section>

        {/* The page ends in the showroom: the finishes are on the floor on Market Road. */}
        <section className="cs-visit" aria-labelledby="cs-visit-h">
          <div className="cs-visit-in k-wrap">
            <figure className="cs-visit-photo">
              <Image
                src="/images/showroom-chandelier-hall-0980.webp"
                alt="Ring pendants, crystal chandeliers and lit fittings hanging in the Kenstar lighting hall"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
              />
              <figcaption className="k-plate-label">The lighting hall</figcaption>
            </figure>
            <div className="cs-visit-text">
              <h2 id="cs-visit-h" className="t-h1">
                See every finish before you build.
              </h2>
              <p className="t-body cs-visit-lede">
                Lighting, furniture, bathroom fittings and electricals are on the showroom floor on {ADDRESS_LINE}, {TOWN}.
              </p>
              <dl className="cs-visit-facts">
                <div>
                  <dt className="t-tech">Today</dt>
                  <dd>
                    <StatusLine className="cs-status" />
                  </dd>
                </div>
                <div>
                  <dt className="t-tech">Hours</dt>
                  <dd>
                    {HOURS_SUMMARY.map((h) => (
                      <span key={h.days} className="block">
                        {h.days}, <span className="whitespace-nowrap">{h.time}</span>
                      </span>
                    ))}
                  </dd>
                </div>
              </dl>
              <div className="cs-visit-actions">
                <a className="k-btn k-btn-primary k-btn-lg" href={MAPS_DIRECTIONS_URL} target="_blank" rel="noopener noreferrer">
                  Get directions <ArrowRight size={18} className="nudge" />
                </a>
                <Link className="k-btn k-btn-secondary k-btn-lg" href="/products">
                  See the products
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
      <MobileActionBar />
    </>
  );
}
