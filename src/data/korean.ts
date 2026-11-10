/**
 * Korean practice content. Romanization follows the Revised Romanization of Korean;
 * the Burmese hints are approximate sounds to get a beginner started, not exact phonetics.
 */
import type { DrillItem, DrillTip, WordItem } from '@/components/practice/types';

export interface Jamo {
  ch: string;
  roman: string;
  my: string;
}

export const CONSONANTS: Jamo[] = [
  { ch: 'ㄱ', roman: 'g / k', my: 'ဂ / က' },
  { ch: 'ㄴ', roman: 'n', my: 'န' },
  { ch: 'ㄷ', roman: 'd / t', my: 'ဒ / တ' },
  { ch: 'ㄹ', roman: 'r / l', my: 'ရ / လ' },
  { ch: 'ㅁ', roman: 'm', my: 'မ' },
  { ch: 'ㅂ', roman: 'b / p', my: 'ဗ / ပ' },
  { ch: 'ㅅ', roman: 's', my: 'ဆ (s)' },
  { ch: 'ㅇ', roman: '– / ng', my: 'ရှေ့မှာ အသံမရှိ၊ အောက်မှာ င်' },
  { ch: 'ㅈ', roman: 'j', my: 'ဂျ' },
  { ch: 'ㅊ', roman: 'ch', my: 'ချ' },
  { ch: 'ㅋ', roman: 'k', my: 'ခ' },
  { ch: 'ㅌ', roman: 't', my: 'ထ' },
  { ch: 'ㅍ', roman: 'p', my: 'ဖ' },
  { ch: 'ㅎ', roman: 'h', my: 'ဟ' },
];

export const DOUBLE_CONSONANTS: Jamo[] = [
  { ch: 'ㄲ', roman: 'kk', my: 'က (လည်ချောင်း တင်းပြီး)' },
  { ch: 'ㄸ', roman: 'tt', my: 'တ (တင်းတင်း)' },
  { ch: 'ㅃ', roman: 'pp', my: 'ပ (တင်းတင်း)' },
  { ch: 'ㅆ', roman: 'ss', my: 'ဆ (တင်းတင်း)' },
  { ch: 'ㅉ', roman: 'jj', my: 'ကျ (တင်းတင်း)' },
];

export const VOWELS: Jamo[] = [
  { ch: 'ㅏ', roman: 'a', my: 'အာ' },
  { ch: 'ㅑ', roman: 'ya', my: 'ယာ' },
  { ch: 'ㅓ', roman: 'eo', my: 'အော် (ပါးစပ် ဟဟ)' },
  { ch: 'ㅕ', roman: 'yeo', my: 'ယော်' },
  { ch: 'ㅗ', roman: 'o', my: 'အို (နှုတ်ခမ်း ဝိုင်း)' },
  { ch: 'ㅛ', roman: 'yo', my: 'ယို' },
  { ch: 'ㅜ', roman: 'u', my: 'အူ' },
  { ch: 'ㅠ', roman: 'yu', my: 'ယူ' },
  { ch: 'ㅡ', roman: 'eu', my: 'အ (နှုတ်ခမ်း မဝိုင်းဘဲ)' },
  { ch: 'ㅣ', roman: 'i', my: 'အီ' },
];

export const COMPOUND_VOWELS: Jamo[] = [
  { ch: 'ㅐ', roman: 'ae', my: 'အဲ' },
  { ch: 'ㅒ', roman: 'yae', my: 'ယဲ' },
  { ch: 'ㅔ', roman: 'e', my: 'အေ' },
  { ch: 'ㅖ', roman: 'ye', my: 'ယေ' },
  { ch: 'ㅘ', roman: 'wa', my: 'ဝါ' },
  { ch: 'ㅙ', roman: 'wae', my: 'ဝဲ' },
  { ch: 'ㅚ', roman: 'oe', my: 'ဝေ' },
  { ch: 'ㅝ', roman: 'wo', my: 'ဝေါ်' },
  { ch: 'ㅞ', roman: 'we', my: 'ဝေ' },
  { ch: 'ㅟ', roman: 'wi', my: 'ဝီ' },
  { ch: 'ㅢ', roman: 'ui', my: 'အူအီ (မြန်မြန်)' },
];

// Unicode Hangul syllable composition: 0xAC00 + (initial × 21 + medial) × 28 + final
const INITIALS = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ';
const MEDIALS = 'ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ';
const FINALS = ['', ...'ㄱㄲㄳㄴㄵㄶㄷㄹㄺㄻㄼㄽㄾㄿㅀㅁㅂㅄㅅㅆㅇㅈㅊㅋㅌㅍㅎ'];

