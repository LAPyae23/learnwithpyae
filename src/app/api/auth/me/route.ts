import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUser, jsonError, publicUser } from '@/lib/auth';
import { User } from '@/models/User';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return jsonError('Not signed in', 401);
  return NextResponse.json({ user: publicUser(user) });
}

const NameInput = z.object({ name: z.string().trim().min(1, 'အမည် ထည့်ပါ').max(80) });

/** Update my display name. */
export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) return jsonError('Not signed in', 401);
  const parsed = NameInput.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? 'Data မမှန်ပါ', 400);
  await User.updateOne({ _id: user._id }, { name: parsed.data.name });
  return NextResponse.json({ ok: true, name: parsed.data.name });
}
