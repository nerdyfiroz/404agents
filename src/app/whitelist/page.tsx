"use client";

import { useState, useEffect } from "react";

interface Task {
  id: number;
  description: string;
  link: string | null;
}

interface Settings {
  twitter_follow_link: string;
  tweet_engage_link: string;
  whitelist_paused: string;
}

export default function WhitelistPage() {
  const [wallet, setWallet] = useState("");
  const [twitter, setTwitter] = useState("");
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error" | "paused">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [walletError, setWalletError] = useState("");

  const [settings, setSettings] = useState<Settings>({
    twitter_follow_link: "",
    tweet_engage_link: "",
    whitelist_paused: "false",
  });
  const [tasks, setTasks] = useState<Task[]>([]);

  // Fetch public settings & tasks on mount without cache
  useEffect(() => {
    fetch("/api/settings/public", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        const s = data.settings || data;
        setSettings({
          twitter_follow_link: s.twitter_follow_link || "",
          tweet_engage_link: s.tweet_engage_link || "",
          whitelist_paused: s.whitelist_paused || "false",
        });
        if (Array.isArray(data.tasks)) {
          setTasks(data.tasks);
        }
        if (s.whitelist_paused === "true") setStatus("paused");
      })
      .catch(() => {});
  }, []);

  const isPaused = settings.whitelist_paused === "true";
  const twitterFollowLink = settings.twitter_follow_link;
  const tweetEngageLink = settings.tweet_engage_link;

  // Extract twitter handle from link for display
  const twitterHandle = twitterFollowLink
    ? "@" + twitterFollowLink.replace(/\/$/, "").split("/").pop()
    : "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setWalletError("");
    setErrorMsg("");

    if (!wallet.trim()) {
      setWalletError("Wallet address is required");
      return;
    }

    setStatus("submitting");
    try {
      const res = await fetch("/api/whitelist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet, twitter, comment }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Server error");
      }
      setStatus("success");
      setWallet("");
      setTwitter("");
      setComment("");
    } catch (err: unknown) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <section className="wl-section">
      <h1>Join the Whitelist</h1>
      <p className="wl-subtitle">
        Secure your spot for the 404Agents mint on Arc chain.
      </p>

      {/* Paused banner */}
      {isPaused && (
        <div className="wl-status error" style={{ marginBottom: "1.5rem" }}>
          🚫 Whitelist submissions are currently paused. Check back later!
        </div>
      )}

      <form className="wl-form" onSubmit={handleSubmit}>
        {/* ── Wallet Address ── */}
        <div className="form-group">
          <label htmlFor="wl-wallet">Wallet Address *</label>
          <input
            id="wl-wallet"
            type="text"
            placeholder="0x..."
            value={wallet}
            onChange={(e) => setWallet(e.target.value)}
            disabled={isPaused}
          />
          {walletError && <p className="form-error">{walletError}</p>}
        </div>

        {/* ── Twitter Follow Task ── */}
        <div className="form-group">
          <label htmlFor="wl-twitter">Twitter Username *</label>
          {twitterFollowLink && (
            <a
              href={twitterFollowLink}
              target="_blank"
              rel="noopener noreferrer"
              className="task-link"
            >
              <span className="task-link-icon">✦</span>
              Follow {twitterHandle || "us"} on X to complete this task
              <span className="task-link-arrow">↗</span>
            </a>
          )}
          <input
            id="wl-twitter"
            type="text"
            placeholder="@yourhandle"
            value={twitter}
            onChange={(e) => setTwitter(e.target.value)}
            disabled={isPaused}
          />
        </div>

        {/* ── Like, Retweet & Comment Task ── */}
        <div className="form-group">
          <label htmlFor="wl-comment">Proof Link *</label>
          {tweetEngageLink && (
            <a
              href={tweetEngageLink}
              target="_blank"
              rel="noopener noreferrer"
              className="task-link"
            >
              <span className="task-link-icon">🔥</span>
              Like, Retweet &amp; Comment on this post
              <span className="task-link-arrow">↗</span>
            </a>
          )}
          <input
            id="wl-comment"
            type="text"
            placeholder="Paste your comment link here as proof…"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={isPaused}
          />
        </div>

        {/* ── Custom Whitelist Tasks Checklist ── */}
        {tasks.length > 0 && (
          <div className="form-group" style={{ background: "rgba(255,255,255,.02)", padding: "1rem", borderRadius: 12, border: "1px solid rgba(255,107,53,.15)" }}>
            <label style={{ fontSize: "0.9rem", color: "var(--color-accent)", fontWeight: 700 }}>
              📋 Whitelist Tasks Checklist
            </label>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginTop: "0.5rem" }}>
              {tasks.map((t) => (
                <div key={t.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--color-primary-light)", padding: "0.6rem 0.8rem", borderRadius: 8 }}>
                  <span style={{ fontSize: "0.88rem" }}>{t.description}</span>
                  {t.link && (
                    <a
                      href={t.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="task-link"
                      style={{ padding: "0.3rem 0.6rem", fontSize: "0.8rem", marginTop: 0 }}
                    >
                      Complete Task ↗
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          type="submit"
          className="btn-primary"
          disabled={status === "submitting" || isPaused}
          style={{ width: "100%", justifyContent: "center" }}
        >
          {isPaused
            ? "⏸ Submissions Paused"
            : status === "submitting"
            ? "Submitting…"
            : "🤖 Submit"}
        </button>

        {status === "success" && (
          <div className="wl-status success">✅ You are on the list! Welcome, Agent.</div>
        )}
        {status === "error" && (
          <div className="wl-status error">❌ {errorMsg || "Something went wrong. Please try again."}</div>
        )}
      </form>
    </section>
  );
}
