/**
 * Study planner: turns "target level + exam date + minutes per day + current progress"
 * into daily targets, a 7-day schedule and a rough pass estimate. Pure functions (no DB).
 */

export type Level = 'N5' | 'N4' | 'N3';

/** Approximate JLPT syllabus sizes (cumulative from N5) used for planning. */
export const SYLLABUS: Record<Level, { vocab: number; kanji: number; grammar: number }> = {
  N5: { vocab: 800, kanji: 100, grammar: 80 },
  N4: { vocab: 1500, kanji: 300, grammar: 200 },
  N3: { vocab: 3750, kanji: 650, grammar: 380 },
};

/** Minutes a learner typically spends per item (new learning + first reviews). */
const MINUTES = { vocab: 0.75, kanji: 1.5, grammar: 6, review: 0.2, mockTest: 90 };
const FINAL_REVIEW_DAYS = 14;

export interface Progress {
  vocabLearned: number;
  kanjiLearned: number;
  grammarLearned: number;
  reviewsDue: number;
  /** Most recent mock test percentages, newest first. */
  mockScores: number[];
}

export interface PlanInput {
  level: Level;
  examDate: Date;
  minutesPerDay: number;
  today?: Date;
}

export interface DayPlan {
  date: string; // YYYY-MM-DD
  weekday: number; // 0 = Sunday
  tasks: {
    kind: 'vocab' | 'kanji' | 'grammar' | 'review' | 'mock' | 'rest';
    count: number;
    minutes: number;
  }[];
  minutes: number;
}

export interface Plan {
  daysLeft: number;
  phase: 'learn' | 'final-review' | 'exam-week' | 'past';
  coverage: number; // 0..1 of syllabus learned
  daily: { vocab: number; kanji: number; grammar: number; reviews: number };
  requiredMinutes: number;
  status: 'ahead' | 'on-track' | 'tight' | 'behind';
  passChance: number; // 0..100
  week: DayPlan[];
  remaining: { vocab: number; kanji: number; grammar: number };
}

const DAY_MS = 86_400_000;
const isoDay = (d: Date) => d.toISOString().slice(0, 10);

function startOfDay(d: Date) {
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
}

