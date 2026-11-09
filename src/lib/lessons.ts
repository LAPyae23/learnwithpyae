import 'server-only';
import crypto from 'node:crypto';
import { z } from 'zod';
import { LESSON_LEVELS, LESSON_STATUSES } from '@/models/Lesson';
import { isPlayableUrl } from './youtube';

export const LessonInput = z.object({
  title: z.string().trim().min(2, 'ခေါင်းစဉ် ထည့်ပါ').max(140),
  level: z.enum(LESSON_LEVELS),
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
  chapter?: string | null;
  summary?: string | null;
  videoUrl?: string | null;
  content?: string | null;
  durationMin?: number | null;
  order?: number | null;
  status: string;
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
    chapter: l.chapter ?? '',
    summary: l.summary ?? '',
    videoUrl: l.videoUrl ?? '',
    hasVideo: !!l.videoUrl,
    durationMin: l.durationMin ?? 0,
    order: l.order ?? 0,
    status: l.status,
    reviewNote: l.reviewNote ?? '',
    author: author ? { id: String(author._id), name: author.name ?? '' } : null,
    updatedAt: l.updatedAt ?? null,
    ...(withContent ? { content: l.content ?? '' } : {}),
  };
}
export type LessonDTO = ReturnType<typeof serializeLesson> & { content?: string };
