import 'server-only';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { connectDB } from './db';
import { User } from '@/models/User';
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_DAYS,
  sessionCookieOptions,
  signSession,
  verifySession,
  type SessionPayload,
} from './session';

export const hashPassword = (plain: string) => bcrypt.hash(plain, 12);
export const verifyPassword = (plain: string, hash: string) => bcrypt.compare(plain, hash);

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  return verifySession(store.get(SESSION_COOKIE)?.value);
}

/** Loads the signed-in user from the DB, or null. */
export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;
  await connectDB();
  return User.findById(session.sub).lean();
}

export async function setSessionCookie(
  res: NextResponse,
  payload: SessionPayload,
  remember = true
) {
  // "Remember me" off still keeps a 1-day session rather than a browser-session cookie,
  // because mobile browsers kill tabs aggressively and users would get logged out constantly.
  const days = remember ? SESSION_MAX_AGE_DAYS : 1;
  res.cookies.set(SESSION_COOKIE, await signSession(payload, days), sessionCookieOptions(days));
}

export function clearSessionCookie(res: NextResponse) {
  res.cookies.set(SESSION_COOKIE, '', { ...sessionCookieOptions(0), maxAge: 0 });
}

export function publicUser(u: {
  _id: unknown;
  name: string;
  email: string;
  role?: string | null;
  targetLevel?: string | null;
  examSession?: string | null;
  plan?: { type?: string | null; expiresAt?: Date | null } | null;
  streak?: { current?: number | null; longest?: number | null } | null;
  createdAt?: Date;
}) {
  return {
    id: String(u._id),
    name: u.name,
    email: u.email,
    role: u.role ?? 'student',
    targetLevel: u.targetLevel ?? null,
    examSession: u.examSession ?? null,
    plan: { type: u.plan?.type ?? 'free', expiresAt: u.plan?.expiresAt ?? null },
    streak: { current: u.streak?.current ?? 0, longest: u.streak?.longest ?? 0 },
    createdAt: u.createdAt ?? null,
  };
}

export type PublicUser = ReturnType<typeof publicUser>;

/** Standard JSON error helper for route handlers. */
export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}
