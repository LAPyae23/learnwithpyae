'use client';
import React, { useState } from 'react';

interface Props {
  type: 'vocabulary' | 'grammar';
}

const vocabularyItems = [
  {
    word: '書く',
    reading: 'かく',
    romaji: 'kaku',
    meaning: 'ရေးသည်',
    example: '手紙を書いて、送ります。',
    exampleMy: 'စာရေးပြီး ပို့ပါတယ်။',
    level: 'N5',
  },
  {
    word: '待つ',
    reading: 'まつ',
    romaji: 'matsu',
    meaning: 'စောင့်သည်',
    example: 'バスを待っています。',
    exampleMy: 'ဘတ်စ်ကား စောင့်နေပါတယ်။',
    level: 'N5',
  },
  {
    word: '食べる',
    reading: 'たべる',
    romaji: 'taberu',
    meaning: 'စားသည်',
    example: '朝ごはんを食べてから出かけます。',
    exampleMy: 'မနက်စာ စားပြီးမှ အပြင်ထွက်ပါတယ်။',
    level: 'N5',
  },
  {
    word: '起きる',
    reading: 'おきる',
    romaji: 'okiru',
    meaning: 'အိပ်ရာထသည်',
    example: '7時に起きて、シャワーを浴びます。',
    exampleMy: '၇ နာရီမှာ ထပြီး ရေချိုးပါတယ်။',
    level: 'N5',
  },
  {
    word: '帰る',
    reading: 'かえる',
    romaji: 'kaeru',
    meaning: 'ပြန်သည် (အိမ်ပြန်)',
    example: '仕事が終わって、帰ります。',
    exampleMy: 'အလုပ်ပြီးလို့ အိမ်ပြန်ပါတယ်။',
    level: 'N5',
  },
  {
    word: '座る',
    reading: 'すわる',
    romaji: 'suwaru',
    meaning: 'ထိုင်သည်',
    example: 'ここに座ってもいいですか？',
    exampleMy: 'ဒီမှာ ထိုင်လို့ ရမလား?',
    level: 'N5',
  },
  {
    word: '勉強する',
    reading: 'べんきょうする',
    romaji: 'benkyou suru',
    meaning: 'စာကျက်သည်၊ လေ့လာသည်',
    example: '毎日勉強しています。',
    exampleMy: 'နေ့တိုင်း စာကျက်နေပါတယ်။',
    level: 'N5',
  },
  {
    word: '泳ぐ',
    reading: 'およぐ',
    romaji: 'oyogu',
    meaning: 'ရေကူးသည်',
    example: 'プールで泳いでいます。',
    exampleMy: 'ရေကူးကန်မှာ ရေကူးနေပါတယ်။',
    level: 'N5',
  },
];

const grammarItems = [
  {
    pattern: '〜てください',
    meaning: '...ပါ (တောင်းဆိုခြင်း)',
    explanation: 'ယဉ်ကျေးစွာ တောင်းဆိုတဲ့အခါ သုံးပါတယ်။ ကြိယာ て ပုံစံ နောက်မှာ ください ထည့်ပါ။',
    examples: [
      { jp: 'ここに名前を書いてください。', my: 'ဒီမှာ နာမည် ရေးပါ။' },
      { jp: 'ちょっと待ってください。', my: 'ခဏ စောင့်ပါ။' },
    ],
    level: 'N5',
  },
  {
    pattern: '〜ている',
    meaning: '...နေသည် / ...ထားသည်',
    explanation:
      'လုပ်နေဆဲ လုပ်ရပ် ဒါမှမဟုတ် ရလဒ် အခြေအနေကို ပြပါတယ်။ て ပုံစံ + いる နဲ့ ဖွဲ့ပါတယ်။',
    examples: [
      { jp: '今、テレビを見ています。', my: 'အခု တီဗီ ကြည့်နေပါတယ်။' },
      { jp: '彼は結婚しています。', my: 'သူ အိမ်ထောင်ကျထားပါတယ်။ (ရလဒ် အခြေအနေ)' },
    ],
    level: 'N5',
  },
  {
    pattern: '〜てもいいですか',
    meaning: '...လို့ ရမလား?',
    explanation: 'ခွင့်တောင်းတဲ့အခါ သုံးပါတယ်။ て ပုံစံ + もいいですか နဲ့ ဖွဲ့ပါတယ်။',
    examples: [
      { jp: 'トイレに行ってもいいですか？', my: 'အိမ်သာ သွားလို့ ရမလား?' },
      { jp: '窓を開けてもいいですか？', my: 'ပြတင်းပေါက် ဖွင့်လို့ ရမလား?' },
    ],
    level: 'N5',
  },
  {
    pattern: '〜てから',
    meaning: '...ပြီးမှ',
    explanation:
      'လုပ်ရပ် တစ်ခု ပြီးမှ နောက်တစ်ခု လုပ်တာကို ပြပါတယ်။ て ပုံစံ + から နဲ့ ဖွဲ့ပါတယ်။',
    examples: [
      { jp: '宿題をしてから、ゲームをします。', my: 'အိမ်စာ လုပ်ပြီးမှ ဂိမ်းကစားပါတယ်။' },
      { jp: '手を洗ってから、食べてください。', my: 'လက်ဆေးပြီးမှ စားပါ။' },
    ],
    level: 'N5',
  },
];

