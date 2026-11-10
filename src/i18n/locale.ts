/** Interface languages. Burmese text is the source; English comes from the dictionary in en.ts. */
export const LOCALES = ['my', 'en'] as const;
export type Locale = (typeof LOCALES)[number];
export const LOCALE_COOKIE = 'na_locale';
export const isLocale = (v: unknown): v is Locale => v === 'my' || v === 'en';
