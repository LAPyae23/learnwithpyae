'use client';
import React, { useEffect, useState } from 'react';
import { speak } from '@/lib/speech';
import { useT } from '@/i18n/LocaleProvider';
import { MISTAKES, type Mistake } from '@/data/english';
import { loadJson, saveJson, shuffle, usePracticeReporter } from './practiceUtils';

const STORAGE = 'na_en_mistakes_v1';

/** "Which sentence is right?" — the English mistakes Burmese speakers make most. */
export default function MistakesQuiz() {
  const tr = useT();
  const report = usePracticeReporter('en');
  const [order, setOrder] = useState<Mistake[]>([]);
  const [i, setI] = useState(0);
  const [flip, setFlip] = useState(false);
  const [picked, setPicked] = useState<'right' | 'wrong' | null>(null);
  const [mastered, setMastered] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const m = loadJson<Record<string, boolean>>(STORAGE, {});
    setMastered(m);
    setOrder([
      ...shuffle(MISTAKES.filter((x) => !m[x.id])),
      ...shuffle(MISTAKES.filter((x) => m[x.id])),
    ]);
    setFlip(Math.random() < 0.5);
  }, []);

  const q = order[i % Math.max(order.length, 1)];
  if (!q) return <div className="h-60 bg-muted rounded-2xl animate-pulse" />;

  const options: ('right' | 'wrong')[] = flip ? ['wrong', 'right'] : ['right', 'wrong'];
  const done = Object.values(mastered).filter(Boolean).length;

  function pick(o: 'right' | 'wrong') {
    if (picked) return;
    setPicked(o);
    const ok = o === 'right';
    const next = { ...mastered, [q.id]: ok };
    setMastered(next);
    saveJson(STORAGE, next);
    if (ok) report();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[13px] text-muted-foreground">{tr('ဘယ် ဝါကျက မှန်လဲ?')}</p>
        <span className="text-[12px] font-semibold bg-secondary text-primary px-3 py-1 rounded-full">
          {tr('တတ်ပြီး')} {done}/{MISTAKES.length}
        </span>
      </div>
      <div className="space-y-2">
        {options.map((o) => {
          const sentence = o === 'right' ? q.right : q.wrong;
          const state = !picked
            ? 'border-border bg-card'
            : o === 'right'
              ? 'border-success bg-success-bg'
              : o === picked
                ? 'border-danger bg-danger-bg'
                : 'border-danger/40 bg-card';
          return (
            <button
              key={o}
              onClick={() => pick(o)}
              className={`w-full text-left px-4 py-4 rounded-2xl border-2 text-[17px] font-medium ${state}`}
            >
              {picked && (o === 'right' ? '✅ ' : '❌ ')}
              {sentence}
            </button>
          );
        })}
      </div>
      {picked && (
        <div className="mt-3 bg-amber-50 border border-amber-200 rounded-2xl p-4 animate-fade-in">
          <p className="text-[14px] text-amber-900">💡 {q.why}</p>
          <button
            onClick={() => speak(q.right, 'en-US', 0.85)}
            className="mt-2 text-[13px] font-semibold text-primary"
          >
            🔊 {tr('အမှန်ကို နားထောင်မယ်')}
          </button>
        </div>
      )}
      {picked && (
        <button
          onClick={() => {
            setI((n) => n + 1);
            setPicked(null);
            setFlip(Math.random() < 0.5);
          }}
          className="w-full mt-3 py-3 rounded-xl bg-primary text-white font-bold text-[14px]"
        >
          {tr('ရှေ့သို့ →')}
        </button>
      )}
    </div>
  );
}
