'use client';
import React, { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import KanjiWriter, { type WriteResult } from './KanjiWriter';
import { N5_KANJI } from '@/data/kanjiList';
import strokesData from '@/data/kanjiStrokes.json';
import { speak } from '@/lib/speech';

const STROKES = strokesData as Record<string, string[]>;
const STORAGE_KEY = 'na_kanji_best_v1';

export default function KanjiPage() {
  const available = N5_KANJI.filter((k) => STROKES[k.char]?.length);
  const [index, setIndex] = useState(0);
  const [mode, setMode] = useState<'guide' | 'test'>('guide');
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<WriteResult | null>(null);
  const [best, setBest] = useState<Record<string, number>>({});

  useEffect(() => {
    try {
      setBest(JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'));
    } catch {
      /* ignore */
    }
  }, []);

  const kanji = available[index];
  const strokes = STROKES[kanji.char];

  function onComplete(r: WriteResult) {
    setResult(r);
    if (mode === 'test') {
      const next = { ...best, [kanji.char]: Math.min(best[kanji.char] ?? Infinity, r.mistakes) };
      setBest(next);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }
  }

  function go(i: number) {
    setIndex((i + available.length) % available.length);
    setResult(null);
    setAttempt((a) => a + 1);
  }

  const mastered = Object.values(best).filter((m) => m === 0).length;

  return (
    <AppLayout activePath="/kanji">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div>
            <h1 className="text-[22px] font-bold text-foreground">Kanji လက်ရေး လေ့ကျင့်ခန်း</h1>
            <p className="text-[13px] text-muted-foreground">
              ဖုန်း screen ပေါ် လက်နဲ့ ရေးပါ — ရေးနည်းအစဉ်နဲ့ ဦးတည်ရာ မှန်မမှန် စစ်ပေးပါမယ်
            </p>
          </div>
          <span className="text-[12px] font-semibold bg-secondary text-primary px-3 py-1 rounded-full">
            အမှားမရှိ ရေးနိုင်ပြီ {mastered}/{available.length}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => go(index - 1)}
                className="px-3 py-1.5 rounded-lg border border-border text-[13px]"
              >
                ←
              </button>
              <div className="text-center">
                <p className="text-[13px] text-muted-foreground">
                  <span className="font-jp">{kanji.on}</span> ·{' '}
                  <span className="font-jp">{kanji.kun}</span>
                </p>
                <p className="text-[18px] font-bold text-foreground">{kanji.meaning}</p>
              </div>
              <button
                onClick={() => go(index + 1)}
                className="px-3 py-1.5 rounded-lg border border-border text-[13px]"
              >
                →
              </button>
            </div>

            <div className="flex justify-center gap-2 mb-4">
              {(['guide', 'test'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    setMode(m);
                    setResult(null);
                    setAttempt((a) => a + 1);
                  }}
                  className={`text-[13px] px-4 py-1.5 rounded-full border ${
                    mode === m
                      ? 'bg-primary text-white border-primary'
                      : 'border-border text-muted-foreground'
                  }`}
                >
                  {m === 'guide' ? 'လမ်းညွှန်နဲ့ ရေးမယ်' : 'ကိုယ်တိုင် ရေးမယ် (စစ်ဆေး)'}
                </button>
              ))}
            </div>

            <KanjiWriter
              strokes={strokes}
              showGuide={mode === 'guide'}
              onComplete={onComplete}
              resetKey={`${kanji.char}-${mode}-${attempt}`}
            />

            {result && (
              <div className="mt-4 text-center space-y-2 animate-fade-in">
                <p
                  className={`text-[15px] font-bold ${result.mistakes === 0 ? 'text-success' : 'text-warning'}`}
                >
                  {result.mistakes === 0
                    ? '🎉 အမှားမရှိ ရေးနိုင်ပါပြီ!'
                    : `ပြီးပါပြီ — အမှား ${result.mistakes} ခု`}
                </p>
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => {
                      setResult(null);
                      setAttempt((a) => a + 1);
                    }}
                    className="px-4 py-2 rounded-xl border border-border text-[13px]"
                  >
                    ပြန်ရေးမယ်
                  </button>
                  <button
                    onClick={() => go(index + 1)}
                    className="px-4 py-2 rounded-xl bg-primary text-white text-[13px] font-bold"
                  >
                    နောက်တစ်လုံး →
                  </button>
                </div>
              </div>
            )}

            <div className="mt-5 bg-muted/50 rounded-xl p-3 text-[13px] flex items-center justify-between">
              <span>
                <span className="font-jp font-semibold">{kanji.example}</span> — {kanji.exampleMy}
              </span>
              <button onClick={() => speak(kanji.example)} aria-label="နားထောင်မယ်">
                🔊
              </button>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-4">
            <p className="text-[13px] font-semibold mb-3">N5 Kanji</p>
            <div className="grid grid-cols-6 lg:grid-cols-5 gap-2">
              {available.map((k, i) => (
                <button
                  key={k.char}
                  onClick={() => go(i)}
                  className={`aspect-square rounded-xl border text-[20px] font-jp flex items-center justify-center relative ${
                    i === index ? 'border-primary bg-secondary' : 'border-border hover:bg-muted'
                  }`}
                >
                  {k.char}
                  {best[k.char] === 0 && (
                    <span className="absolute top-0.5 right-1 text-[9px] text-success">●</span>
                  )}
                </button>
              ))}
            </div>
            <p className="text-[10.5px] text-muted-foreground mt-4 leading-snug">
              ရေးနည်းအစဉ် data:{' '}
              <a
                href="https://kanjivg.tagaini.net"
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                KanjiVG
              </a>{' '}
              © Ulrich Apel, CC BY-SA 3.0
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
