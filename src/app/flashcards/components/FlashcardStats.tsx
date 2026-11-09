'use client';
import React from 'react';
import Icon from '@/components/ui/AppIcon';

const weeklyData = [
  { id: 'day-mon', day: 'လာ', reviewed: 24, correct: 20 },
  { id: 'day-tue', day: 'ဂါ', reviewed: 18, correct: 15 },
  { id: 'day-wed', day: 'ဟူး', reviewed: 32, correct: 28 },
  { id: 'day-thu', day: 'ကြာ', reviewed: 12, correct: 10 },
  { id: 'day-fri', day: 'သော', reviewed: 28, correct: 22 },
  { id: 'day-sat', day: 'နေ', reviewed: 40, correct: 36 },
  { id: 'day-sun', day: 'နွေ', reviewed: 15, correct: 13 },
];

const maxReviewed = Math.max(...weeklyData.map((d) => d.reviewed));

const statCards = [
  {
    id: 'stat-streak',
    icon: 'FireIcon',
    label: 'ဆက်တိုက် ရက်',
    value: '12',
    unit: 'ရက်',
    color: 'text-warning',
    bg: 'bg-warning-bg',
  },
  {
    id: 'stat-total',
    icon: 'RectangleStackIcon',
    label: 'ပြန်လှန်ပြီး စုစုပေါင်း',
    value: '847',
    unit: 'ခု',
    color: 'text-primary',
    bg: 'bg-secondary',
  },
  {
    id: 'stat-accuracy',
    icon: 'ChartBarIcon',
    label: 'ပျမ်းမျှ မှန်နှုန်း',
    value: '84',
    unit: '%',
    color: 'text-success',
    bg: 'bg-success-bg',
  },
  {
    id: 'stat-mastered',
    icon: 'StarIcon',
    label: 'ကျွမ်းကျင်ပြီး',
    value: '312',
    unit: 'ခု',
    color: 'text-level-n3',
    bg: 'bg-amber-50',
  },
];

export default function FlashcardStats() {
  return (
    <div className="space-y-4">
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3">
        {statCards.map((stat) => (
          <div key={stat.id} className="bg-card border border-border rounded-2xl p-4">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2 ${stat.bg}`}>
              <Icon
                name={stat.icon as Parameters<typeof Icon>[0]['name']}
                size={16}
                className={stat.color}
              />
            </div>
            <p className="text-[20px] font-bold text-foreground tabular-nums leading-none">
              {stat.value}
              <span className="text-[12px] font-medium text-muted-foreground ml-0.5">
                {stat.unit}
              </span>
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Weekly activity chart */}
      <div className="bg-card border border-border rounded-2xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[14px] font-bold text-foreground">ဒီအပတ်</h3>
          <span className="text-[11px] text-muted-foreground">၁၆၉ ခု ပြန်လှန်ပြီး</span>
        </div>
        <div className="flex items-end gap-1.5 h-20">
          {weeklyData.map((day) => (
            <div key={day.id} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex flex-col justify-end" style={{ height: 56 }}>
                <div
                  className="w-full bg-muted rounded-t-sm overflow-hidden relative"
                  style={{ height: `${(day.reviewed / maxReviewed) * 100}%`, minHeight: 4 }}
                >
                  <div
                    className="absolute bottom-0 left-0 right-0 bg-primary rounded-t-sm"
                    style={{ height: `${(day.correct / day.reviewed) * 100}%` }}
                  />
                </div>
              </div>
              <span className="text-[9px] text-muted-foreground">{day.day}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 mt-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-primary" />
            <span className="text-[10px] text-muted-foreground">မှန်</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-muted" />
            <span className="text-[10px] text-muted-foreground">ပြန်လှန်</span>
          </div>
        </div>
      </div>

      {/* SRS info */}
      <div className="bg-secondary border border-primary/20 rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <Icon
            name="InformationCircleIcon"
            size={16}
            className="text-primary mt-0.5 flex-shrink-0"
          />
          <div>
            <p className="text-[13px] font-semibold text-foreground">Spaced Repetition ဆိုတာ</p>
            <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
              ခက်တဲ့ကတ်တွေကို ခဏခဏ ပြန်ပြပြီး လွယ်တဲ့ကတ်တွေကို ကြာမှ ပြန်ပြပါတယ်။ ဒါမှ ရေရှည်
              မှတ်မိနေမှာပါ။
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
