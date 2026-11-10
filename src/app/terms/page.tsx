import type { Metadata } from 'next';
import LegalPage, { type LegalSection } from '../components/LegalPage';
import { getLocale } from '@/i18n/server';
import { getSiteSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Terms of Service — NihongoAcademy' };

const UPDATED = '2026-11-10';

async function info() {
  const s = await getSiteSettings().catch(() => null);
  const acc = s?.accounts.find((a) => a.enabled && a.number);
  return {
    contact: acc ? `${acc.number}${acc.name ? ` (${acc.name})` : ''}` : 'Admin',
    teacherShare: s?.teacherSharePct ?? 50,
    commission: s?.tutorCommissionPct ?? 20,
  };
}

type Info = Awaited<ReturnType<typeof info>>;

function my(i: Info): { title: string; intro: string; sections: LegalSection[] } {
  return {
    title: 'ဝန်ဆောင်မှု စည်းကမ်းချက်များ',
    intro:
      'NihongoAcademy ကို အသုံးပြုခြင်း သို့မဟုတ် အကောင့်ဖွင့်ခြင်းဖြင့် ဤစည်းကမ်းချက်များနှင့် ကိုယ်ရေးအချက်အလက် မူဝါဒကို သဘောတူပါသည်။',
    sections: [
      {
        heading: 'ဝန်ဆောင်မှု',
        body: [
          'NihongoAcademy သည် ဂျပန်၊ တရုတ်၊ ကိုရီးယား နှင့် English ဘာသာစကား လေ့လာရန် online platform ဖြစ်သည်။ အဓိက feature များ အခမဲ့ ဖြစ်ပြီး Premium သည် ထပ်ဆောင်း သင်ခန်းစာ နှင့် AI အကြိမ်ရေ ပေးသော ပံ့ပိုးမှု ဖြစ်သည်။',
        ],
      },
      {
        heading: 'အကောင့်',
        body: [
          'မှန်ကန်သော အချက်အလက်ဖြင့် လူတစ်ယောက် အကောင့်တစ်ခုသာ ဖွင့်ရမည်။ Password ကို လျှို့ဝှက်ထားရန် သင့်တာဝန် ဖြစ်သည်။ ဆု ရရန် အကောင့်အတု များစွာ ဖွင့်ခြင်းကို တွေ့ပါက ဆုများ ပြန်ရုပ်သိမ်းပြီး အကောင့် ပိတ်နိုင်သည်။',
        ],
      },
      {
        heading: 'Premium နှင့် ငွေပေးချေမှု',
        body: [
          'ငွေလွှဲပြီး screenshot တင်ပါက admin စစ်ဆေး အတည်ပြုပြီးမှ Premium စတင်ပါမည်။ ငွေလွှဲ မှားခြင်း၊ ငွေပြန်အမ်းခြင်း ကိစ္စများကို admin နှင့် တိုက်ရိုက် ဆက်သွယ် ဖြေရှင်းပါ။ ဈေးနှုန်းများကို ကြိုတင် အသိပေး၍ ပြောင်းလဲနိုင်ပြီး ဝယ်ပြီးသော Premium ကာလကို မထိခိုက်ပါ။',
        ],
      },
      {
        heading: 'ခွင့်မပြုသော အပြုအမူ',
        body: [
          'အခြားသူကို နှောင့်ယှက်ခြင်း၊ spam၊ အမုန်းစကား၊ လိမ်လည်ခြင်း၊ တရားမဝင် content တင်ခြင်း၊ system ကို ဖောက်ထွင်းရန် ကြိုးစားခြင်း၊ အခြားသူ၏ အကောင့်ကို သုံးခြင်း မပြုရ။ ချိုးဖောက်ပါက content ဖျက်ခြင်း သို့မဟုတ် အကောင့် ပိတ်ခြင်း ပြုနိုင်သည်။',
        ],
      },
      {
        heading: 'ဆရာ / ဆရာမ နှင့် content',
        body: [
          'တင်သော သင်ခန်းစာ၊ video နှင့် စာသားများကို ကိုယ်တိုင် ပိုင်ဆိုင်ရမည် သို့မဟုတ် သုံးခွင့် ရှိရမည်။ စာအုပ်၊ စာမေးပွဲ မေးခွန်း၊ အခြားသူ၏ video ကို ခွင့်မပြုဘဲ ကူးတင်ခြင်း မပြုရ။ မူပိုင်ခွင့် တိုင်ကြားချက် ရရှိပါက content ကို ဖယ်ရှားပါမည်။',
          'Content ၏ မူပိုင်ခွင့်သည် ဆရာ့ထံတွင်သာ ရှိပြီး platform ပေါ်တွင် ပြသရန်သာ NihongoAcademy ကို ခွင့်ပြုပါသည်။ ဆရာ ဖျက်လိုက်ပါက ပြသခြင်း ရပ်ပါမည်။',
          `Premium ဝင်ငွေ၏ ${i.teacherShare}% ကို ကြည့်ရှုသူ အရေအတွက်အလိုက် ဆရာများထံ ခွဲဝေပြီး 1-on-1 class ကြေး၏ ${i.commission}% ကို platform က ယူပါသည်။ ဤနှုန်းများကို ကြိုတင် အသိပေး၍ ပြောင်းလဲနိုင်သည်။`,
        ],
      },
      {
        heading: 'အလုပ်အကိုင် agency',
        body: [
          'Agency များသည် မြန်မာနိုင်ငံ၏ ပြည်ပ အလုပ်အကိုင် ဥပဒေ နှင့် လိုင်စင် လိုအပ်ချက်များကို လိုက်နာရမည်ဖြစ်ပြီး လေ့လာသူများထံမှ ဥပဒေနှင့် မညီသော ကြေးငွေ မတောင်းရ။ NihongoAcademy သည် ဆက်သွယ်ပေးရုံသာ ဖြစ်ပြီး agency နှင့် လေ့လာသူ အကြား သဘောတူညီချက်၏ အစိတ်အပိုင်း မဟုတ်ပါ။',
        ],
      },
      {
        heading: 'AI အဖြေများ',
        body: [
          'AI ဆရာ နှင့် AI စာစစ် အဖြေများ မှားနိုင်ပါသည်။ အရေးကြီးသော ကိစ္စများကို ဆရာ သို့မဟုတ် တရားဝင် အရင်းအမြစ်ဖြင့် ပြန်စစ်ပါ။',
        ],
      },
      {
        heading: 'ကုန်အမှတ်တံဆိပ်',
        body: [
          'JLPT®၊ HSK နှင့် TOPIK တို့သည် ၎င်းတို့၏ ပိုင်ရှင်များ၏ ကုန်အမှတ်တံဆိပ်များ ဖြစ်သည်။ NihongoAcademy သည် ထိုစာမေးပွဲ အဖွဲ့အစည်းများနှင့် ဆက်စပ်မှု မရှိဘဲ mock test များသည် လေ့ကျင့်ရန် ပုံစံတူ မေးခွန်းများသာ ဖြစ်သည်။',
        ],
      },
      {
        heading: 'တာဝန်ကန့်သတ်ချက်',
        body: [
          'ဝန်ဆောင်မှုကို ရှိသည့်အတိုင်း ပေးပါသည်။ စာမေးပွဲ အောင်မြင်ခြင်း သို့မဟုတ် အလုပ်ရခြင်းကို အာမမခံနိုင်ပါ။ ဥပဒေ ခွင့်ပြုသည့် အတိုင်းအတာအထိ တိုက်ရိုက် မဟုတ်သော ဆုံးရှုံးမှုများအတွက် တာဝန် မယူပါ။',
        ],
      },
      {
        heading: 'ပြောင်းလဲမှု၊ ဥပဒေ နှင့် ဆက်သွယ်ရန်',
        body: [
          `ဤစည်းကမ်းချက်များကို ပြောင်းလဲပါက ဤစာမျက်နှာ၏ ရက်စွဲကို ပြင်ပါမည်။ မြန်မာနိုင်ငံ ဥပဒေများနှင့်အညီ အဓိပ္ပာယ်ကောက်ယူပါသည်။ ဆက်သွယ်ရန်: ${i.contact}။`,
        ],
      },
    ],
  };
}

function en(i: Info): { title: string; intro: string; sections: LegalSection[] } {
  return {
    title: 'Terms of Service',
    intro:
      'By using NihongoAcademy or creating an account, you agree to these terms and to our Privacy Policy.',
    sections: [
      {
        heading: 'The service',
        body: [
          'NihongoAcademy is an online platform for learning Japanese, Chinese, Korean and English. Core features are free; Premium is a supporter plan that adds extra lessons and more AI use.',
        ],
      },
      {
        heading: 'Accounts',
        body: [
          'Use accurate details and one account per person. Keeping your password secret is your responsibility. If we find fake accounts made to collect rewards, we may take back the rewards and close the accounts.',
        ],
      },
      {
        heading: 'Premium and payments',
        body: [
          'After you transfer and upload a screenshot, Premium starts once the admin verifies it. Contact the admin directly about wrong transfers or refunds. Prices may change with notice; this does not affect Premium time you have already bought.',
        ],
      },
      {
        heading: 'Not allowed',
        body: [
          'Harassment, spam, hate speech, fraud, illegal content, attempts to break into the system, or using someone else’s account. Breaking these rules can lead to content removal or account closure.',
        ],
      },
      {
        heading: 'Teachers and content',
        body: [
          'You must own, or have the right to use, the lessons, videos and text you upload. Do not copy books, exam questions or other people’s videos without permission. We remove content when we receive a valid copyright complaint.',
          'Teachers keep the copyright in their content and allow NihongoAcademy only to show it on the platform. If a teacher deletes it, we stop showing it.',
          `${i.teacherShare}% of Premium revenue is shared with teachers by lesson views, and the platform keeps ${i.commission}% of 1-on-1 class fees. These rates may change with notice.`,
        ],
      },
      {
        heading: 'Job agencies',
        body: [
          'Agencies must follow Myanmar’s overseas employment laws and licensing rules and must not charge learners unlawful fees. NihongoAcademy only connects the two sides and is not a party to any agreement between an agency and a learner.',
        ],
      },
      {
        heading: 'AI answers',
        body: [
          'Answers from the AI tutor and AI writing check can be wrong. Check anything important with a teacher or an official source.',
        ],
      },
      {
        heading: 'Trademarks',
        body: [
          'JLPT®, HSK and TOPIK are trademarks of their owners. NihongoAcademy is not affiliated with those exam bodies; mock tests are practice questions in a similar style.',
        ],
      },
      {
        heading: 'Limitation of liability',
        body: [
          'The service is provided as is. We cannot guarantee that you will pass an exam or get a job. To the extent the law allows, we are not liable for indirect losses.',
        ],
      },
      {
        heading: 'Changes, law and contact',
        body: [
          `If these terms change we update the date on this page. They are governed by the laws of Myanmar. Contact: ${i.contact}.`,
        ],
      },
    ],
  };
}

export default async function TermsPage() {
  const locale = await getLocale();
  const i = await info();
  const c = locale === 'en' ? en(i) : my(i);
  return (
    <LegalPage
      title={c.title}
      updated={locale === 'en' ? `Last updated ${UPDATED}` : `နောက်ဆုံး ပြင်ဆင်သည့်ရက် ${UPDATED}`}
      intro={c.intro}
      sections={c.sections}
      backLabel={locale === 'en' ? 'Home' : 'ပင်မ'}
    />
  );
}
