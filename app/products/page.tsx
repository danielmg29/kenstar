import type { Metadata } from "next";
import Image from "next/image";
import { SiteHeader } from "../_components/SiteHeader";
import { SiteFooter } from "../_components/SiteFooter";
import { MobileActionBar } from "../_components/MobileActionBar";
import { StatusLine } from "../_components/StatusLine";
import { ArrowRight, Phone } from "../_components/icons";
import { Schedule } from "../_components/products/Schedule";
import { RANGES } from "../_content/products";
import { ADDRESS_LINE, HOURS_SUMMARY, MAPS_DIRECTIONS_URL, PHONE_DISPLAY, PHONE_TEL, TOWN } from "../_content/site";
import "./products.css";

export const metadata: Metadata = {
  title: "Products | Kenstar Limited, Embu",
  description:
    "Lighting, furniture, bathroom, electricals, finishing and hardware at the Kenstar showroom on Market Road, Embu. Tick what you need and send your schedule, or bring it to the showroom.",
};

export default function ProductsPage() {
  return (
    <>
      <SiteHeader />
      <main className="k-page env-limestone ps">
        <section className="ps-top" aria-labelledby="products-title">
          <div className="ps-title">
            <h1 id="products-title" className="ps-h1">
              Everything a space needs, in one showroom on Market&nbsp;Road.
            </h1>
            <p className="t-lede ps-lede">
              Six ranges, from building supplies to the chandeliers. Add what you need to your schedule, then send it on WhatsApp or show it at the counter in Embu.
            </p>
            <dl className="ps-meta">
              <div className="ps-meta-ranges">
                <dt className="t-tech">Ranges</dt>
                <dd>{RANGES.length}</dd>
              </div>
              <div>
                <dt className="t-tech">Products</dt>
                <dd>200+</dd>
              </div>
              <div className="ps-meta-wide">
                <dt className="t-tech">Showroom</dt>
                <dd>
                  <StatusLine className="ps-status" />
                </dd>
              </div>
            </dl>
          </div>
          <figure className="ps-hero">
            <Image
              src="/images/showroom-chandelier-hall-0980.webp"
              alt="Ring pendants, crystal chandeliers and lit fittings hanging in the Kenstar lighting hall"
              fill
              preload
              sizes="(min-width: 1024px) 58vw, 100vw"
              style={{ objectPosition: "50% 45%" }}
            />
            <figcaption className="k-plate-label">The lighting hall, Kenstar Embu</figcaption>
          </figure>
        </section>

        <Schedule />

        <section className="ps-visit env-midnight" aria-labelledby="visit-title">
          <div className="k-wrap ps-visit-grid">
            <div className="ps-visit-text">
              <h2 id="visit-title" className="t-h1">
                Bring your schedule to Market&nbsp;Road.
              </h2>
              <p className="t-body t-soft ps-visit-lede">
                All six ranges share the showroom in {TOWN} town. Show your schedule at the counter, or send it ahead on WhatsApp and ask what is in stock before you set out.
              </p>
              <dl className="ps-visit-facts">
                <div>
                  <dt className="t-tech">Today</dt>
                  <dd>
                    <StatusLine className="ps-status" />
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
              <div className="ps-visit-actions">
                <a className="k-btn k-btn-primary k-btn-lg" href={MAPS_DIRECTIONS_URL} target="_blank" rel="noopener noreferrer">
                  Get directions <ArrowRight size={18} className="nudge" />
                </a>
                <a className="k-btn k-btn-secondary k-btn-lg" href={PHONE_TEL}>
                  <Phone size={18} /> Call {PHONE_DISPLAY}
                </a>
              </div>
            </div>
            <figure className="ps-visit-photo">
              <Image
                src="/images/showroom-chandeliers-0916.webp"
                alt="Gold and crystal chandeliers, lit, in the Kenstar showroom"
                fill
                sizes="(min-width: 1024px) 45vw, 100vw"
                style={{ objectPosition: "50% 45%" }}
              />
              <figcaption className="k-plate-label">Hung lit, Market Road</figcaption>
            </figure>
          </div>
        </section>
      </main>
      <SiteFooter />
      <MobileActionBar />
    </>
  );
}
