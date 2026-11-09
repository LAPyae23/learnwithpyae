'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import { daysUntil, formatMyDate, nextJlptDate } from '@/lib/jlpt';
import { useCurrentUser } from '@/components/useCurrentUser';

export default function DashboardHeader() {
  const [exam, setExam] = useState<{ days: number; label: string } | null>(null);
  const { user } = useCurrentUser();

  useEffect(() => {
    const d = nextJlptDate();
    setExam({
      days: daysUntil(d),
      label: formatMyDate(d),
    });
  }, []);

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[13px] text-muted-foreground font-jp">こんにちは、</span>
          <span className="text-[13px] font-semibold text-primary">{user?.name ?? ''}</span>
        </div>
        <h1 className="text-[22px] md:text-[24px] font-bold text-foreground leading-tight">
          ကျွန်ုပ်၏ လေ့လာမှု
        </h1>
        <p className="text-[14px] text-muted-foreground mt-0.5">
          JLPT {user?.targetLevel ?? 'N5'} စာမေးပွဲ{' '}
          <span className="font-semibold text-warning">{exam ? `${exam.days} ရက်` : '—'}</span>
          အလိုပါ။ အခု ၆၈% အသင့်ဖြစ်နေပါပြီ — ဆက်ကြိုးစားပါ။
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="flex items-center gap-1.5 bg-warning-bg border border-amber-200 rounded-lg px-3 py-2">
          <Icon name="CalendarDaysIcon" size={15} className="text-warning" />
          <span className="text-[13px] font-semibold text-warning">{exam?.label ?? '—'}</span>
        </div>
        <Link
          href="/lesson"
          className="flex items-center gap-1.5 bg-primary text-white text-[13px] font-semibold px-4 py-2 rounded-lg hover:bg-accent transition-colors active:scale-95"
        >
          <Icon name="PlayCircleIcon" size={15} className="text-white" />
          ဆက်သင်မယ်
        </Link>
      </div>
    </div>
  );
}
