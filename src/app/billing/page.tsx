'use client';
import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import AppLayout from '@/components/AppLayout';
import Icon from '@/components/ui/AppIcon';
import { api } from '@/lib/api';
import { compressImage } from '@/lib/compressImage';
import { formatMyDate } from '@/lib/jlpt';
import { useCurrentUser } from '@/components/useCurrentUser';
import {
  DEFAULT_SETTINGS,
  PLAN_IDS,
  formatKs,
  type AccountConfig,
  type PaymentMethod,
  type PlanId,
  type SiteSettingsData,
} from '@/data/payment';

interface PaymentRow {
  id: string;
  plan: PlanId;
  amount: number;
  method: string;
  status: 'pending' | 'approved' | 'rejected';
  note: string;
  createdAt: string;
  planExpiresAt: string | null;
  gifted?: boolean;
}

const STATUS: Record<PaymentRow['status'], { text: string; cls: string }> = {
  pending: { text: 'စစ်ဆေးဆဲ', cls: 'bg-warning-bg text-warning' },
  approved: { text: 'အတည်ပြုပြီး', cls: 'bg-success-bg text-success' },
  rejected: { text: 'ငြင်းပယ်', cls: 'bg-danger-bg text-danger' },
};

export default function BillingPage() {
  const { user } = useCurrentUser();
  const [plan, setPlan] = useState<PlanId>('quarterly');
  const [method, setMethod] = useState<PaymentMethod>('KBZPay');
  const [txn, setTxn] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState<PaymentRow[] | null>(null);
  const [settings, setSettings] = useState<SiteSettingsData | null>(null);

  useEffect(() => {
    api<SiteSettingsData>('/api/settings')
      .then((s) => {
        setSettings(s);
        const firstPlan = PLAN_IDS.find((id) => s.plans[id].enabled);
        if (firstPlan && !s.plans.quarterly.enabled) setPlan(firstPlan);
        if (s.accounts[0]) setMethod(s.accounts[0].method);
      })
      .catch(() => setSettings({ ...DEFAULT_SETTINGS, accounts: [] }));
  }, []);
  const PLANS = settings?.plans ?? DEFAULT_SETTINGS.plans;
  const accounts: AccountConfig[] = settings?.accounts ?? [];

  const load = useCallback(() => {
    api<{ payments: PaymentRow[] }>('/api/payments')
      .then((r) => setHistory(r.payments))
      .catch(() => setHistory([]));
  }, []);
  useEffect(load, [load]);
  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview]
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return toast.error('Screenshot ရွေးပါ');
    setSending(true);
    try {
      const blob = await compressImage(file);
      const form = new FormData();
      form.set('plan', plan);
      form.set('method', method);
      form.set('transactionId', txn);
      form.set('screenshot', blob, 'payment.jpg');
      const res = await fetch('/api/payments', { method: 'POST', body: form });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'တင်လို့ မရပါ');
      toast.success('တင်ပြီးပါပြီ! ၂၄ နာရီအတွင်း စစ်ဆေးပြီး ဖွင့်ပေးပါမယ်');
      setFile(null);
      setPreview(null);
      setTxn('');
      load();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSending(false);
    }
  }

  const account = accounts.find((a) => a.method === method) ?? accounts[0];
  const activePlan =
    user?.plan.type &&
    user.plan.type !== 'free' &&
    user.plan.expiresAt &&
    new Date(user.plan.expiresAt) > new Date()
      ? user.plan
      : null;

  return (
    <AppLayout activePath="/billing">
      <div className="max-w-3xl mx-auto space-y-5">
        <div>
          <h1 className="text-[22px] font-bold text-foreground">⭐ Premium နဲ့ ပံ့ပိုးမယ်</h1>
          <p className="text-[13px] text-muted-foreground">
            Mobile wallet နဲ့ ငွေလွှဲပြီး screenshot တင်ပါ — admin က စစ်ပြီး ၂၄ နာရီအတွင်း
            ဖွင့်ပေးပါမယ်
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-3">
          {[
            [
              '🎁',
              'တစ်ယောက်ဝယ် တစ်ယောက်ရ',
              'ပိုက်ဆံ မတတ်နိုင်တဲ့ ကျောင်းသား တစ်ယောက်ကို Premium လက်ဆောင် ရောက်မယ်',
            ],
            ['👩‍🏫', 'ဆရာတွေကို ထောက်ပံ့', 'ပေးငွေရဲ့ တစ်ဝက်က သင်ခန်းစာ တင်တဲ့ ဆရာတွေဆီ ရောက်မယ်'],
            [
              '⭐',
              'Premium အကျိုးခံစားခွင့်',
              'Premium သင်ခန်းစာ၊ AI တစ်ရက် ၂၀၀ ကြိမ်၊ Supporter badge',
            ],
          ].map(([icon, t, d]) => (
            <div key={t} className="bg-card border border-border rounded-2xl p-3.5">
              <p className="text-2xl">{icon}</p>
              <p className="font-bold text-[13px] mt-1">{t}</p>
              <p className="text-[11.5px] text-muted-foreground mt-0.5">{d}</p>
            </div>
          ))}
        </div>
        <p className="text-[12.5px] text-muted-foreground -mt-2">
          ပိုက်ဆံ မပေးချင်ရင်လည်း ရပါတယ် —{' '}
          <Link href="/rewards" className="text-primary font-semibold">
            ကြိုးစားမှုနဲ့ Premium အခမဲ့ ရယူမယ် →
          </Link>
        </p>

        {activePlan && (
          <div className="bg-success-bg border border-green-200 rounded-2xl p-4 text-[14px]">
            ✅ <b>{PLANS[activePlan.type as PlanId]?.name ?? activePlan.type}</b> Plan —{' '}
            {formatMyDate(new Date(activePlan.expiresAt!))} အထိ သုံးနိုင်ပါတယ်
          </div>
        )}

        <form onSubmit={submit} className="bg-card border border-border rounded-2xl p-5 space-y-5">
          {/* 1. plan */}
          <div>
            <p className="text-[13px] font-semibold mb-2">၁။ Plan ရွေးပါ</p>
            <div className="grid grid-cols-3 gap-2">
              {PLAN_IDS.filter((id) => PLANS[id].enabled).map((id) => (
                <button
                  type="button"
                  key={id}
                  onClick={() => setPlan(id)}
                  className={`rounded-xl border-2 p-3 text-center ${
                    plan === id ? 'border-primary bg-secondary' : 'border-border'
                  }`}
                >
                  <p className="font-bold text-[14px]">{PLANS[id].name}</p>
                  <p className="text-[13px] text-primary font-semibold">
                    {formatKs(PLANS[id].amount)}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* 2. method + account */}
          <div>
            <p className="text-[13px] font-semibold mb-2">၂။ ဒီအကောင့်ကို ငွေလွှဲပါ</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {accounts.map(({ method: m }) => (
                <button
                  type="button"
                  key={m}
                  onClick={() => setMethod(m)}
                  className={`px-3 py-1.5 rounded-full border text-[13px] ${
                    method === m ? 'bg-primary text-white border-primary' : 'border-border'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
            {!account ? (
              <p className="text-[13px] text-muted-foreground bg-muted/50 rounded-xl p-4">
                {settings ? 'ငွေလက်ခံ အကောင့် မရှိသေးပါ။ Admin ကို ဆက်သွယ်ပါ။' : 'ခဏစောင့်ပါ…'}
              </p>
            ) : (
              <div className="bg-muted/50 rounded-xl p-4 flex items-center justify-between gap-3">
                <div className="text-[14px]">
                  <p className="text-muted-foreground text-[12px]">{method}</p>
                  <p className="font-bold tabular-nums text-[16px]">{account.number}</p>
                  <p>{account.name}</p>
                  <p className="text-primary font-bold mt-1">{formatKs(PLANS[plan].amount)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(account.number.replace(/\D/g, ''));
                    toast.success('ဖုန်းနံပါတ် ကူးပြီးပါပြီ');
                  }}
                  className="px-3 py-2 rounded-lg border border-border text-[12.5px]"
                >
                  <Icon name="ClipboardDocumentIcon" size={14} className="inline mr-1" />
                  ကူးမယ်
                </button>
              </div>
            )}
            <p className="text-[12px] text-muted-foreground mt-2">
              ငွေလွှဲတဲ့အခါ note မှာ သင့် email ({user?.email ?? '…'}) ကို ရေးပေးပါ။
            </p>
          </div>

          {/* 3. upload */}
          <div>
            <p className="text-[13px] font-semibold mb-2">၃။ ငွေလွှဲ screenshot တင်ပါ</p>
            <label className="block border-2 border-dashed border-border rounded-xl p-4 text-center cursor-pointer hover:border-primary/40">
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="screenshot" className="max-h-64 mx-auto rounded-lg" />
              ) : (
                <span className="text-[13px] text-muted-foreground">
                  📷 နှိပ်ပြီး ပုံ ရွေးပါ (JPG / PNG)
                </span>
              )}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null;
                  setFile(f);
                  setPreview(f ? URL.createObjectURL(f) : null);
                }}
              />
            </label>
            <input
              value={txn}
              onChange={(e) => setTxn(e.target.value)}
              maxLength={64}
              placeholder="Transaction ID (ရှိရင်)"
              className="mt-2 w-full h-10 px-3 rounded-xl border border-border bg-background text-[14px]"
            />
          </div>

          <button
            type="submit"
            disabled={sending || !file || !account}
            className="w-full py-3 rounded-xl bg-primary text-white font-bold text-[15px] disabled:opacity-40"
          >
            {sending ? 'တင်နေပါတယ်…' : 'တင်မယ်'}
          </button>
        </form>

        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-border font-bold text-[15px]">
            ငွေပေးချေမှု မှတ်တမ်း
          </div>
          {history === null ? (
            <div className="h-20 animate-pulse bg-muted" />
          ) : history.length === 0 ? (
            <p className="px-5 py-4 text-[13px] text-muted-foreground">မှတ်တမ်း မရှိသေးပါ</p>
          ) : (
            <div className="divide-y divide-border">
              {history.map((p) => (
                <div
                  key={p.id}
                  className="px-5 py-3 flex items-center justify-between gap-3 text-[13.5px]"
                >
                  <div>
                    <p className="font-semibold">
                      {PLANS[p.plan]?.name} · {formatKs(p.amount)} · {p.method}
                    </p>
                    <p className="text-[12px] text-muted-foreground">
                      {formatMyDate(new Date(p.createdAt))}
                      {p.note && ` · ${p.note}`}
                      {p.gifted && ' · 🎁 ကျောင်းသား တစ်ယောက်ကို လက်ဆောင် ပေးခဲ့ပါတယ်'}
                    </p>
                  </div>
                  <span
                    className={`text-[11.5px] font-semibold px-2.5 py-1 rounded-full ${STATUS[p.status].cls}`}
                  >
                    {STATUS[p.status].text}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
