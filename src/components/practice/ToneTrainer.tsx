'use client';
import React, { useState } from 'react';
import { speak } from '@/lib/speech';
import { useT } from '@/i18n/LocaleProvider';
import { TONE_GROUPS, TONES, type Tone, type ToneChar } from '@/data/chinese';
import { usePracticeReporter } from './practiceUtils';

const say = (s: string) => speak(s, 'zh-CN', 0.7);
const ALL_CHARS = TONE_GROUPS.flatMap((g) => g.chars);

function Contour({ tone, className = '' }: { tone: Tone; className?: string }) {
  return (
    <svg viewBox="0 0 40 32" className={className} aria-hidden>
      <path
        d={TONES[tone].contour}
        fill="none"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Mandarin tones: hear the same syllable in four tones, then pick the tone you hear. */
export default function ToneTrainer() {
  const tr = useT();
  const [view, setView] = useState<'learn' | 'quiz'>('learn');
  return (
    <div>
      <div className="flex gap-1.5 mb-3">
        {(
          [
            ['learn', '👂 tone ၄ မျိုး'],
            ['quiz', '🎯 ဘယ် tone လဲ?'],
          ] as const
        ).map(([v, l]) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`px-3 py-1.5 rounded-full text-[12.5px] font-semibold ${
              view === v ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground'
            }`}
          >
            {tr(l)}
          </button>
        ))}
      </div>
      {view === 'learn' ? <Learn /> : <Quiz />}
    </div>
  );
}

function Learn() {
  const tr = useT();
  const [g, setG] = useState(0);
  const group = TONE_GROUPS[g];
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {([1, 2, 3, 4] as Tone[]).map((t) => (
          <div key={t} className="bg-card border border-border rounded-xl p-3">
            <div className="flex items-center gap-2">
              <Contour tone={t} className="w-10 h-8 text-primary" />
              <p className="font-bold text-[13.5px]">
                {t}. {tr(TONES[t].name)} {TONES[t].mark}
              </p>
            </div>
            <p className="text-[12px] text-muted-foreground mt-1">{TONES[t].my}</p>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-2xl p-4">
        <div className="flex gap-1.5 overflow-x-auto pb-2">
          {TONE_GROUPS.map((x, i) => (
            <button
              key={x.base}
              onClick={() => setG(i)}
              className={`px-3 py-1 rounded-full border text-[13px] font-semibold ${
                g === i ? 'bg-primary text-white border-primary' : 'border-border'
              }`}
            >
              {x.base}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-4 gap-2 mt-2">
          {group.chars.map((c) => (
            <button
              key={c.hanzi}
              onClick={() => say(c.hanzi)}
              className="rounded-xl border border-border py-3 active:bg-muted"
            >
              <Contour tone={c.tone} className="w-8 h-6 mx-auto text-primary" />
              <span className="block text-[30px] font-bold leading-tight">{c.hanzi}</span>
              <span className="block text-[15px] font-semibold text-primary">{c.pinyin}</span>
              <span className="block text-[11.5px] text-muted-foreground">{c.my}</span>
            </button>
          ))}
        </div>
        <button
          onClick={() => {
            group.chars.forEach((c, i) => setTimeout(() => say(c.hanzi), i * 1100));
          }}
          className="w-full mt-3 py-2.5 rounded-xl border border-border text-[13.5px] font-semibold"
        >
          🔊 {tr('၄ လုံးလုံး ဆက်တိုက် နားထောင်မယ်')}
        </button>
      </div>
      <p className="text-[12px] text-muted-foreground">
        {tr(
          '💡 မြန်မာ စကားမှာလည်း အသံ (tone) ရှိလို့ မြန်မာတွေ တရုတ် tone ကို မြန်မြန် တတ်ကြပါတယ်။ ma (မ) ကို "မာ / မား / မ" လို မထင်ပါနဲ့ — တရုတ် tone က အသံ တက်/ကျ ပုံ (မျဉ်းကွေး) ပါ။'
        )}
      </p>
    </div>
  );
}

function pickChar(): ToneChar {
  return ALL_CHARS[Math.floor(Math.random() * ALL_CHARS.length)];
}

function Quiz() {
  const tr = useT();
  const report = usePracticeReporter('zh');
  const [c, setC] = useState<ToneChar>(() => pickChar());
  const [picked, setPicked] = useState<Tone | null>(null);
  const [score, setScore] = useState({ right: 0, total: 0, streak: 0 });

  function pick(t: Tone) {
    if (picked) return;
    setPicked(t);
    const ok = t === c.tone;
    setScore((s) => ({
      right: s.right + (ok ? 1 : 0),
      total: s.total + 1,
      streak: ok ? s.streak + 1 : 0,
    }));
    if (ok) report();
  }

  function next() {
    const n = pickChar();
    setC(n);
    setPicked(null);
    say(n.hanzi);
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-5 text-center">
      <p className="text-[12px] text-muted-foreground">
        {score.total > 0
          ? `✅ ${score.right}/${score.total}${score.streak >= 3 ? ` · 🔥 ${score.streak}` : ''}`
          : tr('အသံကို နားထောင်ပြီး tone ကို ရွေးပါ')}
      </p>
      <button
        onClick={() => say(c.hanzi)}
        className="my-4 w-24 h-24 rounded-full bg-primary text-white text-[40px] shadow-lg active:scale-95"
        aria-label={tr('နားထောင်မယ်')}
      >
        🔊
      </button>
      {picked && (
        <div className="mb-3 animate-fade-in">
          <p className="text-[44px] font-bold leading-tight">{c.hanzi}</p>
          <p className="text-[18px] font-semibold text-primary">{c.pinyin}</p>
          <p className="text-[13px] text-muted-foreground">{c.my}</p>
        </div>
      )}
      <div className="grid grid-cols-4 gap-2">
        {([1, 2, 3, 4] as Tone[]).map((t) => (
          <button
            key={t}
            onClick={() => pick(t)}
            className={`py-3 rounded-xl border-2 ${
              !picked
                ? 'border-border'
                : t === c.tone
                  ? 'border-success bg-success-bg'
                  : t === picked
                    ? 'border-danger bg-danger-bg'
                    : 'border-border opacity-60'
            }`}
          >
            <Contour tone={t} className="w-9 h-7 mx-auto text-primary" />
            <span className="text-[13px] font-bold">
              {t} {TONES[t].mark}
            </span>
          </button>
        ))}
      </div>
      {picked && (
        <button
          onClick={next}
          className="w-full mt-4 py-3 rounded-xl bg-primary text-white font-bold text-[14px]"
        >
          {tr('ရှေ့သို့ →')}
        </button>
      )}
    </div>
  );
}
