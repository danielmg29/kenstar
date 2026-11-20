"use client";

import { useEffect, useState } from "react";
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
