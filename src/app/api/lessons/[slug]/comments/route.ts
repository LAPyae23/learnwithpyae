import { NextResponse } from 'next/server';
import { isValidObjectId } from 'mongoose';
import { z } from 'zod';
import { jsonError } from '@/lib/auth';
import { actorAndLesson, refreshLessonStats } from '@/lib/social';
import { LessonComment } from '@/models/Social';
import '@/models/User';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ slug: string }> };

interface Row {
  _id: unknown;
  text: string;
  parent: unknown;
  createdAt: Date;
  user: { _id: unknown; name: string; role?: string } | null;
}

const view = (c: Row, authorId: string, meId: string) => ({
  id: String(c._id),
  text: c.text,
  parent: c.parent ? String(c.parent) : null,
  createdAt: c.createdAt,
  user: c.user
    ? {
        id: String(c.user._id),
        name: c.user.name,
        isTeacher: String(c.user._id) === authorId,
        isAdmin: c.user.role === 'admin',
      }
    : null,
  mine: !!c.user && String(c.user._id) === meId,
});

/** Comments on a lesson, newest first (replies included; the UI nests them). */
export async function GET(_req: Request, { params }: Ctx) {
  const { slug } = await params;
  const ctx = await actorAndLesson(slug);
  if ('error' in ctx) return jsonError(ctx.error, ctx.status);
  const rows = await LessonComment.find({ lesson: ctx.lesson._id })
    .sort({ createdAt: -1 })
    .limit(300)
    .populate('user', 'name role')
    .lean<Row[]>();
  return NextResponse.json({
    comments: rows.map((c) => view(c, String(ctx.lesson.author), ctx.actor.id)),
    canModerate: ctx.actor.role === 'admin' || String(ctx.lesson.author) === ctx.actor.id,
  });
}

const Input = z.object({
  text: z.string().trim().min(1, 'စာ ရေးပါ').max(1000),
  parent: z.string().optional(),
});

// Simple flood protection: at most 10 comments per user per minute
const recent = new Map<string, number[]>();

export async function POST(req: Request, { params }: Ctx) {
  const { slug } = await params;
  const ctx = await actorAndLesson(slug);
  if ('error' in ctx) return jsonError(ctx.error, ctx.status);

  const parsed = Input.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? 'Data မမှန်ပါ', 400);

  const now = Date.now();
  const times = (recent.get(ctx.actor.id) ?? []).filter((t) => now - t < 60_000);
  if (times.length >= 10) return jsonError('ခဏနားပြီးမှ ပြန်ရေးပါ', 429);
  recent.set(ctx.actor.id, [...times, now]);

  let parent = null;
  if (parsed.data.parent) {
    if (!isValidObjectId(parsed.data.parent)) return jsonError('Data မမှန်ပါ', 400);
    const p = await LessonComment.findOne({ _id: parsed.data.parent, lesson: ctx.lesson._id })
      .select('parent')
      .lean();
    if (!p) return jsonError('Comment မတွေ့ပါ', 404);
    parent = p.parent ?? p._id; // keep replies one level deep
  }

  const c = await LessonComment.create({
    lesson: ctx.lesson._id,
    user: ctx.actor.id,
    text: parsed.data.text,
    parent,
  });
  await c.populate('user', 'name role');
  const stats = await refreshLessonStats(ctx.lesson._id);
  return NextResponse.json(
    {
      comment: view(c.toObject() as never, String(ctx.lesson.author), ctx.actor.id),
      comments: stats.comments,
    },
    { status: 201 }
  );
}

/** Delete: your own comment, or any comment if you're the lesson's teacher or an admin. */
export async function DELETE(req: Request, { params }: Ctx) {
  const { slug } = await params;
  const ctx = await actorAndLesson(slug);
  if ('error' in ctx) return jsonError(ctx.error, ctx.status);
  const id = new URL(req.url).searchParams.get('id');
  if (!id || !isValidObjectId(id)) return jsonError('Data မမှန်ပါ', 400);

  const c = await LessonComment.findOne({ _id: id, lesson: ctx.lesson._id }).select('user').lean();
  if (!c) return jsonError('Comment မတွေ့ပါ', 404);
  const moderator = ctx.actor.role === 'admin' || String(ctx.lesson.author) === ctx.actor.id;
  if (String(c.user) !== ctx.actor.id && !moderator) return jsonError('Forbidden', 403);

  await LessonComment.deleteMany({ $or: [{ _id: id }, { parent: id }] });
  const stats = await refreshLessonStats(ctx.lesson._id);
  return NextResponse.json({ ok: true, comments: stats.comments });
}
