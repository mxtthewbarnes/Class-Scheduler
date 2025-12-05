import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./ClassSearch.css";

// Map "MWF" -> ["Mon","Wed","Fri"], "TR" -> ["Tue","Thu"]
function parseDays(short) {
  const map = { M: "Mon", T: "Tue", W: "Wed", R: "Thu", F: "Fri" };
  return (short || "")
    .split("")
    .map((ch) => map[ch])
    .filter(Boolean);
}

// Normalize DB row -> UI course shape
function normalize(row) {
  return {
    id: row.id ?? `${row.code}-${row.start_time}-${row.days}`,
    code: row.code,
    title: row.title,
    instructor: row.instructor,
    start: row.start_time,
    end: row.end_time,
    days: Array.isArray(row.days) ? row.days : parseDays(row.days),
  };
}

const MOCK = [
  {
    id: 1,
    code: "CPTS101",
    title: "Intro to Computer Science",
    instructor: "Dr. Smith",
    start: "09:00",
    end: "10:15",
    days: ["Mon", "Wed", "Fri"],
  },
  {
    id: 2,
    code: "CPTS322",
    title: "Software Engineering",
    instructor: "Dr. Lee",
    start: "11:00",
    end: "12:15",
    days: ["Tue", "Thu"],
  },
  {
    id: 3,
    code: "MATH201",
    title: "Calculus I",
    instructor: "Dr. Johnson",
    start: "14:00",
    end: "15:15",
    days: ["Mon", "Wed", "Fri"],
  },
];

export default function ClassSearch() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [usingMock, setUsingMock] = useState(false);
  const [query, setQuery] = useState("");

  // 🔥 Key change: Read backend URL from environment or fallback to localhost
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

  useEffect(() => {
    let cancelled = false;

    fetch(`${API_BASE}/api/courses`)
      .then((res) => {
        if (!res.ok) throw new Error("bad status");
        return res.json();
      })
      .then((json) => {
        if (cancelled) return;
        const list = Array.isArray(json) ? json.map(normalize) : [];
        setCourses(list.length ? list : MOCK);
        setUsingMock(!list.length);
      })
      .catch(() => {
        if (cancelled) return;
        setCourses(MOCK);
        setUsingMock(true);
      });

    return () => {
      cancelled = true;
    };
  }, [API_BASE]);

  function addToSchedule(course) {
    const key = "selectedCourses";
    const existing = JSON.parse(localStorage.getItem(key) || "[]");
    const already = existing.some((c) => c.id === course.id);
    const updated = already ? existing : [...existing, course];
    localStorage.setItem(key, JSON.stringify(updated));
    navigate("/schedule");
  }

  const lowerQuery = query.trim().toLowerCase();
  const filtered = courses.filter((c) => {
    if (!lowerQuery) return true;
    return (
      c.code.toLowerCase().includes(lowerQuery) ||
      c.title.toLowerCase().includes(lowerQuery) ||
      (c.instructor || "").toLowerCase().includes(lowerQuery)
    );
  });

  return (
    <div className="catalog-page">
      <div className="catalog-shell">
        {/* header */}
        <header className="catalog-header">
          <div>
            <div className="catalog-label">COURSE CATALOG</div>
            <h1 className="catalog-title">Available courses</h1>
            <p className="catalog-subtitle">
              Browse the full list of offerings and add classes directly to your
              weekly schedule.
            </p>
          </div>
          <div className="catalog-actions">
            <Link to="/dashboard" className="btn ghost">
              Dashboard
            </Link>
            <Link to="/schedule" className="btn">
              View weekly schedule
            </Link>
          </div>
        </header>

        {/* search + meta */}
        <section className="catalog-controls">
          <div className="search-group">
            <label className="search-label">
              Search by course code, title, or instructor
            </label>
            <input
              type="text"
              className="search-input"
              placeholder="e.g. CPTS322, Calculus, Dr. Smith"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="catalog-meta">
            <span className="meta-chip">
              Showing {filtered.length} of {courses.length} courses
            </span>
            {usingMock && (
              <span className="meta-note">
                Using mock data – backend at <code>/api/courses</code> was not
                available.
              </span>
            )}
          </div>
        </section>

        {/* course list */}
        <section className="catalog-list-wrapper">
          <ul className="catalog-list">
            {filtered.map((c) => (
              <li key={c.id} className="catalog-row">
                <div className="course-main">
                  <div className="course-code-title">
                    <span className="course-code">{c.code}</span>
                    <span className="course-title-text"> — {c.title}</span>
                  </div>
                  <div className="course-meta-line">
                    <span>{c.instructor || "TBA"}</span>
                    <span>• {c.days.join("/")}</span>
                    <span>
                      • {c.start}–{c.end}
                    </span>
                  </div>
                </div>

                <button
                  className="btn add-btn"
                  type="button"
                  onClick={() => addToSchedule(c)}
                >
                  Add to schedule
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}