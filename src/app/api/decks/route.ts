import { NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { connectDB } from '@/lib/db';
import { getSession, jsonError } from '@/lib/auth';
import { Card, CardReview, Deck } from '@/models/Flashcard';
import { NEW_CARDS_PER_SESSION } from '@/lib/flashcardConfig';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSession();
  if (!session) return jsonError('Not signed in', 401);
  await connectDB();

  const userId = new Types.ObjectId(session.sub);
  const now = new Date();

  const [decks, cardCounts, reviewCounts] = await Promise.all([
    Deck.find().sort({ order: 1 }).lean(),
    Card.aggregate<{ _id: Types.ObjectId; total: number }>([
      { $group: { _id: '$deck', total: { $sum: 1 } } },
    ]),
    CardReview.aggregate<{ _id: Types.ObjectId; seen: number; due: number; mastered: number }>([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$deck',
          seen: { $sum: 1 },
          due: { $sum: { $cond: [{ $lte: ['$dueAt', now] }, 1, 0] } },
          mastered: { $sum: { $cond: [{ $gte: ['$intervalDays', 21] }, 1, 0] } },
        },
      },
    ]),
  ]);

  const totals = new Map(cardCounts.map((c) => [String(c._id), c.total]));
  const reviews = new Map(reviewCounts.map((r) => [String(r._id), r]));

  return NextResponse.json({
    decks: decks.map((d) => {
      const total = totals.get(String(d._id)) ?? 0;
      const r = reviews.get(String(d._id));
      const seen = r?.seen ?? 0;
      const newCount = Math.max(total - seen, 0);
      return {
        id: d.slug,
        label: d.label,
        level: d.level,
        type: d.type,
        count: total,
        dueReview: r?.due ?? 0,
        newCount,
        // What the learner sees as "to review today"
        due: (r?.due ?? 0) + Math.min(newCount, NEW_CARDS_PER_SESSION),
        mastered: r?.mastered ?? 0,
      };
    }),
  });
}
