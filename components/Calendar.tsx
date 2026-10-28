"use client";

import { ChangeEvent, useEffect, useState, useMemo } from "react";
import PwaInstallPrompt from "./PwaInstallPrompt";

type Ev = { img: string; note: string };

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const SEASONS: Record<number, { name: string; icon: string }> = {
  0: { name: "Winter", icon: "❄️" },
  1: { name: "Winter", icon: "❄️" },
  2: { name: "Spring", icon: "🌱" },
  3: { name: "Spring", icon: "🌱" },
  4: { name: "Spring", icon: "🌱" },
  5: { name: "Summer", icon: "☀️" },
  6: { name: "Summer", icon: "☀️" },
  7: { name: "Summer", icon: "☀️" },
  8: { name: "Autumn", icon: "🍂" },
  9: { name: "Autumn", icon: "🍂" },
  10: { name: "Autumn", icon: "🍂" },
  11: { name: "Winter", icon: "❄️" },
};

const PRESET_TAGS = [
  { label: "🎂 Birthday", text: "🎂 Birthday: " },
  { label: "❤️ Anniversary", text: "❤️ Anniversary: " },
  { label: "✈️ Vacation", text: "✈️ Trip: " },
  { label: "🎉 Party", text: "🎉 Party: " },
  { label: "⭐ Special", text: "⭐ Special: " },
  { label: "💼 Meeting", text: "💼 Meeting: " },
];

