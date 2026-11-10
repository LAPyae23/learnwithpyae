import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { hashPassword, jsonError, publicUser, setSessionCookie } from '@/lib/auth';
import { User } from '@/models/User';
import { blockedFor, clientIp, countAttempt, tooManyMessage } from '@/lib/attemptLimit';

export const runtime = 'nodejs';

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email(),
  password: z
    .string()
    .min(8)
    .max(128)
    .regex(/^(?=.*[A-Z])(?=.*[0-9])/),
  targetLevel: z.enum(['N5', 'N4', 'N3']).optional().or(z.literal('')),
  examDate: z
    .string()
    .regex(/^\d{4}-\d{2}$/)
    .optional()
    .or(z.literal('')),
  ref: z.string().trim().max(12).optional(),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError('ထည့်ထားတဲ့ အချက်အလက် မှန်ကန်မှု မရှိပါ', 400);
  const { name, email, password, targetLevel, examDate, ref } = parsed.data;

  await connectDB();

  // Stops scripted mass sign-ups: 10 new accounts per IP per hour
  const limit = [{ key: `register:${clientIp(req)}`, max: 10, windowMin: 60 }];
  const wait = await blockedFor(limit);
  if (wait) return jsonError(tooManyMessage(wait), 429);

  if (await User.exists({ email })) {
    return jsonError('ဒီ email နဲ့ အကောင့် ရှိပြီးသားပါ', 409);
  }

  // Invited by a friend? (the reward is given once this new learner actually studies)
  const referrer = ref
    ? await User.findOne({ referralCode: ref.toUpperCase() }).select('_id').lean()
    : null;

  const user = await User.create({
    name,
    email,
    passwordHash: await hashPassword(password),
    targetLevel: targetLevel || null,
    examSession: examDate || null,
    referredBy: referrer?._id ?? null,
  });

  await countAttempt(limit);
  const res = NextResponse.json({ user: publicUser(user.toObject()) }, { status: 201 });
  await setSessionCookie(res, { sub: String(user._id), role: 'student', name: user.name });
  return res;
}
