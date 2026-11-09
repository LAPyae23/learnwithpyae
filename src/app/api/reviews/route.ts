import { NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { getSession, jsonError } from '@/lib/auth';
import { schedule, initialSrsState } from '@/lib/srs';
import { touchStreak } from '@/lib/streak';
import { Card, CardReview } from '@/models/Flashcard';

export const runtime = 'nodejs';

const schema = z.object({
  cardId: z.string().refine((v) => Types.ObjectId.isValid(v)),
  difficulty: z.enum(['again', 'hard', 'good', 'easy']),
  // Set by the offline queue: when the card was actually answered
  reviewedAt: z.string().datetime().optional(),
});

/** Records one flashcard answer and reschedules the card with SM-2. */
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return jsonError('Not signed in', 401);

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError('Invalid review', 400);
  const { cardId, difficulty, reviewedAt } = parsed.data;

  await connectDB();
  const card = await Card.findById(cardId).select('deck').lean();
  if (!card) return jsonError('Card not found', 404);

  const userId = new Types.ObjectId(session.sub);
  const existing = await CardReview.findOne({ user: userId, card: card._id }).lean();
  const prev = existing
    ? {
        easeFactor: existing.easeFactor,
        intervalDays: existing.intervalDays,
        repetitions: existing.repetitions,
        lapses: existing.lapses,
      }
    : initialSrsState;

  // Trust client timestamps only within the last 14 days and never in the future
  const serverNow = Date.now();
  const clientTime = reviewedAt ? Date.parse(reviewedAt) : NaN;
  const now = new Date(
    Number.isFinite(clientTime) &&
      clientTime <= serverNow &&
      clientTime > serverNow - 14 * 86_400_000
      ? clientTime
      : serverNow
  );
  const { state, dueAt } = schedule(prev, difficulty, now);

  await CardReview.updateOne(
    { user: userId, card: card._id },
    {
      $set: { ...state, deck: card.deck, dueAt, lastReviewedAt: now },
      $inc: { reviewCount: 1 },
    },
    { upsert: true }
  );
  await touchStreak(session.sub);

  return NextResponse.json({ dueAt, intervalDays: state.intervalDays });
}