export function composeSyllable(initial: string, medial: string, final = ''): string | null {
  const i = INITIALS.indexOf(initial);
  const m = MEDIALS.indexOf(medial);
  const f = FINALS.indexOf(final);
  if (i < 0 || m < 0 || f < 0) return null;
  return String.fromCharCode(0xac00 + (i * 21 + m) * 28 + f);
}

/** Finals offered in the block builder, with the sound they make at the bottom of a block. */
export const BATCHIM: { ch: string; sound: string }[] = [
  { ch: '', sound: '—' },
  { ch: 'ㄱ', sound: 'k (က်)' },
  { ch: 'ㄴ', sound: 'n (န်)' },
  { ch: 'ㄷ', sound: 't (တ်)' },
  { ch: 'ㄹ', sound: 'l (လ်)' },
  { ch: 'ㅁ', sound: 'm (မ်)' },
  { ch: 'ㅂ', sound: 'p (ပ်)' },
  { ch: 'ㅅ', sound: 't (တ်)' },
  { ch: 'ㅇ', sound: 'ng (င်)' },
  { ch: 'ㅈ', sound: 't (တ်)' },
  { ch: 'ㅊ', sound: 't (တ်)' },
  { ch: 'ㅋ', sound: 'k (က်)' },
  { ch: 'ㅌ', sound: 't (တ်)' },
  { ch: 'ㅍ', sound: 'p (ပ်)' },
  { ch: 'ㅎ', sound: 't (တ်)' },
];

/** Short words for "can you read it?" practice — only letters from the charts above. */
export const READING_WORDS: { word: string; roman: string; my: string }[] = [
  { word: '나무', roman: 'namu', my: 'သစ်ပင်' },
  { word: '바다', roman: 'bada', my: 'ပင်လယ်' },
  { word: '아이', roman: 'ai', my: 'ကလေး' },
  { word: '우유', roman: 'uyu', my: 'နွားနို့' },
  { word: '오이', roman: 'oi', my: 'သခွားသီး' },
  { word: '모자', roman: 'moja', my: 'ဦးထုပ်' },
  { word: '가수', roman: 'gasu', my: 'အဆိုတော်' },
  { word: '비누', roman: 'binu', my: 'ဆပ်ပြာ' },
  { word: '사과', roman: 'sagwa', my: 'ပန်းသီး' },
  { word: '커피', roman: 'keopi', my: 'ကော်ဖီ' },
  { word: '라면', roman: 'ramyeon', my: 'ခေါက်ဆွဲ' },
  { word: '김치', roman: 'gimchi', my: 'ကင်မ်ချီ' },
  { word: '한국', roman: 'hanguk', my: 'ကိုရီးယား' },
  { word: '서울', roman: 'seoul', my: 'ဆိုးလ်' },
  { word: '학생', roman: 'haksaeng', my: 'ကျောင်းသား' },
  { word: '친구', roman: 'chingu', my: 'သူငယ်ချင်း' },
];

