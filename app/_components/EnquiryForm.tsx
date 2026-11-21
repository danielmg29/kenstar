"use client";

import { useId, useRef, useState } from "react";
import { ArrowRight, Mail } from "./icons";
import { EMAIL, whatsappLink } from "../_content/site";
import "./enquiry.css";

// One enquiry form for every page. Nothing is sent from the site: it opens the visitor's WhatsApp or
// email app with the message written, and the visitor presses send there.

export type EnquiryKind = "project" | "stay" | "general";

const WORK = ["Building works", "Civil works", "Roadworks", "Beautification & finishing", "Delivery or equipment hire"];

type Values = Record<string, string>;
type Errors = Record<string, string>;

function validate(kind: EnquiryKind, v: Values): Errors {
  const e: Errors = {};
  if (kind === "project" && !v.work) e.work = "Choose the kind of work, so the right person replies.";
  if (kind === "stay") {
    const today = new Date().toLocaleDateString("en-CA");
    if (!v.arrive) e.arrive = "Add the day you would arrive.";
    else if (v.arrive < today) e.arrive = "That day has passed. Choose today or a later day.";
    if (!v.leave) e.leave = "Add the day you would leave.";
    else if (v.arrive && v.leave <= v.arrive) e.leave = "The leaving day must come after the arriving day.";
    if (v.guests && !(/^\d+$/.test(v.guests) && +v.guests >= 1 && +v.guests <= 20)) e.guests = "Guests must be a whole number from 1 to 20.";
  }
  if (kind === "general" && !v.topic) e.topic = "Choose what your enquiry is about.";
  if (!v.name) e.name = "Add your name so Kenstar knows who to reply to.";
  if (!v.phone) e.phone = "Add a phone number for a call or WhatsApp back.";
  else if (/[^\d\s+()-]/.test(v.phone)) e.phone = "Use digits only, for example 0712 345 678 or +254 712 345 678.";
  else if (v.phone.replace(/[^\d]/g, "").length < 9) e.phone = "That number looks too short. Include the full number, for example 0712 345 678.";
  if (kind !== "stay" && !v.message) e.message = kind === "project" ? "Say what you want built, or the job you need done." : "Say what you need: the items, quantities or the project.";
  return e;
}

const day = (iso: string) => (iso ? new Date(`${iso}T12:00:00`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "long", year: "numeric" }) : "");

function compose(kind: EnquiryKind, v: Values) {
  const who = `Hello Kenstar, this is ${v.name} (${v.phone}).`;
  if (kind === "project") {
    return [who, `Project: ${v.work}${v.site ? `, at ${v.site}` : ""}.`, "", v.message].join("\n");
  }
  if (kind === "stay") {
    const guests = v.guests ? `, ${v.guests} ${v.guests === "1" ? "guest" : "guests"}` : "";
    return [who, `Is the furnished accommodation free from ${day(v.arrive)} to ${day(v.leave)}${guests}?`, ...(v.message ? ["", v.message] : [])].join("\n");
  }
  return [who, `About: ${v.topic}`, "", v.message].join("\n");
}

const SUBJECT: Record<EnquiryKind, (v: Values) => string> = {
  project: (v) => `Project enquiry: ${v.work}`,
  stay: () => "Accommodation: availability",
  general: (v) => `Enquiry: ${v.topic}`,
};

type Props = { kind: EnquiryKind; topics?: string[]; defaultTopic?: string; describedBy?: string };

