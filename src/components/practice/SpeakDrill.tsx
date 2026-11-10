'use client';
import React, { useEffect, useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import { speak, useSpeechRecognition } from '@/lib/speech';
import { useT } from '@/i18n/LocaleProvider';
import { loadJson, saveJson, speechScore, usePracticeReporter } from './practiceUtils';
import { SPEECH_LANG, type DrillItem, type DrillTip, type PracticeLang } from './types';

/** Listen → repeat → score, with a tip for the sound Burmese speakers usually miss. */
export default function SpeakDrill({
  lang,
  items,
  tips,
  storageKey,
  textClass = '',
}: {
  lang: PracticeLang;
  items: DrillItem[];
  tips: Record<string, DrillTip>;
  storageKey: string;
  textClass?: string;
}) {
  const tr = useT();
  const report = usePracticeReporter(lang);
  const [filter, setFilter] = useState<string>('all');
  const [index, setIndex] = useState(0);
  const [heard, setHeard] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [best, setBest] = useState<Record<string, number>>({});

  const tipKeys = Array.from(new Set(items.map((p) => p.tip)));
  const list = filter === 'all' ? items : items.filter((p) => p.tip === filter);
  const item = list[Math.min(index, list.length - 1)];
  const tip = tips[item.tip];

  useEffect(() => setBest(loadJson(storageKey, {})), [storageKey]);

  const mic = useSpeechRecognition(SPEECH_LANG[lang], (transcript) => {
    const s = speechScore(transcript, item.text, lang);
    setHeard(transcript);
    setScore(s);
    if (s >= 70 && (best[item.id] ?? 0) < 70) report(2);
    const next = { ...best, [item.id]: Math.max(best[item.id] ?? 0, s) };
    setBest(next);
    saveJson(storageKey, next);
  });

  function go(i: number) {
    setIndex((i + list.length) % list.length);
    setHeard(null);
    setScore(null);
  }

  const scores = Object.values(best);
  const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {['all', ...tipKeys].map((k) => (
          <button
            key={k}
            onClick={() => {
              setFilter(k);
              setIndex(0);
              setHeard(null);
              setScore(null);
            }}
            className={`text-[12.5px] px-3 py-1.5 rounded-full border ${
              filter === k
                ? 'bg-primary text-white border-primary'
                : 'border-border text-muted-foreground'
            }`}
          >
            {k === 'all' ? tr('အားလုံး') : tips[k]?.title}
          </button>
        ))}
        {avg !== null && (
          <span className="ml-auto text-[12px] font-semibold bg-secondary text-primary px-3 py-1 rounded-full">
            {tr('ပျမ်းမျှ')} {avg}%
          </span>
        )}
      </div>

      <div className="bg-card border border-border rounded-2xl p-5 text-center">
        <p className="text-[12px] text-muted-foreground mb-2">
          {index + 1} / {list.length}
          {best[item.id] !== undefined && ` · ${tr('အကောင်းဆုံး')} ${best[item.id]}%`}
        </p>
        <p className={`text-[30px] font-bold text-foreground leading-tight ${textClass}`}>
          {item.text}
        </p>
        {item.roman && (
          <p className="text-[14px] text-muted-foreground italic mt-1">{item.roman}</p>
        )}
        <p className="text-[15px] text-foreground mt-1">{item.meaning}</p>

        <div className="flex justify-center gap-3 mt-5">
          <button
            onClick={() => speak(item.text, SPEECH_LANG[lang], 0.8)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-border text-[14px] font-semibold"
          >
            🔊 {tr('နားထောင်မယ်')}
          </button>
          <button
            onClick={mic.listening ? mic.stop : mic.start}
            disabled={!mic.supported}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-[14px] font-bold text-white disabled:opacity-40 ${
              mic.listening ? 'bg-danger animate-pulse' : 'bg-primary'
            }`}
          >
            <Icon name="MicrophoneIcon" size={18} />
            {mic.listening ? tr('နားထောင်နေ…') : tr('ပြောမယ်')}
          </button>
        </div>

        {mic.listening && mic.interim && (
          <p className={`mt-3 text-[15px] text-muted-foreground ${textClass}`}>{mic.interim}</p>
        )}
        {mic.error && <p className="mt-3 text-[13px] text-danger">{mic.error}</p>}
        {!mic.supported && (
          <p className="mt-3 text-[13px] text-muted-foreground">
            {tr('ဒီ browser မှာ အသံ မှတ်မိခြင်း မရပါ။ Android/Desktop Chrome ကို သုံးပါ။')}
          </p>
        )}

        {score !== null && heard !== null && (
          <div className="mt-4 animate-fade-in">
            <p
              className={`text-[42px] font-bold tabular-nums ${
                score >= 85 ? 'text-success' : score >= 60 ? 'text-warning' : 'text-danger'
              }`}
            >
              {score}%
            </p>
            <p className="text-[13px] text-muted-foreground">
              {tr('ကြားရတာ')}: <span className={`text-foreground ${textClass}`}>「{heard}」</span>
            </p>
            <p className="text-[14px] mt-1">
              {score >= 85
                ? tr('🎉 အရမ်းကောင်းပါတယ်!')
                : score >= 60
                  ? tr('နီးပါပြီ — ထပ်ကြိုးစားကြည့်ပါ')
                  : tr('ထပ်နားထောင်ပြီး နှေးနှေး ပြန်ပြောကြည့်ပါ')}
            </p>
          </div>
        )}

        {tip && (score === null || score < 85) && (
          <div className="mt-4 text-left bg-amber-50 border border-amber-200 rounded-xl p-3">
            <p className="text-[13px] font-semibold text-amber-800">💡 {tip.title}</p>
            <p className="text-[13px] text-amber-700 mt-0.5">{tip.tip}</p>
          </div>
        )}

        <div className="flex justify-between mt-5">
          <button
            onClick={() => go(index - 1)}
            className="px-4 py-2 rounded-xl border border-border text-[13px]"
          >
            {tr('← နောက်သို့')}
          </button>
          <button
            onClick={() => go(index + 1)}
            className="px-4 py-2 rounded-xl bg-primary text-white text-[13px] font-bold"
          >
            {tr('ရှေ့သို့ →')}
          </button>
        </div>
      </div>
      <p className="text-[11px] text-muted-foreground text-center mt-3">
        {tr(
          'အမှတ်က browser ရဲ့ အသံ မှတ်မိမှုပေါ် အခြေခံတဲ့ ခန့်မှန်းချက်ပါ။ တိတ်ဆိတ်တဲ့ နေရာမှာ လေ့ကျင့်ပါ။'
        )}
      </p>
    </div>
  );
}
