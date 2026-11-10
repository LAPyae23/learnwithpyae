'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import AppLogo from '@/components/ui/AppLogo';
import { api } from '@/lib/api';
import { daysUntil, nextJlptDate } from '@/lib/jlpt';
import { MODES, pageTitles } from './navItems';
import { useMode } from './useMode';
import { initial } from './useCurrentUser';

interface Notice {
  id: string;
  icon: string;
  text: string;
  href: string;
}

/** Top bar: page title, exam countdown (students), real notifications, avatar. */
export default function DashboardTopbar() {
  const { mode, user, current } = useMode();
  const [open, setOpen] = useState(false);
  const [examDays, setExamDays] = useState<number | null>(null);
  const [notices, setNotices] = useState<Notice[]>([]);

  useEffect(() => setExamDays(daysUntil(nextJlptDate())), []);
  useEffect(() => {
    if (!user) return;
    api<{ notices: Notice[] }>(`/api/me/notifications?mode=${mode}`)
      .then((r) => setNotices(r.notices))
      .catch(() => setNotices([]));
  }, [user, mode, current]);

  const title = pageTitles[current] ?? pageTitles[current.split('?')[0]] ?? MODES[mode].label;

  return (
    <header className="h-14 md:h-16 bg-card border-b border-border flex items-center justify-between gap-2 px-4 md:px-6 flex-shrink-0 z-20">
      <div className="flex items-center gap-2 min-w-0">
        <Link href={MODES[mode].home} className="md:hidden flex-shrink-0">
          <AppLogo size={28} />
        </Link>
        <span className="font-bold text-[15px] md:text-[14px] md:font-semibold text-foreground truncate">
          {title}
        </span>
        {mode !== 'student' && (
          <span className="flex-shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-secondary text-primary">
            {MODES[mode].emoji} {MODES[mode].label}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        {mode === 'student' && examDays !== null && (
          <Link
            href="/plan"
            className="hidden sm:flex items-center gap-1.5 bg-warning-bg border border-amber-200 rounded-full px-3 py-1"
          >
            <Icon name="CalendarDaysIcon" size={13} className="text-warning" />
            <span className="text-[12px] font-semibold text-warning">JLPT {examDays} ရက်အလို</span>
          </Link>
        )}

        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="p-2 rounded-full hover:bg-muted relative"
            aria-label="အသိပေးချက်များ"
          >
            <Icon name="BellIcon" size={20} className="text-muted-foreground" />
            {notices.length > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-danger text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {notices.length}
              </span>
            )}
          </button>
          {open && (
            <>
              <button
                className="fixed inset-0 z-40 cursor-default"
                onClick={() => setOpen(false)}
                aria-label="ပိတ်ရန်"
              />
              <div className="absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] max-w-80 bg-card border border-border rounded-2xl shadow-modal z-50 overflow-hidden">
                <p className="px-4 py-3 border-b border-border font-semibold text-[14px]">
                  အသိပေးချက်များ
                </p>
                {notices.length === 0 ? (
                  <p className="px-4 py-6 text-center text-[13px] text-muted-foreground">
                    အသစ် မရှိပါ 🎉
                  </p>
                ) : (
                  <div className="max-h-80 overflow-y-auto divide-y divide-border">
                    {notices.map((n) => (
                      <Link
                        key={n.id}
                        href={n.href}
                        onClick={() => setOpen(false)}
                        className="flex items-start gap-3 px-4 py-3 hover:bg-muted"
                      >
                        <span className="text-[18px] leading-none mt-0.5">{n.icon}</span>
                        <span className="text-[13px] leading-snug">{n.text}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <Link href="/profile" className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-[13px] font-bold">
            {initial(user?.name)}
          </span>
          <span className="hidden md:block">
            <span className="block text-[13px] font-semibold text-foreground leading-tight">
              {user?.name ?? ''}
            </span>
            <span className="block text-[11px] text-muted-foreground leading-tight">
              {user?.role === 'admin'
                ? 'Admin'
                : user?.role === 'teacher'
                  ? 'ဆရာ'
                  : user?.role === 'agency'
                    ? 'Agency'
                    : `${user?.targetLevel ?? 'N5'} ကျောင်းသား`}
            </span>
          </span>
        </Link>
      </div>
    </header>
  );
}
