'use client';
import React, { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Icon from '@/components/ui/AppIcon';
import { PHRASES, TRAP_TIPS, type Trap } from '@/data/speakPhrases';
import { scorePronunciation } from '@/lib/pronunciation';
import { speak, useSpeechRecognition } from '@/lib/speech';

const STORAGE_KEY = 'na_speak_best_v1';
const TRAP_FILTERS: (Trap | 'all')[] = ['all', 'tsu', 'long', 'small-tsu', 'r', 'z', 'n'];

export default function SpeakPage() {
  const [filter, setFilter] = useState<Trap | 'all'>('all');
  const [index, setIndex] = useState(0);
  const [heard, setHeard] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [best, setBest] = useState<Record<string, number>>({});

  const list = filter === 'all' ? PHRASES : PHRASES.filter((p) => p.trap === filter);
  const phrase = list[Math.min(index, list.length - 1)];

  useEffect(() => {
    try {
      setBest(JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'));
    } catch {
      /* ignore */
    }
  }, []);

  const mic = useSpeechRecognition('ja-JP', (transcript, confidence) => {
    const { score } = scorePronunciation(transcript, [phrase.text, phrase.kana], confidence);
    setHeard(transcript);
    setScore(score);
    const next = { ...best, [phrase.id]: Math.max(best[phrase.id] ?? 0, score) };
    setBest(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  });

  function go(i: number) {
    setIndex((i + list.length) % list.length);
    setHeard(null);
    setScore(null);
  }

  const tip = TRAP_TIPS[phrase.trap];
  const avg = Object.values(best).length
    ? Math.round(Object.values(best).reduce((a, b) => a + b, 0) / Object.values(best).length)
    : null;

  return (
    <AppLayout activePath="/speak">
      <div className="max-w-2xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div>
            <h1 className="text-[22px] font-bold text-foreground">အသံထွက် လေ့ကျင့်ခန်း</h1>
            <p className="text-[13px] text-muted-foreground">
              နားထောင်ပြီး ပြန်ပြောပါ — မြန်မာလူမျိုးတွေ မှားလေ့ရှိတဲ့ အသံတွေကို အထူး
              လေ့ကျင့်ပေးပါမယ်
            </p>
          </div>
          {avg !== null && (
            <span className="text-[12px] font-semibold bg-secondary text-primary px-3 py-1 rounded-full">
              ပျမ်းမျှ {avg}%
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {TRAP_FILTERS.map((t) => (
            <button
              key={t}
              onClick={() => {
                setFilter(t);
                setIndex(0);
                setHeard(null);
                setScore(null);
              }}
              className={`text-[12.5px] px-3 py-1.5 rounded-full border ${
                filter === t
                  ? 'bg-primary text-white border-primary'
                  : 'border-border text-muted-foreground'
              }`}
            >
              {t === 'all' ? 'အားလုံး' : TRAP_TIPS[t].title}
            </button>
          ))}
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 text-center">
          <p className="text-[12px] text-muted-foreground mb-2">
            {index + 1} / {list.length}
            {best[phrase.id] !== undefined && ` · အကောင်းဆုံး ${best[phrase.id]}%`}
          </p>
          <p className="text-[34px] font-bold text-foreground font-jp leading-tight">
            {phrase.text}
          </p>
          {phrase.text !== phrase.kana && (
            <p className="text-[16px] text-muted-foreground font-jp">{phrase.kana}</p>
          )}
          <p className="text-[13px] text-muted-foreground italic">{phrase.romaji}</p>
          <p className="text-[15px] text-foreground mt-1">{phrase.meaning}</p>

          <div className="flex justify-center gap-3 mt-6">
            <button
              onClick={() => speak(phrase.text, 'ja-JP', 0.8)}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-border text-[14px] font-semibold"
            >
              🔊 နားထောင်မယ်
            </button>
            <button
              onClick={mic.listening ? mic.stop : mic.start}
              disabled={!mic.supported}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-[14px] font-bold text-white disabled:opacity-40 ${
                mic.listening ? 'bg-danger animate-pulse' : 'bg-primary'
              }`}
            >
              <Icon name="MicrophoneIcon" size={18} />
              {mic.listening ? 'နားထောင်နေ…' : 'ပြောမယ်'}
            </button>
          </div>

          {mic.listening && mic.interim && (
            <p className="mt-3 text-[15px] text-muted-foreground font-jp">{mic.interim}</p>
          )}
          {mic.error && <p className="mt-3 text-[13px] text-danger">{mic.error}</p>}
          {!mic.supported && (
            <p className="mt-3 text-[13px] text-muted-foreground">
              ဒီ browser မှာ အသံ မှတ်မိခြင်း မရပါ။ Android/Desktop Chrome ကို သုံးပါ။
            </p>
          )}

          {score !== null && heard !== null && (
            <div className="mt-5 animate-fade-in">
              <p
                className={`text-[44px] font-bold tabular-nums ${
                  score >= 85 ? 'text-success' : score >= 60 ? 'text-warning' : 'text-danger'
                }`}
              >
                {score}%
              </p>
              <p className="text-[13px] text-muted-foreground">
                ကြားရတာ: <span className="font-jp text-foreground">「{heard}」</span>
              </p>
              <p className="text-[14px] mt-1">
                {score >= 85
                  ? '🎉 အရမ်းကောင်းပါတယ်!'
                  : score >= 60
                    ? 'နီးပါပြီ — ထပ်ကြိုးစားကြည့်ပါ'
                    : 'ထပ်နားထောင်ပြီး နှေးနှေး ပြန်ပြောကြည့်ပါ'}
              </p>
            </div>
          )}

          {(score === null || score < 85) && (
            <div className="mt-5 text-left bg-amber-50 border border-amber-200 rounded-xl p-3">
              <p className="text-[13px] font-semibold text-amber-800">💡 {tip.title}</p>
              <p className="text-[13px] text-amber-700 mt-0.5">{tip.tip}</p>
            </div>
          )}

          <div className="flex justify-between mt-6">
            <button
              onClick={() => go(index - 1)}
              className="px-4 py-2 rounded-xl border border-border text-[13px]"
            >
              ← နောက်သို့
            </button>
            <button
              onClick={() => go(index + 1)}
              className="px-4 py-2 rounded-xl bg-primary text-white text-[13px] font-bold"
            >
              ရှေ့သို့ →
            </button>
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground text-center mt-3">
          အမှတ်က browser ရဲ့ အသံ မှတ်မိမှုပေါ် အခြေခံတဲ့ ခန့်မှန်းချက်ပါ။ တိတ်ဆိတ်တဲ့ နေရာမှာ
          လေ့ကျင့်ပါ။
        </p>
      </div>
    </AppLayout>
  );
}
