'use client';
import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import AppLayout from '@/components/AppLayout';
import { api } from '@/lib/api';
import { useCurrentUser } from '@/components/useCurrentUser';

const CATEGORIES = [
  ['request', '🙋 လိုအပ်ချက်'],
  ['problem', '⚠️ ပြဿနာ'],
  ['payment', '💰 ငွေကြေး'],
  ['idea', '💡 အကြံပြုချက်'],
  ['other', '📝 အခြား'],
] as const;
const CAT_LABEL = Object.fromEntries(CATEGORIES) as Record<string, string>;

const STATUS: Record<string, { text: string; cls: string }> = {
  open: { text: 'ဖြေရန်', cls: 'bg-warning-bg text-warning' },
  answered: { text: 'ဖြေပြီး', cls: 'bg-success-bg text-success' },
  closed: { text: 'ပိတ်ပြီး', cls: 'bg-muted text-muted-foreground' },
};

interface TicketRow {
  id: string;
  subject: string;
  category: string;
  status: string;
  user: { id: string; name: string; email: string } | null;
  unread: boolean;
  lastMessageAt: string;
  preview: string;
  count: number;
}

interface TicketFull {
  id: string;
  subject: string;
  category: string;
  status: string;
  user: { id: string; name: string; email: string } | null;
  messages: { author: string; fromAdmin: boolean; text: string; at: string }[];
}

const field =
  'w-full px-3 py-2.5 rounded-xl border border-border bg-background text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/30';

const fmt = (iso: string) =>
  new Date(iso).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

