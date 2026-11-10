'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import { useT } from '@/i18n/LocaleProvider';
import { DEFAULT_SETTINGS, PLAN_IDS, formatKs, type SiteSettingsData } from '@/data/payment';

const FREE_FOREVER = [
  'Video သင်ခန်းစာ (Free) အားလုံး',
  'Flashcard (spaced repetition) အကန့်အသတ်မဲ့',
  'JLPT Mock Test အကန့်အသတ်မဲ့',
  'Kanji လက်ရေး + အသံထွက် လေ့ကျင့်ခန်း',
  'AI ဆရာ — တစ်ရက် ၂၀ ကြိမ်',
  'စာလုပ်ဖော် အုပ်စု၊ ဆရာ Follow၊ comment',
  'Telegram နေ့စဉ် သတိပေးချက်',
];

const SUPPORTER = [
  '⭐ ဆရာတွေ Premium လို့ ရွေးထားတဲ့ သင်ခန်းစာများ',
  '🤖 AI ဆရာ — တစ်ရက် ၂၀၀ ကြိမ်',
  '🎁 ပိုက်ဆံ မတတ်နိုင်တဲ့ ကျောင်းသား တစ်ယောက်ကို Premium လက်ဆောင် ပေးရာ ရောက်မယ်',
  '👩‍🏫 ပေးငွေရဲ့ တစ်ဝက်က ဆရာ/ဆရာမတွေဆီ တိုက်ရိုက် ရောက်မယ်',
  '⭐ Comment နဲ့ အုပ်စု chat မှာ Supporter badge',
];

const EARN = [
  { icon: '🔥', title: 'Streak ၃၀ ရက်', desc: 'နေ့တိုင်း ၃၀ ရက် ဆက်တိုက် လေ့လာရင် Premium ၁ လ' },
  {
    icon: '👥',
    title: 'သူငယ်ချင်း ၃ ယောက် ဖိတ်',
    desc: 'ဖိတ်ထားသူ ၃ ယောက် စာစလုပ်ရင် Premium ၁ လ',
  },
  {
    icon: '🏆',
    title: 'အုပ်စု ပြိုင်ပွဲ ပထမ',
    desc: 'အပတ်စဉ် အုပ်စု ပြိုင်ပွဲ ပထမ ရရင် Premium ၇ ရက်',
  },
  { icon: '🎓', title: 'ပညာသင်ဆု', desc: 'ပိုက်ဆံ မတတ်နိုင်ရင် လျှောက်ပါ — ပံ့ပိုးသူတွေက ပေးမယ်' },
];

