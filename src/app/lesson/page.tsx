'use client';
import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import { api } from '@/lib/api';
import { youTubeId } from '@/lib/youtube';
import { useCurrentUser } from '@/components/useCurrentUser';
import { LEVELS, REACTIONS, totalReactions, type Level, type LessonItem } from '@/data/lessonMeta';

type Feed = 'all' | 'following' | 'popular' | 'new';

const FEEDS: { id: Feed; label: string }[] = [
  { id: 'all', label: '📚 အားလုံး' },
  { id: 'following', label: '❤️ Follow ထားတဲ့ ဆရာ' },
  { id: 'popular', label: '🔥 လူကြိုက်များ' },
  { id: 'new', label: '🆕 အသစ်' },
];

function LessonCard({ l }: { l: LessonItem }) {
  const yt = l.videoUrl ? youTubeId(l.videoUrl) : null;
  const reactions = totalReactions(l.stats);
  const topEmoji = REACTIONS.filter((r) => l.stats.reactions[r.id] > 0)
    .sort((a, b) => l.stats.reactions[b.id] - l.stats.reactions[a.id])
    .slice(0, 3)
    .map((r) => r.emoji)
    .join('');
  return (
    <Link
      href={`/lesson/${l.slug}`}
      className="group bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/40 hover:shadow-md transition-all flex flex-col"
    >
      <div className="relative aspect-video bg-gradient-to-br from-[#003d1f] to-gray-900">
        {yt ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`https://i.ytimg.com/vi/${yt}/hqdefault.jpg`}
            alt=""
            loading="lazy"
            className={`w-full h-full object-cover ${l.access === 'premium' ? 'brightness-75' : ''}`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl opacity-60">
            {l.hasVideo ? '🎬' : '📖'}
          </div>
        )}
        <span className="absolute top-2 left-2 text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/90 text-primary">
          {l.level}
        </span>
        <span
          className={`absolute top-2 right-2 text-[11px] font-bold px-2 py-0.5 rounded-full ${
            l.access === 'premium' ? 'bg-yellow-400 text-gray-900' : 'bg-green-600 text-white'
          }`}
        >
          {l.access === 'premium' ? '⭐ Premium' : 'Free'}
        </span>
        {l.durationMin > 0 && (
          <span className="absolute bottom-2 right-2 text-[11px] px-1.5 py-0.5 rounded bg-black/75 text-white">
            {l.durationMin} မိနစ်
          </span>
        )}
        {yt && (
          <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="w-12 h-12 rounded-full bg-black/60 text-white flex items-center justify-center text-xl">
              ▶
            </span>
          </span>
        )}
      </div>
      <div className="p-3.5 flex flex-col flex-1">
        <h2 className="font-bold text-[14.5px] text-foreground group-hover:text-primary leading-snug line-clamp-2">
          {l.title}
        </h2>
        <p className="text-[12.5px] text-muted-foreground mt-1">
          👩‍🏫 {l.author?.name ?? 'NihongoAcademy'}
        </p>
        <div className="flex items-center gap-3 text-[12px] text-muted-foreground mt-auto pt-2.5">
          <span>👁 {l.stats.views}</span>
          {reactions > 0 && (
            <span>
              {topEmoji} {reactions}
            </span>
          )}
          {l.stats.comments > 0 && <span>💬 {l.stats.comments}</span>}
          {l.stats.ratingCount > 0 && <span>⭐ {l.stats.ratingAvg.toFixed(1)}</span>}
        </div>
      </div>
    </Link>
  );
}

export default function LessonListPage() {
  const { user } = useCurrentUser();
  const [feed, setFeed] = useState<Feed>('all');
  const [lessons, setLessons] = useState<LessonItem[] | null>(null);
  const [error, setError] = useState('');
  const [level, setLevel] = useState<Level | 'all'>('all');

  useEffect(() => {
    setLessons(null);
    const q =
      feed === 'following'
        ? '?following=1&sort=new'
        : feed === 'popular'
          ? '?sort=popular'
          : feed === 'new'
            ? '?sort=new'
            : '';
    api<{ lessons: LessonItem[] }>(`/api/lessons${q}`)
      .then((r) => setLessons(r.lessons))
      .catch((e) => setError(e.message));
  }, [feed]);

  useEffect(() => {
    if (user?.targetLevel && LEVELS.includes(user.targetLevel as Level)) {
      setLevel(user.targetLevel as Level);
    }
  }, [user?.targetLevel]);

  const shown = useMemo(
    () => (lessons ?? []).filter((l) => level === 'all' || l.level === level),
    [lessons, level]
  );
  const canTeach = user?.role === 'teacher' || user?.role === 'admin';

  return (
    <AppLayout activePath="/lesson">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">သင်ခန်းစာများ</h1>
            <p className="text-sm text-muted-foreground mt-1">
              ဆရာ/ဆရာမတွေ မြန်မာလို ရှင်းပြထားတဲ့ video သင်ခန်းစာတွေ
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/teachers"
              className="px-4 py-2 rounded-xl border border-border text-sm font-semibold hover:bg-muted"
            >
              👩‍🏫 ဆရာများ
            </Link>
            {canTeach && (
              <Link
                href="/studio"
                className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold"
              >
                ✏️ သင်ခန်းစာ တင်မယ်
              </Link>
            )}
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 mb-3">
          {FEEDS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFeed(f.id)}
              className={`px-4 py-2 rounded-full text-[13px] font-semibold whitespace-nowrap ${
                feed === f.id ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 mb-5">
          {(['all', ...LEVELS] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLevel(l)}
              className={`px-3 py-1 rounded-full border text-[12.5px] font-medium ${
                level === l
                  ? 'bg-primary text-white border-primary'
                  : 'border-border text-muted-foreground'
              }`}
            >
              {l === 'all' ? 'အဆင့် အားလုံး' : l}
            </button>
          ))}
        </div>

        {error ? (
          <p className="text-sm text-danger">{error}</p>
        ) : lessons === null ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="aspect-[4/3] rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : shown.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-8 text-center text-sm text-muted-foreground">
            {feed === 'following' ? (
              <>
                Follow ထားတဲ့ ဆရာ မရှိသေးပါ။
                <Link href="/teachers" className="block mt-2 text-primary font-semibold">
                  ဆရာတွေကို ရှာကြည့်မယ် →
                </Link>
              </>
            ) : (
              <>
                {level === 'all' ? 'သင်ခန်းစာ မရှိသေးပါ' : `${level} သင်ခန်းစာ မရှိသေးပါ`}
                {level !== 'all' && (
                  <button
                    onClick={() => setLevel('all')}
                    className="block mx-auto mt-2 text-primary"
                  >
                    အဆင့် အားလုံး ကြည့်မယ်
                  </button>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {shown.map((l) => (
              <LessonCard key={l.id} l={l} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
