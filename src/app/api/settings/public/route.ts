import { NextResponse } from "next/server";
import { getDbPool } from "@/lib/db";

// GET /api/settings/public — returns only the public settings needed by the whitelist form
export async function GET() {
  try {
    const pool = getDbPool();
    const { rows } = await pool.query(
      "SELECT key, value FROM settings WHERE key IN ('twitter_follow_link', 'tweet_engage_link', 'whitelist_paused')"
    );
    const settings: Record<string, string> = {};
    for (const row of rows) {
      settings[row.key] = row.value;
    }
    return NextResponse.json(settings);
  } catch {
    // If DB is not configured yet, return empty defaults
    return NextResponse.json({
      twitter_follow_link: "",
      tweet_engage_link: "",
      whitelist_paused: "false",
    });
  }
}