export const KO_WORDS: WordItem[] = [
  { id: 'ko-annyeong', front: '안녕하세요', reading: 'annyeonghaseyo', meaning: 'မင်္ဂလာပါ' },
  { id: 'ko-gamsa', front: '감사합니다', reading: 'gamsahamnida', meaning: 'ကျေးဇူးတင်ပါတယ်' },
  { id: 'ko-joesong', front: '죄송합니다', reading: 'joesonghamnida', meaning: 'တောင်းပန်ပါတယ်' },
  { id: 'ko-ne', front: '네', reading: 'ne', meaning: 'ဟုတ်ကဲ့' },
  { id: 'ko-aniyo', front: '아니요', reading: 'aniyo', meaning: 'မဟုတ်ပါဘူး' },
  {
    id: 'ko-gwaenchana',
    front: '괜찮아요',
    reading: 'gwaenchanayo',
    meaning: 'ရပါတယ် / အဆင်ပြေပါတယ်',
  },
  { id: 'ko-mul', front: '물', reading: 'mul', meaning: 'ရေ' },
  { id: 'ko-bap', front: '밥', reading: 'bap', meaning: 'ထမင်း' },
  { id: 'ko-saram', front: '사람', reading: 'saram', meaning: 'လူ' },
  { id: 'ko-chingu', front: '친구', reading: 'chingu', meaning: 'သူငယ်ချင်း' },
  { id: 'ko-hakgyo', front: '학교', reading: 'hakgyo', meaning: 'ကျောင်း' },
  { id: 'ko-hoesa', front: '회사', reading: 'hoesa', meaning: 'ကုမ္ပဏီ' },
  { id: 'ko-jip', front: '집', reading: 'jip', meaning: 'အိမ်' },
  { id: 'ko-gajok', front: '가족', reading: 'gajok', meaning: 'မိသားစု' },
  { id: 'ko-eomeoni', front: '어머니', reading: 'eomeoni', meaning: 'အမေ' },
  { id: 'ko-abeoji', front: '아버지', reading: 'abeoji', meaning: 'အဖေ' },
  { id: 'ko-seonsaengnim', front: '선생님', reading: 'seonsaengnim', meaning: 'ဆရာ / ဆရာမ' },
  { id: 'ko-haksaeng', front: '학생', reading: 'haksaeng', meaning: 'ကျောင်းသား' },
  { id: 'ko-don', front: '돈', reading: 'don', meaning: 'ပိုက်ဆံ' },
  { id: 'ko-sigan', front: '시간', reading: 'sigan', meaning: 'အချိန်' },
  { id: 'ko-oneul', front: '오늘', reading: 'oneul', meaning: 'ဒီနေ့' },
  { id: 'ko-naeil', front: '내일', reading: 'naeil', meaning: 'မနက်ဖြန်' },
  { id: 'ko-eoje', front: '어제', reading: 'eoje', meaning: 'မနေ့က' },
  { id: 'ko-il', front: '일', reading: 'il', meaning: 'အလုပ်' },
  { id: 'ko-meokda', front: '먹다', reading: 'meokda', meaning: 'စားသည်' },
  { id: 'ko-masida', front: '마시다', reading: 'masida', meaning: 'သောက်သည်' },
  { id: 'ko-gada', front: '가다', reading: 'gada', meaning: 'သွားသည်' },
  { id: 'ko-oda', front: '오다', reading: 'oda', meaning: 'လာသည်' },
  { id: 'ko-hada', front: '하다', reading: 'hada', meaning: 'လုပ်သည်' },
  { id: 'ko-boda', front: '보다', reading: 'boda', meaning: 'ကြည့်သည်' },
  { id: 'ko-jota', front: '좋다', reading: 'jota', meaning: 'ကောင်းသည်' },
  { id: 'ko-keuda', front: '크다', reading: 'keuda', meaning: 'ကြီးသည်' },
  { id: 'ko-jakda', front: '작다', reading: 'jakda', meaning: 'သေးသည်' },
  { id: 'ko-manta', front: '많다', reading: 'manta', meaning: 'များသည်' },
  { id: 'ko-byeongwon', front: '병원', reading: 'byeongwon', meaning: 'ဆေးရုံ' },
  { id: 'ko-hwajangsil', front: '화장실', reading: 'hwajangsil', meaning: 'အိမ်သာ' },
  { id: 'ko-eolma', front: '얼마예요?', reading: 'eolmayeyo?', meaning: 'ဘယ်လောက်လဲ?' },
  { id: 'ko-hangugeo', front: '한국어', reading: 'hangugeo', meaning: 'ကိုရီးယား စကား' },
  { id: 'ko-masisseo', front: '맛있어요', reading: 'masisseoyo', meaning: 'အရသာ ရှိတယ်' },
  { id: 'ko-sarang', front: '사랑해요', reading: 'saranghaeyo', meaning: 'ချစ်တယ်' },
];

