'use client';
import React, { useState, useCallback, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import FlashcardDeck from './FlashcardDeck';
import FlashcardStats from './FlashcardStats';
import DeckSelector from './DeckSelector';

export type CardDifficulty = 'again' | 'hard' | 'good' | 'easy';

export interface Flashcard {
  id: string;
  front: string;
  reading: string;
  back: string;
  example: string;
  exampleMy: string;
  level: string;
  type: 'vocabulary' | 'kanji' | 'grammar';
  isNew?: boolean;
}

export const cardTypeLabels: Record<Flashcard['type'], string> = {
  vocabulary: 'ဝေါဟာရ',
  kanji: 'Kanji',
  grammar: 'သဒ္ဒါ',
};

export interface DeckSummary {
  id: string;
  label: string;
  level: string;
  type: string;
  count: number;
  due: number;
  dueReview: number;
  newCount: number;
  mastered: number;
  color: string;
  bgColor: string;
}

const levelStyle: Record<string, { color: string; bgColor: string }> = {
  N5: { color: 'text-level-n5', bgColor: 'bg-blue-50 border-blue-200' },
  N4: { color: 'text-level-n4', bgColor: 'bg-green-50 border-green-200' },
  N3: { color: 'text-level-n3', bgColor: 'bg-amber-50 border-amber-200' },
  N2: { color: 'text-level-n2', bgColor: 'bg-orange-50 border-orange-200' },
  N1: { color: 'text-level-n1', bgColor: 'bg-red-50 border-red-200' },
};

type ApiDeck = Omit<DeckSummary, 'color' | 'bgColor'>;

type SessionView = 'overview' | 'studying' | 'results';

export default function FlashcardSession() {
  const [view, setView] = useState<SessionView>('overview');
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
  const [sessionCards, setSessionCards] = useState<Flashcard[]>([]);
  const [sessionResults, setSessionResults] = useState<{
    again: number;
    hard: number;
    good: number;
    easy: number;
  }>({ again: 0, hard: 0, good: 0, easy: 0 });

  const [decks, setDecks] = useState<DeckSummary[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [starting, setStarting] = useState<string | null>(null);

  const loadDecks = useCallback(async () => {
    try {
      const { decks } = await api<{ decks: ApiDeck[] }>('/api/decks');
      setDecks(decks.map((d) => ({ ...d, ...(levelStyle[d.level] ?? levelStyle.N5) })));
      setLoadError(null);
    } catch (err) {
      setLoadError((err as Error).message);
    }
  }, []);

  useEffect(() => {
    loadDecks();
  }, [loadDecks]);

  const allDecks = decks ?? [];
  const totalDue = allDecks.reduce((acc, d) => acc + d.due, 0);

  const handleStartDeck = useCallback(async (deckId: string) => {
    setStarting(deckId);
    try {
      const { cards, mode } = await api<{ cards: Flashcard[]; mode: 'review' | 'practice' }>(
        `/api/decks/${encodeURIComponent(deckId)}/session`
      );
      if (cards.length === 0) {
        toast.info('ဒီ deck မှာ ကတ် မရှိသေးပါ');
        return;
      }
      if (mode === 'practice') toast.info('ပြန်လှန်ရန် မရှိတော့လို့ လေ့ကျင့်ခန်းအဖြစ် ပြပေးပါမယ်');
      setSelectedDeckId(deckId);
      setSessionCards(cards);
      setSessionResults({ again: 0, hard: 0, good: 0, easy: 0 });
      setView('studying');
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setStarting(null);
    }
  }, []);

  const handleSessionComplete = useCallback(
    (results: { again: number; hard: number; good: number; easy: number }) => {
      setSessionResults(results);
      setView('results');
    },
    []
  );

  const handleRestart = useCallback(() => {
    setView('overview');
    setSelectedDeckId(null);
    loadDecks();
  }, [loadDecks]);

  const selectedDeck = allDecks.find((d) => d.id === selectedDeckId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[22px] md:text-[24px] font-bold text-foreground">
            Flashcard ပြန်လှန်ရန်
          </h1>
          <p className="text-[14px] text-muted-foreground mt-1">
            Spaced repetition လေ့ကျင့်ခန်း — ဒီနေ့ ပြန်လှန်ရန် {totalDue} ခု
          </p>
        </div>
        {view === 'overview' && totalDue > 0 && (
          <div className="flex items-center gap-2 bg-danger-bg border border-red-200 rounded-xl px-4 py-2.5">
            <Icon name="ExclamationTriangleIcon" size={16} className="text-danger" />
            <span className="text-[13px] font-bold text-danger">{totalDue} ခု ကျန်</span>
          </div>
        )}
        {view !== 'overview' && (
          <button
            onClick={handleRestart}
            className="flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <Icon name="ArrowLeftIcon" size={15} />
            Deck များသို့
          </button>
        )}
      </div>

      {view === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Deck list */}
          <div className="lg:col-span-2">
            {loadError ? (
              <div className="bg-danger-bg border border-red-200 rounded-2xl p-6 text-center">
                <p className="text-[14px] text-danger font-semibold mb-3">{loadError}</p>
                <button
                  onClick={loadDecks}
                  className="px-4 py-2 bg-primary text-white text-[13px] font-bold rounded-xl"
                >
                  ပြန်စမ်းမယ်
                </button>
              </div>
            ) : decks === null ? (
              <div className="bg-card border border-border rounded-2xl p-6 space-y-3 animate-pulse">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-14 bg-muted rounded-xl" />
                ))}
              </div>
            ) : (
              <DeckSelector decks={allDecks} onStartDeck={handleStartDeck} startingId={starting} />
            )}
          </div>
          {/* Stats panel */}
          <div>
            <FlashcardStats />
          </div>
        </div>
      )}

      {view === 'studying' && selectedDeck && (
        <FlashcardDeck
          deck={selectedDeck}
          cards={sessionCards}
          onComplete={handleSessionComplete}
        />
      )}

      {view === 'results' && selectedDeck && (
        <SessionResults
          deck={selectedDeck}
          results={sessionResults}
          totalCards={sessionCards.length}
          onRestart={handleRestart}
          onStudyAgain={() => handleStartDeck(selectedDeck.id)}
        />
      )}
    </div>
  );
}

