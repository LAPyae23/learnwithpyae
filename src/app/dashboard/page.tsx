'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import Icon from '@/components/ui/AppIcon';
import { api } from '@/lib/api';
import { youTubeId } from '@/lib/youtube';
import { AI_ENABLED } from '@/lib/features';
import { useCurrentUser } from '@/components/useCurrentUser';
import { lastMode } from '@/components/useMode';
import { MODES, modesFor } from '@/components/navItems';
import TodayPlanCard from './components/TodayPlanCard';
import type { LessonItem } from '@/data/lessonMeta';

interface Stats {
  streak: { current: number; longest: number };
  cardsReviewed: number;
  cardsKnown: number;
  exams: number;
  bestExamPct: number;
}
interface Deck {
  id: string;
  label: string;
  due: number;
}
interface Group {
  id: string;
  name: string;
  emoji: string;
  memberCount: number;
}

type IconName = Parameters<typeof Icon>[0]['name'];

const TOOLS: { href: string; label: string; icon: IconName; color: string; ai?: boolean }[] = [
  {
    href: '/exam',
    label: 'Mock Test',
    icon: 'DocumentTextIcon',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    href: '/kanji',
    label: 'Kanji',
    icon: 'PencilSquareIcon',
    color: 'bg-orange-50 text-orange-600',
  },
  {
    href: '/speak',
    label: 'အသံထွက်',
    icon: 'SpeakerWaveIcon',
    color: 'bg-purple-50 text-purple-600',
  },
  {
    href: '/sensei',
    label: 'AI ဆရာ',
    icon: 'SparklesIcon',
    color: 'bg-pink-50 text-pink-600',
    ai: true,
  },
  {
    href: '/teachers',
    label: 'ဆရာများ',
    icon: 'UserGroupIcon',
    color: 'bg-emerald-50 text-emerald-600',
  },
  { href: '/classes', label: '1-on-1', icon: 'VideoCameraIcon', color: 'bg-cyan-50 text-cyan-600' },
  { href: '/jobs', label: 'အလုပ်', icon: 'BuildingOffice2Icon', color: 'bg-red-50 text-red-600' },
  { href: '/rewards', label: 'ဆုများ', icon: 'GiftIcon', color: 'bg-amber-50 text-amber-600' },
];

