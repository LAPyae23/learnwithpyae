import { Schema, model, models, type InferSchemaType, type Model } from 'mongoose';

import { ALL_LEVELS, LANG_CODES } from '@/data/languages';

/** @deprecated Japanese only — use ALL_LEVELS / levelsOf(language) */
export const LESSON_LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'] as const;
export const LESSON_STATUSES = ['draft', 'pending', 'published', 'rejected'] as const;
export type LessonStatus = (typeof LESSON_STATUSES)[number];

/**
 * A video lesson written by an admin or an approved teacher.
 * Teachers' lessons go draft → pending (submitted) → published / rejected by an admin.
 */
const lessonSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true, trim: true, maxlength: 140 },
    // Language being taught, and its level (JLPT / HSK / TOPIK / CEFR)
    language: { type: String, enum: LANG_CODES, default: 'ja', index: true },
    level: { type: String, enum: ALL_LEVELS, required: true, index: true },
    chapter: { type: String, default: '', trim: true, maxlength: 80 },
    summary: { type: String, default: '', trim: true, maxlength: 400 },
    videoUrl: { type: String, default: '', trim: true, maxlength: 500 },
    content: { type: String, default: '', maxlength: 20000 },
    durationMin: { type: Number, default: 0, min: 0, max: 600 },
    order: { type: Number, default: 0 },
    status: { type: String, enum: LESSON_STATUSES, default: 'draft', index: true },
    // Chosen by the teacher: free for everyone, or premium members only
    access: { type: String, enum: ['free', 'premium'], default: 'free' },
    // Engagement counters (recomputed from LessonVote / LessonComment / LessonView)
    stats: {
      views: { type: Number, default: 0 },
      comments: { type: Number, default: 0 },
      ratingCount: { type: Number, default: 0 },
      ratingAvg: { type: Number, default: 0 },
      reactions: {
        love: { type: Number, default: 0 },
        clap: { type: Number, default: 0 },
        fire: { type: Number, default: 0 },
        wow: { type: Number, default: 0 },
        thanks: { type: Number, default: 0 },
      },
    },
    reviewNote: { type: String, default: '', maxlength: 300 },
    author: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    publishedAt: { type: Date, default: null },
  },
  { timestamps: true }
);
lessonSchema.index({ status: 1, level: 1, order: 1 });

export const Lesson: Model<InferSchemaType<typeof lessonSchema>> =
  models.Lesson || model('Lesson', lessonSchema);
