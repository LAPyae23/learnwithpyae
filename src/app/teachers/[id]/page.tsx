'use client';
import React, { use, useEffect, useState } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import FollowButton from '@/components/FollowButton';
import TutoringSlots from '@/components/TutoringSlots';
import { api } from '@/lib/api';
import { youTubeId } from '@/lib/youtube';
import type { LessonItem } from '@/data/lessonMeta';

interface Teacher {
  id: string;
  name: string;
  isAdmin: boolean;
  headline: string;
  bio: string;
  jlptLevel: string;
  followers: number;
  joinedAt: string;
  totalViews: number;
  ratingAvg: number;
  ratingCount: number;
}

export default function TeacherProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<{
    teacher: Teacher;
    following: boolean;
    isMe: boolean;
    lessons: LessonItem[];
  } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api<typeof data>(`/api/teachers/${id}`)
      .then(setData)
      .catch((e) => setError(e.message));
  }, [id]);

  if (error) {
    return (
      <AppLayout activePath="/teachers">
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-3">{error}</p>
          <Link href="/teachers" className="text-primary font-semibold">
            ← ဆရာများ
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout activePath="/teachers">
      {!data ? (
        <div className="max-w-4xl mx-auto h-64 rounded-2xl bg-muted animate-pulse" />
      ) : (
        <div className="max-w-4xl mx-auto space-y-5">
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="h-28 bg-gradient-to-r from-[#006633] via-green-600 to-emerald-400" />
            <div className="px-5 pb-5">
              <div className="flex flex-wrap items-end justify-between gap-3 -mt-10">
                <span className="w-20 h-20 rounded-full border-4 border-card bg-primary text-white flex items-center justify-center text-3xl font-bold">
                  {Array.from(data.teacher.name)[0]}
                </span>
                {data.isMe ? (
                  <Link
                    href="/studio"
                    className="px-4 py-1.5 rounded-full border border-border text-[13px] font-semibold"
                  >
                    ✏️ Profile ပြင်မယ်
                  </Link>
                ) : (
                  <FollowButton
                    teacherId={data.teacher.id}
                    following={data.following}
                    onChange={(_, followers) =>
                      setData({ ...data, teacher: { ...data.teacher, followers } })
                    }
                  />
                )}
              </div>
              <h1 className="text-[22px] font-bold mt-2 flex items-center gap-2">
                {data.teacher.name}
                {data.teacher.jlptLevel && (
                  <span className="text-[12px] font-semibold px-2 py-0.5 rounded-full bg-secondary text-primary">
                    JLPT {data.teacher.jlptLevel}
                  </span>
                )}
              </h1>
              {data.teacher.headline && (
                <p className="text-[14px] text-muted-foreground">{data.teacher.headline}</p>
              )}
              <div className="flex flex-wrap gap-4 text-[13px] mt-3">
                <span>
                  <b>{data.lessons.length}</b> သင်ခန်းစာ
                </span>
                <span>
                  <b>{data.teacher.followers}</b> followers
                </span>
                <span>
                  <b>{data.teacher.totalViews}</b> ကြည့်ရှုမှု
                </span>
                {data.teacher.ratingCount > 0 && (
                  <span>
                    ⭐ <b>{data.teacher.ratingAvg.toFixed(1)}</b> ({data.teacher.ratingCount})
                  </span>
                )}
              </div>
              {data.teacher.bio && (
                <p className="text-[13.5px] mt-3 whitespace-pre-wrap">{data.teacher.bio}</p>
              )}
            </div>
          </div>

          <TutoringSlots teacherId={data.teacher.id} isMe={data.isMe} />

          <h2 className="font-bold text-[16px]">🎬 သင်ခန်းစာများ</h2>
          {data.lessons.length === 0 ? (
            <p className="text-sm text-muted-foreground">သင်ခန်းစာ မတင်ရသေးပါ</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.lessons.map((l) => {
                const yt = l.videoUrl ? youTubeId(l.videoUrl) : null;
                return (
                  <Link
                    key={l.id}
                    href={`/lesson/${l.slug}`}
                    className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-md transition-all"
                  >
                    <div className="relative aspect-video bg-gradient-to-br from-[#003d1f] to-gray-900">
                      {yt && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={`https://i.ytimg.com/vi/${yt}/hqdefault.jpg`}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      )}
                      <span
                        className={`absolute top-2 right-2 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          l.access === 'premium'
                            ? 'bg-yellow-400 text-gray-900'
                            : 'bg-green-600 text-white'
                        }`}
                      >
                        {l.access === 'premium' ? '⭐ Premium' : 'Free'}
                      </span>
                    </div>
                    <div className="p-3">
                      <p className="font-semibold text-[14px] line-clamp-2 group-hover:text-primary">
                        {l.title}
                      </p>
                      <p className="text-[12px] text-muted-foreground mt-1">
                        {l.level} · 👁 {l.stats.views}
                        {l.stats.ratingCount > 0 && ` · ⭐ ${l.stats.ratingAvg.toFixed(1)}`}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}
    </AppLayout>
  );
}
