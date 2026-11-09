import React from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

const courses = [
  {
    id: 'course-n5',
    level: 'N5',
    levelClass: 'level-badge-n5',
    levelColor: 'text-level-n5',
    levelBg: 'bg-blue-50',
    borderColor: 'border-blue-200',
    accentColor: 'bg-level-n5',
    title: 'JLPT N5 — အခြေခံ ဂျပန်စာ',
    subtitle: 'ဟီရဂန၊ ခတခန နဲ့ ဝေါဟာရ ၈၀၀',
    description:
      'လုံးဝ မသိသေးသူတွေအတွက် အစကနေ စပါ။ ဟီရဂန၊ ခတခန၊ အခြေခံသဒ္ဒါနဲ့ N5 အတွက် လိုအပ်တဲ့ ဝေါဟာရ ၈၀၀ ကို မြန်မာလို ရှင်းလင်းချက်နဲ့ လေ့လာရပါမယ်။',
    lessons: 48,
    vocab: 800,
    kanji: 100,
    months: 3,
    price: '45,000 Ks',
    features: [
      'ဟီရဂန နဲ့ ခတခန အပြည့်အစုံ',
      'N5 သဒ္ဒါပုံစံ ~80 ခု',
      'အသံထွက်ပါ ဝေါဟာရ ၈၀၀',
      'Mock test ၅ စုံ',
    ],
    icon: 'StarIcon',
    popular: true,
  },
  {
    id: 'course-n4',
    level: 'N4',
    levelClass: 'level-badge-n4',
    levelColor: 'text-level-n4',
    levelBg: 'bg-green-50',
    borderColor: 'border-green-200',
    accentColor: 'bg-level-n4',
    title: 'JLPT N4 — အလယ်အလတ်အောက် ဂျပန်စာ',
    subtitle: 'Kanji ၃၀၀ နဲ့ နေ့စဉ်သုံး စကားပြော',
    description:
      'N5 အခြေခံပေါ်မှာ ဆက်တည်ဆောက်ပါ။ SSW (အထူးကျွမ်းကျင် အလုပ်သမား) ဗီဇာအတွက် လိုအပ်တဲ့ အဆင့်ဖြစ်ပြီး နေ့စဉ်ပြောဆိုမှုနဲ့ ရိုးရှင်းတဲ့ စာဖတ်ခြင်းကို လေ့လာရပါမယ်။',
    lessons: 64,
    vocab: 1500,
    kanji: 300,
    months: 4,
    price: '55,000 Ks',
    features: [
      'ရေးနည်းပါ kanji ၃၀၀',
      'N4 သဒ္ဒါပုံစံ ~120 ခု',
      'ဝေါဟာရ ၁,၅၀၀ flashcard',
      'Mock test ၈ စုံ',
    ],
    icon: 'BookOpenIcon',
  },
  {
    id: 'course-n3',
    level: 'N3',
    levelClass: 'level-badge-n3',
    levelColor: 'text-level-n3',
    levelBg: 'bg-amber-50',
    borderColor: 'border-amber-200',
    accentColor: 'bg-level-n3',
    title: 'JLPT N3 — အလယ်အလတ် ဂျပန်စာ',
    subtitle: 'စာဖတ်စွမ်းရည် နဲ့ kanji ၆၅၀',
    description:
      'ဂျပန်မှာ အလုပ်လုပ်ဖို့ အရေးကြီးတဲ့ အဆင့်ပါ။ Kanji ၆၅၀၊ ရှုပ်ထွေးတဲ့ သဒ္ဒါနဲ့ ဖတ်စာ၊ နားထောင်စွမ်းရည်ကို ခွဲခြမ်းစိတ်ဖြာချက်နဲ့ လေ့ကျင့်ရပါမယ်။',
    lessons: 88,
    vocab: 3750,
    kanji: 650,
    months: 6,
    price: '75,000 Ks',
    features: [
      'Kanji ၆၅၀ အသေးစိတ်',
      'ရှင်းလင်းချက်ပါ ဖတ်စာများ',
      'ဝေါဟာရ ၃,၇၅၀ flashcard',
      'Mock test ၁၀ စုံ',
    ],
    icon: 'DocumentTextIcon',
  },
];