export const KO_TIPS: Record<string, DrillTip> = {
  eo: {
    title: 'ㅓ နဲ့ ㅗ',
    tip: 'ㅓ (eo) က ပါးစပ်ကို ဟပြီး "အော်" — နှုတ်ခမ်း မဝိုင်းပါ။ ㅗ (o) ကတော့ နှုတ်ခမ်းကို ဝိုင်းပြီး "အို"။ 어 နဲ့ 오 မှားရင် အဓိပ္ပာယ် ပြောင်းပါတယ်။',
  },
  tense: {
    title: 'ㄱ / ㅋ / ㄲ (လေ ထွက်ပုံ)',
    tip: 'ㄱ က ပျော့ပျော့ "ဂ/က"၊ ㅋ က လေထွက်ပြီး "ခ"၊ ㄲ က လည်ချောင်း တင်းပြီး လေ မထွက်ဘဲ "က"။ ㄷ/ㅌ/ㄸ၊ ㅂ/ㅍ/ㅃ၊ ㅈ/ㅊ/ㅉ လည်း ဒီလိုပါပဲ။',
  },
  batchim: {
    title: 'အောက်ဆုံး ဗျည်း (받침)',
    tip: 'အောက်ဆုံး ဗျည်းကို မြန်မာ အသတ်လို ပိတ်ပြောပါ — 밥 (bap) က "ဘပ်"၊ 학 (hak) က "ဟက်"။ နောက်မှာ သရ လာရင် ချိတ်ဆက်ပြောပါ: 한국어 → han-gu-geo။',
  },
  l: {
    title: 'ㄹ (r / l)',
    tip: 'ㄹ က စကားလုံး ကြားမှာ "ရ" လို ပေါ့ပေါ့၊ အောက်ဆုံးမှာဆို "လ်" — 서울 (seo-ul) ရဲ့ အဆုံးမှာ လျှာဖျားကို အာခေါင်ပေါ် ထိထားပါ။',
  },
  basic: {
    title: 'နှေးနှေး ပြတ်ပြတ်',
    tip: 'စာလုံး တစ်လုံးချင်းကို ပီပီသသ ပြောပြီးမှ မြန်မြန် ချိတ်ပြောကြည့်ပါ။',
  },
};

export const KO_PHRASES: DrillItem[] = [
  { id: 'kp1', text: '안녕하세요', roman: 'annyeonghaseyo', meaning: 'မင်္ဂလာပါ', tip: 'batchim' },
  {
    id: 'kp2',
    text: '감사합니다',
    roman: 'gamsahamnida',
    meaning: 'ကျေးဇူးတင်ပါတယ်',
    tip: 'batchim',
  },
  {
    id: 'kp3',
    text: '저는 미얀마 사람이에요',
    roman: 'jeoneun miyanma saramieyo',
    meaning: 'ကျွန်တော်/ကျွန်မ က မြန်မာ လူမျိုးပါ',
    tip: 'eo',
  },
  {
    id: 'kp4',
    text: '만나서 반갑습니다',
    roman: 'mannaseo bangapseumnida',
    meaning: 'တွေ့ရတာ ဝမ်းသာပါတယ်',
    tip: 'batchim',
  },
  {
    id: 'kp5',
    text: '이거 얼마예요?',
    roman: 'igeo eolmayeyo?',
    meaning: 'ဒါ ဘယ်လောက်လဲ?',
    tip: 'eo',
  },
  {
    id: 'kp6',
    text: '화장실 어디예요?',
    roman: 'hwajangsil eodiyeyo?',
    meaning: 'အိမ်သာ ဘယ်မှာလဲ?',
    tip: 'l',
  },
  {
    id: 'kp7',
    text: '한국어를 공부해요',
    roman: 'hangugeoreul gongbuhaeyo',
    meaning: 'ကိုရီးယား စာ လေ့လာနေပါတယ်',
    tip: 'batchim',
  },
  {
    id: 'kp8',
    text: '천천히 말해 주세요',
    roman: 'cheoncheonhi malhae juseyo',
    meaning: 'ဖြည်းဖြည်း ပြောပေးပါ',
    tip: 'tense',
  },
  {
    id: 'kp9',
    text: '다시 한번 말해 주세요',
    roman: 'dasi hanbeon malhae juseyo',
    meaning: 'နောက်တစ်ခါ ပြောပေးပါ',
    tip: 'l',
  },
  {
    id: 'kp10',
    text: '잘 모르겠어요',
    roman: 'jal moreugesseoyo',
    meaning: 'သိပ် မသိဘူး / နားမလည်ဘူး',
    tip: 'tense',
  },
  {
    id: 'kp11',
    text: '서울에 가고 싶어요',
    roman: 'seoure gago sipeoyo',
    meaning: 'ဆိုးလ် ကို သွားချင်တယ်',
    tip: 'l',
  },
  { id: 'kp12', text: '맛있어요', roman: 'masisseoyo', meaning: 'အရသာ ရှိတယ်', tip: 'tense' },
  {
    id: 'kp13',
    text: '공장에서 일해요',
    roman: 'gongjangeseo ilhaeyo',
    meaning: 'စက်ရုံမှာ အလုပ်လုပ်ပါတယ်',
    tip: 'batchim',
  },
  {
    id: 'kp14',
    text: '괜찮아요',
    roman: 'gwaenchanayo',
    meaning: 'ရပါတယ် / အဆင်ပြေပါတယ်',
    tip: 'basic',
  },
];
