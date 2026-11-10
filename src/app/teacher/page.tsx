'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import Icon from '@/components/ui/AppIcon';
import { api } from '@/lib/api';
import { useCurrentUser } from '@/components/useCurrentUser';
import { BOOKING_STATUS, fmtMm } from '@/lib/classTime';
import { formatKs } from '@/data/payment';
import EarningsCard from '../studio/EarningsCard';
import type { LessonItem } from '@/data/lessonMeta';

interface Booking {
  id: string;
  startAt: string;
  durationMin: number;
  price: number;
  status: string;
  meetingLink: string;
  student: { name: string } | null;
}

type IconName = Parameters<typeof Icon>[0]['name'];

const ACTIONS: { href: string; label: string; icon: IconName; color: string }[] = [
  {
    href: '/studio?new=1',
    label: 'သင်ခန်းစာ အသစ်',
    icon: 'PlusCircleIcon',
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    href: '/teacher/classes',
    label: '1-on-1 အချိန်',
    icon: 'CalendarDaysIcon',
    color: 'bg-cyan-50 text-cyan-600',
  },
  {
    href: '/messages?new=1',
    label: 'Admin ကို စာပို့',
    icon: 'ChatBubbleLeftRightIcon',
    color: 'bg-purple-50 text-purple-600',
  },
  {
    href: '/studio',
    label: 'Profile ပြင်',
    icon: 'UserCircleIcon',
    color: 'bg-amber-50 text-amber-600',
  },
];

