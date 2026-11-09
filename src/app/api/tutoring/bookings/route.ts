import { NextResponse } from 'next/server';
import { isValidObjectId } from 'mongoose';
import { jsonError } from '@/lib/auth';
import { getActor } from '@/lib/roles';
import { readScreenshot } from '@/lib/images';
import { getSiteSettings } from '@/lib/settings';
import { bookingView, fmtClassTime, tellUser } from '@/lib/tutoring';
import { Booking, TutorSlot } from '@/models/Tutoring';
import '@/models/User';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Person = { _id: unknown; name: string } | null;

/** My bookings — as a student (default) or ?as=teacher. */
export async function GET(req: Request) {
  const actor = await getActor();
  if (!actor) return jsonError('Not signed in', 401);
  const asTeacher = new URL(req.url).searchParams.get('as') === 'teacher';
  const rows = await Booking.find(asTeacher ? { teacher: actor.id } : { student: actor.id })
    .sort({ startAt: -1 })
    .limit(100)
    .populate<{ teacher: Person; student: Person }>([
      { path: 'teacher', select: 'name' },
      { path: 'student', select: 'name' },
    ])
    .lean();
  return NextResponse.json({
    bookings: rows.map((b) => bookingView(b as never, { teacher: b.teacher, student: b.student })),
  });
}

/** Book an open slot and upload the payment screenshot (multipart form). */
export async function POST(req: Request) {
  const actor = await getActor();
  if (!actor) return jsonError('Not signed in', 401);
  const form = await req.formData().catch(() => null);
  if (!form) return jsonError('Form မမှန်ပါ', 400);
  const slotId = String(form.get('slotId') ?? '');
  const method = String(form.get('method') ?? '');
  const topic = String(form.get('topic') ?? '')
    .trim()
    .slice(0, 300);
  const transactionId = String(form.get('transactionId') ?? '')
    .trim()
    .slice(0, 64);
  if (!isValidObjectId(slotId)) return jsonError('အချိန် မတွေ့ပါ', 404);

  const settings = await getSiteSettings();
  if (!settings.accounts.some((a) => a.enabled && a.method === method)) {
    return jsonError('ငွေပေးချေမှု နည်းလမ်း ရွေးပါ', 400);
  }
  const shot = await readScreenshot(form.get('screenshot'));
  if ('error' in shot) return jsonError(shot.error, shot.status);

  if ((await Booking.countDocuments({ student: actor.id, status: 'pending' })) >= 3) {
    return jsonError('စစ်ဆေးဆဲ booking ရှိနေပါသေးတယ်', 429);
  }

  // Atomically take the slot
  const slot = await TutorSlot.findOneAndUpdate(
    { _id: slotId, status: 'open', startAt: { $gt: new Date() }, teacher: { $ne: actor.id } },
    { status: 'booked' },
    { returnDocument: 'after' }
  );
  if (!slot) return jsonError('ဒီအချိန်ကို တခြားသူ book ပြီးသွားပါပြီ', 409);

  const b = await Booking.create({
    slot: slot._id,
    teacher: slot.teacher,
    student: actor.id,
    startAt: slot.startAt,
    durationMin: slot.durationMin,
    price: slot.price,
    topic,
    method,
    transactionId,
    screenshot: shot,
  });
  await tellUser(
    slot.teacher,
    `📅 ${actor.name} က ${fmtClassTime(slot.startAt)} 1-on-1 class ကို book လိုက်ပါတယ် — admin ငွေစစ်ပြီးရင် အတည်ဖြစ်ပါမယ်`
  );
  return NextResponse.json({ id: String(b._id) }, { status: 201 });
}
