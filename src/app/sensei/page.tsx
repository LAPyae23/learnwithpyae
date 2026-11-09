'use client';
import React, { useEffect, useRef, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Icon from '@/components/ui/AppIcon';
import RichText from '@/components/RichText';
import AiQuotaBadge from '@/components/AiQuotaBadge';
import { streamText } from '@/lib/streamText';
import { useSpeechRecognition } from '@/lib/speech';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  error?: boolean;
}

const STORAGE_KEY = 'na_sensei_chat_v1';

const SUGGESTIONS = [
  'は နဲ့ が ဘာကွာလဲ?',
  'て ပုံစံ ပြောင်းနည်းကို လွယ်လွယ်ကူကူ ရှင်းပြပါ',
  '「すみません」ကို ဘယ်အချိန်တွေမှာ သုံးလဲ?',
  'N5 စာမေးပွဲအတွက် တစ်လ ဘယ်လို လေ့လာရမလဲ?',
  '「食べてもいいですか」 ဆိုတာ ဘာအဓိပ္ပာယ်လဲ?',
  'ဂျပန်မှာ အလုပ်အင်တာဗျူးမှာ ကိုယ့်ကိုယ်ကို ဘယ်လို မိတ်ဆက်ရမလဲ?',
];

export default function SenseiPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [quotaKey, setQuotaKey] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Keep the conversation across page reloads on this device
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setMessages(JSON.parse(saved));
    } catch {
      /* ignore corrupt storage */
    }
  }, []);
  useEffect(() => {
    if (!busy) localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-30)));
  }, [messages, busy]);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  const mic = useSpeechRecognition('my-MM', (t) => setInput((prev) => (prev ? `${prev} ${t}` : t)));

  async function send(text: string) {
    const question = text.trim();
    if (!question || busy) return;
    const history = [
      ...messages.filter((m) => !m.error),
      { role: 'user' as const, content: question },
    ];
    setMessages([...history, { role: 'assistant', content: '' }]);
    setInput('');
    setBusy(true);
    abortRef.current = new AbortController();
    try {
      await streamText(
        '/api/ai/chat',
        { messages: history.map(({ role, content }) => ({ role, content })) },
        (full) =>
          setMessages((prev) => [...prev.slice(0, -1), { role: 'assistant', content: full }]),
        abortRef.current.signal
      );
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setMessages((prev) => [
          ...prev.slice(0, -1),
          { role: 'assistant', content: (err as Error).message, error: true },
        ]);
      }
    } finally {
      setBusy(false);
      setQuotaKey((k) => k + 1);
    }
  }

  function clearChat() {
    abortRef.current?.abort();
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  }

  return (
    <AppLayout activePath="/sensei">
      <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-9rem)] md:h-[calc(100vh-8rem)]">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl gradient-primary flex items-center justify-center text-white text-[20px] font-jp">
              先
            </div>
            <div>
              <h1 className="text-[20px] font-bold text-foreground leading-tight">AI ဆရာ</h1>
              <p className="text-[12.5px] text-muted-foreground">
                ဂျပန်စာ မေးခွန်းမှန်သမျှ မြန်မာလို မေးပါ
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <AiQuotaBadge refreshKey={quotaKey} />
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                className="text-[12px] text-muted-foreground hover:text-danger px-2 py-1 rounded-lg"
              >
                အသစ်စမယ်
              </button>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto bg-card border border-border rounded-2xl p-4 space-y-4">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center gap-4 py-6">
              <p className="text-[14px] text-muted-foreground max-w-sm">
                သဒ္ဒါ၊ ဝေါဟာရ၊ kanji၊ JLPT ပြင်ဆင်နည်း၊ ဂျပန်မှာ နေထိုင်ရေး — ဘာမဆို မေးနိုင်ပါတယ်။
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="text-[13px] bg-secondary text-primary border border-primary/20 rounded-full px-3.5 py-1.5 hover:bg-green-100 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[88%] rounded-2xl px-4 py-3 text-[14px] leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-primary text-white rounded-br-md whitespace-pre-wrap'
                    : m.error
                      ? 'bg-danger-bg text-danger border border-red-200 rounded-bl-md'
                      : 'bg-muted/60 text-foreground rounded-bl-md'
                }`}
              >
                {m.role === 'assistant' && !m.error ? (
                  m.content ? (
                    <RichText text={m.content} />
                  ) : (
                    <span className="inline-flex gap-1 py-1" aria-label="စဉ်းစားနေပါတယ်">
                      <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" />
                      <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:150ms]" />
                      <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:300ms]" />
                    </span>
                  )
                ) : (
                  m.content
                )}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Composer */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="mt-3 flex items-end gap-2"
        >
          <textarea
            value={mic.listening && mic.interim ? `${input} ${mic.interim}` : input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            rows={1}
            maxLength={2000}
            placeholder="မေးခွန်း ရေးပါ..."
            className="flex-1 resize-none max-h-32 bg-card border border-border rounded-2xl px-4 py-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          {mic.supported && (
            <button
              type="button"
              onClick={mic.listening ? mic.stop : mic.start}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-colors ${
                mic.listening
                  ? 'bg-danger text-white border-danger animate-pulse'
                  : 'bg-card border-border text-muted-foreground hover:text-primary'
              }`}
              aria-label="အသံနဲ့ မေးရန်"
            >
              <Icon name="MicrophoneIcon" size={20} />
            </button>
          )}
          <button
            type="submit"
            disabled={busy || !input.trim()}
            className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center disabled:opacity-40"
            aria-label="ပို့ရန်"
          >
            <Icon
              name={busy ? 'ArrowPathIcon' : 'PaperAirplaneIcon'}
              size={19}
              className={busy ? 'animate-spin' : ''}
            />
          </button>
        </form>
        {mic.error && <p className="text-[12px] text-danger mt-1.5">{mic.error}</p>}
        <p className="text-[11px] text-muted-foreground mt-1.5 text-center">
          AI က တစ်ခါတစ်ရံ မှားနိုင်ပါတယ်။ အရေးကြီးတဲ့ အချက်တွေကို ဆရာ သို့မဟုတ် စာအုပ်နဲ့ ပြန်စစ်ပါ။
        </p>
      </div>
    </AppLayout>
  );
}
