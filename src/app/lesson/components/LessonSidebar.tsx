'use client';
import React, { useState } from 'react';

type Tab = 'content' | 'vocabulary' | 'grammar' | 'quiz';

interface Props {
  onTabChange: (tab: Tab) => void;
}

const chapterLessons = [
  { id: 1, title: 'သင်ခန်းစာ ၁ — て ပုံစံ မိတ်ဆက်', duration: '12 မိနစ်', completed: true },
  { id: 2, title: 'သင်ခန်းစာ ၂ — အုပ်စု ၁ ကြိယာ', duration: '15 မိနစ်', completed: true },
  { id: 3, title: 'သင်ခန်းစာ ၃ — အုပ်စု ၂ နဲ့ ၃ ကြိယာ', duration: '10 မိနစ်', completed: true },
  { id: 4, title: 'သင်ခန်းစာ ၄ — 〜てください', duration: '14 မိနစ်', completed: true },
  { id: 5, title: 'သင်ခန်းစာ ၅ — 〜ている (လုပ်နေဆဲ)', duration: '16 မိနစ်', completed: true },
  { id: 6, title: 'သင်ခန်းစာ ၆ — 〜てもいいですか', duration: '13 မိနစ်', completed: true },
  {
    id: 7,
    title: 'သင်ခန်းစာ ၇ — て ပုံစံ ဆက်စပ်အသုံး',
    duration: '18 မိနစ်',
    completed: false,
    current: true,
  },
  { id: 8, title: 'သင်ခန်းစာ ၈ — 〜てから', duration: '11 မိနစ်', completed: false },
  {
    id: 9,
    title: 'သင်ခန်းစာ ၉ — လေ့ကျင့်ခန်းနဲ့ ပြန်လှန်',
    duration: '20 မိနစ်',
    completed: false,
  },
];

export default function LessonSidebar({ onTabChange }: Props) {
  const [expanded, setExpanded] = useState(true);
  const completedCount = chapterLessons.filter((l) => l.completed).length;
  const progressPct = Math.round((completedCount / chapterLessons.length) * 100);

  return (
    <div className="space-y-4">
      {/* Lesson Info Card */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">အခန်း ၄ တိုးတက်မှု</h3>
          <span className="text-xs font-bold text-[#006633]">{progressPct}%</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full mb-3">
          <div
            className="h-full bg-[#006633] rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          သင်ခန်းစာ {chapterLessons.length} ခုအနက် {completedCount} ခု ပြီးပါပြီ
        </p>
      </div>

      {/* Quick Actions */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">အမြန်သွားရန်</h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'ဝေါဟာရ', icon: '🗂️', tab: 'vocabulary' as Tab },
            { label: 'သဒ္ဒါ', icon: '✏️', tab: 'grammar' as Tab },
            { label: 'Quiz ဖြေမယ်', icon: '📝', tab: 'quiz' as Tab },
            { label: 'သင်ခန်းစာ', icon: '📖', tab: 'content' as Tab },
          ].map((item) => (
            <button
              key={item.tab}
              onClick={() => onTabChange(item.tab)}
              className="flex flex-col items-center gap-1.5 p-3 rounded-lg border border-border bg-muted/30 hover:border-[#006633]/40 hover:bg-[#006633]/5 transition-all duration-150 text-center"
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-xs font-medium text-muted-foreground">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chapter Lesson List */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
        >
          <h3 className="text-sm font-semibold text-foreground">အခန်း ၄ — て ပုံစံ</h3>
          <svg
            className={`w-4 h-4 text-muted-foreground transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {expanded && (
          <div className="border-t border-border divide-y divide-border">
            {chapterLessons.map((lesson) => (
              <div
                key={lesson.id}
                className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                  lesson.current
                    ? 'bg-[#006633]/8 border-l-2 border-l-[#006633]'
                    : 'hover:bg-muted/30 cursor-pointer'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                    lesson.completed
                      ? 'bg-[#006633] text-white'
                      : lesson.current
                        ? 'border-2 border-[#006633] bg-[#006633]/10'
                        : 'border-2 border-border bg-muted'
                  }`}
                >
                  {lesson.completed ? (
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : lesson.current ? (
                    <div className="w-2 h-2 rounded-full bg-[#006633]" />
                  ) : null}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-xs font-medium truncate ${lesson.current ? 'text-[#006633]' : lesson.completed ? 'text-muted-foreground' : 'text-foreground'}`}
                  >
                    {lesson.title}
                  </p>
                  <p className="text-[11px] text-muted-foreground">{lesson.duration}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Next Lesson CTA */}
      <div className="bg-gradient-to-br from-[#006633] to-[#004d26] rounded-xl p-4 text-white">
        <p className="text-xs font-medium opacity-80 mb-1">နောက်သင်ခန်းစာ</p>
        <p className="text-sm font-semibold mb-3">သင်ခန်းစာ ၈ — 〜てから</p>
        <button className="w-full bg-white/20 hover:bg-white/30 text-white text-xs font-semibold py-2 rounded-lg transition-colors">
          ဆက်သွားမယ် →
        </button>
      </div>
    </div>
  );
}
