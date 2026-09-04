import { NextResponse } from "next/server";
import { getDbPool } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET /api/settings/public — returns public settings & tasks needed by whitelist form
export async function GET() {
  try {
    const pool = getDbPool();
    
    // Auto-create settings & admin_tasks table if needed
    await pool.query(`
      CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS admin_tasks (id SERIAL PRIMARY KEY, description TEXT NOT NULL, link TEXT, created_at TIMESTAMPTZ DEFAULT NOW());
      ALTER TABLE admin_tasks ADD COLUMN IF NOT EXISTS link TEXT;
    `);

    const settingsRes = await pool.query(
      "SELECT key, value FROM settings WHERE key IN ('twitter_follow_link', 'tweet_engage_link', 'whitelist_paused')"
    );
    const settings: Record<string, string> = {
      twitter_follow_link: "",
      tweet_engage_link: "",
      whitelist_paused: "false",
    };
    for (const row of settingsRes.rows) {
      settings[row.key] = row.value;
    }

    const tasksRes = await pool.query(
      "SELECT id, description, link FROM admin_tasks ORDER BY created_at ASC"
    );

    const response = NextResponse.json({
      settings,
      tasks: tasksRes.rows,
    });
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    return response;
  } catch {
    return NextResponse.json(
      {
        settings: {
          twitter_follow_link: "",
          tweet_engage_link: "",
          whitelist_paused: "false",
        },
        tasks: [],
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  }
}
