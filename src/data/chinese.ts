/**
 * Mandarin practice content: tone groups (same syllable, four tones), HSK 1 words and
 * speaking phrases. Tone descriptions are tuned for Burmese speakers (Burmese is tonal too,
 * but its tones are about pitch height + voice quality, not rising/falling contours).
 */
import type { DrillItem, DrillTip, WordItem } from '@/components/practice/types';

export type Tone = 1 | 2 | 3 | 4;

export const TONES: Record<Tone, { mark: string; name: string; my: string; contour: string }> = {
  1: {
    mark: 'ˉ',
    name: 'ပထမ အသံ',
    my: 'အမြင့်မှာ တည်တည် ဆွဲပြော — သီချင်း သံရှည် ဆွဲသလို',
    contour: 'M4 6 L36 6',
  },
  2: {
    mark: 'ˊ',
    name: 'ဒုတိယ အသံ',
    my: 'အလယ်ကနေ အပေါ် တက် — "ဟုတ်လား?" လို့ အံ့ဩ မေးသလို',
    contour: 'M4 22 L36 4',
  },
  3: {
    mark: 'ˇ',
    name: 'တတိယ အသံ',
    my: 'အနိမ့်ဆုံးထိ ဆင်းပြီး ပြန်တက် — လည်ချောင်းထဲက နိမ့်နိမ့်',
    contour: 'M4 14 Q16 34 36 6',
  },
  4: {
    mark: 'ˋ',
    name: 'စတုတ္ထ အသံ',
    my: 'အပေါ်ကနေ ပြတ်ပြတ် အောက်ကျ — အမိန့်ပေး သလို၊ စိတ်ဆိုးသလို',
    contour: 'M4 4 L36 26',
  },
};

export interface ToneChar {
  hanzi: string;
  pinyin: string;
  tone: Tone;
  my: string;
}

