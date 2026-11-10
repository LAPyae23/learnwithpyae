'use client';
import React, { useRef, useState } from 'react';
import RichText from '@/components/RichText';
import { streamText } from '@/lib/streamText';
import { AI_ENABLED } from '@/lib/features';
import { useT } from '@/i18n/LocaleProvider';
import type { PracticeLang } from './types';

/** Learner writes a few sentences; the AI corrects them and explains the mistakes in Burmese. */
export default function WritingCheck({
  lang,
  prompts,
  placeholder,
}: {
  lang: PracticeLang;
  /** Topic ideas so a beginner isn't stuck on an empty box */
  prompts: string[];
  placeholder: string;
}) {
  const tr = useT();
  const [text, setText] = useState('');
  const [answer, setAnswer] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abort = useRef<AbortController | null>(null);

  if (!AI_ENABLED)
    return (
      <div className="bg-card border border-border rounded-2xl p-6 text-center text-[14px] text-muted-foreground">
        {tr('AI စာစစ် feature ကို Admin က မဖွင့်ရသေးပါ။')}
      </div>
    );

  async function check() {
    if (busy || text.trim().length < 2) return;
    setBusy(true);
    setError(null);
    setAnswer('');
    abort.current = new AbortController();
    try {
      await streamText('/api/ai/writing', { lang, text }, setAnswer, abort.current.signal);
    } catch (e) {
      if ((e as Error).name !== 'AbortError') setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="bg-card border border-border rounded-2xl p-4">
        <p className="text-[13px] text-muted-foreground mb-2">
          {tr('ဘာရေးရမလဲ မသိရင် — ခေါင်းစဉ် တစ်ခု ရွေးပါ:')}
        </p>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {prompts.map((p) => (
            <span key={p} className="text-[12px] bg-muted px-2.5 py-1 rounded-full">
              {p}
            </span>
          ))}
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, 1500))}
          rows={5}
          placeholder={placeholder}
          className="w-full rounded-xl border border-border bg-background p-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <div className="flex items-center justify-between mt-2">
          <span className="text-[11.5px] text-muted-foreground tabular-nums">
            {text.length}/1500
          </span>
          <button
            onClick={busy ? () => abort.current?.abort() : check}
            disabled={!busy && text.trim().length < 2}
            className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-[14px] disabled:opacity-40"
          >
            {busy ? tr('ရပ်မယ်') : tr('✨ AI နဲ့ စစ်မယ်')}
          </button>
        </div>
      </div>

      {error && <p className="text-[13px] text-danger">{error}</p>}
      {(answer || busy) && (
        <div className="bg-card border border-border rounded-2xl p-4 text-[14px] leading-relaxed">
          {answer ? (
            <RichText text={answer} />
          ) : (
            <p className="text-muted-foreground animate-pulse">{tr('စစ်နေပါတယ်…')}</p>
          )}
        </div>
      )}
    </div>
  );
}