export function buildPlan(input: PlanInput, progress: Progress): Plan {
  const today = startOfDay(input.today ?? new Date());
  const exam = startOfDay(input.examDate);
  const daysLeft = Math.round((exam.getTime() - today.getTime()) / DAY_MS);
  const syl = SYLLABUS[input.level];

  const remaining = {
    vocab: Math.max(syl.vocab - progress.vocabLearned, 0),
    kanji: Math.max(syl.kanji - progress.kanjiLearned, 0),
    grammar: Math.max(syl.grammar - progress.grammarLearned, 0),
  };
  const total = syl.vocab + syl.kanji + syl.grammar;
  const coverage =
    (Math.min(progress.vocabLearned, syl.vocab) +
      Math.min(progress.kanjiLearned, syl.kanji) +
      Math.min(progress.grammarLearned, syl.grammar)) /
    total;

  const phase: Plan['phase'] =
    daysLeft < 0
      ? 'past'
      : daysLeft <= 7
        ? 'exam-week'
        : daysLeft <= FINAL_REVIEW_DAYS
          ? 'final-review'
          : 'learn';

  // New material is spread over the days before the final-review window; Sundays are lighter (mock test day).
  const learnDays = Math.max(daysLeft - FINAL_REVIEW_DAYS, 1);
  const studyDays = Math.max(Math.round(learnDays * (6 / 7)), 1);
  const learning = phase === 'learn';
  const daily = {
    vocab: learning ? Math.ceil(remaining.vocab / studyDays) : 0,
    kanji: learning ? Math.ceil(remaining.kanji / studyDays) : 0,
    grammar: learning ? Math.ceil(remaining.grammar / studyDays) : 0,
    // Reviews grow with what's been learned; this is a steady-state estimate of daily SRS load.
    reviews: Math.max(
      progress.reviewsDue,
      Math.round((progress.vocabLearned + progress.kanjiLearned) * 0.08)
    ),
  };

  const requiredMinutes = Math.round(
    daily.vocab * MINUTES.vocab +
      daily.kanji * MINUTES.kanji +
      daily.grammar * MINUTES.grammar +
      daily.reviews * MINUTES.review
  );

  const ratio = requiredMinutes / Math.max(input.minutesPerDay, 1);
  const status: Plan['status'] =
    phase !== 'learn'
      ? coverage >= 0.85
        ? 'on-track'
        : 'behind'
      : ratio <= 0.7
        ? 'ahead'
        : ratio <= 1.05
          ? 'on-track'
          : ratio <= 1.5
            ? 'tight'
            : 'behind';

  const passChance = estimatePassChance({
    coverage,
    mockScores: progress.mockScores,
    daysLeft,
    feasibility: Math.min(1 / Math.max(ratio, 0.01), 1.3),
  });

  const week: DayPlan[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today.getTime() + i * DAY_MS);
    const left = daysLeft - i;
    if (left < 0) break;
    const weekday = d.getUTCDay();
    const tasks: DayPlan['tasks'] = [];
    if (left === 0) {
      tasks.push({ kind: 'rest', count: 0, minutes: 0 });
    } else if (left <= FINAL_REVIEW_DAYS) {
      // Final stretch: mock test every other day, reviews every day
      if (left % 2 === 0) tasks.push({ kind: 'mock', count: 1, minutes: MINUTES.mockTest });
      tasks.push({
        kind: 'review',
        count: daily.reviews,
        minutes: Math.round(daily.reviews * MINUTES.review),
      });
    } else if (weekday === 0) {
      tasks.push({ kind: 'mock', count: 1, minutes: MINUTES.mockTest });
      tasks.push({
        kind: 'review',
        count: daily.reviews,
        minutes: Math.round(daily.reviews * MINUTES.review),
      });
    } else {
      if (daily.vocab)
        tasks.push({
          kind: 'vocab',
          count: daily.vocab,
          minutes: Math.round(daily.vocab * MINUTES.vocab),
        });
      if (daily.kanji)
        tasks.push({
          kind: 'kanji',
          count: daily.kanji,
          minutes: Math.round(daily.kanji * MINUTES.kanji),
        });
      if (daily.grammar)
        tasks.push({
          kind: 'grammar',
          count: daily.grammar,
          minutes: Math.round(daily.grammar * MINUTES.grammar),
        });
      tasks.push({
        kind: 'review',
        count: daily.reviews,
        minutes: Math.round(daily.reviews * MINUTES.review),
      });
    }
    week.push({
      date: isoDay(d),
      weekday,
      tasks,
      minutes: tasks.reduce((s, t) => s + t.minutes, 0),
    });
  }

  return { daysLeft, phase, coverage, daily, requiredMinutes, status, passChance, week, remaining };
}

/**
 * Rough logistic estimate, not a promise. JLPT N5–N3 pass mark is ~about a third of total points
 * plus section minimums; mock tests at 60%+ correlate well with passing, so 60% is the midpoint.
 */
export function estimatePassChance(p: {
  coverage: number;
  mockScores: number[];
  daysLeft: number;
  feasibility: number;
}) {
  const recent = p.mockScores.slice(0, 3);
  const mockAvg = recent.length ? recent.reduce((a, b) => a + b, 0) / recent.length : null;

  // Projected score at exam day: current knowledge plus what the remaining plan can add.
  const potentialGain =
    Math.max(0, 1 - p.coverage) * Math.min(p.feasibility, 1) * Math.min(p.daysLeft / 60, 1);
  const knowledgeScore = (p.coverage + potentialGain) * 100;
  const projected = mockAvg === null ? knowledgeScore * 0.85 : mockAvg * 0.6 + knowledgeScore * 0.4;

  const chance = 100 / (1 + Math.exp(-(projected - 60) / 7));
  // Without any mock test the estimate is uncertain; keep it away from the extremes.
  const clamped =
    mockAvg === null ? Math.min(Math.max(chance, 10), 75) : Math.min(Math.max(chance, 3), 97);
  return Math.round(clamped);
}
