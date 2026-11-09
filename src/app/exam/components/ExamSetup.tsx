'use client';
import React, { useState } from 'react';
import type { ExamConfig, JLPTLevel, SectionType, Question } from '../page';

interface ExamSetupProps {
  onStart: (config: ExamConfig, questions: Question[]) => void;
}

const LEVEL_INFO: Record<
  JLPTLevel,
  { color: string; bg: string; border: string; desc: string; kanji: string }
> = {
  N5: { color: '#22c55e', bg: '#f0fdf4', border: '#bbf7d0', desc: 'အခြေခံ', kanji: '五' },
  N4: {
    color: '#3b82f6',
    bg: '#eff6ff',
    border: '#bfdbfe',
    desc: 'အလယ်အလတ်အောက်',
    kanji: '四',
  },
  N3: {
    color: '#f59e0b',
    bg: '#fffbeb',
    border: '#fde68a',
    desc: 'အလယ်အလတ်',
    kanji: '三',
  },
  N2: {
    color: '#f97316',
    bg: '#fff7ed',
    border: '#fed7aa',
    desc: 'Upper Intermediate',
    kanji: '二',
  },
  N1: {
    color: '#ef4444',
    bg: '#fef2f2',
    border: '#fecaca',
    desc: 'Advanced Japanese',
    kanji: '一',
  },
};

const SECTION_INFO: Record<
  SectionType,
  { icon: string; label: string; desc: string; time: number; count: number }
> = {
  grammar: {
    icon: '✏️',
    label: 'သဒ္ဒါ နဲ့ ဝေါဟာရ',
    desc: 'ဝါကျဖွဲ့ပုံ၊ ဝိဘတ်၊ ကြိယာပြောင်းပုံ',
    time: 30,
    count: 10,
  },
  reading: {
    icon: '📖',
    label: 'စာဖတ်စွမ်းရည်',
    desc: 'ဖတ်စာ၊ ကြေညာချက်၊ ဆောင်းပါး',
    time: 40,
    count: 8,
  },
  listening: {
    icon: '🎧',
    label: 'နားထောင်စွမ်းရည်',
    desc: 'စကားပြော၊ ကြေညာချက်',
    time: 35,
    count: 8,
  },
};

