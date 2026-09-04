export default function RoadmapPage() {
  const phases = [
    {
      phase: "Phase 1",
      title: "Community Building & Whitelist",
      desc: "Launch social channels, open the whitelist, run early supporter giveaways, and build hype across X and Discord.",
    },
    {
      phase: "Phase 2",
      title: "Mint Launch — 2 222 Agents Deploy",
      desc: "Public mint on Arc chain. Holders receive exclusive access to the 404Agents dashboard, rarity reveals, and limited‑edition trait drops.",
    },
    {
      phase: "Phase 3",
      title: "Marketplace & Utility Rollout",
      desc: "List on major NFT marketplaces. Introduce staking, holder rewards, and the Agent Mission system for passive yield.",
    },
    {
      phase: "Phase 4",
      title: "Cross‑Chain Expansion & Merch",
      desc: "Bridge 404Agents to EVM chains. Drop physical merch, host IRL events, and partner with Web3 gaming studios.",
    },
  ];

  return (
    <section className="roadmap-section">
      <h1>Roadmap</h1>
      <p className="roadmap-subtitle">
        From genesis to world domination — here is the plan.
      </p>

      <div className="timeline">
        {phases.map((p, i) => (
          <div className="timeline-item" key={i}>
            <div className="timeline-phase">
              {p.phase}
            </div>
            <div className="timeline-title">{p.title}</div>
            <div className="timeline-desc">{p.desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
