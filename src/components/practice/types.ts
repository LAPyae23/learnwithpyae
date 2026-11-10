/** Shared shapes for the per-language practice tools. */

export interface DrillTip {
  title: string;
  tip: string; // Burmese
}

/** One speaking-drill sentence. `tip` is a key into the language's tips record. */
export interface DrillItem {
  id: string;
  text: string;
  roman?: string; // romanization / pinyin
  meaning: string; // Burmese
  tip: string;
}

/** One vocabulary card. */
export interface WordItem {
  id: string;
  front: string;
  reading: string;
  meaning: string; // Burmese
}

/** Practice languages other than Japanese (which has its own tools). */
export type PracticeLang = 'ko' | 'zh' | 'en';

export const SPEECH_LANG: Record<PracticeLang, string> = {
  ko: 'ko-KR',
  zh: 'zh-CN',
  en: 'en-US',
};
