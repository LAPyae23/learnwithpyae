'use client';
import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { Plan, Level } from '@/lib/planner';

export interface PlanResponse {
  settings: { level: Level; examSession: string | null; examDate: string; minutesPerDay: number };
  learned: { vocab: number; kanji: number; grammar: number };
  mockCount: number;
  plan: Plan;
}

export function usePlan() {
  const [data, setData] = useState<PlanResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setData(await api<PlanResponse>('/api/plan'));
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, error, reload };
}

export const TASK_LABELS: Record<string, { label: string; icon: string; href: string }> = {
  vocab: { label: 'ဝေါဟာရ အသစ်', icon: '🗂️', href: '/flashcards' },
  kanji: { label: 'Kanji အသစ်', icon: '✍️', href: '/kanji' },
  grammar: { label: 'သဒ္ဒါ အသစ်', icon: '✏️', href: '/lesson' },
  review: { label: 'Flashcard ပြန်လှန်', icon: '🔁', href: '/flashcards' },
  mock: { label: 'Mock test ဖြေ', icon: '📝', href: '/exam' },
  rest: { label: 'စာမေးပွဲနေ့ — အောင်ပါစေ!', icon: '🎌', href: '/dashboard' },
};

export const STATUS_LABELS: Record<Plan['status'], { text: string; cls: string }> = {
  ahead: { text: 'အစီအစဉ်ထက် ရှေ့ရောက်နေ', cls: 'bg-success-bg text-success' },
  'on-track': { text: 'အစီအစဉ်အတိုင်း', cls: 'bg-success-bg text-success' },
  tight: { text: 'နည်းနည်း ကြိုးစားရမယ်', cls: 'bg-warning-bg text-warning' },
  behind: { text: 'နောက်ကျနေ', cls: 'bg-danger-bg text-danger' },
};
