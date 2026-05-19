import { NextResponse } from 'next/server';

import 'server-only';

// Cron handler scheduled in vercel.json. Runs every 6h.
// Real implementation lands in Phase 3 (currency feature). For now this is a
// stub that verifies the cron secret so the route is reachable.

const CRON_SECRET = process.env.CRON_SECRET;

export async function POST(req: Request) {
  const provided = req.headers.get('x-cron-secret');
  if (!CRON_SECRET || provided !== CRON_SECRET) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  }

  // TODO(phase-3): fetch rates from frankfurter.app and CoinGecko, upsert into
  // exchange_rates via the currency feature service.

  return NextResponse.json({ ok: true, ran: 'rate-refresh', timestamp: new Date().toISOString() });
}

export async function GET(req: Request) {
  return POST(req);
}
