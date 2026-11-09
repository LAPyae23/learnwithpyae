import { NextResponse } from 'next/server';
import { z } from 'zod';
import { jsonError } from '@/lib/auth';
import { canTeach, getActor } from '@/lib/roles';
import { User } from '@/models/User';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const Input = z.object({
  headline: z.string().trim().max(120),
  bio: z.string().trim().max(1500),
});

/** My public teacher profile. */
export async function GET() {
  const actor = await getActor();
  if (!actor) return jsonError('Not signed in', 401);
  if (!canTeach(actor.role)) return jsonError('Forbidden', 403);
  const u = await User.findById(actor.id).select('teacherProfile').lean();
  return NextResponse.json({
    id: actor.id,
    headline: u?.teacherProfile?.headline ?? '',
    bio: u?.teacherProfile?.bio ?? '',
  });
}

export async function PUT(req: Request) {
  const actor = await getActor();
  if (!actor) return jsonError('Not signed in', 401);
  if (!canTeach(actor.role)) return jsonError('Forbidden', 403);
  const parsed = Input.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError('Data မမှန်ပါ', 400);
  await User.updateOne(
    { _id: actor.id },
    { 'teacherProfile.headline': parsed.data.headline, 'teacherProfile.bio': parsed.data.bio }
  );
  return NextResponse.json({ ok: true });
}
