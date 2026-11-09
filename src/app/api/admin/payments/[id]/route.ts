import { NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { z } from 'zod';
import { jsonError } from '@/lib/auth';
import { requireAdmin } from '@/lib/adminGuard';
import { PLANS, type PlanId } from '@/data/payment';
import { Payment } from '@/models/Payment';
import { User } from '@/models/User';
import { sendTelegram, telegramConfigured } from '@/lib/telegram';

export const runtime = 'nodejs';

const DAY_MS = 86_400_000;

/** Screenshot image for the admin review screen. */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return jsonError('Forbidden', 403);
  const { id } = await ctx.params;
  if (!Types.ObjectId.isValid(id)) return jsonError('Not found', 404);
  const p = await Payment.findById(id).select('+screenshot.data screenshot.mime').lean();
  if (!p?.screenshot?.data) return jsonError('Not found', 404);
  const data = p.screenshot.data as unknown as { buffer: ArrayBuffer } | Buffer;
  const bytes = Buffer.isBuffer(data)
    ? data
    : Buffer.from((data as { buffer: ArrayBuffer }).buffer);
  return new Response(new Uint8Array(bytes), {
    headers: {
      'Content-Type': p.screenshot.mime ?? 'image/jpeg',
      'Cache-Control': 'private, no-store',
      'Content-Disposition': 'inline',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

const schema = z.object({
  action: z.enum(['approve', 'reject']),
  note: z.string().max(300).optional(),
});

/** Approve (grants/extends the plan) or reject a pending payment. */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const adminId = await requireAdmin();
  if (!adminId) return jsonError('Forbidden', 403);
  const { id } = await ctx.params;
  if (!Types.ObjectId.isValid(id)) return jsonError('Not found', 404);
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError('Invalid action', 400);
  const { action, note = '' } = parsed.data;

  // Atomically claim the pending payment so two admins can't approve it twice
  const payment = await Payment.findOneAndUpdate(
    { _id: id, status: 'pending' },
    {
      $set: {
        status: action === 'approve' ? 'approved' : 'rejected',
        note,
        reviewedBy: adminId,
        reviewedAt: new Date(),
      },
    },
    { returnDocument: 'after' }
  );
  if (!payment) return jsonError('ဒီငွေပေးချေမှုကို စစ်ပြီးသားပါ', 409);

  const user = await User.findById(payment.user).select('name plan telegram').lean();
  let expiresAt: Date | null = null;

  if (action === 'approve' && user) {
    const plan = PLANS[payment.plan as PlanId];
    // Extend from the current expiry if the plan is still active, otherwise from now
    const currentExpiry = user.plan?.expiresAt ? new Date(user.plan.expiresAt).getTime() : 0;
    const base = Math.max(Date.now(), currentExpiry);
    expiresAt = new Date(base + plan.days * DAY_MS);
    await User.updateOne(
      { _id: payment.user },
      { $set: { 'plan.type': payment.plan, 'plan.expiresAt': expiresAt } }
    );
    await Payment.updateOne({ _id: payment._id }, { $set: { planExpiresAt: expiresAt } });
  }

  // Let the student know on Telegram if they've connected it (best effort)
  if (user?.telegram?.chatId && telegramConfigured()) {
    const text =
      action === 'approve'
        ? `✅ ငွေပေးချေမှု အတည်ပြုပြီးပါပြီ။ ${PLANS[payment.plan as PlanId].name} Plan ကို ${expiresAt?.toISOString().slice(0, 10)} အထိ သုံးနိုင်ပါပြီ။`
        : `❌ ငွေပေးချေမှုကို အတည်မပြုနိုင်ပါ။${note ? `\nအကြောင်းရင်း: ${note}` : ''}`;
    sendTelegram(user.telegram.chatId, text).catch((e) => console.error('notify failed', e));
  }

  return NextResponse.json({ ok: true, status: payment.status, expiresAt });
}
