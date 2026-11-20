import Image from "next/image";
import { OpenStatus } from "./OpenStatus";
import { ArrowRight, Chat, Phone, Pin } from "./icons";
import { ADDRESS_LINE, HOURS_SUMMARY, MAPS_DIRECTIONS_URL, MAPS_PLACE_URL, PHONE_DISPLAY, PHONE_TEL, PO_BOX, TOWN, whatsappLink } from "../_content/site";

const VIEWS = [
  { src: "/images/showroom-chandelier-hall-0980.webp", alt: "The lighting hall, hung with chandeliers", label: "View A: lighting hall" },
  { src: "/images/showroom-bathroom-mirrors-0715.webp", alt: "Wall mirrors lining the bathroom gallery", label: "View B: bathroom gallery" },
  { src: "/images/showroom-furniture-floor-0821.webp", alt: "Dining sets on the furniture floor", label: "View C: furniture floor" },
];

export function Showroom() {
  return (
    <section id="showroom" aria-labelledby="showroom-title" className="on-navy relative bg-navy text-paper">
      <div className="relative mx-auto max-w-[1600px] px-[var(--gutter)] py-20 md:py-28">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <div>
            <h2 id="showroom-title" className="display text-[clamp(2.4rem,5.4vw,4.75rem)]">
              Come and see it lit.
            </h2>
            <p className="lede mt-5 text-[1.125rem] text-on-navy-soft">
              The showroom is on {ADDRESS_LINE}, in {TOWN} town. Walk the floor, see every range in person and talk it through with the team.
            </p>

            <div className="mt-10 border border-[var(--line-on-navy)]">
              <dl className="grid grid-cols-[5.5rem_1fr] text-[1rem] sm:grid-cols-[7rem_1fr]">
                <dt className="letter border-b border-r border-[var(--line-on-navy)] px-4 py-3.5 text-on-navy-soft">Address</dt>
                <dd className="border-b border-[var(--line-on-navy)] px-4 py-3.5 leading-snug">
                  {ADDRESS_LINE}, {TOWN}
                  <span className="mt-1 block text-[0.9rem] text-on-navy-soft">{PO_BOX}</span>
                </dd>
                <dt className="letter border-b border-r border-[var(--line-on-navy)] px-4 py-3.5 text-on-navy-soft">Today</dt>
                <dd className="border-b border-[var(--line-on-navy)] px-4 py-3.5">
                  <OpenStatus tone="navy" />
                </dd>
                <dt className="letter border-r border-[var(--line-on-navy)] px-4 py-3.5 text-on-navy-soft">Hours</dt>
                <dd className="px-4 py-3.5">
                  <table className="w-full text-left text-[1rem] [font-variant-numeric:tabular-nums]">
                    <tbody>
                      {HOURS_SUMMARY.map((h) => (
                        <tr key={h.days}>
                          <th scope="row" className="py-0.5 pr-4 font-normal text-on-navy-soft">
                            {h.days.replace(" – ", "–")}
                          </th>
                          <td className="whitespace-nowrap py-0.5">{h.time}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="mt-2 text-[0.88rem] text-on-navy-soft">Public holidays: call to confirm.</p>
                </dd>
              </dl>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <a href={MAPS_DIRECTIONS_URL} target="_blank" rel="noopener noreferrer" className="btn btn-gold">
                <Pin size={18} />
                Get directions
              </a>
              <a href={PHONE_TEL} className="btn btn-line text-paper">
                <Phone size={18} />
                {PHONE_DISPLAY}
              </a>
              <a href={whatsappLink("Hello Kenstar, I'm planning to visit the showroom.")} target="_blank" rel="noopener noreferrer" className="btn btn-line text-paper">
                <Chat size={18} />
                WhatsApp
              </a>
            </div>
            <a href={MAPS_PLACE_URL} target="_blank" rel="noopener noreferrer" className="textlink mt-6 text-on-navy-soft">
              See Kenstar Electricals &amp; Hardware on Google Maps
              <ArrowRight size={16} />
            </a>
          </div>

          {/* Three views of the floor, set like elevations on one sheet. On desktop the lit lighting hall
              starts at the seam under Final light, so the light carries straight on into the showroom. */}
          <div className="grid grid-cols-6 gap-3 self-start md:gap-4 lg:-mt-28">

            {VIEWS.map((v, i) => (
              <figure key={v.src} className={i === 0 ? "col-span-6" : "col-span-3"}>
                <div className={`relative overflow-hidden ${i === 0 ? "aspect-[16/10]" : "aspect-[4/5]"}`}>
                  <Image src={v.src} alt={v.alt} fill sizes={i === 0 ? "(min-width: 1024px) 55vw, 100vw" : "(min-width: 1024px) 27vw, 50vw"} className="object-cover" />
                </div>
                <figcaption className="letter mt-2.5 flex items-center gap-2 text-on-navy-soft">
                  <span className="h-px w-5 bg-current" aria-hidden="true" />
                  {v.label}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
