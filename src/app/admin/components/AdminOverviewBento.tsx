'use client';
import React from 'react';
import { formatKs } from '@/data/payment';
import { bars, type AdminStats } from './adminStats';

type Tab = 'payments' | 'teachers' | 'content' | 'users' | 'revenue';

function Stat({
  label,
  value,
  sub,
  onClick,
  highlight,
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  onClick?: () => void;
  highlight?: boolean;
}) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      onClick={onClick}
      className={`text-left bg-card border rounded-2xl p-4 ${
        highlight ? 'border-warning/50 bg-warning-bg' : 'border-border'
      } ${onClick ? 'hover:border-primary/40 transition-colors' : ''}`}
    >
      <p className="text-[12px] text-muted-foreground">{label}</p>
      <p className="text-[24px] font-bold text-foreground tabular-nums leading-tight mt-1">
        {value}
      </p>
      {sub && <p className="text-[11.5px] text-muted-foreground mt-0.5">{sub}</p>}
    </Tag>
  );
}

/** Admin overview: real counts from the database. */
export default function AdminOverviewBento({
  stats,
  error,
  goTo,
}: {
  stats: AdminStats | null;
  error: string;
  goTo: (tab: Tab) => void;
}) {
  if (error) return <p className="text-danger text-sm">{error}</p>;
  if (!stats) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-muted animate-pulse" />
        ))}
      </div>
    );
  }
  const { users, learning, content, revenue } = stats;
  const signupBars = bars(users.signupsByDay, (d) => d.n);
  const levelBars = bars(
    ['N5', 'N4', 'N3', 'N2', 'N1', 'none'].map((l) => ({ l, n: users.levels[l] ?? 0 })),
    (x) => x.n
  );
  const pendingLessons = content.lessons.pending ?? 0;

  return (
    <div className="space-y-5">
      {(content.pendingPayments > 0 || content.pendingTeachers > 0 || pendingLessons > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {content.pendingPayments > 0 && (
            <Stat
              highlight
              label="⏳ စစ်ရန် ငွေပေးချေမှု"
              value={content.pendingPayments}
              onClick={() => goTo('payments')}
            />
          )}
          {content.pendingTeachers > 0 && (
            <Stat
              highlight
              label="⏳ ဆရာ လျှောက်လွှာ"
              value={content.pendingTeachers}
              onClick={() => goTo('teachers')}
            />
          )}
          {pendingLessons > 0 && (
            <Stat
              highlight
              label="⏳ စစ်ရန် သင်ခန်းစာ"
              value={pendingLessons}
              onClick={() => goTo('content')}
            />
          )}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat
          label="👥 User စုစုပေါင်း"
          value={users.total}
          sub={`ဒီအပတ် +${users.new7} · ၃၀ ရက် +${users.new30}`}
          onClick={() => goTo('users')}
        />
        <Stat
          label="⭐ Premium (သက်တမ်းရှိ)"
          value={users.premium}
          sub={
            users.total ? `User ရဲ့ ${Math.round((users.premium / users.total) * 100)}%` : undefined
          }
        />
        <Stat label="🔥 ၇ ရက်အတွင်း လေ့လာသူ" value={users.active7} />
        <Stat
          label="💰 ဒီလ ဝင်ငွေ"
          value={<span className="text-[20px]">{formatKs(revenue.thisMonth.total)}</span>}
          sub={`ငွေပေးချေမှု ${revenue.thisMonth.count} ခု`}
          onClick={() => goTo('revenue')}
        />
        <Stat label="🗂 ၇ ရက်အတွင်း လေ့ကျင့်ထားတဲ့ ကတ်" value={learning.cardsReviewed7} />
        <Stat
          label="📝 ၃၀ ရက် Mock Test"
          value={learning.exams30}
          sub={learning.exams30 ? `ပျမ်းမျှ ${learning.examAvgPct}%` : undefined}
        />
        <Stat
          label="📚 ထုတ်ဝေပြီး သင်ခန်းစာ"
          value={content.lessons.published ?? 0}
          sub={`မူကြမ်း ${content.lessons.draft ?? 0}`}
          onClick={() => goTo('content')}
        />
        <Stat
          label="👩‍🏫 ဆရာ / Admin"
          value={`${users.roles.teacher ?? 0} / ${users.roles.admin ?? 0}`}
          onClick={() => goTo('teachers')}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-5">
          <p className="font-bold text-[14px] mb-4">User အသစ် — နောက်ဆုံး ၃၀ ရက်</p>
          <div className="flex items-end gap-[3px] h-36">
            {signupBars.map(({ item, pct }) => (
              <div
                key={item.day}
                className="flex-1 flex flex-col justify-end h-full group relative"
              >
                <div
                  className="bg-primary/80 group-hover:bg-primary rounded-t-sm"
                  style={{ height: `${Math.max(pct, item.n ? 4 : 1.5)}%` }}
                />
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10.5px] bg-foreground text-background px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none">
                  {item.day.slice(5)}: {item.n}
                </span>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[10.5px] text-muted-foreground mt-1.5">
            <span>{users.signupsByDay[0]?.day.slice(5)}</span>
            <span>ယနေ့</span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="font-bold text-[14px] mb-4">ပစ်မှတ် JLPT အဆင့်</p>
          <div className="space-y-2.5">
            {levelBars.map(({ item, pct }) => (
              <div key={item.l} className="flex items-center gap-2 text-[12.5px]">
                <span className="w-16 text-muted-foreground">
                  {item.l === 'none' ? 'မရွေးရသေး' : item.l}
                </span>
                <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-8 text-right tabular-nums">{item.n}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
