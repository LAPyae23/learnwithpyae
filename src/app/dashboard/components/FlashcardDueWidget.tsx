'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

const dueSections = [
  {
    id: 'due-vocab',
    label: 'ဝေါဟာရ',
    count: 14,
    color: 'text-primary',
    bg: 'bg-secondary',
    icon: 'BookOpenIcon',
  },
  {
    id: 'due-kanji',
    label: 'Kanji',
    count: 7,
    color: 'text-level-n2',
    bg: 'bg-orange-50',
    icon: 'PencilSquareIcon',
  },
  {
    id: 'due-grammar',
    label: 'သဒ္ဒါ',
    count: 3,
    color: 'text-level-n3',
    bg: 'bg-amber-50',
    icon: 'LanguageIcon',
  },
];

const sampleCard = {
  front: '友達',
  reading: 'ともだち',
  back: 'သူငယ်ချင်း',
  example: '友達と映画を見ます。',
  exampleMy: 'သူငယ်ချင်းနဲ့ ရုပ်ရှင်ကြည့်ပါတယ်။',
  level: 'N5',
  interval: 'ဒီနေ့',
};

export default function FlashcardDueWidget() {
  const [isFlipped, setIsFlipped] = useState(false);
  const [cardIndex, setCardIndex] = useState(0);

  const totalDue = dueSections?.reduce((acc, s) => acc + s?.count, 0);

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => setCardIndex((prev) => prev + 1), 150);
  };

  return (
    <div className="bg-card border border-border rounded-2xl shadow-card overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="font-bold text-[15px] text-foreground">Flashcard ပြန်လှန်ရန်</h3>
          <p className="text-[12px] text-muted-foreground mt-0.5">
            ဒီနေ့ {totalDue} ခု ပြန်လှန်ရန်
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-danger-bg border border-red-200 rounded-lg px-2.5 py-1.5">
          <Icon name="ExclamationTriangleIcon" size={13} className="text-danger" />
          <span className="text-[12px] font-bold text-danger">{totalDue} ခု</span>
        </div>
      </div>
      {/* Due breakdown */}
      <div className="flex gap-2 px-5 py-3 border-b border-border">
        {dueSections?.map((s) => (
          <div key={s?.id} className={`flex-1 ${s?.bg} rounded-xl px-2 py-2 text-center`}>
            <p className={`font-bold text-[16px] tabular-nums ${s?.color}`}>{s?.count}</p>
            <p className="text-[10px] text-muted-foreground">{s?.label}</p>
          </div>
        ))}
      </div>
      {/* Sample flashcard */}
      <div className="flex-1 px-5 py-4">
        <p className="text-[11px] font-semibold text-muted-foreground mb-3">
          နမူနာ ကတ် #{cardIndex + 1}
        </p>

        {/* Flashcard flip area */}
        <div
          className="flashcard-flip cursor-pointer mb-4"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <div
            className={`flashcard-inner relative ${isFlipped ? 'flipped' : ''}`}
            style={{ minHeight: 140 }}
          >
            {/* Front */}
            <div className="flashcard-face absolute inset-0 bg-gradient-to-br from-secondary to-green-50 border border-primary/20 rounded-2xl flex flex-col items-center justify-center p-4">
              <span className="text-[11px] font-semibold text-muted-foreground mb-2">ဝေါဟာရ</span>
              <p className="text-[40px] font-bold text-foreground leading-none mb-1 font-jp">
                {sampleCard?.front}
              </p>
              <p className="text-[14px] text-muted-foreground font-jp">{sampleCard?.reading}</p>
              <div className="mt-3 flex items-center gap-1 text-[11px] text-muted-foreground">
                <Icon name="ArrowsRightLeftIcon" size={12} />
                <span>နှိပ်ပြီး အဖြေကြည့်ပါ</span>
              </div>
            </div>

            {/* Back */}
            <div className="flashcard-face flashcard-back absolute inset-0 bg-gradient-to-br from-primary/5 to-green-50 border border-primary/20 rounded-2xl flex flex-col items-center justify-center p-4">
              <span className="text-[11px] font-semibold text-muted-foreground mb-2">
                အဓိပ္ပာယ်
              </span>
              <p className="text-[18px] font-bold text-foreground text-center mb-3">
                {sampleCard?.back}
              </p>
              <div className="bg-white/60 rounded-xl px-3 py-2 text-center">
                <p className="text-[13px] text-foreground font-medium font-jp">
                  {sampleCard?.example}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{sampleCard?.exampleMy}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Answer buttons */}
        {isFlipped && (
          <div className="grid grid-cols-3 gap-2 mb-4 animate-fade-in">
            {[
              {
                id: 'ans-again',
                label: 'ထပ်ပြ',
                color: 'bg-danger-bg border-red-200 text-danger',
                sub: '<၁ မိနစ်',
              },
              {
                id: 'ans-hard',
                label: 'ခက်',
                color: 'bg-warning-bg border-amber-200 text-warning',
                sub: '၃ ရက်',
              },
              {
                id: 'ans-good',
                label: 'ရပြီ',
                color: 'bg-success-bg border-green-200 text-success',
                sub: '၇ ရက်',
              },
            ]?.map((btn) => (
              <button
                key={btn?.id}
                onClick={handleNext}
                className={`border rounded-xl py-2 text-center transition-all duration-150 active:scale-95 ${btn?.color}`}
              >
                <p className="text-[12px] font-bold">{btn?.label}</p>
                <p className="text-[10px] opacity-70">{btn?.sub}</p>
              </button>
            ))}
          </div>
        )}
      </div>
      {/* CTA */}
      <div className="px-5 pb-5">
        <Link
          href="/flashcards"
          className="block text-center w-full py-2.5 bg-primary text-white text-[13.5px] font-bold rounded-xl hover:bg-accent transition-colors active:scale-95"
        >
          ပြန်လှန်မှု အပြည့် စမယ်
        </Link>
      </div>
    </div>
  );
}
