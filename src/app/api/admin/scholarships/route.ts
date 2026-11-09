import { NextResponse } from 'next/server';
import { isValidObjectId } from 'mongoose';
import { z } from 'zod';
import { jsonError } from '@/lib/auth';
import { requireAdmin } from '@/lib/adminGuard';
import { grantPremium } from '@/lib/premium';
import { Scholarship } from '@/models/Reward';
import '@/models/User';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Admin: scholarship queue (?status=pending|granted). */
export async function GET(req: Request) {
  if (!(await requireAdmin())) return jsonError('Forbidden', 403);
  const status = new URL(req.url).searchParams.get('status') === 'granted' ? 'granted' : 'pending';
  const rows = await Scholarship.find({ status })
    .sort(status === 'pending' ? { queuedAt: 1 } : { grantedAt: -1 })
    .limit(200)
    .populate<{ user: { _id: unknown; name: string; email: string; targetLevel?: string } | null }>(
      'user',
      'name email targetLevel streak.current'
    )
    .lean();
  return NextResponse.json({
    scholarships: rows.map((s) => ({
      id: String(s._id),
      user: s.user ? { id: String(s.user._id), name: s.user.name, email: s.user.email } : null,
      reason: s.reason,
      status: s.status,
      days: s.days,
      sponsored: !!s.sponsorPayment,
      createdAt: s.createdAt,
      grantedAt: s.grantedAt,
    })),
  });
}

const Input = z.object({ id: z.string(), days: z.number().int().min(1).max(365) });

/** Admin grants a scholarship directly (without waiting for a sponsor). */
export async function POST(req: Request) {
  if (!(await requireAdmin())) return jsonError('Forbidden', 403);
  const parsed = Input.safeParse(await req.json().catch(() => null));
  if (!parsed.success || !isValidObjectId(parsed.data.id)) return jsonError('Data မမှန်ပါ', 400);
  const s = await Scholarship.findOneAndUpdate(
    { _id: parsed.data.id, status: 'pending' },
    { status: 'granted', days: parsed.data.days, grantedAt: new Date() }
  );
  if (!s) return jsonError('စစ်ပြီးသားပါ', 409);
  await grantPremium(s.user, parsed.data.days, {
    kind: 'gift',
    key: `scholarship:${s._id}:${Date.now()}`,
    note: 'NihongoAcademy ပညာသင်ဆု 🎓',
  });
  return NextResponse.json({ ok: true });
}
