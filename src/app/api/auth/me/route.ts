import { NextResponse } from 'next/server';
import { getCurrentUser, jsonError, publicUser } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return jsonError('Not signed in', 401);
  return NextResponse.json({ user: publicUser(user) });
}
