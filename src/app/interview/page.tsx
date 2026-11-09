'use client';
import React, { useEffect, useRef, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Icon from '@/components/ui/AppIcon';
import AiQuotaBadge from '@/components/AiQuotaBadge';
import { streamText } from '@/lib/streamText';
import { api } from '@/lib/api';
import { speak, stopSpeaking, useSpeechRecognition } from '@/lib/speech';
import type { InterviewScore } from '@/lib/interviewScore';

// Mirrors INTERVIEW_SCENARIOS on the server (labels only; the server holds the prompts).
const SCENARIOS = [
  { id: 'konbini', title: 'ကွန်ဗီနီယန်စတိုး ဝန်ထမ်း', emoji: '🏪', level: 'N4' },
  { id: 'kaigo', title: 'သက်ကြီးစောင့်ရှောက်ရေး (介護)', emoji: '🧓', level: 'N4' },
  { id: 'factory', title: 'စက်ရုံ / ထုတ်လုပ်ရေး', emoji: '🏭', level: 'N4' },
  { id: 'restaurant', title: 'စားသောက်ဆိုင်', emoji: '🍜', level: 'N4' },
  { id: 'student', title: 'ဂျပန်ဘာသာ ကျောင်း ဝင်ခွင့်', emoji: '🎓', level: 'N5' },
];

interface Turn {
  role: 'user' | 'assistant';
  content: string;
}

const SCORE_LABELS: Record<keyof InterviewScore['scores'], string> = {
  politeness: 'ယဉ်ကျေးမှု (敬語)',
  grammar: 'သဒ္ဒါ',
  vocabulary: 'ဝေါဟာရ',
  fluency: 'ပြောဆိုမှု ချောမွေ့',
  content: 'အဖြေ အကြောင်းအရာ',
};

/** The interviewer's spoken part is the Japanese lines only (not 🇲🇲 / 💡 lines). */
function japanesePart(text: string) {
  return text
    .split('\n')
    .filter((l) => l.trim() && !l.startsWith('🇲🇲') && !l.startsWith('💡'))
    .join('。');
}

export default function InterviewPage() {
  const [scenarioId, setScenarioId] = useState<string | null>(null);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [voiceOn, setVoiceOn] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scoring, setScoring] = useState(false);
  const [result, setResult] = useState<InterviewScore | null>(null);
  const [quotaKey, setQuotaKey] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  const mic = useSpeechRecognition('ja-JP', (t) => setInput((p) => (p ? `${p} ${t}` : t)));

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [turns, result]);
  useEffect(() => () => stopSpeaking(), []);

  async function interviewerTurn(history: Turn[], id: string) {
    setBusy(true);
    setError(null);
    setTurns([...history, { role: 'assistant', content: '' }]);
    try {
      const full = await streamText(
        '/api/ai/interview',
        { scenarioId: id, messages: history },
        (t) => setTurns([...history, { role: 'assistant', content: t }])
      );
      if (voiceOn) speak(japanesePart(full));
    } catch (err) {
      setTurns(history);
      setError((err as Error).message);
    } finally {
      setBusy(false);
      setQuotaKey((k) => k + 1);
    }
  }

  function start(id: string) {
    setScenarioId(id);
    setResult(null);
    setTurns([]);
    interviewerTurn([], id);
  }

  function answer() {
    const text = input.trim();
    if (!text || busy || !scenarioId) return;
    setInput('');
    interviewerTurn([...turns, { role: 'user', content: text }], scenarioId);
  }

  async function finish() {
    if (!scenarioId) return;
    stopSpeaking();
    setScoring(true);
    setError(null);
    try {
      const { result } = await api<{ result: InterviewScore }>('/api/ai/interview/score', {
        method: 'POST',
        json: { scenarioId, messages: turns },
      });
      setResult(result);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setScoring(false);
      setQuotaKey((k) => k + 1);
    }
  }

  const answered = turns.filter((t) => t.role === 'user').length;
  const scenario = SCENARIOS.find((s) => s.id === scenarioId);

  return (
    <AppLayout activePath="/interview">
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
          <div>
            <h1 className="text-[22px] font-bold text-foreground">အလုပ်အင်တာဗျူး လေ့ကျင့်ခန်း</h1>
            <p className="text-[13px] text-muted-foreground">
              AI 面接官 နဲ့ ဂျပန်လို အင်တာဗျူး ဖြေပြီး အမှတ်နဲ့ အကြံပြုချက် ရယူပါ
            </p>
          </div>
          <AiQuotaBadge refreshKey={quotaKey} />
        </div>

        {!scenarioId && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SCENARIOS.map((s) => (
              <button
                key={s.id}
                onClick={() => start(s.id)}
                className="text-left bg-card border border-border rounded-2xl p-4 hover:border-primary/40 hover:shadow-card-hover transition-all"
              >
                <div className="text-[28px] mb-1">{s.emoji}</div>
                <p className="font-bold text-[15px] text-foreground">{s.title}</p>
                <p className="text-[12px] text-muted-foreground mt-0.5">
                  {s.level} အဆင့် · မေးခွန်း ၇–၈ ခု · ~၁၀ မိနစ်
                </p>
              </button>
            ))}
            <div className="sm:col-span-2 bg-secondary/60 border border-primary/20 rounded-2xl p-4 text-[13px] text-foreground">
              <p className="font-semibold mb-1">💡 ဘယ်လို လေ့ကျင့်ရမလဲ</p>
              <p className="text-muted-foreground">
                面接官 မေးတာကို အသံနဲ့ ကြားရပါမယ်။ 🎤 ခလုတ်ကို နှိပ်ပြီး ဂျပန်လို ပြောပါ၊ ဒါမှမဟုတ်
                စာရိုက်ပါ။ ပြီးရင် &quot;အမှတ်ပေးပါ&quot; ကို နှိပ်ပါ။
              </p>
            </div>
          </div>
        )}

        {scenarioId && (
          <>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[13px] font-semibold text-foreground">
                {scenario?.emoji} {scenario?.title}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setVoiceOn((v) => !v);
                    stopSpeaking();
                  }}
                  className="text-[12px] px-2.5 py-1 rounded-lg border border-border text-muted-foreground"
                >
                  {voiceOn ? '🔊 အသံဖွင့်' : '🔇 အသံပိတ်'}
                </button>
                <button
                  onClick={() => {
                    stopSpeaking();
                    setScenarioId(null);
                    setTurns([]);
                    setResult(null);
                  }}
                  className="text-[12px] px-2.5 py-1 rounded-lg border border-border text-muted-foreground"
                >
                  ပြန်ရွေးမယ်
                </button>
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-4 space-y-3 min-h-[300px]">
              {turns.map((t, i) => (
                <div
                  key={i}
                  className={`flex ${t.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl px-4 py-3 text-[14px] whitespace-pre-wrap ${
                      t.role === 'user'
                        ? 'bg-primary text-white rounded-br-md font-jp'
                        : 'bg-muted/60 text-foreground rounded-bl-md'
                    }`}
                  >
                    {t.role === 'assistant' && (
                      <div className="flex items-center justify-between gap-3 mb-1">
                        <span className="text-[11px] font-semibold text-primary">👔 面接官</span>
                        {t.content && (
                          <button
                            onClick={() => speak(japanesePart(t.content))}
                            className="text-[11px] text-muted-foreground hover:text-primary"
                            aria-label="ထပ်နားထောင်မယ်"
                          >
                            🔊
                          </button>
                        )}
                      </div>
                    )}
                    {t.content ||
                      (busy && i === turns.length - 1 ? (
                        <span className="text-muted-foreground">…</span>
                      ) : null)}
                  </div>
                </div>
              ))}

              {result && <ScoreCard result={result} />}
              <div ref={bottomRef} />
            </div>

            {error && <p className="text-[13px] text-danger mt-2">{error}</p>}

            {!result && (
              <div className="mt-3 space-y-2">
                <div className="flex items-end gap-2">
                  <textarea
                    value={mic.listening && mic.interim ? `${input}${mic.interim}` : input}
                    onChange={(e) => setInput(e.target.value)}
                    rows={2}
                    maxLength={1500}
                    placeholder="ဂျပန်လို ဖြေပါ… (例: はじめまして。ミャンマーから来ました。)"
                    className="flex-1 resize-none bg-card border border-border rounded-2xl px-4 py-3 text-[14px] font-jp focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  {mic.supported && (
                    <button
                      onClick={mic.listening ? mic.stop : mic.start}
                      disabled={busy}
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
                        mic.listening
                          ? 'bg-danger text-white border-danger animate-pulse'
                          : 'bg-card border-border text-muted-foreground hover:text-primary'
                      }`}
                      aria-label="ဂျပန်လို ပြောမယ်"
                    >
                      <Icon name="MicrophoneIcon" size={20} />
                    </button>
                  )}
                  <button
                    onClick={answer}
                    disabled={busy || !input.trim()}
                    className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center disabled:opacity-40"
                    aria-label="ဖြေမယ်"
                  >
                    <Icon name="PaperAirplaneIcon" size={19} />
                  </button>
                </div>
                {mic.error && <p className="text-[12px] text-danger">{mic.error}</p>}
                {!mic.supported && (
                  <p className="text-[12px] text-muted-foreground">
                    ဒီ browser မှာ အသံနဲ့ ဖြေလို့ မရပါ။ Chrome ကို သုံးပါ၊ ဒါမှမဟုတ် စာရိုက်ပြီး
                    ဖြေပါ။
                  </p>
                )}
                <button
                  onClick={finish}
                  disabled={answered < 2 || busy || scoring}
                  className="w-full py-3 rounded-xl bg-accent text-white font-bold text-[14px] disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  {scoring ? (
                    <>
                      <Icon name="ArrowPathIcon" size={16} className="animate-spin" />{' '}
                      အမှတ်ပေးနေပါတယ်…
                    </>
                  ) : (
                    `အင်တာဗျူး ပြီးပြီ — အမှတ်ပေးပါ (${answered} ကြိမ် ဖြေပြီး)`
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}

function ScoreCard({ result }: { result: InterviewScore }) {
  const color =
    result.overall >= 75 ? 'text-success' : result.overall >= 55 ? 'text-warning' : 'text-danger';
  return (
    <div className="border-2 border-primary/30 rounded-2xl p-4 bg-secondary/30 space-y-4 animate-slide-up">
      <div className="text-center">
        <p className="text-[12px] text-muted-foreground">အင်တာဗျူး အသင့်ဖြစ်မှု</p>
        <p className={`text-[44px] font-bold tabular-nums ${color}`}>{result.overall}%</p>
        <p className="text-[14px] text-foreground">{result.verdict}</p>
      </div>

      <div className="space-y-2">
        {(Object.keys(SCORE_LABELS) as (keyof InterviewScore['scores'])[]).map((k) => (
          <div key={k}>
            <div className="flex justify-between text-[12.5px] mb-0.5">
              <span>{SCORE_LABELS[k]}</span>
              <span className="font-bold tabular-nums">{result.scores[k]}/10</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full"
                style={{ width: `${result.scores[k] * 10}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {result.strengths.length > 0 && (
        <div>
          <p className="text-[13px] font-semibold text-success mb-1">✅ ကောင်းတဲ့အချက်များ</p>
          <ul className="text-[13px] space-y-1 list-disc pl-5">
            {result.strengths.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      )}
      {result.improvements.length > 0 && (
        <div>
          <p className="text-[13px] font-semibold text-warning mb-1">📈 ပိုကောင်းအောင် လုပ်ရန်</p>
          <ul className="text-[13px] space-y-1 list-disc pl-5">
            {result.improvements.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      )}
      {result.corrections.length > 0 && (
        <div className="space-y-2">
          <p className="text-[13px] font-semibold text-foreground">✏️ ပြင်ဆင်ချက်များ</p>
          {result.corrections.map((c, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-3 text-[13px]">
              <p className="font-jp text-danger line-through">{c.original}</p>
              <p className="font-jp text-success font-semibold">
                {c.better}{' '}
                <button
                  onClick={() => speak(c.better)}
                  className="text-[12px]"
                  aria-label="နားထောင်မယ်"
                >
                  🔊
                </button>
              </p>
              <p className="text-muted-foreground mt-0.5">{c.note}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
