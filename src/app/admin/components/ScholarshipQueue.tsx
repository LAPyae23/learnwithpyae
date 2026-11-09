'use client';
import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { formatMyDate } from '@/lib/jlpt';

interface Row {
  id: string;
  user: { id: string; name: string; email: string } | null;
  reason: string;
  status: 'pending' | 'granted';
  days: number;
  sponsored: boolean;
  createdAt: string;
  grantedAt: string | null;
}

/** Admin: scholarship applicants. Purchases fund them automatically; admins can also grant directly. */
export default function ScholarshipQueue() {
  const [status, setStatus] = useState<'pending' | 'granted'>('pending');
  const [rows, setRows] = useState<Row[] | null>(null);
  const [days, setDays] = useState(30);

  const load = useCallback(() => {
    setRows(null);
    api<{ scholarships: Row[] }>(`/api/admin/scholarships?status=${status}`)
      .then((r) => setRows(r.scholarships))
      .catch((e) => {
        toast.error(e.message);
        setRows([]);
      });
  }, [status]);
  useEffect(load, [load]);

  async function grant(id: string) {
    try {
      await api('/api/admin/scholarships', { method: 'POST', json: { id, days } });
      toast.success(`Premium ${days} ရက် ပေးပြီးပါပြီ`);
      load();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  return (
    <div className="space-y-4 max-w-4xl">
      <p className="text-[13px] text-muted-foreground">
        Premium ဝယ်တဲ့ ငွေပေးချေမှုကို အတည်ပြုတိုင်း ဒီစာရင်းထဲက အစောဆုံး လျှောက်ထားသူကို Premium
        အလိုအလျောက် ပေးပါတယ်။ ချက်ချင်း ပေးချင်ရင် အောက်က ခလုတ်ကို နှိပ်ပါ။
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {(['pending', 'granted'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`px-3.5 py-1.5 rounded-full border text-[13px] ${
              status === s
                ? 'bg-primary text-white border-primary'
                : 'border-border text-muted-foreground'
            }`}
          >
            {s === 'pending' ? 'စောင့်နေသူ' : 'ရပြီးသူ'}
          </button>
        ))}
        {status === 'pending' && (
          <label className="ml-auto text-[12.5px] flex items-center gap-1.5">
            ပေးမယ့် ရက်
            <input
              type="number"
              min={1}
              max={365}
              value={days}
              onChange={(e) => setDays(Number(e.target.value) || 30)}
              className="w-16 h-8 px-2 rounded-lg border border-border bg-background"
            />
          </label>
        )}
      </div>
      {rows === null ? (
        <div className="h-32 rounded-2xl bg-muted animate-pulse" />
      ) : rows.length === 0 ? (
        <p className="bg-card border border-border rounded-2xl p-6 text-center text-[13.5px] text-muted-foreground">
          မရှိပါ
        </p>
      ) : (
        rows.map((r, i) => (
          <div key={r.id} className="bg-card border border-border rounded-2xl p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-bold text-[14px]">
                  {status === 'pending' && <span className="text-muted-foreground">#{i + 1} </span>}
                  {r.user?.name ?? 'ဖျက်ထားသော user'}
                </p>
                <p className="text-[12px] text-muted-foreground">
                  {r.user?.email} · {formatMyDate(new Date(r.createdAt))}
                  {r.grantedAt &&
                    ` · ${r.days} ရက် ${r.sponsored ? '(ဝယ်သူက ပံ့ပိုး)' : '(admin)'}`}
                </p>
              </div>
              {status === 'pending' && (
                <button
                  onClick={() => grant(r.id)}
                  className="px-3 py-1.5 rounded-lg bg-primary text-white text-[12.5px] font-semibold"
                >
                  🎓 ယခု ပေးမယ်
                </button>
              )}
            </div>
            <p className="text-[13.5px] mt-2 whitespace-pre-wrap">{r.reason}</p>
          </div>
        ))
      )}
    </div>
  );
}
