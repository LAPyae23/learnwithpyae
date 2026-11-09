/** Client-safe lesson constants (the Mongoose model imports nothing from here on purpose). */
export const LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'] as const;
export type Level = (typeof LEVELS)[number];

export type LessonStatus = 'draft' | 'pending' | 'published' | 'rejected';

export const STATUS_LABEL: Record<LessonStatus, { text: string; cls: string }> = {
  draft: { text: 'မူကြမ်း', cls: 'bg-muted text-muted-foreground' },
  pending: { text: 'စစ်ဆေးဆဲ', cls: 'bg-warning-bg text-warning' },
  published: { text: 'ထုတ်ဝေပြီး', cls: 'bg-success-bg text-success' },
  rejected: { text: 'ပြန်ပြင်ရန်', cls: 'bg-danger-bg text-danger' },
};

export interface LessonItem {
  id: string;
  slug: string;
  title: string;
  level: Level;
  chapter: string;
  summary: string;
  videoUrl: string;
  hasVideo: boolean;
  durationMin: number;
  order: number;
  status: LessonStatus;
  reviewNote: string;
  author: { id: string; name: string } | null;
  updatedAt: string | null;
  content?: string;
}

/** Slug of the built-in て-form lesson that also shows the original interactive tabs. */
export const LEGACY_TE_FORM_SLUG = 'n5-te-form';
