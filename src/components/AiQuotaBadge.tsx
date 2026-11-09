'use client';
import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export interface Quota {
  limit: number;
  used: number;
  paid: boolean;
  enabled: boolean;
}

/** Shows today's remaining AI uses. Pass `refreshKey` to re-fetch after each request. */
export default function AiQuotaBadge({ refreshKey = 0 }: { refreshKey?: number }) {
  const [q, setQ] = useState<Quota | null>(null);
  useEffect(() => {
    api<Quota>('/api/ai/quota')
      .then(setQ)
      .catch(() => setQ(null));
  }, [refreshKey]);

  if (!q) return null;
  if (!q.enabled) {
    return (
      <span className="text-[11.5px] font-semibold px-2.5 py-1 rounded-full bg-warning-bg text-warning">
        AI မဖွင့်ရသေးပါ
      </span>
    );
  }
  const left = Math.max(q.limit - q.used, 0);
  return (
    <span
      className={`text-[11.5px] font-semibold px-2.5 py-1 rounded-full ${
        left === 0 ? 'bg-danger-bg text-danger' : 'bg-secondary text-primary'
      }`}
    >
      {q.paid ? 'Premium · ' : ''}ဒီနေ့ {left}/{q.limit} ကြိမ် ကျန်
    </span>
  );
}