/** Each group is one syllable in all four tones, so the learner hears only the tone change. */
export const TONE_GROUPS: { base: string; chars: ToneChar[] }[] = [
  {
    base: 'ma',
    chars: [
      { hanzi: '妈', pinyin: 'mā', tone: 1, my: 'အမေ' },
      { hanzi: '麻', pinyin: 'má', tone: 2, my: 'ပိုက်ဆံ / ထုံ' },
      { hanzi: '马', pinyin: 'mǎ', tone: 3, my: 'မြင်း' },
      { hanzi: '骂', pinyin: 'mà', tone: 4, my: 'ဆဲ' },
    ],
  },
  {
    base: 'ba',
    chars: [
      { hanzi: '八', pinyin: 'bā', tone: 1, my: 'ရှစ်' },
      { hanzi: '拔', pinyin: 'bá', tone: 2, my: 'နုတ်' },
      { hanzi: '把', pinyin: 'bǎ', tone: 3, my: 'ကိုင်' },
      { hanzi: '爸', pinyin: 'bà', tone: 4, my: 'အဖေ' },
    ],
  },
  {
    base: 'yi',
    chars: [
      { hanzi: '一', pinyin: 'yī', tone: 1, my: 'တစ်' },
      { hanzi: '姨', pinyin: 'yí', tone: 2, my: 'အဒေါ်' },
      { hanzi: '椅', pinyin: 'yǐ', tone: 3, my: 'ကုလားထိုင်' },
      { hanzi: '意', pinyin: 'yì', tone: 4, my: 'အဓိပ္ပာယ်' },
    ],
  },
  {
    base: 'shi',
    chars: [
      { hanzi: '诗', pinyin: 'shī', tone: 1, my: 'ကဗျာ' },
      { hanzi: '十', pinyin: 'shí', tone: 2, my: 'ဆယ်' },
      { hanzi: '使', pinyin: 'shǐ', tone: 3, my: 'ခိုင်း / သုံး' },
      { hanzi: '是', pinyin: 'shì', tone: 4, my: 'ဖြစ်သည်' },
    ],
  },
  {
    base: 'wu',
    chars: [
      { hanzi: '屋', pinyin: 'wū', tone: 1, my: 'အခန်း' },
      { hanzi: '无', pinyin: 'wú', tone: 2, my: 'မရှိ' },
      { hanzi: '五', pinyin: 'wǔ', tone: 3, my: 'ငါး' },
      { hanzi: '物', pinyin: 'wù', tone: 4, my: 'ပစ္စည်း' },
    ],
  },
  {
    base: 'tang',
    chars: [
      { hanzi: '汤', pinyin: 'tāng', tone: 1, my: 'ဟင်းချို' },
      { hanzi: '糖', pinyin: 'táng', tone: 2, my: 'သကြား' },
      { hanzi: '躺', pinyin: 'tǎng', tone: 3, my: 'လှဲ' },
      { hanzi: '烫', pinyin: 'tàng', tone: 4, my: 'ပူလောင်' },
    ],
  },
  {
    base: 'qi',
    chars: [
      { hanzi: '七', pinyin: 'qī', tone: 1, my: 'ခုနစ်' },
      { hanzi: '骑', pinyin: 'qí', tone: 2, my: 'စီး (မြင်း/စက်ဘီး)' },
      { hanzi: '起', pinyin: 'qǐ', tone: 3, my: 'ထ' },
      { hanzi: '气', pinyin: 'qì', tone: 4, my: 'လေ' },
    ],
  },
  {
    base: 'xi',
    chars: [
      { hanzi: '西', pinyin: 'xī', tone: 1, my: 'အနောက်' },
      { hanzi: '习', pinyin: 'xí', tone: 2, my: 'လေ့ကျင့်' },
      { hanzi: '洗', pinyin: 'xǐ', tone: 3, my: 'ဆေး' },
      { hanzi: '细', pinyin: 'xì', tone: 4, my: 'ပါး / သေးငယ်' },
    ],
  },
  {
    base: 'hu',
    chars: [
      { hanzi: '呼', pinyin: 'hū', tone: 1, my: 'အသက်ရှူ' },
      { hanzi: '湖', pinyin: 'hú', tone: 2, my: 'ကန်' },
      { hanzi: '虎', pinyin: 'hǔ', tone: 3, my: 'ကျား' },
      { hanzi: '户', pinyin: 'hù', tone: 4, my: 'အိမ်ထောင်စု' },
    ],
  },
  {
    base: 'tu',
    chars: [
      { hanzi: '秃', pinyin: 'tū', tone: 1, my: 'ထိပ်ပြောင်' },
      { hanzi: '图', pinyin: 'tú', tone: 2, my: 'ပုံ' },
      { hanzi: '土', pinyin: 'tǔ', tone: 3, my: 'မြေ' },
      { hanzi: '兔', pinyin: 'tù', tone: 4, my: 'ယုန်' },
    ],
  },
  {
    base: 'fen',
    chars: [
      { hanzi: '分', pinyin: 'fēn', tone: 1, my: 'မိနစ် / ခွဲ' },
      { hanzi: '坟', pinyin: 'fén', tone: 2, my: 'သင်္ချိုင်း' },
      { hanzi: '粉', pinyin: 'fěn', tone: 3, my: 'မှုန့်' },
      { hanzi: '份', pinyin: 'fèn', tone: 4, my: 'အစု / ပွဲ' },
    ],
  },
];