export function EnquiryForm({ kind, topics = [], defaultTopic, describedBy }: Props) {
  const id = useId();
  const form = useRef<HTMLFormElement>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState("");

  function read(): Values {
    const fd = new FormData(form.current!);
    const out: Values = {};
    fd.forEach((val, key) => (out[key] = String(val).trim()));
    return out;
  }

  function submit(channel: "whatsapp" | "email") {
    const v = read();
    const e = validate(kind, v);
    setErrors(e);
    if (Object.keys(e).length) {
      setSent("");
      form.current?.querySelector<HTMLElement>(`[name="${Object.keys(e)[0]}"]`)?.focus();
      return;
    }
    const text = compose(kind, v);
    if (channel === "whatsapp") {
      // Open without the "noopener" feature so a blocked pop-up can be detected (it returns null), then
      // cut the opener by hand. When blocked, open WhatsApp in this tab so the message is never lost.
      const opened = window.open(whatsappLink(text), "_blank");
      if (opened) opened.opener = null;
      else window.location.href = whatsappLink(text);
      setSent("WhatsApp opened with your message. Press send there to reach Kenstar.");
    } else {
      window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(SUBJECT[kind](v))}&body=${encodeURIComponent(text)}`;
      setSent("Your email app opened with the message. Press send there to reach Kenstar.");
    }
  }

  // A field's error clears as soon as the visitor changes it.
  function clearError(name: string) {
    if (!errors[name]) return;
    setErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }

  const err = (name: string) =>
    errors[name] ? { "aria-invalid": true as const, "aria-describedby": `${id}-${name}-err` } : {};
  const msg = (name: string) =>
    errors[name] ? (
      <p id={`${id}-${name}-err`} className="ke-err">
        {errors[name]}
      </p>
    ) : null;

  return (
    <form
      ref={form}
      className="ke"
      noValidate
      aria-describedby={describedBy}
      onSubmit={(e) => (e.preventDefault(), submit("whatsapp"))}
      onChange={(e) => clearError((e.target as unknown as { name?: string }).name ?? "")}
    >
      {kind === "project" && (
        <fieldset className="ke-full ke-chips" {...(errors.work ? { "aria-describedby": `${id}-work-err` } : {})}>
          <legend className="ke-label">What is the work?</legend>
          <div className="ke-chip-row">
            {WORK.map((w) => (
              <label key={w} className="ke-chip">
                <input type="radio" name="work" value={w} />
                <span>{w}</span>
              </label>
            ))}
          </div>
          {msg("work")}
        </fieldset>
      )}

      {kind === "stay" && (
        <>
          <div>
            <label className="ke-label" htmlFor={`${id}-arrive`}>
              Arriving
            </label>
            <input className="ke-input" id={`${id}-arrive`} name="arrive" type="date" {...err("arrive")} />
            {msg("arrive")}
          </div>
          <div>
            <label className="ke-label" htmlFor={`${id}-leave`}>
              Leaving
            </label>
            <input className="ke-input" id={`${id}-leave`} name="leave" type="date" {...err("leave")} />
            {msg("leave")}
          </div>
        </>
      )}

      {kind === "general" && topics.length > 0 && (
        <div className="ke-full">
          <label className="ke-label" htmlFor={`${id}-topic`}>
            About
          </label>
          <select className="ke-input" id={`${id}-topic`} name="topic" defaultValue={defaultTopic ?? ""} {...err("topic")}>
            <option value="" disabled>
              Choose a topic
            </option>
            {topics.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          {msg("topic")}
        </div>
      )}

      <div>
        <label className="ke-label" htmlFor={`${id}-name`}>
          Your name
        </label>
        <input className="ke-input" id={`${id}-name`} name="name" type="text" autoComplete="name" {...err("name")} />
        {msg("name")}
      </div>
      <div>
        <label className="ke-label" htmlFor={`${id}-phone`}>
          Phone or WhatsApp number
        </label>
        <input className="ke-input" id={`${id}-phone`} name="phone" type="tel" autoComplete="tel" inputMode="tel" {...err("phone")} />
        {msg("phone")}
      </div>

      {kind === "stay" && (
        <div className="ke-full">
          <label className="ke-label" htmlFor={`${id}-guests`}>
            Guests <span>(optional)</span>
          </label>
          <input className="ke-input ke-narrow" id={`${id}-guests`} name="guests" type="number" inputMode="numeric" min={1} max={20} step={1} {...err("guests")} />
          {msg("guests")}
        </div>
      )}

      {kind === "project" && (
        <div className="ke-full">
          <label className="ke-label" htmlFor={`${id}-site`}>
            Where is the site? <span>(optional)</span>
          </label>
          <input className="ke-input" id={`${id}-site`} name="site" type="text" placeholder="Town or area" />
        </div>
      )}

      <div className="ke-full">
        <label className="ke-label" htmlFor={`${id}-message`}>
          {kind === "project" ? "What do you need?" : kind === "stay" ? "Anything else" : "Your message"}
          {kind === "stay" && <span> (optional)</span>}
        </label>
        <textarea
          className="ke-input ke-area"
          id={`${id}-message`}
          name="message"
          rows={4}
          placeholder={kind === "project" ? "The building, the size, the stage it is at" : kind === "stay" ? "Arrival time, questions" : "The items, quantities or the project"}
          {...err("message")}
        />
        {msg("message")}
      </div>

      <div className="ke-full ke-actions">
        <button type="submit" className="k-btn k-btn-primary k-btn-lg">
          Send on WhatsApp <ArrowRight size={18} className="nudge" />
        </button>
        <button type="button" className="k-btn k-btn-secondary k-btn-lg" onClick={() => submit("email")}>
          <Mail size={18} /> Email instead
        </button>
      </div>
      <p className="ke-full ke-sent" role="status">
        {sent}
      </p>
    </form>
  );
}
