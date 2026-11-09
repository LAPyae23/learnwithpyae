'use client';
import React from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

// Bento plan: 6 cards → grid-cols-3
// Row 1: hero (streak, spans 2 cols) + flashcards due (1 col, alert state)
// Row 2: vocab retention + mock test score + study time (3 equal cols)

const metrics = {
  streak: { value: 14, unit: 'days', trend: 'ပြီးခဲ့တဲ့အပတ်ထက် +၃ ရက်', positive: true },
  flashcardsDue: {
    value: 24,
    unit: 'cards due',
    trend: 'မနေ့က ကျန်ခဲ့တာ ၈ ခု',
    positive: false,
    alert: true,
  },
  vocabRetention: { value: 83, unit: '%', trend: 'ပြီးခဲ့တဲ့အပတ်ထက် +4%', positive: true },
  mockScore: { value: 71, unit: '/100', trend: 'နောက်ဆုံးဖြေခဲ့သည် — ၃ ရက်က', positive: true },
  studyTime: {
    value: 4.5,
    unit: 'hrs this week',
    trend: 'ပန်းတိုင် — တစ်ပတ် ၆ နာရီ',
    positive: false,
  },
  lessonCompletion: {
    value: 68,
    unit: '% complete',
    trend: 'သင်ခန်းစာ ၅၀ ထဲက ၃၄ ခု ပြီး',
    positive: true,
  },
};

