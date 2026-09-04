import Link from "next/link";

export default function HomePage() {
  return (
    <section className="hero">
      {/* Background image layer */}
      <div className="hero-bg-image" />

      {/* Badge */}
      <div className="hero-badge">
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#ff6b35", display: "inline-block", boxShadow: "0 0 8px #ff6b35" }} />
        Launching on Arc Chain
      </div>

      {/* Title */}
      <h1>404Agents</h1>

      {/* Description */}
      <p>
        2 222 unique error‑themed agent bots — glitched, rogue, and ready to
        break the chain. Collect them before they collect you.
      </p>

      {/* Stats row */}
      <div className="hero-stats">
        <div className="hero-stat">
          <strong>2 222</strong>
          <span>Supply</span>
        </div>
        <div className="hero-stat">
          <strong>Arc</strong>
          <span>Chain</span>
        </div>
        <div className="hero-stat">
          <strong>TBA</strong>
          <span>Mint Price</span>
        </div>
      </div>

      {/* CTA buttons */}
      <div className="hero-actions">
        <Link href="/whitelist" className="btn-primary">
          🤖 Join Whitelist
        </Link>
        <Link href="/roadmap" className="btn-secondary">
          View Roadmap →
        </Link>
      </div>
    </section>
  );
}
