'use client';
import React from 'react';
import { useLocale } from './LocaleProvider';

/** မြန်မာ | EN switch. */
export default function LocaleToggle({ dark = false }: { dark?: boolean }) {
  const { locale, setLocale } = useLocale();
  return (
    <div
      className={`inline-flex rounded-full p-0.5 text-[11.5px] font-bold ${dark ? 'bg-white/15' : 'bg-muted'}`}
      role="group"
      aria-label="Language / ဘာသာစကား"
    >
      {(['my', 'en'] as const).map((l) => (
        <button
          key={l}
          onClick={() => locale !== l && setLocale(l)}
          aria-pressed={locale === l}
          className={`px-2.5 py-1 rounded-full transition-colors ${
            locale === l
              ? dark
                ? 'bg-white text-primary'
                : 'bg-card text-primary shadow-sm'
              : dark
                ? 'text-white/80'
                : 'text-muted-foreground'
          }`}
        >
          {l === 'my' ? 'မြန်မာ' : 'EN'}
        </button>
      ))}
    </div>
  );
}
