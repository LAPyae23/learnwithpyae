'use client';
import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import { api } from '@/lib/api';
import { useCurrentUser } from '@/components/useCurrentUser';
import { LEVELS, type Level, type LessonItem } from '@/data/lessonMeta';

export default function LessonListPage() {
  const { user } = useCurrentUser();
  const [lessons, setLessons] = useState<LessonItem[] | null>(null);
  const [error, setError] = useState('');
  const [level, setLevel] = useState<Level | 'all'>('all');

  useEffect(() => {
    api<{ lessons: LessonItem[] }>('/api/lessons')
      .then((r) => setLessons(r.lessons))
      .catch((e) => setError(e.message));
  }, []);

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
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
          <div>
            <h1 className="text-2xl font-bold text-foreground">သင်ခန်းစာများ</h1>
            <p className="text-sm text-muted-foreground mt-1">
              မြန်မာလို ရှင်းပြထားတဲ့ video သင်ခန်းစာတွေ
            </p>
          </div>
          {canTeach && (
            <Link
              href="/studio"
              className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold"
            >
              ✏️ သင်ခန်းစာ ရေးမယ်
            </Link>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-5">
          {(['all', ...LEVELS] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLevel(l)}
              className={`px-3.5 py-1.5 rounded-full border text-[13px] font-medium ${
                level === l
                  ? 'bg-primary text-white border-primary'
                  : 'border-border text-muted-foreground'
              }`}
            >
              {l === 'all' ? 'အားလုံး' : l}
            </button>
          ))}
        </div>

        {error ? (
          <p className="text-sm text-danger">{error}</p>
        ) : lessons === null ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-40 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : shown.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-8 text-center text-sm text-muted-foreground">
            {level === 'all' ? 'သင်ခန်းစာ မရှိသေးပါ' : `${level} သင်ခန်းစာ မရှိသေးပါ`}
            {level !== 'all' && (
              <button onClick={() => setLevel('all')} className="block mx-auto mt-2 text-primary">
                အားလုံး ကြည့်မယ်
              </button>
            )}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {shown.map((l) => (
              <Link
                key={l.id}
                href={`/lesson/${l.slug}`}
                className="group bg-card border border-border rounded-2xl p-4 hover:border-primary/40 hover:shadow-sm transition-all flex flex-col"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-secondary text-primary">
                    {l.level}
                  </span>
                  {l.hasVideo && (
                    <span className="text-[11px] text-muted-foreground">🎬 Video</span>
                  )}
                  {l.durationMin > 0 && (
                    <span className="text-[11px] text-muted-foreground">
                      ⏱ {l.durationMin} မိနစ်
                    </span>
                  )}
                </div>
                {l.chapter && <p className="text-[12px] text-muted-foreground">{l.chapter}</p>}
                <h2 className="font-bold text-[15px] text-foreground group-hover:text-primary leading-snug">
                  {l.title}
                </h2>
                {l.summary && (
                  <p className="text-[13px] text-muted-foreground mt-1.5 line-clamp-2">
                    {l.summary}
                  </p>
                )}
                <p className="text-[12px] text-muted-foreground mt-auto pt-3">
                  👩‍🏫 {l.author?.name ?? 'NihongoAcademy'}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