export default function CourseCardsSection() {
  return (
    <section id="courses" className="py-20 bg-background">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-secondary border border-green-200 rounded-full px-4 py-1.5 mb-4">
            <Icon name="AcademicCapIcon" size={14} className="text-primary" />
            <span className="text-primary text-[13px] font-semibold">သင့်အဆင့်ကို ရွေးပါ</span>
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-3">
            JLPT N5 → N3 သင်တန်း လမ်းကြောင်း
          </h2>
          <p className="text-muted-foreground text-[16px] max-w-xl mx-auto">
            အခမဲ့ အဆင့်စစ်ဆေးမှုနဲ့ သင့်အဆင့်ကို သိနိုင်ပါတယ်။ လုံးဝ မသိသေးရင်တော့ N5 ကနေ စပါ။ N2
            သင်တန်းကို မကြာမီ ထည့်သွင်းပါမယ်။
          </p>
        </div>

        {/* Course grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 max-w-6xl mx-auto gap-5">
          {courses?.map((course) => (
            <div
              key={course?.id}
              className={`relative bg-card rounded-2xl border ${course?.borderColor} shadow-card card-hover overflow-hidden flex flex-col`}
            >
              {course?.popular && (
                <div className="absolute top-3 right-3 bg-primary text-white text-[11px] font-bold px-2.5 py-1 rounded-full z-10">
                  စတင်သူများအတွက်
                </div>
              )}

              {/* Level accent bar */}
              <div className={`h-1.5 w-full ${course?.accentColor}`} />

              <div className="p-5 flex flex-col flex-1">
                {/* Level badge + title */}
                <div className="flex items-start gap-3 mb-3">
                  <span
                    className={`text-[13px] font-bold px-2.5 py-1 rounded-lg ${course?.levelClass} flex-shrink-0`}
                  >
                    {course?.level}
                  </span>
                  <div>
                    <h3 className="font-bold text-[15px] text-foreground leading-tight">
                      {course?.title?.split('—')?.[0]?.trim()}
                    </h3>
                    <p className="text-[12px] text-muted-foreground mt-0.5">{course?.subtitle}</p>
                  </div>
                </div>

                <p className="text-[13px] text-muted-foreground leading-relaxed mb-4 flex-1">
                  {course?.description}
                </p>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className={`${course?.levelBg} rounded-lg p-2 text-center`}>
                    <p className={`font-bold text-[14px] ${course?.levelColor} tabular-nums`}>
                      {course?.lessons}
                    </p>
                    <p className="text-[10px] text-muted-foreground">သင်ခန်းစာ</p>
                  </div>
                  <div className={`${course?.levelBg} rounded-lg p-2 text-center`}>
                    <p className={`font-bold text-[14px] ${course?.levelColor} tabular-nums`}>
                      {course?.kanji}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Kanji</p>
                  </div>
                  <div className={`${course?.levelBg} rounded-lg p-2 text-center`}>
                    <p className={`font-bold text-[14px] ${course?.levelColor} tabular-nums`}>
                      {course?.months}+
                    </p>
                    <p className="text-[10px] text-muted-foreground">လ</p>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-1.5 mb-5">
                  {course?.features?.map((f, fi) => (
                    <li
                      key={`${course?.id}-feat-${fi}`}
                      className="flex items-center gap-2 text-[12.5px] text-foreground"
                    >
                      <Icon name="CheckCircleIcon" size={14} className={course?.levelColor} />
                      {f}
                    </li>
                  ))}
                </ul>

                {/* Price + CTA */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div>
                    <span className="text-[22px] font-bold text-foreground">{course?.price}</span>
                    <span className="text-[12px] text-muted-foreground"> / တစ်ကြိမ်တည်း</span>
                  </div>
                  <Link
                    href="/login"
                    className={`text-[13px] font-bold px-4 py-2 rounded-lg text-white transition-all duration-150 active:scale-95 ${course?.accentColor} hover:opacity-90`}
                  >
                    စာရင်းသွင်းမယ်
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Placement test CTA */}
        <div className="mt-10 bg-secondary border border-green-200 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
              <Icon name="ClipboardDocumentCheckIcon" size={24} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-[16px] text-foreground">
                ဘယ်အဆင့်က စရမလဲ မသေချာဘူးလား?
              </h3>
              <p className="text-[14px] text-muted-foreground">
                ၁၀ မိနစ်ကြာ အခမဲ့ အဆင့်စစ်ဆေးမှုကို ဖြေပါ — သင့်အတွက် သင့်တော်တဲ့ အဆင့်ကို
                အကြံပြုပေးပါမယ်။
              </p>
            </div>
          </div>
          <Link
            href="/login"
            className="flex-shrink-0 bg-primary text-white font-bold text-[14px] px-6 py-3 rounded-xl hover:bg-accent transition-colors active:scale-95"
          >
            အဆင့်စစ်ဆေးမယ် — အခမဲ့
          </Link>
        </div>
      </div>
    </section>
  );
}
