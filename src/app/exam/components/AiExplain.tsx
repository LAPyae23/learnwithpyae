'use client';
import React, { useState } from 'react';
import RichText from '@/components/RichText';
import { streamText } from '@/lib/streamText';
import type { Question } from '../page';

/** "Ask AI why" button + streamed Burmese explanation for one mock-test question. */
export default function AiExplain({
  question,
  selectedIndex,
}: {
  question: Question;
  selectedIndex: number | null;
}) {
  const [text, setText] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  async function ask() {
    setState('loading');
    setText('');
    try {
      await streamText(
        '/api/ai/explain',
        {
          level: question.level,
          question: question.question,
          context: question.context,
          options: question.options,
          correctIndex: question.correctIndex,
          selectedIndex,
          explanation: question.explanation,
        },
        setText
      );
      setState('done');
    } catch (err) {
      setText((err as Error).message);
      setState('error');
    }
  }

  if (state === 'idle') {
    return (
      <button
        onClick={ask}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-primary/30 bg-secondary text-primary text-[13px] font-semibold hover:bg-green-100 transition-colors"
      >
        <span className="font-jp">先</span> ဘာလို့ မှားတာလဲ AI ဆရာကို မေးမယ်
      </button>
    );
  }

  return (
    <div
      className={`rounded-lg p-4 border text-[13.5px] leading-relaxed ${
        state === 'error'
          ? 'bg-danger-bg border-red-200 text-danger'
          : 'bg-secondary/60 border-primary/20 text-foreground'
      }`}
    >
      <p className="text-xs font-semibold text-primary mb-1.5">🤖 AI ဆရာ၏ ရှင်းလင်းချက်</p>
      {text ? <RichText text={text} /> : <p className="text-muted-foreground">စဉ်းစားနေပါတယ်…</p>}
      {state === 'error' && (
        <button onClick={ask} className="mt-2 text-[12px] font-semibold underline">
          ပြန်စမ်းမယ်
        </button>
      )}
    </div>
  );
}