export const ZH_WORDS: WordItem[] = [
  { id: 'zh-wo', front: '我', reading: 'wǒ', meaning: 'ကျွန်တော် / ကျွန်မ' },
  { id: 'zh-ni', front: '你', reading: 'nǐ', meaning: 'မင်း / သင်' },
  { id: 'zh-ta', front: '他', reading: 'tā', meaning: 'သူ (ယောက်ျား)' },
  { id: 'zh-ta2', front: '她', reading: 'tā', meaning: 'သူမ' },
  { id: 'zh-hao', front: '好', reading: 'hǎo', meaning: 'ကောင်းသည်' },
  { id: 'zh-shi', front: '是', reading: 'shì', meaning: 'ဖြစ်သည်' },
  { id: 'zh-bu', front: '不', reading: 'bù', meaning: 'မ… (အငြင်း)' },
  { id: 'zh-ren', front: '人', reading: 'rén', meaning: 'လူ' },
  { id: 'zh-da', front: '大', reading: 'dà', meaning: 'ကြီးသည်' },
  { id: 'zh-xiao', front: '小', reading: 'xiǎo', meaning: 'သေးသည်' },
  { id: 'zh-zhongguo', front: '中国', reading: 'Zhōngguó', meaning: 'တရုတ်နိုင်ငံ' },
  { id: 'zh-miandian', front: '缅甸', reading: 'Miǎndiàn', meaning: 'မြန်မာ' },
  { id: 'zh-xiexie', front: '谢谢', reading: 'xièxie', meaning: 'ကျေးဇူးတင်ပါတယ်' },
  { id: 'zh-zaijian', front: '再见', reading: 'zàijiàn', meaning: 'နောက်မှ တွေ့မယ်' },
  { id: 'zh-shui', front: '水', reading: 'shuǐ', meaning: 'ရေ' },
  { id: 'zh-chi', front: '吃', reading: 'chī', meaning: 'စားသည်' },
  { id: 'zh-he', front: '喝', reading: 'hē', meaning: 'သောက်သည်' },
  { id: 'zh-qu', front: '去', reading: 'qù', meaning: 'သွားသည်' },
  { id: 'zh-lai', front: '来', reading: 'lái', meaning: 'လာသည်' },
  { id: 'zh-kan', front: '看', reading: 'kàn', meaning: 'ကြည့်သည်' },
  { id: 'zh-shuo', front: '说', reading: 'shuō', meaning: 'ပြောသည်' },
  { id: 'zh-mai', front: '买', reading: 'mǎi', meaning: 'ဝယ်သည်' },
  { id: 'zh-qian', front: '钱', reading: 'qián', meaning: 'ပိုက်ဆံ' },
  { id: 'zh-duoshao', front: '多少', reading: 'duōshao', meaning: 'ဘယ်လောက်' },
  { id: 'zh-jintian', front: '今天', reading: 'jīntiān', meaning: 'ဒီနေ့' },
  { id: 'zh-mingtian', front: '明天', reading: 'míngtiān', meaning: 'မနက်ဖြန်' },
  { id: 'zh-zuotian', front: '昨天', reading: 'zuótiān', meaning: 'မနေ့က' },
  { id: 'zh-pengyou', front: '朋友', reading: 'péngyou', meaning: 'သူငယ်ချင်း' },
  { id: 'zh-laoshi', front: '老师', reading: 'lǎoshī', meaning: 'ဆရာ / ဆရာမ' },
  { id: 'zh-xuesheng', front: '学生', reading: 'xuésheng', meaning: 'ကျောင်းသား' },
  { id: 'zh-jia', front: '家', reading: 'jiā', meaning: 'အိမ် / မိသားစု' },
  { id: 'zh-ai', front: '爱', reading: 'ài', meaning: 'ချစ်သည်' },
  { id: 'zh-xihuan', front: '喜欢', reading: 'xǐhuan', meaning: 'ကြိုက်သည်' },
  { id: 'zh-mifan', front: '米饭', reading: 'mǐfàn', meaning: 'ထမင်း' },
  { id: 'zh-gongzuo', front: '工作', reading: 'gōngzuò', meaning: 'အလုပ်' },
  { id: 'zh-yiyuan', front: '医院', reading: 'yīyuàn', meaning: 'ဆေးရုံ' },
  { id: 'zh-hanyu', front: '汉语', reading: 'Hànyǔ', meaning: 'တရုတ် စကား' },
  { id: 'zh-er', front: '二', reading: 'èr', meaning: 'နှစ်' },
  { id: 'zh-san', front: '三', reading: 'sān', meaning: 'သုံး' },
  { id: 'zh-shi2', front: '十', reading: 'shí', meaning: 'ဆယ်' },
];

