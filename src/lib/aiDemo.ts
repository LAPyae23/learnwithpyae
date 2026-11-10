import 'server-only';
import {
  EXPLAIN_SYSTEM,
  INTERVIEW_SCORE_SYSTEM,
  INTERVIEW_SYSTEM,
  WRITING_SYSTEM,
} from './prompts';
import type { InterviewScore } from './interviewScore';

/**
 * Demo mode: canned answers so the AI features can be tried without any API key.
 * Every answer says clearly that it is a demo, not a real AI.
 */
export const DEMO_NOTE = '🧪 Demo mode — AI အစစ် မဟုတ်ပါ။ နမူနာ အဖြေပါ။\n\n';

interface Req {
  system: string;
  messages: { role: 'user' | 'assistant'; content: string }[];
}

const TOPICS: { match: RegExp; answer: string }[] = [
  {
    match: /は.*が|が.*は|wa.*ga/i,
    answer:
      '**は** နဲ့ **が** ကွာခြားချက်\n\n- **は** — ပြောမယ့် အကြောင်းအရာ (topic) ကို ပြတယ်။ 「私は学生です」 = ကျွန်တော်က ကျောင်းသားပါ။\n- **が** — အသစ်ပြောတဲ့ အချက်၊ "ဘယ်သူလဲ/ဘာလဲ" ကို အဖြေပေးတဲ့ subject။ 「誰が来ましたか。」「田中さんが来ました。」\n\n💡 မှတ်နည်း: မေးခွန်းထဲမှာ が ပါရင် အဖြေမှာလည်း が သုံးပါ။',
  },
  {
    match: /て.?(形|form|ပုံစံ)|te.?form/i,
    answer:
      '**て ပုံစံ** ဖွဲ့နည်း (အုပ်စု ၁)\n\n- く → いて (書く → 書いて)\n- ぐ → いで (泳ぐ → 泳いで)\n- む・ぶ・ぬ → んで (飲む → 飲んで)\n- う・つ・る → って (待つ → 待って)\n- す → して (話す → 話して)\n\nအုပ်စု ၂: る ဖြုတ်ပြီး て (食べる → 食べて)\n\n💡 ခြွင်းချက်: 行く → 行って',
  },
  {
    match: /です|ます|丁寧|polite/i,
    answer:
      '**です・ます** က ယဉ်ကျေးတဲ့ ပြောပုံပါ။\n\n- 学生**です**。 = ကျောင်းသားပါ။\n- 食べ**ます**。 = စားပါတယ်။\n\nမသိတဲ့သူ၊ ဆရာ၊ အလုပ်ရှင်နဲ့ ပြောရင် အမြဲ です・ます သုံးပါ။',
  },
];

const INTERVIEW_QUESTIONS = [
  'こんにちは。本日は面接に来ていただき、ありがとうございます。まず、自己紹介をお願いします。',
  'ありがとうございます。どうしてこの仕事を選びましたか。',
  '日本語はどのくらい勉強していますか。',
  'あなたの長所と短所を教えてください。',
  '日本で働くとき、何が一番大変だと思いますか。',
  '最後に、何か質問はありますか。',
];