/** Student home: what to do today, streak, quick tools, new lessons, my groups — all real data. */
export default function StudentHome() {
  const router = useRouter();
  const { user } = useCurrentUser();
  const [stats, setStats] = useState<Stats | null>(null);
  const [due, setDue] = useState<number | null>(null);
  const [lessons, setLessons] = useState<LessonItem[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);

  // Teachers, admins and agencies land on their own home unless they chose the student mode
  useEffect(() => {
    if (!user) return;
    const modes = modesFor(user.role);
    if (modes[0] === 'student') return;
    const m = lastMode(user.role);
    if (modes[0] === 'agency' || m !== 'student') {
      router.replace(MODES[m && modes.includes(m) ? m : modes[0]].home);
    }
  }, [user, router]);

  useEffect(() => {
    api<Stats>('/api/me/stats')
      .then(setStats)
      .catch(() => {});
    api<{ decks: Deck[] }>('/api/decks')
      .then((r) => setDue(r.decks.reduce((a, d) => a + (d.due ?? 0), 0)))
      .catch(() => setDue(0));
    api<{ lessons: LessonItem[] }>('/api/lessons?sort=new')
      .then((r) => setLessons(r.lessons.slice(0, 6)))
      .catch(() => {});
    api<{ mine: Group[] }>('/api/groups')
      .then((r) => setGroups(r.mine.slice(0, 3)))
      .catch(() => {});
  }, []);

  const hour = new Date().getHours();
  const hello = hour < 12 ? 'မင်္ဂလာ နံနက်ခင်းပါ' : hour < 17 ? 'မင်္ဂလာပါ' : 'မင်္ဂလာ ညနေခင်းပါ';

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[13px] text-muted-foreground">{hello} 👋</p>
            <h1 className="text-[20px] font-bold truncate">{user?.name ?? ''}</h1>
          </div>
          <Link
            href="/rewards"
            className="flex-shrink-0 flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-2xl px-3 py-2"
          >
            <span className="text-[22px] leading-none">🔥</span>
            <span>
              <span className="block text-[17px] font-bold leading-none tabular-nums">
                {stats?.streak.current ?? 0}
              </span>
              <span className="block text-[10px] text-amber-700">ရက်ဆက်</span>
            </span>
          </Link>
        </div>

        <Link
          href="/flashcards"
          className="block bg-gradient-to-br from-[#006633] to-emerald-500 text-white rounded-3xl p-5 active:scale-[0.99] transition-transform"
        >
          <p className="text-[13px] text-white/85">ဒီနေ့ ပြန်လှန်ရမယ့် ကတ်</p>
          <p className="text-[40px] font-bold leading-tight tabular-nums">{due ?? '…'}</p>
          <p className="mt-2 inline-flex items-center gap-1.5 bg-white/20 rounded-full px-4 py-1.5 text-[13px] font-semibold">
            {due ? 'စလေ့လာမယ်' : 'ကတ်အသစ် လေ့လာမယ်'} <Icon name="ArrowRightIcon" size={14} />
          </p>
        </Link>

        <TodayPlanCard />

        <div className="grid grid-cols-4 gap-2">
          {TOOLS.filter((t) => !t.ai || AI_ENABLED).map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="flex flex-col items-center gap-1.5 py-2 rounded-2xl active:bg-muted"
            >
              <span className={`w-12 h-12 rounded-2xl flex items-center justify-center ${t.color}`}>
                <Icon name={t.icon} size={24} />
              </span>
              <span className="text-[11.5px] text-center leading-tight">{t.label}</span>
            </Link>
          ))}
        </div>

        {stats && (
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                ['🗂', stats.cardsReviewed, 'ကတ် လှန်ပြီး'],
                ['🧠', stats.cardsKnown, 'မှတ်မိပြီး'],
                ['📝', stats.exams ? `${stats.bestExamPct}%` : '—', 'Mock test'],
              ] as const
            ).map(([icon, v, l]) => (
              <div key={l} className="bg-card border border-border rounded-2xl p-3 text-center">
                <p className="text-[18px] font-bold tabular-nums">
                  {icon} {v}
                </p>
                <p className="text-[11px] text-muted-foreground">{l}</p>
              </div>
            ))}
          </div>
        )}

        {lessons.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-bold text-[15px]">🆕 သင်ခန်းစာ အသစ်</h2>
              <Link href="/lesson" className="text-[12.5px] text-primary font-semibold">
                အားလုံး →
              </Link>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4 snap-x">
              {lessons.map((l) => {
                const yt = l.videoUrl ? youTubeId(l.videoUrl) : null;
                return (
                  <Link
                    key={l.id}
                    href={`/lesson/${l.slug}`}
                    className="snap-start flex-shrink-0 w-[220px] bg-card border border-border rounded-2xl overflow-hidden"
                  >
                    <div className="relative aspect-video bg-gradient-to-br from-[#003d1f] to-gray-900">
                      {yt && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={`https://i.ytimg.com/vi/${yt}/mqdefault.jpg`}
                          alt=""
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                      )}
                      <span className="absolute top-1.5 left-1.5 text-[10.5px] font-bold px-1.5 py-0.5 rounded bg-white/90 text-primary">
                        {l.level}
                      </span>
                      {l.access === 'premium' && (
                        <span className="absolute top-1.5 right-1.5 text-[10.5px] font-bold px-1.5 py-0.5 rounded bg-yellow-400 text-gray-900">
                          ⭐
                        </span>
                      )}
                    </div>
                    <div className="p-2.5">
                      <p className="text-[13px] font-semibold line-clamp-2 leading-snug">
                        {l.title}
                      </p>
                      <p className="text-[11.5px] text-muted-foreground mt-0.5 truncate">
                        {l.author?.name ?? 'NihongoAcademy'}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        <section className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-bold text-[15px]">👥 ကျွန်ုပ်၏ အုပ်စုများ</h2>
            <Link href="/groups" className="text-[12.5px] text-primary font-semibold">
              {groups.length ? 'အားလုံး →' : 'အုပ်စု ရှာမယ် →'}
            </Link>
          </div>
          {groups.length === 0 ? (
            <p className="text-[13px] text-muted-foreground">
              သူငယ်ချင်းတွေနဲ့ အတူ စာလုပ်ရင် ပိုပျော်ပြီး ပိုကြာကြာ ဆက်လုပ်နိုင်ပါတယ် 💪
            </p>
          ) : (
            <div className="divide-y divide-border">
              {groups.map((g) => (
                <Link
                  key={g.id}
                  href={`/groups/${g.id}`}
                  className="flex items-center gap-3 py-2.5"
                >
                  <span className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-xl">
                    {g.emoji}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-[14px] font-semibold truncate">{g.name}</span>
                    <span className="block text-[12px] text-muted-foreground">
                      👥 {g.memberCount} ယောက်
                    </span>
                  </span>
                  <Icon name="ChevronRightIcon" size={16} className="text-muted-foreground" />
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  );
}
