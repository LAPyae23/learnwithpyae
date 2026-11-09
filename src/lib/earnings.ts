import 'server-only';
import { Types } from 'mongoose';
import { getSiteSettings } from './settings';
import { Payment } from '@/models/Payment';
import { LessonView } from '@/models/Social';
import { User } from '@/models/User';
import { Payout } from '@/models/Payout';
import { Booking } from '@/models/Tutoring';

const OFFSET = 6.5 * 3600_000; // Myanmar time

export const currentMonth = () => new Date(Date.now() + OFFSET).toISOString().slice(0, 7);

/** UTC instants for the start/end of a Myanmar calendar month "YYYY-MM". */
export function monthRange(month: string) {
  const [y, m] = month.split('-').map(Number);
  return {
    from: new Date(Date.UTC(y, m - 1, 1) - OFFSET),
    to: new Date(Date.UTC(y, m, 1) - OFFSET),
  };
}

export const isMonth = (v: string | null): v is string => !!v && /^\d{4}-(0[1-9]|1[0-2])$/.test(v);

export interface TeacherEarning {
  teacherId: string;
  name: string;
  views: number;
  sharePct: number;
  viewEarnings: number;
  classes: number;
  classEarnings: number;
  total: number;
  paid: { amount: number; paidAt: Date } | null;
}

/**
 * A month's teacher earnings:
 * - Premium pool = teacherSharePct% of approved Premium payments, split by each teacher's
 *   unique lesson views that month;
 * - plus 1-on-1 classes completed that month, minus the platform commission.
 */
export async function monthEarnings(month: string) {
  const { from, to } = monthRange(month);
  const settings = await getSiteSettings();

  const [revenueRow, viewRows, classRows, payouts] = await Promise.all([
    Payment.aggregate<{ total: number }>([
      { $match: { status: 'approved', reviewedAt: { $gte: from, $lt: to } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    LessonView.aggregate<{ _id: Types.ObjectId; views: number }>([
      { $match: { at: { $gte: from, $lt: to } } },
      { $lookup: { from: 'lessons', localField: 'lesson', foreignField: '_id', as: 'l' } },
      { $unwind: '$l' },
      { $match: { 'l.author': { $ne: null } } },
      { $group: { _id: '$l.author', views: { $sum: 1 } } },
    ]),
    Booking.aggregate<{ _id: Types.ObjectId; n: number; fees: number }>([
      { $match: { status: 'completed', startAt: { $gte: from, $lt: to } } },
      { $group: { _id: '$teacher', n: { $sum: 1 }, fees: { $sum: '$price' } } },
    ]),
    Payout.find({ month }).lean(),
  ]);

  const revenue = revenueRow[0]?.total ?? 0;
  const pool = Math.floor((revenue * settings.teacherSharePct) / 100);
  const totalViews = viewRows.reduce((a, r) => a + r.views, 0);
  const ids = [...new Set([...viewRows, ...classRows].map((r) => String(r._id)))];
  const users = await User.find({ _id: { $in: ids } })
    .select('name role')
    .lean();
  const name = new Map(users.map((u) => [String(u._id), u.name]));
  const views = new Map(viewRows.map((r) => [String(r._id), r.views]));
  const classes = new Map(classRows.map((r) => [String(r._id), r]));
  const paid = new Map(payouts.map((p) => [String(p.teacher), p]));
  const keep = 1 - settings.tutorCommissionPct / 100;

  const teachers: TeacherEarning[] = ids
    .map((id) => {
      const v = views.get(id) ?? 0;
      const c = classes.get(id);
      const viewEarnings = totalViews ? Math.floor((pool * v) / totalViews) : 0;
      const classEarnings = Math.floor((c?.fees ?? 0) * keep);
      const p = paid.get(id);
      return {
        teacherId: id,
        name: name.get(id) ?? 'ဖျက်ထားသော user',
        views: v,
        sharePct: totalViews ? Math.round((v / totalViews) * 1000) / 10 : 0,
        viewEarnings,
        classes: c?.n ?? 0,
        classEarnings,
        total: viewEarnings + classEarnings,
        paid: p ? { amount: p.amount, paidAt: p.paidAt } : null,
      };
    })
    .sort((a, b) => b.total - a.total);

  return {
    month,
    revenue,
    teacherSharePct: settings.teacherSharePct,
    tutorCommissionPct: settings.tutorCommissionPct,
    pool,
    totalViews,
    teachers,
  };
}
