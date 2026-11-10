/**
 * English practice built around the mistakes Burmese speakers actually make:
 * literal translations from Burmese ("open the light"), missing tense changes, and
 * sounds Burmese doesn't have (final consonants, th, v, z, consonant clusters).
 */
import type { DrillItem, DrillTip } from '@/components/practice/types';

export interface Mistake {
  id: string;
  wrong: string;
  right: string;
  why: string; // Burmese
}

export const MISTAKES: Mistake[] = [
  {
    id: 'm-agree',
    wrong: 'I am agree with you.',
    right: 'I agree with you.',
    why: '"agree" က ကြိယာ ဖြစ်လို့ "am" မလိုပါ။ မြန်မာလို "သဘောတူ ပါတယ်" ကို တိုက်ရိုက် ဘာသာပြန်လို့ မှားတတ်ပါတယ်။',
  },
  {
    id: 'm-discuss',
    wrong: "Let's discuss about the plan.",
    right: "Let's discuss the plan.",
    why: '"discuss" နောက်မှာ "about" မထည့်ရပါ။ "talk about" ဆိုရင်တော့ about ထည့်ပါ။',
  },
  {
    id: 'm-light',
    wrong: 'Please open the light.',
    right: 'Please turn on the light.',
    why: 'မီး၊ ပန်ကာ၊ TV ကို "turn on / turn off" သုံးပါ။ "မီးဖွင့်" ကို "open" လို့ ဘာသာပြန်ရင် မှားပါတယ်။ တံခါး၊ ပြတင်းပေါက်ကိုမှ "open"။',
  },
  {
    id: 'm-borrow',
    wrong: 'Can you borrow me your pen?',
    right: 'Can you lend me your pen?',
    why: 'ကိုယ်က ယူရင် "borrow"၊ တခြားသူကို ပေးငှားရင် "lend"။ "Can I borrow your pen?" လည်း မှန်ပါတယ်။',
  },
  {
    id: 'm-dont',
    wrong: "He don't like coffee.",
    right: "He doesn't like coffee.",
    why: 'He / She / It နောက်မှာ "doesn\'t" သုံးပါ။ "don\'t" က I / you / we / they အတွက်ပါ။',
  },
  {
    id: 'm-lastyear',
    wrong: 'I have been to Japan last year.',
    right: 'I went to Japan last year.',
    why: '"last year, yesterday, in 2020" လို အချိန် တိတိကျကျ ပါရင် past simple (went) သုံးပါ။ "have been" က အချိန် မပြောတဲ့အခါ သုံးပါတယ်။',
  },
  {
    id: 'm-since',
    wrong: 'I live in Yangon since 2015.',
    right: 'I have lived in Yangon since 2015.',
    why: 'အတိတ်ကနေ အခုထိ ဖြစ်နေတာကို "since / for" နဲ့ ပြောရင် present perfect (have lived) သုံးပါ။',
  },
  {
    id: 'm-for3',
    wrong: 'I am working here for three years.',
    right: 'I have been working here for three years.',
    why: '"for three years" (အခုထိ ၃ နှစ်) ဆိုရင် "have been working" သုံးပါ။',
  },
  {
    id: 'm-married',
    wrong: 'She is married with a doctor.',
    right: 'She is married to a doctor.',
    why: '"married to" သုံးပါ — "with" မဟုတ်ပါ။',
  },
  {
    id: 'm-bored',
    wrong: 'I am very boring today.',
    right: 'I am very bored today.',
    why: '"bored" = ကိုယ်က ပျင်းနေတာ။ "boring" = တခြားသူကို ပျင်းစေတာ (ပျင်းစရာ ကောင်းတာ)။ interested / interesting လည်း ဒီလိုပါ။',
  },
  {
    id: 'm-interested',
    wrong: 'I am interesting in English.',
    right: 'I am interested in English.',
    why: 'ကိုယ်က စိတ်ဝင်စားရင် "interested"။ "English is interesting" (English က စိတ်ဝင်စားစရာ ကောင်းတယ်)။',
  },
  {
    id: 'm-return',
    wrong: 'Please return back the book.',
    right: 'Please return the book.',
    why: '"return" ထဲမှာ "back" ပါပြီးသားမို့ ထပ်မထည့်ပါနဲ့။',
  },
  {
    id: 'm-salary',
    wrong: 'My salary is very cheap.',
    right: 'My salary is very low.',
    why: 'လစာ၊ ဈေးနှုန်းကို "high / low" သုံးပါ။ "cheap / expensive" က ပစ္စည်းအတွက်ပါ။',
  },
  {
    id: 'm-there',
    wrong: 'I will go to there tomorrow.',
    right: 'I will go there tomorrow.',
    why: '"there, here, home" ရှေ့မှာ "to" မထည့်ပါ — go there, come here, go home။',
  },
  {
    id: 'm-taller',
    wrong: 'He is more taller than me.',
    right: 'He is taller than me.',
    why: '"-er" ပါပြီးသား စကားလုံးမှာ "more" ထပ်မထည့်ပါ။ စကားလုံး ရှည်ရင်မှ "more" — more beautiful။',
  },
  {
    id: 'm-where',
    wrong: 'Where you are going?',
    right: 'Where are you going?',
    why: 'မေးခွန်းမှာ "are / is / do" ကို ရှေ့ ပို့ပါ — Where are you…? What do you…?',
  },
  {
    id: 'm-children',
    wrong: 'I have two childrens.',
    right: 'I have two children.',
    why: '"children" က အများကိန်း ဖြစ်ပြီးသား (child → children)။ "s" ထပ်မထည့်ပါ။ people, men, women လည်း ဒီလိုပါ။',
  },
  {
    id: 'm-information',
    wrong: 'Can you give me an information?',
    right: 'Can you give me some information?',
    why: '"information, advice, money, furniture" က ရေတွက်လို့ မရတဲ့ နာမ် — "an" မသုံးဘဲ "some" သုံးပါ၊ "s" မထည့်ပါ။',
  },
  {
    id: 'm-livein',
    wrong: 'I live at Yangon.',
    right: 'I live in Yangon.',
    why: 'မြို့၊ နိုင်ငံ ရှေ့မှာ "in" — in Yangon, in Japan။ "at" က နေရာ တိတိကျကျ — at the station, at home။',
  },
  {
    id: 'm-everyone',
    wrong: 'Every people likes it.',
    right: 'Everyone likes it.',
    why: '"every" နောက်မှာ အနည်းကိန်း လာရပါတယ် — every person / everyone။ "people" က အများကိန်းပါ။',
  },
  {
    id: 'm-didnt',
    wrong: "I didn't went to work.",
    right: "I didn't go to work.",
    why: '"didn\'t" နောက်မှာ ကြိယာ မူရင်း (go) သုံးပါ — "did" ထဲမှာ အတိတ် ပါပြီးသားပါ။',
  },
  {
    id: 'm-explain',
    wrong: 'Can you explain me?',
    right: 'Can you explain it to me?',
    why: '"explain" နောက်မှာ လူကို တိုက်ရိုက် မထားရပါ — "explain something to someone"။',
  },
];

