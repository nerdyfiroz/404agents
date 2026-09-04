import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminToken } from "@/lib/auth";
import { getDbPool } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function isAuthed(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;
    if (!token) return false;
    return !!verifyAdminToken(token);
  } catch {
    return false;
  }
}

export async function GET() {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const pool = getDbPool();
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admin_tasks (id SERIAL PRIMARY KEY, description TEXT NOT NULL, link TEXT, created_at TIMESTAMPTZ DEFAULT NOW());
      ALTER TABLE admin_tasks ADD COLUMN IF NOT EXISTS link TEXT;
    `);
    const { rows } = await pool.query(
      "SELECT id, description, link, created_at FROM admin_tasks ORDER BY created_at DESC"
    );
    const res = NextResponse.json(rows);
    res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    return res;
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { description, link } = await req.json();
    if (!description || typeof description !== "string") {
      return NextResponse.json({ error: "description is required" }, { status: 400 });
    }
    const pool = getDbPool();
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admin_tasks (id SERIAL PRIMARY KEY, description TEXT NOT NULL, link TEXT, created_at TIMESTAMPTZ DEFAULT NOW());
      ALTER TABLE admin_tasks ADD COLUMN IF NOT EXISTS link TEXT;
    `);
    await pool.query("INSERT INTO admin_tasks (description, link) VALUES ($1, $2)", [description, link || null]);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  try {
    const pool = getDbPool();
    await pool.query("DELETE FROM admin_tasks WHERE id = $1", [id]);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
