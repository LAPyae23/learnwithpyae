'use client';
import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

const faqs = [
  {
    id: 'faq-001',
    question: 'Duolingo လို app တွေနဲ့ ဘာကွာလဲ?',
    answer:
      'NihongoAcademy က JLPT စာမေးပွဲ အောင်ဖို့ သီးသန့် ပြင်ဆင်ထားတာပါ။ သင်ခန်းစာ၊ quiz၊ flashcard တိုင်းက JLPT သင်ရိုးအတိုင်း ဖြစ်ပြီး mock test တွေကလည်း အစစ်အမှန် စာမေးပွဲပုံစံ၊ အချိန်သတ်မှတ်ချက်အတိုင်း ဖြေရပါတယ်။ အရေးကြီးဆုံးက ရှင်းလင်းချက် အားလုံးကို မြန်မာလို ရေးထားတာပါ။',
  },
  {
    id: 'faq-002',
    question: 'ဂျပန်စာ နည်းနည်း တတ်ပြီးသားဆိုရင် ဘယ်အဆင့်က စရမလဲ?',
    answer:
      'JLPT Mock Test ထဲက N5 နဲ့ N4 ကို အခမဲ့ ဖြေကြည့်ပါ။ ၆၀% ထက်ကျော်ရင် နောက်အဆင့်ကို စလို့ရပါတယ်။ လုံးဝ မသိသေးရင် N5 ကနေ စပါ။',
  },
  {
    id: 'faq-003',
    question: 'တစ်နေ့ ဘယ်လောက် လေ့လာသင့်လဲ?',
    answer:
      'တစ်နေ့ ၃၀ မိနစ်မှ ၁ နာရီ လေ့လာရင် တိုးတက်မှု ကောင်းပါတယ်။ Flashcard ပြန်လှန်ဖို့ တစ်နေ့ ၁၅ မိနစ်လောက်ပဲ လိုပါတယ်။ N5 ကို ၃ လအတွင်း အောင်ချင်ရင် တစ်နေ့ ၄၅ မိနစ်လောက် လေ့လာပါ။ တစ်ခါတည်း အကြာကြီး လေ့လာတာထက် နေ့တိုင်း ပုံမှန် လေ့လာတာက ပိုအရေးကြီးပါတယ်။',
  },
  {
    id: 'faq-004',
    question: 'ဘယ်လို ငွေပေးချေရမလဲ?',
    answer:
      'အဓိက feature အားလုံး အခမဲ့ပါ။ Premium နဲ့ ပံ့ပိုးချင်ရင် KBZPay / WavePay နဲ့ ငွေလွှဲပြီး screenshot တင်ပါ — ၂၄ နာရီအတွင်း ဖွင့်ပေးပါမယ်။ ပိုက်ဆံ မတတ်နိုင်ရင် streak ၃၀ ရက်၊ သူငယ်ချင်း ဖိတ်ခြင်း ဒါမှမဟုတ် ပညာသင်ဆု လျှောက်ပြီး Premium အခမဲ့ ရယူနိုင်ပါတယ်။',
  },
  {
    id: 'faq-005',
    question: 'ဖုန်းနဲ့ သုံးလို့ ရလား? Internet မကောင်းရင်ရော?',
    answer:
      'ရပါတယ်။ ဖုန်းမှာ အဆင်ပြေဆုံးဖြစ်အောင် ဒီဇိုင်းထုတ်ထားပါတယ်။ Home screen ပေါ် app လို install လုပ်လို့ရပြီး internet မရှိလည်း flashcard လေ့ကျင့်လို့ရပါတယ် — internet ပြန်ရရင် အလိုအလျောက် သိမ်းပေးပါတယ်။',
  },
  {
    id: 'faq-006',
    question: 'JLPT စာမေးပွဲကို မြန်မာမှာ ဘယ်တော့ ဖြေလို့ရလဲ?',
    answer:
      'JLPT ကို တစ်နှစ် ၂ ကြိမ် — ဇူလိုင်လ နဲ့ ဒီဇင်ဘာလ ပထမ တနင်္ဂနွေနေ့တွေမှာ ကျင်းပပါတယ်။ ရန်ကုန်နဲ့ မန္တလေးမှာ ဖြေဆိုနိုင်ပြီး စာရင်းသွင်းချိန်က စာမေးပွဲ မတိုင်ခင် ၃–၄ လလောက်မှာ ဖြစ်လေ့ရှိပါတယ်။ တိကျတဲ့ ရက်စွဲကို တရားဝင် ကြေညာချက်မှာ စစ်ဆေးပါ။',
  },
  {
    id: 'faq-007',
    question: 'အဆင့်တစ်ခု အောင်ပြီးရင် ဘာဆက်လုပ်ရမလဲ?',
    answer:
      'နောက်အဆင့်ကို ချက်ချင်း ဆက်လေ့လာနိုင်ပါတယ် — အဆင့်အားလုံး လူတိုင်းအတွက် ဖွင့်ထားပါတယ်။ ဂျပန်မှာ အလုပ်လုပ်ချင်ရင် "အလုပ်အကိုင်" မှာ profile ဖွင့်ထားပါ၊ ယုံကြည်ရတဲ့ agency တွေက ဆက်သွယ်လာနိုင်ပါတယ်။',
  },
];

export default function FAQSection() {
  const [openId, setOpenId] = useState<string | null>('faq-001');

  return (
    <section id="faq" className="py-20 bg-background">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-3">မေးလေ့ရှိသော မေးခွန်းများ</h2>
            <p className="text-muted-foreground text-[16px]">
              မေးစရာ ရှိသေးရင် email ပို့ပါ —{' '}
              <a
                href="mailto:support@nihongoacademy.com"
                className="text-primary font-semibold hover:underline"
              >
                support@nihongoacademy.com
              </a>
            </p>
          </div>

          {/* Accordion */}
          <div className="space-y-3">
            {faqs?.map((faq) => {
              const isOpen = openId === faq?.id;
              return (
                <div
                  key={faq?.id}
                  className={`bg-card border rounded-xl overflow-hidden transition-all duration-200 ${isOpen ? 'border-primary/40 shadow-card' : 'border-border'}`}
                >
                  <button
                    onClick={() => setOpenId(isOpen ? null : faq?.id)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left gap-4"
                    aria-expanded={isOpen}
                  >
                    <span
                      className={`font-semibold text-[14.5px] ${isOpen ? 'text-primary' : 'text-foreground'}`}
                    >
                      {faq?.question}
                    </span>
                    <Icon
                      name={isOpen ? 'ChevronUpIcon' : 'ChevronDownIcon'}
                      size={18}
                      className={
                        isOpen
                          ? 'text-primary flex-shrink-0'
                          : 'text-muted-foreground flex-shrink-0'
                      }
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 animate-fade-in">
                      <p className="text-[14px] text-muted-foreground leading-relaxed border-t border-border pt-4">
                        {faq?.answer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
