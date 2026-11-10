'use client';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { en } from './en';
import { LOCALE_COOKIE, type Locale } from './locale';

const Ctx = createContext<{ locale: Locale; setLocale: (l: Locale) => void }>({
  locale: 'my',
  setLocale: () => {},
});

/** Holds the interface language. The server reads the same cookie, so the first paint is right. */
export function LocaleProvider({
  initial,
  children,
}: {
  initial: Locale;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [locale, setState] = useState<Locale>(initial);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback(
    (l: Locale) => {
      setState(l);
      document.cookie = `${LOCALE_COOKIE}=${l}; path=/; max-age=31536000; samesite=lax`;
      router.refresh(); // re-render server components (landing sections) in the new language
    },
    [router]
  );

  return <Ctx.Provider value={{ locale, setLocale }}>{children}</Ctx.Provider>;
}

export const useLocale = () => useContext(Ctx);

/** t('မြန်မာ စာ') → English when the English interface is on (falls back to Burmese). */
export function useT() {
  const { locale } = useContext(Ctx);
  return useCallback((s: string) => (locale === 'en' ? (en[s] ?? s) : s), [locale]);
}