const iso = (m: number, d: number) =>
  `2027-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

export default function Calendar() {
  const [data, setData] = useState<Record<string, Ev>>({});
  const [month, setMonth] = useState(0);
  const [date, setDate] = useState("2027-01-01");
  const [img, setImg] = useState("");
  const [file, setFile] = useState<Blob | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const saved = localStorage.getItem("cal27_theme") as "light" | "dark" | null;
    if (saved) {
      setTheme(saved);
      document.documentElement.setAttribute("data-theme", saved);
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
      document.documentElement.setAttribute("data-theme", "dark");
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("cal27_theme", next);
    document.documentElement.setAttribute("data-theme", next);
    showToast(`Switched to ${next} mode`);
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast((curr) => (curr === msg ? null : curr)), 3200);
  };

  // Load saved events from the server
  useEffect(() => {
    fetch("/api/events")
      .then((r) => r.json())
      .then((d) => {
        setData(d || {});
      })
      .catch(() => {});

    const now = new Date();
    if (now.getFullYear() === 2027) {
      setMonth(now.getMonth());
      setDate(iso(now.getMonth(), now.getDate()));
    }
  }, []);

  // Fill the form when date or data changes
  useEffect(() => {
    const ev = data[date];
    setImg(ev?.img ?? "");
    setNote(ev?.note ?? "");
    setFile(null);
  }, [date, data]);

  // Keyboard navigation for month switching
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["input", "textarea"].includes((e.target as HTMLElement)?.tagName?.toLowerCase())) {
        return;
      }
      if (e.key === "ArrowLeft") {
        setMonth((m) => (m + 11) % 12);
      } else if (e.key === "ArrowRight") {
        setMonth((m) => (m + 1) % 12);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const select = (k: string) => {
    if (!k) return;
    setDate(k);
    setMonth(Number(k.slice(5, 7)) - 1);
  };

  const stepDay = (delta: number) => {
    const [y, m, d] = date.split("-").map(Number);
    const cur = new Date(y, m - 1, d);
    cur.setDate(cur.getDate() + delta);
    if (cur.getFullYear() === 2027) {
      select(iso(cur.getMonth(), cur.getDate()));
    }
  };

  const onFile = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    processImageFile(f);
    e.target.value = "";
  };

  const processImageFile = (f: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const im = new Image();
      im.onload = () => {
        const s = Math.min(1, 1000 / Math.max(im.width, im.height));
        const c = document.createElement("canvas");
        c.width = Math.round(im.width * s);
        c.height = Math.round(im.height * s);
        c.getContext("2d")?.drawImage(im, 0, 0, c.width, c.height);
        c.toBlob(
          (blob) => {
            if (!blob) return;
            setFile(blob);
            setImg(URL.createObjectURL(blob));
            showToast("Photo ready to save 📸");
          },
          "image/jpeg",
          0.85
        );
      };
      im.src = reader.result as string;
    };
    reader.readAsDataURL(f);
  };

  const removePhoto = () => {
    setImg("");
    setFile(null);
    showToast("Photo removed (click Save to apply)");
  };

  const save = async () => {
    setBusy(true);
    try {
      const form = new FormData();
      form.append("date", date);
      form.append("note", note);
      if (file) form.append("image", file, `${date}.jpg`);
      else if (!img) form.append("removeImage", "1");
      const res = await fetch("/api/events", { method: "POST", body: form });
      if (res.ok) {
        const updated = await res.json();
        setData(updated);
        showToast("Memory saved successfully! ✨");
      } else {
        showToast("Error saving event.");
      }
    } catch {
      showToast("Network error saving event.");
    } finally {
      setBusy(false);
    }
  };

  const clear = async () => {
    if (!data[date]) {
      setImg("");
      setNote("");
      setFile(null);
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/events?date=${date}`, { method: "DELETE" });
      if (res.ok) {
        const updated = await res.json();
        setData(updated);
        setImg("");
        setNote("");
        setFile(null);
        showToast("Memory cleared for this date 🗑️");
      } else {
        showToast("Could not clear event.");
      }
    } catch {
      showToast("Network error clearing event.");
    } finally {
      setBusy(false);
    }
  };

  const insertTag = (tagText: string) => {
    if (!note) {
      setNote(tagText);
    } else {
      setNote((prev) => `${prev} ${tagText}`);
    }
  };

  // Human readable date formatted
  const formattedSelectedDate = useMemo(() => {
    try {
      const [y, m, d] = date.split("-").map(Number);
      const dt = new Date(y, m - 1, d);
      return dt.toLocaleDateString("en-US", {
        weekday: "short",
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return date;
    }
  }, [date]);

  // Metrics
  const totalEvents = useMemo(() => {
    return Object.values(data).filter((ev) => ev.note || ev.img).length;
  }, [data]);

  const totalPhotos = useMemo(() => {
    return Object.values(data).filter((ev) => !!ev.img).length;
  }, [data]);

  const monthsWithEvents = useMemo(() => {
    const set = new Set<number>();
    Object.keys(data).forEach((k) => {
      const ev = data[k];
      if (ev?.img || ev?.note) {
        set.add(Number(k.slice(5, 7)) - 1);
      }
    });
    return set;
  }, [data]);

  const first = new Date(2027, month, 1).getDay();
  const days = new Date(2027, month + 1, 0).getDate();

  return (
    <div className="wrap">
      {/* Toast Notification */}
      {toast && (
        <div className="toast" role="status">
          <span>✨</span>
          <span>{toast}</span>
        </div>
      )}

      {/* Topbar Header */}
      <header className="topbar">
        <div className="brand-section">
          <div className="brand-badge">📅</div>
          <div className="brand-info">
            <h1>Calendar <span>2027</span></h1>
            <div className="brand-sub">
              <span>Interactive Memory Studio</span>
              {totalEvents > 0 && (
                <span className="stat-pill">
                  {totalPhotos > 0 && `📸 ${totalPhotos}`} {totalEvents} {totalEvents === 1 ? "memory" : "memories"}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="topbar-actions">
          <button
            onClick={() => {
              const now = new Date();
              const m = now.getMonth();
              setMonth(m);
              setDate(iso(m, Math.min(now.getDate(), 28)));
            }}
            title="Jump to current season"
          >
            🎯 Today
          </button>

          <PwaInstallPrompt />

          <a className="dl" href="/print" title="Print or export high-res PDF">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9V2h12v7" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            PDF (12 mo)
          </a>

          <button
            onClick={toggleTheme}
            className="icon-btn"
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* Month Navigation & Strip */}
      <section className="nav-container">
        <div className="nav-header">
          <div className="nav-title-group">
            <h2>{MONTHS[month]} <span>2027</span></h2>
            <span className="season-tag">
              {SEASONS[month].icon} {SEASONS[month].name}
            </span>
          </div>

          <div className="topbar-actions">
            <button onClick={() => setMonth((m) => (m + 11) % 12)} title="Previous month (Left Arrow)">
              ‹ Prev
            </button>
            <button onClick={() => setMonth((m) => (m + 1) % 12)} title="Next month (Right Arrow)">
              Next ›
            </button>
          </div>
        </div>

        {/* 12-Month Quick-Selector Strip */}
        <div className="month-strip">
          {MONTHS_SHORT.map((mName, idx) => {
            const hasEvent = monthsWithEvents.has(idx);
            const isActive = idx === month;
            return (
              <button
                key={mName}
                onClick={() => setMonth(idx)}
                className={`month-pill ${isActive ? "active" : ""}`}
                title={`${MONTHS[idx]} 2027`}
              >
                {mName}
                {hasEvent && <span className="has-events" />}
              </button>
            );
          })}
        </div>
      </section>

      {/* Memory Studio (Event & Photo Editor) */}
      <section className="panel">
        <div className="panel-header">
          <div className="selected-date-badge">
            <span className="editor-tag">Editing Date</span>
            <span className="date-pill">{formattedSelectedDate}</span>
          </div>

          <div className="step-btns">
            <button onClick={() => stepDay(-1)} title="Previous day">‹ Day</button>
            <button onClick={() => stepDay(1)} title="Next day">Day ›</button>
          </div>
        </div>

        <div className="panel-grid">
          <div>
            <label htmlFor="date-input">Select Date</label>
            <div className="input-container">
              <input
                id="date-input"
                type="date"
                min="2027-01-01"
                max="2027-12-31"
                value={date}
                onChange={(e) => select(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label>Memory Photo</label>
            <div className="photo-uploader">
              <div className="dropzone">
                <input
                  id="photo-file"
                  type="file"
                  accept="image/*"
                  onChange={onFile}
                  title="Choose a photo for this date"
                />
                <div className="dropzone-text">
                  📷 {img ? "Replace photo" : "Upload memory photo"}
                </div>
                <div className="dropzone-sub">
                  Drag &amp; drop or click to browse
                </div>
              </div>

              {img && (
                <div className="photo-preview-card">
                  <img src={img} alt="Event preview" />
                  <button
                    onClick={removePhoto}
                    className="remove-photo-badge"
                    title="Remove this photo"
                    aria-label="Remove photo"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="note-group">
            <label htmlFor="event-note">Memory &amp; Event Note</label>
            <textarea
              id="event-note"
              rows={2}
              maxLength={140}
              placeholder="e.g. Anniversary dinner at 7 PM, Sarah's birthday, Flight to Tokyo..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />

            <div className="textarea-footer">
              <div className="preset-tags">
                {PRESET_TAGS.map((tag) => (
                  <button
                    key={tag.label}
                    type="button"
                    className="preset-tag-btn"
                    onClick={() => insertTag(tag.text)}
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
              <div className="char-counter">{note.length} / 140</div>
            </div>
          </div>
        </div>

        <div className="panel-actions">
          <div className="action-group-left">
            {(data[date]?.note || data[date]?.img) && (
              <button
                type="button"
                className="danger"
                onClick={clear}
                disabled={busy}
              >
                🗑️ Clear Date
              </button>
            )}
          </div>

          <div className="action-group-right">
            <button
              className="pri"
              onClick={save}
              disabled={busy}
            >
              {busy ? "Saving..." : "Save Memory"}
            </button>
          </div>
        </div>
      </section>

      {/* Calendar Grid Section */}
      <section className="calendar-card">
        <div className="grid">
          {WEEKDAYS.map((w, idx) => (
            <div key={w} className={`wd ${idx === 0 ? "sun" : idx === 6 ? "sat" : ""}`}>
              {w}
            </div>
          ))}

          {Array.from({ length: first }, (_, i) => (
            <div key={`b${i}`} className="day blank" />
          ))}

          {Array.from({ length: days }, (_, i) => {
            const d = i + 1;
            const k = iso(month, d);
            const ev = data[k];
            const isSunday = (first + i) % 7 === 0;
            const isSaturday = (first + i) % 7 === 6;
            const isSelected = k === date;
            const hasPhoto = Boolean(ev?.img);

            const classList = [
              "day",
              isSunday && "sun",
              isSaturday && "sat",
              hasPhoto && "img",
              isSelected && "sel",
            ].filter(Boolean).join(" ");

            return (
              <div
                key={k}
                className={classList}
                style={hasPhoto ? { backgroundImage: `url("${ev.img}")` } : undefined}
                onClick={() => select(k)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    select(k);
                  }
                }}
              >
                <div className="day-header">
                  <div className={`n ${isSunday ? "sun-date" : ""} ${isSaturday ? "sat-date" : ""}`}>
                    {d}
                  </div>
                  {hasPhoto && <span className="day-camera-badge">📷</span>}
                </div>
                {ev?.note && <div className="t">{ev.note}</div>}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
