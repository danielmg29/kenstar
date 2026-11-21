// "Your schedule": the lines a visitor ticks, kept on this device only. Storage can be missing or
// blocked (private windows, previews), so memory is the source of truth and storage is best effort.
import { ENTRIES, ENTRY_BY_CODE } from "../../_content/products";
import { EMAIL, whatsappLink } from "../../_content/site";

export type Schedule = { codes: string[]; note: string };

const KEY = "ks-schedule-v1";
const EMPTY: Schedule = { codes: [], note: "" };
const ORDER = new Map(ENTRIES.map((e, i) => [e.code, i]));
export const NOTE_MAX = 600;

let state: Schedule | null = null;
const listeners = new Set<() => void>();

function clean(value: unknown): Schedule {
  const v = (value ?? {}) as Partial<Schedule>;
  const codes = Array.isArray(v.codes) ? v.codes.filter((c): c is string => typeof c === "string" && ENTRY_BY_CODE.has(c)) : [];
  const note = typeof v.note === "string" ? v.note.slice(0, NOTE_MAX) : "";
  return { codes: sort([...new Set(codes)]), note };
}

const sort = (codes: string[]) => codes.sort((a, b) => (ORDER.get(a) ?? 0) - (ORDER.get(b) ?? 0));

function read(): Schedule {
  if (state) return state;
  try {
    const raw = window.localStorage.getItem(KEY);
    state = raw ? clean(JSON.parse(raw)) : EMPTY;
  } catch {
    state = EMPTY;
  }
  return state;
}

function write(next: Schedule) {
  state = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Storage blocked: the schedule still works for this visit.
  }
  listeners.forEach((l) => l());
}

export const scheduleStore = {
  subscribe(cb: () => void) {
    listeners.add(cb);
    // Another tab changed the schedule.
    const onStorage = (e: StorageEvent) => {
      if (e.key !== KEY) return;
      state = null;
      cb();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(cb);
      window.removeEventListener("storage", onStorage);
    };
  },
  get: read,
  server: () => EMPTY,
  toggle(code: string) {
    const s = read();
    const codes = s.codes.includes(code) ? s.codes.filter((c) => c !== code) : sort([...s.codes, code]);
    write({ ...s, codes });
  },
  remove(code: string) {
    const s = read();
    write({ ...s, codes: s.codes.filter((c) => c !== code) });
  },
  setNote(note: string) {
    write({ ...read(), note: note.slice(0, NOTE_MAX) });
  },
  clear() {
    write(EMPTY);
  },
  restore(saved: Schedule) {
    write(clean(saved));
  },
};

export function scheduleText({ codes, note }: Schedule) {
  const lines = codes.map((c) => `${c}  ${ENTRY_BY_CODE.get(c)?.name ?? ""}`);
  const extra = note.trim() ? ["", `Note: ${note.trim()}`] : [];
  return ["Hello Kenstar, this is my schedule from your website:", "", ...lines, ...extra, "", "Could you tell me what you have in stock?"].join("\n");
}

export const scheduleWhatsapp = (s: Schedule) => whatsappLink(scheduleText(s));
export const scheduleEmail = (s: Schedule) =>
  `mailto:${EMAIL}?subject=${encodeURIComponent("My schedule from the Kenstar website")}&body=${encodeURIComponent(scheduleText(s))}`;
