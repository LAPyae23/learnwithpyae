'use client';
import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { PLANS, formatKs, type PlanId } from '@/data/payment';

interface Row {
  id: string;
  user: { id: string; name: string; email: string } | null;
  plan: PlanId;
  amount: number;
  method: string;
  transactionId: string;
  status: 'pending' | 'approved' | 'rejected';
  note: string;
  createdAt: string;
}

export default function PaymentApprovals() {
  const [status, setStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [rows, setRows] = useState<Row[] | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(() => {
    setRows(null);
    api<{ payments: Row[] }>(`/api/admin/payments?status=${status}`)
      .then((r) => setRows(r.payments))
      .catch((e) => {
        toast.error((e as Error).message);
        setRows([]);
      });
  }, [status]);
  useEffect(load, [load]);

  async function act(id: string, action: 'approve' | 'reject') {
    if (action === 'reject' && !notes[id]?.trim()) {
      toast.error('ငြင်းပယ်ရင် အကြောင်းရင်း ရေးပေးပါ');
      return;
    }
    setBusy(id);
    try {
      await api(`/api/admin/payments/${id}`, {
        method: 'POST',
        json: { action, note: notes[id] ?? '' },
      });
      toast.success(
        action === 'approve' ? 'Approve လုပ်ပြီး plan ဖွင့်ပေးပြီးပါပြီ' : 'ငြင်းပယ်ပြီးပါပြီ'
      );
      setRows((r) => r?.filter((x) => x.id !== id) ?? null);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="px-5 py-3 border-b border-border flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-bold text-[15px]">ငွေပေးချေမှု စစ်ဆေးရန်</h2>
        <div className="flex gap-1">
          {(['pending', 'approved', 'rejected'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`text-[12px] px-3 py-1 rounded-full border ${
                status === s ? 'bg-primary text-white border-primary' : 'border-border'
              }`}
            >
              {s === 'pending' ? 'စစ်ရန်' : s === 'approved' ? 'Approve ပြီး' : 'ငြင်းပယ်ပြီး'}
            </button>
          ))}
        </div>
      </div>

      {rows === null ? (
        <div className="h-24 bg-muted animate-pulse" />
      ) : rows.length === 0 ? (
        <p className="px-5 py-6 text-[13px] text-muted-foreground text-center">မရှိပါ</p>
      ) : (
        <div className="divide-y divide-border">
          {rows.map((p) => (
            <div key={p.id} className="px-5 py-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-[13.5px]">
                  <p className="font-semibold">
                    {p.user?.name ?? '(deleted user)'}{' '}
                    <span className="text-muted-foreground font-normal">{p.user?.email}</span>
                  </p>
                  <p className="text-muted-foreground text-[12.5px]">
                    {PLANS[p.plan]?.name} · <b className="text-foreground">{formatKs(p.amount)}</b>{' '}
                    · {p.method}
                    {p.transactionId && ` · TXN ${p.transactionId}`} ·{' '}
                    {new Date(p.createdAt).toLocaleString()}
                  </p>
                  {p.note && <p className="text-[12px] mt-0.5">Note: {p.note}</p>}
                </div>
                <button
                  onClick={() => setOpen(open === p.id ? null : p.id)}
                  className="text-[12.5px] px-3 py-1.5 rounded-lg border border-border"
                >
                  {open === p.id ? 'ပုံ ပိတ်' : 'Screenshot ကြည့်'}
                </button>
              </div>

              {open === p.id && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`/api/admin/payments/${p.id}`}
                  alt="payment screenshot"
                  className="mt-3 max-h-[480px] rounded-xl border border-border"
                />
              )}

              {status === 'pending' && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <input
                    value={notes[p.id] ?? ''}
                    onChange={(e) => setNotes((n) => ({ ...n, [p.id]: e.target.value }))}
                    maxLength={300}
                    placeholder="Note (ငြင်းပယ်ရင် မဖြစ်မနေ)"
                    className="flex-1 min-w-[180px] h-9 px-3 rounded-lg border border-border bg-background text-[13px]"
                  />
                  <button
                    disabled={busy === p.id}
                    onClick={() => act(p.id, 'approve')}
                    className="h-9 px-4 rounded-lg bg-success text-white text-[13px] font-bold disabled:opacity-50"
                  >
                    ✓ Approve
                  </button>
                  <button
                    disabled={busy === p.id}
                    onClick={() => act(p.id, 'reject')}
                    className="h-9 px-4 rounded-lg border border-danger text-danger text-[13px] font-semibold disabled:opacity-50"
                  >
                    ✗ Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