// Question bank per level
function generateQuestions(level: JLPTLevel, sections: SectionType[]): Question[] {
  const banks: Record<JLPTLevel, Record<SectionType, Question[]>> = {
    N5: {
      grammar: [
        {
          id: 'n5-g1',
          section: 'grammar',
          level: 'N5',
          question: '私___学生です。',
          options: ['は', 'が', 'を', 'に'],
          correctIndex: 0,
          explanation:
            '「は」က အကြောင်းအရာ (topic) ကို ပြတဲ့ ဝိဘတ်ပါ။ 私は学生です = "ကျွန်တော်က ကျောင်းသားပါ"။',
          grammarPoint: 'Topic ဝိဘတ် は',
        },
        {
          id: 'n5-g2',
          section: 'grammar',
          level: 'N5',
          question: 'これ___本です。',
          options: ['は', 'が', 'を', 'で'],
          correctIndex: 0,
          explanation: '「は」က これ ကို topic အဖြစ် ပြပါတယ်။ これは本です = "ဒါက စာအုပ်ပါ"။',
          grammarPoint: 'Topic ဝိဘတ် は',
        },
        {
          id: 'n5-g3',
          section: 'grammar',
          level: 'N5',
          question: '学校___行きます。',
          options: ['を', 'に', 'が', 'は'],
          correctIndex: 1,
          explanation:
            '「に」က သွားမယ့် နေရာ (ဦးတည်ရာ) ကို ပြပါတယ်။ 学校に行きます = "ကျောင်းကို သွားပါတယ်"။',
          grammarPoint: 'ဦးတည်ရာ ဝိဘတ် に',
        },
        {
          id: 'n5-g4',
          section: 'grammar',
          level: 'N5',
          question: 'りんご___食べます。',
          options: ['は', 'が', 'を', 'に'],
          correctIndex: 2,
          explanation:
            '「を」က ကံ (ပြုခံရသူ/ပစ္စည်း) ကို ပြပါတယ်။ りんごを食べます = "ပန်းသီး စားပါတယ်"။',
          grammarPoint: 'ကံ ဝိဘတ် を',
        },
        {
          id: 'n5-g5',
          section: 'grammar',
          level: 'N5',
          question: '今日___天気がいいです。',
          options: ['は', 'が', 'を', 'で'],
          correctIndex: 0,
          explanation:
            '「は」က 今日 ကို topic အဖြစ် ပြပါတယ်။ 今日は天気がいいです = "ဒီနေ့ ရာသီဥတု သာယာပါတယ်"။',
          grammarPoint: 'Topic ဝိဘတ် は',
        },
        {
          id: 'n5-g6',
          section: 'grammar',
          level: 'N5',
          question: '友達___手紙を書きます。',
          options: ['に', 'を', 'が', 'は'],
          correctIndex: 0,
          explanation:
            '「に」က လက်ခံသူကို ပြပါတယ်။ 友達に手紙を書きます = "သူငယ်ချင်းဆီ စာရေးပါတယ်"။',
          grammarPoint: 'လက်ခံသူ ဝိဘတ် に',
        },
        {
          id: 'n5-g7',
          section: 'grammar',
          level: 'N5',
          question: '図書館___本を読みます。',
          options: ['に', 'を', 'で', 'は'],
          correctIndex: 2,
          explanation:
            '「で」က လုပ်ဆောင်ချက် ဖြစ်တဲ့ နေရာကို ပြပါတယ်။ 図書館で本を読みます = "စာကြည့်တိုက်မှာ စာဖတ်ပါတယ်"။',
          grammarPoint: 'လုပ်ဆောင်ရာ နေရာ で',
        },
        {
          id: 'n5-g8',
          section: 'grammar',
          level: 'N5',
          question: 'バス___来ました。',
          options: ['が', 'は', 'を', 'に'],
          correctIndex: 0,
          explanation: '「が」က ကတ္တား (subject) ကို ပြပါတယ်။ バスが来ました = "ဘတ်စ်ကား လာပါပြီ"။',
          grammarPoint: 'ကတ္တား ဝိဘတ် が',
        },
        {
          id: 'n5-g9',
          section: 'grammar',
          level: 'N5',
          question: '日本語___話せますか？',
          options: ['を', 'が', 'は', 'に'],
          correctIndex: 1,
          explanation:
            '「が」ကို "တတ်နိုင်ခြင်း" ကြိယာပုံစံနဲ့ တွဲသုံးပါတယ်။ 日本語が話せますか = "ဂျပန်လို ပြောတတ်လား"။',
          grammarPoint: 'တတ်နိုင်ခြင်း ပုံစံ + が',
        },
        {
          id: 'n5-g10',
          section: 'grammar',
          level: 'N5',
          question: '毎朝、コーヒー___飲みます。',
          options: ['を', 'が', 'は', 'で'],
          correctIndex: 0,
          explanation: '「を」က ကံကို ပြပါတယ်။ コーヒーを飲みます = "ကော်ဖီ သောက်ပါတယ်"။',
          grammarPoint: 'ကံ ဝိဘတ် を',
        },
      ],
      reading: [
        {
          id: 'n5-r1',
          section: 'reading',
          level: 'N5',
          context:
            'たなかさんは まいにち がっこうに いきます。がっこうは うちから ちかいです。あるいて じゅっぷん かかります。',
          question: 'たなかさんの うちから がっこうまで どのくらい かかりますか？',
          options: ['5分', '10分', '15分', '20分'],
          correctIndex: 1,
          explanation:
            'စာထဲမှာ 「あるいて じゅっぷん かかります」လို့ ပါလို့ လမ်းလျှောက်ရင် ၁၀ မိနစ် ကြာပါတယ်။',
        },
        {
          id: 'n5-r2',
          section: 'reading',
          level: 'N5',
          context:
            'きょうは にちようびです。やまださんは かぞくと こうえんに いきました。こうえんで おべんとうを たべました。とても たのしかったです。',
          question: 'やまださんは こうえんで なにを しましたか？',
          options: ['スポーツをした', 'おべんとうを食べた', '本を読んだ', '音楽を聞いた'],
          correctIndex: 1,
          explanation:
            'စာထဲမှာ 「こうえんで おべんとうを たべました」လို့ ပါလို့ ပန်းခြံမှာ ထမင်းဘူး စားခဲ့ပါတယ်။',
        },
        {
          id: 'n5-r3',
          section: 'reading',
          level: 'N5',
          context:
            'スーパーの おしらせ\nやさい：20%オフ\nくだもの：10%オフ\nにく：30%オフ\nさかな：ふつうのねだん',
          question: 'いちばん やすく なっている ものは なんですか？',
          options: ['やさい', 'くだもの', 'にく', 'さかな'],
          correctIndex: 2,
          explanation: 'အသား (にく) က 30% လျှော့ထားလို့ မူလဈေးနဲ့ ယှဉ်ရင် အသက်သာဆုံး ဖြစ်ပါတယ်။',
        },
        {
          id: 'n5-r4',
          section: 'reading',
          level: 'N5',
          context:
            'わたしは まいにち 7じに おきます。あさごはんを たべて、8じに うちを でます。がっこうは 9じに はじまります。',
          question: 'この人は なんじに うちを でますか？',
          options: ['7時', '8時', '9時', '10時'],
          correctIndex: 1,
          explanation: 'စာထဲမှာ 「8じに うちを でます」လို့ ပါလို့ ၈ နာရီမှာ အိမ်က ထွက်ပါတယ်။',
        },
        {
          id: 'n5-r5',
          section: 'reading',
          level: 'N5',
          context:
            'えいがかんの ちかくに あたらしい レストランが できました。ランチは 1000えんで、ディナーは 2000えんです。まいにち 11じから 22じまで あいています。',
          question: 'このレストランは なんじに しまりますか？',
          options: ['11時', '20時', '21時', '22時'],
          correctIndex: 3,
          explanation:
            'စာထဲမှာ 「22じまで あいています」လို့ ပါလို့ ည ၁၀ နာရီ (22:00) အထိ ဖွင့်ပါတယ်။',
        },
        {
          id: 'n5-r6',
          section: 'reading',
          level: 'N5',
          context:
            'きむらさんへ\nあした の かいぎは 3じから 5じに かわりました。ばしょは おなじです。よろしく おねがいします。\nたなか',
          question: 'かいぎは なんじに はじまりますか？',
          options: ['2時', '3時', '4時', '5時'],
          correctIndex: 1,
          explanation:
            'မှတ်စုထဲမှာ အစည်းအဝေးကို ၃ နာရီ (3じから) ကို ပြောင်းထားတယ်လို့ ရေးထားပါတယ်။',
        },
        {
          id: 'n5-r7',
          section: 'reading',
          level: 'N5',
          context:
            'わたしの しゅみは りょうりです。まいしゅう にちようびに あたらしい りょうりを つくります。きのうは カレーを つくりました。かぞくに とても よろこばれました。',
          question: 'この人は きのう なにを つくりましたか？',
          options: ['すし', 'ラーメン', 'カレー', 'てんぷら'],
          correctIndex: 2,
          explanation:
            'စာထဲမှာ 「きのうは カレーを つくりました」လို့ ပါလို့ မနေ့က ကာရီ ချက်ခဲ့ပါတယ်။',
        },
        {
          id: 'n5-r8',
          section: 'reading',
          level: 'N5',
          context:
            'としょかんの ルール\n・しずかに してください\n・たべものは もちこまないでください\n・ほんは 2しゅうかん かりられます\n・けいたいは マナーモードに してください',
          question: 'としょかんで ほんを かりると、なんにちで かえさなければ なりませんか？',
          options: ['7日', '10日', '14日', '21日'],
          correctIndex: 2,
          explanation: '2週間 (၂ ပတ်) = ၁၄ ရက်ပါ။ စည်းကမ်းအရ စာအုပ်ကို ၂ ပတ် ငှားလို့ရပါတယ်။',
        },
      ],
      listening: [
        {
          id: 'n5-l1',
          section: 'listening',
          level: 'N5',
          context:
            '🎧 [会話] 男の人：「すみません、駅はどこですか？」\n女の人：「まっすぐ行って、右に曲がってください。」',
          question: '駅に行くには、どうすればいいですか？',
          options: ['左に曲がる', '右に曲がる', 'まっすぐ行く', 'バスに乗る'],
          correctIndex: 1,
          explanation:
            'အမျိုးသမီးက 「まっすぐ行って、右に曲がってください」— တည့်တည့်သွားပြီး ညာဘက်ကွေ့ပါ လို့ ပြောပါတယ်။',
        },
        {
          id: 'n5-l2',
          section: 'listening',
          level: 'N5',
          context:
            '🎧 [会話] 女の人：「今日の天気はどうですか？」\n男の人：「朝は晴れでしたが、午後から雨になりました。」',
          question: '午後の天気はどうでしたか？',
          options: ['晴れ', '曇り', '雨', '雪'],
          correctIndex: 2,
          explanation:
            'အမျိုးသားက 「午後から雨になりました」— နေ့လယ်ကစပြီး မိုးရွာလာတယ် လို့ ပြောပါတယ်။',
        },
        {
          id: 'n5-l3',
          section: 'listening',
          level: 'N5',
          context: '🎧 [アナウンス] 「次の電車は3番線から出発します。発車時刻は14時30分です。」',
          question: '電車は何番線から出発しますか？',
          options: ['1番線', '2番線', '3番線', '4番線'],
          correctIndex: 2,
          explanation:
            'ကြေညာချက်မှာ 「3番線から出発します」— platform ၃ ကနေ ထွက်ပါမယ် လို့ ပြောပါတယ်။',
        },
        {
          id: 'n5-l4',
          section: 'listening',
          level: 'N5',
          context: '🎧 [会話] 男の人：「何時に起きますか？」\n女の人：「毎朝6時半に起きます。」',
          question: '女の人は何時に起きますか？',
          options: ['6時', '6時半', '7時', '7時半'],
          correctIndex: 1,
          explanation:
            'အမျိုးသမီးက 「毎朝6時半に起きます」— မနက်တိုင်း ၆ နာရီခွဲမှာ အိပ်ရာထပါတယ် လို့ ပြောပါတယ်။',
        },
        {
          id: 'n5-l5',
          section: 'listening',
          level: 'N5',
          context:
            '🎧 [会話] 店員：「いらっしゃいませ。何名様ですか？」\n客：「3人です。」\n店員：「少々お待ちください。」',
          question: '客は何人ですか？',
          options: ['1人', '2人', '3人', '4人'],
          correctIndex: 2,
          explanation: 'ဧည့်သည်က 「3人です」— ၃ ယောက်ပါ လို့ ပြောပါတယ်။',
        },
        {
          id: 'n5-l6',
          section: 'listening',
          level: 'N5',
          context: '🎧 [会話] 女の人：「このりんごはいくらですか？」\n男の人：「一つ150円です。」',
          question: 'りんごはいくらですか？',
          options: ['100円', '120円', '150円', '200円'],
          correctIndex: 2,
          explanation: 'အမျိုးသားက 「一つ150円です」— တစ်လုံး ၁၅၀ ယန်း လို့ ပြောပါတယ်။',
        },
        {
          id: 'n5-l7',
          section: 'listening',
          level: 'N5',
          context:
            '🎧 [会話] 男の人：「週末は何をしましたか？」\n女の人：「友達と映画を見ました。とても面白かったです。」',
          question: '女の人は週末に何をしましたか？',
          options: ['買い物をした', '映画を見た', '旅行をした', '料理をした'],
          correctIndex: 1,
          explanation:
            'အမျိုးသမီးက 「友達と映画を見ました」— သူငယ်ချင်းတွေနဲ့ ရုပ်ရှင်ကြည့်ခဲ့တယ် လို့ ပြောပါတယ်။',
        },
        {
          id: 'n5-l8',
          section: 'listening',
          level: 'N5',
          context:
            '🎧 [アナウンス] 「図書館は月曜日から土曜日まで開いています。日曜日と祝日はお休みです。」',
          question: '図書館が休みの日はいつですか？',
          options: ['月曜日', '土曜日', '日曜日', '金曜日'],
          correctIndex: 2,
          explanation:
            'ကြေညာချက်မှာ 「日曜日と祝日はお休みです」— တနင်္ဂနွေနဲ့ ရုံးပိတ်ရက်တွေမှာ ပိတ်ပါတယ် လို့ ပြောပါတယ်။',
        },
      ],
    },
    N4: {
      grammar: [
        {
          id: 'n4-g1',
          section: 'grammar',
          level: 'N4',
          question: '雨が降っている___、出かけましょう。',
          options: ['のに', 'から', 'ので', 'けど'],
          correctIndex: 3,
          explanation: "「けど」(but/although) expresses contrast. Despite the rain, let's go out.",
          grammarPoint: 'Contrast けど',
        },
        {
          id: 'n4-g2',
          section: 'grammar',
          level: 'N4',
          question: '宿題を___から、遊びに行きます。',
          options: ['する', 'して', 'した', 'します'],
          correctIndex: 2,
          explanation:
            '「〜てから」means "after doing ~". 宿題をしてから means "after doing homework".',
          grammarPoint: 'てから (after doing)',
        },
        {
          id: 'n4-g3',
          section: 'grammar',
          level: 'N4',
          question: '彼女は歌が___。',
          options: ['上手い', '上手', '上手な', '上手に'],
          correctIndex: 1,
          explanation:
            '「上手」is a な-adjective used predicatively without な. 歌が上手 means "good at singing".',
          grammarPoint: 'な-adjective predicate',
        },
        {
          id: 'n4-g4',
          section: 'grammar',
          level: 'N4',
          question: '日本語を___ために、毎日勉強します。',
          options: ['上手', '上手な', '上手に', '上手く'],
          correctIndex: 2,
          explanation:
            '「上手に」is the adverbial form. 上手になるために means "in order to become good at".',
          grammarPoint: 'ために (in order to)',
        },
        {
          id: 'n4-g5',
          section: 'grammar',
          level: 'N4',
          question: '電車が遅れた___、会議に遅刻しました。',
          options: ['から', 'のに', 'ので', 'けど'],
          correctIndex: 2,
          explanation:
            '「ので」expresses a reason/cause with a softer, more objective tone than から.',
          grammarPoint: 'Reason ので',
        },
        {
          id: 'n4-g6',
          section: 'grammar',
          level: 'N4',
          question: '先生に___ことがあります。',
          options: ['聞きたい', '聞きたく', '聞きたいな', '聞きたいの'],
          correctIndex: 0,
          explanation:
            '「〜たいことがある」means "there is something I want to do". 聞きたいことがあります means "I have something I want to ask."',
          grammarPoint: 'たいことがある',
        },
        {
          id: 'n4-g7',
          section: 'grammar',
          level: 'N4',
          question: 'もっと早く___ばよかった。',
          options: ['起き', '起きれ', '起きる', '起きた'],
          correctIndex: 0,
          explanation:
            '「〜ばよかった」means "I should have ~". 起きればよかった means "I should have woken up earlier."',
          grammarPoint: 'ばよかった (should have)',
        },
        {
          id: 'n4-g8',
          section: 'grammar',
          level: 'N4',
          question: '彼は医者___しい。',
          options: ['らしい', 'だらしい', 'らしく', 'らしいな'],
          correctIndex: 0,
          explanation:
            '「らしい」expresses hearsay/inference. 医者らしい means "he seems to be a doctor (I heard)."',
          grammarPoint: 'らしい (hearsay/inference)',
        },
        {
          id: 'n4-g9',
          section: 'grammar',
          level: 'N4',
          question: '窓を___ままにしないでください。',
          options: ['開ける', '開けた', '開けて', '開け'],
          correctIndex: 1,
          explanation:
            '「〜たまま」means "leaving ~ as it is". 開けたままにしないで means "don\'t leave it open."',
          grammarPoint: 'たまま (leaving as is)',
        },
        {
          id: 'n4-g10',
          section: 'grammar',
          level: 'N4',
          question: '日本に来て___年になります。',
          options: ['3', '3の', '3が', '3を'],
          correctIndex: 0,
          explanation:
            '「〜年になります」means "it has been ~ years". 3年になります means "it has been 3 years."',
          grammarPoint: 'Duration になる',
        },
      ],
      reading: [
        {
          id: 'n4-r1',
          section: 'reading',
          level: 'N4',
          context:
            'お知らせ\n来週の月曜日から、図書館の開館時間が変わります。今まで9時から18時でしたが、10時から20時になります。土日は変わりません。ご不便をおかけして申し訳ありません。',
          question: '平日の新しい開館時間はいつですか？',
          options: ['9時〜18時', '9時〜20時', '10時〜18時', '10時〜20時'],
          correctIndex: 3,
          explanation:
            'The notice says the new hours will be 10時から20時 (10:00 to 20:00) starting next Monday.',
        },
        {
          id: 'n4-r2',
          section: 'reading',
          level: 'N4',
          context:
            '田中さんへ\n先日はパーティーにご招待いただき、ありがとうございました。とても楽しい時間を過ごすことができました。また機会があれば、ぜひお会いしましょう。\n山田より',
          question: 'この手紙の目的は何ですか？',
          options: ['パーティーの招待', 'パーティーのお礼', '会議の連絡', '仕事の依頼'],
          correctIndex: 1,
          explanation:
            'The letter thanks Tanaka-san for the party invitation (パーティーにご招待いただき、ありがとうございました).',
        },
        {
          id: 'n4-r3',
          section: 'reading',
          level: 'N4',
          context:
            '健康のために毎日運動することが大切です。特に、ウォーキングは誰でも簡単にできる運動です。一日30分歩くだけで、体の調子がよくなると言われています。',
          question: '文章によると、ウォーキングの利点は何ですか？',
          options: ['お金がかかる', '特別な道具が必要', '誰でも簡単にできる', '専門家が必要'],
          correctIndex: 2,
          explanation:
            'The text says 「誰でも簡単にできる運動です」— it is exercise that anyone can do easily.',
        },
        {
          id: 'n4-r4',
          section: 'reading',
          level: 'N4',
          context:
            '山田さんは毎朝6時に起きて、7時に朝ごはんを食べます。8時に家を出て、電車で会社に行きます。会社は9時に始まります。',
          question: '山田さんは何時に家を出ますか？',
          options: ['6時', '7時', '8時', '9時'],
          correctIndex: 2,
          explanation: "The text says 「8時に家を出て」— Yamada-san leaves home at 8 o'clock.",
        },
        {
          id: 'n4-r5',
          section: 'reading',
          level: 'N4',
          context:
            'アルバイト募集\n・仕事内容：カフェのホール係\n・時給：1,000円\n・勤務時間：週3日以上、1日4時間以上\n・応募条件：18歳以上、日本語が話せる方',
          question: 'このアルバイトに応募できるのは誰ですか？',
          options: ['15歳の学生', '17歳の高校生', '20歳の大学生', '16歳のアルバイター'],
          correctIndex: 2,
          explanation:
            'The requirement is 18歳以上 (18 years or older). Only the 20-year-old university student qualifies.',
        },
        {
          id: 'n4-r6',
          section: 'reading',
          level: 'N4',
          context:
            '日本では、春になると桜の花が咲きます。多くの人が公園や川沿いで花見をします。桜の季節は短く、約2週間しか続きません。',
          question: '桜の季節はどのくらい続きますか？',
          options: ['約1週間', '約2週間', '約1ヶ月', '約2ヶ月'],
          correctIndex: 1,
          explanation: 'The text says 「約2週間しか続きません」— it lasts only about 2 weeks.',
        },
        {
          id: 'n4-r7',
          section: 'reading',
          level: 'N4',
          context:
            '田中さんは先週、友達と京都に旅行しました。京都では有名なお寺や神社を見て回りました。特に金閣寺が印象的でした。帰りに京都のお土産を買って帰りました。',
          question: '田中さんが一番印象に残ったのはどこですか？',
          options: ['神社', '京都駅', '金閣寺', 'お土産屋'],
          correctIndex: 2,
          explanation:
            'The text says 「特に金閣寺が印象的でした」— Kinkakuji was especially impressive.',
        },
        {
          id: 'n4-r8',
          section: 'reading',
          level: 'N4',
          context:
            '最近、スマートフォンを使う人が増えています。電車の中でも、多くの人がスマートフォンを見ています。便利ですが、使いすぎると目が疲れたり、睡眠の質が下がったりすることがあります。',
          question: 'スマートフォンの使いすぎの問題点として挙げられていないのはどれですか？',
          options: ['目が疲れる', '睡眠の質が下がる', '電池が切れる', '体に悪い影響がある'],
          correctIndex: 2,
          explanation:
            'Battery drain (電池が切れる) is not mentioned in the text. The problems mentioned are eye fatigue and reduced sleep quality.',
        },
      ],
      listening: [
        {
          id: 'n4-l1',
          section: 'listening',
          level: 'N4',
          context:
            '🎧 [会話] 女の人：「田中さん、明日の会議は何時からですか？」\n男の人：「午後2時からです。でも、準備があるので1時半には来てください。」',
          question: '田中さんは何時に来るべきですか？',
          options: ['1時', '1時半', '2時', '2時半'],
          correctIndex: 1,
          explanation: 'The man says 「1時半には来てください」— please come by 1:30.',
        },
        {
          id: 'n4-l2',
          section: 'listening',
          level: 'N4',
          context:
            '🎧 [会話] 男の人：「このレストランのおすすめは何ですか？」\n店員：「本日は魚料理が特におすすめです。新鮮な魚を使っています。」',
          question: '今日のおすすめは何ですか？',
          options: ['肉料理', '魚料理', '野菜料理', 'デザート'],
          correctIndex: 1,
          explanation:
            "The staff says 「本日は魚料理が特におすすめです」— today's special recommendation is fish dishes.",
        },
        {
          id: 'n4-l3',
          section: 'listening',
          level: 'N4',
          context:
            '🎧 [アナウンス] 「ただいまより、3番ゲートからの搭乗を開始いたします。お客様は搭乗券をご用意の上、3番ゲートにお越しください。」',
          question: '乗客はどこに行くべきですか？',
          options: ['1番ゲート', '2番ゲート', '3番ゲート', '4番ゲート'],
          correctIndex: 2,
          explanation:
            'The announcement says 「3番ゲートからの搭乗を開始」— boarding begins from gate 3.',
        },
        {
          id: 'n4-l4',
          section: 'listening',
          level: 'N4',
          context:
            '🎧 [会話] 女の人：「昨日の映画、どうだった？」\n男の人：「最初は面白かったけど、後半はちょっと長すぎた気がした。」',
          question: '男の人は映画についてどう思いましたか？',
          options: [
            '全体的に面白かった',
            '全体的につまらなかった',
            '最初は面白かったが後半は長かった',
            '最初はつまらなかったが後半は面白かった',
          ],
          correctIndex: 2,
          explanation:
            'The man says the beginning was interesting but the second half felt too long.',
        },
        {
          id: 'n4-l5',
          section: 'listening',
          level: 'N4',
          context:
            '🎧 [会話] 男の人：「すみません、この近くにコンビニはありますか？」\n女の人：「ええ、この道をまっすぐ行って、信号を左に曲がるとすぐあります。」',
          question: 'コンビニはどこにありますか？',
          options: ['まっすぐ行った右', 'まっすぐ行った左', '信号の手前', '駅の近く'],
          correctIndex: 1,
          explanation:
            'The woman says go straight and turn left at the traffic light (信号を左に曲がる).',
        },
        {
          id: 'n4-l6',
          section: 'listening',
          level: 'N4',
          context:
            '🎧 [会話] 女の人：「田中さんは今日来ていますか？」\n男の人：「いいえ、風邪で休んでいます。明日は来ると思いますが。」',
          question: '田中さんはなぜ今日いませんか？',
          options: ['旅行中', '会議中', '風邪で休んでいる', '仕事が終わった'],
          correctIndex: 2,
          explanation: 'The man says 「風邪で休んでいます」— Tanaka-san is absent due to a cold.',
        },
        {
          id: 'n4-l7',
          section: 'listening',
          level: 'N4',
          context:
            '🎧 [会話] 男の人：「この仕事、いつまでに終わらせればいいですか？」\n女の人：「来週の金曜日までにお願いします。でも、できれば水曜日までに。」',
          question: '仕事の締め切りはいつですか？',
          options: ['今週の金曜日', '来週の水曜日', '来週の金曜日', '再来週の月曜日'],
          correctIndex: 2,
          explanation:
            'The woman says 「来週の金曜日までにお願いします」— the deadline is next Friday.',
        },
        {
          id: 'n4-l8',
          section: 'listening',
          level: 'N4',
          context:
            '🎧 [会話] 女の人：「新しいスマートフォン、買ったんですか？」\n男の人：「ええ、先月買いました。カメラがとてもきれいで、バッテリーも長持ちします。」',
          question: '男の人が新しいスマートフォンについて言っていないことは何ですか？',
          options: ['カメラがきれい', 'バッテリーが長持ち', '値段が安い', '先月買った'],
          correctIndex: 2,
          explanation:
            'The man mentions the camera quality and battery life, but does not mention the price.',
        },
      ],
    },
    N3: {
      grammar: [
        {
          id: 'n3-g1',
          section: 'grammar',
          level: 'N3',
          question: '彼女が来る___、準備を始めましょう。',
          options: ['前に', 'まえで', 'ために', 'ように'],
          correctIndex: 0,
          explanation: '「前に」means "before". 彼女が来る前に means "before she comes."',
          grammarPoint: '前に (before)',
        },
        {
          id: 'n3-g2',
          section: 'grammar',
          level: 'N3',
          question: '試験に合格___ように、毎日勉強しています。',
          options: ['する', 'した', 'できる', 'できた'],
          correctIndex: 2,
          explanation:
            '「できるように」means "so that I can". 合格できるように means "so that I can pass."',
          grammarPoint: 'できるように (so that one can)',
        },
        {
          id: 'n3-g3',
          section: 'grammar',
          level: 'N3',
          question: '彼は病気___、学校を休みました。',
          options: ['なので', 'だから', 'ので', 'から'],
          correctIndex: 0,
          explanation:
            '「なので」follows nouns/な-adjectives. 病気なので means "because (he) is sick."',
          grammarPoint: 'なので (because, noun/na-adj)',
        },
        {
          id: 'n3-g4',
          section: 'grammar',
          level: 'N3',
          question: 'もし雨が降っ___、試合は中止です。',
          options: ['たら', 'ても', 'ては', 'たり'],
          correctIndex: 0,
          explanation:
            '「〜たら」expresses a conditional "if/when". もし雨が降ったら means "if it rains."',
          grammarPoint: 'たら conditional',
        },
        {
          id: 'n3-g5',
          section: 'grammar',
          level: 'N3',
          question: '彼女は歌___、踊ったりします。',
          options: ['ったり', 'ったり', 'ったり', 'ったり'],
          correctIndex: 0,
          explanation:
            '「〜たり〜たりする」lists representative actions. 歌ったり踊ったりします means "she sings and dances (among other things)."',
          grammarPoint: 'たり〜たりする',
        },
        {
          id: 'n3-g6',
          section: 'grammar',
          level: 'N3',
          question: '彼は医者___、とても親切です。',
          options: ['なのに', 'なので', 'だから', 'ために'],
          correctIndex: 0,
          explanation:
            '「なのに」expresses unexpected contrast. 医者なのに means "even though he is a doctor (unexpectedly kind)."',
          grammarPoint: 'なのに (even though, unexpected)',
        },
        {
          id: 'n3-g7',
          section: 'grammar',
          level: 'N3',
          question: '電車に乗り___、財布を忘れたことに気づいた。',
          options: ['ながら', 'てから', 'たとき', 'ながら'],
          correctIndex: 2,
          explanation:
            '「〜たとき」means "when ~ happened". 乗ったとき means "when I got on the train."',
          grammarPoint: 'たとき (when)',
        },
        {
          id: 'n3-g8',
          section: 'grammar',
          level: 'N3',
          question: '彼女は___ほど、日本語が上手になった。',
          options: ['勉強すれば', '勉強するほど', '勉強した', '勉強して'],
          correctIndex: 1,
          explanation:
            '「〜ば〜ほど」means "the more ~ the more ~". 勉強すればするほど means "the more she studies."',
          grammarPoint: 'ば〜ほど (the more...the more)',
        },
        {
          id: 'n3-g9',
          section: 'grammar',
          level: 'N3',
          question: '彼は疲れて___、仕事を続けた。',
          options: ['いても', 'いるのに', 'いながら', 'いたのに'],
          correctIndex: 0,
          explanation:
            '「〜ても」means "even if/though". 疲れていても means "even though he was tired."',
          grammarPoint: 'ても (even though/if)',
        },
        {
          id: 'n3-g10',
          section: 'grammar',
          level: 'N3',
          question: '彼女が来る___待っていました。',
          options: ['のを', 'のが', 'のに', 'のは'],
          correctIndex: 0,
          explanation:
            '「〜のを待つ」means "to wait for ~ to happen". 来るのを待っていました means "was waiting for her to come."',
          grammarPoint: 'のを待つ (wait for)',
        },
      ],
      reading: [
        {
          id: 'n3-r1',
          section: 'reading',
          level: 'N3',
          context:
            '現代社会では、ストレスを感じる人が増えています。仕事や人間関係など、様々な原因があります。ストレスを解消するためには、適度な運動や趣味を持つことが効果的だと言われています。また、十分な睡眠を取ることも重要です。',
          question: 'ストレス解消に効果的でないものはどれですか？',
          options: ['適度な運動', '趣味を持つ', '十分な睡眠', '仕事を増やす'],
          correctIndex: 3,
          explanation:
            'The text mentions exercise, hobbies, and sleep as effective stress relief. Increasing work is not mentioned and would likely increase stress.',
        },
        {
          id: 'n3-r2',
          section: 'reading',
          level: 'N3',
          context:
            '日本の伝統文化の一つである茶道は、単にお茶を飲む行為ではありません。茶道には「和敬清寂」という精神があり、調和、敬意、清潔さ、静けさを大切にします。茶道を通じて、日本人の美意識や礼儀を学ぶことができます。',
          question: '茶道の精神「和敬清寂」に含まれないものはどれですか？',
          options: ['調和', '敬意', '勇気', '静けさ'],
          correctIndex: 2,
          explanation:
            'The four elements of 和敬清寂 are harmony (和), respect (敬), cleanliness (清), and tranquility (寂). Courage (勇気) is not included.',
        },
        {
          id: 'n3-r3',
          section: 'reading',
          level: 'N3',
          context:
            '環境問題の解決には、個人の努力だけでなく、社会全体での取り組みが必要です。リサイクルや省エネなど、日常生活でできることから始めることが大切です。しかし、根本的な解決には政府や企業の政策変更も不可欠です。',
          question: '筆者の主張として最も適切なものはどれですか？',
          options: [
            '個人の努力だけで環境問題は解決できる',
            '政府だけが環境問題を解決できる',
            '個人と社会全体の両方の取り組みが必要',
            '環境問題は解決不可能だ',
          ],
          correctIndex: 2,
          explanation:
            'The author argues that both individual efforts and societal/governmental action are necessary for solving environmental problems.',
        },
        {
          id: 'n3-r4',
          section: 'reading',
          level: 'N3',
          context:
            '山田さんは毎週末、ボランティア活動に参加しています。地域の清掃活動や、高齢者の買い物を手伝うなど、様々な活動をしています。「人の役に立てることが嬉しい」と山田さんは言っています。',
          question: '山田さんがボランティア活動をする理由は何ですか？',
          options: [
            'お金のため',
            '人の役に立てることが嬉しいから',
            '学校の課題のため',
            '友達に誘われたから',
          ],
          correctIndex: 1,
          explanation:
            'Yamada-san says 「人の役に立てることが嬉しい」— she is happy to be helpful to others.',
        },
        {
          id: 'n3-r5',
          section: 'reading',
          level: 'N3',
          context:
            '最近、テレワークを導入する企業が増えています。通勤時間がなくなり、仕事と生活のバランスが取りやすくなるという利点があります。一方で、コミュニケーション不足や、仕事とプライベートの境界が曖昧になるという問題点も指摘されています。',
          question: 'テレワークの問題点として挙げられているものはどれですか？',
          options: ['通勤時間が増える', 'コミュニケーション不足', '給料が下がる', '仕事量が増える'],
          correctIndex: 1,
          explanation:
            'The text mentions communication deficiency (コミュニケーション不足) as a problem with telework.',
        },
        {
          id: 'n3-r6',
          section: 'reading',
          level: 'N3',
          context:
            '日本語の敬語は複雑で、外国人学習者にとって難しい部分の一つです。敬語には、相手を高める「尊敬語」、自分を低める「謙譲語」、丁寧に話す「丁寧語」の三種類があります。',
          question: '自分を低めて話す敬語の種類は何ですか？',
          options: ['尊敬語', '謙譲語', '丁寧語', '普通語'],
          correctIndex: 1,
          explanation:
            '謙譲語 (humble language) is used to lower oneself in speech, as opposed to 尊敬語 which elevates the other person.',
        },
        {
          id: 'n3-r7',
          section: 'reading',
          level: 'N3',
          context:
            '田中さんは先月、新しい仕事を始めました。最初は慣れないことが多く、大変でしたが、同僚たちが親切に教えてくれたおかげで、だんだん仕事に慣れてきました。今では毎日仕事が楽しいと感じています。',
          question: '田中さんが仕事に慣れた理由は何ですか？',
          options: [
            '仕事が簡単だったから',
            '同僚が親切に教えてくれたから',
            '以前と同じ仕事だったから',
            '給料が良かったから',
          ],
          correctIndex: 1,
          explanation:
            'The text says 「同僚たちが親切に教えてくれたおかげで」— thanks to colleagues teaching kindly.',
        },
        {
          id: 'n3-r8',
          section: 'reading',
          level: 'N3',
          context:
            '食生活と健康の関係について、多くの研究が行われています。野菜や果物を多く食べることは、生活習慣病の予防に効果的だとされています。また、加工食品や糖分の多い食べ物を控えることも重要です。',
          question: '健康的な食生活として適切でないものはどれですか？',
          options: ['野菜を多く食べる', '果物を多く食べる', '加工食品を多く食べる', '糖分を控える'],
          correctIndex: 2,
          explanation:
            'The text says to limit processed foods (加工食品や糖分の多い食べ物を控える), so eating many processed foods is not healthy.',
        },
      ],
      listening: [
        {
          id: 'n3-l1',
          section: 'listening',
          level: 'N3',
          context:
            '🎧 [会話] 男の人：「来週の出張、準備はできていますか？」\n女の人：「はい、ホテルの予約と飛行機のチケットは取りました。でも、プレゼンの資料がまだです。」',
          question: '女の人がまだ準備できていないものは何ですか？',
          options: ['ホテルの予約', '飛行機のチケット', 'プレゼンの資料', 'パスポート'],
          correctIndex: 2,
          explanation:
            'The woman says the hotel and flight are booked, but the presentation materials (プレゼンの資料) are not ready yet.',
        },
        {
          id: 'n3-l2',
          section: 'listening',
          level: 'N3',
          context:
            '🎧 [会話] 女の人：「最近、運動不足で体重が増えてしまって。」\n男の人：「ジムに通ってみたら？私は週3回行っているけど、効果があるよ。」\n女の人：「でも、時間がなくて。」\n男の人：「じゃあ、通勤で一駅歩くだけでも違うよ。」',
          question: '男の人が最終的に提案したことは何ですか？',
          options: ['ジムに通う', '週3回運動する', '通勤で一駅歩く', 'ダイエットをする'],
          correctIndex: 2,
          explanation:
            'After the woman said she has no time for the gym, the man suggested walking one station during commute.',
        },
        {
          id: 'n3-l3',
          section: 'listening',
          level: 'N3',
          context:
            '🎧 [ニュース] 「今日の東京の天気は、午前中は晴れですが、午後から雲が増え、夕方には雨が降る見込みです。明日は一日中雨の予報です。」',
          question: '今日の夕方の天気はどうですか？',
          options: ['晴れ', '曇り', '雨', '雪'],
          correctIndex: 2,
          explanation:
            'The news says 「夕方には雨が降る見込みです」— it is expected to rain in the evening.',
        },
        {
          id: 'n3-l4',
          section: 'listening',
          level: 'N3',
          context:
            '🎧 [会話] 男の人：「この映画、見た？」\n女の人：「うん、先週見たよ。最初はちょっと退屈だったけど、後半からすごく面白くなった。」\n男の人：「そうなんだ。じゃあ、最後まで見る価値があるね。」',
          question: '女の人の映画の感想はどれですか？',
          options: [
            '最初から最後まで面白かった',
            '最初は面白かったが後半は退屈だった',
            '最初は退屈だったが後半は面白かった',
            '全体的につまらなかった',
          ],
          correctIndex: 2,
          explanation:
            'The woman says it was a bit boring at first but became very interesting in the second half.',
        },
        {
          id: 'n3-l5',
          section: 'listening',
          level: 'N3',
          context:
            '🎧 [会話] 女の人：「田中さんの誕生日プレゼント、何にする？」\n男の人：「本が好きって言ってたから、本はどう？」\n女の人：「でも、もう持ってるかもしれないし。」\n男の人：「じゃあ、図書カードにしよう。」',
          question: '二人は最終的に何を贈ることにしましたか？',
          options: ['本', '図書カード', 'CD', '花'],
          correctIndex: 1,
          explanation:
            'After discussing, they decided on a library card (図書カード) since they were unsure if Tanaka already had the book.',
        },
        {
          id: 'n3-l6',
          section: 'listening',
          level: 'N3',
          context:
            '🎧 [アナウンス] 「本日の山田先生の講演会は、会場の都合により、第1会議室から第3会議室に変更になりました。開始時間は予定通り14時です。ご迷惑をおかけして申し訳ありません。」',
          question: '何が変更になりましたか？',
          options: ['開始時間', '講演者', '会場', '日程'],
          correctIndex: 2,
          explanation:
            'The announcement says the venue changed from Room 1 to Room 3 (第1会議室から第3会議室に変更).',
        },
        {
          id: 'n3-l7',
          section: 'listening',
          level: 'N3',
          context:
            '🎧 [会話] 男の人：「新しいプロジェクト、どう進んでいる？」\n女の人：「計画通りに進んでいます。来週には第一段階が完了する予定です。」\n男の人：「それは良かった。問題はない？」\n女の人：「今のところ大丈夫ですが、予算が少し心配です。」',
          question: '女の人が心配していることは何ですか？',
          options: ['スケジュール', '人員不足', '予算', '技術的な問題'],
          correctIndex: 2,
          explanation:
            'The woman says 「予算が少し心配です」— she is a bit worried about the budget.',
        },
        {
          id: 'n3-l8',
          section: 'listening',
          level: 'N3',
          context:
            '🎧 [会話] 女の人：「最近、料理を始めたんですよ。」\n男の人：「そうですか。どんな料理を作りますか？」\n女の人：「最初は簡単なものから始めて、今は和食も作れるようになりました。」\n男の人：「すごいですね。得意料理は何ですか？」\n女の人：「肉じゃがです。家族に好評で。」',
          question: '女の人の得意料理は何ですか？',
          options: ['カレー', '肉じゃが', 'すし', 'ラーメン'],
          correctIndex: 1,
          explanation:
            'The woman says 「肉じゃがです」— her specialty is nikujaga (meat and potato stew).',
        },
      ],
    },
    N2: {
      grammar: [
        {
          id: 'n2-g1',
          section: 'grammar',
          level: 'N2',
          question: '彼女は美しい___、頭もいい。',
          options: ['うえに', 'だけに', 'ばかりか', 'ものの'],
          correctIndex: 0,
          explanation:
            '「うえに」means "in addition to, moreover". 美しいうえに means "in addition to being beautiful."',
          grammarPoint: 'うえに (in addition to)',
        },
        {
          id: 'n2-g2',
          section: 'grammar',
          level: 'N2',
          question: '彼は約束を守らない___、嘘までついた。',
          options: ['ばかりか', 'だけでなく', 'のみならず', 'どころか'],
          correctIndex: 3,
          explanation:
            '「どころか」means "far from, not only but also (negative nuance)". 守らないどころか means "far from keeping his promise."',
          grammarPoint: 'どころか (far from)',
        },
        {
          id: 'n2-g3',
          section: 'grammar',
          level: 'N2',
          question: '努力___、成功するとは限らない。',
          options: ['したからといって', 'したので', 'したから', 'したため'],
          correctIndex: 0,
          explanation:
            '「〜からといって」means "just because ~, it doesn\'t mean ~". 努力したからといって means "just because you worked hard."',
          grammarPoint: 'からといって (just because)',
        },
        {
          id: 'n2-g4',
          section: 'grammar',
          level: 'N2',
          question: '彼女が来る___、準備を整えておいた。',
          options: ['に備えて', 'に対して', 'に関して', 'について'],
          correctIndex: 0,
          explanation:
            '「に備えて」means "in preparation for". 来るに備えて means "in preparation for her arrival."',
          grammarPoint: 'に備えて (in preparation for)',
        },
        {
          id: 'n2-g5',
          section: 'grammar',
          level: 'N2',
          question: '彼は病気___、仕事を休んだ。',
          options: ['をもとに', 'を理由に', 'をきっかけに', 'を中心に'],
          correctIndex: 1,
          explanation:
            '「を理由に」means "using ~ as a reason". 病気を理由に means "using illness as a reason."',
          grammarPoint: 'を理由に (using as a reason)',
        },
        {
          id: 'n2-g6',
          section: 'grammar',
          level: 'N2',
          question: '彼女は___ことなく、毎日練習を続けた。',
          options: ['諦める', '諦めた', '諦め', '諦めて'],
          correctIndex: 2,
          explanation:
            '「〜ことなく」means "without doing ~". 諦めることなく means "without giving up."',
          grammarPoint: 'ことなく (without doing)',
        },
        {
          id: 'n2-g7',
          section: 'grammar',
          level: 'N2',
          question: '彼は疲れている___、文句一つ言わなかった。',
          options: ['にもかかわらず', 'にもかかわらず', 'にもかかわらず', 'にもかかわらず'],
          correctIndex: 0,
          explanation:
            '「にもかかわらず」means "despite, in spite of". 疲れているにもかかわらず means "despite being tired."',
          grammarPoint: 'にもかかわらず (despite)',
        },
        {
          id: 'n2-g8',
          section: 'grammar',
          level: 'N2',
          question: '彼女の話___、彼は無実らしい。',
          options: ['によると', 'によって', 'に対して', 'に関して'],
          correctIndex: 0,
          explanation:
            '「によると」means "according to". 彼女の話によると means "according to her story."',
          grammarPoint: 'によると (according to)',
        },
        {
          id: 'n2-g9',
          section: 'grammar',
          level: 'N2',
          question: '彼は___次第、連絡します。',
          options: ['到着する', '到着した', '到着', '到着して'],
          correctIndex: 2,
          explanation: '「〜次第」means "as soon as". 到着次第 means "as soon as (he) arrives."',
          grammarPoint: '次第 (as soon as)',
        },
        {
          id: 'n2-g10',
          section: 'grammar',
          level: 'N2',
          question: '彼女は___に違いない。',
          options: ['知っている', '知っていた', '知っている', '知る'],
          correctIndex: 0,
          explanation:
            '「に違いない」means "must be, no doubt". 知っているに違いない means "she must know."',
          grammarPoint: 'に違いない (must be)',
        },
      ],
      reading: [
        {
          id: 'n2-r1',
          section: 'reading',
          level: 'N2',
          context:
            '人工知能（AI）の発展により、多くの職業が自動化される可能性があると言われています。特に、ルーティン作業や単純な判断を要する仕事は、AIに置き換えられるリスクが高いとされています。一方で、創造性や感情的知性を必要とする仕事は、当面は人間が担い続けるでしょう。',
          question: 'AIに置き換えられるリスクが高い仕事の特徴はどれですか？',
          options: [
            '創造性が必要な仕事',
            'ルーティン作業や単純な判断',
            '感情的知性が必要な仕事',
            '複雑な人間関係を要する仕事',
          ],
          correctIndex: 1,
          explanation:
            'The text says jobs requiring routine work and simple judgments (ルーティン作業や単純な判断) have a high risk of being replaced by AI.',
        },
        {
          id: 'n2-r2',
          section: 'reading',
          level: 'N2',
          context:
            '少子高齢化が進む日本では、労働力不足が深刻な問題となっています。この問題に対処するため、政府は女性や高齢者の就労促進、外国人労働者の受け入れ拡大などの政策を推進しています。しかし、根本的な解決には出生率の向上が不可欠だという意見も多くあります。',
          question: '筆者が述べている根本的な解決策は何ですか？',
          options: ['外国人労働者の受け入れ', '女性の就労促進', '出生率の向上', '高齢者の就労促進'],
          correctIndex: 2,
          explanation:
            'The text says 「根本的な解決には出生率の向上が不可欠」— improving the birth rate is essential for a fundamental solution.',
        },
        {
          id: 'n2-r3',
          section: 'reading',
          level: 'N2',
          context:
            '持続可能な社会の実現に向けて、企業のCSR（企業の社会的責任）活動が注目されています。環境への配慮、地域社会への貢献、従業員の福祉向上など、利益追求だけでなく社会全体への責任を果たすことが求められています。',
          question: 'CSR活動に含まれないものはどれですか？',
          options: [
            '環境への配慮',
            '地域社会への貢献',
            '株主への利益最大化のみ',
            '従業員の福祉向上',
          ],
          correctIndex: 2,
          explanation:
            'CSR involves environmental care, community contribution, and employee welfare. Maximizing shareholder profit alone is not CSR.',
        },
        {
          id: 'n2-r4',
          section: 'reading',
          level: 'N2',
          context:
            '言語習得において、インプットとアウトプットのバランスが重要だと言われています。多くの学習者は読む・聞くというインプットに偏りがちですが、実際に話す・書くというアウトプットの練習も同様に重要です。特に、実際のコミュニケーション場面での練習が効果的です。',
          question: '言語習得において筆者が強調していることは何ですか？',
          options: [
            'インプットだけが重要',
            'アウトプットだけが重要',
            'インプットとアウトプットのバランス',
            '文法学習が最も重要',
          ],
          correctIndex: 2,
          explanation:
            'The author emphasizes the balance between input and output (インプットとアウトプットのバランス) in language acquisition.',
        },
        {
          id: 'n2-r5',
          section: 'reading',
          level: 'N2',
          context:
            '現代の情報社会において、メディアリテラシーの重要性が高まっています。インターネット上には正確な情報と誤った情報が混在しており、情報を批判的に評価する能力が求められます。特に、情報源の信頼性を確認することが重要です。',
          question: 'メディアリテラシーとして最も重要なことは何ですか？',
          options: [
            '多くの情報を集める',
            '情報を批判的に評価する',
            '有名なサイトだけを見る',
            '情報を共有する',
          ],
          correctIndex: 1,
          explanation:
            'The text emphasizes the ability to critically evaluate information (情報を批判的に評価する能力) as key to media literacy.',
        },
        {
          id: 'n2-r6',
          section: 'reading',
          level: 'N2',
          context:
            '日本の伝統的な建築様式である数寄屋造りは、茶室建築から発展したものです。自然素材を多用し、簡素さと洗練さを兼ね備えた美しさが特徴です。現代建築にも影響を与えており、日本の美意識を体現した建築様式として世界的に評価されています。',
          question: '数寄屋造りの特徴として述べられていないものはどれですか？',
          options: ['自然素材の多用', '簡素さと洗練さ', '茶室建築からの発展', '大規模な装飾'],
          correctIndex: 3,
          explanation:
            'The text describes sukiya-zukuri as using natural materials, simplicity, and refinement. Large-scale decoration is not mentioned and contradicts the style.',
        },
        {
          id: 'n2-r7',
          section: 'reading',
          level: 'N2',
          context:
            '近年、マインドフルネス瞑想が注目されています。ストレス軽減や集中力向上に効果があるとされ、企業研修や学校教育にも取り入れられるようになっています。しかし、効果には個人差があり、すべての人に同じ効果があるわけではありません。',
          question: 'マインドフルネス瞑想について正しいものはどれですか？',
          options: [
            'すべての人に同じ効果がある',
            'ストレス軽減に効果があるとされる',
            '企業では使われていない',
            '学校教育には向かない',
          ],
          correctIndex: 1,
          explanation:
            'The text says mindfulness is said to be effective for stress reduction (ストレス軽減に効果があるとされ).',
        },
        {
          id: 'n2-r8',
          section: 'reading',
          level: 'N2',
          context:
            '経済のグローバル化により、異文化間コミュニケーションの重要性が増しています。言語の壁だけでなく、価値観や習慣の違いを理解し、尊重することが求められます。異文化理解は、国際ビジネスの成功だけでなく、平和な国際関係の構築にも貢献します。',
          question: '異文化間コミュニケーションで重要なことは何ですか？',
          options: [
            '言語だけを学ぶ',
            '自国の文化を押し付ける',
            '価値観や習慣の違いを理解し尊重する',
            '文化の違いを無視する',
          ],
          correctIndex: 2,
          explanation:
            'The text says understanding and respecting differences in values and customs (価値観や習慣の違いを理解し、尊重する) is required.',
        },
      ],
      listening: [
        {
          id: 'n2-l1',
          section: 'listening',
          level: 'N2',
          context:
            '🎧 [会議] 部長：「来月の新製品発表会について、準備状況を報告してください。」\n田中：「会場の予約は完了しています。招待状の発送は来週中に終わる予定です。ただ、プレゼン資料の作成がまだ途中です。」\n部長：「プレゼン資料は最優先で進めてください。」',
          question: '部長が最優先で進めるよう指示したことは何ですか？',
          options: ['会場の予約', '招待状の発送', 'プレゼン資料の作成', '製品の開発'],
          correctIndex: 2,
          explanation:
            'The manager says 「プレゼン資料は最優先で進めてください」— prioritize the presentation materials.',
        },
        {
          id: 'n2-l2',
          section: 'listening',
          level: 'N2',
          context:
            '🎧 [ラジオ] 「今週末、東京マラソンが開催されます。参加者は約3万人で、コースは都心部を通ります。交通規制が行われますので、お車でお出かけの方はご注意ください。」',
          question: 'ラジオで注意を促しているのは誰ですか？',
          options: ['マラソン参加者', '電車利用者', '車でお出かけの人', '歩行者'],
          correctIndex: 2,
          explanation:
            'The radio warns 「お車でお出かけの方はご注意ください」— those going out by car should be careful.',
        },
        {
          id: 'n2-l3',
          section: 'listening',
          level: 'N2',
          context:
            '🎧 [会話] 女の人：「最近、仕事が忙しくて、なかなか趣味の時間が取れないんです。」\n男の人：「それは大変ですね。でも、趣味の時間を作ることも大切ですよ。仕事の効率も上がりますし。」\n女の人：「そうですね。週末だけでも時間を作るようにします。」',
          question: '男の人が趣味の時間を作ることを勧めた理由は何ですか？',
          options: [
            '楽しいから',
            '仕事の効率が上がるから',
            '健康に良いから',
            'ストレス解消になるから',
          ],
          correctIndex: 1,
          explanation:
            'The man says 「仕事の効率も上がりますし」— it also improves work efficiency.',
        },
        {
          id: 'n2-l4',
          section: 'listening',
          level: 'N2',
          context:
            '🎧 [講演] 「環境問題に取り組むためには、まず私たち一人一人の意識を変えることが重要です。日常生活での小さな行動の積み重ねが、大きな変化につながります。」',
          question: '講演者が最初に必要だと述べていることは何ですか？',
          options: ['政府の政策変更', '企業の取り組み', '個人の意識変革', '技術革新'],
          correctIndex: 2,
          explanation:
            'The speaker says 「まず私たち一人一人の意識を変えることが重要」— first, changing individual awareness is important.',
        },
        {
          id: 'n2-l5',
          section: 'listening',
          level: 'N2',
          context:
            '🎧 [会話] 男の人：「新しいプロジェクトのメンバーを選ぶんですが、田中さんはどう思いますか？」\n女の人：「田中さんは技術力は高いですが、チームワークが少し苦手なようです。」\n男の人：「そうですか。では、山田さんはどうでしょう？」\n女の人：「山田さんはコミュニケーション能力が高く、リーダーシップもあります。」',
          question: '山田さんの特徴として述べられているものはどれですか？',
          options: [
            '技術力が高い',
            'チームワークが苦手',
            'コミュニケーション能力が高い',
            '経験が豊富',
          ],
          correctIndex: 2,
          explanation:
            'The woman says Yamada-san has high communication ability (コミュニケーション能力が高く) and leadership.',
        },
        {
          id: 'n2-l6',
          section: 'listening',
          level: 'N2',
          context:
            '🎧 [ニュース] 「経済産業省の発表によると、今年の国内総生産は前年比2.3%増加しました。輸出の増加と個人消費の回復が主な要因とされています。」',
          question: 'GDPが増加した主な要因として述べられていないものはどれですか？',
          options: ['輸出の増加', '個人消費の回復', '政府支出の増加', '前年比2.3%増'],
          correctIndex: 2,
          explanation:
            'The news mentions export increase and personal consumption recovery as factors. Government spending increase is not mentioned.',
        },
        {
          id: 'n2-l7',
          section: 'listening',
          level: 'N2',
          context:
            '🎧 [会話] 女の人：「田中さん、先日の提案書、上司に見せましたか？」\n男の人：「はい、見せました。内容は良いと言ってもらえたんですが、もう少し具体的なデータが必要だと言われました。」\n女の人：「そうですか。データの収集、手伝いましょうか？」\n男の人：「ありがとうございます。お願いできますか？」',
          question: '上司が提案書について指摘したことは何ですか？',
          options: ['内容が悪い', '具体的なデータが不足している', '文章が長すぎる', '提出が遅い'],
          correctIndex: 1,
          explanation: 'The boss said more specific data is needed (もう少し具体的なデータが必要).',
        },
        {
          id: 'n2-l8',
          section: 'listening',
          level: 'N2',
          context:
            '🎧 [セミナー] 「効果的な時間管理のポイントは三つあります。一つ目は優先順位をつけること、二つ目は集中できる環境を作ること、三つ目は定期的に休憩を取ることです。」',
          question: '効果的な時間管理のポイントとして述べられていないものはどれですか？',
          options: [
            '優先順位をつける',
            '集中できる環境を作る',
            '長時間連続して働く',
            '定期的に休憩を取る',
          ],
          correctIndex: 2,
          explanation:
            'The three points are: prioritizing, creating a focused environment, and taking regular breaks. Working long hours continuously is not mentioned.',
        },
      ],
    },
    N1: {
      grammar: [
        {
          id: 'n1-g1',
          section: 'grammar',
          level: 'N1',
          question: '彼女の才能___、誰もが認めるところだ。',
          options: ['たるや', 'ときたら', 'といえば', 'とあれば'],
          correctIndex: 0,
          explanation:
            '「たるや」is a classical/formal expression emphasizing the extent of something. 才能たるや means "as for her talent (it is remarkable)."',
          grammarPoint: 'たるや (emphatic, classical)',
        },
        {
          id: 'n1-g2',
          section: 'grammar',
          level: 'N1',
          question: '彼は___ともなく、窓の外を眺めていた。',
          options: ['見る', '見て', '見', '見た'],
          correctIndex: 0,
          explanation:
            '「〜ともなく」means "without any particular intention". 見るともなく means "gazing without really looking."',
          grammarPoint: 'ともなく (without intention)',
        },
        {
          id: 'n1-g3',
          section: 'grammar',
          level: 'N1',
          question: '彼女は___が最後、絶対に諦めない。',
          options: ['やり始めた', 'やり始める', 'やり始め', 'やり始めて'],
          correctIndex: 0,
          explanation:
            '「〜が最後」means "once ~ happens, (something inevitable follows)". やり始めたが最後 means "once she starts, she never gives up."',
          grammarPoint: 'が最後 (once...then inevitably)',
        },
        {
          id: 'n1-g4',
          section: 'grammar',
          level: 'N1',
          question: '彼の言葉___、私は深く感動した。',
          options: ['いかんで', 'いかんによって', 'いかんにかかわらず', 'いかんによらず'],
          correctIndex: 1,
          explanation:
            '「いかんによって」means "depending on". 言葉いかんによって means "depending on his words."',
          grammarPoint: 'いかんによって (depending on)',
        },
        {
          id: 'n1-g5',
          section: 'grammar',
          level: 'N1',
          question: '彼女は___ばかりに、大切な友人を失った。',
          options: ['嘘をついた', '嘘をつく', '嘘をつき', '嘘をついて'],
          correctIndex: 0,
          explanation:
            '「〜ばかりに」means "just because of ~, (negative consequence)". 嘘をついたばかりに means "just because she lied."',
          grammarPoint: 'ばかりに (just because, negative result)',
        },
        {
          id: 'n1-g6',
          section: 'grammar',
          level: 'N1',
          question: '彼は___なり、泣き出した。',
          options: ['それを聞く', 'それを聞いた', 'それを聞き', 'それを聞いて'],
          correctIndex: 0,
          explanation:
            '「〜なり」means "as soon as". それを聞くなり means "as soon as he heard that."',
          grammarPoint: 'なり (as soon as)',
        },
        {
          id: 'n1-g7',
          section: 'grammar',
          level: 'N1',
          question: '彼女の努力___、成功は当然の結果だ。',
          options: ['をもってすれば', 'をもって', 'をもとに', 'をもとにして'],
          correctIndex: 0,
          explanation:
            '「をもってすれば」means "with ~ (it is possible)". 努力をもってすれば means "with her effort (success is natural)."',
          grammarPoint: 'をもってすれば (with, given)',
        },
        {
          id: 'n1-g8',
          section: 'grammar',
          level: 'N1',
          question: '彼は___ことか、何度も失敗した。',
          options: [
            'どれほど悔しかった',
            'どれほど悔しい',
            'どれほど悔しく',
            'どれほど悔しかっただろう',
          ],
          correctIndex: 3,
          explanation:
            '「〜ことか」expresses strong emotion. どれほど悔しかっただろうことか means "how frustrated he must have been!"',
          grammarPoint: 'ことか (exclamatory emotion)',
        },
        {
          id: 'n1-g9',
          section: 'grammar',
          level: 'N1',
          question: '彼女___、この問題は解けない。',
          options: ['をおいて他に', 'をおいて', 'をおいては', 'をおいても'],
          correctIndex: 0,
          explanation:
            '「をおいて他に〜ない」means "there is no one other than ~". 彼女をおいて他に means "there is no one other than her."',
          grammarPoint: 'をおいて他に〜ない (no one other than)',
        },
        {
          id: 'n1-g10',
          section: 'grammar',
          level: 'N1',
          question: '彼は___とばかりに、立ち上がった。',
          options: ['今だ', '今', '今の', '今で'],
          correctIndex: 0,
          explanation:
            '「〜とばかりに」means "as if to say ~". 今だとばかりに means "as if to say \'now is the time\'."',
          grammarPoint: 'とばかりに (as if to say)',
        },
      ],
      reading: [
        {
          id: 'n1-r1',
          section: 'reading',
          level: 'N1',
          context:
            '言語は単なるコミュニケーションの道具ではなく、思考の枠組みそのものを形成する。サピア＝ウォーフ仮説によれば、人々が話す言語は、その人の世界の認識方法に影響を与える。例えば、色彩語彙の豊富な言語を話す人は、色の区別をより細かく認識できるという研究結果がある。',
          question: 'サピア＝ウォーフ仮説の主張として最も適切なものはどれですか？',
          options: [
            '言語は思考に影響を与えない',
            '言語は思考の枠組みを形成する',
            '色彩語彙は全言語で同じ',
            '言語習得は幼少期のみ可能',
          ],
          correctIndex: 1,
          explanation:
            'The Sapir-Whorf hypothesis claims that language shapes the framework of thought (思考の枠組みそのものを形成する).',
        },
        {
          id: 'n1-r2',
          section: 'reading',
          level: 'N1',
          context:
            '近代化の過程において、伝統と革新の間の緊張関係は避けられない。日本の明治維新はその典型例であり、西洋文明を積極的に取り入れながらも、日本固有の文化的アイデンティティを維持しようとした。この「和魂洋才」の精神は、現代日本社会にも脈々と受け継がれている。',
          question: '「和魂洋才」の精神が示すものは何ですか？',
          options: [
            '西洋文化の完全な採用',
            '日本文化の完全な拒絶',
            '日本の精神を保ちながら西洋の知識を活用',
            '伝統と革新の完全な分離',
          ],
          correctIndex: 2,
          explanation:
            '和魂洋才 means maintaining Japanese spirit (和魂) while adopting Western knowledge (洋才) — preserving Japanese identity while embracing Western learning.',
        },
        {
          id: 'n1-r3',
          section: 'reading',
          level: 'N1',
          context:
            '現代の民主主義社会において、メディアの役割は極めて重要である。メディアは「第四の権力」とも呼ばれ、立法・行政・司法に次ぐ社会的影響力を持つとされる。しかし、メディアの商業化や政治的偏向が問題視される現代において、市民のメディアリテラシーの向上が不可欠となっている。',
          question: 'メディアが「第四の権力」と呼ばれる理由は何ですか？',
          options: [
            '政府を直接支配するから',
            '立法・行政・司法に次ぐ社会的影響力を持つから',
            '経済的に最も強力だから',
            '国際的な影響力があるから',
          ],
          correctIndex: 1,
          explanation:
            'Media is called the "fourth power" because it has social influence second only to the legislative, executive, and judicial branches.',
        },
        {
          id: 'n1-r4',
          section: 'reading',
          level: 'N1',
          context:
            '量子コンピュータは、従来のコンピュータとは根本的に異なる原理で動作する。古典的なビットが0か1のどちらかの状態を取るのに対し、量子ビット（キュービット）は重ね合わせの原理により、0と1の両方の状態を同時に取ることができる。これにより、特定の計算問題において、従来のコンピュータを遥かに凌ぐ処理能力を発揮する。',
          question: '量子コンピュータの特徴として正しいものはどれですか？',
          options: [
            '古典的なビットと同じ原理で動作する',
            'キュービットは0か1のどちらかのみ',
            'キュービットは0と1の両方の状態を同時に取れる',
            'すべての計算で従来より速い',
          ],
          correctIndex: 2,
          explanation:
            'Qubits can take both 0 and 1 states simultaneously through superposition (重ね合わせの原理により、0と1の両方の状態を同時に取ることができる).',
        },
        {
          id: 'n1-r5',
          section: 'reading',
          level: 'N1',
          context:
            '芸術における「崇高」の概念は、カントの美学において重要な位置を占める。崇高は単なる美しさとは異なり、圧倒的な大きさや力を前にした時の、恐怖と魅了が混在した感情体験を指す。自然の壮大さや人間の限界を超えた何かに触れた時、人は崇高を感じると言われる。',
          question: 'カントの美学における「崇高」の説明として最も適切なものはどれですか？',
          options: [
            '単純な美しさの感情',
            '恐怖と魅了が混在した感情体験',
            '人工物に対する感情',
            '日常的な美の体験',
          ],
          correctIndex: 1,
          explanation:
            "The sublime (崇高) in Kant's aesthetics refers to an emotional experience mixing fear and fascination (恐怖と魅了が混在した感情体験) when confronted with overwhelming magnitude or power.",
        },
        {
          id: 'n1-r6',
          section: 'reading',
          level: 'N1',
          context:
            '社会学者のマックス・ウェーバーは、資本主義の発展とプロテスタンティズムの倫理の関係を論じた。彼によれば、カルヴァン主義の予定説が、勤勉・節約・禁欲という資本主義精神の基盤を形成したという。この議論は現在も社会科学において重要な参照点となっている。',
          question: 'ウェーバーの主張として最も適切なものはどれですか？',
          options: [
            '資本主義がプロテスタンティズムを生んだ',
            'カルヴァン主義が資本主義精神の基盤を形成した',
            '宗教と経済は無関係だ',
            '資本主義は日本で発展した',
          ],
          correctIndex: 1,
          explanation:
            'Weber argued that Calvinist predestination formed the basis of the capitalist spirit of diligence, frugality, and asceticism.',
        },
        {
          id: 'n1-r7',
          section: 'reading',
          level: 'N1',
          context:
            '認知バイアスとは、人間の思考や判断に系統的な誤りをもたらす心理的傾向のことである。確証バイアスは、自分の既存の信念を支持する情報を優先的に探し、反証する情報を無視する傾向を指す。このバイアスは、政治的意見形成やメディア消費のパターンに大きな影響を与えている。',
          question: '確証バイアスの説明として最も適切なものはどれですか？',
          options: [
            'すべての情報を平等に評価する',
            '自分の信念を支持する情報を優先する',
            '反証する情報を積極的に探す',
            '感情に基づいて判断する',
          ],
          correctIndex: 1,
          explanation:
            'Confirmation bias is the tendency to prioritize information that supports existing beliefs (自分の既存の信念を支持する情報を優先的に探し) and ignore contradicting information.',
        },
        {
          id: 'n1-r8',
          section: 'reading',
          level: 'N1',
          context:
            '生態系サービスとは、人間が自然生態系から受け取る恩恵の総称である。供給サービス（食料・水・木材）、調整サービス（気候調節・洪水制御）、文化的サービス（レクリエーション・精神的価値）、基盤サービス（土壌形成・栄養循環）の四つに分類される。',
          question: '生態系サービスの分類に含まれないものはどれですか？',
          options: ['供給サービス', '調整サービス', '経済サービス', '文化的サービス'],
          correctIndex: 2,
          explanation:
            'The four categories are provisioning, regulating, cultural, and supporting services. Economic services (経済サービス) is not one of the four categories.',
        },
      ],
      listening: [
        {
          id: 'n1-l1',
          section: 'listening',
          level: 'N1',
          context:
            '🎧 [討論] 司会：「AI技術の発展について、どのようにお考えですか？」\n専門家A：「AIは人類に多大な恩恵をもたらす可能性がありますが、倫理的な問題や雇用への影響も慎重に考える必要があります。」\n専門家B：「技術の発展を止めることはできません。重要なのは、その恩恵を社会全体で公平に享受できる仕組みを作ることです。」',
          question: '専門家Bが最も重要だと述べていることは何ですか？',
          options: [
            'AI技術の発展を止める',
            'AIの倫理的問題を解決する',
            'AI技術の恩恵を社会全体で公平に享受する仕組み',
            '雇用への影響を最小化する',
          ],
          correctIndex: 2,
          explanation:
            'Expert B says the important thing is creating a system where the benefits can be enjoyed fairly by all of society (社会全体で公平に享受できる仕組みを作ること).',
        },
        {
          id: 'n1-l2',
          section: 'listening',
          level: 'N1',
          context:
            '🎧 [講義] 「ポストモダニズムは、近代の大きな物語、すなわち進歩・理性・普遍的真理への信頼を疑問視します。代わりに、多様な視点や局所的な知識の重要性を強調します。これは文学・建築・哲学など様々な分野に影響を与えました。」',
          question: 'ポストモダニズムが疑問視するものはどれですか？',
          options: [
            '多様な視点',
            '局所的な知識',
            '近代の大きな物語（進歩・理性・普遍的真理）',
            '文学や建築',
          ],
          correctIndex: 2,
          explanation:
            'Postmodernism questions the grand narratives of modernity — progress, reason, and universal truth (近代の大きな物語、すなわち進歩・理性・普遍的真理への信頼を疑問視).',
        },
        {
          id: 'n1-l3',
          section: 'listening',
          level: 'N1',
          context:
            '🎧 [インタビュー] 記者：「今回の研究の意義について教えてください。」\n研究者：「この研究は、従来の理論を根本から覆す可能性があります。特に、長年定説とされてきた仮説に反証を提示できたことが最大の成果です。」',
          question: '研究者が最大の成果として挙げているものは何ですか？',
          options: ['新しい理論の構築', '長年の定説への反証提示', '研究費の獲得', '国際的な認知'],
          correctIndex: 1,
          explanation:
            'The researcher says the greatest achievement is presenting counter-evidence to the long-held hypothesis (長年定説とされてきた仮説に反証を提示できたこと).',
        },
        {
          id: 'n1-l4',
          section: 'listening',
          level: 'N1',
          context:
            '🎧 [会議] 「今期の業績について報告します。売上高は前年比15%増と好調でしたが、原材料費の高騰により、営業利益は前年比3%減となりました。来期は、コスト削減と新製品開発の両輪で収益改善を図ります。」',
          question: '今期の業績の問題点は何ですか？',
          options: [
            '売上高の減少',
            '原材料費高騰による営業利益の減少',
            '新製品開発の失敗',
            '市場シェアの低下',
          ],
          correctIndex: 1,
          explanation:
            'Despite good sales, operating profit decreased 3% due to rising raw material costs (原材料費の高騰により、営業利益は前年比3%減).',
        },
        {
          id: 'n1-l5',
          section: 'listening',
          level: 'N1',
          context:
            '🎧 [対談] 作家A：「現代文学の課題は、デジタル時代における読者との新たな関係性の構築だと思います。」\n作家B：「同感です。しかし、本質的な問いかけをする文学の力は、メディアが変わっても失われないと信じています。」',
          question: '作家Bが信じていることは何ですか？',
          options: [
            'デジタル時代に文学は不要',
            'メディアが変わっても文学の本質的な力は失われない',
            '現代文学には課題がない',
            '読者との関係性は重要でない',
          ],
          correctIndex: 1,
          explanation:
            'Author B believes that the essential power of literature to pose fundamental questions will not be lost even as media changes.',
        },
        {
          id: 'n1-l6',
          section: 'listening',
          level: 'N1',
          context:
            '🎧 [シンポジウム] 「グローバル化が進む現代において、文化的多様性の保護は重要な課題です。経済的効率性を追求するあまり、少数言語や伝統文化が失われていく現状に、私たちは危機感を持つべきです。」',
          question: '発言者が危機感を持っている理由は何ですか？',
          options: [
            '経済成長が鈍化しているから',
            '少数言語や伝統文化が失われているから',
            'グローバル化が進んでいないから',
            '文化的多様性が増えすぎているから',
          ],
          correctIndex: 1,
          explanation:
            'The speaker feels a sense of crisis because minority languages and traditional cultures are being lost (少数言語や伝統文化が失われていく現状).',
        },
        {
          id: 'n1-l7',
          section: 'listening',
          level: 'N1',
          context:
            '🎧 [ニュース解説] 「今回の政策変更は、短期的には経済に負の影響を与える可能性がありますが、長期的には持続可能な成長につながると専門家は分析しています。重要なのは、この移行期間をいかに乗り越えるかです。」',
          question: '専門家の分析として正しいものはどれですか？',
          options: [
            '短期的にも長期的にも経済に良い',
            '短期的には負の影響があるが長期的には持続可能な成長につながる',
            '長期的には経済に悪影響がある',
            '政策変更は不要だ',
          ],
          correctIndex: 1,
          explanation:
            'Experts analyze that while there may be short-term negative effects, it will lead to sustainable long-term growth.',
        },
        {
          id: 'n1-l8',
          section: 'listening',
          level: 'N1',
          context:
            '🎧 [講演] 「哲学者のハンナ・アーレントは、「悪の凡庸さ」という概念を提唱しました。これは、大きな悪は必ずしも邪悪な意図から生まれるのではなく、思考停止や命令への盲目的な服従から生まれうるという洞察です。」',
          question: '「悪の凡庸さ」が示す洞察は何ですか？',
          options: [
            '悪は常に邪悪な意図から生まれる',
            '大きな悪は思考停止や盲目的服従から生まれうる',
            '哲学は悪を防げない',
            '命令に従うことは常に正しい',
          ],
          correctIndex: 1,
          explanation:
            'The "banality of evil" insight is that great evil can arise not from malicious intent but from thoughtlessness and blind obedience to orders.',
        },
      ],
    },
  };

  const result: Question[] = [];
  sections.forEach((section) => {
    const sectionQuestions = banks[level]?.[section] || [];
    result.push(...sectionQuestions);
  });
  return result;
}

