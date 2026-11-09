import { NextResponse } from 'next/server';
import { jsonError } from '@/lib/auth';
import { requireAdmin } from '@/lib/adminGuard';
import { Booking } from '@/models/Tutoring';
import '@/models/User';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const STATUSES = ['pending', 'confirmed', 'completed', 'rejected', 'cancelled'] as const;
type Person = { _id: unknown; name: string; email: string } | null;

/** Admin: 1-on-1 bookings by status (pending = payment to check). */
export async function GET(req: Request) {
  if (!(await requireAdmin())) return jsonError('Forbidden', 403);
  const s = new URL(req.url).searchParams.get('status');
  const status = (STATUSES as readonly string[]).includes(s ?? '') ? s! : 'pending';
  const rows = await Booking.find({ status: status as (typeof STATUSES)[number] })
    .sort(status === 'pending' ? { createdAt: 1 } : { startAt: -1 })
    .limit(200)
    .populate<{ teacher: Person; student: Person }>([
      { path: 'teacher', select: 'name email' },
      { path: 'student', select: 'name email' },
    ])
    .lean();
  return NextResponse.json({
    bookings: rows.map((b) => ({
      id: String(b._id),
      teacher: b.teacher ? { name: b.teacher.name, email: b.teacher.email } : null,
      student: b.student ? { name: b.student.name, email: b.student.email } : null,
      startAt: b.startAt,
      durationMin: b.durationMin,
      price: b.price,
      method: b.method,
      transactionId: b.transactionId,
      topic: b.topic,
      status: b.status,
      note: b.note,
      review: b.review?.stars ? { stars: b.review.stars, text: b.review.text } : null,
      createdAt: b.createdAt,
    })),
  });
}
