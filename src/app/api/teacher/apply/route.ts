import { NextResponse } from 'next/server';
import { z } from 'zod';
import { jsonError } from '@/lib/auth';
import { getActor } from '@/lib/roles';
import { TeacherApplication } from '@/models/TeacherApplication';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const Input = z.object({
  fullName: z.string().trim().min(2, 'အမည် ထည့်ပါ').max(80),
  jlptLevel: z.enum(['N1', 'N2', 'N3', 'N4', 'N5', 'none']),
  experience: z.string().trim().max(1000).optional(),
  bio: z.string().trim().max(1000).optional(),
  contact: z.string().trim().min(5, 'ဖုန်း ဒါမှမဟုတ် Telegram ထည့်ပါ').max(120),
  sampleUrl: z.string().trim().max(500).optional(),
});

const view = (a: Record<string, unknown> | null) =>
  a && {
    fullName: a.fullName,
    jlptLevel: a.jlptLevel,
    experience: a.experience,
    bio: a.bio,
    contact: a.contact,
    sampleUrl: a.sampleUrl,
    status: a.status,
    note: a.note,
    createdAt: a.createdAt,
  };

/** My application (if any) and my current role. */
export async function GET() {
  const actor = await getActor();
  if (!actor) return jsonError('Not signed in', 401);
  const app = await TeacherApplication.findOne({ user: actor.id }).lean();
  return NextResponse.json({ role: actor.role, application: view(app as never) });
}

/** Apply, or re-apply after a rejection. */
export async function POST(req: Request) {
  const actor = await getActor();
  if (!actor) return jsonError('Not signed in', 401);
  if (actor.role !== 'student') return jsonError('ဆရာ / admin ဖြစ်ပြီးသားပါ', 409);

  const parsed = Input.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? 'Data မမှန်ပါ', 400);

  const existing = await TeacherApplication.findOne({ user: actor.id }).select('status').lean();
  if (existing?.status === 'pending') return jsonError('လျှောက်လွှာ စစ်ဆေးဆဲ ဖြစ်ပါတယ်', 409);
  if (existing?.status === 'revoked') return jsonError('Admin ကို တိုက်ရိုက် ဆက်သွယ်ပါ', 403);

  const app = await TeacherApplication.findOneAndUpdate(
    { user: actor.id },
    { $set: { ...parsed.data, status: 'pending', note: '', reviewedBy: null, reviewedAt: null } },
    { upsert: true, returnDocument: 'after' }
  ).lean();
  return NextResponse.json({ role: actor.role, application: view(app as never) }, { status: 201 });
}
