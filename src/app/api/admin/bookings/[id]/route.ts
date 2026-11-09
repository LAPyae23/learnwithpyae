import { NextResponse } from 'next/server';
import { isValidObjectId } from 'mongoose';
import { z } from 'zod';
import { jsonError } from '@/lib/auth';
import { requireAdmin } from '@/lib/adminGuard';
import { fmtClassTime, tellUser } from '@/lib/tutoring';
import { Booking, TutorSlot } from '@/models/Tutoring';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

/** Admin: the payment screenshot image. */
export async function GET(_req: Request, { params }: Ctx) {
  if (!(await requireAdmin())) return jsonError('Forbidden', 403);
  const { id } = await params;
  if (!isValidObjectId(id)) return jsonError('မတွေ့ပါ', 404);
  const b = await Booking.findById(id).select('+screenshot.data screenshot.mime').lean();
  if (!b?.screenshot?.data) return jsonError('မတွေ့ပါ', 404);
  return new NextResponse(new Uint8Array(b.screenshot.data as unknown as Buffer), {
    headers: {
      'Content-Type': b.screenshot.mime ?? 'image/jpeg',
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

const Input = z.object({
  action: z.enum(['approve', 'reject']),
  note: z.string().trim().max(300).optional(),
});

/** Admin approves the payment (booking confirmed) or rejects it (slot reopens). */
export async function POST(req: Request, { params }: Ctx) {
  if (!(await requireAdmin())) return jsonError('Forbidden', 403);
  const { id } = await params;
  if (!isValidObjectId(id)) return jsonError('မတွေ့ပါ', 404);
  const parsed = Input.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError('Data မမှန်ပါ', 400);
  const { action, note = '' } = parsed.data;

  const b = await Booking.findOneAndUpdate(
    { _id: id, status: 'pending' },
    { status: action === 'approve' ? 'confirmed' : 'rejected', note },
    { returnDocument: 'after' }
  );
  if (!b) return jsonError('စစ်ပြီးသားပါ', 409);

  const when = fmtClassTime(b.startAt);
  if (action === 'approve') {
    await tellUser(
      b.student,
      `✅ ${when} 1-on-1 class အတည်ဖြစ်ပါပြီ — ဆရာက meeting link ပို့ပေးပါမယ်`
    );
    await tellUser(
      b.teacher,
      `✅ ${when} 1-on-1 class အတည်ဖြစ်ပါပြီ — website မှာ meeting link (Zoom / Meet / Telegram) ထည့်ပေးပါ`
    );
  } else {
    await TutorSlot.updateOne({ _id: b.slot, status: 'booked' }, { status: 'open' });
    await tellUser(
      b.student,
      `❌ ${when} class ရဲ့ ငွေပေးချေမှုကို အတည်မပြုနိုင်ပါ${note ? `: ${note}` : ''}`
    );
  }
  return NextResponse.json({ ok: true, status: b.status });
}
