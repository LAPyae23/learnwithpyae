'use client';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { PLAN_IDS, formatKs, type SiteSettingsData } from '@/data/payment';

const input =
  'w-full h-9 px-3 rounded-lg border border-border bg-background text-[13.5px] focus:outline-none focus:ring-2 focus:ring-primary/30';

/** Admin: edit plan prices and the mobile-wallet accounts students pay to. */
export default function SiteSettingsEditor() {
  const [s, setS] = useState<SiteSettingsData | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api<SiteSettingsData>('/api/admin/settings')
      .then(setS)
      .catch((e) => toast.error(e.message));
  }, []);

  if (!s) return <div className="h-64 rounded-2xl bg-muted animate-pulse" />;

  async function save() {
    setSaving(true);
    try {
      setS(await api<SiteSettingsData>('/api/admin/settings', { method: 'PUT', json: s }));
      toast.success('သိမ်းပြီးပါပြီ');
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5 max-w-3xl">
      <section className="bg-card border border-border rounded-2xl p-5">
        <h2 className="font-bold text-[15px] mb-1">💳 ငွေလက်ခံ အကောင့်များ</h2>
        <p className="text-[12.5px] text-muted-foreground mb-4">
          ဖွင့်ထားတဲ့ အကောင့်တွေကိုပဲ Premium စာမျက်နှာမှာ ပြပါမယ်။ အမည်က wallet ထဲက အမည်နဲ့
          တူရပါမယ်။
        </p>
        <div className="space-y-3">
          {s.accounts.map((a, i) => (
            <div
              key={a.method}
              className={`grid grid-cols-1 sm:grid-cols-[110px_1fr_1fr_auto] gap-2 items-center p-3 rounded-xl border ${
                a.enabled ? 'border-primary/30 bg-secondary/30' : 'border-border'
              }`}
            >
              <p className="font-semibold text-[13.5px]">{a.method}</p>
              <input
                className={input}
                placeholder="အကောင့် အမည်"
                value={a.name}
                onChange={(e) => {
                  const accounts = [...s.accounts];
                  accounts[i] = { ...a, name: e.target.value };
                  setS({ ...s, accounts });
                }}
              />
              <input
                className={input}
                placeholder="09xxxxxxxxx"
                inputMode="tel"
                value={a.number}
                onChange={(e) => {
                  const accounts = [...s.accounts];
                  accounts[i] = { ...a, number: e.target.value };
                  setS({ ...s, accounts });
                }}
              />
              <label className="flex items-center gap-2 text-[13px] cursor-pointer">
                <input
                  type="checkbox"
                  checked={a.enabled}
                  onChange={(e) => {
                    const accounts = [...s.accounts];
                    accounts[i] = { ...a, enabled: e.target.checked };
                    setS({ ...s, accounts });
                  }}
                />
                ဖွင့်မယ်
              </label>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-card border border-border rounded-2xl p-5">
        <h2 className="font-bold text-[15px] mb-4">⭐ Plan နဲ့ ဈေးနှုန်း</h2>
        <div className="space-y-3">
          {PLAN_IDS.map((id) => {
            const p = s.plans[id];
            const set = (patch: Partial<typeof p>) =>
              setS({ ...s, plans: { ...s.plans, [id]: { ...p, ...patch } } });
            return (
              <div
                key={id}
                className="grid grid-cols-2 sm:grid-cols-[1fr_140px_100px_auto] gap-2 items-end p-3 rounded-xl border border-border"
              >
                <label className="text-[12px] text-muted-foreground">
                  အမည်
                  <input
                    className={input}
                    value={p.name}
                    onChange={(e) => set({ name: e.target.value })}
                  />
                </label>
                <label className="text-[12px] text-muted-foreground">
                  ဈေး (Ks)
                  <input
                    className={input}
                    type="number"
                    min={0}
                    value={p.amount}
                    onChange={(e) => set({ amount: Number(e.target.value) })}
                  />
                </label>
                <label className="text-[12px] text-muted-foreground">
                  ရက်
                  <input
                    className={input}
                    type="number"
                    min={1}
                    value={p.days}
                    onChange={(e) => set({ days: Number(e.target.value) })}
                  />
                </label>
                <label className="flex items-center gap-2 text-[13px] h-9 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={p.enabled}
                    onChange={(e) => set({ enabled: e.target.checked })}
                  />
                  ဖွင့်မယ်
                </label>
                <p className="col-span-2 sm:col-span-4 text-[11.5px] text-muted-foreground">
                  {formatKs(p.amount || 0)} / {p.days || 0} ရက်
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-card border border-border rounded-2xl p-5">
        <h2 className="font-bold text-[15px] mb-4">👩‍🏫 ဆရာ ဝင်ငွေ ခွဲဝေမှု</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="text-[12.5px] text-muted-foreground">
            Premium ဝင်ငွေထဲက ဆရာတွေကို ခွဲဝေမယ့် % (သင်ခန်းစာ ကြည့်ရှုမှုအလိုက်)
            <input
              className={`${input} mt-1`}
              type="number"
              min={0}
              max={100}
              value={s.teacherSharePct}
              onChange={(e) => setS({ ...s, teacherSharePct: Number(e.target.value) })}
            />
          </label>
          <label className="text-[12.5px] text-muted-foreground">
            1-on-1 class ကြေးထဲက platform ယူမယ့် % (ကျန်တာ ဆရာရ)
            <input
              className={`${input} mt-1`}
              type="number"
              min={0}
              max={100}
              value={s.tutorCommissionPct}
              onChange={(e) => setS({ ...s, tutorCommissionPct: Number(e.target.value) })}
            />
          </label>
        </div>
      </section>

      <button
        onClick={save}
        disabled={saving}
        className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold text-[14px] disabled:opacity-40"
      >
        {saving ? 'သိမ်းနေပါတယ်…' : 'သိမ်းမယ်'}
      </button>
    </div>
  );
}
