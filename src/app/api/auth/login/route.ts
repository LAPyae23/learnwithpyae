import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { jsonError, publicUser, setSessionCookie, verifyPassword } from '@/lib/auth';
import { User } from '@/models/User';
import {
  blockedFor,
  clearAttempts,
  clientIp,
  countAttempt,
  tooManyMessage,
  type Limit,
} from '@/lib/attemptLimit';

export const runtime = 'nodejs';

const schema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1).max(128),
  rememberMe: z.boolean().optional(),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError('Email နဲ့ password ထည့်ပါ', 400);
  const { email, password, rememberMe } = parsed.data;

  await connectDB();

  // Brute-force protection: 5 wrong passwords per account per IP, 30 failures per IP, per 15 minutes
  const ip = clientIp(req);
  const limits: Limit[] = [
    { key: `login:${email}|${ip}`, max: 5, windowMin: 15 },
    { key: `login-ip:${ip}`, max: 30, windowMin: 15 },
  ];
  const wait = await blockedFor(limits);
  if (wait) return jsonError(tooManyMessage(wait), 429);

  const user = await User.findOne({ email }).select('+passwordHash');
  // Same message for unknown email and wrong password so accounts can't be enumerated
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    await countAttempt(limits);
    return jsonError('Email သို့မဟုတ် password မှားနေပါတယ်', 401);
  }
  await clearAttempts([limits[0].key]);

  const role = user.role === 'admin' ? 'admin' : 'student';
  const res = NextResponse.json({ user: publicUser(user.toObject()) });
  await setSessionCookie(res, { sub: String(user._id), role, name: user.name }, rememberMe ?? true);
  return res;
}