export default function MetricsBentoGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-4 mb-6">
      {/* Hero: Daily Streak — spans 2 cols */}
      <div className="sm:col-span-2 lg:col-span-2 bg-card border border-border rounded-2xl shadow-card p-6 flex items-center justify-between gap-6 streak-glow">
        <div>
          <p className="text-[12px] font-semibold text-muted-foreground mb-2">
            ဆက်တိုက် လေ့လာခဲ့သည့် ရက်
          </p>
          <div className="flex items-end gap-2 mb-2">
            <span className="text-[52px] font-bold text-foreground tabular-nums leading-none">
              {metrics?.streak?.value}
            </span>
            <span className="text-[18px] font-semibold text-muted-foreground mb-2">ရက်</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Icon name="ArrowTrendingUpIcon" size={14} className="text-success" />
            <span className="text-[13px] text-success font-medium">{metrics?.streak?.trend}</span>
          </div>
          <p className="text-[12px] text-muted-foreground mt-1">
            အရမ်းကောင်းပါတယ် — ဒီအတိုင်း ဆက်လုပ်ပါ
          </p>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-amber-50 border-4 border-amber-300 flex items-center justify-center mb-2">
            <Icon name="FireIcon" size={36} className="text-amber-500" variant="solid" />
          </div>
          {/* Mini streak dots */}
          <div className="flex gap-1">
            {Array.from({ length: 7 })?.map((_, i) => (
              <div
                key={`streak-dot-${i}`}
                className={`w-3 h-3 rounded-full ${i < 6 ? 'bg-amber-400' : 'bg-muted'}`}
              />
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">ပြီးခဲ့သည့် ၇ ရက်</p>
        </div>
      </div>
      {/* Flashcards Due — alert state */}
      <div className="bg-danger-bg border border-red-200 rounded-2xl shadow-card p-5 flex flex-col justify-between">
        <div className="flex items-start justify-between mb-3">
          <p className="text-[12px] font-semibold text-danger/70">ပြန်လှန်ရန် Flashcard</p>
          <div className="w-8 h-8 bg-danger/10 rounded-lg flex items-center justify-center">
            <Icon name="RectangleStackIcon" size={16} className="text-danger" />
          </div>
        </div>
        <div>
          <div className="flex items-end gap-1 mb-1">
            <span className="text-[40px] font-bold text-danger tabular-nums leading-none">
              {metrics?.flashcardsDue?.value}
            </span>
            <span className="text-[14px] font-medium text-danger/70 mb-1.5">ခု</span>
          </div>
          <div className="flex items-center gap-1.5 mb-3">
            <Icon name="ExclamationTriangleIcon" size={13} className="text-danger" />
            <span className="text-[12px] text-danger font-medium">
              {metrics?.flashcardsDue?.trend}
            </span>
          </div>
          <Link
            href="/flashcards"
            className="block text-center w-full py-2 bg-danger text-white text-[12.5px] font-bold rounded-lg hover:opacity-90 transition-opacity active:scale-95"
          >
            အခုပဲ ပြန်လှန်မယ်
          </Link>
        </div>
      </div>
      {/* Vocabulary Retention */}
      <div className="bg-card border border-border rounded-2xl shadow-card p-5 flex flex-col justify-between">
        <div className="flex items-start justify-between mb-3">
          <p className="text-[12px] font-semibold text-muted-foreground">ဝေါဟာရ မှတ်မိနှုန်း</p>
          <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center">
            <Icon name="BookOpenIcon" size={16} className="text-primary" />
          </div>
        </div>
        <div>
          <div className="flex items-end gap-1 mb-2">
            <span className="text-[36px] font-bold text-foreground tabular-nums leading-none">
              {metrics?.vocabRetention?.value}
            </span>
            <span className="text-[16px] font-medium text-muted-foreground mb-1">%</span>
          </div>
          {/* Mini progress bar */}
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-primary rounded-full progress-bar-fill"
              style={{ width: `${metrics?.vocabRetention?.value}%` }}
            />
          </div>
          <div className="flex items-center gap-1">
            <Icon name="ArrowTrendingUpIcon" size={12} className="text-success" />
            <span className="text-[12px] text-success font-medium">
              {metrics?.vocabRetention?.trend}
            </span>
          </div>
        </div>
      </div>
      {/* Mock Test Score */}
      <div className="bg-card border border-border rounded-2xl shadow-card p-5 flex flex-col justify-between">
        <div className="flex items-start justify-between mb-3">
          <p className="text-[12px] font-semibold text-muted-foreground">Mock Test ရမှတ်</p>
          <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
            <Icon name="DocumentTextIcon" size={16} className="text-level-n5" />
          </div>
        </div>
        <div>
          <div className="flex items-end gap-1 mb-2">
            <span className="text-[36px] font-bold text-foreground tabular-nums leading-none">
              {metrics?.mockScore?.value}
            </span>
            <span className="text-[16px] font-medium text-muted-foreground mb-1">/100</span>
          </div>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[11px] bg-success-bg text-success font-semibold px-2 py-0.5 rounded-full">
              အောင်မှတ်ရ (60+)
            </span>
          </div>
          <p className="text-[12px] text-muted-foreground">{metrics?.mockScore?.trend}</p>
        </div>
      </div>
      {/* Study Time */}
      <div className="bg-card border border-border rounded-2xl shadow-card p-5 flex flex-col justify-between">
        <div className="flex items-start justify-between mb-3">
          <p className="text-[12px] font-semibold text-muted-foreground">လေ့လာချိန်</p>
          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
            <Icon name="ClockIcon" size={16} className="text-level-n5" />
          </div>
        </div>
        <div>
          <div className="flex items-end gap-1 mb-2">
            <span className="text-[36px] font-bold text-foreground tabular-nums leading-none">
              {metrics?.studyTime?.value}
            </span>
            <span className="text-[14px] font-medium text-muted-foreground mb-1">နာရီ</span>
          </div>
          {/* Progress toward weekly goal */}
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-level-n5 rounded-full progress-bar-fill"
              style={{ width: `${(metrics?.studyTime?.value / 6) * 100}%` }}
            />
          </div>
          <div className="flex items-center gap-1">
            <Icon name="ArrowTrendingDownIcon" size={12} className="text-warning" />
            <span className="text-[12px] text-warning font-medium">
              {metrics?.studyTime?.trend}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
