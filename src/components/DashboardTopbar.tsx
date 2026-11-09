'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import AppLogo from '@/components/ui/AppLogo';
import { pageTitles } from './navItems';
import { daysUntil, nextJlptDate } from '@/lib/jlpt';
import { initial, useCurrentUser } from './useCurrentUser';

export default function DashboardTopbar({ activePath = '/dashboard' }: { activePath?: string }) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [examDays, setExamDays] = useState<number | null>(null);
  const { user } = useCurrentUser();

  useEffect(() => {
    setExamDays(daysUntil(nextJlptDate()));
  }, []);

  const notifications = [
    {
      id: 'notif-001',
      text: 'ဒီနေ့ ပြန်လှန်ရမယ့် flashcard ၂၄ ခု ရှိပါတယ်',
      time: '၂ မိနစ်အကြာ',
      icon: 'RectangleStackIcon',
      unread: true,
    },
    {
      id: 'notif-002',
      text: 'N5 mock test ရလဒ် ထွက်ပါပြီ',
      time: '၁ နာရီအကြာ',
      icon: 'DocumentTextIcon',
      unread: true,
    },
    {
      id: 'notif-003',
      text: 'သင်ခန်းစာအသစ် — て ပုံစံ',
      time: '၃ နာရီအကြာ',
      icon: 'BookOpenIcon',
      unread: false,
    },
    {
      id: 'notif-004',
      text: '၁၄ ရက် ဆက်တိုက် လေ့လာပြီးပါပြီ! ဆက်ကြိုးစားပါ',
      time: '၁ ရက်အကြာ',
      icon: 'FireIcon',
      unread: false,
    },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <header className="h-14 md:h-16 bg-card border-b border-border flex items-center justify-between px-4 md:px-6 flex-shrink-0 z-20">
      {/* Left: Breadcrumb */}
      <div className="flex items-center gap-2 text-[13px] min-w-0">
        <span className="md:hidden">
          <AppLogo size={28} />
        </span>
        <span className="hidden md:inline text-muted-foreground">JLPT N5 သင်တန်း</span>
        <Icon
          name="ChevronRightIcon"
          size={14}
          className="hidden md:inline text-muted-foreground"
        />
        <span className="font-semibold text-foreground truncate">
          {pageTitles[activePath] ?? 'NihongoAcademy'}
        </span>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Exam countdown chip */}
        <div className="hidden md:flex items-center gap-1.5 bg-warning-bg border border-amber-200 rounded-full px-3 py-1">
          <Icon name="CalendarDaysIcon" size={13} className="text-warning" />
          <span className="text-[12px] font-semibold text-warning">
            JLPT စာမေးပွဲ {examDays ?? '—'} ရက်အလို
          </span>
        </div>

        {/* Search */}
        <button className="p-2 rounded-lg hover:bg-muted transition-colors" aria-label="ရှာရန်">
          <Icon name="MagnifyingGlassIcon" size={18} className="text-muted-foreground" />
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="p-2 rounded-lg hover:bg-muted transition-colors relative"
            aria-label="အသိပေးချက်များ"
          >
            <Icon name="BellIcon" size={18} className="text-muted-foreground" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] max-w-80 bg-card border border-border rounded-xl shadow-modal z-50 overflow-hidden animate-fade-in">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <span className="font-semibold text-[14px]">အသိပေးချက်များ</span>
                <span className="text-[11px] text-primary font-semibold cursor-pointer hover:underline">
                  အားလုံး ဖတ်ပြီး
                </span>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`flex items-start gap-3 px-4 py-3 hover:bg-muted cursor-pointer transition-colors ${n.unread ? 'bg-secondary/30' : ''}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${n.unread ? 'bg-secondary' : 'bg-muted'}`}
                    >
                      <Icon
                        name={n.icon as Parameters<typeof Icon>[0]['name']}
                        size={15}
                        className={n.unread ? 'text-primary' : 'text-muted-foreground'}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-[13px] leading-snug ${n.unread ? 'font-medium text-foreground' : 'text-muted-foreground'}`}
                      >
                        {n.text}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{n.time}</p>
                    </div>
                    {n.unread && (
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>
              <div className="px-4 py-2 border-t border-border">
                <span className="text-[12px] text-primary font-semibold cursor-pointer hover:underline">
                  အသိပေးချက် အားလုံး ကြည့်ရန်
                </span>
              </div>
            </div>
          )}
        </div>

        {/* User avatar */}
        <Link href="/profile" className="flex items-center gap-2.5 pl-2">
          <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-[13px] font-bold">
            {initial(user?.name)}
          </div>
          <div className="hidden md:block">
            <p className="text-[13px] font-semibold text-foreground leading-tight">
              {user?.name ?? ''}
            </p>
            <p className="text-[11px] text-muted-foreground leading-tight">
              {user?.role === 'admin' ? 'Admin' : `${user?.targetLevel ?? 'N5'} ကျောင်းသား`}
            </p>
          </div>
          <Icon
            name="ChevronDownIcon"
            size={14}
            className="text-muted-foreground hidden md:block"
          />
        </Link>
      </div>
    </header>
  );
}
