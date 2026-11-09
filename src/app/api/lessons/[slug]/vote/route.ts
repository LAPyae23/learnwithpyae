import { NextResponse } from 'next/server';
import { z } from 'zod';
import { jsonError } from '@/lib/auth';
import { actorAndLesson, refreshLessonStats } from '@/lib/social';
import { LessonVote, REACTIONS } from '@/models/Social';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Send either or both. null clears it.
const Input = z
  .object({
    reaction: z.enum(REACTIONS).nullable().optional(),
    stars: z.number().int().min(1).max(5).nullable().optional(),
  })
  .refine((v) => v.reaction !== undefined || v.stars !== undefined, 'Nothing to save');

/** React to and/or rate a lesson. Free and premium lessons alike. */
export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const ctx = await actorAndLesson(slug);
  if ('error' in ctx) return jsonError(ctx.error, ctx.status);
  if (String(ctx.lesson.author) === ctx.actor.id) {
    return jsonError('ကိုယ့်သင်ခန်းစာကို ကိုယ်တိုင် အမှတ်ပေးလို့ မရပါ', 400);
  }

  const parsed = Input.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError('Data မမှန်ပါ', 400);

  const set: Record<string, unknown> = {};
  if (parsed.data.reaction !== undefined) set.reaction = parsed.data.reaction;
  if (parsed.data.stars !== undefined) set.stars = parsed.data.stars;

  const vote = await LessonVote.findOneAndUpdate(
    { lesson: ctx.lesson._id, user: ctx.actor.id },
    { $set: set },
    { upsert: true, returnDocument: 'after' }
  ).lean();
  const stats = await refreshLessonStats(ctx.lesson._id);
  return NextResponse.json({
    me: { reaction: vote?.reaction ?? null, stars: vote?.stars ?? null },
    stats,
  });
}
