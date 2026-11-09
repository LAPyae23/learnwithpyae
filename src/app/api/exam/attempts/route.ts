import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { getSession, jsonError } from '@/lib/auth';
import { touchStreak } from '@/lib/streak';
import { ExamAttempt } from '@/models/ExamAttempt';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const section = z.enum(['grammar', 'reading', 'listening']);
const schema = z.object({
  level: z.enum(['N5', 'N4', 'N3', 'N2', 'N1']),
  sections: z.array(section).min(1).max(3),
  sectionResults: z
    .array(
      z.object({
        section,
        score: z.number().int().min(0),
        total: z.number().int().min(0),
        timeTaken: z.number().min(0),
      })
    )
    .max(3),
  answers: z
    .array(
      z.object({
        questionId: z.string().max(64),
        selectedIndex: z.number().int().min(0).max(10).nullable(),
        isCorrect: z.boolean(),
      })
    )
    .max(200),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return jsonError('Not signed in', 401);

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError('Invalid attempt', 400);
  const data = parsed.data;

  await connectDB();
  const attempt = await ExamAttempt.create({
    ...data,
    user: session.sub,
    totalScore: data.sectionResults.reduce((s, r) => s + r.score, 0),
    totalQuestions: data.sectionResults.reduce((s, r) => s + r.total, 0),
  });
  await touchStreak(session.sub, 10);

  return NextResponse.json({ id: String(attempt._id) }, { status: 201 });
}

export async function GET() {
  const session = await getSession();
  if (!session) return jsonError('Not signed in', 401);
  await connectDB();
  const attempts = await ExamAttempt.find({ user: session.sub })
    .sort({ createdAt: -1 })
    .limit(10)
    .select('level totalScore totalQuestions sectionResults createdAt')
    .lean();
  return NextResponse.json({
    attempts: attempts.map((a) => ({ ...a, _id: undefined, id: String(a._id) })),
  });
}