export const ZH_TIPS: Record<string, DrillTip> = {
  tone: {
    title: 'အသံ (tone) ၄ မျိုး',
    tip: 'တရုတ် စကားမှာ tone မှားရင် စကားလုံး ပြောင်းသွားပါတယ် — mā (အမေ) နဲ့ mǎ (မြင်း)။ စကားလုံး တစ်လုံးချင်း tone ကို လက်နဲ့ ဆွဲပြီး ပြောကြည့်ပါ။',
  },
  retro: {
    title: 'zh / ch / sh / r',
    tip: 'zh, ch, sh, r ကို ပြောတဲ့အခါ လျှာဖျားကို နောက်ကို နည်းနည်း ကော့ပါ။ z, c, s ကတော့ လျှာဖျား သွားနောက်မှာ။ shì (是) နဲ့ sì (四) မှားလေ့ ရှိပါတယ်။',
  },
  jqx: {
    title: 'j / q / x',
    tip: 'j = "ကျ"၊ q = "ချ" (လေထွက်)၊ x = "ရှ" နီးပါး — နှုတ်ခမ်းကို ပြုံးသလို ဆွဲပြီး ပြောပါ။',
  },
  third: {
    title: 'တတိယ အသံ ၂ လုံး ဆက်ရင်',
    tip: 'တတိယ အသံ ၂ လုံး ဆက်လာရင် ရှေ့က တစ်လုံးကို ဒုတိယ အသံလို ပြောပါ: nǐ hǎo → ní hǎo။',
  },
  basic: {
    title: 'နှေးနှေး ပီပီသသ',
    tip: 'Pinyin ကို ကြည့်ပြီး tone တစ်ခုချင်း သေချာ ပြောပြီးမှ မြန်မြန် ဆက်ပြောပါ။',
  },
};

export const ZH_PHRASES: DrillItem[] = [
  { id: 'zp1', text: '你好', roman: 'nǐ hǎo', meaning: 'မင်္ဂလာပါ', tip: 'third' },
  { id: 'zp2', text: '谢谢', roman: 'xièxie', meaning: 'ကျေးဇူးတင်ပါတယ်', tip: 'jqx' },
  { id: 'zp3', text: '对不起', roman: 'duìbuqǐ', meaning: 'တောင်းပန်ပါတယ်', tip: 'jqx' },
  { id: 'zp4', text: '没关系', roman: 'méi guānxi', meaning: 'ကိစ္စ မရှိပါဘူး', tip: 'tone' },
  {
    id: 'zp5',
    text: '我是缅甸人',
    roman: 'wǒ shì Miǎndiàn rén',
    meaning: 'ကျွန်တော်/ကျွန်မ က မြန်မာ လူမျိုးပါ',
    tip: 'retro',
  },
  { id: 'zp6', text: '多少钱', roman: 'duōshao qián', meaning: 'ဘယ်လောက်လဲ', tip: 'jqx' },
  { id: 'zp7', text: '我不明白', roman: 'wǒ bù míngbai', meaning: 'နားမလည်ပါဘူး', tip: 'tone' },
  {
    id: 'zp8',
    text: '请再说一遍',
    roman: 'qǐng zài shuō yí biàn',
    meaning: 'နောက်တစ်ခါ ပြောပေးပါ',
    tip: 'retro',
  },
  {
    id: 'zp9',
    text: '我喜欢学汉语',
    roman: 'wǒ xǐhuan xué Hànyǔ',
    meaning: 'တရုတ် စာ သင်ရတာ ကြိုက်တယ်',
    tip: 'jqx',
  },
  {
    id: 'zp10',
    text: '你叫什么名字',
    roman: 'nǐ jiào shénme míngzi',
    meaning: 'နာမည် ဘယ်လို ခေါ်လဲ',
    tip: 'retro',
  },
  {
    id: 'zp11',
    text: '我在工厂工作',
    roman: 'wǒ zài gōngchǎng gōngzuò',
    meaning: 'စက်ရုံမှာ အလုပ်လုပ်ပါတယ်',
    tip: 'retro',
  },
  {
    id: 'zp12',
    text: '早上好',
    roman: 'zǎoshang hǎo',
    meaning: 'မင်္ဂလာ နံနက်ခင်းပါ',
    tip: 'third',
  },
  { id: 'zp13', text: '太贵了', roman: 'tài guì le', meaning: 'ဈေးကြီးလွန်းတယ်', tip: 'tone' },
  {
    id: 'zp14',
    text: '我想喝水',
    roman: 'wǒ xiǎng hē shuǐ',
    meaning: 'ရေ သောက်ချင်တယ်',
    tip: 'third',
  },
];
