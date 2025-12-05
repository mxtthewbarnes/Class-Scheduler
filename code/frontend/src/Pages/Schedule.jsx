import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Schedule.css";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const START_HOUR = 8;  // 8:00 AM
const END_HOUR = 18;   // 6:00 PM

const DAY_TO_COL = { Mon: 2, Tue: 3, Wed: 4, Thu: 5, Fri: 6 };

function hourLabel(h) {
  const ampm = h >= 12 ? "PM" : "AM";
  const hr12 = ((h + 11) % 12) + 1;
  return `${hr12}:00 ${ampm}`;
}

function parseTime(t) {
  if (!t) return { h: START_HOUR, m: 0 };
  const [hh, mm] = t.split(":").map(Number);
  return { h: hh, m: mm || 0 };
}

export default function Schedule() {
  const hours = [];
  for (let h = START_HOUR; h <= END_HOUR; h++) hours.push(h);

  const [selected, setSelected] = useState([]);
  const [removeId, setRemoveId] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const raw = localStorage.getItem("selectedCourses") || "[]";
      const list = JSON.parse(raw);
      if (Array.isArray(list)) setSelected(list);
    } catch (e) {
      console.error("Could not read selectedCourses from localStorage", e);
    }
  }, []);

  function removeSelected() {
    const next = selected.filter((c) => String(c.id) !== String(removeId));
    setSelected(next);
    localStorage.setItem("selectedCourses", JSON.stringify(next));
    setRemoveId("");
  }

  function clearSchedule() {
    localStorage.removeItem("selectedCourses");
    setSelected([]);
    setRemoveId("");
  }

  const classesCount = selected.length;

  return (
    <div className="schedule-page">
      <div className="schedule-shell">
        <div className="sched-layout">
          {/* Left sidebar */}
          <aside className="sched-sidebar">
            <h2 className="sidebar-title">Menu</h2>

            <button
              className="pill-btn"
              type="button"
              onClick={() => navigate("/dashboard")}
            >
              Back to dashboard
            </button>

            <Link to="/classSearch" className="pill-btn secondary-pill">
              Browse course catalog
            </Link>

            <div className="sidebar-counter">
              <span>Classes in schedule</span>
              <span className="counter-badge">{classesCount}</span>
            </div>

            {selected.length > 0 && (
              <div className="remove-panel">
                <label className="label">Remove a class</label>
                <select
                  className="select"
                  value={removeId}
                  onChange={(e) => setRemoveId(e.target.value)}
                >
                  <option value="">— choose —</option>
                  {selected.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} — {c.title}
                    </option>
                  ))}
                </select>

                <div className="remove-buttons">
                  <button
                    className="btn"
                    onClick={removeSelected}
                    disabled={!removeId}
                  >
                    Remove
                  </button>
                  <button className="btn ghost" onClick={clearSchedule}>
                    Clear all
                  </button>
                </div>
              </div>
            )}
          </aside>

          {/* Main calendar panel */}
          <main className="sched-main">
            <header className="sched-header">
              <div>
                <h1 className="sched-title">Weekly schedule</h1>
                <p className="sched-subtitle">
                  See how your classes line up across the week.
                </p>
              </div>
              <div className="header-actions">
                <button
                  type="button"
                  className="chip-btn"
                  onClick={() => navigate("/dashboard")}
                >
                  Dashboard
                </button>
                <button
                  type="button"
                  className="chip-btn"
                  onClick={() => navigate("/classSearch")}
                >
                  Add more classes
                </button>
              </div>
            </header>

            <div className="grid">
              {/* top-left corner spacer */}
              <div className="corner" />

              {/* Day headers */}
              {DAYS.map((d) => (
                <div key={d} className="day-header">
                  {d}
                </div>
              ))}

              {/* Time labels + empty cells */}
              {hours.map((h) => (
                <React.Fragment key={h}>
                  <div className="time-cell">{hourLabel(h)}</div>
                  {DAYS.map((d) => (
                    <div key={d + h} className="slot-cell" />
                  ))}
                </React.Fragment>
              ))}

              {/* Course blocks */}
              {selected.flatMap((c) => {
                const { h: sh } = parseTime(c.start);
                const { h: eh } = parseTime(c.end);

                const startRow = sh - START_HOUR + 2; // +2 for header row & first time row
                const durationHours = Math.max(1, eh - sh || 1);
                const rowSpan = durationHours; // snap to full hours

                const days = Array.isArray(c.days) ? c.days : [];
                return days.map((day) => {
                  const col = DAY_TO_COL[day];
                  if (!col) return null;

                  return (
                    <div
                      key={`${c.id}-${day}`}
                      className="course-cell"
                      style={{
                        gridColumn: `${col} / ${col + 1}`,
                        gridRow: `${startRow} / span ${rowSpan}`,
                      }}
                    >
                      <div className="course-block">
                        <div className="course-title">{c.code}</div>
                        <div className="course-meta">
                          {c.title} • {c.instructor} • {c.start}–{c.end}
                        </div>
                      </div>
                    </div>
                  );
                });
              })}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
