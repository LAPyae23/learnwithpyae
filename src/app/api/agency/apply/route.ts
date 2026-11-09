import { NextResponse } from 'next/server';
import { z } from 'zod';
import { jsonError } from '@/lib/auth';
import { getActor } from '@/lib/roles';
import { Agency } from '@/models/Jobs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** My agency application / status. */
export async function GET() {
  const actor = await getActor();
  if (!actor) return jsonError('Not signed in', 401);
  const a = await Agency.findOne({ user: actor.id }).lean();
  return NextResponse.json({
    role: actor.role,
    agency: a && {
      companyName: a.companyName,
      licenseNo: a.licenseNo,
      country: a.country,
      contactPerson: a.contactPerson,
      phone: a.phone,
      website: a.website,
      description: a.description,
      status: a.status,
      activeUntil: a.activeUntil,
      note: a.note,
    },
  });
}

const Input = z.object({
  companyName: z.string().trim().min(2, 'ကုမ္ပဏီ အမည် ထည့်ပါ').max(120),
  licenseNo: z.string().trim().max(80),
  country: z.enum(['myanmar', 'japan', 'other']),
  contactPerson: z.string().trim().min(2, 'တာဝန်ရှိသူ အမည် ထည့်ပါ').max(80),
  phone: z.string().trim().min(5, 'ဖုန်း ထည့်ပါ').max(40),
  website: z.string().trim().max(200),
  description: z.string().trim().max(1000),
});

/** Apply (or re-apply after a rejection). Teachers/admins can't be agencies. */
export async function POST(req: Request) {
  const actor = await getActor();
  if (!actor) return jsonError('Not signed in', 401);
  if (actor.role === 'teacher' || actor.role === 'admin') {
    return jsonError('Agency အတွက် သီးသန့် အကောင့် ဖွင့်ပါ', 409);
  }
  const parsed = Input.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? 'Data မမှန်ပါ', 400);
  const existing = await Agency.findOne({ user: actor.id }).select('status').lean();
  if (existing && existing.status !== 'rejected') return jsonError('လျှောက်ထားပြီးသားပါ', 409);
  await Agency.updateOne(
    { user: actor.id },
    { $set: { ...parsed.data, status: 'pending', note: '' } },
    { upsert: true }
  );
  return NextResponse.json({ ok: true }, { status: 201 });
}
