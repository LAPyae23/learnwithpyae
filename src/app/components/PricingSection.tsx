import React from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

const plans = [
  {
    id: 'plan-monthly',
    name: 'လစဉ်',
    price: '15,000',
    billedAs: 'လစဉ် ပေးချေရပါမယ်',
    description: 'စာမေးပွဲ နီးလာချိန်မှာ အချိန်တို အာရုံစိုက်လေ့လာချင်သူတွေအတွက်။',
    features: [
      { id: 'pm-f1', text: 'JLPT အဆင့် ၁ ခု', included: true },
      { id: 'pm-f2', text: 'Video သင်ခန်းစာ + quiz', included: true },
      { id: 'pm-f3', text: 'Spaced repetition flashcard', included: true },
      { id: 'pm-f4', text: 'တစ်လ mock test ၃ ကြိမ်', included: true },
      { id: 'pm-f5', text: 'သဒ္ဒါပုံစံ စုစည်းမှု', included: false },
      { id: 'pm-f6', text: 'ဆရာ့ကို မေးခွန်းမေးခွင့်', included: false },
      { id: 'pm-f7', text: 'PDF စာရွက်များ download', included: false },
    ],
    cta: 'လစဉ် Plan ရွေးမယ်',
    highlighted: false,
  },
  {
    id: 'plan-quarterly',
    name: '၃ လ',
    price: '12,000',
    billedAs: '၃ လကို 36,000 Ks တစ်ကြိမ်တည်း',
    badge: 'အတန်ဆုံး',
    description: '၃ လမှ ၆ လအတွင်း စာမေးပွဲဖြေမယ့်သူတွေ အများဆုံး ရွေးချယ်ကြပါတယ်။',
    features: [
      { id: 'pq-f1', text: 'JLPT အဆင့် အားလုံး', included: true },
      { id: 'pq-f2', text: 'Video သင်ခန်းစာ + quiz', included: true },
      { id: 'pq-f3', text: 'Spaced repetition flashcard', included: true },
      { id: 'pq-f4', text: 'Mock test အကန့်အသတ်မဲ့', included: true },
      { id: 'pq-f5', text: 'သဒ္ဒါပုံစံ စုစည်းမှု', included: true },
      { id: 'pq-f6', text: 'ဆရာ့ကို မေးခွန်းမေးခွင့်', included: false },
      { id: 'pq-f7', text: 'PDF စာရွက်များ download', included: true },
    ],
    cta: '၃ လ Plan ရွေးမယ်',
    highlighted: true,
  },
  {
    id: 'plan-annual',
    name: 'တစ်နှစ်',
    price: '10,000',
    billedAs: 'တစ်နှစ် 120,000 Ks — 33% သက်သာ',
    description: 'တစ်နှစ်အတွင်း အဆင့်တွေ ဆက်တိုက် အောင်ချင်တဲ့သူတွေအတွက်။',
    features: [
      { id: 'pa-f1', text: 'JLPT အဆင့် အားလုံး', included: true },
      { id: 'pa-f2', text: 'Video သင်ခန်းစာ + quiz', included: true },
      { id: 'pa-f3', text: 'Spaced repetition flashcard', included: true },
      { id: 'pa-f4', text: 'Mock test အကန့်အသတ်မဲ့', included: true },
      { id: 'pa-f5', text: 'သဒ္ဒါပုံစံ စုစည်းမှု', included: true },
      { id: 'pa-f6', text: 'ဆရာ့ကို မေးခွန်းမေးခွင့် (တစ်လ ၂ ကြိမ်)', included: true },
      { id: 'pa-f7', text: 'PDF စာရွက်များ download', included: true },
    ],
    cta: 'တစ်နှစ် Plan ရွေးမယ်',
    highlighted: false,
  },
];

const paymentMethods = ['KBZPay', 'WavePay', 'AYA Pay', 'CB Pay'];

