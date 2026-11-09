import { NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { getSession, jsonError } from '@/lib/auth';
import { buildPlan, type Level } from '@/lib/planner';
import { nextJlptDate } from '@/lib/jlpt';
import { User } from '@/models/User';
import { CardReview } from '@/models/Flashcard';
import { ExamAttempt } from '@/models/ExamAttempt';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const LEVEL_ORDER: Level[] = ['N5', 'N4', 'N3'];

/** First Sunday of the exam month (JLPT is held on the first Sunday of July/December). */
function examDateFromSession(session: string | null | undefined) {
  if (!session || !/^\d{4}-\d{2}$/.test(session)) return null;
  const [y, m] = session.split('-').map(Number);
  const d = new Date(y, m - 1, 1);
  d.setDate(1 + ((7 - d.getDay()) % 7));
  return d;
}

export async function GET() {
  const session = await getSession();
  if (!session) return jsonError('Not signed in', 401);
  await connectDB();

  const user = await User.findById(session.sub)
    .select('targetLevel examSession studyMinutesPerDay')
    .lean();
  if (!user) return jsonError('User not found', 404);

  const level: Level = LEVEL_ORDER.includes(user.targetLevel as Level)
    ? (user.targetLevel as Level)
    : 'N5';
  const examDate = examDateFromSession(user.examSession) ?? nextJlptDate();
  const levelsIncluded = LEVEL_ORDER.slice(0, LEVEL_ORDER.indexOf(level) + 1);
  const userId = new Types.ObjectId(session.sub);

  // A card counts as "learned" once it has been answered correctly at least once (repetitions ≥ 1).
  const [learned, reviewsDue, attempts] = await Promise.all([
    CardReview.aggregate<{ _id: string; n: number }>([
      { $match: { user: userId, repetitions: { $gte: 1 } } },
      { $lookup: { from: 'cards', localField: 'card', foreignField: '_id', as: 'c' } },
      { $unwind: '$c' },
      { $match: { 'c.level': { $in: levelsIncluded } } },
      { $group: { _id: '$c.type', n: { $sum: 1 } } },
    ]),
    CardReview.countDocuments({ user: userId, dueAt: { $lte: new Date() } }),
    ExamAttempt.find({ user: userId, level })
      .sort({ createdAt: -1 })
      .limit(3)
      .select('totalScore totalQuestions')
      .lean(),
  ]);
  const count = (t: string) => learned.find((l) => l._id === t)?.n ?? 0;

  const plan = buildPlan(
    { level, examDate, minutesPerDay: user.studyMinutesPerDay ?? 30 },
    {
      vocabLearned: count('vocabulary'),
      kanjiLearned: count('kanji'),
      grammarLearned: count('grammar'),
      reviewsDue,
      mockScores: attempts
        .filter((a) => a.totalQuestions > 0)
        .map((a) => Math.round((a.totalScore / a.totalQuestions) * 100)),
    }
  );

  return NextResponse.json({
    settings: {
      level,
      examSession: user.examSession ?? null,
      examDate,
      minutesPerDay: user.studyMinutesPerDay ?? 30,
    },
    learned: { vocab: count('vocabulary'), kanji: count('kanji'), grammar: count('grammar') },
    mockCount: attempts.length,
    plan,
  });
}

const patchSchema = z.object({
  level: z.enum(['N5', 'N4', 'N3']).optional(),
  examSession: z
    .string()
    .regex(/^\d{4}-(07|12)$/)
    .nullable()
    .optional(),
  minutesPerDay: z.number().int().min(5).max(600).optional(),
});

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session) return jsonError('Not signed in', 401);
  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError('Invalid settings', 400);
  const { level, examSession, minutesPerDay } = parsed.data;

  await connectDB();
  await User.updateOne(
    { _id: session.sub },
    {
      $set: {
        ...(level ? { targetLevel: level } : {}),
        ...(examSession !== undefined ? { examSession } : {}),
        ...(minutesPerDay ? { studyMinutesPerDay: minutesPerDay } : {}),
      },
    }
  );
  return NextResponse.json({ ok: true });
}
