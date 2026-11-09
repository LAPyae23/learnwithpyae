'use client';
import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { formatKs } from '@/data/payment';
import { BOOKING_STATUS, fmtMm } from '@/lib/classTime';

interface Row {
  id: string;
  teacher: { name: string; email: string } | null;
  student: { name: string; email: string } | null;
  startAt: string;
  durationMin: number;
  price: number;
  method: string;
  transactionId: string;
  topic: string;
  status: string;
  note: string;
  review: { stars: number; text: string } | null;
}

const STATUSES = ['pending', 'confirmed', 'completed', 'rejected', 'cancelled'] as const;

/** Admin: check 1-on-1 class payments; see all bookings. */
export default function BookingApprovals() {
  const [status, setStatus] = useState<(typeof STATUSES)[number]>('pending');
  const [rows, setRows] = useState<Row[] | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const load = useCallback(() => {
    setRows(null);
    api<{ bookings: Row[] }>(`/api/admin/bookings?status=${status}`)
      .then((r) => setRows(r.bookings))
      .catch((e) => {
        toast.error(e.message);
        setRows([]);
      });
  }, [status]);
  useEffect(load, [load]);

  async function act(id: string, action: 'approve' | 'reject') {
    try {
      await api(`/api/admin/bookings/${id}`, {
        method: 'POST',
        json: { action, note: notes[id] ?? '' },
      });
      toast.success(
        action === 'approve' ? 'အတည်ပြုပြီးပါပြီ' : 'ငြင်းပယ်ပြီးပါပြီ (အချိန် ပြန်ဖွင့်ပြီး)'
      );
      load();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex gap-2 flex-wrap">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`px-3.5 py-1.5 rounded-full border text-[13px] ${
              status === s
                ? 'bg-primary text-white border-primary'
                : 'border-border text-muted-foreground'
            }`}
          >
            {BOOKING_STATUS[s].text}
          </button>
        ))}
      </div>
      {rows === null ? (
        <div className="h-32 rounded-2xl bg-muted animate-pulse" />
      ) : rows.length === 0 ? (
        <p className="bg-card border border-border rounded-2xl p-6 text-center text-[13.5px] text-muted-foreground">
          မရှိပါ
        </p>
      ) : (
        rows.map((r) => (
          <div key={r.id} className="bg-card border border-border rounded-2xl p-4 space-y-2">
            <div className="flex flex-wrap justify-between gap-2">
              <div className="text-[13.5px]">
                <p className="font-bold">
                  {r.student?.name} → {r.teacher?.name}
                </p>
                <p className="text-muted-foreground text-[12.5px]">
                  {fmtMm(r.startAt)} · {r.durationMin} မိနစ် ·{' '}
                  <b className="text-foreground">{formatKs(r.price)}</b> · {r.method}
                  {r.transactionId && ` · ${r.transactionId}`}
                </p>
                {r.topic && <p className="text-[12.5px]">📝 {r.topic}</p>}
                {r.review && (
                  <p className="text-[12.5px]">
                    {'⭐'.repeat(r.review.stars)} {r.review.text}
                  </p>
                )}
              </div>
              {status === 'pending' && (
                <button
                  onClick={() => setOpen(open === r.id ? null : r.id)}
                  className="text-[12.5px] text-primary font-semibold"
                >
                  {open === r.id ? 'Screenshot ပိတ်' : 'Screenshot ကြည့်'}
                </button>
              )}
            </div>
            {open === r.id && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`/api/admin/bookings/${r.id}`}
                alt="payment screenshot"
                className="max-h-96 rounded-lg border border-border"
              />
            )}
            {status === 'pending' && (
              <div className="flex flex-wrap gap-2">
                <input
                  value={notes[r.id] ?? ''}
                  onChange={(e) => setNotes({ ...notes, [r.id]: e.target.value })}
                  maxLength={300}
                  placeholder="မှတ်ချက် (ငြင်းရင် အကြောင်းရင်း)"
                  className="flex-1 min-w-[180px] h-9 px-3 rounded-lg border border-border bg-background text-[13px]"
                />
                <button
                  onClick={() => act(r.id, 'approve')}
                  className="px-4 h-9 rounded-lg bg-primary text-white text-[13px] font-semibold"
                >
                  ✓ ငွေရပြီ
                </button>
                <button
                  onClick={() => act(r.id, 'reject')}
                  className="px-4 h-9 rounded-lg border border-border text-[13px]"
                >
                  ငြင်းမယ်
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
