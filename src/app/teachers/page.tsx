'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import FollowButton from '@/components/FollowButton';
import { api } from '@/lib/api';
import { useCurrentUser } from '@/components/useCurrentUser';

interface TeacherCard {
  id: string;
  name: string;
  headline: string;
  jlptLevel: string;
  followers: number;
  lessons: number;
  following: boolean;
}

export default function TeachersPage() {
  const { user } = useCurrentUser();
  const [teachers, setTeachers] = useState<TeacherCard[] | null>(null);

  useEffect(() => {
    api<{ teachers: TeacherCard[] }>('/api/teachers')
      .then((r) => setTeachers(r.teachers))
      .catch(() => setTeachers([]));
  }, []);

  return (
    <AppLayout activePath="/teachers">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
          <div>
            <h1 className="text-2xl font-bold text-foreground">ဆရာ / ဆရာမများ</h1>
            <p className="text-sm text-muted-foreground mt-1">
              ကြိုက်တဲ့ ဆရာကို Follow လုပ်ထားရင် သင်ခန်းစာ အသစ်တင်တိုင်း feed မှာ ပေါ်ပါမယ်
            </p>
          </div>
          {user?.role === 'student' && (
            <Link
              href="/teach"
              className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold"
            >
              ✋ ဆရာ အဖြစ် ပါဝင်မယ်
            </Link>
          )}
        </div>

        {teachers === null ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-44 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : teachers.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-8 text-center">
            <p className="text-4xl mb-2">👩‍🏫</p>
            <p className="text-sm text-muted-foreground">ဆရာ မရှိသေးပါ။ ပထမဆုံး ဆရာ ဖြစ်လာပါ!</p>
            <Link href="/teach" className="inline-block mt-3 text-primary font-semibold text-sm">
              ဆရာ အဖြစ် လျှောက်မယ် →
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {teachers.map((t) => (
              <Link
                key={t.id}
                href={`/teachers/${t.id}`}
                className="bg-card border border-border rounded-2xl p-5 text-center hover:border-primary/40 hover:shadow-md transition-all"
              >
                <span className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-primary to-green-400 text-white flex items-center justify-center text-2xl font-bold">
                  {Array.from(t.name)[0]}
                </span>
                <p className="font-bold text-[15px] mt-3">{t.name}</p>
                {t.jlptLevel && (
                  <span className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full bg-secondary text-primary mt-1">
                    JLPT {t.jlptLevel}
                  </span>
                )}
                {t.headline && (
                  <p className="text-[12.5px] text-muted-foreground mt-1.5 line-clamp-2">
                    {t.headline}
                  </p>
                )}
                <p className="text-[12px] text-muted-foreground mt-2">
                  🎬 {t.lessons} သင်ခန်းစာ · ❤️ {t.followers} followers
                </p>
                {user && user.id !== t.id && (
                  <div className="mt-3">
                    <FollowButton teacherId={t.id} following={t.following} size="sm" />
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