/** A canned reply for the given request. */
export function demoText(req: Req): string {
  const lastUser = [...req.messages].reverse().find((m) => m.role === 'user')?.content ?? '';

  if (req.system === INTERVIEW_SYSTEM) {
    const turn = req.messages.filter((m) => m.role === 'assistant').length;
    // The first assistant message is the "はい、わかりました" setup acknowledgement in some flows
    const q = INTERVIEW_QUESTIONS[Math.min(turn, INTERVIEW_QUESTIONS.length - 1)];
    return turn >= INTERVIEW_QUESTIONS.length
      ? '本日はありがとうございました。面接は以上です。（🧪 Demo — 「အမှတ်ကြည့်မယ်」 ကို နှိပ်ပါ）'
      : `${q}\n\n（🧪 Demo mode — နမူနာ မေးခွန်းပါ）`;
  }

  if (req.system === EXPLAIN_SYSTEM) {
    return (
      DEMO_NOTE +
      '**ဘာလို့ မှားတာလဲ**\n\n- မေးခွန်းထဲက သဒ္ဒါ ပုံစံကို အရင် ရှာပါ။\n- ရွေးချယ်စရာ တစ်ခုချင်းစီကို ဝါကျထဲ ထည့်ဖတ်ကြည့်ပါ။\n- အဖြေမှန်က အဓိပ္ပာယ် ရော သဒ္ဒါ ရော ကိုက်ညီတဲ့ တစ်ခုတည်း ဖြစ်ပါတယ်။\n\nAI key ထည့်ပြီးရင် ဒီမေးခွန်းအတွက် သီးသန့် ရှင်းပြချက် ရပါမယ်။'
    );
  }

  if (req.system === WRITING_SYSTEM) {
    return (
      DEMO_NOTE +
      [
        '**ပြင်ပြီး စာ**',
        'I agree with you.',
        '**အမှားများ**',
        '- I am agree → I agree — "agree" က ကြိယာ ဖြစ်လို့ "am" မလိုပါ။',
        '**ပိုသဘာဝကျတဲ့ ပုံစံ**',
        'I totally agree with you.',
        'AI key ထည့်ပြီးရင် ကိုယ်ရေးတဲ့ စာကို တကယ် စစ်ပေးပါမယ် 💪',
      ].join('\n\n')
    );
  }

  const topic = TOPICS.find((t) => t.match.test(lastUser));
  return (
    DEMO_NOTE +
    (topic?.answer ??
      `မေးခွန်းလေး ကောင်းပါတယ်! 「${lastUser.slice(0, 60)}」\n\nDemo mode မှာ နမူနာ ခေါင်းစဉ် ၃ ခုပဲ ဖြေနိုင်ပါတယ်:\n- は နဲ့ が ကွာခြားချက်\n- て ပုံစံ ဖွဲ့နည်း\n- です・ます\n\nAdmin က AI key (OpenRouter / Groq) ထည့်ပြီးရင် ဘာမေးမေး ဖြေပေးနိုင်ပါပြီ။`)
  );
}

/** Streams the canned reply in small pieces so the UI behaves like a real AI. */
export async function* demoStream(req: Req): AsyncGenerator<string> {
  const text = demoText(req);
  const parts = text.match(/[\s\S]{1,12}/g) ?? [];
  for (const p of parts) {
    await new Promise((r) => setTimeout(r, 25));
    yield p;
  }
}

/** Demo structured answers (only interview scoring uses JSON today). */
export function demoJson(system: string): unknown {
  if (system === INTERVIEW_SCORE_SYSTEM) {
    const demo: InterviewScore = {
      scores: { politeness: 7, grammar: 6, vocabulary: 6, fluency: 5, content: 7 },
      overall: 62,
      verdict: '🧪 Demo အမှတ်ပါ — AI key ထည့်ပြီးရင် သင့်အဖြေအတွက် အစစ်အမှန် အမှတ် ရပါမယ်။',
      strengths: [
        'ယဉ်ကျေးတဲ့ です・ます ကို သုံးထားတယ်',
        'ကိုယ့်အကြောင်း ရှင်းရှင်းလင်းလင်း ပြောထားတယ်',
      ],
      improvements: [
        'အဖြေကို ဥပမာ တစ်ခုနဲ့ ပိုရှည်အောင် ပြောပါ',
        '敬語 (いたします・ございます) ကို လေ့ကျင့်ပါ',
      ],
      corrections: [
        {
          original: 'がんばります',
          better: '精一杯がんばります',
          note: 'ပိုပြီး စိတ်အားထက်သန်ပုံ ပေါ်တယ်',
        },
      ],
    };
    return demo;
  }
  return null;
}
