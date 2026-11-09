'use client';
import React, { use, useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import AppLayout from '@/components/AppLayout';
import { api } from '@/lib/api';

interface Member {
  id: string;
  name: string;
  role: 'owner' | 'member';
  isTeacher: boolean;
  level: string | null;
  streak: number;
  studiedToday: boolean;
  weekPoints: number;
  weekDays: number;
}

interface Detail {
  member: true;
  isOwner: boolean;
  me: string;
  group: {
    id: string;
    name: string;
    description: string;
    level: string;
    emoji: string;
    isPublic: boolean;
    inviteCode: string;
    memberCount: number;
    maxMembers: number;
  };
  progress: {
    streak: number;
    need: number;
    activeToday: number;
    last7: { day: string; active: number }[];
  };
  members: Member[];
}

interface Preview {
  member: false;
  group: {
    id: string;
    name: string;
    description: string;
    level: string;
    emoji: string;
    memberCount: number;
    maxMembers: number;
  };
}

interface Msg {
  id: string;
  text: string;
  kind: 'text' | 'system';
  createdAt: string;
  user: { id: string; name: string; isTeacher: boolean } | null;
  mine: boolean;
}

// Short Burmese weekday names (Sunday first)
const DAYS_MY = ['နွေ', 'လာ', 'ဂါ', 'ဟူး', 'တေး', 'ကြာ', 'နေ'];
const MEDALS = ['🥇', '🥈', '🥉'];
const time = (iso: string) =>
  new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

function Chat({ groupId }: { groupId: string }) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const last = useRef<string | null>(null);

  const poll = useCallback(async () => {
    try {
      const q = last.current ? `?after=${encodeURIComponent(last.current)}` : '';
      const r = await api<{ messages: Msg[] }>(`/api/groups/${groupId}/messages${q}`);
      if (r.messages.length) {
        last.current = r.messages[r.messages.length - 1].createdAt;
        setMsgs((m) => {
          const seen = new Set(m.map((x) => x.id));
          return [...m, ...r.messages.filter((x) => !seen.has(x.id))];
        });
      }
    } catch {
      // offline — try again next tick
    }
  }, [groupId]);

  // Poll every 5 s while the tab is visible
  useEffect(() => {
    poll();
    const t = setInterval(() => {
      if (document.visibilityState === 'visible') poll();
    }, 5000);
    return () => clearInterval(t);
  }, [poll]);

  useEffect(() => {
    box.current?.scrollTo({ top: box.current.scrollHeight });
  }, [msgs.length]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    try {
      const r = await api<{ message: Msg }>(`/api/groups/${groupId}/messages`, {
        method: 'POST',
        json: { text },
      });
      setText('');
      last.current = r.message.createdAt;
      setMsgs((m) => [...m, r.message]);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="bg-card border border-border rounded-2xl flex flex-col h-[520px]">
      <p className="px-4 py-3 border-b border-border font-bold text-[14px]">💬 အုပ်စု chat</p>
      <div ref={box} className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
        {msgs.length === 0 && (
          <p className="text-center text-[12.5px] text-muted-foreground py-8">
            စကားစပြောလိုက်ပါ — &quot;ဒီနေ့ ဘာလေ့လာကြမလဲ?&quot; 👋
          </p>
        )}
        {msgs.map((m) =>
          m.kind === 'system' ? (
            <p key={m.id} className="text-center text-[11.5px] text-muted-foreground px-4">
              {m.text}
            </p>
          ) : (
            <div key={m.id} className={`flex ${m.mine ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-3 py-2 ${
                  m.mine ? 'bg-primary text-white rounded-br-sm' : 'bg-muted rounded-bl-sm'
                }`}
              >
                {!m.mine && (
                  <p className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                    {m.user?.name}
                    {m.user?.isTeacher && (
                      <span className="text-[9.5px] px-1 rounded bg-primary text-white">ဆရာ</span>
                    )}
                  </p>
                )}
                <p className="text-[13.5px] whitespace-pre-wrap break-words">{m.text}</p>
                <p
                  className={`text-[10px] text-right ${m.mine ? 'text-white/70' : 'text-muted-foreground'}`}
                >
                  {time(m.createdAt)}
                </p>
              </div>
            </div>
          )
        )}
      </div>
      <form onSubmit={send} className="p-2.5 border-t border-border flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={1000}
          placeholder="စာ ရေးပါ…"
          className="flex-1 h-10 px-4 rounded-full border border-border bg-background text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          className="px-4 h-10 rounded-full bg-primary text-white text-[13px] font-semibold disabled:opacity-40"
        >
          ပို့
        </button>
      </form>
    </div>
  );
}

export default function GroupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [d, setD] = useState<Detail | Preview | null>(null);
  const [error, setError] = useState('');
  const [nudged, setNudged] = useState<Set<string>>(new Set());

  const load = useCallback(() => {
    api<Detail | Preview>(`/api/groups/${id}`)
      .then(setD)
      .catch((e) => setError(e.message));
  }, [id]);
  useEffect(load, [load]);

  async function nudge(m: Member) {
    try {
      const r = await api<{ telegram: boolean }>(`/api/groups/${id}/nudge`, {
        method: 'POST',
        json: { userId: m.id },
      });
      setNudged(new Set(nudged).add(m.id));
      toast.success(
        r.telegram
          ? `${m.name} ရဲ့ Telegram ကို ပို့ပြီးပါပြီ 👋`
          : `${m.name} ကို နှိုးဆော်ပြီးပါပြီ 👋`
      );
    } catch (e) {
      toast.error((e as Error).message);
      setNudged(new Set(nudged).add(m.id));
    }
  }

  async function leave() {
    if (!window.confirm('ဒီအုပ်စုက ထွက်မလား?')) return;
    try {
      await api(`/api/groups/${id}`, { method: 'DELETE' });
      router.push('/groups');
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  async function removeMember(m: Member) {
    if (!window.confirm(`${m.name} ကို အုပ်စုက ဖယ်မလား?`)) return;
    try {
      await api(`/api/groups/${id}?user=${m.id}`, { method: 'DELETE' });
      load();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  async function joinPublic() {
    try {
      await api('/api/groups/join', { method: 'POST', json: { groupId: id } });
      toast.success('အုပ်စုထဲ ဝင်ပြီးပါပြီ 🎉');
      load();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  if (error) {
    return (
      <AppLayout activePath="/groups">
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-3">{error}</p>
          <Link href="/groups" className="text-primary font-semibold">
            ← အုပ်စုများ
          </Link>
        </div>
      </AppLayout>
    );
  }

  if (d && !d.member) {
    return (
      <AppLayout activePath="/groups">
        <div className="max-w-md mx-auto bg-card border border-border rounded-2xl p-6 text-center">
          <p className="text-5xl">{d.group.emoji}</p>
          <h1 className="text-xl font-bold mt-2">{d.group.name}</h1>
          <p className="text-[13px] text-muted-foreground mt-1">{d.group.description}</p>
          <p className="text-[13px] mt-2">
            👥 {d.group.memberCount}/{d.group.maxMembers}
          </p>
          <button
            onClick={joinPublic}
            className="mt-4 px-5 py-2.5 rounded-xl bg-primary text-white font-bold"
          >
            + အုပ်စုထဲ ဝင်မယ်
          </button>
        </div>
      </AppLayout>
    );
  }

  const inviteLink =
    d && typeof window !== 'undefined'
      ? `${window.location.origin}/groups?join=${d.group.inviteCode}`
      : '';
  const pct = d ? Math.round((d.progress.activeToday / Math.max(d.members.length, 1)) * 100) : 0;
  const goalMet = d ? d.progress.activeToday >= d.progress.need : false;
  const meStudied = d ? d.members.find((m) => m.id === d.me)?.studiedToday : false;

  return (
    <AppLayout activePath="/groups">
      {!d ? (
        <div className="max-w-6xl mx-auto h-72 rounded-2xl bg-muted animate-pulse" />
      ) : (
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="bg-gradient-to-r from-[#006633] to-emerald-500 rounded-2xl p-5 text-white">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-3xl">
                  {d.group.emoji}
                </span>
                <div>
                  <h1 className="text-[20px] font-bold">{d.group.name}</h1>
                  <p className="text-[12.5px] text-white/85">
                    {d.group.level === 'mixed' ? 'အဆင့်စုံ' : d.group.level} · 👥{' '}
                    {d.group.memberCount}/{d.group.maxMembers} ·{' '}
                    {d.group.isPublic ? '🌏 Public' : '🔒 Private'}
                  </p>
                  {d.group.description && <p className="text-[13px] mt-1">{d.group.description}</p>}
                </div>
              </div>
              <div className="text-center bg-white/15 rounded-2xl px-4 py-2">
                <p className="text-[28px] font-bold leading-none">🔥 {d.progress.streak}</p>
                <p className="text-[11px] text-white/85 mt-1">အုပ်စု streak (ရက်)</p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-[1fr_380px] gap-4">
            <div className="space-y-4">
              {/* Today */}
              <div className="bg-card border border-border rounded-2xl p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <p className="font-bold text-[14px]">
                    ဒီနေ့ — {d.progress.activeToday}/{d.members.length} ယောက် စာလုပ်ပြီး
                  </p>
                  <span
                    className={`text-[12px] font-semibold ${goalMet ? 'text-success' : 'text-warning'}`}
                  >
                    {goalMet
                      ? '✅ ဒီနေ့ streak ဆက်ပြီ!'
                      : `နောက် ${d.progress.need - d.progress.activeToday} ယောက် လိုသေးတယ်`}
                  </span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                {!meStudied && (
                  <Link
                    href="/flashcards"
                    className="mt-3 inline-block px-4 py-2 rounded-xl bg-primary text-white text-[13px] font-semibold"
                  >
                    🗂 ကျွန်ုပ် ဒီနေ့ စာလုပ်မယ် →
                  </Link>
                )}
                <div className="flex items-end gap-1.5 mt-4 h-16">
                  {d.progress.last7.map((x) => {
                    const h = Math.round((x.active / Math.max(d.members.length, 1)) * 100);
                    return (
                      <div
                        key={x.day}
                        className="flex-1 flex flex-col items-center justify-end h-full"
                        title={`${x.day}: ${x.active}`}
                      >
                        <div
                          className={`w-full rounded-t ${x.active >= d.progress.need ? 'bg-primary' : 'bg-primary/30'}`}
                          style={{ height: `${Math.max(h, 6)}%` }}
                        />
                        <span className="text-[9.5px] text-muted-foreground mt-1">
                          {DAYS_MY[new Date(`${x.day}T00:00:00Z`).getUTCDay()]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Leaderboard + members */}
              <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <p className="px-4 py-3 border-b border-border font-bold text-[14px]">
                  🏆 ဒီအပတ် ပြိုင်ပွဲ (၇ ရက်)
                </p>
                <div className="divide-y divide-border">
                  {d.members.map((m, i) => (
                    <div key={m.id} className="px-4 py-2.5 flex items-center gap-3">
                      <span className="w-6 text-center text-[15px]">
                        {m.weekPoints > 0 && i < 3 ? (
                          MEDALS[i]
                        ) : (
                          <span className="text-[12px] text-muted-foreground">{i + 1}</span>
                        )}
                      </span>
                      <span className="relative w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold text-[13px] flex-shrink-0">
                        {Array.from(m.name)[0]}
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-card ${
                            m.studiedToday ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                        />
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13.5px] font-semibold truncate flex items-center gap-1">
                          {m.name}
                          {m.id === d.me && (
                            <span className="text-[11px] text-muted-foreground">(ကျွန်ုပ်)</span>
                          )}
                          {m.role === 'owner' && <span title="ပိုင်ရှင်">👑</span>}
                          {m.isTeacher && (
                            <span className="text-[10px] px-1 rounded bg-primary text-white">
                              ဆရာ
                            </span>
                          )}
                        </p>
                        <p className="text-[11.5px] text-muted-foreground">
                          {m.studiedToday ? '✅ ဒီနေ့ လုပ်ပြီး' : '⏳ မလုပ်ရသေး'} · 🔥{m.streak} ·{' '}
                          {m.weekDays}/7 ရက်
                        </p>
                      </div>
                      <span className="text-[13px] font-bold tabular-nums">
                        {m.weekPoints} မှတ်
                      </span>
                      {m.id !== d.me && !m.studiedToday && (
                        <button
                          onClick={() => nudge(m)}
                          disabled={nudged.has(m.id)}
                          className="text-[12px] px-2.5 py-1 rounded-full border border-border hover:bg-muted disabled:opacity-40"
                          title="စာလုပ်ဖို့ နှိုးဆော်မယ်"
                        >
                          👋
                        </button>
                      )}
                      {d.isOwner && m.id !== d.me && (
                        <button
                          onClick={() => removeMember(m)}
                          className="text-[12px] text-muted-foreground hover:text-danger"
                          title="ဖယ်မယ်"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Chat groupId={id} />
              <div className="bg-card border border-border rounded-2xl p-4 space-y-2">
                <p className="font-bold text-[14px]">📨 သူငယ်ချင်း ဖိတ်မယ်</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-center text-[18px] font-bold tracking-widest bg-muted rounded-lg py-1.5">
                    {d.group.inviteCode}
                  </code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(inviteLink);
                      toast.success(
                        'ဖိတ်ခေါ်တဲ့ link ကူးပြီးပါပြီ — Messenger / Telegram မှာ ပို့လိုက်ပါ'
                      );
                    }}
                    className="px-3 py-2 rounded-lg bg-primary text-white text-[12.5px] font-semibold"
                  >
                    Link ကူးမယ်
                  </button>
                </div>
                <a
                  href={`https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${encodeURIComponent(`"${d.group.name}" ဂျပန်စာ လေ့လာရေး အုပ်စုထဲ အတူ ဝင်ပါ! 🇯🇵`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center text-[12.5px] py-2 rounded-lg border border-border hover:bg-muted"
                >
                  ✈️ Telegram နဲ့ share မယ်
                </a>
                <button
                  onClick={leave}
                  className="w-full text-[12.5px] text-muted-foreground hover:text-danger pt-1"
                >
                  အုပ်စုက ထွက်မယ်
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
