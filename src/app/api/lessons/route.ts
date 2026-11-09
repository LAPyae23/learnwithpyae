import { NextResponse } from 'next/server';
import { jsonError } from '@/lib/auth';
import { canTeach, getActor } from '@/lib/roles';
import { LessonInput, newLessonSlug, serializeLesson } from '@/lib/lessons';
import { Lesson, LESSON_STATUSES, type LessonStatus } from '@/models/Lesson';
import '@/models/User';

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
  }

  const lessons = await Lesson.find(filter)
    .select(LIST_FIELDS)
    .sort(scope === 'published' ? { level: -1, order: 1, publishedAt: 1 } : { updatedAt: -1 })
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

  const status: LessonStatus =
    actor.role === 'admin' ? (wanted ?? 'draft') : submit ? 'pending' : 'draft';

  const lesson = await Lesson.create({
    ...fields,
    slug: newLessonSlug(fields.level),
    status,
    reviewNote: actor.role === 'admin' ? (reviewNote ?? '') : '',
    author: actor.id,
    publishedAt: status === 'published' ? new Date() : null,
  });
  return NextResponse.json({ lesson: serializeLesson(lesson.toObject(), true) }, { status: 201 });
}
