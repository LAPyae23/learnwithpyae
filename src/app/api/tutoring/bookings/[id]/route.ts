import { NextResponse } from 'next/server';
import { isValidObjectId } from 'mongoose';
import { z } from 'zod';
import { jsonError } from '@/lib/auth';
import { getActor } from '@/lib/roles';
import { fmtClassTime, tellUser } from '@/lib/tutoring';
import { Booking, TutorSlot } from '@/models/Tutoring';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const Input = z.discriminatedUnion('action', [
  z.object({ action: z.literal('link'), meetingLink: z.string().trim().url().max(500) }),
  z.object({ action: z.literal('complete') }),
  z.object({ action: z.literal('cancel') }),
  z.object({
    action: z.literal('review'),
    stars: z.number().int().min(1).max(5),
    text: z.string().trim().max(500).optional(),
  }),
]);

/**
 * link     teacher shares the meeting link (confirmed bookings)
 * complete teacher or student marks it done (after the start time)
 * cancel   student cancels while the payment is still being checked (slot reopens)
 * review   student rates a completed class
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const actor = await getActor();
  if (!actor) return jsonError('Not signed in', 401);
  const { id } = await params;
  if (!isValidObjectId(id)) return jsonError('မတွေ့ပါ', 404);
  const b = await Booking.findById(id);
  if (!b) return jsonError('မတွေ့ပါ', 404);
  const isTeacher = String(b.teacher) === actor.id;
  const isStudent = String(b.student) === actor.id;
  if (!isTeacher && !isStudent) return jsonError('မတွေ့ပါ', 404);

  const parsed = Input.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? 'Data မမှန်ပါ', 400);
  const a = parsed.data;

  if (a.action === 'link') {
    if (!isTeacher) return jsonError('ဆရာပဲ ထည့်လို့ရပါတယ်', 403);
    if (b.status !== 'confirmed') return jsonError('အတည်ပြုပြီးမှ ထည့်လို့ရပါတယ်', 409);
    if (!/^https:\/\//.test(a.meetingLink)) return jsonError('https:// နဲ့ စတဲ့ link ထည့်ပါ', 400);
    b.meetingLink = a.meetingLink;
    await b.save();
    await tellUser(
      b.student,
      `🔗 ${fmtClassTime(b.startAt)} class အတွက် ဆရာက meeting link ထည့်ပေးပါပြီ`
    );
  } else if (a.action === 'complete') {
    if (b.status !== 'confirmed')
      return jsonError('အတည်ပြုထားတဲ့ class ပဲ ပြီးကြောင်း မှတ်လို့ရပါတယ်', 409);
    if (b.startAt.getTime() > Date.now()) return jsonError('Class မစရသေးပါ', 409);
    b.status = 'completed';
    await b.save();
    if (isTeacher) await tellUser(b.student, '⭐ Class ပြီးပါပြီ — ဆရာ့ကို အမှတ်ပေးပါဦး');
  } else if (a.action === 'cancel') {
    if (!isStudent) return jsonError('ဆရာက ပယ်ဖျက်ချင်ရင် admin ကို စာပို့ပါ', 403);
    if (b.status !== 'pending') return jsonError('ငွေစစ်ပြီးသွားပြီ — admin ကို ဆက်သွယ်ပါ', 409);
    b.status = 'cancelled';
    await b.save();
    await TutorSlot.updateOne({ _id: b.slot, status: 'booked' }, { status: 'open' });
  } else {
    if (!isStudent) return jsonError('ကျောင်းသားပဲ အမှတ်ပေးလို့ရပါတယ်', 403);
    if (b.status !== 'completed') return jsonError('Class ပြီးမှ အမှတ်ပေးလို့ရပါတယ်', 409);
    if (b.review?.stars) return jsonError('အမှတ်ပေးပြီးသားပါ', 409);
    b.set('review', { stars: a.stars, text: a.text ?? '', at: new Date() });
    await b.save();
    await tellUser(
      b.teacher,
      `⭐ ကျောင်းသားက ${a.stars} ⭐ ပေးသွားပါတယ်${a.text ? `: "${a.text}"` : ''}`
    );
  }
  return NextResponse.json({ ok: true, status: b.status });
}
