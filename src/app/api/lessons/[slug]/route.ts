import { NextResponse } from 'next/server';
import { jsonError } from '@/lib/auth';
import { canTeach, getActor } from '@/lib/roles';
import { hasPremium, LessonInput, serializeLesson } from '@/lib/lessons';
import { Follow, LessonView, LessonVote } from '@/models/Social';
import { Lesson, type LessonStatus } from '@/models/Lesson';
import { isLevelOf } from '@/data/languages';
import '@/models/User';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ slug: string }> };

const isAuthor = (lesson: { author?: unknown }, id: string) =>
  !!lesson.author && String((lesson.author as { _id?: unknown })._id ?? lesson.author) === id;

/**
 * One lesson with its content. Unpublished lessons: only the author and admins.
 * Premium lessons: video and text are hidden from learners without an active plan.
 */
export async function GET(_req: Request, { params }: Ctx) {
  const actor = await getActor();
  if (!actor) return jsonError('Not signed in', 401);
  const { slug } = await params;
  const lesson = await Lesson.findOne({ slug }).populate('author', 'name').lean();
  if (!lesson) return jsonError('သင်ခန်းစာ မတွေ့ပါ', 404);
  const mine = isAuthor(lesson, actor.id);
  if (lesson.status !== 'published' && actor.role !== 'admin' && !mine) {
    return jsonError('သင်ခန်းစာ မတွေ့ပါ', 404);
  }

  const locked = lesson.access === 'premium' && !mine && !hasPremium(actor);
  const data = serializeLesson(lesson as never, true);
  if (locked) {
    data.videoUrl = '';
    (data as { content?: string }).content = '';
  }

  // Count unique viewers of published lessons (not the author)
  if (lesson.status === 'published' && !mine) {
    const res = await LessonView.updateOne(
      { lesson: lesson._id, user: actor.id },
      { $setOnInsert: { at: new Date() } },
      { upsert: true }
    );
    if (res.upsertedCount) {
      await Lesson.updateOne({ _id: lesson._id }, { $inc: { 'stats.views': 1 } });
      data.stats.views += 1;
    }
  }

  const [vote, followingAuthor] = await Promise.all([
    LessonVote.findOne({ lesson: lesson._id, user: actor.id }).select('reaction stars').lean(),
    lesson.author && !mine
      ? Follow.exists({
          follower: actor.id,
          teacher: String((lesson.author as { _id: unknown })._id),
        })
      : null,
  ]);
  return NextResponse.json({
    lesson: { ...data, locked },
    me: {
      reaction: vote?.reaction ?? null,
      stars: vote?.stars ?? null,
      isAuthor: mine,
      followingAuthor: !!followingAuthor,
    },
  });
}

/** Edit. Teachers edit their own lessons (any change sends it back for review); admins edit any. */
export async function PATCH(req: Request, { params }: Ctx) {
  const actor = await getActor();
  if (!actor) return jsonError('Not signed in', 401);
  const { slug } = await params;
  const lesson = await Lesson.findOne({ slug });
  if (!lesson) return jsonError('သင်ခန်းစာ မတွေ့ပါ', 404);

  const isAdmin = actor.role === 'admin';
  if (!isAdmin && !(canTeach(actor.role) && isAuthor(lesson, actor.id))) {
    return jsonError('Forbidden', 403);
  }

  const parsed = LessonInput.partial().safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? 'Data မမှန်ပါ', 400);
  const { submit, status: wanted, reviewNote, ...fields } = parsed.data;

  const nextLang = fields.language ?? lesson.language ?? 'ja';
  const nextLevel = fields.level ?? lesson.level;
  if (!isLevelOf(nextLang, nextLevel)) return jsonError('ဒီဘာသာစကားအတွက် အဆင့် မမှန်ပါ', 400);

  // Drop undefined so partial updates don't clear fields
  for (const [k, v] of Object.entries(fields)) {
    if (v !== undefined) lesson.set(k, v);
  }

  let status: LessonStatus = lesson.status as LessonStatus;
  if (isAdmin) {
    if (wanted) status = wanted;
    if (reviewNote !== undefined) lesson.reviewNote = reviewNote;
  } else {
    status = submit ? 'pending' : 'draft';
    lesson.reviewNote = '';
  }
  if (status === 'published' && lesson.status !== 'published') lesson.publishedAt = new Date();
  lesson.status = status;

  await lesson.save();
  await lesson.populate('author', 'name');
  return NextResponse.json({ lesson: serializeLesson(lesson.toObject() as never, true) });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const actor = await getActor();
  if (!actor) return jsonError('Not signed in', 401);
  const { slug } = await params;
  const lesson = await Lesson.findOne({ slug }).select('author').lean();
  if (!lesson) return jsonError('သင်ခန်းစာ မတွေ့ပါ', 404);
  if (actor.role !== 'admin' && !(canTeach(actor.role) && isAuthor(lesson, actor.id))) {
    return jsonError('Forbidden', 403);
  }
  await Lesson.deleteOne({ slug });
  return NextResponse.json({ ok: true });
}
