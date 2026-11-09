import { NextResponse } from 'next/server';
import { getSession, jsonError } from '@/lib/auth';
import { activeProvider, remainingAiQuota } from '@/lib/ai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSession();
  if (!session) return jsonError('Not signed in', 401);
  const quota = await remainingAiQuota(session.sub);
  return NextResponse.json({ ...quota, enabled: !!activeProvider(), provider: activeProvider() });
}
