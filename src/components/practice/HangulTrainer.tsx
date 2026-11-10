'use client';
import React, { useMemo, useState } from 'react';
import { speak } from '@/lib/speech';
import { useT } from '@/i18n/LocaleProvider';
import {
  BATCHIM,
  COMPOUND_VOWELS,
  CONSONANTS,
  DOUBLE_CONSONANTS,
  READING_WORDS,
  VOWELS,
  composeSyllable,
  type Jamo,
} from '@/data/korean';
import { choicesFor, usePracticeReporter } from './practiceUtils';

const say = (s: string) => speak(s, 'ko-KR', 0.75);
// A lone jamo is read by its letter name, so play it inside a syllable: ㄱ → 가, ㅓ → 어
const soundOfConsonant = (c: string) => composeSyllable(c, 'ㅏ') ?? c;
const soundOfVowel = (v: string) => composeSyllable('ㅇ', v) ?? v;

type View = 'chart' | 'build' | 'quiz';

/** Learn Hangul: letter charts with audio, a block builder, and a reading quiz. */
export default function HangulTrainer() {
  const tr = useT();
  const [view, setView] = useState<View>('chart');
  return (
    <div>
      <div className="flex gap-1.5 mb-3">
        {(
          [
            ['chart', '🔤 စာလုံး ဇယား'],
            ['build', '🧱 စာလုံး ပေါင်း'],
            ['quiz', '🎯 ဖတ်ကြည့်'],
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
      {view === 'chart' && <Chart />}
      {view === 'build' && <Builder />}
      {view === 'quiz' && <ReadingQuiz />}
    </div>
  );
}

function Grid({
  title,
  items,
  sound,
}: {
  title: string;
  items: Jamo[];
  sound: (c: string) => string;
}) {
  const tr = useT();
  return (
    <div className="mb-4">
      <p className="text-[13px] font-bold mb-2">{tr(title)}</p>
      <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
        {items.map((j) => (
          <button
            key={j.ch}
            onClick={() => say(sound(j.ch))}
            className="bg-card border border-border rounded-xl py-2 px-1 text-center active:bg-muted"
          >
            <span className="block text-[28px] font-bold leading-none">{j.ch}</span>
            <span className="block text-[11.5px] text-primary font-semibold mt-1">{j.roman}</span>
            <span className="block text-[11px] text-muted-foreground leading-tight">{j.my}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Chart() {
  const tr = useT();
  return (
    <div>
      <p className="text-[12.5px] bg-secondary/60 rounded-xl p-3 mb-3">
        {tr(
          '💡 ဟန်ဂူလ်က ဗျည်း + သရ ကို ပေါင်းပြီး တစ်ကွက်ချင်း ရေးပါတယ် (ㄱ + ㅏ = 가)။ စာလုံးကို နှိပ်ရင် အသံ ကြားရပါမယ်။ ၁ ရက် ၁ နာရီ လောက်နဲ့ ဖတ်တတ်သွားနိုင်ပါတယ်!'
        )}
      </p>
      <Grid title="ဗျည်း (자음)" items={CONSONANTS} sound={soundOfConsonant} />
      <Grid title="သရ (모음)" items={VOWELS} sound={soundOfVowel} />
      <Grid
        title="ဗျည်း နှစ်ထပ် (တင်းတင်း ပြော)"
        items={DOUBLE_CONSONANTS}
        sound={soundOfConsonant}
      />
      <Grid title="သရ တွဲ" items={COMPOUND_VOWELS} sound={soundOfVowel} />
    </div>
  );
}

function Picker({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { ch: string; hint: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  const tr = useT();
  return (
    <div className="mb-3">
      <p className="text-[12.5px] font-semibold text-muted-foreground mb-1.5">{tr(label)}</p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => (
          <button
            key={o.ch || 'none'}
            onClick={() => onChange(o.ch)}
            title={o.hint}
            className={`min-w-[42px] h-[42px] rounded-xl border text-[18px] font-bold ${
              value === o.ch ? 'bg-primary text-white border-primary' : 'border-border bg-card'
            }`}
          >
            {o.ch || '—'}
          </button>
        ))}
      </div>
    </div>
  );
}

function Builder() {
  const tr = useT();
  const [c, setC] = useState('ㅎ');
  const [v, setV] = useState('ㅏ');
  const [f, setF] = useState('ㄴ');
  const syllable = composeSyllable(c, v, f) ?? '';
  const cInfo = [...CONSONANTS, ...DOUBLE_CONSONANTS].find((x) => x.ch === c);
  const vInfo = [...VOWELS, ...COMPOUND_VOWELS].find((x) => x.ch === v);
  const fInfo = BATCHIM.find((x) => x.ch === f);

  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      <div className="text-center mb-4">
        <button onClick={() => say(syllable)} className="inline-block">
          <span className="block text-[72px] font-bold leading-none">{syllable}</span>
          <span className="block text-[13px] text-primary font-semibold mt-2">
            🔊 {tr('နှိပ်ပြီး နားထောင်')}
          </span>
        </button>
        <p className="text-[13px] text-muted-foreground mt-2">
          {c} ({cInfo?.roman}) + {v} ({vInfo?.roman}){f && ` + ${f} → ${fInfo?.sound}`}
        </p>
      </div>
      <Picker
        label="၁။ ဗျည်း"
        options={[...CONSONANTS, ...DOUBLE_CONSONANTS].map((x) => ({ ch: x.ch, hint: x.roman }))}
        value={c}
        onChange={setC}
      />
      <Picker
        label="၂။ သရ"
        options={[...VOWELS, ...COMPOUND_VOWELS].map((x) => ({ ch: x.ch, hint: x.roman }))}
        value={v}
        onChange={setV}
      />
      <Picker
        label="၃။ အောက်ဆုံး ဗျည်း (받침) — မထည့်လည်း ရ"
        options={BATCHIM.map((x) => ({ ch: x.ch, hint: x.sound }))}
        value={f}
        onChange={setF}
      />
      <p className="text-[12px] text-muted-foreground">
        {tr(
          '💡 အောက်ဆုံး ဗျည်းက အသံ ၇ မျိုးပဲ ထွက်ပါတယ်: က်၊ န်၊ တ်၊ လ်၊ မ်၊ ပ်၊ င်။ ဥပမာ ㅅ ㅈ ㅊ ㅌ ㅎ အားလုံး "တ်" လို့ ထွက်ပါတယ်။'
        )}
      </p>
    </div>
  );
}

type Q = { prompt: string; answer: string; options: string[]; my?: string; sound: string };

function makeQuestion(): Q {
  // Half single letters, half real words
  if (Math.random() < 0.5) {
    const pool = [...CONSONANTS, ...VOWELS];
    const j = pool[Math.floor(Math.random() * pool.length)];
    const isVowel = VOWELS.includes(j);
    const same = isVowel ? VOWELS : CONSONANTS;
    return {
      prompt: j.ch,
      answer: j.roman,
      options: choicesFor(j, same, 3, (x) => x.roman).map((x) => x.roman),
      my: j.my,
      sound: isVowel ? soundOfVowel(j.ch) : soundOfConsonant(j.ch),
    };
  }
  const w = READING_WORDS[Math.floor(Math.random() * READING_WORDS.length)];
  return {
    prompt: w.word,
    answer: w.roman,
    options: choicesFor(w, READING_WORDS, 3, (x) => x.roman).map((x) => x.roman),
    my: w.my,
    sound: w.word,
  };
}

function ReadingQuiz() {
  const tr = useT();
  const report = usePracticeReporter('ko');
  const [q, setQ] = useState<Q>(() => makeQuestion());
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState({ right: 0, total: 0 });
  const options = useMemo(() => q.options, [q]);

  function pick(o: string) {
    if (picked) return;
    setPicked(o);
    const ok = o === q.answer;
    setScore((s) => ({ right: s.right + (ok ? 1 : 0), total: s.total + 1 }));
    if (ok) report();
    say(q.sound);
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-5 text-center">
      <p className="text-[12px] text-muted-foreground">
        {tr('ဘယ်လို ဖတ်မလဲ?')} {score.total > 0 && `· ✅ ${score.right}/${score.total}`}
      </p>
      <p className="text-[64px] font-bold leading-tight my-2">{q.prompt}</p>
      {picked && <p className="text-[14px] text-muted-foreground mb-2">{q.my}</p>}
      <div className="grid grid-cols-2 gap-2">
        {options.map((o) => (
          <button
            key={o}
            onClick={() => pick(o)}
            className={`py-3 rounded-xl border-2 text-[16px] font-semibold ${
              !picked
                ? 'border-border'
                : o === q.answer
                  ? 'border-success bg-success-bg'
                  : o === picked
                    ? 'border-danger bg-danger-bg'
                    : 'border-border opacity-60'
            }`}
          >
            {o}
          </button>
        ))}
      </div>
      {picked && (
        <button
          onClick={() => {
            setQ(makeQuestion());
            setPicked(null);
          }}
          className="w-full mt-4 py-3 rounded-xl bg-primary text-white font-bold text-[14px]"
        >
          {tr('ရှေ့သို့ →')}
        </button>
      )}
    </div>
  );
}
