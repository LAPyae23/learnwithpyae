import { NextResponse } from 'next/server';
import { jsonError } from '@/lib/auth';
import { requireAdmin } from '@/lib/adminGuard';
import { User } from '@/models/User';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PAGE_SIZE = 25;
const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Admin: search and page through users. ?q= name/email, ?role=, ?plan=premium|free, ?page= */
export async function GET(req: Request) {
  if (!(await requireAdmin())) return jsonError('Forbidden', 403);
  const p = new URL(req.url).searchParams;
  const q = (p.get('q') ?? '').trim().slice(0, 80);
  const role = p.get('role');
  const plan = p.get('plan');
  const page = Math.max(1, Math.min(1000, Number(p.get('page')) || 1));
  const now = new Date();

  const filter: Record<string, unknown> = {};
  if (q) {
    const rx = new RegExp(escapeRegex(q), 'i');
    filter.$or = [{ name: rx }, { email: rx }];
  }
  if (role === 'student' || role === 'teacher' || role === 'admin') filter.role = role;
  if (plan === 'premium') {
    filter['plan.type'] = { $ne: 'free' };
    filter['plan.expiresAt'] = { $gt: now };
  } else if (plan === 'free') {
    filter.$and = [
      {
        $or: [
          { 'plan.type': 'free' },
          { 'plan.expiresAt': null },
          { 'plan.expiresAt': { $lte: now } },
        ],
      },
    ];
  }

  const [total, users] = await Promise.all([
    User.countDocuments(filter),
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .select('name email role targetLevel plan streak telegram.chatId createdAt')
      .lean(),
  ]);

  return NextResponse.json({
    total,
    page,
    pages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    users: users.map((u) => ({
      id: String(u._id),
      name: u.name,
      email: u.email,
      role: u.role ?? 'student',
      targetLevel: u.targetLevel ?? null,
      plan: {
        type: u.plan?.type ?? 'free',
        expiresAt: u.plan?.expiresAt ?? null,
        active: !!u.plan?.expiresAt && u.plan.type !== 'free' && new Date(u.plan.expiresAt) > now,
      },
      streak: u.streak?.current ?? 0,
      lastStudyDay: u.streak?.lastStudyDay ?? null,
      telegram: !!u.telegram?.chatId,
      createdAt: u.createdAt,
    })),
  });
}
