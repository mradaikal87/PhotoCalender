"use client";

import { useEffect, useState } from "react";

type Ev = { img: string; note: string };

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const WEEKDAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const iso = (m: number, d: number) =>
  `2027-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

export default function PrintPage() {
  const [data, setData] = useState<Record<string, Ev>>({});

  useEffect(() => {
    fetch("/api/events").then((r) => r.json()).then(setData).catch(() => {});
  }, []);

  return (
    <div className="wrap">
      <div className="toolbar">
        <a href="/">‹ Back</a>
        <button className="pri" onClick={() => window.print()}>Download PDF (12 months)</button>
      </div>
      <p className="hint">In the print window choose “Save as PDF”, paper A4, landscape. Turn on “Background graphics” if photos are missing.</p>

      <div>
        {MONTHS.map((name, m) => {
          const first = new Date(2027, m, 1).getDay();
          const days = new Date(2027, m + 1, 0).getDate();
          return (
            <section key={name} className="sheet">
              <h2 className="sheet-title">{name} 2027</h2>
              <div className="grid">
                {WEEKDAYS.map((w, idx) => (
                  <div key={w} className={`wd ${idx === 0 ? "sun" : idx === 6 ? "sat" : ""}`}>
                    {w}
                  </div>
                ))}
                {Array.from({ length: first }, (_, i) => <div key={`b${i}`} className="day blank" />)}
                {Array.from({ length: days }, (_, i) => {
                  const d = i + 1;
                  const ev = data[iso(m, d)];
                  const isSunday = (first + i) % 7 === 0;
                  const isSaturday = (first + i) % 7 === 6;
                  const cls = ["day", isSunday && "sun", isSaturday && "sat", ev?.img && "img"].filter(Boolean).join(" ");
                  return (
                    <div key={d} className={cls} style={ev?.img ? { backgroundImage: `url("${ev.img}")` } : undefined}>
                      <div className="day-header">
                        <div className={`n ${isSunday ? "sun-date" : ""} ${isSaturday ? "sat-date" : ""}`}>
                          {d}
                        </div>
                      </div>
                      {ev?.note && <div className="t">{ev.note}</div>}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
