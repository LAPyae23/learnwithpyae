import { NextResponse } from 'next/server';
import { isValidObjectId } from 'mongoose';
import { z } from 'zod';
import { jsonError } from '@/lib/auth';
import { requireAdmin } from '@/lib/adminGuard';
import { TeacherApplication } from '@/models/TeacherApplication';
import { User } from '@/models/User';
import { Lesson } from '@/models/Lesson';
import { sendTelegram, telegramConfigured } from '@/lib/telegram';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const Input = z.object({
  action: z.enum(['approve', 'reject', 'revoke']),
  note: z.string().trim().max(300).optional(),
});

type AppStatus = 'pending' | 'approved' | 'rejected' | 'revoked';
const FROM: Record<'approve' | 'reject' | 'revoke', AppStatus[]> = {
  approve: ['pending', 'rejected'],
  reject: ['pending'],
  revoke: ['approved'],
};

/** Approve (student → teacher), reject, or revoke (teacher → student, lessons unpublished). */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const adminId = await requireAdmin();
  if (!adminId) return jsonError('Forbidden', 403);
  const { id } = await params;
  if (!isValidObjectId(id)) return jsonError('မတွေ့ပါ', 404);

  const parsed = Input.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError('Data မမှန်ပါ', 400);
  const { action, note = '' } = parsed.data;

  const status: AppStatus =
    action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'revoked';
  const app = await TeacherApplication.findOneAndUpdate(
    { _id: id, status: { $in: FROM[action] } },
    { $set: { status, note, reviewedBy: adminId, reviewedAt: new Date() } },
    { returnDocument: 'after' }
  ).lean();
  if (!app) return jsonError('ဒီလျှောက်လွှာကို စစ်ပြီးသားပါ', 409);

  const user = await User.findById(app.user).select('role telegram').lean();
  if (user && user.role !== 'admin') {
    if (action === 'approve') await User.updateOne({ _id: app.user }, { role: 'teacher' });
    if (action === 'revoke') {
      await User.updateOne({ _id: app.user }, { role: 'student' });
      await Lesson.updateMany(
        { author: app.user, status: { $in: ['published', 'pending'] } },
        { status: 'draft' }
      );
    }
  }

  if (user?.telegram?.chatId && telegramConfigured()) {
    const text =
      action === 'approve'
        ? '🎉 ဆရာ အဖြစ် အတည်ပြုပြီးပါပြီ! website မှာ "သင်ခန်းစာ Studio" ကနေ သင်ခန်းစာ စရေးလို့ရပါပြီ။'
        : action === 'reject'
          ? `ဆရာ လျှောက်လွှာကို ယခု အတည်မပြုနိုင်သေးပါ။${note ? `\nအကြောင်းရင်း: ${note}` : ''}`
          : `ဆရာ အခွင့်အရေးကို ရပ်ဆိုင်းထားပါတယ်။${note ? `\nအကြောင်းရင်း: ${note}` : ''}`;
    sendTelegram(user.telegram.chatId, text).catch((e) => console.error('notify failed', e));
  }

  return NextResponse.json({ ok: true, status });
}
