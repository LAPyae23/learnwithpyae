import { NextResponse } from 'next/server';
import { jsonError } from '@/lib/auth';
import { canTeach, getActor } from '@/lib/roles';
import { currentMonth, monthEarnings } from '@/lib/earnings';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const prevMonth = (m: string) => {
  const [y, mo] = m.split('-').map(Number);
  return mo === 1 ? `${y - 1}-12` : `${y}-${String(mo - 1).padStart(2, '0')}`;
};

/** My earnings for this month (estimate so far) and the previous 5 months. */
export async function GET() {
  const actor = await getActor();
  if (!actor) return jsonError('Not signed in', 401);
  if (!canTeach(actor.role)) return jsonError('Forbidden', 403);

  const months = [currentMonth()];
  for (let i = 0; i < 5; i++) months.push(prevMonth(months[months.length - 1]));
  const all = await Promise.all(months.map((m) => monthEarnings(m)));
  return NextResponse.json({
    months: all.map((m) => {
      const mine = m.teachers.find((t) => t.teacherId === actor.id);
      return {
        month: m.month,
        pool: m.pool,
        totalViews: m.totalViews,
        teacherSharePct: m.teacherSharePct,
        tutorCommissionPct: m.tutorCommissionPct,
        views: mine?.views ?? 0,
        viewEarnings: mine?.viewEarnings ?? 0,
        classes: mine?.classes ?? 0,
        classEarnings: mine?.classEarnings ?? 0,
        total: mine?.total ?? 0,
        paid: mine?.paid ?? null,
      };
    }),
  });
}
