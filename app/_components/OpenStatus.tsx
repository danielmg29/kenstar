"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { HOURS } from "../_content/site";

type Status = { open: boolean; text: string };

const fmt = (h: number) => (h === 12 ? "12pm" : h > 12 ? `${h - 12}pm` : `${h}am`);
const DAY = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function nairobiNow() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Nairobi",
    weekday: "short",
    hour: "numeric",
    minute: "numeric",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "0";
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
  return { day, hour: Number(get("hour")) + Number(get("minute")) / 60 };
}

function computeStatus(): Status {
  const { day, hour } = nairobiNow();
  const today = HOURS[day];
  if (hour >= today.open && hour < today.close) return { open: true, text: `Open now, until ${fmt(today.close)}` };
  if (hour < today.open) return { open: false, text: `Closed, opens ${fmt(today.open)} today` };
  const next = (day + 1) % 7;
  return { open: false, text: `Closed, opens ${fmt(HOURS[next].open)} tomorrow (${DAY[next]})` };
}

export function useOpenStatus() {
  const [status, setStatus] = useState<Status | null>(null);
  useEffect(() => {
    const tick = () => setStatus(computeStatus());
    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, []);
  return status;
}

// The door sign on the Contact page: today's state, what happens next, and which day it is in Embu.
export type DoorState = { day: number; open: boolean; headline: string; detail: string };

function computeDoor(): DoorState {
  const { day, hour } = nairobiNow();
  const today = HOURS[day];
  if (hour >= today.open && hour < today.close) {
    // In the last 90 minutes, say how long is left, so nobody sets out to arrive after closing.
    const left = Math.round((today.close - hour) * 60);
    const soon = left <= 90 ? `, in ${left} ${left === 1 ? "minute" : "minutes"}` : " today";
    return { day, open: true, headline: "Open now", detail: `Closes ${fmt(today.close)}${soon}` };
  }
  if (hour < today.open) return { day, open: false, headline: "Closed", detail: `Opens ${fmt(today.open)} today` };
  const next = (day + 1) % 7;
  return { day, open: false, headline: "Closed", detail: `Opens ${fmt(HOURS[next].open)} tomorrow, ${DAY[next]}` };
}

let door: DoorState | null = null;
const readDoor = () => {
  const next = computeDoor();
  if (!door || door.day !== next.day || door.open !== next.open || door.detail !== next.detail) door = next;
  return door;
};
const subscribeDoor = (cb: () => void) => {
  const id = window.setInterval(cb, 30_000);
  return () => window.clearInterval(id);
};

export function useDoor() {
  return useSyncExternalStore(subscribeDoor, readDoor, () => null);
}

export const DAY_NAMES = DAY;
export const formatHour = fmt;

export function OpenStatus({ tone = "paper" }: { tone?: "paper" | "navy" }) {
  const status = useOpenStatus();
  const closedDot = tone === "navy" ? "var(--on-navy-soft)" : "var(--navy-soft)";
  if (!status) {
    return <span>Open daily: weekdays from 8am, weekends from 10am</span>;
  }
  return (
    <span className="inline-flex items-center gap-2" aria-live="polite">
      <span className="status-dot" style={{ background: status.open ? "var(--gold)" : closedDot }} />
      {status.text}
    </span>
  );
}
