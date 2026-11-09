'use client';
import React, { useState } from 'react';

interface Question {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

const questions: Question[] = [
  {
    id: 1,
    question: '「書く」の て形は 何ですか？',
    options: ['書いて', '書って', '書きて', '書して'],
    correct: 0,
    explanation: '「書く」က အုပ်စု ၁ ကြိယာပါ။ く → いて ပြောင်းလို့ 「書いて」 ဖြစ်ပါတယ်။',
  },
  {
    id: 2,
    question: 'လုပ်ရပ်နှစ်ခုကို て ပုံစံနဲ့ မှန်မှန်ကန်ကန် ဆက်ထားတဲ့ ဝါကျက ဘယ်ဟာလဲ?',
    options: [
      '朝ごはんを食べる、学校に行きます。',
      '朝ごはんを食べて、学校に行きます。',
      '朝ごはんを食べた、学校に行きます。',
      '朝ごはんを食べたら、学校に行きます。',
    ],
    correct: 1,
    explanation:
      'လုပ်ရပ်တွေကို အစဉ်လိုက် ဆက်တဲ့အခါ て ပုံစံ သုံးပါတယ်။ 「食べて」က စားခြင်းနဲ့ ကျောင်းသွားခြင်းကို ဆက်ပေးပါတယ်။',
  },
  {
    id: 3,
    question: '"ခဏ စောင့်ပါ" ကို ဂျပန်လို ဘယ်လို ပြောမလဲ?',
    options: [
      'ちょっと待ちてください。',
      'ちょっと待つください。',
      'ちょっと待ってください。',
      'ちょっと待いてください。',
    ],
    correct: 2,
    explanation:
      '「待つ」က အုပ်စု ၁ ကြိယာပါ။ つ → って ပြောင်းလို့ 「待って」 ဖြစ်ပြီး 「待ってください」= စောင့်ပါ။',
  },
  {
    id: 4,
    question: '「今、テレビを___います。」— မှန်တဲ့ ပုံစံက ဘာလဲ?',
    options: ['見て', '見た', '見る', '見ない'],
    correct: 0,
    explanation:
      'လုပ်နေဆဲ လုပ်ရပ်ကို て ပုံစံ + います နဲ့ ပြပါတယ်။ 「見て」+「います」= 見ています (ကြည့်နေပါတယ်)။',
  },
  {
    id: 5,
    question: 'ပုံမှန် စည်းမျဉ်းအတိုင်း မပြောင်းတဲ့ (irregular) ကြိယာက ဘယ်ဟာလဲ?',
    options: ['食べる', '書く', 'する', '待つ'],
    correct: 2,
    explanation:
      '「する」က အုပ်စု ၃ (ပုံမှန်မဟုတ်) ကြိယာပါ။ て ပုံစံက 「して」 ဖြစ်ပြီး ဘယ်စည်းမျဉ်းနဲ့မှ မကိုက်ပါဘူး။',
  },
];

type QuizState = 'idle' | 'active' | 'completed';

export default function EmbeddedQuiz() {
  const [quizState, setQuizState] = useState<QuizState>('idle');
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(questions.length).fill(null));
  const [showExplanation, setShowExplanation] = useState(false);

  const score = answers.filter((a, i) => a === questions[i].correct).length;
  const question = questions[currentQ];
  const isAnswered = selected !== null;
  const isCorrect = selected === question.correct;

