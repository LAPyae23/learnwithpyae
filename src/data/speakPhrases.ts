/**
 * Pronunciation drills. `trap` marks sounds Burmese speakers commonly get wrong;
 * the tip is shown when the learner's attempt doesn't match.
 */
export type Trap = 'tsu' | 'long' | 'small-tsu' | 'r' | 'z' | 'n' | 'basic';

export interface Phrase {
  id: string;
  kana: string; // what we expect, in hiragana/katakana
  text: string; // natural written form (recognizers usually return this)
  romaji: string;
  meaning: string; // Burmese
  trap: Trap;
}

export const TRAP_TIPS: Record<Trap, { title: string; tip: string }> = {
  tsu: {
    title: 'つ နဲ့ す',
    tip: 'つ (tsu) ကို ပြောတဲ့အခါ လျှာဖျားကို သွားဖုံးနောက်မှာ ခဏ ထိပြီးမှ လွှတ်ပါ — "ဆု" မဟုတ်ဘဲ "ထ်ဆု" လိုမျိုးပါ။ す (su) ကတော့ လျှာ မထိပါဘူး။',
  },
  long: {
    title: 'အသံရှည် / အသံတို',
    tip: 'ဂျပန်စာမှာ အသံရှည်က အဓိပ္ပာယ် ပြောင်းစေပါတယ်။ おばさん (အဒေါ်) နဲ့ おばあさん (အဖွား) — ရှည်တဲ့ အသံကို အချိန် နှစ်ဆ ဆွဲပြောပါ။',
  },
  'small-tsu': {
    title: 'っ (အသံရပ်)',
    tip: 'っ ရှိရင် နောက်က အသံ မတိုင်ခင် ခဏ (တစ်ချက်စာ) ရပ်ပါ။ きって (တံဆိပ်ခေါင်း) ≠ きて (လာပါ)။',
  },
  r: {
    title: 'ら行 (ra ri ru re ro)',
    tip: 'ဂျပန် "r" က မြန်မာ "ရ" နဲ့ "လ" ကြားက အသံပါ။ လျှာဖျားနဲ့ အာခေါင်ကို တစ်ချက်လေး ပုတ်ရုံပါ၊ လှိမ့်မပြောပါနဲ့။',
  },
  z: {
    title: 'ざ・ず・ぜ・ぞ',
    tip: 'ざ行 က "ဇ" အသံ ဖြစ်ပါတယ်၊ "စ" မဟုတ်ပါ။ အသံအိုးကို တုန်ခါစေပြီး ပြောပါ။',
  },
  n: {
    title: 'ん',
    tip: 'ん က သီးသန့် အချိန်တစ်ချက် ယူပါတယ်။ ほんや (စာအုပ်ဆိုင်) ကို "ho-n-ya" ဆိုပြီး သုံးချက် ခွဲပြောပါ။',
  },
  basic: {
    title: 'ရှင်းရှင်းလင်းလင်း',
    tip: 'စာလုံးတိုင်းကို အချိန်တူ ပြောပါ။ နှေးနှေးနဲ့ ရှင်းရှင်း ပြောတာက မြန်မြန် ပြောတာထက် ပိုကောင်းပါတယ်။',
  },
};

export const PHRASES: Phrase[] = [
  {
    id: 'p1',
    kana: 'おはようございます',
    text: 'おはようございます',
    romaji: 'ohayou gozaimasu',
    meaning: 'မင်္ဂလာနံနက်ခင်းပါ',
    trap: 'long',
  },
  {
    id: 'p2',
    kana: 'ありがとうございます',
    text: 'ありがとうございます',
    romaji: 'arigatou gozaimasu',
    meaning: 'ကျေးဇူးတင်ပါတယ်',
    trap: 'r',
  },
  {
    id: 'p3',
    kana: 'すみません',
    text: 'すみません',
    romaji: 'sumimasen',
    meaning: 'တောင်းပန်ပါတယ် / ဆောရီး',
    trap: 'n',
  },
  { id: 'p4', kana: 'つくえ', text: '机', romaji: 'tsukue', meaning: 'စားပွဲ', trap: 'tsu' },
  { id: 'p5', kana: 'すし', text: '寿司', romaji: 'sushi', meaning: 'ဆူရှီ', trap: 'tsu' },
  { id: 'p6', kana: 'いつつ', text: '五つ', romaji: 'itsutsu', meaning: 'ငါးခု', trap: 'tsu' },
  {
    id: 'p7',
    kana: 'おばあさん',
    text: 'おばあさん',
    romaji: 'obaasan',
    meaning: 'အဖွား',
    trap: 'long',
  },
  {
    id: 'p8',
    kana: 'おばさん',
    text: 'おばさん',
    romaji: 'obasan',
    meaning: 'အဒေါ်',
    trap: 'long',
  },
  {
    id: 'p9',
    kana: 'きって',
    text: '切手',
    romaji: 'kitte',
    meaning: 'တံဆိပ်ခေါင်း',
    trap: 'small-tsu',
  },
  {
    id: 'p10',
    kana: 'ちょっとまってください',
    text: 'ちょっと待ってください',
    romaji: 'chotto matte kudasai',
    meaning: 'ခဏ စောင့်ပါ',
    trap: 'small-tsu',
  },
  {
    id: 'p11',
    kana: 'がっこう',
    text: '学校',
    romaji: 'gakkou',
    meaning: 'ကျောင်း',
    trap: 'small-tsu',
  },
  { id: 'p12', kana: 'りんご', text: 'りんご', romaji: 'ringo', meaning: 'ပန်းသီး', trap: 'r' },
  {
    id: 'p13',
    kana: 'れいぞうこ',
    text: '冷蔵庫',
    romaji: 'reizouko',
    meaning: 'ရေခဲသေတ္တာ',
    trap: 'r',
  },
  { id: 'p14', kana: 'ざっし', text: '雑誌', romaji: 'zasshi', meaning: 'မဂ္ဂဇင်း', trap: 'z' },
  { id: 'p15', kana: 'みず', text: '水', romaji: 'mizu', meaning: 'ရေ', trap: 'z' },
  { id: 'p16', kana: 'ほんや', text: '本屋', romaji: 'hon-ya', meaning: 'စာအုပ်ဆိုင်', trap: 'n' },
  {
    id: 'p17',
    kana: 'はじめまして',
    text: 'はじめまして',
    romaji: 'hajimemashite',
    meaning: 'တွေ့ရတာ ဝမ်းသာပါတယ်',
    trap: 'basic',
  },
  {
    id: 'p18',
    kana: 'ミャンマーからきました',
    text: 'ミャンマーから来ました',
    romaji: 'myanmaa kara kimashita',
    meaning: 'မြန်မာက လာပါတယ်',
    trap: 'long',
  },
  {
    id: 'p19',
    kana: 'よろしくおねがいします',
    text: 'よろしくお願いします',
    romaji: 'yoroshiku onegaishimasu',
    meaning: 'ကူညီပေးပါ / ဆက်ဆံရေး ကောင်းပါစေ',
    trap: 'r',
  },
  {
    id: 'p20',
    kana: 'しつれいします',
    text: '失礼します',
    romaji: 'shitsurei shimasu',
    meaning: 'ခွင့်ပြုပါ (ဝင်/ထွက်တဲ့အခါ)',
    trap: 'tsu',
  },
];
