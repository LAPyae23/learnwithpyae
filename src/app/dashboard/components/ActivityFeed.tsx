import React from 'react';
import Icon from '@/components/ui/AppIcon';

const activities = [
  {
    id: 'act-001',
    type: 'lesson_completed',
    icon: 'PlayCircleIcon',
    iconBg: 'bg-blue-50',
    iconColor: 'text-level-n5',
    title: 'သင်ခန်းစာ ပြီးပါပြီ — ます・ません・ました',
    detail: 'အခန်း ၃ · 15 မိနစ် · N5 သဒ္ဒါ',
    time: '၂ နာရီအကြာ',
    badge: null,
  },
  {
    id: 'act-002',
    type: 'quiz_passed',
    icon: 'ClipboardDocumentCheckIcon',
    iconBg: 'bg-success-bg',
    iconColor: 'text-success',
    title: 'Quiz အောင်ပါပြီ — ます ပုံစံ ပြောင်းခြင်း',
    detail: 'ရမှတ် 8/10 · အခန်း ၃ · 80%',
    time: '၄ နာရီအကြာ',
    badge: { label: '80%', color: 'text-success bg-success-bg border-green-200' },
  },
  {
    id: 'act-003',
    type: 'flashcard_review',
    icon: 'RectangleStackIcon',
    iconBg: 'bg-secondary',
    iconColor: 'text-primary',
    title: 'Flashcard — ဝေါဟာရ ၃၈ ခု ပြန်လှန်ပြီး',
    detail: 'မှတ်မိနှုန်း 84% · 18 မိနစ်',
    time: '၆ နာရီအကြာ',
    badge: { label: '84%', color: 'text-primary bg-secondary border-green-200' },
  },
  {
    id: 'act-004',
    type: 'mock_test',
    icon: 'DocumentTextIcon',
    iconBg: 'bg-blue-50',
    iconColor: 'text-level-n5',
    title: 'Mock Test #1 ပြီးပါပြီ — N5 စာမေးပွဲ အပြည့်',
    detail: 'ရမှတ် 71/100 · 90 မိနစ် · အောင်',
    time: 'မနေ့က',
    badge: { label: '71/100', color: 'text-level-n5 bg-blue-50 border-blue-200' },
  },
  {
    id: 'act-005',
    type: 'kanji_studied',
    icon: 'PencilSquareIcon',
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-600',
    title: 'Kanji အသစ် ၁၅ လုံး ထည့်ပြီး',
    detail: '日・月・火・水・木 + ၁၀ လုံး · N5',
    time: 'မနေ့က',
    badge: null,
  },
  {
    id: 'act-006',
    type: 'streak',
    icon: 'FireIcon',
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-500',
    title: '၁၄ ရက် ဆက်တိုက် လေ့လာပြီးပါပြီ!',
    detail: 'အရမ်းကောင်းပါတယ် — ဆက်ကြိုးစားပါ',
    time: '၂ ရက်က',
    badge: { label: '၁၄ ရက်', color: 'text-amber-600 bg-amber-50 border-amber-200' },
  },
];

export default function ActivityFeed() {
  return (
    <div className="bg-card border border-border rounded-2xl shadow-card overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div>
          <h3 className="font-bold text-[15px] text-foreground">လတ်တလော လုပ်ဆောင်ချက်</h3>
          <p className="text-[12px] text-muted-foreground mt-0.5">နောက်ဆုံး ၆ ခု</p>
        </div>
        <button className="text-[12.5px] text-primary font-semibold hover:underline">
          အားလုံးကြည့်
        </button>
      </div>
      <div className="divide-y divide-border">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start gap-3.5 px-4 md:px-6 py-4 hover:bg-muted/40 transition-colors"
          >
            <div
              className={`w-9 h-9 rounded-xl ${activity.iconBg} flex items-center justify-center flex-shrink-0 mt-0.5`}
            >
              <Icon
                name={activity.icon as Parameters<typeof Icon>[0]['name']}
                size={17}
                className={activity.iconColor}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13.5px] font-medium text-foreground leading-snug">
                {activity.title}
              </p>
              <p className="text-[12px] text-muted-foreground mt-0.5">{activity.detail}</p>
            </div>
            <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
              <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                {activity.time}
              </span>
              {activity.badge && (
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${activity.badge.color}`}
                >
                  {activity.badge.label}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
