'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { speak } from '@/lib/speech';
import { useT } from '@/i18n/LocaleProvider';
import { choicesFor, loadJson, saveJson, shuffle, usePracticeReporter } from './practiceUtils';
import { SPEECH_LANG, type PracticeLang, type WordItem } from './types';

/**
 * Vocabulary practice: a multiple-choice quiz (word → meaning, or meaning → word) that
 * remembers which words the learner already knows, plus a browsable word list with audio.
 */
export default function WordQuiz({
  lang,
  words,
  storageKey,
  frontClass = '',
}: {
  lang: PracticeLang;
  words: WordItem[];
  storageKey: string;
  frontClass?: string;
}) {
  const tr = useT();
  const report = usePracticeReporter(lang);
  const [view, setView] = useState<'quiz' | 'list'>('quiz');
  const [reverse, setReverse] = useState(false);
  const [known, setKnown] = useState<Record<string, number>>({});
  const [order, setOrder] = useState<WordItem[]>([]);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [session, setSession] = useState({ right: 0, total: 0 });

  useEffect(() => {
    const k = loadJson<Record<string, number>>(storageKey, {});
    setKnown(k);
    // Words not yet known first, so practice time goes where it's needed
    setOrder([
      ...shuffle(words.filter((w) => (k[w.id] ?? 0) < 2)),
      ...shuffle(words.filter((w) => (k[w.id] ?? 0) >= 2)),
    ]);
  }, [words, storageKey]);

  const word = order[i % Math.max(order.length, 1)];
  const choices = useMemo(
    () => (word ? choicesFor(word, words, 3, (w) => (reverse ? w.front : w.meaning)) : []),
    [word, words, reverse]
  );
  const knownCount = words.filter((w) => (known[w.id] ?? 0) >= 2).length;

  function answer(w: WordItem) {
    if (picked || !word) return;
    setPicked(w.id);
    const ok = w.id === word.id || (reverse ? w.front === word.front : w.meaning === word.meaning);
    const next = { ...known, [word.id]: ok ? (known[word.id] ?? 0) + 1 : 0 };
    setKnown(next);
    saveJson(storageKey, next);
    setSession((s) => ({ right: s.right + (ok ? 1 : 0), total: s.total + 1 }));
    if (ok) report();
    if (!reverse || ok) speak(word.front, SPEECH_LANG[lang], 0.85);
  }

  function nextWord() {
    setPicked(null);
    setI((n) => n + 1);
  }

  if (!word) return <div className="h-60 bg-muted rounded-2xl animate-pulse" />;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex gap-1.5">
          {(['quiz', 'list'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1.5 rounded-full text-[12.5px] font-semibold ${
                view === v ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground'
              }`}
            >
              {v === 'quiz' ? tr('🎯 Quiz') : tr('📋 စာလုံး စာရင်း')}
            </button>
          ))}
        </div>
        <span className="text-[12px] font-semibold bg-secondary text-primary px-3 py-1 rounded-full">
          {tr('မှတ်မိပြီး')} {knownCount}/{words.length}
        </span>
      </div>

      {view === 'list' ? (
        <div className="grid sm:grid-cols-2 gap-2">
          {words.map((w) => (
            <button
              key={w.id}
              onClick={() => speak(w.front, SPEECH_LANG[lang], 0.85)}
              className="flex items-center gap-3 bg-card border border-border rounded-xl px-3 py-2.5 text-left active:bg-muted"
            >
              <span className={`text-[20px] font-bold min-w-[3.5rem] ${frontClass}`}>
                {w.front}
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-[12px] text-muted-foreground">{w.reading}</span>
                <span className="block text-[13.5px]">{w.meaning}</span>
              </span>
              <span className="text-[13px]">{(known[w.id] ?? 0) >= 2 ? '✅' : '🔊'}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between text-[12px] text-muted-foreground mb-3">
            <button
              onClick={() => {
                setReverse((r) => !r);
                setPicked(null);
              }}
              className="underline"
            >
              {reverse ? tr('↔ စာလုံး → အဓိပ္ပာယ်') : tr('↔ အဓိပ္ပာယ် → စာလုံး')}
            </button>
            <span>{session.total > 0 && `✅ ${session.right}/${session.total}`}</span>
          </div>

          <div className="text-center py-3">
            {reverse ? (
              <p className="text-[22px] font-bold">{word.meaning}</p>
            ) : (
              <>
                <p className={`text-[40px] font-bold leading-tight ${frontClass}`}>{word.front}</p>
                <button
                  onClick={() => speak(word.front, SPEECH_LANG[lang], 0.85)}
                  className="mt-1 text-[13px] text-primary font-semibold"
                >
                  🔊 {tr('နားထောင်မယ်')}
                </button>
              </>
            )}
            {picked && (
              <p className="text-[14px] text-muted-foreground mt-2">
                {word.reading} · {word.meaning}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2">
            {choices.map((c) => {
              const isAnswer = reverse ? c.front === word.front : c.meaning === word.meaning;
              const state = !picked
                ? 'border-border'
                : isAnswer
                  ? 'border-success bg-success-bg'
                  : picked === c.id
                    ? 'border-danger bg-danger-bg'
                    : 'border-border opacity-60';
              return (
                <button
                  key={c.id}
                  onClick={() => answer(c)}
                  className={`min-h-[56px] px-3 py-2 rounded-xl border-2 text-[14px] font-medium ${state} ${
                    reverse ? `text-[20px] ${frontClass}` : ''
                  }`}
                >
                  {reverse ? c.front : c.meaning}
                </button>
              );
            })}
          </div>

          {picked && (
            <button
              onClick={nextWord}
              className="w-full mt-4 py-3 rounded-xl bg-primary text-white font-bold text-[14px]"
            >
              {tr('ရှေ့သို့ →')}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
