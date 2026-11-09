/**
 * SM-2 spaced repetition (the algorithm Anki is based on), adapted to four buttons.
 *
 *   again → quality 1 (forgot: reset, show again soon)
 *   hard  → quality 3
 *   good  → quality 4
 *   easy  → quality 5
 */
export type Difficulty = 'again' | 'hard' | 'good' | 'easy';

export interface SrsState {
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
  lapses: number;
}

const QUALITY: Record<Difficulty, number> = { again: 1, hard: 3, good: 4, easy: 5 };
const MIN_EASE = 1.3;
const DAY_MS = 24 * 60 * 60 * 1000;
const AGAIN_DELAY_MS = 10 * 60 * 1000; // relearn in 10 minutes

export const initialSrsState: SrsState = {
  easeFactor: 2.5,
  intervalDays: 0,
  repetitions: 0,
  lapses: 0,
};

export function schedule(prev: SrsState, difficulty: Difficulty, now = new Date()) {
  const q = QUALITY[difficulty];
  let { easeFactor, intervalDays, repetitions, lapses } = prev;

  // Ease update from the SM-2 paper
  easeFactor = Math.max(MIN_EASE, easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));

  if (q < 3) {
    // Forgot it: start the card over
    if (repetitions > 0) lapses += 1;
    repetitions = 0;
    intervalDays = 0;
    return {
      state: { easeFactor, intervalDays, repetitions, lapses },
      dueAt: new Date(now.getTime() + AGAIN_DELAY_MS),
    };
  }

  repetitions += 1;
  if (repetitions === 1) {
    intervalDays = difficulty === 'easy' ? 4 : difficulty === 'hard' ? 1 : 1;
  } else if (repetitions === 2) {
    intervalDays = difficulty === 'easy' ? 10 : difficulty === 'hard' ? 3 : 6;
  } else {
    const factor =
      difficulty === 'hard' ? 1.2 : difficulty === 'easy' ? easeFactor * 1.3 : easeFactor;
    intervalDays = Math.max(intervalDays + 1, Math.round(intervalDays * factor));
  }

  return {
    state: { easeFactor, intervalDays, repetitions, lapses },
    dueAt: new Date(now.getTime() + intervalDays * DAY_MS),
  };
}

/** Rough "next shown in" label for the answer buttons, in Burmese. */
export function previewLabel(prev: SrsState, difficulty: Difficulty) {
  const { state } = schedule(prev, difficulty);
  if (state.intervalDays === 0) return '<၁၀ မိနစ်';
  return `${state.intervalDays} ရက်`;
}
