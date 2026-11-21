"use client";

import { useOpenStatus } from "./OpenStatus";

// The showroom's live open status in East Africa Time, with a dot that turns olive when open.
export function StatusLine({ className }: { className?: string }) {
  const status = useOpenStatus();
  return (
    <span className={className} aria-live="polite">
      <i className="k-dot" data-open={status?.open ?? false} aria-hidden="true" />
      {status ? status.text : "Weekdays 8am – 5pm, weekends 10am – 5pm"}
    </span>
  );
}
