"use client";

import { useState, useEffect, useCallback } from "react";

interface WhitelistEntry {
  id: number;
  wallet_address: string;
  twitter: string | null;
  comment: string | null;
  submitted_at: string;
}

interface Task {
  id: number;
  description: string;
  created_at: string;
}

interface Settings {
  twitter_follow_link: string;
  tweet_engage_link: string;
  whitelist_paused: string;
}

export default function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [tab, setTab] = useState<"whitelist" | "tasks" | "settings">("whitelist");

  // whitelist state
  const [entries, setEntries] = useState<WhitelistEntry[]>([]);

  // tasks state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");

  // settings state
  const [settings, setSettings] = useState<Settings>({
    twitter_follow_link: "",
    tweet_engage_link: "",
    whitelist_paused: "false",
  });
  const [settingsSaved, setSettingsSaved] = useState(false);

  // ── Login ──
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) throw new Error("Wrong password");
      setLoggedIn(true);
    } catch {
      setLoginError("Invalid password");
    }
  }

  // ── Fetch data ──
  const fetchEntries = useCallback(async () => {
    const res = await fetch("/api/admin/whitelist");
    if (res.ok) setEntries(await res.json());
  }, []);

  const fetchTasks = useCallback(async () => {
    const res = await fetch("/api/admin/tasks");
    if (res.ok) setTasks(await res.json());
  }, []);

  const fetchSettings = useCallback(async () => {
    const res = await fetch("/api/admin/settings");
    if (res.ok) {
      const data = await res.json();
      setSettings({
        twitter_follow_link: data.twitter_follow_link || "",
        tweet_engage_link: data.tweet_engage_link || "",
        whitelist_paused: data.whitelist_paused || "false",
      });
    }
  }, []);

  useEffect(() => {
    if (loggedIn) {
      fetchEntries();
      fetchTasks();
      fetchSettings();
    }
  }, [loggedIn, fetchEntries, fetchTasks, fetchSettings]);

  // ── Actions ──
  async function removeEntry(id: number) {
    await fetch(`/api/admin/whitelist?id=${id}`, { method: "DELETE" });
    fetchEntries();
  }

  async function addTask() {
    if (!newTask.trim()) return;
    await fetch("/api/admin/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: newTask }),
    });
    setNewTask("");
    fetchTasks();
  }

  async function removeTask(id: number) {
    await fetch(`/api/admin/tasks?id=${id}`, { method: "DELETE" });
    fetchTasks();
  }

  // ── Settings ──
  async function saveSetting(key: string, value: string) {
    await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value }),
    });
  }

  async function saveAllSettings() {
    setSettingsSaved(false);
    await saveSetting("twitter_follow_link", settings.twitter_follow_link);
    await saveSetting("tweet_engage_link", settings.tweet_engage_link);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  }

  async function togglePause() {
    const newValue = settings.whitelist_paused === "true" ? "false" : "true";
    setSettings((s) => ({ ...s, whitelist_paused: newValue }));
    await saveSetting("whitelist_paused", newValue);
  }

  // ── Export CSV ──
  function exportCSV() {
    window.open("/api/admin/export", "_blank");
  }

  // ── Login screen ──
  if (!loggedIn) {
    return (
      <div className="admin-login">
        <h2>🔐 Admin Login</h2>
        <form className="wl-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="admin-pass">Password</label>
            <input
              id="admin-pass"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
            />
          </div>
          {loginError && <div className="wl-status error">{loginError}</div>}
          <button type="submit" className="btn-primary">
            Login
          </button>
        </form>
      </div>
    );
  }

  const isPaused = settings.whitelist_paused === "true";

  // ── Dashboard ──
  return (
    <section className="admin-section">
      <h1>Admin Dashboard</h1>

      {/* Top action bar */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <button
          className={isPaused ? "btn-primary" : "btn-danger"}
          onClick={togglePause}
          style={{ padding: "0.6rem 1.4rem", borderRadius: 10, fontSize: "0.9rem" }}
        >
          {isPaused ? "▶ Resume Whitelist" : "⏸ Pause Whitelist"}
        </button>
        <button
          className="btn-small"
          onClick={exportCSV}
          style={{ padding: "0.6rem 1.4rem" }}
        >
          📥 Export CSV
        </button>
        {isPaused && (
          <span style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "0.4rem 1rem",
            borderRadius: 8,
            background: "rgba(255,77,106,.1)",
            color: "#ff4d6a",
            fontWeight: 700,
            fontSize: "0.85rem",
            border: "1px solid rgba(255,77,106,.25)",
          }}>
            🚫 Whitelist is PAUSED
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        <button
          className={`admin-tab ${tab === "whitelist" ? "active" : ""}`}
          onClick={() => setTab("whitelist")}
        >
          Whitelist ({entries.length})
        </button>
        <button
          className={`admin-tab ${tab === "tasks" ? "active" : ""}`}
          onClick={() => setTab("tasks")}
        >
          Tasks ({tasks.length})
        </button>
        <button
          className={`admin-tab ${tab === "settings" ? "active" : ""}`}
          onClick={() => setTab("settings")}
        >
          Settings
        </button>
      </div>

      {/* ── Whitelist Tab ── */}
      {tab === "whitelist" && (
        <div className="admin-card">
          <h3>Whitelist Entries</h3>
          {entries.length === 0 ? (
            <p style={{ color: "var(--color-text-muted)" }}>No entries yet.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Wallet</th>
                    <th>Twitter</th>
                    <th>Proof Link</th>
                    <th>Date</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {entries.map((e, i) => (
                    <tr key={e.id}>
                      <td>{i + 1}</td>
                      <td style={{ fontFamily: "monospace", fontSize: "0.82rem" }}>
                        {e.wallet_address}
                      </td>
                      <td>{e.twitter ?? "—"}</td>
                      <td>
                        {e.comment ? (
                          <a
                            href={e.comment}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "var(--color-accent)", textDecoration: "underline" }}
                          >
                            View
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td>{new Date(e.submitted_at).toLocaleDateString()}</td>
                      <td>
                        <button className="btn-danger" onClick={() => removeEntry(e.id)}>
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Tasks Tab ── */}
      {tab === "tasks" && (
        <div className="admin-card">
          <h3>Whitelist Tasks</h3>
          <p style={{ color: "var(--color-text-muted)", marginBottom: "1rem", fontSize: "0.9rem" }}>
            Add tasks that users must complete to qualify for the whitelist.
          </p>

          {/* Add task */}
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
            <input
              type="text"
              placeholder="New task description…"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              style={{
                flex: 1,
                padding: "0.6rem 1rem",
                borderRadius: 10,
                border: "1px solid rgba(255,107,53,.15)",
                background: "var(--color-primary)",
                color: "var(--color-text)",
                fontFamily: "inherit",
                fontSize: "0.9rem",
              }}
            />
            <button className="btn-small" onClick={addTask}>
              + Add
            </button>
          </div>

          {tasks.length === 0 ? (
            <p style={{ color: "var(--color-text-muted)" }}>No tasks yet.</p>
          ) : (
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {tasks.map((t) => (
                <li
                  key={t.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0.7rem 1rem",
                    background: "var(--color-primary-light)",
                    borderRadius: 10,
                  }}
                >
                  <span>{t.description}</span>
                  <button className="btn-danger" onClick={() => removeTask(t.id)}>
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* ── Settings Tab ── */}
      {tab === "settings" && (
        <div className="admin-card">
          <h3>Whitelist Form Settings</h3>
          <p style={{ color: "var(--color-text-muted)", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
            Configure the links shown on the whitelist form. Users will see clickable tasks to follow your Twitter and engage with a tweet.
          </p>

          <div className="wl-form" style={{ gap: "1.2rem" }}>
            {/* Twitter Follow Link */}
            <div className="form-group">
              <label>Twitter Profile Link (Follow Task)</label>
              <input
                type="text"
                placeholder="https://x.com/404Agents"
                value={settings.twitter_follow_link}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, twitter_follow_link: e.target.value }))
                }
              />
              <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginTop: "0.3rem" }}>
                Users will see: &quot;Follow @handle on X to complete this task&quot;
              </p>
            </div>

            {/* Tweet Engagement Link */}
            <div className="form-group">
              <label>Tweet Link (Like, Retweet &amp; Comment Task)</label>
              <input
                type="text"
                placeholder="https://x.com/404Agents/status/123456789"
                value={settings.tweet_engage_link}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, tweet_engage_link: e.target.value }))
                }
              />
              <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginTop: "0.3rem" }}>
                Users will see: &quot;Like, Retweet &amp; Comment on this post&quot;
              </p>
            </div>

            <button className="btn-primary" onClick={saveAllSettings} style={{ width: "100%", justifyContent: "center" }}>
              💾 Save Settings
            </button>

            {settingsSaved && (
              <div className="wl-status success">✅ Settings saved successfully!</div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
