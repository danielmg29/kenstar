"use client";

import { DAY_NAMES, formatHour, useDoor } from "../OpenStatus";
import { ArrowRight } from "../icons";
import { ADDRESS_LINE, HOURS, MAPS_DIRECTIONS_URL, PO_BOX, TOWN } from "../../_content/site";

// The sign on the showroom door, read live in Embu time: open or closed, what happens next, and the
// week with today marked. Before it loads, the week's hours stand on their own.
const WEEK = [1, 2, 3, 4, 5, 6, 0];

export function DoorSign() {
  const door = useDoor();
  return (
    <div className="ct-door env-midnight">
      <div className="ct-state" aria-live="polite">
        {door ? (
          <>
            <p className="ct-headline">
              <i className="k-dot" data-open={door.open} aria-hidden="true" />
              {door.headline}
            </p>
            <p className="ct-detail">
              {door.detail}
              <span className="ct-tz"> · Embu time</span>
            </p>
          </>
        ) : (
          <>
            <p className="ct-headline">Opening hours</p>
            <p className="ct-detail">Weekdays 8am – 5pm, weekends 10am – 5pm</p>
          </>
        )}
      </div>

      <div className="ct-hours">
        <table className="ct-week">
          <caption className="sr-only">Opening hours, East Africa Time</caption>
          <tbody>
            {WEEK.map((d) => {
              const today = door?.day === d;
              return (
                <tr key={d} data-today={today || undefined} aria-current={today ? "date" : undefined}>
                  <th scope="row">
                    {DAY_NAMES[d]}
                    {today && <span className="ct-today">Today</span>}
                  </th>
                  <td>
                    {formatHour(HOURS[d].open)} – {formatHour(HOURS[d].close)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className="ct-holiday">Public holidays: call before you come.</p>
      </div>

      <div className="ct-where">
        <address className="not-italic">
          <span className="ct-address">
            {ADDRESS_LINE}, {TOWN}
          </span>
          <span className="ct-po">{PO_BOX}</span>
        </address>
        <a className="k-btn k-btn-primary k-btn-lg" href={MAPS_DIRECTIONS_URL} target="_blank" rel="noopener noreferrer">
          Get directions <ArrowRight size={18} className="nudge" />
        </a>
      </div>
    </div>
  );
}
