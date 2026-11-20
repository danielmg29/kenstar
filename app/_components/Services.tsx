import Image from "next/image";
import { Chat } from "./icons";
import { SERVICES, whatsappLink } from "../_content/site";

export function Services() {
  return (
    <section id="services" aria-labelledby="services-title" className="on-paper bg-paper text-navy">
      <div className="mx-auto max-w-[1600px] px-[var(--gutter)] py-20 md:py-28">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <h2 id="services-title" className="heading text-[clamp(2rem,4.2vw,3.6rem)]">
            Beyond the showroom
          </h2>
          <p className="lede self-end text-[1.125rem] text-navy-soft">
            Kenstar also builds. Construction, civil works and roadworks for residential and commercial clients, with materials delivered to site.
          </p>
        </div>

        {/* A schedule of works: one ruled row per service */}
        <div className="mt-12 border-t-2 border-navy">
          {SERVICES.map((s) => (
            <div
              key={s.name}
              className="grid gap-x-6 gap-y-3 border-b border-[var(--line)] py-7 md:grid-cols-[minmax(0,1.3fr)_minmax(0,2fr)_12rem_11rem] md:items-center"
            >
              <h3 className="heading text-[1.5rem] md:text-[1.6rem]">{s.name}</h3>
              <p className="text-[1rem] leading-relaxed text-navy-soft">{s.scope}</p>
              <div>
                {s.photo ? (
                  <div className="relative aspect-[4/3] w-full max-w-[14rem] overflow-hidden md:max-w-none">
                    <Image src={s.photo.src} alt={s.photo.alt} fill sizes="(min-width: 768px) 12rem, 14rem" className="object-cover" />
                  </div>
                ) : (
                  <p className="text-[0.95rem] text-navy-soft">No photo yet</p>
                )}
              </div>
              <div className="md:text-right">
                <a href={whatsappLink(s.enquiry)} target="_blank" rel="noopener noreferrer" className="textlink text-navy">
                  <Chat size={16} />
                  Ask on WhatsApp
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
