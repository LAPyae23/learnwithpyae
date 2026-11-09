'use client';
import React from 'react';
import Link from 'next/link';
import { STATUS_LABELS, TASK_LABELS, usePlan } from '@/components/usePlan';

/** Dashboard card: today's tasks from the study planner + pass estimate. */
export default function TodayPlanCard() {
  const { data } = usePlan();
  if (!data) return <div className="h-28 bg-muted rounded-2xl animate-pulse mb-6" />;
  const { plan } = data;
  const today = plan.week[0];
  const status = STATUS_LABELS[plan.status];

  return (
    <div className="bg-card border border-border rounded-2xl shadow-card p-5 mb-6">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div>
          <h3 className="font-bold text-[15px] text-foreground">ဒီနေ့ လုပ်ရမယ့်အရာ</h3>
          <p className="text-[12px] text-muted-foreground">
            ~{today?.minutes ?? 0} မိနစ် · JLPT {data.settings.level} အထိ {plan.daysLeft} ရက်
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${status.cls}`}>
            {status.text}
          </span>
          <span className="text-[12px] font-bold text-foreground">
            အောင်နိုင်ခြေ {plan.passChance}%
          </span>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {today?.tasks.map((t, i) => {
          const meta = TASK_LABELS[t.kind];
          return (
            <Link
              key={i}
              href={meta.href}
              className="flex items-center gap-1.5 text-[13px] font-medium bg-secondary/60 hover:bg-secondary border border-primary/20 rounded-xl px-3 py-2"
            >
              <span>{meta.icon}</span>
              {meta.label}
              {t.count > 1 || t.kind === 'review' ? (
                <span className="font-bold text-primary">{t.count}</span>
              ) : null}
            </Link>
          );
        })}
        <Link
          href="/plan"
          className="text-[13px] text-primary font-semibold px-2 py-2 hover:underline"
        >
          အစီအစဉ် အပြည့် →
        </Link>
      </div>
    </div>
  );
}