export default function VocabGrammarSummary({ type }: Props) {
  const [flipped, setFlipped] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  if (type === 'vocabulary') {
    const filtered = vocabularyItems.filter(
      (v) =>
        v.word.includes(search) ||
        v.reading.includes(search) ||
        v.meaning.includes(search) ||
        v.romaji.toLowerCase().includes(search.toLowerCase())
    );

    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-foreground">သင်ခန်းစာ ဝေါဟာရ</h3>
          <span className="text-xs text-muted-foreground">{vocabularyItems.length} လုံး</span>
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="စကားလုံး ရှာရန် (ဂျပန်၊ မြန်မာ၊ romaji)..."
          className="w-full text-sm bg-background border border-border rounded-lg px-3 py-2 mb-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#006633]/30 focus:border-[#006633]"
        />
        <div className="space-y-2">
          {filtered.map((item, i) => (
            <div
              key={i}
              onClick={() => setFlipped(flipped === i ? null : i)}
              className="border border-border rounded-lg p-3.5 cursor-pointer hover:border-[#006633]/40 hover:bg-[#006633]/5 transition-all duration-150"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <span className="text-xl font-bold text-foreground font-jp">{item.word}</span>
                  <span className="text-sm text-muted-foreground font-jp">{item.reading}</span>
                  <span className="text-xs text-muted-foreground italic">{item.romaji}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${item.level === 'N5' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}
                  >
                    {item.level}
                  </span>
                  <svg
                    className={`w-4 h-4 text-muted-foreground transition-transform ${flipped === i ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <p className="text-sm text-[#006633] font-medium mt-1">{item.meaning}</p>
              {flipped === i && (
                <div className="mt-2.5 pt-2.5 border-t border-border">
                  <p className="text-sm text-foreground mb-0.5 font-jp">{item.example}</p>
                  <p className="text-xs text-muted-foreground">{item.exampleMy}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Grammar tab
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-foreground">သဒ္ဒါပုံစံများ</h3>
        <span className="text-xs text-muted-foreground">{grammarItems.length} ခု</span>
      </div>
      <div className="space-y-4">
        {grammarItems.map((item, i) => (
          <div key={i} className="border border-border rounded-xl overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-muted/30">
              <div className="flex items-center gap-3">
                <span className="text-base font-bold text-foreground font-mono">
                  {item.pattern}
                </span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${item.level === 'N5' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}
                >
                  {item.level}
                </span>
              </div>
              <span className="text-sm text-[#006633] font-medium">{item.meaning}</span>
            </div>
            <div className="px-4 py-3">
              <p className="text-sm text-muted-foreground mb-3">{item.explanation}</p>
              <div className="space-y-2">
                {item.examples.map((ex, ei) => (
                  <div key={ei} className="bg-muted/40 rounded-lg px-3 py-2.5">
                    <p className="text-sm font-medium text-foreground font-jp">{ex.jp}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{ex.my}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
