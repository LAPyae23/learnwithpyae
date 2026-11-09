'use client';
import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface Deck {
  id: string;
  label: string;
  level: string;
  type: string;
  count: number;
  due: number;
  color: string;
  bgColor: string;
}

interface DeckSelectorProps {
  decks: Deck[];
  onStartDeck: (deckId: string) => void;
  startingId?: string | null;
}

const typeIcons: Record<string, string> = {
  vocabulary: 'BookOpenIcon',
  kanji: 'PencilSquareIcon',
  grammar: 'LanguageIcon',
};

export default function DeckSelector({ decks, onStartDeck, startingId }: DeckSelectorProps) {
  return (
    <div className="bg-card border border-border rounded-2xl shadow-card overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <h2 className="text-[16px] font-bold text-foreground">ကျွန်ုပ်၏ Deck များ</h2>
        <p className="text-[12px] text-muted-foreground mt-0.5">ပြန်လှန်ချင်တဲ့ deck ကို ရွေးပါ</p>
      </div>
      <div className="divide-y divide-border">
        {decks.map((deck) => {
          const hasDue = deck.due > 0;
          return (
            <div
              key={deck.id}
              className="flex items-center gap-4 px-4 md:px-5 py-4 hover:bg-muted/40 transition-colors group"
            >
              {/* Icon */}
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${deck.bgColor}`}
              >
                <Icon
                  name={typeIcons[deck.type] as Parameters<typeof Icon>[0]['name']}
                  size={18}
                  className={deck.color}
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[14px] font-semibold text-foreground">{deck.label}</span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${deck.bgColor} ${deck.color}`}
                  >
                    {deck.level}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[12px] text-muted-foreground">
                    စုစုပေါင်း {deck.count} ခု
                  </span>
                  {hasDue ? (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-danger">
                      <span className="w-1.5 h-1.5 bg-danger rounded-full animate-pulse" />
                      {deck.due} ခု ကျန်
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-success">
                      <Icon name="CheckCircleIcon" size={12} className="text-success" />
                      ပြီးပါပြီ
                    </span>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              <div className="hidden sm:block w-24">
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{
                      width: hasDue
                        ? `${Math.max(10, 100 - (deck.due / deck.count) * 100)}%`
                        : '100%',
                    }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1 text-right">
                  {hasDue ? `${Math.round(100 - (deck.due / deck.count) * 100)}%` : '100%'}
                </p>
              </div>

              {/* CTA */}
              <button
                onClick={() => onStartDeck(deck.id)}
                disabled={!!startingId}
                className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12.5px] font-bold transition-all duration-150 active:scale-95 ${
                  hasDue
                    ? 'bg-primary text-white hover:bg-accent'
                    : 'bg-secondary text-primary hover:bg-green-100'
                }`}
              >
                <Icon
                  name={startingId === deck.id ? 'ArrowPathIcon' : 'PlayIcon'}
                  size={13}
                  className={startingId === deck.id ? 'animate-spin' : ''}
                />
                {hasDue ? 'ပြန်လှန်' : 'လေ့ကျင့်'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
