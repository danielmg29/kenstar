import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "../_components/SiteHeader";
import { SiteFooter } from "../_components/SiteFooter";
import { MobileActionBar } from "../_components/MobileActionBar";
import { StatusLine } from "../_components/StatusLine";
import { ArrowRight } from "../_components/icons";
import { EVERYTHING, FACTS, type IndexLine } from "../_content/about";
import { ADDRESS_LINE, HOURS_SUMMARY, MAPS_DIRECTIONS_URL, TOWN } from "../_content/site";
import "./about.css";

export const metadata: Metadata = {
  title: "About | Kenstar Limited, Embu",
  description:
    "Kenstar Limited: a hardware and home showroom on Market Road, Embu, with 200+ products at wholesale prices, and the business that builds around it.",
};

const GROUPS: { name: IndexLine["group"]; label: string }[] = [
  { name: "Showroom", label: "In the showroom" },
  { name: "Building", label: "Building" },
  { name: "Services", label: "Services" },
  { name: "Stay", label: "Stay" },
];

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main className="k-page env-limestone ab">
        <figure className="ab-photo">
          <Image
            src="/images/range-furniture-recliner-0995.webp"
            alt="The Kenstar furniture floor: grey recliner sofas set out under tall windows"
            fill
            preload
            sizes="100vw"
          />
          <figcaption className="k-plate-label">The furniture floor, Market Road</figcaption>
        </figure>

        <div className="k-wrap ab-sheet">

          <section className="ab-intro" aria-labelledby="ab-title">
            <h1 id="ab-title" className="ab-h1">
              A hardware and home showroom in&nbsp;Embu.
            </h1>
            <div className="ab-body">
              <p>
                Kenstar Limited sells six ranges from one showroom on {ADDRESS_LINE}: hardware and building supplies, electricals, lighting, bathroom fittings,
                furniture and finishing, at wholesale prices.
              </p>
              <p>
                Around the showroom, Kenstar builds homes, civil works and roads, delivers materials to site, hires out equipment and lets furnished
                accommodation. One business, from the first line to the final light.
              </p>
            </div>
          </section>

          <dl className="ab-ledger" aria-label="Kenstar in figures">
            {FACTS.map((f) => (
              <div key={f.label}>
                <dt>{f.label}</dt>
                <dd>{f.value}</dd>
              </div>
            ))}
          </dl>

          <section className="ab-index" aria-labelledby="ab-index-h">
            <h2 id="ab-index-h" className="ab-index-h">
              Everything Kenstar does
            </h2>
            <div className="ab-groups">
              {GROUPS.map((g) => (
                <div key={g.name} className="ab-group" data-group={g.name}>
                  <h3 className="t-tech">{g.label}</h3>
                  <ul>
                    {EVERYTHING.filter((l) => l.group === g.name).map((l) => (
                      <li key={l.href}>
                        <Link href={l.href}>
                          {l.name}
                          <ArrowRight size={20} />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="ab-visit env-midnight" aria-labelledby="ab-visit-h">
          <div className="ab-visit-in k-wrap">
            <h2 id="ab-visit-h" className="t-h1">
              Come and see it on Market&nbsp;Road.
            </h2>
            <dl className="ab-visit-facts">
              <div>
                <dt className="t-tech">Today</dt>
                <dd>
                  <StatusLine className="ab-status" />
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
              <div>
                <dt className="t-tech">Address</dt>
                <dd>
                  {ADDRESS_LINE}, {TOWN}
                </dd>
              </div>
            </dl>
            <div className="ab-visit-actions">
              <a className="k-btn k-btn-primary k-btn-lg" href={MAPS_DIRECTIONS_URL} target="_blank" rel="noopener noreferrer">
                Get directions <ArrowRight size={18} className="nudge" />
              </a>
              <Link className="k-btn k-btn-secondary k-btn-lg" href="/products">
                See the products
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
      <MobileActionBar />
    </>
  );
}
