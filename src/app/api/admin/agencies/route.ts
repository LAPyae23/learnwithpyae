import { NextResponse } from 'next/server';
import { isValidObjectId } from 'mongoose';
import { z } from 'zod';
import { jsonError } from '@/lib/auth';
import { requireAdmin } from '@/lib/adminGuard';
import { sendTelegram, siteUrl, telegramConfigured } from '@/lib/telegram';
import { Agency, AgencyContact } from '@/models/Jobs';
import { User } from '@/models/User';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const STATUSES = ['pending', 'approved', 'rejected', 'suspended'] as const;

/** Admin: agencies by ?status=, with how many learners each has contacted. */
export async function GET(req: Request) {
  if (!(await requireAdmin())) return jsonError('Forbidden', 403);
  const s = new URL(req.url).searchParams.get('status');
  const status = (STATUSES as readonly string[]).includes(s ?? '')
    ? (s as (typeof STATUSES)[number])
    : 'pending';
  const rows = await Agency.find({ status })
    .sort({ updatedAt: -1 })
    .limit(200)
    .populate<{ user: { _id: unknown; name: string; email: string } | null }>('user', 'name email')
    .lean();
  const counts = await AgencyContact.aggregate<{ _id: unknown; n: number; accepted: number }>([
    { $match: { agency: { $in: rows.map((r) => (r.user as { _id: unknown } | null)?._id) } } },
    {
      $group: {
        _id: '$agency',
        n: { $sum: 1 },
        accepted: { $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] } },
      },
    },
  ]);
  const c = new Map(counts.map((x) => [String(x._id), x]));
  return NextResponse.json({
    agencies: rows.map((a) => ({
      id: String(a._id),
      user: a.user ? { name: a.user.name, email: a.user.email } : null,
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
      contacts: c.get(String(a.user?._id))?.n ?? 0,
      accepted: c.get(String(a.user?._id))?.accepted ?? 0,
    })),
  });
}

const Input = z.object({
  id: z.string(),
  action: z.enum(['approve', 'reject', 'suspend', 'extend']),
  days: z.number().int().min(1).max(3650).optional(),
  note: z.string().trim().max(300).optional(),
});

/** Approve (gives `days` of access), extend access, reject or suspend. */
export async function POST(req: Request) {
  if (!(await requireAdmin())) return jsonError('Forbidden', 403);
  const parsed = Input.safeParse(await req.json().catch(() => null));
  if (!parsed.success || !isValidObjectId(parsed.data.id)) return jsonError('Data မမှန်ပါ', 400);
  const { id, action, days = 30, note = '' } = parsed.data;
  const a = await Agency.findById(id);
  if (!a) return jsonError('မတွေ့ပါ', 404);

  if (action === 'approve' || action === 'extend') {
    const base = a.activeUntil && a.activeUntil > new Date() ? a.activeUntil.getTime() : Date.now();
    a.activeUntil = new Date(base + days * 86400000);
    a.status = 'approved';
    a.note = note;
    await a.save();
    await User.updateOne({ _id: a.user, role: 'student' }, { role: 'agency' });
  } else {
    a.status = action === 'reject' ? 'rejected' : 'suspended';
    a.note = note;
    await a.save();
    await User.updateOne({ _id: a.user, role: 'agency' }, { role: 'student' });
  }

  if (telegramConfigured()) {
    const u = await User.findById(a.user).select('telegram').lean();
    if (u?.telegram?.chatId) {
      const text =
        a.status === 'approved'
          ? `✅ Agency အကောင့် ${a.activeUntil?.toISOString().slice(0, 10)} အထိ ဖွင့်ပေးပြီးပါပြီ\n${siteUrl()}/agency`
          : `Agency အကောင့် ${a.status === 'rejected' ? 'အတည်မပြုနိုင်ပါ' : 'ရပ်ဆိုင်းထားပါတယ်'}${note ? `: ${note}` : ''}`;
      sendTelegram(u.telegram.chatId, text).catch(() => {});
    }
  }
  return NextResponse.json({ ok: true, status: a.status, activeUntil: a.activeUntil });
}
