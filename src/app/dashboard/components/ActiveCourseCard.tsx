'use client';
import React from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

interface Lesson {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
  type: 'video' | 'quiz' | 'reading' | 'listening';
  current?: boolean;
  locked?: boolean;
}

interface Chapter {
  id: string;
  title: string;
  lessons: Lesson[];
}

const chapters: Chapter[] = [
  {
    id: 'ch-003',
    title: 'အခန်း ၃ — ます ပုံစံ ကြိယာများ',
    lessons: [
      {
        id: 'les-301',
        title: 'ます ပုံစံ မိတ်ဆက်',
        duration: '12 မိနစ်',
        completed: true,
        type: 'video',
      },
      {
        id: 'les-302',
        title: 'ます・ません・ました・ませんでした',
        duration: '15 မိနစ်',
        completed: true,
        type: 'video',
      },
      {
        id: 'les-303',
        title: 'を နဲ့ に ဝိဘတ် အသုံးပြုပုံ',
        duration: '14 မိနစ်',
        completed: false,
        type: 'video',
        current: true,
      },
      {
        id: 'les-304',
        title: 'ます ပုံစံ လေ့ကျင့်ခန်း',
        duration: '10 မိနစ်',
        completed: false,
        type: 'quiz',
      },
      {
        id: 'les-305',
        title: 'ဖတ်စာ — ကျွန်တော့်တစ်နေ့တာ',
        duration: '8 မိနစ်',
        completed: false,
        type: 'reading',
      },
    ],
  },
  {
    id: 'ch-004',
    title: 'အခန်း ၄ — て ပုံစံ',
    lessons: [
      {
        id: 'les-401',
        title: 'て ပုံစံ ပြောင်းနည်း',
        duration: '18 မိနစ်',
        completed: false,
        type: 'video',
        locked: true,
      },
      {
        id: 'les-402',
        title: '〜てください — တောင်းဆိုခြင်း',
        duration: '12 မိနစ်',
        completed: false,
        type: 'video',
        locked: true,
      },
    ],
  },
];

const lessonTypeIcon: Record<string, string> = {
  video: 'PlayCircleIcon',
  quiz: 'ClipboardDocumentCheckIcon',
  reading: 'DocumentTextIcon',
  listening: 'SpeakerWaveIcon',
};

const lessonTypeBg: Record<string, string> = {
  video: 'bg-blue-50 text-level-n5',
  quiz: 'bg-amber-50 text-level-n3',
  reading: 'bg-green-50 text-level-n4',
  listening: 'bg-purple-50 text-purple-600',
};

export default function ActiveCourseCard() {
  const totalLessons = chapters.reduce((acc, ch) => acc + ch.lessons.length, 0);
  const completedLessons = chapters.reduce(
    (acc, ch) => acc + ch.lessons.filter((l) => l.completed).length,
    0
  );
  const progressPct = Math.round((completedLessons / totalLessons) * 100);

  return (
    <div className="bg-card border border-border rounded-2xl shadow-card overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-sky-50 border-b border-border px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="level-badge-n5 text-[12px] font-bold px-2.5 py-0.5 rounded-lg">
                N5
              </span>
              <span className="text-[12px] text-muted-foreground font-medium">
                JLPT N5 — အခြေခံအဆင့်
              </span>
            </div>
            <h3 className="font-bold text-[17px] text-foreground">N5 သဒ္ဒါ အခြေခံသင်တန်း</h3>
            <p className="text-[13px] text-muted-foreground mt-0.5">
              N5 စာမေးပွဲအတွက် မရှိမဖြစ် သဒ္ဒါပုံစံများ
            </p>
          </div>
          <Link
            href="/lesson"
            className="flex-shrink-0 flex items-center gap-1.5 bg-primary text-white text-[13px] font-bold px-4 py-2 rounded-lg hover:bg-accent transition-colors active:scale-95"
          >
            <Icon name="PlayCircleIcon" size={14} className="text-white" />
            ဆက်သင်မယ်
          </Link>
        </div>

        {/* Progress */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[12px] font-semibold text-foreground">
              သင်ခန်းစာ {totalLessons} ခုအနက် {completedLessons} ခု ပြီးပါပြီ
            </span>
            <span className="text-[12px] font-bold text-primary tabular-nums">{progressPct}%</span>
          </div>
          <div className="w-full h-2.5 bg-white/60 rounded-full overflow-hidden border border-blue-100">
            <div
              className="h-full bg-level-n5 rounded-full progress-bar-fill"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Lesson list */}
      <div className="p-4 space-y-3">
        {chapters.map((chapter) => (
          <div key={chapter.id}>
            <p className="text-[11.5px] font-semibold text-muted-foreground px-1 mb-2">
              {chapter.title}
            </p>
            <div className="space-y-1.5">
              {chapter.lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                    lesson.current
                      ? 'bg-secondary border border-primary/20'
                      : lesson.completed
                        ? 'bg-muted/40 hover:bg-muted cursor-pointer'
                        : lesson.locked
                          ? 'opacity-50 cursor-not-allowed'
                          : 'hover:bg-muted cursor-pointer'
                  }`}
                >
                  {/* Status icon */}
                  <div className="flex-shrink-0">
                    {lesson.completed ? (
                      <div className="w-6 h-6 rounded-full bg-success flex items-center justify-center">
                        <Icon name="CheckIcon" size={12} className="text-white" />
                      </div>
                    ) : lesson.current ? (
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center animate-pulse-green">
                        <Icon name="PlayIcon" size={10} className="text-white" variant="solid" />
                      </div>
                    ) : lesson.locked ? (
                      <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                        <Icon name="LockClosedIcon" size={11} className="text-muted-foreground" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-border flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                      </div>
                    )}
                  </div>

                  {/* Type icon */}
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${lessonTypeBg[lesson.type] || 'bg-muted text-muted-foreground'}`}
                  >
                    <Icon
                      name={lessonTypeIcon[lesson.type] as Parameters<typeof Icon>[0]['name']}
                      size={14}
                    />
                  </div>

                  {/* Title */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-[13px] font-medium truncate ${lesson.current ? 'text-primary' : lesson.completed ? 'text-muted-foreground' : 'text-foreground'}`}
                    >
                      {lesson.title}
                    </p>
                  </div>

                  {/* Duration */}
                  <span className="text-[11px] text-muted-foreground flex-shrink-0 tabular-nums">
                    {lesson.duration}
                  </span>

                  {lesson.current && (
                    <span className="text-[10px] font-bold bg-primary text-white px-2 py-0.5 rounded-full flex-shrink-0">
                      လက်ရှိ
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
