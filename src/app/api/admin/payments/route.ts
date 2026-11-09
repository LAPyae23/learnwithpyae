import { NextResponse } from 'next/server';
import { jsonError } from '@/lib/auth';
import { requireAdmin } from '@/lib/adminGuard';
import { Payment } from '@/models/Payment';
// Registers the User model for populate()
import '@/models/User';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  if (!(await requireAdmin())) return jsonError('Forbidden', 403);
  const raw = new URL(req.url).searchParams.get('status') ?? 'pending';
  const STATUSES = ['pending', 'approved', 'rejected'] as const;
  const status = STATUSES.find((s) => s === raw);
  const filter = status ? { status } : {};

  const payments = await Payment.find(filter)
    .sort({ createdAt: status === 'pending' ? 1 : -1 })
    .limit(100)
    .select(
      'user plan amount method transactionId status note createdAt reviewedAt screenshot.size'
    )
    .populate<{ user: { _id: unknown; name: string; email: string } | null }>('user', 'name email')
    .lean<
      {
        _id: unknown;
        user: { _id: unknown; name: string; email: string } | null;
        plan: string;
        amount: number;
        method: string;
        transactionId: string;
        status: string;
        note: string;
        createdAt: Date;
        reviewedAt: Date | null;
      }[]
    >();

  return NextResponse.json({
    payments: payments.map((p) => ({
      id: String(p._id),
      user: p.user ? { id: String(p.user._id), name: p.user.name, email: p.user.email } : null,
      plan: p.plan,
      amount: p.amount,
      method: p.method,
      transactionId: p.transactionId,
      status: p.status,
      note: p.note,
      createdAt: p.createdAt,
      reviewedAt: p.reviewedAt,
    })),
  });
}
