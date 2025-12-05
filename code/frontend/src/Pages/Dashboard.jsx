import React, { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate, Link } from "react-router-dom";
import "./Dashboard.css";

const TARGET_CREDITS = 15; // used for planning status bar

function Dashboard() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [scheduledCount, setScheduledCount] = useState(0);
  const [showProfile, setShowProfile] = useState(false); // NEW

  const navigate = useNavigate();

  // watch auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingUser(false);
    });
    return () => unsubscribe();
  }, []);

  // read saved schedule from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("selectedCourses") || "[]";
      const list = JSON.parse(raw);
      if (Array.isArray(list)) {
        setScheduledCount(list.length);
      } else {
        setScheduledCount(0);
      }
    } catch {
      setScheduledCount(0);
    }
  }, []);

  async function handleLogout() {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (err) {
      console.error("Error signing out:", err);
    }
  }

  if (loadingUser) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-shell">
          <div className="dash-loading">Loading your dashboard...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    navigate("/login");
    return null;
  }

  const estimatedCredits = scheduledCount * 3;
  const progressPct = Math.max(
    0,
    Math.min(100, (estimatedCredits / TARGET_CREDITS) * 100)
  );

  let loadLabel = "Not started";
  if (estimatedCredits > 0 && estimatedCredits < 12) loadLabel = "Light load";
  else if (estimatedCredits >= 12 && estimatedCredits <= 18)
    loadLabel = "Standard load";
  else if (estimatedCredits > 18) loadLabel = "Heavy load";

  const displayName =
    user.displayName || (user.email ? user.email.split("@")[0] : "Student");

  return (
    <div className="dashboard-page">
      <div className="dashboard-shell">
        <header className="dash-header">
          <div className="dash-title-block">
            <p className="dash-eyebrow">Class Scheduler</p>
            <h1 className="dash-title">
              Welcome back,
              <span className="dash-highlight"> {user.email}</span>
            </h1>
            <p className="dash-subtitle">
              Use this dashboard as your hub to browse courses, build your
              weekly schedule, and keep everything in one place.
            </p>
          </div>

          <button className="dash-logout" onClick={handleLogout}>
            Sign out
          </button>
        </header>

        <main className="dash-main">
          <section className="dash-grid">
            {/* Overview card */}
            <div className="dash-card dash-card-stats">
              <h2 className="card-title">Overview</h2>
              <p className="card-subtitle">
                Quick glance at where your schedule is at.
              </p>

              <div className="stats-row">
                <div className="stat-pill">
                  <div className="stat-label">Scheduled classes</div>
                  <div className="stat-value">{scheduledCount}</div>
                </div>

                <div className="stat-pill">
                  <div className="stat-label">Estimated credits</div>
                  <div className="stat-value">
                    {estimatedCredits}
                    <span className="stat-unit">cr</span>
                  </div>
                </div>
              </div>

              {/* overview mini-visual with clearer text */}
              <div className="overview-progress">
                <div className="op-left">
                  <p className="op-title">Semester course load</p>
                  <p className="op-desc">
                    A visual estimate of how many classes and credits you’ve
                    lined up so far.
                  </p>
                </div>
                <div className="op-bars">
                  <div className="op-bar">
                    <div
                      className="op-bar-fill"
                      style={{
                        height: `${Math.min(100, estimatedCredits * 5)}%`,
                      }}
                    />
                  </div>
                  <div className="op-bar">
                    <div
                      className="op-bar-fill"
                      style={{
                        height: `${Math.min(100, scheduledCount * 10)}%`,
                      }}
                    />
                  </div>
                  <div className="op-bar">
                    <div
                      className="op-bar-fill"
                      style={{
                        height: `${Math.min(
                          100,
                          (estimatedCredits / TARGET_CREDITS) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick actions card */}
            <div className="dash-card dash-card-actions">
              <h2 className="card-title">Quick actions</h2>
              <p className="card-subtitle">
                Jump straight into the part of planning you care about.
              </p>
              <div className="actions-grid">
                <Link to="/classSearch" className="dash-btn primary">
                  Browse course catalog
                </Link>
                <Link to="/schedule" className="dash-btn secondary">
                  View weekly schedule
                </Link>
                <button
                  type="button"
                  className="dash-btn ghost"
                  onClick={() => setShowProfile(true)} // UPDATED
                >
                  Profile
                </button>
              </div>
            </div>

            {/* Planning status + reminders */}
            <div className="dash-card dash-card-info">
              <div className="info-grid">
                <div className="info-block">
                  <h3 className="info-title">Planning status</h3>
                  <p className="info-subtitle">
                    You&apos;re currently at{" "}
                    <span className="info-highlight">
                      {estimatedCredits} credits
                    </span>{" "}
                    out of an ideal{" "}
                    <span className="info-highlight">{TARGET_CREDITS}</span>.
                  </p>

                  <div className="progress-shell">
                    <div className="progress-track">
                      <div
                        className="progress-fill"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                    <div className="progress-meta">
                      <span className="progress-label">{loadLabel}</span>
                      <span className="progress-percent">
                        {Math.round(progressPct)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="info-block info-block-right">
                  <h3 className="info-title">Reminders</h3>
                  <ul className="tips-list">
                    <li>Watch for time overlaps when adding new classes.</li>
                    <li>Aim for 12–18 credits for a balanced semester.</li>
                    <li>
                      Revisit this page after each change to your schedule.
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Updated full-width milestones card with arrow timeline */}
            <div className="dash-card dash-card-timeline">
              <h3 className="timeline-title">Upcoming milestones</h3>

              <div className="timeline-axis" />

              <div className="timeline">
                <div className="tl-item">
                  <div className="tl-spacer" />
                  <div className="tl-dot" />
                  <p className="tl-date">Apr 01</p>
                  <p className="tl-label">Registration opens</p>
                </div>

                <div className="tl-item">
                  <div className="tl-spacer" />
                  <div className="tl-dot" />
                  <p className="tl-date">Aug 26</p>
                  <p className="tl-label">Semester begins</p>
                </div>

                <div className="tl-item">
                  <div className="tl-spacer" />
                  <div className="tl-dot" />
                  <p className="tl-date">Sep 06</p>
                  <p className="tl-label">Add/drop deadline</p>
                </div>

                <div className="tl-item">
                  <div className="tl-spacer" />
                  <div className="tl-dot" />
                  <p className="tl-date">Oct 21</p>
                  <p className="tl-label">Midterms</p>
                </div>

                <div className="tl-item">
                  <div className="tl-spacer" />
                  <div className="tl-dot" />
                  <p className="tl-date">Dec 09</p>
                  <p className="tl-label">Finals week</p>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* PROFILE OVERLAY */}
        {showProfile && (
          <div
            className="profile-overlay"
            onClick={() => setShowProfile(false)}
          >
            <div
              className="profile-panel"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="profile-title">Profile</h2>
              <p className="profile-subtitle">
                Quick snapshot of the account you&apos;re signed in with.
              </p>

              <div className="profile-row">
                <span className="profile-label">Name</span>
                <span className="profile-value">{displayName}</span>
              </div>
              <div className="profile-row">
                <span className="profile-label">Email</span>
                <span className="profile-value">{user.email}</span>
              </div>
              <div className="profile-row">
                <span className="profile-label">Provider</span>
                <span className="profile-value">
                  {user.providerData?.[0]?.providerId || "Email / password"}
                </span>
              </div>

              <div className="profile-actions">
                <button
                  type="button"
                  className="profile-close"
                  onClick={() => setShowProfile(false)}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="profile-signout"
                  onClick={handleLogout}
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
