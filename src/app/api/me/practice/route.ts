import { NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { z } from 'zod';
import { jsonError } from '@/lib/auth';
import { getActor } from '@/lib/roles';
import { touchStreak, yangonDay } from '@/lib/streak';
import { DailyActivity } from '@/models/Group';

export const runtime = 'nodejs';

/** Most practice points one learner can earn per day from these tools (stops farming). */
const PRACTICE_DAILY_CAP = 60;

const schema = z.object({
  lang: z.enum(['ko', 'zh', 'en']),
  points: z.number().int().min(1).max(10),
});

/**
 * Korean / Chinese / English practice tools report correct answers here, so those learners
 * keep their streak, group points and learn-to-earn rewards just like Japanese learners.
 */
export async function POST(req: Request) {
  const actor = await getActor();
  if (!actor) return jsonError('Not signed in', 401);
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError('Invalid request', 400);

  const user = new Types.ObjectId(actor.id);
  const day = yangonDay();
  const doc = await DailyActivity.findOneAndUpdate(
    { user, day },
    { $setOnInsert: { createdAt: new Date() } },
    { upsert: true, new: true }
  );
  const room = Math.max(0, PRACTICE_DAILY_CAP - (doc?.practice ?? 0));
  const add = Math.min(parsed.data.points, room);
  if (add > 0) {
    await DailyActivity.updateOne({ user, day }, { $inc: { practice: add } });
    await touchStreak(actor.id, add);
  }
  return NextResponse.json({ added: add, capped: add < parsed.data.points });
}
