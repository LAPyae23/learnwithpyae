import { NextResponse } from 'next/server';
import { isValidObjectId } from 'mongoose';
import { z } from 'zod';
import { jsonError } from '@/lib/auth';
import { canTeach, getActor } from '@/lib/roles';
import { slotPrice } from '@/lib/tutoring';
import { SLOT_DURATIONS, TutorSlot, Booking } from '@/models/Tutoring';
import { User } from '@/models/User';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET ?teacher=<id>  a teacher's 1-on-1 offer and open future slots (any signed-in user)
 * GET ?mine=1        my slots (teachers), upcoming first
 */
export async function GET(req: Request) {
  const actor = await getActor();
  if (!actor) return jsonError('Not signed in', 401);
  const p = new URL(req.url).searchParams;
  const now = new Date();

  if (p.get('mine') === '1') {
    if (!canTeach(actor.role)) return jsonError('Forbidden', 403);
    const slots = await TutorSlot.find({
      teacher: actor.id,
      status: { $ne: 'cancelled' },
      startAt: { $gte: new Date(now.getTime() - 7 * 86400000) },
    })
      .sort({ startAt: 1 })
      .limit(200)
      .lean();
    return NextResponse.json({
      slots: slots.map((s) => ({
        id: String(s._id),
        startAt: s.startAt,
        durationMin: s.durationMin,
        price: s.price,
        status: s.status,
      })),
    });
  }

  // One slot, for the booking page
  const slotId = p.get('slot');
  if (slotId) {
    if (!isValidObjectId(slotId)) return jsonError('အချိန် မတွေ့ပါ', 404);
    const s = await TutorSlot.findById(slotId)
      .populate<{ teacher: { _id: unknown; name: string } | null }>('teacher', 'name')
      .lean();
    if (!s || !s.teacher) return jsonError('အချိန် မတွေ့ပါ', 404);
    return NextResponse.json({
      slot: {
        id: String(s._id),
        startAt: s.startAt,
        durationMin: s.durationMin,
        price: s.price,
        available: s.status === 'open' && s.startAt > now,
        teacher: { id: String(s.teacher._id), name: s.teacher.name },
      },
    });
  }

  const teacherId = p.get('teacher');
  if (!teacherId || !isValidObjectId(teacherId)) return jsonError('ဆရာ မတွေ့ပါ', 404);
  const t = await User.findOne({ _id: teacherId, role: { $in: ['teacher', 'admin'] } })
    .select('name teacherProfile')
    .lean();
  if (!t) return jsonError('ဆရာ မတွေ့ပါ', 404);

  const [slots, reviews] = await Promise.all([
    t.teacherProfile?.tutoringEnabled
      ? TutorSlot.find({ teacher: teacherId, status: 'open', startAt: { $gt: now } })
          .sort({ startAt: 1 })
          .limit(60)
          .lean()
      : [],
    Booking.aggregate<{ n: number; avg: number }>([
      { $match: { teacher: t._id, 'review.stars': { $ne: null } } },
      { $group: { _id: null, n: { $sum: 1 }, avg: { $avg: '$review.stars' } } },
    ]),
  ]);
  return NextResponse.json({
    teacher: { id: String(t._id), name: t.name },
    enabled: !!t.teacherProfile?.tutoringEnabled,
    pricePerHour: t.teacherProfile?.pricePerHour ?? 0,
    about: t.teacherProfile?.tutoringAbout ?? '',
    reviews: { count: reviews[0]?.n ?? 0, avg: Math.round((reviews[0]?.avg ?? 0) * 10) / 10 },
    slots: slots.map((s) => ({
      id: String(s._id),
      startAt: s.startAt,
      durationMin: s.durationMin,
      price: s.price,
    })),
  });
}

const Input = z.object({
  startAt: z.string().datetime({ offset: true }),
  durationMin: z.number().refine((v) => (SLOT_DURATIONS as readonly number[]).includes(v)),
});

/** Teacher offers a new time. */
export async function POST(req: Request) {
  const actor = await getActor();
  if (!actor) return jsonError('Not signed in', 401);
  if (!canTeach(actor.role)) return jsonError('ဆရာ အကောင့်နဲ့ပဲ ရပါတယ်', 403);
  const parsed = Input.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError('အချိန် မမှန်ပါ', 400);

  const u = await User.findById(actor.id).select('teacherProfile').lean();
  if (!u?.teacherProfile?.tutoringEnabled || !u.teacherProfile.pricePerHour) {
    return jsonError('1-on-1 ကို အရင် ဖွင့်ပြီး ဈေးနှုန်း သတ်မှတ်ပါ', 400);
  }
  const startAt = new Date(parsed.data.startAt);
  if (startAt.getTime() < Date.now() + 60 * 60 * 1000)
    return jsonError('အနည်းဆုံး ၁ နာရီ ကြိုတင် ဖွင့်ပါ', 400);
  if (startAt.getTime() > Date.now() + 90 * 86400000)
    return jsonError('ရက် ၉၀ အတွင်းပဲ ဖွင့်လို့ရပါတယ်', 400);

  const end = new Date(startAt.getTime() + parsed.data.durationMin * 60000);
  // No overlapping slots for the same teacher
  const overlapping = await TutorSlot.find({
    teacher: actor.id,
    status: { $ne: 'cancelled' },
    startAt: { $lt: end, $gt: new Date(startAt.getTime() - 3 * 3600000) },
  }).lean();
  if (overlapping.some((s) => s.startAt.getTime() + s.durationMin * 60000 > startAt.getTime())) {
    return jsonError('ဒီအချိန်နဲ့ ထပ်နေတဲ့ class ရှိပြီးသားပါ', 409);
  }
  if (
    (await TutorSlot.countDocuments({
      teacher: actor.id,
      status: 'open',
      startAt: { $gt: new Date() },
    })) >= 100
  ) {
    return jsonError('ဖွင့်ထားတဲ့ အချိန် အရမ်းများနေပါပြီ', 429);
  }

  const s = await TutorSlot.create({
    teacher: actor.id,
    startAt,
    durationMin: parsed.data.durationMin,
    price: slotPrice(u.teacherProfile.pricePerHour, parsed.data.durationMin),
  });
  return NextResponse.json({ id: String(s._id), price: s.price }, { status: 201 });
}

/** Teacher removes an open (unbooked) slot: DELETE ?id= */
export async function DELETE(req: Request) {
  const actor = await getActor();
  if (!actor) return jsonError('Not signed in', 401);
  const id = new URL(req.url).searchParams.get('id');
  if (!id || !isValidObjectId(id)) return jsonError('Data မမှန်ပါ', 400);
  const res = await TutorSlot.updateOne(
    { _id: id, teacher: actor.id, status: 'open' },
    { status: 'cancelled' }
  );
  if (!res.modifiedCount) return jsonError('Book ထားပြီးသား ဒါမှမဟုတ် မတွေ့ပါ', 409);
  return NextResponse.json({ ok: true });
}
