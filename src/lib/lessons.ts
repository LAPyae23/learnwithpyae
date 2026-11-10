import 'server-only';
import crypto from 'node:crypto';
import { z } from 'zod';
import { LESSON_STATUSES } from '@/models/Lesson';
import { ALL_LEVELS, LANG_CODES } from '@/data/languages';
import { isPlayableUrl } from './youtube';

export const LessonInput = z.object({
  title: z.string().trim().min(2, 'ခေါင်းစဉ် ထည့်ပါ').max(140),
  language: z.enum(LANG_CODES).optional(),
  level: z.enum(ALL_LEVELS as [string, ...string[]]),
  chapter: z.string().trim().max(80).optional(),
  summary: z.string().trim().max(400).optional(),
  videoUrl: z
    .string()
    .trim()
    .max(500)
    .refine(isPlayableUrl, 'YouTube link ဒါမှမဟုတ် .mp4 link ပဲ ထည့်လို့ရပါတယ်')
    .optional(),
  content: z.string().max(20000).optional(),
  durationMin: z.number().int().min(0).max(600).optional(),
  order: z.number().int().min(-10000).max(10000).optional(),
  access: z.enum(['free', 'premium']).optional(),
  // Teacher: submit for review. Admin: choose the status directly.
  submit: z.boolean().optional(),
  status: z.enum(LESSON_STATUSES).optional(),
  reviewNote: z.string().trim().max(300).optional(),
});
export type LessonInputData = z.infer<typeof LessonInput>;

export const newLessonSlug = (level: string) =>
  `${level.toLowerCase()}-${crypto.randomBytes(4).toString('hex')}`;

interface LessonLike {
  _id: unknown;
  slug: string;
  title: string;
  level: string;
  language?: string | null;
  chapter?: string | null;
  summary?: string | null;
  videoUrl?: string | null;
  content?: string | null;
  durationMin?: number | null;
  order?: number | null;
  status: string;
  access?: string | null;
  stats?: {
    views?: number | null;
    comments?: number | null;
    ratingCount?: number | null;
    ratingAvg?: number | null;
    reactions?: Record<string, number | null> | null;
  } | null;
  reviewNote?: string | null;
  author?: { _id: unknown; name?: string } | unknown;
  updatedAt?: Date;
  publishedAt?: Date | null;
}

export function serializeLesson(l: LessonLike, withContent = false) {
  const author =
    l.author && typeof l.author === 'object' && 'name' in (l.author as object)
      ? (l.author as { _id: unknown; name?: string })
      : null;
  return {
    id: String(l._id),
    slug: l.slug,
    title: l.title,
    level: l.level,
    language: l.language ?? 'ja',
    chapter: l.chapter ?? '',
    summary: l.summary ?? '',
    videoUrl: l.videoUrl ?? '',
    hasVideo: !!l.videoUrl,
    durationMin: l.durationMin ?? 0,
    order: l.order ?? 0,
    status: l.status,
    access: (l.access === 'premium' ? 'premium' : 'free') as 'free' | 'premium',
    stats: {
      views: l.stats?.views ?? 0,
      comments: l.stats?.comments ?? 0,
      ratingCount: l.stats?.ratingCount ?? 0,
      ratingAvg: l.stats?.ratingAvg ?? 0,
      reactions: {
        love: l.stats?.reactions?.love ?? 0,
        clap: l.stats?.reactions?.clap ?? 0,
        fire: l.stats?.reactions?.fire ?? 0,
        wow: l.stats?.reactions?.wow ?? 0,
        thanks: l.stats?.reactions?.thanks ?? 0,
      },
    },
    reviewNote: l.reviewNote ?? '',
    author: author ? { id: String(author._id), name: author.name ?? '' } : null,
    updatedAt: l.updatedAt ?? null,
    ...(withContent ? { content: l.content ?? '' } : {}),
  };
}
export type LessonDTO = ReturnType<typeof serializeLesson> & { content?: string };

/** True if the user can watch premium lessons. */
export function hasPremium(user: {
  role?: string | null;
  plan?: { type?: string | null; expiresAt?: Date | null } | null;
}) {
  if (user.role === 'admin' || user.role === 'teacher') return true;
  return (
    !!user.plan?.type &&
    user.plan.type !== 'free' &&
    !!user.plan.expiresAt &&
    new Date(user.plan.expiresAt) > new Date()
  );
}