export const EN_TIPS: Record<string, DrillTip> = {
  final: {
    title: 'အဆုံး ဗျည်း (final consonant)',
    tip: 'မြန်မာ စကားမှာ အဆုံး ဗျည်းကို ဖြတ်ပြောလေ့ ရှိလို့ cat / cap / cab အတူတူ ကြားရတတ်ပါတယ်။ နောက်ဆုံး အသံ (t, p, d, k, s) ကို သေချာ ထုတ်ပြောပါ။',
  },
  th: {
    title: 'th အသံ',
    tip: 'လျှာဖျားကို သွားကြားမှာ နည်းနည်း ထုတ်ပြီး လေမှုတ်ပါ — think (θ)၊ this (ð)။ "တ" (tink) သို့မဟုတ် "ဒ" (dis) လို မပြောပါနဲ့။',
  },
  v: {
    title: 'v နဲ့ w',
    tip: 'v က အပေါ်သွားကို အောက်နှုတ်ခမ်းပေါ် တင်ပြီး တုန်ခါအောင် ပြောပါ — very။ w က နှုတ်ခမ်း ဝိုင်းပြီး — we။ မြန်မာမှာ v မရှိလို့ "ဗ" ဒါမှမဟုတ် "ဝ" လို ပြောမိတတ်ပါတယ်။',
  },
  z: {
    title: 'z အသံ',
    tip: 'z က "ဇ (ဂျ)" မဟုတ်ပါ — "s" ကို လည်ချောင်း တုန်ခါအောင် ပြောတာပါ (ပျားပျံသံ "zzz")။ zoo, busy, easy။',
  },
  cluster: {
    title: 'ဗျည်းတွဲ (str, sp, sk)',
    tip: 'street ကို "စ-ထရိ" လို အသံ ထပ်မထည့်ဘဲ s-t-r ကို တစ်ဆက်တည်း ပြောပါ။ အဆုံး ဗျည်းတွဲ (desk, asked) ကိုလည်း မဖြုတ်ပါနဲ့။',
  },
  long: {
    title: 'အသံ ရှည် / တို',
    tip: 'ship (တို) နဲ့ sheep (ရှည်)၊ live နဲ့ leave၊ full နဲ့ fool — ရှည်တဲ့ အသံကို ဆွဲပြောပါ၊ အဓိပ္ပာယ် ပြောင်းပါတယ်။',
  },
  rl: {
    title: 'r နဲ့ l',
    tip: 'r က လျှာကို ဘယ်နေရာမှ မထိဘဲ နောက်ကို ကော့ပါ။ l က လျှာဖျားကို သွားဖုံး နောက်မှာ ထိပါ။ right / light။',
  },
  sh: {
    title: 'sh နဲ့ s',
    tip: 'sh က နှုတ်ခမ်းကို ရှေ့ထုတ်ပြီး "ရှ"၊ s က ပြုံးသလို "ဆ"။ she / see၊ ship / sip။',
  },
};

