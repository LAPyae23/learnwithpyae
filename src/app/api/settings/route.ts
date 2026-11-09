import { NextResponse } from 'next/server';
import { getSiteSettings } from '@/lib/settings';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Public: active plans and the payment accounts students should send money to. */
export async function GET() {
  const s = await getSiteSettings();
  return NextResponse.json({
    plans: s.plans,
    accounts: s.accounts.filter((a) => a.enabled),
  });
}
