/** Languages learners can study on the platform, with each one's standard level scale. */
export const LANG_CODES = ['ja', 'zh', 'ko', 'en'] as const;
export type LangCode = (typeof LANG_CODES)[number];

export interface LanguageInfo {
  code: LangCode;
  flag: string;
  my: string; // name in Burmese
  en: string; // name in English
  native: string;
  exam: string;
  levels: string[]; // easiest first
}

export const LANGUAGES: Record<LangCode, LanguageInfo> = {
  ja: {
    code: 'ja',
    flag: '🇯🇵',
    my: 'ဂျပန်',
    en: 'Japanese',
    native: '日本語',
    exam: 'JLPT',
    levels: ['N5', 'N4', 'N3', 'N2', 'N1'],
  },
  zh: {
    code: 'zh',
    flag: '🇨🇳',
    my: 'တရုတ်',
    en: 'Chinese',
    native: '中文',
    exam: 'HSK',
    levels: ['HSK1', 'HSK2', 'HSK3', 'HSK4', 'HSK5', 'HSK6'],
  },
  ko: {
    code: 'ko',
    flag: '🇰🇷',
    my: 'ကိုရီးယား',
    en: 'Korean',
    native: '한국어',
    exam: 'TOPIK',
    levels: ['TOPIK1', 'TOPIK2', 'TOPIK3', 'TOPIK4', 'TOPIK5', 'TOPIK6'],
  },
  en: {
    code: 'en',
    flag: '🇬🇧',
    my: 'အင်္ဂလိပ်',
    en: 'English',
    native: 'English',
    exam: 'CEFR / IELTS',
    levels: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
  },
};

export const isLang = (v: unknown): v is LangCode =>
  typeof v === 'string' && (LANG_CODES as readonly string[]).includes(v);

export const levelsOf = (lang: string) => (isLang(lang) ? LANGUAGES[lang].levels : []);

export const isLevelOf = (lang: string, level: string) => levelsOf(lang).includes(level);

/** Every level of every language (for schema validation). */
export const ALL_LEVELS = LANG_CODES.flatMap((c) => LANGUAGES[c].levels);
