'use client';
import React from 'react';

type IntroSection = {
  type: 'intro';
  title: string;
  body: string;
};

type RuleSection = {
  type: 'rule';
  title: string;
  rules: { group: string; examples: string[] }[];
};

type UsageSection = {
  type: 'usage';
  title: string;
  usages: { label: string; jp: string; romaji: string; my: string }[];
};

type TipSection = {
  type: 'tip';
  title: string;
  tips: string[];
};

type ContentSection = IntroSection | RuleSection | UsageSection | TipSection;

const contentSections: ContentSection[] = [
  {
    type: 'intro',
    title: 'て ပုံစံ ဆိုတာ ဘာလဲ?',
    body: `て ပုံစံ (te-form) က ဂျပန်သဒ္ဒါမှာ အရေးကြီးဆုံး ကြိယာပုံစံတွေထဲက တစ်ခုပါ။ လုပ်ရပ်တွေကို ဆက်ပြောတဲ့အခါ၊ တောင်းဆိုတဲ့အခါ၊ ခွင့်တောင်းတဲ့အခါ၊ လုပ်နေဆဲ အခြေအနေကို ပြောတဲ့အခါတွေမှာ သုံးပါတယ်။ N5 မှာ စကားကို သဘာဝကျကျ ပြောနိုင်ဖို့ て ပုံစံကို ကျွမ်းကျင်အောင် လေ့လာထားဖို့ လိုပါတယ်။`,
  },
  {
    type: 'rule',
    title: 'ပြောင်းလဲပုံ စည်းမျဉ်း',
    rules: [
      {
        group: 'အုပ်စု ၁ (う ကြိယာ)',
        examples: [
          '書く (kaku) → 書いて',
          '泳ぐ (oyogu) → 泳いで',
          '話す (hanasu) → 話して',
          '待つ (matsu) → 待って',
          '死ぬ (shinu) → 死んで',
          '飲む (nomu) → 飲んで',
          '帰る (kaeru) → 帰って',
        ],
      },
      {
        group: 'အုပ်စု ၂ (る ကြိယာ)',
        examples: ['食べる (taberu) → 食べて', '見る (miru) → 見て', '起きる (okiru) → 起きて'],
      },
      { group: 'အုပ်စု ၃ (ပုံမှန်မဟုတ်)', examples: ['する (suru) → して', 'くる (kuru) → きて'] },
    ],
  },
  {
    type: 'usage',
    title: 'て ပုံစံ ရဲ့ အဓိက အသုံးများ',
    usages: [
      {
        label: '① လုပ်ရပ်တွေ ဆက်ခြင်း (...ပြီးတော့)',
        jp: '朝ごはんを食べて、学校に行きます。',
        romaji: 'Asagohan wo tabete, gakkou ni ikimasu.',
        my: 'မနက်စာ စားပြီး ကျောင်းသွားပါတယ်။',
      },
      {
        label: '② တောင်းဆိုခြင်း (...ပါ)',
        jp: 'ちょっと待ってください。',
        romaji: 'Chotto matte kudasai.',
        my: 'ခဏ စောင့်ပါ။',
      },
      {
        label: '③ လုပ်နေဆဲ (〜ている)',
        jp: '今、勉強しています。',
        romaji: 'Ima, benkyou shite imasu.',
        my: 'အခု စာကျက်နေပါတယ်။',
      },
      {
        label: '④ ခွင့်တောင်းခြင်း (〜てもいいですか)',
        jp: 'ここに座ってもいいですか？',
        romaji: 'Koko ni suwatte mo ii desu ka?',
        my: 'ဒီမှာ ထိုင်လို့ ရမလား?',
      },
    ],
  },
  {
    type: 'tip',
    title: '💡 မှားလေ့ရှိတဲ့ အချက်များ',
    tips: [
      'အုပ်စု ၁ နဲ့ အုပ်စု ၂ ကြိယာကို မရောပါစေနဲ့ — အဘိဓာန်ပုံစံက -eru / -iru နဲ့ ဆုံးလား သေချာ စစ်ပါ။',
      '帰る (kaeru) က အုပ်စု ၂ နဲ့ တူပေမယ့် တကယ်တော့ အုပ်စု ၁ ပါ။ ဒါကြောင့် 帰って ဖြစ်ပါတယ်။',
      'て ပုံစံ တစ်ခုတည်းနဲ့ ဝါကျ မပြည့်စုံပါဘူး — နောက်က ကြိယာ ဒါမှမဟုတ် ください စတာနဲ့ အမြဲ တွဲသုံးပါ။',
    ],
  },
];

export default function LessonContent() {
  return (
    <div className="space-y-6">
      {contentSections.map((section, idx) => (
        <div key={idx}>
          {section.type === 'intro' && (
            <div>
              <h3 className="text-base font-semibold text-foreground mb-2">{section.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{section.body}</p>
            </div>
          )}

          {section.type === 'rule' && (
            <div>
              <h3 className="text-base font-semibold text-foreground mb-3">{section.title}</h3>
              <div className="space-y-3">
                {section.rules.map((rule, ri) => (
                  <div key={ri} className="bg-muted/40 rounded-lg p-3 border border-border">
                    <p className="text-xs font-semibold text-[#006633] mb-2">{rule.group}</p>
                    <div className="flex flex-wrap gap-2">
                      {rule.examples.map((ex, ei) => (
                        <span
                          key={ei}
                          className="text-sm bg-background border border-border rounded-md px-2.5 py-1 text-foreground font-mono"
                        >
                          {ex}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {section.type === 'usage' && (
            <div>
              <h3 className="text-base font-semibold text-foreground mb-3">{section.title}</h3>
              <div className="space-y-3">
                {section.usages.map((u, ui) => (
                  <div key={ui} className="border border-border rounded-lg p-3.5 bg-background">
                    <p className="text-xs font-semibold text-muted-foreground mb-1.5">{u.label}</p>
                    <p className="text-lg font-medium text-foreground mb-0.5 font-jp">{u.jp}</p>
                    <p className="text-xs text-muted-foreground italic mb-1">{u.romaji}</p>
                    <p className="text-sm text-foreground/80">{u.my}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {section.type === 'tip' && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-amber-800 mb-2">{section.title}</h3>
              <ul className="space-y-1.5">
                {section.tips.map((tip, ti) => (
                  <li key={ti} className="flex items-start gap-2 text-sm text-amber-700">
                    <span className="flex-shrink-0 mt-0.5">⚠️</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
