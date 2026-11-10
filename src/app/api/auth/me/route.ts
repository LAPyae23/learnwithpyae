import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUser, jsonError, publicUser } from '@/lib/auth';
import { User } from '@/models/User';
import { LANG_CODES } from '@/data/languages';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return jsonError('Not signed in', 401);
  return NextResponse.json({ user: publicUser(user) });
}

const NameInput = z
  .object({
    name: z.string().trim().min(1, 'အမည် ထည့်ပါ').max(80).optional(),
    learningLang: z.enum(LANG_CODES).optional(),
  })
  .refine((v) => v.name || v.learningLang, 'Nothing to save');

/** Update my display name and/or the language I'm learning. */
export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) return jsonError('Not signed in', 401);
  const parsed = NameInput.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? 'Data မမှန်ပါ', 400);
  await User.updateOne({ _id: user._id }, { $set: parsed.data });
  return NextResponse.json({ ok: true, ...parsed.data });
}