function Thread({
  id,
  isAdmin,
  onChanged,
}: {
  id: string;
  isAdmin: boolean;
  onChanged: () => void;
}) {
  const [t, setT] = useState<TicketFull | null>(null);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const end = useRef<HTMLDivElement>(null);

  const load = useCallback(() => {
    api<{ ticket: TicketFull }>(`/api/tickets/${id}`)
      .then((r) => {
        setT(r.ticket);
        onChanged();
      })
      .catch((e) => toast.error(e.message));
  }, [id, onChanged]);
  useEffect(load, [load]);
  useEffect(() => end.current?.scrollIntoView({ block: 'end' }), [t?.messages.length]);

  async function post(body: object) {
    setBusy(true);
    try {
      await api(`/api/tickets/${id}`, { method: 'POST', json: body });
      setText('');
      load();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (!t) return <div className="h-80 rounded-2xl bg-muted animate-pulse" />;
  return (
    <div className="bg-card border border-border rounded-2xl flex flex-col max-h-[75vh]">
      <div className="px-5 py-3 border-b border-border flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="font-bold text-[15px] truncate">{t.subject}</p>
          <p className="text-[12px] text-muted-foreground">
            {CAT_LABEL[t.category]}
            {isAdmin && t.user && ` · ${t.user.name} (${t.user.email})`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-[11.5px] font-semibold px-2.5 py-1 rounded-full ${STATUS[t.status].cls}`}
          >
            {STATUS[t.status].text}
          </span>
          <button
            disabled={busy}
            onClick={() => post({ status: t.status === 'closed' ? 'open' : 'closed' })}
            className="text-[12px] px-3 py-1 rounded-lg border border-border"
          >
            {t.status === 'closed' ? 'ပြန်ဖွင့်မယ်' : 'ပိတ်မယ်'}
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {t.messages.map((m, i) => {
          const mine = m.fromAdmin === isAdmin;
          return (
            <div key={i} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                  mine ? 'bg-primary text-white rounded-br-sm' : 'bg-muted rounded-bl-sm'
                }`}
              >
                <p
                  className={`text-[11px] font-semibold mb-0.5 ${mine ? 'text-white/80' : 'text-muted-foreground'}`}
                >
                  {m.fromAdmin ? `🛡 Admin · ${m.author}` : m.author}
                </p>
                <p className="text-[14px] whitespace-pre-wrap break-words">{m.text}</p>
                <p
                  className={`text-[10.5px] mt-1 ${mine ? 'text-white/70' : 'text-muted-foreground'}`}
                >
                  {fmt(m.at)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={end} />
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (text.trim()) post({ text });
        }}
        className="p-3 border-t border-border flex gap-2"
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={3000}
          rows={2}
          placeholder={isAdmin ? 'ဆရာ့ကို ပြန်ဖြေမယ်…' : 'Admin ကို ထပ်ရေးမယ်…'}
          className={`${field} resize-none`}
        />
        <button
          type="submit"
          disabled={busy || !text.trim()}
          className="px-4 rounded-xl bg-primary text-white font-semibold text-[13.5px] disabled:opacity-40"
        >
          ပို့မယ်
        </button>
      </form>
    </div>
  );
}

function NewTicket({ onCreated }: { onCreated: (id: string) => void }) {
  const [f, setF] = useState({ subject: '', category: 'request', text: '' });
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await api<{ id: string }>('/api/tickets', { method: 'POST', json: f });
      toast.success('Admin ဆီ ပို့ပြီးပါပြီ');
      onCreated(r.id);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit} className="bg-card border border-border rounded-2xl p-5 space-y-3">
      <p className="font-bold text-[15px]">✉️ Admin ဆီ စာအသစ် ပို့မယ်</p>
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setF({ ...f, category: id })}
            className={`px-3 py-1.5 rounded-full border text-[12.5px] ${
              f.category === id ? 'bg-primary text-white border-primary' : 'border-border'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <input
        className={field}
        value={f.subject}
        onChange={(e) => setF({ ...f, subject: e.target.value })}
        maxLength={140}
        placeholder="ခေါင်းစဉ် — ဥပမာ: Video ကို ကိုယ်တိုင် upload တင်ချင်ပါတယ်"
        required
      />
      <textarea
        className={`${field} min-h-[120px]`}
        value={f.text}
        onChange={(e) => setF({ ...f, text: e.target.value })}
        maxLength={3000}
        placeholder="အသေးစိတ် ရေးပါ…"
        required
      />
      <button
        type="submit"
        disabled={busy}
        className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-[14px] disabled:opacity-40"
      >
        {busy ? 'ပို့နေပါတယ်…' : 'ပို့မယ်'}
      </button>
    </form>
  );
}

function Messages() {
  const router = useRouter();
  const params = useSearchParams();
  const { user, loading } = useCurrentUser();
  const [list, setList] = useState<TicketRow[] | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [filter, setFilter] = useState<'' | 'open' | 'answered' | 'closed'>('');
  const selected = params.get('id');
  const creating = params.get('new') === '1';

  const load = useCallback(() => {
    api<{ isAdmin: boolean; tickets: TicketRow[] }>(
      `/api/tickets${filter ? `?status=${filter}` : ''}`
    )
      .then((r) => {
        setIsAdmin(r.isAdmin);
        setList(r.tickets);
      })
      .catch(() => setList([]));
  }, [filter]);
  const canUse = user?.role === 'teacher' || user?.role === 'admin';
  useEffect(() => {
    if (canUse) load();
  }, [canUse, load]);

  if (loading) return <div className="h-64 rounded-2xl bg-muted animate-pulse" />;
  if (!canUse) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground mb-3">ဆရာ အကောင့်နဲ့ပဲ admin ဆီ စာပို့လို့ရပါတယ်။</p>
        <Link href="/teach" className="text-primary font-semibold">
          ဆရာ အဖြစ် လျှောက်မယ် →
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-bold">
            {isAdmin ? '📥 ဆရာတွေဆီက စာများ' : '✉️ Admin ဆီ စာပို့ရန်'}
          </h1>
          <p className="text-[13px] text-muted-foreground">
            {isAdmin
              ? 'ဆရာတွေရဲ့ လိုအပ်ချက်၊ ပြဿနာ၊ အကြံပြုချက်တွေကို ဖြေပါ'
              : 'လိုအပ်တာ၊ ပြဿနာ၊ အကြံပြုချက် ရှိရင် ရေးပို့ပါ — admin က ပြန်ဖြေပါမယ်'}
          </p>
        </div>
        {!isAdmin && !creating && (
          <button
            onClick={() => router.push('/messages?new=1')}
            className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold"
          >
            + စာအသစ်
          </button>
        )}
      </div>

      <div className="grid lg:grid-cols-[320px_1fr] gap-4">
        <div className="space-y-2">
          {isAdmin && (
            <div className="flex gap-1.5 flex-wrap">
              {(
                [
                  ['', 'အားလုံး'],
                  ['open', 'ဖြေရန်'],
                  ['answered', 'ဖြေပြီး'],
                  ['closed', 'ပိတ်ပြီး'],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => setFilter(id)}
                  className={`px-3 py-1 rounded-full border text-[12px] ${
                    filter === id
                      ? 'bg-primary text-white border-primary'
                      : 'border-border text-muted-foreground'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
          <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border">
            {list === null ? (
              <div className="h-32 bg-muted animate-pulse" />
            ) : list.length === 0 ? (
              <p className="p-5 text-[13px] text-muted-foreground text-center">စာ မရှိသေးပါ</p>
            ) : (
              list.map((t) => (
                <button
                  key={t.id}
                  onClick={() => router.push(`/messages?id=${t.id}`)}
                  className={`w-full text-left px-4 py-3 hover:bg-muted/50 ${selected === t.id ? 'bg-secondary/50' : ''}`}
                >
                  <div className="flex items-center gap-2">
                    {t.unread && <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
                    <p
                      className={`text-[13.5px] truncate flex-1 ${t.unread ? 'font-bold' : 'font-medium'}`}
                    >
                      {t.subject}
                    </p>
                    <span
                      className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-full ${STATUS[t.status].cls}`}
                    >
                      {STATUS[t.status].text}
                    </span>
                  </div>
                  <p className="text-[12px] text-muted-foreground truncate mt-0.5">
                    {isAdmin && t.user ? `${t.user.name}: ` : ''}
                    {t.preview}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {CAT_LABEL[t.category]} · {fmt(t.lastMessageAt)}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        <div>
          {creating && !isAdmin ? (
            <NewTicket
              onCreated={(id) => {
                load();
                router.replace(`/messages?id=${id}`);
              }}
            />
          ) : selected ? (
            <Thread key={selected} id={selected} isAdmin={isAdmin} onChanged={load} />
          ) : (
            <div className="bg-card border border-dashed border-border rounded-2xl p-10 text-center text-[13.5px] text-muted-foreground">
              {isAdmin
                ? 'ဘယ်ဘက်က စာတစ်စောင်ကို ရွေးပါ'
                : 'စာတစ်စောင် ရွေးပါ ဒါမှမဟုတ် "+ စာအသစ်" ကို နှိပ်ပါ'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <AppLayout activePath="/messages">
      <Suspense fallback={<div className="h-64 rounded-2xl bg-muted animate-pulse" />}>
        <Messages />
      </Suspense>
    </AppLayout>
  );
}
