import { NextResponse } from 'next/server';
import { jsonError } from '@/lib/auth';
import { requireAdmin } from '@/lib/adminGuard';
import { yangonDay } from '@/lib/streak';
import { User } from '@/models/User';
import { Payment } from '@/models/Payment';
import { CardReview } from '@/models/Flashcard';
import { ExamAttempt } from '@/models/ExamAttempt';
import { Lesson } from '@/models/Lesson';
import { TeacherApplication } from '@/models/TeacherApplication';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DAY = 86_400_000;
const TZ = 'Asia/Yangon';

/** Admin dashboard numbers, all from the database. */
export async function GET() {
  if (!(await requireAdmin())) return jsonError('Forbidden', 403);

  const now = new Date();
  const d7 = new Date(now.getTime() - 7 * DAY);
  const d30 = new Date(now.getTime() - 30 * DAY);
  const weekAgoDay = yangonDay(d7);

  // Month boundaries in Myanmar time (UTC+06:30)
  const offset = 6.5 * 3600_000;
  const local = new Date(now.getTime() + offset);
  const monthStart = new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), 1) - offset);
  const lastMonthStart = new Date(
    Date.UTC(local.getUTCFullYear(), local.getUTCMonth() - 1, 1) - offset
  );
  const sixMonthsStart = new Date(
    Date.UTC(local.getUTCFullYear(), local.getUTCMonth() - 5, 1) - offset
  );

  const sumApproved = (from: Date, to?: Date) =>
    Payment.aggregate<{ total: number; count: number }>([
      {
        $match: {
          status: 'approved',
          reviewedAt: { $gte: from, ...(to ? { $lt: to } : {}) },
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]).then((r) => r[0] ?? { total: 0, count: 0 });

  const [
    totalUsers,
    roles,
    new7,
    new30,
    premium,
    active7,
    levels,
    signups,
    reviews7,
    exams30,
    lessonsByStatus,
    pendingTeachers,
    pendingPayments,
    revThisMonth,
    revLastMonth,
    revAll,
    revByMonth,
    revByPlan,
    revByMethod,
    recentPayments,
  ] = await Promise.all([
    User.countDocuments(),
    User.aggregate<{ _id: string; n: number }>([{ $group: { _id: '$role', n: { $sum: 1 } } }]),
    User.countDocuments({ createdAt: { $gte: d7 } }),
    User.countDocuments({ createdAt: { $gte: d30 } }),
    User.countDocuments({ 'plan.type': { $ne: 'free' }, 'plan.expiresAt': { $gt: now } }),
    User.countDocuments({ 'streak.lastStudyDay': { $gte: weekAgoDay } }),
    User.aggregate<{ _id: string | null; n: number }>([
      { $group: { _id: '$targetLevel', n: { $sum: 1 } } },
    ]),
    User.aggregate<{ _id: string; n: number }>([
      { $match: { createdAt: { $gte: d30 } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: TZ } },
          n: { $sum: 1 },
        },
      },
    ]),
    CardReview.countDocuments({ lastReviewedAt: { $gte: d7 } }),
    ExamAttempt.aggregate<{ n: number; avg: number }>([
      { $match: { createdAt: { $gte: d30 } } },
      {
        $group: {
          _id: null,
          n: { $sum: 1 },
          avg: {
            $avg: {
              $cond: [
                { $gt: ['$totalQuestions', 0] },
                { $divide: ['$totalScore', '$totalQuestions'] },
                0,
              ],
            },
          },
        },
      },
    ]).then((r) => r[0] ?? { n: 0, avg: 0 }),
    Lesson.aggregate<{ _id: string; n: number }>([{ $group: { _id: '$status', n: { $sum: 1 } } }]),
    TeacherApplication.countDocuments({ status: 'pending' }),
    Payment.countDocuments({ status: 'pending' }),
    sumApproved(monthStart),
    sumApproved(lastMonthStart, monthStart),
    sumApproved(new Date(0)),
    Payment.aggregate<{ _id: string; total: number; count: number }>([
      { $match: { status: 'approved', reviewedAt: { $gte: sixMonthsStart } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$reviewedAt', timezone: TZ } },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]),
    Payment.aggregate<{ _id: string; total: number; count: number }>([
      { $match: { status: 'approved' } },
      { $group: { _id: '$plan', total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]),
    Payment.aggregate<{ _id: string; total: number; count: number }>([
      { $match: { status: 'approved' } },
      { $group: { _id: '$method', total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]),
    Payment.find({ status: 'approved' })
      .sort({ reviewedAt: -1 })
      .limit(10)
      .select('user plan amount method reviewedAt')
      .populate<{ user: { name: string; email: string } | null }>('user', 'name email')
      .lean(),
  ]);

  // Fill gaps so charts have one bar per day / month
  const signupMap = new Map(signups.map((s) => [s._id, s.n]));
  const signupsByDay = Array.from({ length: 30 }, (_, i) => {
    const day = yangonDay(new Date(now.getTime() - (29 - i) * DAY));
    return { day, n: signupMap.get(day) ?? 0 };
  });
  const monthMap = new Map(revByMonth.map((m) => [m._id, m]));
  const revenueByMonth = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth() - 5 + i, 1));
    const key = d.toISOString().slice(0, 7);
    return {
      month: key,
      total: monthMap.get(key)?.total ?? 0,
      count: monthMap.get(key)?.count ?? 0,
    };
  });

  const byKey = <T extends { _id: string | null }>(rows: T[], key: keyof T) =>
    Object.fromEntries(rows.map((r) => [r._id ?? 'none', r[key]]));

  return NextResponse.json({
    users: {
      total: totalUsers,
      roles: byKey(roles, 'n'),
      new7,
      new30,
      premium,
      active7,
      levels: byKey(levels, 'n'),
      signupsByDay,
    },
    learning: {
      cardsReviewed7: reviews7,
      exams30: exams30.n,
      examAvgPct: Math.round((exams30.avg ?? 0) * 100),
    },
    content: {
      lessons: byKey(lessonsByStatus, 'n'),
      pendingTeachers,
      pendingPayments,
    },
    revenue: {
      thisMonth: revThisMonth,
      lastMonth: revLastMonth,
      allTime: revAll,
      byMonth: revenueByMonth,
      byPlan: revByPlan.map((r) => ({ plan: r._id, total: r.total, count: r.count })),
      byMethod: revByMethod.map((r) => ({ method: r._id, total: r.total, count: r.count })),
      recent: recentPayments.map((p) => ({
        id: String(p._id),
        user: p.user ? { name: p.user.name, email: p.user.email } : null,
        plan: p.plan,
        amount: p.amount,
        method: p.method,
        at: p.reviewedAt,
      })),
    },
  });
}