export const EN_PHRASES: DrillItem[] = [
  { id: 'ep1', text: 'Can you help me?', meaning: 'ကူညီပေးနိုင်မလား?', tip: 'final' },
  { id: 'ep2', text: 'I like it.', meaning: 'ကြိုက်တယ်', tip: 'final' },
  {
    id: 'ep3',
    text: 'I work at a big company.',
    meaning: 'ကုမ္ပဏီ ကြီးတစ်ခုမှာ အလုပ်လုပ်တယ်',
    tip: 'final',
  },
  { id: 'ep4', text: 'Thank you very much.', meaning: 'ကျေးဇူး အများကြီး တင်ပါတယ်', tip: 'th' },
  { id: 'ep5', text: 'I think so.', meaning: 'ဟုတ်မယ် ထင်တယ်', tip: 'th' },
  { id: 'ep6', text: 'This is my mother.', meaning: 'ဒါ ကျွန်တော့်/ကျွန်မ အမေပါ', tip: 'th' },
  { id: 'ep7', text: 'Three thousand three hundred', meaning: '၃၃၀၀', tip: 'th' },
  { id: 'ep8', text: 'Very good video', meaning: 'အရမ်း ကောင်းတဲ့ video', tip: 'v' },
  { id: 'ep9', text: 'We have a van.', meaning: 'ကျွန်တော်တို့မှာ van ကား ရှိတယ်', tip: 'v' },
  { id: 'ep10', text: 'I am very busy.', meaning: 'အရမ်း အလုပ်များနေတယ်', tip: 'z' },
  { id: 'ep11', text: 'It is easy.', meaning: 'လွယ်ပါတယ်', tip: 'z' },
  {
    id: 'ep12',
    text: 'The school is on this street.',
    meaning: 'ကျောင်းက ဒီလမ်းမှာ ရှိတယ်',
    tip: 'cluster',
  },
  { id: 'ep13', text: 'She asked a question.', meaning: 'သူမ မေးခွန်း မေးခဲ့တယ်', tip: 'cluster' },
  { id: 'ep14', text: 'I live here.', meaning: 'ဒီမှာ နေပါတယ်', tip: 'long' },
  { id: 'ep15', text: 'Please leave the room.', meaning: 'အခန်းထဲက ထွက်ပေးပါ', tip: 'long' },
  { id: 'ep16', text: 'Turn right at the light.', meaning: 'မီးပွိုင့်မှာ ညာကွေ့ပါ', tip: 'rl' },
  { id: 'ep17', text: 'She sells fish.', meaning: 'သူမ ငါး ရောင်းတယ်', tip: 'sh' },
  { id: 'ep18', text: 'Nice to meet you.', meaning: 'တွေ့ရတာ ဝမ်းသာပါတယ်', tip: 'final' },
];
