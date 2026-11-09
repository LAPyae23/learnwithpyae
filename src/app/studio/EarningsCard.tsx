'use client';
import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { formatKs } from '@/data/payment';

interface Month {
  month: string;
  pool: number;
  totalViews: number;
  teacherSharePct: number;
  tutorCommissionPct: number;
  views: number;
  viewEarnings: number;
  classes: number;
  classEarnings: number;
  total: number;
  paid: { amount: number; paidAt: string } | null;
}

/** Teacher's earnings: this month's estimate and recent months. */
export default function EarningsCard() {
  const [months, setMonths] = useState<Month[] | null>(null);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    api<{ months: Month[] }>('/api/teacher/earnings')
      .then((r) => setMonths(r.months))
      .catch(() => setMonths(null));
  }, []);
  if (!months) return null;
  const now = months[0];

  return (
    <div className="bg-gradient-to-r from-[#006633] to-emerald-500 text-white rounded-2xl p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[12px] text-white/80">💰 ဒီလ ဝင်ငွေ (ခန့်မှန်း)</p>
          <p className="text-[26px] font-bold tabular-nums leading-tight">{formatKs(now.total)}</p>
          <p className="text-[12px] text-white/85">
            👁 ကြည့်သူ {now.views} ယောက် → {formatKs(now.viewEarnings)} · 📅 1-on-1 {now.classes} ခု
            → {formatKs(now.classEarnings)}
          </p>
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="px-3 py-1.5 rounded-lg bg-white/15 text-[12.5px] font-semibold"
        >
          {open ? 'ပိတ်မယ်' : 'အသေးစိတ်'}
        </button>
      </div>
      {open && (
        <div className="mt-3 bg-white/10 rounded-xl p-3 text-[12.5px] space-y-2">
          <p className="text-white/90">
            Premium ဝင်ငွေရဲ့ {now.teacherSharePct}% ကို ဆရာအားလုံးရဲ့ သင်ခန်းစာ ကြည့်ရှုမှုအလိုက်
            ခွဲဝေပါတယ် — သင်ခန်းစာ ကောင်းကောင်း (Free ရော Premium ရော) တင်လေ ပိုရလေ။ 1-on-1 class
            ကြေးကနေ {now.tutorCommissionPct}% ပဲ နုတ်ပါတယ်။
          </p>
          <div className="divide-y divide-white/15">
            {months.map((m) => (
              <div key={m.month} className="py-1.5 flex justify-between gap-2">
                <span>{m.month}</span>
                <span className="tabular-nums">
                  {formatKs(m.total)}{' '}
                  {m.paid
                    ? '✓ ရပြီး'
                    : m.month === now.month
                      ? '(လက်ရှိ)'
                      : m.total
                        ? '(ပေးရန်)'
                        : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
