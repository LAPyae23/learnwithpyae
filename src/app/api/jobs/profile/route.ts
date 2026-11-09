import { NextResponse } from 'next/server';
import { z } from 'zod';
import { jsonError } from '@/lib/auth';
import { getActor } from '@/lib/roles';
import { JLPT_CERTS, JOB_FIELDS, JobProfile } from '@/models/Jobs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const EMPTY = {
  visible: false,
  headline: '',
  fields: [] as string[],
  jlptCertified: 'none',
  location: 'japan',
  availableFrom: '',
  city: '',
  experience: '',
  education: '',
  phone: '',
  telegram: '',
};

/** My job profile. */
export async function GET() {
  const actor = await getActor();
  if (!actor) return jsonError('Not signed in', 401);
  const p = await JobProfile.findOne({ user: actor.id }).lean();
  if (!p) return NextResponse.json({ profile: EMPTY, exists: false });
  const {
    _id: _i,
    user: _u,
    __v: _v,
    createdAt: _c,
    updatedAt: _up,
    ...rest
  } = p as Record<string, unknown>;
  return NextResponse.json({ profile: { ...EMPTY, ...rest }, exists: true });
}

const Input = z.object({
  visible: z.boolean(),
  headline: z.string().trim().max(120),
  fields: z.array(z.enum(JOB_FIELDS)).max(JOB_FIELDS.length),
  jlptCertified: z.enum(JLPT_CERTS),
  location: z.enum(['japan', 'myanmar', 'any']),
  availableFrom: z
    .string()
    .regex(/^(\d{4}-\d{2})?$/)
    .optional()
    .default(''),
  city: z.string().trim().max(60),
  experience: z.string().trim().max(800),
  education: z.string().trim().max(200),
  phone: z.string().trim().max(40),
  telegram: z.string().trim().max(60),
});

export async function PUT(req: Request) {
  const actor = await getActor();
  if (!actor) return jsonError('Not signed in', 401);
  const parsed = Input.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? 'Data မမှန်ပါ', 400);
  if (parsed.data.visible && !parsed.data.phone && !parsed.data.telegram) {
    return jsonError('Agency တွေ ဆက်သွယ်နိုင်ဖို့ ဖုန်း ဒါမှမဟုတ် Telegram ထည့်ပါ', 400);
  }
  if (parsed.data.visible && parsed.data.fields.length === 0) {
    return jsonError('စိတ်ဝင်စားတဲ့ အလုပ် အနည်းဆုံး တစ်ခု ရွေးပါ', 400);
  }
  await JobProfile.updateOne({ user: actor.id }, { $set: parsed.data }, { upsert: true });
  return NextResponse.json({ ok: true });
}
