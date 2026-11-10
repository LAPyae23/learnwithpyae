import type { Metadata } from 'next';
import LegalPage, { type LegalSection } from '../components/LegalPage';
import { getLocale } from '@/i18n/server';
import { getSiteSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Privacy Policy — NihongoAcademy' };

const UPDATED = '2026-11-10';

async function contactLine() {
  const s = await getSiteSettings().catch(() => null);
  const acc = s?.accounts.find((a) => a.enabled && a.number);
  return acc ? `${acc.number}${acc.name ? ` (${acc.name})` : ''}` : 'Admin';
}

function my(contact: string): { title: string; intro: string; sections: LegalSection[] } {
  return {
    title: 'ကိုယ်ရေးအချက်အလက် မူဝါဒ',
    intro:
      'NihongoAcademy သည် သင့်ကိုယ်ရေးအချက်အလက်ကို ဝန်ဆောင်မှု ပေးရန် လိုအပ်သလောက်သာ ကောက်ယူပြီး မည်သူ့ကိုမျှ ရောင်းချခြင်း မပြုပါ။ ဤမူဝါဒသည် ဘာကို ကောက်ယူသလဲ၊ ဘာအတွက် သုံးသလဲ၊ မည်သူနှင့် မျှဝေသလဲ ကို ရှင်းပြပါသည်။',
    sections: [
      {
        heading: 'ကောက်ယူသော အချက်အလက်များ',
        body: [
          'အကောင့်: နာမည်၊ email နှင့် password (password ကို bcrypt ဖြင့် hash လုပ်ပြီးမှ သိမ်းသဖြင့် မူရင်းကို မည်သူမျှ မမြင်ရပါ)။',
          'လေ့လာမှု: flashcard အဖြေ၊ mock test ရလဒ်၊ streak၊ point၊ လေ့လာနေသော ဘာသာ၊ အုပ်စု message၊ comment၊ rating။',
          'ငွေပေးချေမှု: plan၊ ပမာဏ၊ ငွေလွှဲ နည်းလမ်း နှင့် ငွေလွှဲ screenshot။',
          'ဆရာ / agency / အလုပ် profile ဖွင့်ပါက သင်ထည့်သော အချက်အလက်များ၊ Telegram ချိတ်ပါက Telegram chat ID၊ AI feature သုံးပါက သင်ရေးသော မေးခွန်း/စာ။',
        ],
      },
      {
        heading: 'အသုံးပြုပုံ',
        body: [
          'လေ့လာမှု ဝန်ဆောင်မှု ပေးရန်၊ တိုးတက်မှု ပြရန်၊ learn-to-earn ဆု ပေးရန်၊ Premium ငွေလွှဲကို စစ်ဆေးရန်၊ ဆရာ ဝင်ငွေ တွက်ရန်၊ သင်ခွင့်ပြုထားပါက Telegram သတိပေးချက် ပို့ရန် သာ သုံးပါသည်။ ကြော်ငြာ tracking မသုံးပါ။',
        ],
      },
      {
        heading: 'မျှဝေသူများ',
        body: [
          'AI provider (OpenRouter, Groq စသည်): AI feature တွင် သင်ရေးသော စာကိုသာ အဖြေထုတ်ရန် ပို့ပါသည်။ AI ထဲသို့ ကိုယ်ရေး အချက်အလက် (ဖုန်း၊ လိပ်စာ) မရေးပါနှင့်။',
          'Agency: သင်ကိုယ်တိုင် အလုပ် profile ဖွင့်ထားမှသာ မြင်ရပြီး ဆက်သွယ်ရန် အချက်အလက်ကို သင် offer လက်ခံမှသာ ပေးပါသည်။ Admin စစ်ဆေး အတည်ပြုထားသော agency များသာ ဝင်ရောက်နိုင်ပါသည်။',
          'ဆရာ: သင် book လုပ်သော 1-on-1 class ၏ ဆရာသည် သင့်နာမည်ကို မြင်ရပါသည်။',
          'Hosting: Vercel (website) နှင့် MongoDB Atlas (database) တွင် သိမ်းဆည်းပါသည်။ ဥပဒေအရ တောင်းဆိုခြင်း မှအပ အခြားသူ မည်သူ့ကိုမျှ မပေးပါ။',
        ],
      },
      {
        heading: 'Cookie နှင့် ဖုန်းထဲတွင် သိမ်းသည်များ',
        body: [
          'Login အတွက် na_session cookie (httpOnly၊ HTTPS သာ) နှင့် ဘာသာစကား ရွေးချယ်မှုအတွက် na_locale cookie တစ်ခုစီသာ သုံးပါသည်။ လေ့ကျင့်ခန်း တိုးတက်မှု အချို့ကို သင့် browser ၏ localStorage တွင် သိမ်းပါသည်။',
        ],
      },
      {
        heading: 'လုံခြုံရေး',
        body: [
          'ချိတ်ဆက်မှု အားလုံး HTTPS၊ database ချိတ်ဆက်မှု TLS၊ API တိုင်းတွင် login နှင့် role စစ်ဆေးမှု၊ login အကြိမ်ရေ ကန့်သတ်ချက်၊ ငွေလွှဲ screenshot ကို admin သာ ကြည့်နိုင်ခြင်း စသည်ဖြင့် ကာကွယ်ထားပါသည်။ မည်သည့် online စနစ်မျှ ၁၀၀% မလုံခြုံနိုင်သဖြင့် password ကို အခြား website များနှင့် မတူအောင် ထားပါ။',
        ],
      },
      {
        heading: 'သိမ်းဆည်းထားသည့် ကာလ',
        body: [
          'နေ့စဉ် လေ့လာမှု point ကို ၁၂၀ ရက်အကြာတွင် အလိုအလျောက် ဖျက်ပါသည်။ အကောင့် အချက်အလက်ကို သင် ဖျက်ရန် တောင်းဆိုသည်အထိ သိမ်းပါသည်။ ငွေပေးချေမှု မှတ်တမ်းကို စာရင်းအင်း အတွက် ဆက်သိမ်းထားနိုင်ပါသည်။',
        ],
      },
      {
        id: 'delete',
        heading: 'သင့်အခွင့်အရေးနှင့် အကောင့်ဖျက်ခြင်း',
        body: [
          'Profile စာမျက်နှာတွင် နာမည်နှင့် လေ့လာသော ဘာသာကို ပြင်နိုင်ပြီး Telegram ကို ဖြုတ်နိုင်ပါသည်။ အကောင့်နှင့် အချက်အလက် အားလုံး ဖျက်လိုပါက အောက်ပါ ဆက်သွယ်ရန် နံပါတ်သို့ အကောင့်၏ email ကို ပြောပြီး တောင်းဆိုပါ — အကောင့်ပိုင်ရှင် ဟုတ်မဟုတ် စစ်ပြီး ၇ ရက်အတွင်း ဖျက်ပေးပါမည်။',
        ],
      },
      {
        heading: 'ကလေးများ',
        body: [
          'အသက် ၁၃ နှစ်အောက် ကလေးများသည် မိဘ သို့မဟုတ် အုပ်ထိန်းသူ၏ ခွင့်ပြုချက်ဖြင့်သာ အသုံးပြုရပါမည်။',
        ],
      },
      {
        heading: 'ဆက်သွယ်ရန် နှင့် ပြောင်းလဲမှု',
        body: [
          `ဆက်သွယ်ရန်: ${contact}။ ဤမူဝါဒကို ပြောင်းလဲပါက ဤစာမျက်နှာ၏ ရက်စွဲကို ပြင်ပြီး အရေးကြီးသော ပြောင်းလဲမှုကို app ထဲတွင် အသိပေးပါမည်။`,
        ],
      },
    ],
  };
}

function en(contact: string): { title: string; intro: string; sections: LegalSection[] } {
  return {
    title: 'Privacy Policy',
    intro:
      'NihongoAcademy collects only the personal data it needs to run the service and never sells it. This policy explains what we collect, why, and who we share it with.',
    sections: [
      {
        heading: 'What we collect',
        body: [
          'Account: name, email and password (stored only as a bcrypt hash, so nobody can see the original).',
          'Learning: flashcard answers, mock test results, streaks, points, the language you study, group messages, comments and ratings.',
          'Payments: plan, amount, payment method and your transfer screenshot.',
          'If you open a teacher, agency or job profile, what you enter there; if you link Telegram, your Telegram chat ID; if you use AI features, the text you write.',
        ],
      },
      {
        heading: 'How we use it',
        body: [
          'Only to provide lessons and practice, show progress, give learn-to-earn rewards, verify Premium payments, calculate teacher earnings and, if you allow it, send Telegram reminders. We use no advertising trackers.',
        ],
      },
      {
        heading: 'Who we share it with',
        body: [
          'AI providers (OpenRouter, Groq and similar): only the text you write in an AI feature, to produce the answer. Do not write personal details such as phone numbers or addresses into AI features.',
          'Agencies: they see your job profile only if you create one, and your contact details only after you accept their offer. Only agencies verified by the admin have access.',
          'Teachers: the teacher of a 1-on-1 class you book sees your name.',
          'Hosting: data is stored with Vercel (website) and MongoDB Atlas (database). We give it to no one else unless required by law.',
        ],
      },
      {
        heading: 'Cookies and local storage',
        body: [
          'We use one sign-in cookie, na_session (httpOnly, HTTPS only), and one language cookie, na_locale. Some practice progress is kept in your browser’s localStorage.',
        ],
      },
      {
        heading: 'Security',
        body: [
          'All traffic uses HTTPS and the database connection uses TLS. Every API checks your sign-in and role, sign-in attempts are rate-limited, and only the admin can view payment screenshots. No online system is 100% secure, so use a password you don’t use on other sites.',
        ],
      },
      {
        heading: 'How long we keep it',
        body: [
          'Daily study points are deleted automatically after 120 days. Account data is kept until you ask us to delete it. Payment records may be kept for accounting.',
        ],
      },
      {
        id: 'delete',
        heading: 'Your rights and deleting your account',
        body: [
          'You can edit your name and study language and unlink Telegram on your profile page. To delete your account and all its data, contact us at the number below and give your account’s email; we confirm you own the account and delete it within 7 days.',
        ],
      },
      {
        heading: 'Children',
        body: [
          'Children under 13 may use the service only with a parent’s or guardian’s permission.',
        ],
      },
      {
        heading: 'Contact and changes',
        body: [
          `Contact: ${contact}. If this policy changes we update the date on this page and announce important changes in the app.`,
        ],
      },
    ],
  };
}

export default async function PrivacyPage() {
  const locale = await getLocale();
  const contact = await contactLine();
  const c = locale === 'en' ? en(contact) : my(contact);
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
