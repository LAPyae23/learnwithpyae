import 'server-only';
import { Types } from 'mongoose';
import { Lesson } from '@/models/Lesson';
import { LessonComment, LessonVote, REACTIONS } from '@/models/Social';
import { canTeach, getActor, type Actor } from './roles';

/** Recomputes a lesson's reaction / rating / comment counters from the source rows. */
export async function refreshLessonStats(lessonId: Types.ObjectId | string) {
  const id = new Types.ObjectId(String(lessonId));
  const [reactions, rating, comments] = await Promise.all([
    LessonVote.aggregate<{ _id: string; n: number }>([
      { $match: { lesson: id, reaction: { $ne: null } } },
      { $group: { _id: '$reaction', n: { $sum: 1 } } },
    ]),
    LessonVote.aggregate<{ n: number; avg: number }>([
      { $match: { lesson: id, stars: { $ne: null } } },
      { $group: { _id: null, n: { $sum: 1 }, avg: { $avg: '$stars' } } },
    ]),
    LessonComment.countDocuments({ lesson: id }),
  ]);
  const counts = Object.fromEntries(REACTIONS.map((r) => [r, 0]));
  for (const r of reactions) counts[r._id] = r.n;
  const stats = {
    'stats.reactions': counts,
    'stats.ratingCount': rating[0]?.n ?? 0,
    'stats.ratingAvg': Math.round((rating[0]?.avg ?? 0) * 10) / 10,
    'stats.comments': comments,
  };
  await Lesson.updateOne({ _id: id }, { $set: stats });
  return {
    reactions: counts,
    ratingCount: stats['stats.ratingCount'],
    ratingAvg: stats['stats.ratingAvg'],
    comments,
  };
}

/** The signed-in user and a lesson they may interact with (published, or their own / admin). */
export async function actorAndLesson(
  slug: string
): Promise<
  | { error: string; status: number }
  | { actor: Actor; lesson: { _id: Types.ObjectId; author: unknown; status: string } }
> {
  const actor = await getActor();
  if (!actor) return { error: 'Not signed in', status: 401 };
  const lesson = await Lesson.findOne({ slug }).select('_id author status').lean();
  if (!lesson) return { error: 'သင်ခန်းစာ မတွေ့ပါ', status: 404 };
  const isAuthor = String(lesson.author) === actor.id;
  if (lesson.status !== 'published' && actor.role !== 'admin' && !isAuthor) {
    return { error: 'သင်ခန်းစာ မတွေ့ပါ', status: 404 };
  }
  return { actor, lesson: lesson as never };
}

export { canTeach };
