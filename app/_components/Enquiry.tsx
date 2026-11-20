"use client";

import { useId, useRef, useState } from "react";
import { Chat, Mail, Phone } from "./icons";
import { EMAIL, PHONE_DISPLAY, PHONE_TEL, RANGES, whatsappLink } from "../_content/site";

const TOPICS = [...RANGES.map((r) => r.name), "Construction & civil works", "Roadworks", "Delivery & equipment hire", "Something else"];

type Errors = Partial<Record<"name" | "phone" | "message", string>>;

export function Enquiry() {
  const id = useId();
  const form = useRef<HTMLFormElement>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState<null | "whatsapp" | "email">(null);

  function read() {
    const fd = new FormData(form.current!);
    const v = (k: string) => String(fd.get(k) ?? "").trim();
    return { name: v("name"), phone: v("phone"), topic: v("topic"), message: v("message") };
  }

  function validate(d: ReturnType<typeof read>) {
    const e: Errors = {};
    if (!d.name) e.name = "Add your name so we know who to reply to.";
    if (!d.phone) e.phone = "Add a phone number so we can call or WhatsApp you back.";
    else if (d.phone.replace(/[^\d]/g, "").length < 9) e.phone = "That number looks too short. Include the full number, for example 0712 345 678.";
    if (!d.message) e.message = "Tell us what you need: the items, quantities, or the project.";
    return e;
  }

  function compose(d: ReturnType<typeof read>) {
    return `Hello Kenstar, this is ${d.name} (${d.phone}).\nEnquiry about: ${d.topic}\n\n${d.message}`;
  }

  function submit(channel: "whatsapp" | "email") {
    const d = read();
    const e = validate(d);
    setErrors(e);
    if (Object.keys(e).length) {
      const first = form.current?.querySelector<HTMLElement>(`[name="${Object.keys(e)[0]}"]`);
      first?.focus();
      setSent(null);
      return;
    }
    const text = compose(d);
    if (channel === "whatsapp") {
      window.open(whatsappLink(text), "_blank", "noopener,noreferrer");
    } else {
      window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(`Enquiry: ${d.topic}`)}&body=${encodeURIComponent(text)}`;
    }
    setSent(channel);
  }

  const field =
    "mt-2 block w-full border border-[var(--line-strong)] bg-paper px-4 py-3 text-[1.02rem] text-navy placeholder:text-navy-soft/80 transition-colors focus:border-navy focus:outline-2 focus:outline-offset-0 focus:outline-navy aria-[invalid=true]:border-[var(--error)]";

  return (
    <section id="enquire" aria-labelledby="enquire-title" className="on-paper border-t border-[var(--line)] bg-paper-2 text-navy">
      <div className="mx-auto grid max-w-[1600px] gap-12 px-[var(--gutter)] py-20 md:py-28 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <div>
          <h2 id="enquire-title" className="display text-[clamp(2.4rem,5.4vw,4.75rem)]">
            Tell us what you&rsquo;re building.
          </h2>
          <p className="lede mt-5 text-[1.125rem] text-navy-soft">
            Send a materials list, a question about a range, or the outline of a project. We reply on WhatsApp or by phone.
          </p>
          <ul className="mt-10 border-t border-[var(--line)]">
            <li className="border-b border-[var(--line)]">
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 py-4 no-underline hover:bg-paper/60">
                <Chat size={22} />
                <span>
                  <span className="letter block text-navy-soft">WhatsApp</span>
                  <span className="text-[1.1rem]">{PHONE_DISPLAY}</span>
                </span>
              </a>
            </li>
            <li className="border-b border-[var(--line)]">
              <a href={PHONE_TEL} className="flex items-center gap-4 py-4 no-underline hover:bg-paper/60">
                <Phone size={22} />
                <span>
                  <span className="letter block text-navy-soft">Call</span>
                  <span className="text-[1.1rem]">{PHONE_DISPLAY}</span>
                </span>
              </a>
            </li>
            <li className="border-b border-[var(--line)]">
              <a href={`mailto:${EMAIL}`} className="flex items-center gap-4 py-4 no-underline hover:bg-paper/60">
                <Mail size={22} />
                <span>
                  <span className="letter block text-navy-soft">Email</span>
                  <span className="break-all text-[1.1rem]">{EMAIL}</span>
                </span>
              </a>
            </li>
          </ul>
        </div>

        <form
          ref={form}
          noValidate
          className="sheet bg-paper p-6 md:p-10"
          onSubmit={(e) => {
            e.preventDefault();
            submit("whatsapp");
          }}
        >
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label htmlFor={`${id}-name`} className="font-label text-[1rem] font-semibold">
                Your name
              </label>
              <input id={`${id}-name`} name="name" autoComplete="name" className={field} aria-invalid={!!errors.name} aria-describedby={errors.name ? `${id}-name-err` : undefined} />
              {errors.name && (
                <p id={`${id}-name-err`} className="mt-2 text-[0.92rem] text-[var(--error)]">
                  {errors.name}
                </p>
              )}
            </div>
            <div>
              <label htmlFor={`${id}-phone`} className="font-label text-[1rem] font-semibold">
                Phone or WhatsApp number
              </label>
              <input id={`${id}-phone`} name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="07XX XXX XXX" className={field} aria-invalid={!!errors.phone} aria-describedby={errors.phone ? `${id}-phone-err` : undefined} />
              {errors.phone && (
                <p id={`${id}-phone-err`} className="mt-2 text-[0.92rem] text-[var(--error)]">
                  {errors.phone}
                </p>
              )}
            </div>
          </div>
          <div className="mt-6">
            <label htmlFor={`${id}-topic`} className="font-label text-[1rem] font-semibold">
              What is it about?
            </label>
            <select id={`${id}-topic`} name="topic" className={`${field} appearance-none bg-[length:16px] bg-[right_1rem_center] bg-no-repeat pr-10`} style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%230b2d52' stroke-width='2'%3E%3Cpath d='M5 9l7 7 7-7'/%3E%3C/svg%3E\")" }}>
              {TOPICS.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="mt-6">
            <label htmlFor={`${id}-message`} className="font-label text-[1rem] font-semibold">
              What do you need?
            </label>
            <textarea
              id={`${id}-message`}
              name="message"
              rows={5}
              placeholder="For example: 20 bags of cement and roofing sheets for a 3-bedroom house, delivered to site."
              className={`${field} resize-y`}
              aria-invalid={!!errors.message}
              aria-describedby={errors.message ? `${id}-message-err` : undefined}
            />
            {errors.message && (
              <p id={`${id}-message-err`} className="mt-2 text-[0.92rem] text-[var(--error)]">
                {errors.message}
              </p>
            )}
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button type="submit" className="btn btn-navy">
              <Chat size={18} />
              Send on WhatsApp
            </button>
            <button type="button" className="btn btn-line text-navy" onClick={() => submit("email")}>
              <Mail size={18} />
              Send by email instead
            </button>
          </div>
          <div aria-live="polite" className="min-h-[1.5rem]">
            {sent && (
              <p className="mt-5 flex gap-3 border border-[var(--line)] bg-paper-2 px-4 py-3 text-[0.98rem]">
                <span className="status-dot mt-[0.45rem] bg-navy" aria-hidden="true" />
                <span>
                {sent === "whatsapp"
                  ? "Your message is ready in WhatsApp. Press send there to reach us."
                  : "Your message is ready in your email app. Press send there to reach us."}{" "}
                Nothing opened?{" "}
                <a href={PHONE_TEL} className="font-semibold">
                  Call {PHONE_DISPLAY}
                </a>
                .
                </span>
              </p>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
