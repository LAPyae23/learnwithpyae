'use client';
import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';

export interface AdminStats {
  users: {
    total: number;
    roles: Record<string, number>;
    new7: number;
    new30: number;
    premium: number;
    active7: number;
    levels: Record<string, number>;
    signupsByDay: { day: string; n: number }[];
  };
  learning: { cardsReviewed7: number; exams30: number; examAvgPct: number };
  content: { lessons: Record<string, number>; pendingTeachers: number; pendingPayments: number };
  revenue: {
    thisMonth: { total: number; count: number };
    lastMonth: { total: number; count: number };
    allTime: { total: number; count: number };
    byMonth: { month: string; total: number; count: number }[];
    byPlan: { plan: string; total: number; count: number }[];
    byMethod: { method: string; total: number; count: number }[];
    recent: {
      id: string;
      user: { name: string; email: string } | null;
      plan: string;
      amount: number;
      method: string;
      at: string;
    }[];
  };
}

/** Loads /api/admin/stats once; call reload() to refresh. */
export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState('');
  const reload = useCallback(() => {
    setError('');
    api<AdminStats>('/api/admin/stats')
      .then(setStats)
      .catch((e) => setError(e.message));
  }, []);
  useEffect(reload, [reload]);
  return { stats, error, reload };
}

/** Simple bar chart made of divs: one bar per item, height relative to the max. */
export function bars<T>(items: T[], value: (t: T) => number) {
  const max = Math.max(1, ...items.map(value));
  return items.map((t) => ({ item: t, pct: (value(t) / max) * 100 }));
}
