import { NextResponse } from 'next/server';
import { isValidObjectId } from 'mongoose';
import { z } from 'zod';
import { jsonError } from '@/lib/auth';
import { requireAdmin } from '@/lib/adminGuard';
import { User } from '@/models/User';
import { TeacherApplication } from '@/models/TeacherApplication';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DAY = 86_400_000;

const Input = z.union([
  z.object({ role: z.enum(['student', 'teacher', 'admin']) }),
  // Grant / extend premium by N days, or remove it (days: 0)
  z.object({
    premium: z.object({
      plan: z.enum(['monthly', 'quarterly', 'annual']),
      days: z.number().int().min(0).max(3650),
    }),
  }),
]);

/** Admin: change a user's role, or grant / remove premium manually. */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const adminId = await requireAdmin();
  if (!adminId) return jsonError('Forbidden', 403);
  const { id } = await params;
  if (!isValidObjectId(id)) return jsonError('မတွေ့ပါ', 404);

  const parsed = Input.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError('Data မမှန်ပါ', 400);
  const user = await User.findById(id).select('role plan').lean();
  if (!user) return jsonError('မတွေ့ပါ', 404);

  if ('role' in parsed.data) {
    const role = parsed.data.role;
    if (id === adminId && role !== 'admin') {
      return jsonError('ကိုယ့်ကိုယ်ကို admin က ဖြုတ်လို့ မရပါ', 400);
    }
    await User.updateOne({ _id: id }, { role });
    // Keep the teacher application in step so /teach shows the right state
    if (role === 'teacher') {
      await TeacherApplication.updateOne(
        { user: id },
        { $set: { status: 'approved', reviewedBy: adminId, reviewedAt: new Date() } }
      );
    }
    return NextResponse.json({ ok: true, role });
  }

  const { plan, days } = parsed.data.premium;
  if (days === 0) {
    await User.updateOne({ _id: id }, { 'plan.type': 'free', 'plan.expiresAt': null });
    return NextResponse.json({ ok: true, plan: { type: 'free', expiresAt: null } });
  }
  const current = user.plan?.expiresAt ? new Date(user.plan.expiresAt).getTime() : 0;
  const expiresAt = new Date(Math.max(Date.now(), current) + days * DAY);
  await User.updateOne({ _id: id }, { 'plan.type': plan, 'plan.expiresAt': expiresAt });
  return NextResponse.json({ ok: true, plan: { type: plan, expiresAt } });
}
