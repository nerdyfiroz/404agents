import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ReactNode } from "react";
import Link from "next/link";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "404Agents – NFT Bot Collection on Arc Chain",
  description:
    "Collect, trade, and unleash 2 222 unique 404‑error‑themed agent bots on the Arc blockchain. Join the whitelist now!",
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png" },
      { url: "/favicon.png", type: "image/png" },
    ],
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "404Agents – NFT Bot Collection",
    description:
      "2 222 unique error‑themed bots. Mint on Arc chain.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "404Agents",
    description: "2 222 unique error‑themed bots on Arc chain.",
  },
};

interface LayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: LayoutProps) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body>
        {/* ── Animated 404 glitch background ── */}
        <div className="glitch-overlay" aria-hidden="true" />

        {/* ── Navbar ── */}
        <nav className="nav">
          <Link href="/" className="nav-logo">
            404<span>Agents</span>
          </Link>
          <div className="nav-links">
            <Link href="/roadmap">Roadmap</Link>
            <Link href="/whitelist">Whitelist</Link>
          </div>
        </nav>

        {/* ── Page content ── */}
        <main className="main-content">{children}</main>

        {/* ── Footer ── */}
        <footer className="site-footer">
          <p>© 2026 404Agents · Built on Arc Chain · Supply 2 222</p>
        </footer>
      </body>
    </html>
  );
}