// N2/N1 question banks exist but are hidden until their explanations are translated.
const LEVELS: JLPTLevel[] = ['N5', 'N4', 'N3'];
const ALL_SECTIONS: SectionType[] = ['grammar', 'reading', 'listening'];

export default function ExamSetup({ onStart }: ExamSetupProps) {
  const [selectedLevel, setSelectedLevel] = useState<JLPTLevel>('N5');
  const [selectedSections, setSelectedSections] = useState<SectionType[]>([
    'grammar',
    'reading',
    'listening',
  ]);

  const toggleSection = (s: SectionType) => {
    setSelectedSections((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  };

  const totalTime = selectedSections.reduce((sum, s) => sum + SECTION_INFO[s].time, 0);
  const totalQuestions = selectedSections.reduce((sum, s) => sum + SECTION_INFO[s].count, 0);
  const info = LEVEL_INFO[selectedLevel];

  const handleStart = () => {
    if (selectedSections.length === 0) return;
    const questions = generateQuestions(selectedLevel, selectedSections);
    onStart({ level: selectedLevel, sections: selectedSections }, questions);
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <span>လေ့ကျင့်ရန်</span>
          <span className="text-border">›</span>
          <span className="text-foreground font-medium">JLPT Mock Test</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground">JLPT Mock Test</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          အချိန်မှတ်ပြီး ဖြေရတဲ့ စမ်းသပ်စာမေးပွဲ — အပိုင်းအလိုက် ရမှတ်နဲ့ မြန်မာလို
          အဖြေရှင်းလင်းချက် ပါပါတယ်။
        </p>
      </div>

      {/* Level Selection */}
      <div className="bg-card border border-border rounded-xl p-6 mb-5">
        <h2 className="text-base font-semibold text-foreground mb-4">JLPT အဆင့် ရွေးပါ</h2>
        <div className="grid grid-cols-3 gap-3">
          {LEVELS.map((level) => {
            const li = LEVEL_INFO[level];
            const isSelected = selectedLevel === level;
            return (
              <button
                key={level}
                onClick={() => setSelectedLevel(level)}
                className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-150 ${
                  isSelected
                    ? 'border-current shadow-md scale-105'
                    : 'border-border hover:border-current/40 hover:scale-102'
                }`}
                style={{
                  borderColor: isSelected ? li.color : undefined,
                  backgroundColor: isSelected ? li.bg : undefined,
                  color: li.color,
                }}
              >
                <span className="text-2xl font-bold" style={{ fontFamily: 'serif' }}>
                  {li.kanji}
                </span>
                <span className="text-lg font-bold">{level}</span>
                <span
                  className="text-[10px] text-center leading-tight"
                  style={{ color: isSelected ? li.color : '#888' }}
                >
                  {li.desc}
                </span>
                {isSelected && (
                  <span
                    className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                    style={{ backgroundColor: li.color }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Section Selection */}
      <div className="bg-card border border-border rounded-xl p-6 mb-5">
        <h2 className="text-base font-semibold text-foreground mb-4">ဖြေမယ့် အပိုင်းများ ရွေးပါ</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {ALL_SECTIONS.map((section) => {
            const si = SECTION_INFO[section];
            const isSelected = selectedSections.includes(section);
            return (
              <button
                key={section}
                onClick={() => toggleSection(section)}
                className={`flex flex-col gap-2 p-4 rounded-xl border-2 text-left transition-all duration-150 ${
                  isSelected
                    ? 'border-[#006633] bg-[#006633]/5'
                    : 'border-border hover:border-[#006633]/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl">{si.icon}</span>
                  <span
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected ? 'border-[#006633] bg-[#006633]' : 'border-border'
                    }`}
                  >
                    {isSelected && <span className="text-white text-xs">✓</span>}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{si.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{si.desc}</p>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                  <span>⏱ {si.time} မိနစ်</span>
                  <span>📝 {si.count} ပုဒ်</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Exam Summary + Start */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-foreground">စာမေးပွဲ အကျဉ်း</h2>
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border"
            style={{ color: info.color, backgroundColor: info.bg, borderColor: info.border }}
          >
            {selectedLevel} အဆင့်
          </span>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-2xl font-bold text-foreground">{selectedSections.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">အပိုင်း</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-2xl font-bold text-foreground">{totalQuestions}</p>
            <p className="text-xs text-muted-foreground mt-0.5">မေးခွန်း</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-2xl font-bold text-foreground">{totalTime}</p>
            <p className="text-xs text-muted-foreground mt-0.5">မိနစ်</p>
          </div>
        </div>
        <button
          onClick={handleStart}
          disabled={selectedSections.length === 0}
          className="w-full py-3 rounded-xl font-semibold text-white text-sm transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ backgroundColor: selectedSections.length > 0 ? '#006633' : undefined }}
        >
          {selectedSections.length === 0
            ? 'အနည်းဆုံး အပိုင်း တစ်ခု ရွေးပါ'
            : `${selectedLevel} စာမေးပွဲ စဖြေမယ် →`}
        </button>
      </div>
    </div>
  );
}

export { generateQuestions, SECTION_INFO, LEVEL_INFO };
