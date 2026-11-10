'use client';
import React, { use, useEffect, useState } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import RichText from '@/components/RichText';
import { api } from '@/lib/api';
import { useCurrentUser } from '@/components/useCurrentUser';
import LessonVideoPlayer from '../components/LessonVideoPlayer';
import TeFormTabs from '../components/TeFormTabs';
import { CommentSection, PremiumLock, ReactionBar } from '../components/LessonSocial';
import FollowButton from '@/components/FollowButton';
import { flagOf } from '@/components/LangPicker';
import {
  LEGACY_TE_FORM_SLUG,
  STATUS_LABEL,
  type LessonItem,
  type ReactionId,
} from '@/data/lessonMeta';

interface Me {
  reaction: ReactionId | null;
  stars: number | null;
  isAuthor: boolean;
  followingAuthor?: boolean;
}

export default function LessonViewerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { user } = useCurrentUser();
  const [lesson, setLesson] = useState<LessonItem | null>(null);
  const [others, setOthers] = useState<LessonItem[]>([]);
  const [error, setError] = useState('');
  const [me, setMe] = useState<Me>({ reaction: null, stars: null, isAuthor: false });

  useEffect(() => {
    setLesson(null);
    api<{ lesson: LessonItem; me: Me }>(`/api/lessons/${encodeURIComponent(slug)}`)
      .then((r) => {
        setLesson(r.lesson);
        setMe(r.me);
        return api<{ lessons: LessonItem[] }>('/api/lessons').then((l) =>
          setOthers(l.lessons.filter((o) => o.level === r.lesson.level && o.slug !== slug))
        );
      })
      .catch((e) => setError(e.message));
  }, [slug]);

  const canEdit =
    !!lesson &&
    (user?.role === 'admin' || (user?.role === 'teacher' && lesson.author?.id === user.id));

  return (
    <AppLayout activePath="/lesson">
      {error ? (
        <div className="max-w-xl mx-auto text-center py-16">
          <p className="text-muted-foreground mb-3">{error}</p>
          <Link href="/lesson" className="text-primary font-semibold">
            ← သင်ခန်းစာများ
          </Link>
        </div>
      ) : !lesson ? (
        <div className="space-y-4">
          <div className="h-8 w-2/3 bg-muted rounded animate-pulse" />
          <div className="aspect-video bg-muted rounded-xl animate-pulse" />
        </div>
      ) : (
        <>
          <div className="mb-5">
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-2">
              <Link href="/lesson" className="hover:text-foreground">
                သင်ခန်းစာများ
              </Link>
              <span className="text-border">›</span>
              <span>{lesson.level}</span>
              {lesson.chapter && (
                <>
                  <span className="text-border">›</span>
                  <span>{lesson.chapter}</span>
                </>
              )}
            </div>
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-foreground">{lesson.title}</h1>
                {lesson.summary && (
                  <p className="text-muted-foreground mt-1 text-sm">{lesson.summary}</p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  {lesson.author ? (
                    <>
                      <Link
                        href={`/teachers/${lesson.author.id}`}
                        className="flex items-center gap-2 text-[13.5px] font-semibold hover:text-primary"
                      >
                        <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-[13px]">
                          {Array.from(lesson.author.name)[0]}
                        </span>
                        {lesson.author.name}
                      </Link>
                      {user && user.id !== lesson.author.id && (
                        <FollowButton
                          key={String(me.followingAuthor)}
                          teacherId={lesson.author.id}
                          following={!!me.followingAuthor}
                          size="sm"
                        />
                      )}
                    </>
                  ) : (
                    <span className="text-[13px] text-muted-foreground">👩‍🏫 NihongoAcademy</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#006633]/10 text-[#006633] border border-[#006633]/20">
                  {flagOf(lesson.language)} {lesson.level}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    lesson.access === 'premium'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-success-bg text-success'
                  }`}
                >
                  {lesson.access === 'premium' ? '⭐ Premium' : '🆓 Free'}
                </span>
                {lesson.durationMin > 0 && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                    ⏱ {lesson.durationMin} မိနစ်
                  </span>
                )}
                {lesson.status !== 'published' && (
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_LABEL[lesson.status].cls}`}
                  >
                    {STATUS_LABEL[lesson.status].text}
                  </span>
                )}
                {canEdit && (
                  <Link
                    href={`/studio?edit=${lesson.slug}`}
                    className="px-3 py-1 rounded-full text-xs font-semibold border border-border hover:bg-muted"
                  >
                    ✏️ ပြင်မယ်
                  </Link>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 space-y-5">
              {lesson.locked ? (
                <PremiumLock title={lesson.title} />
              ) : (
                <LessonVideoPlayer
                  lessonId={lesson.slug}
                  title={lesson.title}
                  url={lesson.videoUrl}
                />
              )}
              {lesson.status === 'published' && (
                <ReactionBar
                  slug={lesson.slug}
                  stats={lesson.stats}
                  me={me}
                  onChange={(stats, m) => {
                    setLesson({ ...lesson, stats });
                    setMe(m);
                  }}
                />
              )}
              {!lesson.locked && lesson.content?.trim() && (
                <div className="bg-card border border-border rounded-xl p-5">
                  <RichText text={lesson.content} className="text-[14.5px]" />
                </div>
              )}
              {lesson.slug === LEGACY_TE_FORM_SLUG && <TeFormTabs />}
              {lesson.status === 'published' && (
                <CommentSection
                  slug={lesson.slug}
                  onCount={(n) =>
                    setLesson((l) => (l ? { ...l, stats: { ...l.stats, comments: n } } : l))
                  }
                />
              )}
            </div>

            <aside className="xl:col-span-1">
              <div className="bg-card border border-border rounded-xl p-4">
                <h2 className="font-bold text-[14px] mb-3">
                  {lesson.level} — နောက်ထပ် သင်ခန်းစာများ
                </h2>
                {others.length === 0 ? (
                  <p className="text-[13px] text-muted-foreground">မရှိသေးပါ</p>
                ) : (
                  <ul className="space-y-1">
                    {others.slice(0, 12).map((o) => (
                      <li key={o.id}>
                        <Link
                          href={`/lesson/${o.slug}`}
                          className="block px-3 py-2 rounded-lg hover:bg-muted text-[13.5px]"
                        >
                          {o.access === 'premium' ? '⭐ ' : o.hasVideo ? '🎬 ' : '📖 '}
                          {o.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </aside>
          </div>
        </>
      )}
    </AppLayout>
  );
}
