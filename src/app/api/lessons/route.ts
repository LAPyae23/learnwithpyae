import { NextResponse } from 'next/server';
import { jsonError } from '@/lib/auth';
import { canTeach, getActor } from '@/lib/roles';
import { LessonInput, newLessonSlug, serializeLesson } from '@/lib/lessons';
import { Lesson, LESSON_STATUSES, type LessonStatus } from '@/models/Lesson';
import '@/models/User';
import { isValidObjectId } from 'mongoose';
import { Follow } from '@/models/Social';
import { isLang, isLevelOf } from '@/data/languages';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const LIST_FIELDS = '-content';

/**
 * GET /api/lessons                 published lessons (any signed-in user)
 * GET /api/lessons?scope=mine      lessons I wrote (teachers, admins)
 * GET /api/lessons?scope=all       every lesson, optional &status= (admins)
 */
export async function GET(req: Request) {
  const actor = await getActor();
  if (!actor) return jsonError('Not signed in', 401);
  const params = new URL(req.url).searchParams;
  const scope = params.get('scope') ?? 'published';

  let filter: Record<string, unknown>;
  if (scope === 'mine') {
    if (!canTeach(actor.role)) return jsonError('Forbidden', 403);
    filter = { author: actor.id };
  } else if (scope === 'all') {
    if (actor.role !== 'admin') return jsonError('Forbidden', 403);
    const status = params.get('status') as LessonStatus | null;
    filter = status && LESSON_STATUSES.includes(status) ? { status } : {};
  } else {
    filter = { status: 'published' };
    // Feed of teachers I follow
    if (params.get('following') === '1') {
      const follows = await Follow.find({ follower: actor.id }).select('teacher').lean();
      filter.author = { $in: follows.map((f) => f.teacher) };
    }
    const lang = params.get('lang');
    if (lang && isLang(lang)) filter.language = lang;
    const teacher = params.get('teacher');
    if (teacher && isValidObjectId(teacher)) filter.author = teacher;
  }
  const popular = params.get('sort') === 'popular';
  const latest = params.get('sort') === 'new';

  const lessons = await Lesson.find(filter)
    .select(LIST_FIELDS)
    .sort(
      scope !== 'published'
        ? { updatedAt: -1 }
        : popular
          ? { 'stats.views': -1, 'stats.ratingAvg': -1 }
          : latest
            ? { publishedAt: -1 }
            : { level: -1, order: 1, publishedAt: 1 }
    )
    .limit(500)
    .populate('author', 'name')
    .lean();
  return NextResponse.json({ lessons: lessons.map((l) => serializeLesson(l as never)) });
}

/** Create a lesson (teachers and admins). */
export async function POST(req: Request) {
  const actor = await getActor();
  if (!actor) return jsonError('Not signed in', 401);
  if (!canTeach(actor.role)) return jsonError('ဆရာ အကောင့်နဲ့ပဲ သင်ခန်းစာ ဖန်တီးလို့ရပါတယ်', 403);

  const parsed = LessonInput.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? 'Data မမှန်ပါ', 400);
  const { submit, status: wanted, reviewNote, ...fields } = parsed.data;
  const language = fields.language ?? 'ja';
  if (!isLevelOf(language, fields.level)) return jsonError('ဒီဘာသာစကားအတွက် အဆင့် မမှန်ပါ', 400);

  const status: LessonStatus =
    actor.role === 'admin' ? (wanted ?? 'draft') : submit ? 'pending' : 'draft';

  const lesson = await Lesson.create({
    ...fields,
    language,
    slug: newLessonSlug(fields.level),
    status,
    reviewNote: actor.role === 'admin' ? (reviewNote ?? '') : '',
    author: actor.id,
    publishedAt: status === 'published' ? new Date() : null,
  });
  return NextResponse.json({ lesson: serializeLesson(lesson.toObject(), true) }, { status: 201 });
}
