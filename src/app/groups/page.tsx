'use client';
import React, { Suspense, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import AppLayout from '@/components/AppLayout';
import { api } from '@/lib/api';
import LangPicker, { flagOf } from '@/components/LangPicker';
import { LANGUAGES, type LangCode } from '@/data/languages';

interface GroupCard {
  id: string;
  name: string;
  description: string;
  level: string;
  language?: string;
  emoji: string;
  isPublic: boolean;
  memberCount: number;
  maxMembers: number;
}

const levelsFor = (lang: LangCode) => ['mixed', ...LANGUAGES[lang].levels];
const levelLabel = (l: string) => (l === 'mixed' ? 'အဆင့်စုံ' : l);
const EMOJIS = ['📚', '🔥', '🌸', '🗻', '🍙', '🎌', '💪', '⭐'];
const field =
  'w-full px-3 py-2.5 rounded-xl border border-border bg-background text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/30';

function Card({ g, action }: { g: GroupCard; action?: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-4 flex gap-3 items-start hover:border-primary/40 transition-colors">
      <span className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-2xl flex-shrink-0">
        {g.emoji}
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-[15px] truncate">{g.name}</p>
        <p className="text-[12px] text-muted-foreground">
          {flagOf(g.language)} {levelLabel(g.level)} · 👥 {g.memberCount}/{g.maxMembers}{' '}
          {g.isPublic ? '' : '· 🔒 ဖိတ်မှဝင်'}
        </p>
        {g.description && (
          <p className="text-[12.5px] text-muted-foreground mt-1 line-clamp-2">{g.description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

function CreateForm({ onCreated }: { onCreated: (id: string) => void }) {
  const [f, setF] = useState({
    name: '',
    description: '',
    language: 'ja' as LangCode,
    level: 'mixed',
    emoji: '📚',
    isPublic: true,
  });
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await api<{ id: string }>('/api/groups', { method: 'POST', json: f });
      toast.success('အုပ်စု ဖန်တီးပြီးပါပြီ! သူငယ်ချင်းတွေကို ဖိတ်လိုက်ပါ');
      onCreated(r.id);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit} className="bg-card border border-border rounded-2xl p-5 space-y-3">
      <p className="font-bold text-[15px]">✨ အုပ်စု အသစ် ဖန်တီးမယ်</p>
      <div className="flex gap-1.5 flex-wrap">
        {EMOJIS.map((e) => (
          <button
            key={e}
            type="button"
            onClick={() => setF({ ...f, emoji: e })}
            className={`w-10 h-10 rounded-xl text-xl ${f.emoji === e ? 'bg-primary/15 ring-2 ring-primary' : 'bg-muted'}`}
          >
            {e}
          </button>
        ))}
      </div>
      <input
        className={field}
        value={f.name}
        onChange={(e) => setF({ ...f, name: e.target.value })}
        maxLength={60}
        placeholder="အုပ်စု အမည် — ဥပမာ: N4 ဒီဇင်ဘာ ဖြေမယ့်သူများ"
        required
      />
      <input
        className={field}
        value={f.description}
        onChange={(e) => setF({ ...f, description: e.target.value })}
        maxLength={300}
        placeholder="ရည်မှန်းချက် (ရွေးချယ်နိုင်) — ဥပမာ: နေ့တိုင်း ကတ် ၂၀ လုပ်မယ်"
      />
      <LangPicker
        value={f.language}
        onChange={(v) => v !== 'all' && setF({ ...f, language: v, level: 'mixed' })}
        size="sm"
      />
      <div className="flex flex-wrap gap-2">
        {levelsFor(f.language).map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => setF({ ...f, level: l })}
            className={`px-3 py-1.5 rounded-full border text-[12.5px] ${
              f.level === l ? 'bg-primary text-white border-primary' : 'border-border'
            }`}
          >
            {levelLabel(l)}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {(
          [
            [true, '🌏 Public', 'ဘယ်သူမဆို ရှာပြီး ဝင်လို့ရမယ်'],
            [false, '🔒 Private', 'ဖိတ်ခေါ်တဲ့ code နဲ့ပဲ ဝင်လို့ရမယ်'],
          ] as const
        ).map(([v, label, desc]) => (
          <button
            key={String(v)}
            type="button"
            onClick={() => setF({ ...f, isPublic: v })}
            className={`text-left p-3 rounded-xl border-2 ${f.isPublic === v ? 'border-primary bg-secondary' : 'border-border'}`}
          >
            <p className="font-bold text-[13.5px]">{label}</p>
            <p className="text-[11.5px] text-muted-foreground">{desc}</p>
          </button>
        ))}
      </div>
      <button
        type="submit"
        disabled={busy}
        className="w-full py-2.5 rounded-xl bg-primary text-white font-bold text-[14px] disabled:opacity-40"
      >
        {busy ? 'ဖန်တီးနေပါတယ်…' : 'ဖန်တီးမယ်'}
      </button>
    </form>
  );
}

function Groups() {
  const router = useRouter();
  const params = useSearchParams();
  const [data, setData] = useState<{ mine: GroupCard[]; discover: GroupCard[] } | null>(null);
  const [lang, setLang] = useState<LangCode | 'all'>('all');
  const [code, setCode] = useState(params.get('join') ?? '');
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    api<{ mine: GroupCard[]; discover: GroupCard[] }>(
      `/api/groups${lang === 'all' ? '' : `?lang=${lang}`}`
    )
      .then(setData)
      .catch((e) => toast.error(e.message));
  }, [lang]);
  useEffect(load, [load]);

  const join = useCallback(
    async (body: { code: string } | { groupId: string }) => {
      setBusy(true);
      try {
        const r = await api<{ id: string; already?: boolean }>('/api/groups/join', {
          method: 'POST',
          json: body,
        });
        if (!r.already) toast.success('အုပ်စုထဲ ဝင်ပြီးပါပြီ 🎉');
        router.push(`/groups/${r.id}`);
      } catch (e) {
        toast.error((e as Error).message);
      } finally {
        setBusy(false);
      }
    },
    [router]
  );

  // Invite links: /groups?join=CODE
  useEffect(() => {
    const c = params.get('join');
    if (c) join({ code: c });
    // run once on load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">👥 စာလုပ်ဖော် အုပ်စုများ</h1>
          <p className="text-sm text-muted-foreground mt-1">
            သူငယ်ချင်းတွေနဲ့ အတူ စာလုပ်ပါ — အုပ်စု streak 🔥၊ အပတ်စဉ် ပြိုင်ပွဲ၊ chat နဲ့
            နှိုးဆော်ချက်
          </p>
        </div>
        <button
          onClick={() => setCreating(!creating)}
          className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold"
        >
          {creating ? 'ပိတ်မယ်' : '+ အုပ်စု ဖန်တီးမယ်'}
        </button>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-5">
        <div className="space-y-6">
          {creating && <CreateForm onCreated={(id) => router.push(`/groups/${id}`)} />}

          <section>
            <h2 className="font-bold text-[15px] mb-2">ကျွန်ုပ်၏ အုပ်စုများ</h2>
            {!data ? (
              <div className="h-24 rounded-2xl bg-muted animate-pulse" />
            ) : data.mine.length === 0 ? (
              <div className="bg-card border border-dashed border-border rounded-2xl p-6 text-center text-[13.5px] text-muted-foreground">
                အုပ်စု မဝင်ရသေးပါ။ အောက်က အုပ်စုတစ်ခုခုကို ဝင်ပါ ဒါမှမဟုတ် ကိုယ်တိုင် ဖန်တီးပါ 💪
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {data.mine.map((g) => (
                  <Link key={g.id} href={`/groups/${g.id}`}>
                    <Card
                      g={g}
                      action={
                        <span className="text-primary text-[13px] font-semibold">ဝင်မယ် →</span>
                      }
                    />
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <h2 className="font-bold text-[15px]">🌏 Public အုပ်စုများ</h2>
              <LangPicker value={lang} onChange={setLang} allowAll size="sm" />
            </div>
            {!data ? (
              <div className="h-24 rounded-2xl bg-muted animate-pulse" />
            ) : data.discover.length === 0 ? (
              <p className="text-[13px] text-muted-foreground">
                ဝင်လို့ရတဲ့ အုပ်စု မရှိသေးပါ — ပထမဆုံး အုပ်စု ဖန်တီးလိုက်ပါ!
              </p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {data.discover.map((g) => (
                  <Card
                    key={g.id}
                    g={g}
                    action={
                      <button
                        disabled={busy}
                        onClick={() => join({ groupId: g.id })}
                        className="px-3 py-1.5 rounded-full bg-primary text-white text-[12.5px] font-semibold disabled:opacity-50"
                      >
                        + ဝင်မယ်
                      </button>
                    }
                  />
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (code.trim()) join({ code: code.trim() });
            }}
            className="bg-card border border-border rounded-2xl p-4 space-y-2"
          >
            <p className="font-bold text-[14px]">🔑 ဖိတ်ခေါ်တဲ့ code နဲ့ ဝင်မယ်</p>
            <input
              className={`${field} uppercase tracking-widest text-center font-bold`}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={12}
              placeholder="ABC1234"
            />
            <button
              type="submit"
              disabled={busy || !code.trim()}
              className="w-full py-2 rounded-xl bg-primary text-white font-semibold text-[13.5px] disabled:opacity-40"
            >
              ဝင်မယ်
            </button>
          </form>
          <div className="bg-secondary/50 border border-border rounded-2xl p-4 text-[12.5px] space-y-1.5">
            <p className="font-bold text-[13.5px]">💡 ဘယ်လို အလုပ်လုပ်လဲ</p>
            <p>🔥 အဖွဲ့ဝင် တစ်ဝက်ကျော် စာလုပ်တဲ့နေ့တိုင်း အုပ်စု streak တက်မယ်</p>
            <p>🏆 Flashcard တစ်ကတ် = ၁ မှတ်၊ Mock test = ၁၀ မှတ်</p>
            <p>👋 မလုပ်ရသေးတဲ့ သူငယ်ချင်းကို နှိုးဆော်လို့ရမယ် (Telegram ကို ရောက်မယ်)</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function GroupsPage() {
  return (
    <AppLayout activePath="/groups">
      <Suspense fallback={<div className="h-64 rounded-2xl bg-muted animate-pulse" />}>
        <Groups />
      </Suspense>
    </AppLayout>
  );
}
