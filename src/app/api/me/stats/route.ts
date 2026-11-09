import { NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { jsonError } from '@/lib/auth';
import { getActor } from '@/lib/roles';
import { previousDay, yangonDay } from '@/lib/streak';
import { User } from '@/models/User';
import { CardReview } from '@/models/Flashcard';
import { ExamAttempt } from '@/models/ExamAttempt';
import { DailyActivity } from '@/models/Group';
import { LessonView } from '@/models/Social';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** The learner's real study statistics for the profile page. */
export async function GET() {
  const actor = await getActor();
  if (!actor) return jsonError('Not signed in', 401);
  const uid = new Types.ObjectId(actor.id);

  const days = [yangonDay()];
  for (let i = 0; i < 6; i++) days.push(previousDay(days[days.length - 1]));

  const [user, reviews, exams, activeDays, week, lessons] = await Promise.all([
    User.findById(uid).select('streak').lean(),
    CardReview.aggregate<{ total: number; known: number }>([
      { $match: { user: uid } },
      {
        $group: {
          _id: null,
          total: { $sum: '$reviewCount' },
          known: { $sum: { $cond: [{ $gte: ['$repetitions', 2] }, 1, 0] } },
        },
      },
    ]).then((r) => r[0] ?? { total: 0, known: 0 }),
    ExamAttempt.aggregate<{ n: number; best: number }>([
      { $match: { user: uid } },
      {
        $group: {
          _id: null,
          n: { $sum: 1 },
          best: {
            $max: {
              $cond: [
                { $gt: ['$totalQuestions', 0] },
                { $divide: ['$totalScore', '$totalQuestions'] },
                0,
              ],
            },
          },
        },
      },
    ]).then((r) => r[0] ?? { n: 0, best: 0 }),
    DailyActivity.countDocuments({ user: uid, points: { $gt: 0 } }),
    DailyActivity.find({ user: uid, day: { $in: days } })
      .select('day points')
      .lean(),
    LessonView.countDocuments({ user: uid }),
  ]);

  const byDay = new Map(week.map((w) => [w.day, w.points]));
  return NextResponse.json({
    streak: { current: user?.streak?.current ?? 0, longest: user?.streak?.longest ?? 0 },
    cardsReviewed: reviews.total,
    cardsKnown: reviews.known,
    exams: exams.n,
    bestExamPct: Math.round((exams.best ?? 0) * 100),
    activeDays,
    lessonsWatched: lessons,
    week: [...days].reverse().map((d) => ({ day: d, points: byDay.get(d) ?? 0 })),
  });
}