export default function PricingSection() {
  const tr = useT();
  const [s, setS] = useState<SiteSettingsData>({ ...DEFAULT_SETTINGS, accounts: [] });
  useEffect(() => {
    fetch('/api/settings')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setS(d))
      .catch(() => {});
  }, []);
  const plans = PLAN_IDS.filter((id) => s.plans[id].enabled);
  const methods = s.accounts.length ? s.accounts.map((a) => a.method) : ['KBZPay', 'WavePay'];

  return (
    <section id="pricing" className="py-20 bg-background">
      <div className="max-w-screen-xl mx-auto px-6 lg:px-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-secondary border border-green-200 rounded-full px-4 py-1.5 mb-4">
            <Icon name="HeartIcon" size={14} className="text-primary" />
            <span className="text-primary text-[13px] font-semibold">
              {tr('လေ့လာခြင်းက လူတိုင်းအတွက်')}
            </span>
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-3">
            {tr('လေ့လာတာ အမြဲ အခမဲ့ — Premium က ပံ့ပိုးမှု')}
          </h2>
          <p className="text-muted-foreground text-[16px] max-w-2xl mx-auto">
            {tr(
              'ပိုက်ဆံ မရှိလို့ ဘယ်သူမှ ဘာသာစကား မလေ့လာရဘဲ မဖြစ်စေရပါ။ အဓိက feature အားလုံး အခမဲ့ပါ။ Premium ဝယ်သူတွေက ဆရာတွေနဲ့ ပိုက်ဆံ မတတ်နိုင်တဲ့ ကျောင်းသားတွေကို ကူညီရာ ရောက်ပါတယ်။'
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* Free */}
          <div className="rounded-2xl bg-card border border-border p-6 flex flex-col shadow-card">
            <p className="font-bold text-[18px]">{tr('🆓 အခမဲ့ — အမြဲတမ်း')}</p>
            <p className="text-4xl font-bold mt-2">0 Ks</p>
            <p className="text-[13px] text-muted-foreground mt-1">
              {tr('ကန့်သတ်ချိန် မရှိ၊ card မလို')}
            </p>
            <ul className="space-y-2.5 mt-5 flex-1">
              {FREE_FOREVER.map((f) => (
                <li key={f} className="flex items-start gap-2 text-[13.5px]">
                  <Icon
                    name="CheckCircleIcon"
                    size={17}
                    variant="solid"
                    className="text-primary mt-0.5 flex-shrink-0"
                  />
                  {tr(f)}
                </li>
              ))}
            </ul>
            <Link
              href="/login"
              className="mt-6 block text-center py-3 rounded-xl bg-primary text-white font-bold text-[14px] hover:bg-accent"
            >
              {tr('အခမဲ့ စလေ့လာမယ်')}
            </Link>
          </div>

          {/* Supporter */}
          <div className="rounded-2xl bg-primary text-white p-6 flex flex-col shadow-card-hover relative">
            <span className="absolute -top-3 left-6 bg-amber-400 text-amber-900 text-[11px] font-bold px-3 py-1 rounded-full">
              ⭐ Premium Supporter
            </span>
            <p className="font-bold text-[18px] mt-1">⭐ Premium</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {plans.map((id) => (
                <div key={id} className="bg-white/10 rounded-xl px-3 py-2">
                  <p className="text-[12px] text-white/75">{s.plans[id].name}</p>
                  <p className="font-bold text-[16px] tabular-nums">
                    {formatKs(s.plans[id].amount)}
                  </p>
                </div>
              ))}
            </div>
            <ul className="space-y-2.5 mt-5 flex-1">
              {SUPPORTER.map((f) => (
                <li key={f} className="text-[13.5px] text-white/95">
                  {tr(f)}
                </li>
              ))}
            </ul>
            <Link
              href="/billing"
              className="mt-6 block text-center py-3 rounded-xl bg-white text-primary font-bold text-[14px] hover:bg-green-50"
            >
              {tr('Premium နဲ့ ပံ့ပိုးမယ်')}
            </Link>
          </div>
        </div>

        {/* Earn premium */}
        <div className="max-w-5xl mx-auto mt-12">
          <h3 className="text-center text-[20px] font-bold mb-1">
            {tr('💪 ကြိုးစားမှုနဲ့ Premium အခမဲ့ ရယူပါ')}
          </h3>
          <p className="text-center text-[14px] text-muted-foreground mb-5">
            {tr('ပိုက်ဆံ ရှိသူက ပိုက်ဆံနဲ့၊ မရှိသူက ကြိုးစားမှုနဲ့ — ဘယ်သူမှ ဘေးမကျန်ခဲ့ပါဘူး')}
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {EARN.map((e) => (
              <div
                key={e.title}
                className="bg-card border border-border rounded-2xl p-4 text-center"
              >
                <p className="text-3xl">{e.icon}</p>
                <p className="font-bold text-[14px] mt-2">{tr(e.title)}</p>
                <p className="text-[12.5px] text-muted-foreground mt-1">{tr(e.desc)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center gap-3">
          <p className="text-[13px] text-muted-foreground">{tr('ပေးချေနိုင်သော နည်းလမ်းများ')}</p>
          <div className="flex flex-wrap justify-center gap-2">
            {methods.map((m) => (
              <span
                key={m}
                className="bg-card border border-border rounded-lg px-4 py-2 text-[13px] font-semibold"
              >
                {m}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