/** Teacher home: earnings, lesson stats, upcoming classes, quick actions. */
export default function TeacherHome() {
  const { user } = useCurrentUser();
  const [lessons, setLessons] = useState<LessonItem[] | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [followers, setFollowers] = useState<number | null>(null);

  useEffect(() => {
    api<{ lessons: LessonItem[] }>('/api/lessons?scope=mine')
      .then((r) => setLessons(r.lessons))
      .catch(() => setLessons([]));
    api<{ bookings: Booking[] }>('/api/tutoring/bookings?as=teacher')
      .then((r) => setBookings(r.bookings))
      .catch(() => {});
  }, []);
  useEffect(() => {
    if (!user) return;
    api<{ teacher: { followers: number } }>(`/api/teachers/${user.id}`)
      .then((r) => setFollowers(r.teacher.followers))
      .catch(() => setFollowers(0));
  }, [user]);

  const count = (s: string) => lessons?.filter((l) => l.status === s).length ?? 0;
  const views = lessons?.reduce((a, l) => a + (l.stats?.views ?? 0), 0) ?? 0;
  const upcoming = bookings
    .filter(
      (b) =>
        (b.status === 'confirmed' || b.status === 'pending') &&
        new Date(b.startAt) > new Date(Date.now() - 3600000)
    )
    .sort((a, b) => +new Date(a.startAt) - +new Date(b.startAt));
  const top = [...(lessons ?? [])]
    .filter((l) => l.status === 'published')
    .sort((a, b) => (b.stats?.views ?? 0) - (a.stats?.views ?? 0))
    .slice(0, 3);

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[13px] text-muted-foreground">ဆရာ ပင်မ 👩‍🏫</p>
            <h1 className="text-[20px] font-bold truncate">{user?.name ?? ''}</h1>
          </div>
          {user && (
            <Link
              href={`/teachers/${user.id}`}
              className="flex-shrink-0 text-[12.5px] px-3 py-2 rounded-xl border border-border font-semibold"
            >
              ကျွန်ုပ် Profile ကြည့်မယ်
            </Link>
          )}
        </div>

        <EarningsCard />

        <div className="grid grid-cols-4 gap-2">
          {[
            ['🎬', count('published'), 'ထုတ်ဝေပြီး'],
            ['⏳', count('pending'), 'စစ်ဆေးဆဲ'],
            ['👁', views, 'ကြည့်ရှုမှု'],
            ['❤️', followers ?? '…', 'Followers'],
          ].map(([icon, v, l]) => (
            <div
              key={String(l)}
              className="bg-card border border-border rounded-2xl p-2.5 text-center"
            >
              <p className="text-[17px] font-bold tabular-nums">
                {icon} {v}
              </p>
              <p className="text-[10.5px] text-muted-foreground">{l}</p>
            </div>
          ))}
        </div>
        {count('rejected') > 0 && (
          <Link
            href="/studio"
            className="block bg-danger-bg text-danger rounded-2xl px-4 py-3 text-[13px] font-semibold"
          >
            ✏️ Admin က ပြန်ပြင်ခိုင်းထားတဲ့ သင်ခန်းစာ {count('rejected')} ခု ရှိပါတယ် →
          </Link>
        )}

        <div className="grid grid-cols-4 gap-2">
          {ACTIONS.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="flex flex-col items-center gap-1.5 py-2 rounded-2xl active:bg-muted"
            >
              <span className={`w-12 h-12 rounded-2xl flex items-center justify-center ${a.color}`}>
                <Icon name={a.icon} size={24} />
              </span>
              <span className="text-[11.5px] text-center leading-tight">{a.label}</span>
            </Link>
          ))}
        </div>

        <section className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-bold text-[15px]">📅 လာမယ့် 1-on-1 class</h2>
            <Link href="/teacher/classes" className="text-[12.5px] text-primary font-semibold">
              စီမံမယ် →
            </Link>
          </div>
          {upcoming.length === 0 ? (
            <p className="text-[13px] text-muted-foreground">
              မရှိသေးပါ — အားတဲ့ အချိန်တွေ ဖွင့်ထားရင် ကျောင်းသားတွေ book လာပါမယ်
            </p>
          ) : (
            <div className="divide-y divide-border">
              {upcoming.slice(0, 5).map((b) => (
                <div key={b.id} className="py-2.5 flex items-center gap-3 text-[13px]">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{b.student?.name}</p>
                    <p className="text-[12px] text-muted-foreground">
                      {fmtMm(b.startAt)} · {b.durationMin}′ · {formatKs(b.price)}
                    </p>
                  </div>
                  {b.status === 'confirmed' && !b.meetingLink ? (
                    <Link
                      href="/teacher/classes"
                      className="text-[11.5px] px-2 py-1 rounded-full bg-warning-bg text-warning font-semibold"
                    >
                      Link ထည့်ရန်
                    </Link>
                  ) : (
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${BOOKING_STATUS[b.status]?.cls}`}
                    >
                      {BOOKING_STATUS[b.status]?.text}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-bold text-[15px]">🔥 လူကြည့်အများဆုံး သင်ခန်းစာ</h2>
            <Link href="/studio" className="text-[12.5px] text-primary font-semibold">
              Studio →
            </Link>
          </div>
          {lessons === null ? (
            <div className="h-16 rounded-xl bg-muted animate-pulse" />
          ) : top.length === 0 ? (
            <p className="text-[13px] text-muted-foreground">
              ထုတ်ဝေပြီး သင်ခန်းစာ မရှိသေးပါ —{' '}
              <Link href="/studio?new=1" className="text-primary font-semibold">
                ပထမဆုံး သင်ခန်းစာ ရေးမယ်
              </Link>
            </p>
          ) : (
            <div className="divide-y divide-border">
              {top.map((l) => (
                <Link
                  key={l.id}
                  href={`/lesson/${l.slug}`}
                  className="py-2.5 flex items-center gap-3 text-[13px]"
                >
                  <span className="flex-1 min-w-0 font-semibold truncate">{l.title}</span>
                  <span className="text-[12px] text-muted-foreground whitespace-nowrap">
                    👁 {l.stats.views} · 💬 {l.stats.comments}
                    {l.stats.ratingCount > 0 && ` · ⭐ ${l.stats.ratingAvg.toFixed(1)}`}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  );
}
