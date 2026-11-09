/**
 * Flashcard content source. `npm run seed` upserts this into MongoDB.
 * Add new cards here (with a unique `key`) and re-run the seed — existing cards are updated, not duplicated.
 */
export type CardType = 'vocabulary' | 'kanji' | 'grammar';
export type Level = 'N5' | 'N4' | 'N3' | 'N2' | 'N1';

export interface DeckSeed {
  slug: string;
  label: string;
  level: Level;
  type: CardType;
  order: number;
}

export interface CardSeed {
  key: string;
  deck: string; // deck slug
  front: string;
  reading: string;
  back: string;
  example: string;
  exampleMy: string;
}

export const decks: DeckSeed[] = [
  { slug: 'n5-vocab', label: 'N5 ဝေါဟာရ', level: 'N5', type: 'vocabulary', order: 1 },
  { slug: 'n5-kanji', label: 'N5 Kanji', level: 'N5', type: 'kanji', order: 2 },
  { slug: 'n5-grammar', label: 'N5 သဒ္ဒါ', level: 'N5', type: 'grammar', order: 3 },
  { slug: 'n4-vocab', label: 'N4 ဝေါဟာရ', level: 'N4', type: 'vocabulary', order: 4 },
];

const c = (
  key: string,
  deck: string,
  front: string,
  reading: string,
  back: string,
  example: string,
  exampleMy: string
): CardSeed => ({ key, deck, front, reading, back, example, exampleMy });

export const cards: CardSeed[] = [
  // N5 vocabulary
  c('n5v1', 'n5-vocab', '食べる', 'たべる', 'စားသည်', '朝ごはんを食べます。', 'မနက်စာ စားပါတယ်။'),
  c('n5v2', 'n5-vocab', '飲む', 'のむ', 'သောက်သည်', '水を飲みます。', 'ရေ သောက်ပါတယ်။'),
  c('n5v3', 'n5-vocab', '行く', 'いく', 'သွားသည်', '学校に行きます。', 'ကျောင်းကို သွားပါတယ်။'),
  c(
    'n5v4',
    'n5-vocab',
    '友達',
    'ともだち',
    'သူငယ်ချင်း',
    '友達と映画を見ます。',
    'သူငယ်ချင်းနဲ့ ရုပ်ရှင်ကြည့်ပါတယ်။'
  ),
  c(
    'n5v5',
    'n5-vocab',
    '先生',
    'せんせい',
    'ဆရာ / ဆရာမ',
    '田中先生は優しいです。',
    'ဆရာ တာနာကာက သဘောကောင်းပါတယ်။'
  ),
  c('n5v6', 'n5-vocab', '駅', 'えき', 'ဘူတာ', '駅はどこですか。', 'ဘူတာ ဘယ်မှာလဲ။'),
  c(
    'n5v7',
    'n5-vocab',
    '高い',
    'たかい',
    'မြင့်သည်၊ ဈေးကြီးသည်',
    'このかばんは高いです。',
    'ဒီအိတ်က ဈေးကြီးပါတယ်။'
  ),
  c(
    'n5v8',
    'n5-vocab',
    '毎日',
    'まいにち',
    'နေ့တိုင်း',
    '毎日日本語を勉強します。',
    'နေ့တိုင်း ဂျပန်စာ လေ့လာပါတယ်။'
  ),

  // N5 kanji
  c(
    'n5k1',
    'n5-kanji',
    '日',
    'にち / ひ',
    'နေ့၊ နေ',
    '日曜日に休みます。',
    'တနင်္ဂနွေနေ့မှာ နားပါတယ်။'
  ),
  c('n5k2', 'n5-kanji', '月', 'げつ / つき', 'လ၊ လမင်း', '月がきれいです。', 'လမင်းက လှပါတယ်။'),
  c('n5k3', 'n5-kanji', '水', 'すい / みず', 'ရေ', '水をください。', 'ရေ ပေးပါ။'),
  c(
    'n5k4',
    'n5-kanji',
    '人',
    'じん / ひと',
    'လူ',
    'あの人はミャンマー人です。',
    'ဟိုလူက မြန်မာလူမျိုးပါ။'
  ),
  c(
    'n5k5',
    'n5-kanji',
    '山',
    'さん / やま',
    'တောင်',
    '富士山は高いです。',
    'ဖူဂျီတောင်က မြင့်ပါတယ်။'
  ),
  c(
    'n5k6',
    'n5-kanji',
    '学',
    'がく / まな(ぶ)',
    'သင်ယူခြင်း',
    '大学で勉強します。',
    'တက္ကသိုလ်မှာ ပညာသင်ပါတယ်။'
  ),

  // N5 grammar
  c(
    'n5g1',
    'n5-grammar',
    '〜は〜です',
    'wa ... desu',
    '... က ... ဖြစ်ပါတယ်',
    '私は学生です。',
    'ကျွန်တော်က ကျောင်းသားပါ။'
  ),
  c(
    'n5g2',
    'n5-grammar',
    '〜を〜ます',
    'o ... masu',
    '... ကို ... လုပ်ပါတယ် (ကံ ဝိဘတ်)',
    'パンを食べます。',
    'ပေါင်မုန့်ကို စားပါတယ်။'
  ),
  c(
    'n5g3',
    'n5-grammar',
    '〜に行きます',
    'ni ikimasu',
    '... ကို သွားပါတယ် (ဦးတည်ရာ)',
    '日本に行きます。',
    'ဂျပန်ကို သွားပါမယ်။'
  ),
  c(
    'n5g4',
    'n5-grammar',
    '〜てください',
    'te kudasai',
    '... ပါ (ယဉ်ကျေးစွာ တောင်းဆိုခြင်း)',
    'ちょっと待ってください。',
    'ခဏ စောင့်ပါ။'
  ),
  c(
    'n5g5',
    'n5-grammar',
    '〜たいです',
    'tai desu',
    '... ချင်ပါတယ်',
    '日本で働きたいです。',
    'ဂျပန်မှာ အလုပ်လုပ်ချင်ပါတယ်။'
  ),

  // N4 vocabulary
  c(
    'n4v1',
    'n4-vocab',
    '大切',
    'たいせつ',
    'အရေးကြီးသော၊ တန်ဖိုးရှိသော',
    '健康は大切です。',
    'ကျန်းမာရေးက အရေးကြီးပါတယ်။'
  ),
  c(
    'n4v2',
    'n4-vocab',
    '不便',
    'ふべん',
    'အဆင်မပြေသော',
    '駅から遠くて不便です。',
    'ဘူတာနဲ့ ဝေးလို့ အဆင်မပြေပါဘူး။'
  ),
  c(
    'n4v3',
    'n4-vocab',
    '親切',
    'しんせつ',
    'ကြင်နာသော',
    '親切な人に助けてもらいました。',
    'ကြင်နာတဲ့လူ တစ်ယောက်က ကူညီပေးခဲ့တယ်။'
  ),
  c(
    'n4v4',
    'n4-vocab',
    '丁寧',
    'ていねい',
    'ယဉ်ကျေးသော၊ သေချာသော',
    '丁寧に説明してください。',
    'သေချာ ရှင်းပြပေးပါ။'
  ),
  c(
    'n4v5',
    'n4-vocab',
    '準備',
    'じゅんび',
    'ပြင်ဆင်ခြင်း',
    '試験の準備をしています。',
    'စာမေးပွဲအတွက် ပြင်ဆင်နေပါတယ်။'
  ),
];
