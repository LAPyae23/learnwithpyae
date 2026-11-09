import { NextResponse } from 'next/server';
import { isValidObjectId } from 'mongoose';
import { z } from 'zod';
import { jsonError } from '@/lib/auth';
import { requireAdmin } from '@/lib/adminGuard';
import { currentMonth, isMonth, monthEarnings } from '@/lib/earnings';
import { sendTelegram, telegramConfigured } from '@/lib/telegram';
import { Payout } from '@/models/Payout';
import { User } from '@/models/User';
import { formatKs } from '@/data/payment';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Admin: what each teacher earned in ?month=YYYY-MM (default: this month). */
export async function GET(req: Request) {
  if (!(await requireAdmin())) return jsonError('Forbidden', 403);
  const m = new URL(req.url).searchParams.get('month');
  return NextResponse.json(await monthEarnings(isMonth(m) ? m : currentMonth()));
}

const Input = z.object({
  teacherId: z.string(),
  month: z.string(),
  amount: z.number().int().min(0).max(100_000_000),
  note: z.string().trim().max(200).optional(),
});

/** Admin records that a teacher has been paid for a month. */
export async function POST(req: Request) {
  const adminId = await requireAdmin();
  if (!adminId) return jsonError('Forbidden', 403);
  const parsed = Input.safeParse(await req.json().catch(() => null));
  if (!parsed.success || !isValidObjectId(parsed.data.teacherId) || !isMonth(parsed.data.month)) {
    return jsonError('Data မမှန်ပါ', 400);
  }
  const { teacherId, month, amount, note = '' } = parsed.data;
  try {
    await Payout.create({ teacher: teacherId, month, amount, note, paidBy: adminId });
  } catch (e) {
    if ((e as { code?: number }).code === 11000) return jsonError('ဒီလအတွက် ပေးပြီးသားပါ', 409);
    throw e;
  }
  const t = await User.findById(teacherId).select('telegram').lean();
  if (t?.telegram?.chatId && telegramConfigured()) {
    sendTelegram(
      t.telegram.chatId,
      `💰 ${month} လအတွက် ဆရာ ဝင်ငွေ ${formatKs(amount)} လွှဲပေးပြီးပါပြီ။ ကျေးဇူးပါ 🙏`
    ).catch(() => {});
  }
  return NextResponse.json({ ok: true });
}
