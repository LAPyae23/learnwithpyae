import React from 'react';
import Icon from '@/components/ui/AppIcon';

const features = [
  {
    id: 'feat-video',
    icon: 'PlayCircleIcon',
    title: 'Video သင်ခန်းစာများ',
    description:
      'သဒ္ဒါနဲ့ ဝေါဟာရတွေကို မြန်မာလို ရှင်းပြထားတဲ့ video တိုလေးတွေ။ Data သက်သာအောင် အရည်အသွေး ရွေးကြည့်နိုင်ပါတယ်။',
    color: 'text-level-n5',
    bg: 'bg-blue-50',
  },
  {
    id: 'feat-srs',
    icon: 'RectangleStackIcon',
    title: 'Spaced Repetition Flashcard',
    description:
      'မေ့ခါနီးမှ ပြန်ပြပေးတဲ့ SM-2 စနစ်နဲ့ ဝေါဟာရ၊ kanji၊ သဒ္ဒါတွေကို အသံထွက်နဲ့တကွ မှတ်မိလွယ်အောင် ကျက်ပါ။',
    color: 'text-primary',
    bg: 'bg-secondary',
  },
  {
    id: 'feat-mock',
    icon: 'DocumentTextIcon',
    title: 'JLPT Mock Test များ',
    description:
      'အစစ်အမှန် JLPT ပုံစံအတိုင်း အချိန်မှတ်ပြီး ဖြေရတဲ့ စမ်းသပ်စာမေးပွဲ။ အပိုင်းအလိုက် ရမှတ်နဲ့ အားနည်းချက်ကို ပြပေးပါတယ်။',
    color: 'text-level-n2',
    bg: 'bg-orange-50',
  },
  {
    id: 'feat-grammar',
    icon: 'LanguageIcon',
    title: 'သဒ္ဒါပုံစံ စုစည်းမှု',
    description:
      'JLPT သဒ္ဒါပုံစံတွေကို ဥပမာဝါကျ၊ အသုံးပြုပုံ မှတ်စု၊ ဆင်တူပုံစံ နှိုင်းယှဉ်ချက်တွေနဲ့ မြန်မာလို ရှာဖွေဖတ်ရှုနိုင်ပါတယ်။',
    color: 'text-level-n3',
    bg: 'bg-amber-50',
  },
  {
    id: 'feat-kanji',
    icon: 'PencilSquareIcon',
    title: 'Kanji ရေးနည်း အစီအစဉ်',
    description:
      'Kanji တစ်လုံးချင်းစီကို ဘယ်လိုရေးရမလဲ အစီအစဉ်အလိုက် ပြပေးပြီး ရေးနည်း လေ့ကျင့်ခန်းနဲ့ စမ်းသပ်နိုင်ပါတယ်။',
    color: 'text-level-n1',
    bg: 'bg-red-50',
  },
  {
    id: 'feat-progress',
    icon: 'ChartBarIcon',
    title: 'တိုးတက်မှု မှတ်တမ်း',
    description:
      'နေ့စဉ် လေ့လာချိန်၊ streak၊ စာမေးပွဲအတွက် အသင့်ဖြစ်မှု ရာခိုင်နှုန်းနဲ့ အပတ်စဉ် report တွေကို ကြည့်နိုင်ပါတယ်။',
    color: 'text-level-n4',
    bg: 'bg-green-50',
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-muted/40">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-card border border-border rounded-full px-4 py-1.5 mb-4">
            <Icon name="SparklesIcon" size={14} className="text-primary" />
            <span className="text-primary text-[13px] font-semibold">လိုအပ်တာ အားလုံး</span>
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-3">
            JLPT အောင်မြင်ဖို့ သီးသန့် ဒီဇိုင်းထုတ်ထားပါတယ်
          </h2>
          <p className="text-muted-foreground text-[16px] max-w-xl mx-auto">
            လုပ်ဆောင်ချက်တိုင်းကို JLPT စာမေးပွဲပုံစံနဲ့ အလုပ်လုပ်ရင်း အချိန်နည်းနည်းနဲ့ လေ့လာရတဲ့
            မြန်မာကျောင်းသားတွေရဲ့ လိုအပ်ချက်အတိုင်း ပြင်ဆင်ထားပါတယ်။
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="bg-card rounded-2xl border border-border shadow-card p-6 flex gap-4 card-hover"
            >
              <div
                className={`w-12 h-12 ${feature.bg} rounded-xl flex items-center justify-center flex-shrink-0`}
              >
                <Icon
                  name={feature.icon as Parameters<typeof Icon>[0]['name']}
                  size={22}
                  className={feature.color}
                />
              </div>
              <div>
                <h3 className="font-bold text-[15px] text-foreground mb-1.5">{feature.title}</h3>
                <p className="text-[13.5px] text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Learning path visual */}
        <div className="mt-12 bg-card border border-border rounded-2xl shadow-card p-8">
          <h3 className="font-bold text-[18px] text-foreground text-center mb-8">
            NihongoAcademy နဲ့ လေ့လာပုံ အဆင့်ဆင့်
          </h3>
          <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-0">
            {[
              {
                id: 'step-signup',
                step: '1',
                label: 'အကောင့်ဖွင့်',
                sub: 'အခမဲ့',
                icon: 'UserPlusIcon',
              },
              {
                id: 'step-test',
                step: '2',
                label: 'အဆင့်စစ်ဆေး',
                sub: '၁၀ မိနစ်',
                icon: 'ClipboardDocumentCheckIcon',
              },
              {
                id: 'step-level',
                step: '3',
                label: 'အဆင့်သတ်မှတ်',
                sub: 'N5–N3',
                icon: 'AcademicCapIcon',
              },
              {
                id: 'step-plan',
                step: '4',
                label: 'Plan ရွေး',
                sub: 'KBZPay / WavePay',
                icon: 'CreditCardIcon',
              },
              {
                id: 'step-study',
                step: '5',
                label: 'နေ့စဉ်လေ့လာ',
                sub: 'တစ်နေ့ ၃၀ မိနစ်',
                icon: 'BookOpenIcon',
              },
              {
                id: 'step-pass',
                step: '6',
                label: 'JLPT အောင်',
                sub: 'အောင်လက်မှတ်!',
                icon: 'TrophyIcon',
              },
            ].map((step, i) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center text-center w-28">
                  <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mb-2 border-2 border-primary/30">
                    <Icon
                      name={step.icon as Parameters<typeof Icon>[0]['name']}
                      size={20}
                      className="text-primary"
                    />
                  </div>
                  <p className="font-bold text-[13px] text-foreground">{step.label}</p>
                  <p className="text-[11px] text-muted-foreground">{step.sub}</p>
                </div>
                {i < 5 && (
                  <div className="hidden md:flex items-center mx-1">
                    <Icon name="ChevronRightIcon" size={18} className="text-muted-foreground" />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
