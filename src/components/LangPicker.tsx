'use client';
import React from 'react';
import { LANG_CODES, LANGUAGES, type LangCode } from '@/data/languages';
import { useLocale } from '@/i18n/LocaleProvider';

/** Language chips: 🇯🇵 ဂျပန် · 🇨🇳 တရုတ် · 🇰🇷 ကိုရီးယား · 🇬🇧 English (optionally "all"). */
export default function LangPicker({
  value,
  onChange,
  allowAll = false,
  size = 'md',
}: {
  value: LangCode | 'all';
  onChange: (v: LangCode | 'all') => void;
  allowAll?: boolean;
  size?: 'sm' | 'md';
}) {
  const { locale } = useLocale();
  const options: (LangCode | 'all')[] = allowAll ? ['all', ...LANG_CODES] : [...LANG_CODES];
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
      {options.map((c) => {
        const on = value === c;
        return (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            className={`flex-shrink-0 rounded-full border font-semibold whitespace-nowrap ${
              size === 'sm' ? 'px-3 py-1 text-[12px]' : 'px-3.5 py-1.5 text-[13px]'
            } ${on ? 'bg-primary text-white border-primary' : 'border-border text-muted-foreground bg-card'}`}
          >
            {c === 'all'
              ? locale === 'en'
                ? '🌏 All'
                : '🌏 အားလုံး'
              : `${LANGUAGES[c].flag} ${locale === 'en' ? LANGUAGES[c].en : LANGUAGES[c].my}`}
          </button>
        );
      })}
    </div>
  );
}

/** Multi-select version for teachers choosing what they teach. */
export function LangMultiPicker({
  value,
  onChange,
}: {
  value: string[];
  onChange: (v: LangCode[]) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {LANG_CODES.map((c) => {
        const on = value.includes(c);
        return (
          <button
            key={c}
            type="button"
            onClick={() =>
              onChange((on ? value.filter((x) => x !== c) : [...value, c]) as LangCode[])
            }
            className={`px-3 py-1.5 rounded-full border text-[13px] font-semibold ${
              on ? 'bg-primary text-white border-primary' : 'border-border'
            }`}
          >
            {LANGUAGES[c].flag} {LANGUAGES[c].my}
          </button>
        );
      })}
    </div>
  );
}

export const flagOf = (code?: string | null) =>
  code && code in LANGUAGES ? LANGUAGES[code as LangCode].flag : '🇯🇵';