export default function PricingSection() {
  return (
    <section id="pricing" className="py-20 bg-background">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-secondary border border-green-200 rounded-full px-4 py-1.5 mb-4">
            <Icon name="CreditCardIcon" size={14} className="text-primary" />
            <span className="text-primary text-[13px] font-semibold">ရှင်းလင်းတဲ့ ဈေးနှုန်း</span>
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-3">
            ရိုးရှင်းတဲ့ plan များ၊ ဝှက်ထားတဲ့ ကြေး မရှိ
          </h2>
          <p className="text-muted-foreground text-[16px] max-w-lg mx-auto">
            ၇ ရက် အခမဲ့ စမ်းသုံးနိုင်ပါတယ်။ KBZPay၊ WavePay စတဲ့ mobile wallet တွေနဲ့
            ပေးချေနိုင်ပါတယ်။
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans?.map((plan) => (
            <div
              key={plan?.id}
              className={`relative rounded-2xl shadow-card flex flex-col ${
                plan?.highlighted
                  ? 'bg-primary text-white border-2 border-primary scale-105 shadow-card-hover'
                  : 'bg-card border border-border'
              }`}
            >
              {plan?.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 text-[11px] font-bold px-4 py-1 rounded-full shadow-sm">
                  {plan?.badge}
                </div>
              )}

              <div className="p-6 border-b border-white/10">
                <h3
                  className={`font-bold text-[17px] mb-1 ${plan?.highlighted ? 'text-white' : 'text-foreground'}`}
                >
                  {plan?.name}
                </h3>
                <div className="flex items-end gap-1 mb-1">
                  <span
                    className={`text-4xl font-bold tabular-nums ${plan?.highlighted ? 'text-white' : 'text-foreground'}`}
                  >
                    {plan?.price}
                  </span>
                  <span
                    className={`text-[14px] mb-1 ${plan?.highlighted ? 'text-white/70' : 'text-muted-foreground'}`}
                  >
                    Ks / လ
                  </span>
                </div>
                <p
                  className={`text-[12px] ${plan?.highlighted ? 'text-white/60' : 'text-muted-foreground'}`}
                >
                  {plan?.billedAs}
                </p>
                <p
                  className={`text-[13px] mt-3 ${plan?.highlighted ? 'text-white/80' : 'text-muted-foreground'}`}
                >
                  {plan?.description}
                </p>
              </div>

              <div className="p-6 flex-1">
                <ul className="space-y-3">
                  {plan?.features?.map((feature) => (
                    <li
                      key={feature?.id}
                      className={`flex items-center gap-2.5 text-[13px] ${
                        feature?.included
                          ? plan?.highlighted
                            ? 'text-white'
                            : 'text-foreground'
                          : plan?.highlighted
                            ? 'text-white/30'
                            : 'text-muted-foreground/50'
                      }`}
                    >
                      <Icon
                        name={feature?.included ? 'CheckCircleIcon' : 'XCircleIcon'}
                        size={16}
                        className={
                          feature?.included
                            ? plan?.highlighted
                              ? 'text-green-300'
                              : 'text-primary'
                            : 'text-muted-foreground/30'
                        }
                        variant={feature?.included ? 'solid' : 'outline'}
                      />
                      {feature?.text}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-6 pt-0">
                <Link
                  href="/login"
                  className={`block w-full text-center py-3 rounded-xl font-bold text-[14px] transition-all duration-150 active:scale-95 ${
                    plan?.highlighted
                      ? 'bg-white text-primary hover:bg-green-50'
                      : 'bg-primary text-white hover:bg-accent'
                  }`}
                >
                  {plan?.cta}
                </Link>
                <p
                  className={`text-center text-[11px] mt-2 ${plan?.highlighted ? 'text-white/50' : 'text-muted-foreground'}`}
                >
                  ၇ ရက် အခမဲ့ စမ်းသုံးနိုင်
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Payment methods */}
        <div className="mt-10 flex flex-col items-center gap-3">
          <p className="text-[13px] text-muted-foreground">ပေးချေနိုင်သော နည်းလမ်းများ</p>
          <div className="flex flex-wrap justify-center gap-2">
            {paymentMethods.map((m) => (
              <span
                key={m}
                className="bg-card border border-border rounded-lg px-4 py-2 text-[13px] font-semibold text-foreground"
              >
                {m}
              </span>
            ))}
          </div>
        </div>

        {/* One-time note */}
        <p className="text-center text-[13px] text-muted-foreground mt-6">
          တစ်ကြိမ်တည်း ပေးချင်ပါသလား? အဆင့်တစ်ခုချင်းစီကို 45,000 Ks မှစပြီး ဝယ်ယူနိုင်ပါတယ်။{' '}
          <a href="#courses" className="text-primary font-semibold hover:underline">
            သင်တန်းဈေးနှုန်း ကြည့်ရန် →
          </a>
        </p>
      </div>
    </section>
  );
}
