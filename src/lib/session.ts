/**
 * Session token helpers. Edge-safe (only uses `jose`), so middleware can import this.
 */
import { SignJWT, jwtVerify } from 'jose';

export const SESSION_COOKIE = 'na_session';
export const SESSION_MAX_AGE_DAYS = 30;

export interface SessionPayload {
  sub: string; // user id
  role: 'student' | 'teacher' | 'admin';
  name: string;
}

function secretKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET must be set to a random string of at least 32 characters.');
  }
  return new TextEncoder().encode(secret);
}

export async function signSession(payload: SessionPayload, maxAgeDays = SESSION_MAX_AGE_DAYS) {
  return new SignJWT({ role: payload.role, name: payload.name })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${maxAgeDays}d`)
    .sign(secretKey());
}

export async function verifySession(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ['HS256'] });
    if (!payload.sub) return null;
    return {
      sub: payload.sub,
      role: payload.role === 'admin' ? 'admin' : 'student',
      name: String(payload.name ?? ''),
    };
  } catch {
    return null;
  }
}

export function sessionCookieOptions(maxAgeDays: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: maxAgeDays * 24 * 60 * 60,
  };
}
