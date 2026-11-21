"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ArrowRight, Chat, Check, Close, Expand, Mail, Phone, Plus } from "../icons";
import { Wordmark } from "../brand";
import { ENTRY_BY_CODE, RANGES, type Entry, type Range } from "../../_content/products";
import { ADDRESS_LINE, PHONE_TEL, TOWN, whatsappLink } from "../../_content/site";
import { NOTE_MAX, scheduleEmail, scheduleStore, scheduleWhatsapp, type Schedule as Saved } from "./store";

function useSchedule() {
  return useSyncExternalStore(scheduleStore.subscribe, scheduleStore.get, scheduleStore.server);
}

const items = (n: number) => `${n} ${n === 1 ? "item" : "items"}`;
const NOTE_WARN = NOTE_MAX - 150;

/* ---------- The index: the six ranges, then the schedule itself, sticky over the catalogue ---------- */
function ScheduleIndex({ n }: { n: number }) {
  const [active, setActive] = useState<string>(RANGES[0].slug);
  const listRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const line = window.innerHeight * 0.35;
      let current = RANGES[0].slug;
      for (const r of RANGES) {
        const el = document.getElementById(r.slug);
        if (el && el.getBoundingClientRect().top <= line) current = r.slug;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // On phones the strip scrolls sideways: keep the current range in view.
  useEffect(() => {
    const list = listRef.current;
    const link = list?.querySelector<HTMLElement>(`a[href="#${active}"]`);
    if (!list || !link || list.scrollWidth <= list.clientWidth) return;
    const left = link.offsetLeft - list.clientWidth / 2 + link.offsetWidth / 2;
    list.scrollTo({ left, behavior: "smooth" });
  }, [active]);

  return (
    <nav aria-label="Ranges and your schedule" className="ps-index">
      <div className="ps-index-in k-wrap">
        <ol ref={listRef} className="ps-index-ranges">
          {RANGES.map((r) => {
            const published = r.entries.length > 1;
            return (
              <li key={r.slug}>
                <a href={`#${r.slug}`} aria-current={active === r.slug ? "true" : undefined}>
                  <span className="ps-index-code">{r.code}</span>
                  <span className="ps-index-name">{r.short}</span>
                  {published && (
                    <span className="ps-index-n">
                      {r.entries.length}
                      <span className="sr-only"> lines</span>
                    </span>
                  )}
                </a>
              </li>
            );
          })}
        </ol>
        <a
          href="#your-schedule"
          className="ps-index-mine"
          onClick={(e) => {
            // The dock is already on screen beside the list: move focus to it rather than scrolling away.
            const title = document.getElementById("dock-title");
            if (!title) return;
            e.preventDefault();
            title.focus({ preventScroll: true });
          }}
        >
          <span className="ps-index-code">Your schedule</span>
          <span className="ps-index-n">{items(n)}</span>
        </a>
      </div>
    </nav>
  );
}

/* ---------- One line of the schedule ---------- */
function Row({ entry, on, onToggle }: { entry: Entry; on: boolean; onToggle: (e: Entry) => void }) {
  return (
    <li className="ps-row" data-on={on || undefined}>
      <span className="ps-code">{entry.code}</span>
      <div className="ps-ph">
        <Image src={entry.photo.src} alt={entry.photo.alt} fill sizes="(min-width: 768px) 176px, 112px" style={{ objectPosition: entry.photo.position ?? "50% 50%" }} />
      </div>
      <div className="ps-text">
        <h3>{entry.name}</h3>
        <p>{entry.line}</p>
        {entry.photo.standIn && <p className="ps-ill">Illustrative photo</p>}
      </div>
      <div className="ps-act">
        <button
          type="button"
          className="ps-add k-btn k-btn-sm"
          data-on={on || undefined}
          aria-label={on ? `Remove ${entry.name} from your schedule` : `Add ${entry.name} to your schedule`}
          onClick={() => onToggle(entry)}
        >
          {on ? <Check size={16} /> : <Plus size={16} />}
          {on ? "In your schedule" : "Add to schedule"}
        </button>
        <a
          className="k-link ps-ask"
          href={whatsappLink(`Hello Kenstar, I'd like to ask about ${entry.name.toLowerCase()} (${entry.code}).`)}
          target="_blank"
          rel="noopener noreferrer"
        >
          Ask on WhatsApp<span className="sr-only">: {entry.name}</span>
        </a>
      </div>
    </li>
  );
}

function RangeSection({ range, codes, onToggle }: { range: Range; codes: string[]; onToggle: (e: Entry) => void }) {
  return (
    <section id={range.slug} className="ps-range" aria-labelledby={`${range.slug}-h`}>
      <div className="ps-range-head">
        <span className="ps-range-code" aria-hidden="true">
          {range.code}
        </span>
        <h2 id={`${range.slug}-h`} className="ps-range-name">
          {range.name}
        </h2>
        <p className="ps-range-intro">{range.intro}</p>
      </div>
      {range.plate && (
        <figure className="ps-plate">
          <Image
            src={range.plate.src}
            alt={range.plate.alt}
            fill
            sizes="(min-width: 1600px) 1060px, (min-width: 1280px) 68vw, (min-width: 1024px) calc(100vw - 420px), 100vw"
            style={{ objectPosition: range.plate.position ?? "50% 50%" }}
          />
          <figcaption className="k-plate-label">{range.plate.caption}</figcaption>
        </figure>
      )}
      <ul className="ps-list">
        {range.entries.map((e) => (
          <Row key={e.code} entry={e} on={codes.includes(e.code)} onToggle={onToggle} />
        ))}
      </ul>
    </section>
  );
}

/* ---------- Your schedule: the docked Field Note and the phone sheet share it ---------- */
type BodyProps = {
  s: Saved;
  id: string;
  cleared: Saved | null;
  onCounter: () => void;
  onRemove: (code: string, el: HTMLElement) => void;
  onClear: (ev?: React.MouseEvent) => void;
  onUndo: () => void;
  onSent: (via: string) => void;
  sent: string;
};

function ScheduleBody({ s, id, cleared, onCounter, onRemove, onClear, onUndo, onSent, sent }: BodyProps) {
  const n = s.codes.length;
  const left = NOTE_MAX - s.note.length;
  return (
    <>
      <div className="ps-panel-head">
        <h2 className="t-tech ps-panel-title" id={`${id}-title`} tabIndex={-1}>
          Your schedule
        </h2>
        <p className="ps-count">{items(n)}</p>
      </div>
      {n === 0 ? (
        cleared ? (
          <p className="ps-empty">
            Schedule cleared.{" "}
            <button type="button" className="k-link ps-undo" onClick={onUndo}>
              Undo
            </button>
          </p>
        ) : (
          <p className="ps-empty">Add what you need. Send it on WhatsApp or by email, or show it on your phone at the showroom.</p>
        )
      ) : (
        <>
          <ol className="ps-items">
            {s.codes.map((c) => {
              const e = ENTRY_BY_CODE.get(c)!;
              return (
                <li key={c}>
                  <span className="t-tech ps-items-code">{c}</span>
                  <span className="ps-items-name">{e.name}</span>
                  <button type="button" className="ps-x" aria-label={`Remove ${e.name}`} onClick={(ev) => onRemove(c, ev.currentTarget)}>
                    <Close size={16} />
                  </button>
                </li>
              );
            })}
          </ol>
          <label htmlFor={`${id}-note`} className="ps-note-label">
            Note for staff <span>(optional)</span>
          </label>
          <textarea
            id={`${id}-note`}
            className="ps-note"
            rows={3}
            maxLength={NOTE_MAX}
            placeholder="Sizes, colours, quantities, the room"
            value={s.note}
            aria-describedby={s.note.length > NOTE_WARN ? `${id}-left` : undefined}
            onChange={(e) => scheduleStore.setNote(e.target.value)}
          />
          {s.note.length > NOTE_WARN && (
            <p className="ps-left" id={`${id}-left`}>
              {left} {left === 1 ? "character" : "characters"} left
            </p>
          )}
          <a className="k-btn k-btn-primary ps-send" href={scheduleWhatsapp(s)} target="_blank" rel="noopener noreferrer" onClick={() => onSent("WhatsApp")}>
            Send on WhatsApp <ArrowRight size={18} className="nudge" />
          </a>
          {sent && (
            <p className="ps-sent" role="status">
              {sent}
            </p>
          )}
          <div className="ps-more">
            <a className="k-btn k-btn-secondary k-btn-sm" href={scheduleEmail(s)} onClick={() => onSent("your email app")}>
              <Mail size={16} /> Email it instead
            </a>
            <button type="button" className="k-btn k-btn-secondary k-btn-sm" onClick={onCounter}>
              <Expand size={16} /> Show it at the counter
            </button>
          </div>
          <button type="button" className="k-link ps-clear" onClick={onClear}>
            Clear the schedule
          </button>
        </>
      )}
    </>
  );
}

// A native dialog: opened with showModal, closed with Escape, the close button or the backdrop.
function useDialog() {
  const ref = useRef<HTMLDialogElement>(null);
  const open = useCallback(() => ref.current?.showModal(), []);
  const close = useCallback(() => ref.current?.close(), []);
  return [ref, open, close] as const;
}

const closeOnBackdrop = (e: React.MouseEvent<HTMLDialogElement>) => {
  if (e.target === e.currentTarget) e.currentTarget.close();
};

// The whole screen, for a phone held up at the counter: the names large, each with its photograph.
type CounterProps = { s: Saved; date: string; dialogRef: React.RefObject<HTMLDialogElement | null>; onClose: () => void; close: () => void };

function CounterView({ s, date, dialogRef, onClose, close }: CounterProps) {
  return (
    <dialog ref={dialogRef} className="ps-counter env-limestone" aria-labelledby="ps-counter-title" onClick={closeOnBackdrop} onClose={onClose}>
      <div className="ps-counter-in">
        <div className="ps-counter-top">
          <Wordmark className="ps-counter-logo" title="Kenstar Limited, Embu" locator={false} />
          <button type="button" className="k-icon-btn ps-counter-close" aria-label="Close" onClick={close} autoFocus>
            <Close size={20} />
          </button>
        </div>
        <h2 id="ps-counter-title" className="ps-counter-h">
          My schedule
        </h2>
        <p className="ps-counter-meta">
          {items(s.codes.length)} for the showroom, {ADDRESS_LINE}, {TOWN}
          {date && <>. {date}</>}
        </p>
        <ol className="ps-counter-list">
          {s.codes.map((c) => {
            const e = ENTRY_BY_CODE.get(c)!;
            return (
              <li key={c}>
                <span className="ps-counter-ph">
                  <Image src={e.photo.src} alt="" fill sizes="96px" style={{ objectPosition: e.photo.position ?? "50% 50%" }} />
                </span>
                <span className="ps-counter-name">
                  {e.name}
                  <span className="ps-counter-code">{c}</span>
                </span>
              </li>
            );
          })}
        </ol>
        {s.note.trim() && (
          <div className="ps-counter-note">
            <p className="t-tech">Note</p>
            <p>{s.note}</p>
          </div>
        )}
      </div>
    </dialog>
  );
}

export function Schedule() {
  const s = useSchedule();
  const n = s.codes.length;
  const [said, setSaid] = useState("");
  const [date, setDate] = useState("");
  const [cleared, setCleared] = useState<Saved | null>(null);
  const [sent, setSent] = useState("");
  const fromSheet = useRef(false);
  const [sheetRef, openSheet, closeSheet] = useDialog();
  const [counterRef, openCounter, closeCounter] = useDialog();

  // Back to the sheet the counter view was opened from.
  const onCounterClosed = useCallback(() => {
    if (fromSheet.current) openSheet();
    fromSheet.current = false;
  }, [openSheet]);

  const onToggle = useCallback((e: Entry) => {
    const had = scheduleStore.get().codes.includes(e.code);
    scheduleStore.toggle(e.code);
    setCleared(null);
    setSent("");
    setSaid(`${e.name} ${had ? "removed" : "added"}. ${items(scheduleStore.get().codes.length)} in your schedule.`);
  }, []);

  // Removing a line keeps focus in the list: on the next line's remove button, or the title once empty.
  const onRemove = useCallback((code: string, el: HTMLElement) => {
    const li = el.closest("li");
    const next = (li?.nextElementSibling ?? li?.previousElementSibling)?.querySelector<HTMLElement>(".ps-x");
    const title = el.closest(".ps-panel-body, .ps-sheet-in")?.querySelector<HTMLElement>(".ps-panel-title");
    scheduleStore.remove(code);
    setSent("");
    setSaid(`${ENTRY_BY_CODE.get(code)?.name} removed. ${items(scheduleStore.get().codes.length)} in your schedule.`);
    window.setTimeout(() => (next ?? title)?.focus(), 0);
  }, []);

  const onClear = useCallback((ev?: React.MouseEvent) => {
    const scope = (ev?.currentTarget as HTMLElement | undefined)?.closest(".ps-panel-body, .ps-sheet-in");
    setCleared(scheduleStore.get());
    scheduleStore.clear();
    setSent("");
    setSaid("Schedule cleared. Undo is available.");
    window.setTimeout(() => scope?.querySelector<HTMLElement>(".ps-undo")?.focus(), 0);
  }, []);

  const onUndo = useCallback(() => {
    if (!cleared) return;
    scheduleStore.restore(cleared);
    setCleared(null);
    setSaid(`Schedule restored. ${items(cleared.codes.length)}.`);
  }, [cleared]);

  const onSent = useCallback((via: string) => {
    setSent(`Your schedule opened in ${via}. Press send there to reach Kenstar.`);
  }, []);

  // The close button returns to the sheet at once; Escape and the backdrop get there through onClose.
  const closeCounterView = useCallback(() => {
    closeCounter();
    onCounterClosed();
  }, [closeCounter, onCounterClosed]);

  // The counter view carries today's date, so staff can see the list is current.
  const showCounter = useCallback(() => {
    setDate(new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }));
    fromSheet.current = Boolean(sheetRef.current?.open);
    closeSheet();
    openCounter();
  }, [sheetRef, closeSheet, openCounter]);

  const body = { s, cleared, onCounter: showCounter, onRemove, onClear, onUndo, onSent, sent };

  return (
    <div className="ps-catalogue">
      <ScheduleIndex n={n} />
      <div className="ps-body k-wrap">
        <div className="ps-rows">
          {RANGES.map((r) => (
            <RangeSection key={r.slug} range={r} codes={s.codes} onToggle={onToggle} />
          ))}
        </div>
        <aside className="ps-dock" aria-labelledby="dock-title" id="your-schedule">
          <div className="ps-panel">
            <div className="ps-panel-body env-midnight">
              <ScheduleBody {...body} id="dock" />
            </div>
          </div>
        </aside>
      </div>

      {/* Phones and tablets: once the schedule has something in it, this bar takes the action bar's
          place, so the brass WhatsApp button sends the schedule rather than a blank message. */}
      <nav className="ps-bar env-midnight" hidden={n === 0} aria-label="Your schedule">
        <button type="button" className="ps-bar-open" aria-haspopup="dialog" onClick={openSheet}>
          <span className="ps-bar-label">Your schedule</span>
          <span className="ps-bar-count">{items(n)}</span>
        </button>
        <a className="ps-bar-send" href={scheduleWhatsapp(s)} target="_blank" rel="noopener noreferrer" onClick={() => onSent("WhatsApp")}>
          <Chat size={18} /> Send
        </a>
        <a className="ps-bar-call" href={PHONE_TEL}>
          <Phone size={18} /> Call
        </a>
      </nav>
      <dialog ref={sheetRef} className="ps-sheet env-midnight" aria-labelledby="sheet-title" onClick={closeOnBackdrop}>
        <div className="ps-sheet-in">
          <button type="button" className="k-icon-btn ps-sheet-close" aria-label="Close your schedule" onClick={closeSheet}>
            <Close size={20} />
          </button>
          <ScheduleBody {...body} id="sheet" />
        </div>
      </dialog>
      <CounterView s={s} date={date} dialogRef={counterRef} onClose={onCounterClosed} close={closeCounterView} />

      <p className="sr-only" aria-live="polite">
        {said}
      </p>
    </div>
  );
}