  const handleSelect = (idx: number) => {
    if (isAnswered) return;
    setSelected(idx);
    setShowExplanation(true);
    const newAnswers = [...answers];
    newAnswers[currentQ] = idx;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
      setSelected(answers[currentQ + 1]);
      setShowExplanation(answers[currentQ + 1] !== null);
    } else {
      setQuizState('completed');
    }
  };

  const handlePrev = () => {
    if (currentQ > 0) {
      setCurrentQ(currentQ - 1);
      setSelected(answers[currentQ - 1]);
      setShowExplanation(answers[currentQ - 1] !== null);
    }
  };

  const handleRestart = () => {
    setQuizState('idle');
    setCurrentQ(0);
    setSelected(null);
    setAnswers(Array(questions.length).fill(null));
    setShowExplanation(false);
  };

  if (quizState === 'idle') {
    return (
      <div className="text-center py-8">
        <div className="text-5xl mb-4">📝</div>
        <h3 className="text-lg font-bold text-foreground mb-2">သင်ခန်းစာ Quiz</h3>
        <p className="text-sm text-muted-foreground mb-1">
          て ပုံစံ ဆက်စပ်အသုံး — အခန်း ၄၊ သင်ခန်းစာ ၇
        </p>
        <p className="text-sm text-muted-foreground mb-6">
          မေးခွန်း {questions.length} ပုဒ် · て ပုံစံ ပြောင်းနည်းနဲ့ အသုံးကို စစ်ဆေးပါမယ်
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mb-6 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#006633]" />
            {questions.length} ပုဒ်
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            အချိန်ကန့်သတ်ချက် မရှိ
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            ချက်ချင်း အဖြေပြ
          </span>
        </div>
        <button
          onClick={() => setQuizState('active')}
          className="px-8 py-3 bg-[#006633] text-white font-semibold rounded-xl hover:bg-[#005528] transition-colors shadow-sm"
        >
          Quiz စဖြေမယ်
        </button>
      </div>
    );
  }

  if (quizState === 'completed') {
    const pct = Math.round((score / questions.length) * 100);
    const passed = pct >= 60;
    return (
      <div className="text-center py-6">
        <div className="text-5xl mb-4">{pct >= 80 ? '🎉' : pct >= 60 ? '👍' : '📚'}</div>
        <h3 className="text-xl font-bold text-foreground mb-1">Quiz Complete!</h3>
        <p className="text-sm text-muted-foreground mb-5">て-form Connections</p>

        <div
          className={`inline-flex items-center justify-center w-24 h-24 rounded-full border-4 mb-4 ${passed ? 'border-[#006633] bg-[#006633]/10' : 'border-amber-500 bg-amber-50'}`}
        >
          <div>
            <p className={`text-2xl font-bold ${passed ? 'text-[#006633]' : 'text-amber-600'}`}>
              {score}/{questions.length}
            </p>
            <p className={`text-xs font-medium ${passed ? 'text-[#006633]' : 'text-amber-600'}`}>
              {pct}%
            </p>
          </div>
        </div>

        <p className={`text-sm font-medium mb-6 ${passed ? 'text-[#006633]' : 'text-amber-600'}`}>
          {pct >= 80
            ? 'အရမ်းတော်ပါတယ်! て ပုံစံကို ကျွမ်းကျင်သွားပါပြီ!'
            : pct >= 60
              ? 'ကောင်းပါတယ်! မှားခဲ့တဲ့ မေးခွန်းတွေကို ပြန်ကြည့်ပါ။'
              : 'ဆက်ကြိုးစားပါ! သင်ခန်းစာကို ပြန်ဖတ်ပြီး ထပ်ဖြေကြည့်ပါ။'}
        </p>

        {/* Per-question review */}
        <div className="text-left space-y-2 mb-6">
          {questions.map((q, i) => {
            const ans = answers[i];
            const correct = ans === q.correct;
            return (
              <div
                key={i}
                className={`flex items-center gap-3 p-2.5 rounded-lg text-sm ${correct ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}
              >
                <span
                  className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${correct ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}
                >
                  {correct ? '✓' : '✗'}
                </span>
                <span className={correct ? 'text-green-800' : 'text-red-800'}>
                  {i + 1}. {q.question.length > 40 ? q.question.slice(0, 40) + '…' : q.question}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex gap-3 justify-center">
          <button
            onClick={handleRestart}
            className="px-5 py-2.5 border border-border text-foreground text-sm font-medium rounded-xl hover:bg-muted transition-colors"
          >
            ပြန်ဖြေမယ်
          </button>
          <button
            onClick={() => {
              setQuizState('active');
              setCurrentQ(0);
              setSelected(answers[0]);
              setShowExplanation(answers[0] !== null);
            }}
            className="px-5 py-2.5 bg-[#006633] text-white text-sm font-semibold rounded-xl hover:bg-[#005528] transition-colors"
          >
            အဖြေများ ကြည့်မယ်
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Progress */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-muted-foreground">
          မေးခွန်း {currentQ + 1} / {questions.length}
        </span>
        <div className="flex gap-1.5">
          {questions.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-200 ${
                i === currentQ
                  ? 'w-6 bg-[#006633]'
                  : answers[i] !== null
                    ? answers[i] === questions[i].correct
                      ? 'w-3 bg-green-500'
                      : 'w-3 bg-red-400'
                    : 'w-3 bg-muted'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Question */}
      <div className="mb-5">
        <p className="text-base font-semibold text-foreground leading-relaxed">
          {question.question}
        </p>
      </div>

      {/* Options */}
      <div className="space-y-2.5 mb-5">
        {question.options.map((opt, idx) => {
          let style =
            'border-border bg-background text-foreground hover:border-[#006633]/40 hover:bg-[#006633]/5';
          if (isAnswered) {
            if (idx === question.correct) style = 'border-green-500 bg-green-50 text-green-800';
            else if (idx === selected && idx !== question.correct)
              style = 'border-red-400 bg-red-50 text-red-800';
            else style = 'border-border bg-muted/30 text-muted-foreground';
          }
          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={isAnswered}
              className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-150 ${style} ${!isAnswered ? 'cursor-pointer' : 'cursor-default'}`}
            >
              <span className="inline-flex items-center gap-3">
                <span
                  className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    isAnswered && idx === question.correct
                      ? 'border-green-500 bg-green-500 text-white'
                      : isAnswered && idx === selected && idx !== question.correct
                        ? 'border-red-400 bg-red-400 text-white'
                        : 'border-current'
                  }`}
                >
                  {String.fromCharCode(65 + idx)}
                </span>
                {opt}
              </span>
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {showExplanation && (
        <div
          className={`rounded-xl p-4 mb-5 border ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}
        >
          <p
            className={`text-sm font-semibold mb-1 ${isCorrect ? 'text-green-800' : 'text-red-800'}`}
          >
            {isCorrect ? '✅ မှန်ပါတယ်!' : '❌ မှားပါတယ်'}
          </p>
          <p className={`text-sm ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
            {question.explanation}
          </p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrev}
          disabled={currentQ === 0}
          className="px-4 py-2 text-sm font-medium text-muted-foreground border border-border rounded-lg hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          ← နောက်သို့
        </button>
        <span className="text-xs text-muted-foreground">
          {answers.filter((a) => a !== null).length}/{questions.length} ဖြေပြီး
        </span>
        <button
          onClick={handleNext}
          disabled={!isAnswered}
          className="px-4 py-2 text-sm font-semibold bg-[#006633] text-white rounded-lg hover:bg-[#005528] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {currentQ === questions.length - 1 ? 'ပြီးပြီ →' : 'ရှေ့သို့ →'}
        </button>
      </div>
    </div>
  );
}
