'use client';
import React, { useState, useCallback } from 'react';
import Icon from '@/components/ui/AppIcon';
import { toast } from 'sonner';
import { submitReview } from '@/lib/offlineQueue';
import { cardTypeLabels, type Flashcard, type CardDifficulty } from './FlashcardSession';

interface FlashcardDeckProps {
  deck: {
    id: string;
    label: string;
    level: string;
    type: string;
    count: number;
    due: number;
    color: string;
    bgColor: string;
  };
  cards: Flashcard[];
  onComplete: (results: { again: number; hard: number; good: number; easy: number }) => void;
}

export default function FlashcardDeck({ deck, cards, onComplete }: FlashcardDeckProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [results, setResults] = useState<{
    again: number;
    hard: number;
    good: number;
    easy: number;
  }>({ again: 0, hard: 0, good: 0, easy: 0 });
  const [isAnimating, setIsAnimating] = useState(false);

  const currentCard = cards[currentIndex];
  const progress = cards.length > 0 ? (currentIndex / cards.length) * 100 : 0;
  const remaining = cards.length - currentIndex;

  const handleFlip = useCallback(() => {
    if (!isAnimating) setIsFlipped((prev) => !prev);
  }, [isAnimating]);

  const handleAnswer = useCallback(
    (difficulty: CardDifficulty) => {
      if (isAnimating) return;
      setIsAnimating(true);

      setResults((prev) => ({ ...prev, [difficulty]: prev[difficulty] + 1 }));

      // Save in the background; the next card shows immediately even on a slow connection.
      submitReview(cards[currentIndex].id, difficulty).catch((err) =>
        toast.error(`မှတ်တမ်း မသိမ်းနိုင်ပါ — ${(err as Error).message}`)
      );

      setTimeout(() => {
        setIsFlipped(false);
        setTimeout(() => {
          if (currentIndex + 1 >= cards.length) {
            const finalResults = { ...results, [difficulty]: results[difficulty] + 1 };
            onComplete(finalResults);
          } else {
            setCurrentIndex((prev) => prev + 1);
          }
          setIsAnimating(false);
        }, 200);
      }, 150);
    },
    [isAnimating, currentIndex, cards.length, results, onComplete]
  );

  if (!currentCard) return null;

  const difficultyButtons: {
    id: string;
    label: CardDifficulty;
    display: string;
    sub: string;
    style: string;
  }[] = [
    {
      id: 'btn-again',
      label: 'again',
      display: 'ထပ်ပြ',
      sub: '<၁ မိနစ်',
      style: 'bg-danger-bg border border-red-200 text-danger hover:bg-red-100',
    },
    {
      id: 'btn-hard',
      label: 'hard',
      display: 'ခက်',
      sub: '၃ ရက်',
      style: 'bg-warning-bg border border-amber-200 text-warning hover:bg-amber-100',
    },
    {
      id: 'btn-good',
      label: 'good',
      display: 'ရပြီ',
      sub: '၇ ရက်',
      style: 'bg-success-bg border border-green-200 text-success hover:bg-green-100',
    },
    {
      id: 'btn-easy',
      label: 'easy',
      display: 'လွယ်',
      sub: '၁၄ ရက်',
      style: 'bg-secondary border border-primary/20 text-primary hover:bg-green-100',
    },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Progress bar + meta */}
      <div className="bg-card border border-border rounded-2xl px-5 py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${deck.bgColor} ${deck.color}`}
            >
              {deck.level}
            </span>
            <span className="text-[13px] font-semibold text-foreground">{deck.label}</span>
          </div>
          <span className="text-[13px] text-muted-foreground tabular-nums">
            {currentIndex + 1} / {cards.length}
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full progress-bar-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-[11px] text-muted-foreground">{remaining} ခု ကျန်</span>
          <div className="flex items-center gap-2 md:gap-3 text-[11px]">
            <span className="text-danger font-semibold">ထပ် {results.again}</span>
            <span className="text-warning font-semibold">ခက် {results.hard}</span>
            <span className="text-success font-semibold">ရ {results.good}</span>
            <span className="text-primary font-semibold">လွယ် {results.easy}</span>
          </div>
        </div>
      </div>

      {/* Flashcard */}
      <div
        className="flashcard-flip cursor-pointer select-none"
        onClick={handleFlip}
        style={{ minHeight: 280 }}
      >
        <div
          className={`flashcard-inner relative ${isFlipped ? 'flipped' : ''}`}
          style={{ minHeight: 280 }}
        >
          {/* Front */}
          <div className="flashcard-face absolute inset-0 bg-gradient-to-br from-secondary to-green-50 border border-primary/20 rounded-2xl shadow-card flex flex-col items-center justify-center p-8">
            <div className="flex items-center gap-2 mb-4">
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${deck.bgColor} ${deck.color}`}
              >
                {deck.level}
              </span>
              <span className="text-[11px] font-semibold text-muted-foreground">
                {cardTypeLabels[currentCard.type]}
              </span>
            </div>
            <p className="text-[44px] md:text-[56px] font-bold text-foreground leading-none mb-3 text-center font-jp">
              {currentCard.front}
            </p>
            <p className="text-[18px] text-muted-foreground mb-6 font-jp">{currentCard.reading}</p>
            <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground bg-white/60 rounded-full px-3 py-1.5">
              <Icon name="ArrowsRightLeftIcon" size={13} />
              <span>နှိပ်ပြီး အဓိပ္ပာယ် ကြည့်ပါ</span>
            </div>
          </div>

          {/* Back */}
          <div className="flashcard-face flashcard-back absolute inset-0 bg-gradient-to-br from-card to-green-50/40 border border-primary/20 rounded-2xl shadow-card flex flex-col items-center justify-center p-8">
            <span className="text-[11px] font-semibold text-muted-foreground mb-3">အဓိပ္ပာယ်</span>
            <p className="text-[24px] font-bold text-foreground text-center mb-2 leading-snug">
              {currentCard.back}
            </p>
            <p className="text-[14px] text-muted-foreground mb-6 font-jp">{currentCard.reading}</p>
            <div className="w-full bg-white/70 border border-border rounded-xl px-4 py-3 text-center max-w-sm">
              <p className="text-[15px] text-foreground font-medium leading-relaxed font-jp">
                {currentCard.example}
              </p>
              <p className="text-[13px] text-muted-foreground mt-1.5">{currentCard.exampleMy}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Answer buttons — only shown when flipped */}
      <div
        className={`transition-all duration-300 ${isFlipped ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}
      >
        <p className="text-[11px] font-semibold text-center text-muted-foreground mb-3">
          ဘယ်လောက် မှတ်မိလဲ?
        </p>
        <div className="grid grid-cols-4 gap-2 md:gap-3">
          {difficultyButtons.map((btn) => (
            <button
              key={btn.id}
              onClick={(e) => {
                e.stopPropagation();
                handleAnswer(btn.label);
              }}
              className={`rounded-xl py-3 text-center transition-all duration-150 active:scale-95 ${btn.style}`}
            >
              <p className="text-[13px] font-bold">{btn.display}</p>
              <p className="text-[10px] opacity-70 mt-0.5">{btn.sub}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Keyboard hint */}
      {!isFlipped && (
        <p className="text-center text-[12px] text-muted-foreground animate-fade-in">
          ကတ်ကို နှိပ်ပြီး လှန်ပါ
        </p>
      )}
    </div>
  );
}
