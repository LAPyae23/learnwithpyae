'use client';
import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { formatKs } from '@/data/payment';
import { formatMyDate } from '@/lib/jlpt';

interface Row {
  teacherId: string;
  name: string;
  views: number;
  sharePct: number;
  viewEarnings: number;
  classes: number;
  classEarnings: number;
  total: number;
  paid: { amount: number; paidAt: string } | null;
}
interface Data {
  month: string;
  revenue: number;
  teacherSharePct: number;
  tutorCommissionPct: number;
  pool: number;
  totalViews: number;
  teachers: Row[];
}

const thisMonth = () => new Date(Date.now() + 6.5 * 3600_000).toISOString().slice(0, 7);

/** Admin: monthly teacher payouts (views share of Premium revenue + 1-on-1 classes). */
export default function TeacherEarnings() {
  const [month, setMonth] = useState(thisMonth());
  const [d, setD] = useState<Data | null>(null);

  const load = useCallback(() => {
    setD(null);
    api<Data>(`/api/admin/earnings?month=${month}`)
      .then(setD)
      .catch((e) => toast.error(e.message));
  }, [month]);
  useEffect(load, [load]);

  async function markPaid(r: Row) {
    if (!window.confirm(`${r.name} ကို ${formatKs(r.total)} လွှဲပြီးပြီလား?`)) return;
    try {
      await api('/api/admin/earnings', {
        method: 'POST',
        json: { teacherId: r.teacherId, month, amount: r.total },
      });
      toast.success('မှတ်တမ်း တင်ပြီးပါပြီ');
      load();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  return (
    <div className="space-y-4 max-w-5xl">
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="month"
          value={month}
          onChange={(e) => e.target.value && setMonth(e.target.value)}
          className="h-9 px-3 rounded-lg border border-border bg-background text-[13px]"
        />
        <p className="text-[12.5px] text-muted-foreground">
          Premium ဝင်ငွေရဲ့ {d?.teacherSharePct ?? '…'}% ကို ဆရာတွေရဲ့ သင်ခန်းစာ ကြည့်ရှုမှု
          (ကြည့်သူ တစ်ယောက် တစ်ကြိမ်) အလိုက် ခွဲဝေပါတယ်။ 1-on-1 class ကြေးကနေ{' '}
          {d?.tutorCommissionPct ?? '…'}% နုတ်ပြီး ကျန်တာ ဆရာရပါတယ်။
        </p>
      </div>

      {!d ? (
        <div className="h-48 rounded-2xl bg-muted animate-pulse" />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              ['Premium ဝင်ငွေ', formatKs(d.revenue)],
              [`ဆရာ ခွဲဝေငွေ (${d.teacherSharePct}%)`, formatKs(d.pool)],
              ['သင်ခန်းစာ ကြည့်ရှုမှု', String(d.totalViews)],
            ].map(([l, v]) => (
              <div key={l} className="bg-card border border-border rounded-2xl p-4">
                <p className="text-[12px] text-muted-foreground">{l}</p>
                <p className="text-[22px] font-bold tabular-nums">{v}</p>
              </div>
            ))}
          </div>
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            {d.teachers.length === 0 ? (
              <p className="p-6 text-center text-[13.5px] text-muted-foreground">
                ဒီလ ဆရာ ဝင်ငွေ မရှိသေးပါ
              </p>
            ) : (
              <div className="divide-y divide-border">
                {d.teachers.map((r) => (
                  <div key={r.teacherId} className="px-5 py-3 flex flex-wrap items-center gap-3">
                    <div className="flex-1 min-w-[160px]">
                      <p className="font-semibold text-[14px]">{r.name}</p>
                      <p className="text-[12px] text-muted-foreground">
                        👁 {r.views} ({r.sharePct}%) → {formatKs(r.viewEarnings)} · 📅 class{' '}
                        {r.classes} → {formatKs(r.classEarnings)}
                      </p>
                    </div>
                    <p className="font-bold tabular-nums text-[15px]">{formatKs(r.total)}</p>
                    {r.paid ? (
                      <span className="text-[12px] px-2.5 py-1 rounded-full bg-success-bg text-success">
                        ✓ ပေးပြီး {formatMyDate(new Date(r.paid.paidAt))}
                      </span>
                    ) : (
                      <button
                        disabled={r.total <= 0}
                        onClick={() => markPaid(r)}
                        className="px-3 py-1.5 rounded-lg bg-primary text-white text-[12.5px] font-semibold disabled:opacity-40"
                      >
                        လွှဲပြီးပြီ
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
