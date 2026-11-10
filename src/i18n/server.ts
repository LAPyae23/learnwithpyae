import 'server-only';
import { cookies } from 'next/headers';
import { en } from './en';
import { isLocale, LOCALE_COOKIE, type Locale } from './locale';

export async function getLocale(): Promise<Locale> {
  const v = (await cookies()).get(LOCALE_COOKIE)?.value;
  return isLocale(v) ? v : 'my';
}

/** Translator for server components. */
export async function getT() {
  const locale = await getLocale();
  return (s: string) => (locale === 'en' ? (en[s] ?? s) : s);
}
