import { NextResponse } from "next/server";
import { verifyPassword, generateAdminToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { password } = await req.json();
    const hash = process.env.ADMIN_PASSWORD_HASH;

    if (!hash) {
      return NextResponse.json({ error: "Admin not configured" }, { status: 500 });
    }

    const valid = await verifyPassword(hash, password);
    if (!valid) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const token = generateAdminToken();

    const res = NextResponse.json({ success: true });
    res.cookies.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return res;
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
