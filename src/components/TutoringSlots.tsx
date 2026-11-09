'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { formatKs } from '@/data/payment';
import { fmtMm } from '@/lib/classTime';

interface Offer {
  enabled: boolean;
  pricePerHour: number;
  about: string;
  reviews: { count: number; avg: number };
  slots: { id: string; startAt: string; durationMin: number; price: number }[];
}

/** A teacher's 1-on-1 offer with bookable times (shown on their profile). */
export default function TutoringSlots({ teacherId, isMe }: { teacherId: string; isMe: boolean }) {
  const [o, setO] = useState<Offer | null>(null);
  useEffect(() => {
    api<Offer>(`/api/tutoring/slots?teacher=${teacherId}`)
      .then(setO)
      .catch(() => setO(null));
  }, [teacherId]);
  if (!o || !o.enabled) return null;

  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="font-bold text-[16px]">📅 1-on-1 class</h2>
          <p className="text-[13px] text-muted-foreground">
            တစ်နာရီ {formatKs(o.pricePerHour)}
            {o.reviews.count > 0 && ` · ⭐ ${o.reviews.avg} (${o.reviews.count} ယောက်)`}
          </p>
        </div>
      </div>
      {o.about && <p className="text-[13.5px] mt-2 whitespace-pre-wrap">{o.about}</p>}
      {o.slots.length === 0 ? (
        <p className="text-[13px] text-muted-foreground mt-3">
          အားတဲ့ အချိန် မရှိသေးပါ — နောက်မှ ပြန်ကြည့်ပါ
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-3">
          {o.slots.map((s) =>
            isMe ? (
              <div key={s.id} className="border border-border rounded-xl px-3 py-2 text-[13px]">
                {fmtMm(s.startAt)} · {s.durationMin}′ · {formatKs(s.price)}
              </div>
            ) : (
              <Link
                key={s.id}
                href={`/book/${s.id}`}
                className="border border-border rounded-xl px-3 py-2 text-[13px] hover:border-primary hover:bg-secondary/40 transition-colors"
              >
                <p className="font-semibold">{fmtMm(s.startAt)}</p>
                <p className="text-muted-foreground">
                  {s.durationMin} မိနစ် · <b className="text-primary">{formatKs(s.price)}</b> · Book
                  မယ် →
                </p>
              </Link>
            )
          )}
        </div>
      )}
    </div>
  );
}
