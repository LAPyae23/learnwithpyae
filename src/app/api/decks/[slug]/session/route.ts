import { NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { connectDB } from '@/lib/db';
import { getSession, jsonError } from '@/lib/auth';
import { Card, CardReview, Deck } from '@/models/Flashcard';
import { NEW_CARDS_PER_SESSION } from '@/lib/flashcardConfig';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_REVIEWS_PER_SESSION = 30;
const PRACTICE_SIZE = 10;

/**
 * Cards for one study session: due reviews first (most overdue first), then new cards.
 * If nothing is due, returns a practice set of the cards reviewed longest ago.
 */
export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const session = await getSession();
  if (!session) return jsonError('Not signed in', 401);
  const { slug } = await ctx.params;

  await connectDB();
  const deck = await Deck.findOne({ slug }).lean();
  if (!deck) return jsonError('Deck not found', 404);

  const userId = new Types.ObjectId(session.sub);
  const now = new Date();

  const dueReviews = await CardReview.find({ user: userId, deck: deck._id, dueAt: { $lte: now } })
    .sort({ dueAt: 1 })
    .limit(MAX_REVIEWS_PER_SESSION)
    .select('card')
    .lean();

  const seenIds = await CardReview.find({ user: userId, deck: deck._id }).distinct('card');
  const newCards = await Card.find({ deck: deck._id, _id: { $nin: seenIds } })
    .sort({ order: 1 })
    .limit(NEW_CARDS_PER_SESSION)
    .lean();

  let mode: 'review' | 'practice' = 'review';
  let dueCards = await Card.find({ _id: { $in: dueReviews.map((r) => r.card) } }).lean();
  // keep the overdue-first order from the review query
  const rank = new Map(dueReviews.map((r, i) => [String(r.card), i]));
  dueCards.sort((a, b) => (rank.get(String(a._id)) ?? 0) - (rank.get(String(b._id)) ?? 0));

  if (dueCards.length === 0 && newCards.length === 0) {
    mode = 'practice';
    const oldest = await CardReview.find({ user: userId, deck: deck._id })
      .sort({ lastReviewedAt: 1 })
      .limit(PRACTICE_SIZE)
      .select('card')
      .lean();
    dueCards = await Card.find({ _id: { $in: oldest.map((r) => r.card) } }).lean();
  }

  const toDto = (c: (typeof newCards)[number], isNew: boolean) => ({
    id: String(c._id),
    front: c.front,
    reading: c.reading,
    back: c.back,
    example: c.example,
    exampleMy: c.exampleMy,
    level: c.level,
    type: c.type,
    isNew,
  });

  return NextResponse.json({
    mode,
    deck: { id: deck.slug, label: deck.label, level: deck.level, type: deck.type },
    cards: [...dueCards.map((c) => toDto(c, false)), ...newCards.map((c) => toDto(c, true))],
  });
}
