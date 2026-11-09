'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import AppLayout from '@/components/AppLayout';
import Icon from '@/components/ui/AppIcon';
import TelegramCard from '@/components/TelegramCard';
import { initial, logout, useCurrentUser } from '@/components/useCurrentUser';
import { api } from '@/lib/api';
import { formatMyDate } from '@/lib/jlpt';
import { PLANS, formatKs, type PlanId } from '@/data/payment';

interface Payment {
  id: string;
  plan: PlanId;
  amount: number;
  method: string;
  status: 'pending' | 'approved' | 'rejected';
  note: string;
  createdAt: string;
}

interface Stats {
  streak: { current: number; longest: number };
  cardsReviewed: number;
  cardsKnown: number;
  exams: number;
  bestExamPct: number;
  activeDays: number;
  lessonsWatched: number;
  week: { day: string; points: number }[];
}

const DAYS_MY = ['နွေ', 'လာ', 'ဂါ', 'ဟူး', 'တေး', 'ကြာ', 'နေ'];
const STATUS: Record<Payment['status'], { text: string; cls: string }> = {
  approved: { text: 'အတည်ပြုပြီး', cls: 'bg-success-bg text-success' },
  pending: { text: 'စစ်ဆေးဆဲ', cls: 'bg-warning-bg text-warning' },
  rejected: { text: 'ငြင်းပယ်', cls: 'bg-danger-bg text-danger' },
};
const card = 'bg-card border border-border rounded-2xl shadow-card p-6';