interface SessionResultsProps {
  deck: DeckSummary;
  results: { again: number; hard: number; good: number; easy: number };
  totalCards: number;
  onRestart: () => void;
  onStudyAgain: () => void;
}

function SessionResults({
  deck,
  results,
  totalCards,
  onRestart,
  onStudyAgain,
}: SessionResultsProps) {
  const correctCount = results.good + results.easy;
  const accuracy = totalCards > 0 ? Math.round((correctCount / totalCards) * 100) : 0;

  const bars = [
    {
      id: 'res-again',
      label: 'ထပ်ပြ',
      count: results.again,
      color: 'bg-danger',
      textColor: 'text-danger',
    },
    {
      id: 'res-hard',
      label: 'ခက်',
      count: results.hard,
      color: 'bg-warning',
      textColor: 'text-warning',
    },
    {
      id: 'res-good',
      label: 'ရပြီ',
      count: results.good,
      color: 'bg-success',
      textColor: 'text-success',
    },
    {
      id: 'res-easy',
      label: 'လွယ်',
      count: results.easy,
      color: 'bg-primary',
      textColor: 'text-primary',
    },
  ];

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-card border border-border rounded-2xl shadow-card overflow-hidden">
        {/* Top banner */}
        <div className="gradient-primary px-6 py-8 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <Icon name="TrophyIcon" size={32} className="text-white" />
          </div>
          <h2 className="text-[22px] font-bold text-white">ပြီးပါပြီ!</h2>
          <p className="text-[14px] text-white/80 mt-1">
            {deck.label} — {totalCards} ခု ပြန်လှန်ပြီး
          </p>
        </div>

        <div className="p-6 space-y-5">
          {/* Accuracy ring */}
          <div className="flex items-center justify-center gap-4 md:gap-6">
            <div className="text-center">
              <p className="text-[32px] md:text-[42px] font-bold text-foreground tabular-nums">
                {accuracy}%
              </p>
              <p className="text-[12px] text-muted-foreground">မှန်နှုန်း</p>
            </div>
            <div className="h-14 w-px bg-border" />
            <div className="text-center">
              <p className="text-[32px] md:text-[42px] font-bold text-foreground tabular-nums">
                {correctCount}
              </p>
              <p className="text-[12px] text-muted-foreground">မှန်</p>
            </div>
            <div className="h-14 w-px bg-border" />
            <div className="text-center">
              <p className="text-[32px] md:text-[42px] font-bold text-foreground tabular-nums">
                {totalCards}
              </p>
              <p className="text-[12px] text-muted-foreground">စုစုပေါင်း</p>
            </div>
          </div>

          {/* Breakdown bars */}
          <div className="space-y-2">
            {bars.map((bar) => (
              <div key={bar.id} className="flex items-center gap-3">
                <span className={`text-[12px] font-semibold w-12 ${bar.textColor}`}>
                  {bar.label}
                </span>
                <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full progress-bar-fill ${bar.color}`}
                    style={{ width: totalCards > 0 ? `${(bar.count / totalCards) * 100}%` : '0%' }}
                  />
                </div>
                <span className="text-[12px] font-bold text-foreground tabular-nums w-5 text-right">
                  {bar.count}
                </span>
              </div>
            ))}
          </div>

          {/* Next review info */}
          <div className="bg-secondary rounded-xl px-4 py-3 flex items-start gap-3">
            <Icon name="CalendarDaysIcon" size={16} className="text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[13px] font-semibold text-foreground">
                နောက်တစ်ကြိမ် ပြန်လှန်မယ့် အချိန်
              </p>
              <p className="text-[12px] text-muted-foreground mt-0.5">
                &quot;ထပ်ပြ&quot; ကတ်တွေကို မနက်ဖြန်၊ &quot;ရပြီ&quot; ကတ်တွေကို ၇ ရက်နေ၊
                &quot;လွယ်&quot; ကတ်တွေကို ၁၄ ရက်နေမှ ပြန်ပြပါမယ်။
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onStudyAgain}
              className="flex-1 py-2.5 bg-secondary text-primary text-[13.5px] font-bold rounded-xl hover:bg-green-100 transition-colors"
            >
              ထပ်လေ့လာမယ်
            </button>
            <button
              onClick={onRestart}
              className="flex-1 py-2.5 bg-primary text-white text-[13.5px] font-bold rounded-xl hover:bg-accent transition-colors"
            >
              Deck များသို့
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
