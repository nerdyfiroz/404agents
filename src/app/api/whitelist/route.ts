import { NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';
import { z } from 'zod';

const schema = z.object({
  wallet: z.string().min(1),
  twitter: z.string().optional(),
  comment: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const pool = getDbPool();

    // Check if whitelist is paused
    const pauseResult = await pool.query(
      "SELECT value FROM settings WHERE key = 'whitelist_paused'"
    );
    if (pauseResult.rows.length > 0 && pauseResult.rows[0].value === 'true') {
      return NextResponse.json(
        { error: 'Whitelist submissions are currently paused.' },
        { status: 403 }
      );
    }

    const json = await req.json();
    const data = schema.parse(json);
    await pool.query(
      'INSERT INTO whitelist (wallet_address, twitter, comment) VALUES ($1, $2, $3)',
      [data.wallet, data.twitter ?? null, data.comment ?? null]
    );
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error(err);
    const message = err instanceof Error && err.message === 'Whitelist submissions are currently paused.'
      ? err.message
      : 'Invalid request';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