function AccountInfo() {
  const { user } = useCurrentUser();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [level, setLevel] = useState('N5');
  const [shown, setShown] = useState({ name: '', level: 'N5' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    setName(user.name);
    setLevel(user.targetLevel ?? 'N5');
    setShown({ name: user.name, level: user.targetLevel ?? 'N5' });
  }, [user]);

  async function save() {
    setSaving(true);
    try {
      await api('/api/auth/me', { method: 'PATCH', json: { name } });
      if (['N5', 'N4', 'N3'].includes(level)) {
        await api('/api/plan', { method: 'PATCH', json: { level } });
      }
      setShown({ name, level });
      setEditing(false);
      toast.success('သိမ်းပြီးပါပြီ');
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  const premium =
    !!user?.plan.expiresAt &&
    user.plan.type !== 'free' &&
    new Date(user.plan.expiresAt) > new Date();

  return (
    <div className={card}>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-[15px] font-bold">အကောင့် အချက်အလက်</h2>
        <button
          onClick={() => setEditing(!editing)}
          className="flex items-center gap-1.5 text-[12.5px] font-semibold text-primary"
        >
          <Icon name={editing ? 'XMarkIcon' : 'PencilSquareIcon'} size={14} />
          {editing ? 'မလုပ်တော့' : 'ပြင်မယ်'}
        </button>
      </div>
      <div className="flex flex-wrap items-start gap-4 mb-5">
        <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-white text-[22px] font-bold">
          {initial(shown.name)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[18px] font-bold leading-tight">{shown.name}</p>
          <p className="text-[13px] text-muted-foreground mt-0.5">{user?.email}</p>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="text-[11px] bg-secondary text-primary font-semibold px-2.5 py-0.5 rounded-full">
              JLPT {shown.level}
            </span>
            {user?.role === 'teacher' && (
              <span className="text-[11px] bg-secondary text-primary font-semibold px-2.5 py-0.5 rounded-full">
                👩‍🏫 ဆရာ
              </span>
            )}
            {user?.role === 'admin' && (
              <span className="text-[11px] bg-warning-bg text-warning font-semibold px-2.5 py-0.5 rounded-full">
                Admin
              </span>
            )}
            {premium && (
              <span className="text-[11px] bg-yellow-100 text-yellow-800 font-semibold px-2.5 py-0.5 rounded-full">
                ⭐ Premium Supporter
              </span>
            )}
          </div>
        </div>
      </div>
      {editing ? (
        <div className="space-y-3">
          <label className="block text-[12px] font-semibold text-muted-foreground">
            အမည်
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={80}
              className="mt-1 w-full bg-background border border-border rounded-xl px-4 py-2.5 text-[14px] text-foreground"
            />
          </label>
          <label className="block text-[12px] font-semibold text-muted-foreground">
            ဖြေမယ့် JLPT အဆင့်
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="mt-1 w-full bg-background border border-border rounded-xl px-4 py-2.5 text-[14px] text-foreground"
            >
              {['N5', 'N4', 'N3'].map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </label>
          <button
            onClick={save}
            disabled={saving || !name.trim()}
            className="px-5 py-2 bg-primary text-white text-[13px] font-bold rounded-xl disabled:opacity-40"
          >
            {saving ? 'သိမ်းနေပါတယ်…' : 'သိမ်းမယ်'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {[
            ['အသင်းဝင်သည့်နေ့', user?.createdAt ? formatMyDate(new Date(user.createdAt)) : '—'],
            ['ဖြေမယ့် အဆင့်', `JLPT ${shown.level}`],
          ].map(([l, v]) => (
            <div key={l} className="bg-muted/40 rounded-xl px-4 py-3">
              <p className="text-[11px] font-semibold text-muted-foreground mb-0.5">{l}</p>
              <p className="text-[13.5px] font-semibold">{v}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PremiumStatus() {
  const { user } = useCurrentUser();
  if (!user) return <div className="h-32 rounded-2xl bg-muted animate-pulse" />;
  const active =
    !!user.plan.expiresAt &&
    user.plan.type !== 'free' &&
    new Date(user.plan.expiresAt) > new Date();
  return (
    <div className={card}>
      <h2 className="text-[15px] font-bold mb-3">Premium</h2>
      {active ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <p className="font-bold text-[16px]">⭐ Premium Supporter</p>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            {formatMyDate(new Date(user.plan.expiresAt!))} အထိ — ပံ့ပိုးပေးလို့ ကျေးဇူးတင်ပါတယ် 🙏
          </p>
        </div>
      ) : (
        <div className="bg-secondary/50 border border-primary/20 rounded-xl p-4">
          <p className="font-bold text-[15px]">🆓 အခမဲ့ အသုံးပြုနေပါတယ်</p>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            အဓိက feature အားလုံး အခမဲ့ပါ။ Premium ကို ပိုက်ဆံနဲ့ ဒါမှမဟုတ် ကြိုးစားမှုနဲ့
            ရယူနိုင်ပါတယ်။
          </p>
        </div>
      )}
      <div className="flex flex-wrap gap-2 mt-4">
        <Link
          href="/rewards"
          className="px-4 py-2 rounded-xl bg-primary text-white text-[13px] font-semibold"
        >
          💪 Premium အခမဲ့ ရယူမယ်
        </Link>
        <Link
          href="/billing"
          className="px-4 py-2 rounded-xl border border-border text-[13px] font-semibold"
        >
          ⭐ Premium နဲ့ ပံ့ပိုးမယ်
        </Link>
      </div>
    </div>
  );
}

function BillingHistory() {
  const [rows, setRows] = useState<Payment[] | null>(null);
  useEffect(() => {
    api<{ payments: Payment[] }>('/api/payments')
      .then((r) => setRows(r.payments))
      .catch(() => setRows([]));
  }, []);
  return (
    <div className={card}>
      <h2 className="text-[15px] font-bold mb-4">ငွေပေးချေမှု မှတ်တမ်း</h2>
      {rows === null ? (
        <div className="h-16 rounded-xl bg-muted animate-pulse" />
      ) : rows.length === 0 ? (
        <p className="text-[13px] text-muted-foreground">ငွေပေးချေမှု မရှိသေးပါ</p>
      ) : (
        <div className="divide-y divide-border rounded-xl border border-border">
          {rows.map((r) => (
            <div
              key={r.id}
              className="px-4 py-3 flex items-center justify-between gap-3 text-[13px]"
            >
              <div>
                <p className="font-medium">
                  {PLANS[r.plan]?.name ?? r.plan} · {r.method}
                </p>
                <p className="text-[12px] text-muted-foreground">
                  {formatMyDate(new Date(r.createdAt))}
                  {r.note && ` · ${r.note}`}
                </p>
              </div>
              <span className="font-bold tabular-nums">{formatKs(r.amount)}</span>
              <span
                className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${STATUS[r.status].cls}`}
              >
                {STATUS[r.status].text}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StudyStats() {
  const [s, setS] = useState<Stats | null>(null);
  useEffect(() => {
    api<Stats>('/api/me/stats')
      .then(setS)
      .catch(() => setS(null));
  }, []);
  if (!s) return <div className="h-64 rounded-2xl bg-muted animate-pulse" />;
  const items: [string, string | number, string, string][] = [
    ['🔥', s.streak.current, 'ဆက်တိုက် ရက်', `အရှည်ဆုံး ${s.streak.longest} ရက်`],
    ['📅', s.activeDays, 'စုစုပေါင်း လေ့လာခဲ့တဲ့ ရက်', ''],
    ['🗂', s.cardsReviewed.toLocaleString(), 'ပြန်လှန်ခဲ့တဲ့ ကတ်', `မှတ်မိပြီး ${s.cardsKnown}`],
    ['📝', s.exams, 'Mock Test', s.exams ? `အကောင်းဆုံး ${s.bestExamPct}%` : ''],
    ['🎬', s.lessonsWatched, 'ကြည့်ခဲ့တဲ့ သင်ခန်းစာ', ''],
  ];
  const max = Math.max(1, ...s.week.map((w) => w.points));
  return (
    <div className={card}>
      <h2 className="text-[15px] font-bold mb-4">လေ့လာမှု စာရင်းအင်း</h2>
      <div className="grid grid-cols-2 gap-2.5 mb-5">
        {items.map(([icon, v, label, sub]) => (
          <div key={label} className="bg-muted/30 rounded-xl p-3">
            <p className="text-[11px] font-semibold text-muted-foreground">
              {icon} {label}
            </p>
            <p className="text-[20px] font-bold tabular-nums leading-tight mt-0.5">{v}</p>
            {sub && <p className="text-[10.5px] text-muted-foreground">{sub}</p>}
          </div>
        ))}
      </div>
      <p className="text-[12px] font-semibold text-muted-foreground mb-2">ဒီအပတ် လေ့လာမှု အမှတ်</p>
      <div className="flex items-end gap-2 h-20">
        {s.week.map((w) => (
          <div key={w.day} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-[10px] text-muted-foreground tabular-nums">{w.points || ''}</span>
            <div className="w-full rounded-t-md bg-primary/15 relative" style={{ height: 48 }}>
              <div
                className="absolute bottom-0 inset-x-0 bg-primary rounded-t-md"
                style={{ height: `${(w.points / max) * 100}%` }}
              />
            </div>
            <span className="text-[10px] text-muted-foreground">
              {DAYS_MY[new Date(`${w.day}T00:00:00Z`).getUTCDay()]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <AppLayout activePath="/profile">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[22px] md:text-[24px] font-bold">ကိုယ်ရေးအချက်အလက်</h1>
          <p className="text-[14px] text-muted-foreground">
            အကောင့်၊ Premium နဲ့ လေ့လာမှု မှတ်တမ်း
          </p>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-1.5 px-4 py-2 border border-border rounded-xl text-[13px] font-semibold text-muted-foreground hover:text-danger hover:border-danger"
        >
          <Icon name="ArrowRightOnRectangleIcon" size={15} />
          အကောင့်မှ ထွက်ရန်
        </button>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <AccountInfo />
          <PremiumStatus />
          <BillingHistory />
        </div>
        <div className="space-y-6">
          <StudyStats />
          <TelegramCard />
        </div>
      </div>
    </AppLayout>
  );
}
