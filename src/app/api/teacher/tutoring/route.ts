import { NextResponse } from 'next/server';
import { z } from 'zod';
import { jsonError } from '@/lib/auth';
import { canTeach, getActor } from '@/lib/roles';
import { User } from '@/models/User';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** My 1-on-1 settings. */
export async function GET() {
  const actor = await getActor();
  if (!actor) return jsonError('Not signed in', 401);
  if (!canTeach(actor.role)) return jsonError('Forbidden', 403);
  const u = await User.findById(actor.id).select('teacherProfile').lean();
  return NextResponse.json({
    enabled: !!u?.teacherProfile?.tutoringEnabled,
    pricePerHour: u?.teacherProfile?.pricePerHour ?? 0,
    about: u?.teacherProfile?.tutoringAbout ?? '',
  });
}

const Input = z.object({
  enabled: z.boolean(),
  pricePerHour: z.number().int().min(0).max(1_000_000),
  about: z.string().trim().max(600),
});

export async function PUT(req: Request) {
  const actor = await getActor();
  if (!actor) return jsonError('Not signed in', 401);
  if (!canTeach(actor.role)) return jsonError('Forbidden', 403);
  const parsed = Input.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError('Data မမှန်ပါ', 400);
  if (parsed.data.enabled && parsed.data.pricePerHour < 1000) {
    return jsonError('တစ်နာရီ ဈေးနှုန်း 1,000 Ks အနည်းဆုံး ထည့်ပါ', 400);
  }
  await User.updateOne(
    { _id: actor.id },
    {
      'teacherProfile.tutoringEnabled': parsed.data.enabled,
      'teacherProfile.pricePerHour': parsed.data.pricePerHour,
      'teacherProfile.tutoringAbout': parsed.data.about,
    }
  );
  return NextResponse.json({ ok: true });
}
