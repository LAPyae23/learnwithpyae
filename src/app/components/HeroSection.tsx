'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import { daysUntil, jlptSessionLabel, nextJlptDate } from '@/lib/jlpt';

const stats = [
  { id: 'stat-levels', value: 'N5–N3', label: 'JLPT အဆင့်များ' },
  { id: 'stat-burmese', value: '100%', label: 'မြန်မာလို ရှင်းလင်းချက်' },
  { id: 'stat-mobile', value: '📱', label: 'ဖုန်းနဲ့ အလွယ်တကူ' },
  { id: 'stat-free', value: 'အခမဲ့', label: 'အဓိက feature အားလုံး' },
];

export default function HeroSection() {
  const [daysUntilExam, setDaysUntilExam] = useState<number | null>(null);
  const [examLabel, setExamLabel] = useState('');

  useEffect(() => {
    const nextExam = nextJlptDate();
    setDaysUntilExam(daysUntil(nextExam));
    setExamLabel(jlptSessionLabel(nextExam));
  }, []);

  return (
    <section className="gradient-hero min-h-[620px] flex flex-col justify-center relative overflow-hidden pt-16">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-[10%] text-white/5 text-[200px] font-bold select-none leading-none">
          日
        </div>
        <div className="absolute bottom-10 left-[5%] text-white/5 text-[150px] font-bold select-none leading-none">
          語
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-white/3 blur-3xl pointer-events-none" />
      </div>
      <div className="relative max-w-screen-2xl mx-auto px-6 lg:px-10 py-20">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-white/90 text-[13px] font-medium">
              မြန်မာလို ရှင်းပြတဲ့ ဂျပန်စာ သင်တန်း
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-hero-xl text-white mb-5 leading-tight">
            JLPT ကို <span className="text-green-300">မြန်မာလို</span> နားလည်လွယ်အောင် လေ့လာပြီး
            အောင်မြင်ပါ
          </h1>

          <p className="text-hero-sub text-white/80 mb-8 max-w-xl">
            Video သင်ခန်းစာ၊ flashcard၊ မြန်မာလို သဒ္ဒါရှင်းလင်းချက်နဲ့ JLPT mock test တွေကို
            ဖုန်းကနေ နေ့စဉ် ၃၀ မိနစ်စီ လေ့လာနိုင်ပါတယ်။ ဂျပန်မှာ အလုပ်လုပ်ဖို့၊ ပညာသင်ဖို့
            ပြင်ဆင်နေသူတွေအတွက်ပါ။
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 mb-10">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 bg-white text-primary font-bold text-[15px] px-7 py-3.5 rounded-xl hover:bg-green-50 transition-all duration-150 active:scale-95 shadow-lg"
            >
              <Icon name="AcademicCapIcon" size={18} />
              အခမဲ့ စတင်လေ့လာမယ်
            </Link>
            <a
              href="#courses"
              className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/30 text-white font-semibold text-[15px] px-7 py-3.5 rounded-xl hover:bg-white/20 transition-all duration-150 active:scale-95"
            >
              <Icon name="PlayCircleIcon" size={18} />
              သင်တန်းများ ကြည့်မယ်
            </a>
          </div>

          {/* Exam countdown */}
          <div className="inline-flex items-center gap-3 bg-white/10 border border-white/20 rounded-xl px-5 py-3">
            <div className="text-center">
              <p className="text-white font-bold text-2xl tabular-nums leading-none">
                {daysUntilExam ?? '—'}
              </p>
              <p className="text-white/60 text-[11px] mt-0.5">ရက်</p>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div>
              <p className="text-white font-semibold text-[13px]">{examLabel} JLPT စာမေးပွဲအထိ</p>
              <p className="text-white/60 text-[12px]">
                ဇူလိုင်နဲ့ ဒီဇင်ဘာ ပထမ တနင်္ဂနွေနေ့တွင် ကျင်းပပါတယ်
              </p>
            </div>
            <Icon name="CalendarDaysIcon" size={20} className="text-white/60 ml-2" />
          </div>
        </div>
      </div>
      {/* Stats bar */}
      <div className="relative bg-black/20 border-t border-white/10">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats?.map((stat) => (
              <div key={stat?.id} className="text-center">
                <p className="text-white font-bold text-2xl tabular-nums">{stat?.value}</p>
                <p className="text-white/60 text-[13px] mt-0.5">{stat?.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
