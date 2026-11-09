'use client';
import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import AppLayout from '@/components/AppLayout';
import { api } from '@/lib/api';
import { formatKs } from '@/data/payment';
import { BOOKING_STATUS, fmtMm } from '@/lib/classTime';

interface Booking {
  id: string;
  startAt: string;
  durationMin: number;
  price: number;
  topic: string;
  status: string;
  meetingLink: string;
  note: string;
  review: { stars: number; text: string } | null;
  teacher: { id: string; name: string } | null;
}

function Review({ b, onDone }: { b: Booking; onDone: () => void }) {
  const [stars, setStars] = useState(5);
  const [text, setText] = useState('');
  async function send() {
    try {
      await api(`/api/tutoring/bookings/${b.id}`, {
        method: 'POST',
        json: { action: 'review', stars, text },
      });
      toast.success('ကျေးဇူးပါ!');
      onDone();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }
  return (
    <div className="flex flex-wrap items-center gap-2 mt-2">
      <span className="text-[20px]">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => setStars(n)}
            className={n <= stars ? 'text-yellow-400' : 'text-gray-300'}
          >
            ★
          </button>
        ))}
      </span>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={500}
        placeholder="ဆရာ့ အကြောင်း တစ်ကြောင်း"
        className="flex-1 min-w-[160px] h-9 px-3 rounded-lg border border-border bg-background text-[13px]"
      />
      <button
        onClick={send}
        className="px-3 h-9 rounded-lg bg-primary text-white text-[12.5px] font-semibold"
      >
        အမှတ်ပေးမယ်
      </button>
    </div>
  );
}

export default function ClassesPage() {
  const [rows, setRows] = useState<Booking[] | null>(null);
  const load = useCallback(() => {
    api<{ bookings: Booking[] }>('/api/tutoring/bookings')
      .then((r) => setRows(r.bookings))
      .catch(() => setRows([]));
  }, []);
  useEffect(load, [load]);

  async function act(id: string, action: string, msg: string) {
    try {
      await api(`/api/tutoring/bookings/${id}`, { method: 'POST', json: { action } });
      toast.success(msg);
      load();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  return (
    <AppLayout activePath="/classes">
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-[22px] font-bold">📅 ကျွန်ုပ်၏ 1-on-1 class များ</h1>
            <p className="text-[13px] text-muted-foreground">ဆရာနဲ့ တစ်ယောက်ချင်း online သင်ခန်း</p>
          </div>
          <Link
            href="/teachers"
            className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold"
          >
            ဆရာ ရွေးပြီး book မယ်
          </Link>
        </div>
        {rows === null ? (
          <div className="h-40 rounded-2xl bg-muted animate-pulse" />
        ) : rows.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-8 text-center text-[13.5px] text-muted-foreground">
            Book ထားတဲ့ class မရှိသေးပါ။ ဆရာ profile မှာ &quot;📅 1-on-1 class&quot; ပါတဲ့ ဆရာကို
            ရွေးပြီး book နိုင်ပါတယ်။
          </div>
        ) : (
          rows.map((b) => (
            <div key={b.id} className="bg-card border border-border rounded-2xl p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-bold text-[15px]">
                    {b.teacher ? (
                      <Link href={`/teachers/${b.teacher.id}`} className="hover:text-primary">
                        {b.teacher.name}
                      </Link>
                    ) : (
                      '—'
                    )}
                  </p>
                  <p className="text-[13px]">
                    📅 {fmtMm(b.startAt)} · {b.durationMin} မိနစ် · {formatKs(b.price)}
                  </p>
                  {b.topic && <p className="text-[12.5px] text-muted-foreground">📝 {b.topic}</p>}
                  {b.note && (
                    <p className="text-[12.5px] text-muted-foreground">မှတ်ချက်: {b.note}</p>
                  )}
                </div>
                <span
                  className={`text-[11.5px] font-semibold px-2.5 py-1 rounded-full ${BOOKING_STATUS[b.status]?.cls}`}
                >
                  {BOOKING_STATUS[b.status]?.text}
                </span>
              </div>
              {b.status === 'confirmed' &&
                (b.meetingLink ? (
                  <a
                    href={b.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-3 px-4 py-2 rounded-xl bg-primary text-white text-[13px] font-semibold"
                  >
                    🎥 Class ဝင်မယ်
                  </a>
                ) : (
                  <p className="text-[12.5px] text-muted-foreground mt-2">
                    ⏳ ဆရာက meeting link ထည့်ပေးပါမယ်
                  </p>
                ))}
              {b.status === 'confirmed' && new Date(b.startAt) < new Date() && (
                <button
                  onClick={() => act(b.id, 'complete', 'ပြီးကြောင်း မှတ်ပြီးပါပြီ')}
                  className="ml-2 mt-3 px-3 py-2 rounded-xl border border-border text-[13px]"
                >
                  ✓ Class ပြီးပြီ
                </button>
              )}
              {b.status === 'pending' && (
                <button
                  onClick={() =>
                    window.confirm(
                      'Booking ကို ပယ်ဖျက်မလား? ငွေပြန်အမ်းဖို့ admin ကို ဆက်သွယ်ပါ'
                    ) && act(b.id, 'cancel', 'ပယ်ဖျက်ပြီးပါပြီ')
                  }
                  className="mt-3 text-[12.5px] text-muted-foreground hover:text-danger"
                >
                  ပယ်ဖျက်မယ်
                </button>
              )}
              {b.status === 'completed' &&
                (b.review ? (
                  <p className="mt-2 text-[13px]">
                    {'⭐'.repeat(b.review.stars)} {b.review.text}
                  </p>
                ) : (
                  <Review b={b} onDone={load} />
                ))}
            </div>
          ))
        )}
      </div>
    </AppLayout>
  );
}
