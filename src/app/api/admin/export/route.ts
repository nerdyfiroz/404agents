import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminToken } from "@/lib/auth";
import { getDbPool } from "@/lib/db";

async function isAuthed(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) return false;
  return !!verifyAdminToken(token);
}

// GET /api/admin/export — download whitelist as CSV
export async function GET() {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pool = getDbPool();
  const { rows } = await pool.query(
    "SELECT id, wallet_address, twitter, comment, submitted_at FROM whitelist ORDER BY submitted_at DESC"
  );

  // Build CSV
  const header = "ID,Wallet Address,Twitter,Comment,Submitted At";
  const csvRows = rows.map((r) => {
    const escape = (v: string | null) => {
      if (!v) return "";
      // Escape double-quotes and wrap in quotes if contains comma/newline
      const escaped = v.replace(/"/g, '""');
      return `"${escaped}"`;
    };
    return [
      r.id,
      escape(r.wallet_address),
      escape(r.twitter),
      escape(r.comment),
      escape(r.submitted_at),
    ].join(",");
  });

  const csv = [header, ...csvRows].join("\n");

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="404agents_whitelist_${Date.now()}.csv"`,
    },
  });
}
