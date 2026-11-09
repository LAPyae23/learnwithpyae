'use client';
import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import AppLayout from '@/components/AppLayout';
import { api } from '@/lib/api';
import { formatMyDate } from '@/lib/jlpt';

interface Data {
  rules: {
    streakDays: number;
    streakReward: number;
    referralsNeeded: number;
    referralReward: number;
    groupWinnerReward: number;
    groupMinMembers: number;
  };
  premium: boolean;
  premiumUntil: string | null;
  referral: { code: string; invited: number; active: number; progress: number };
  streak: { current: number; toNext: number };
  rewards: { kind: string; days: number; note: string; at: string }[];
  totalDaysEarned: number;
  scholarship: {
    status: 'pending' | 'granted' | 'withdrawn';
    reason: string;
    position: number | null;
    grantedAt: string | null;
    days: number;
  } | null;
}

const KIND_ICON: Record<string, string> = {
  streak: '🔥',
  referral: '👥',
  group: '🏆',
  gift: '🎓',
  admin: '🎁',
};

function Progress({ value, max }: { value: number; max: number }) {
  return (
    <div className="h-2.5 bg-muted rounded-full overflow-hidden">
      <div
        className="h-full bg-primary rounded-full transition-all"
        style={{ width: `${Math.min(100, (value / max) * 100)}%` }}
      />
    </div>
  );
}

export default function RewardsPage() {
  const [d, setD] = useState<Data | null>(null);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    api<Data>('/api/rewards')
      .then(setD)
      .catch((e) => toast.error(e.message));
  }, []);
  useEffect(load, [load]);

  const inviteLink =
    d && typeof window !== 'undefined'
      ? `${window.location.origin}/login?ref=${d.referral.code}`
      : '';

  async function apply(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await api('/api/scholarship', { method: 'POST', json: { reason } });
      toast.success('လျှောက်ပြီးပါပြီ — ပံ့ပိုးသူ တစ်ယောက် Premium ဝယ်တာနဲ့ အစဉ်လိုက် ရပါမယ် 🙏');
      setReason('');
      load();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function withdraw() {
    if (!window.confirm('လျှောက်လွှာကို ပြန်ရုပ်သိမ်းမလား?')) return;
    await api('/api/scholarship', { method: 'DELETE' }).catch(() => undefined);
    load();
  }

  return (
    <AppLayout activePath="/rewards">
      {!d ? (
        <div className="max-w-4xl mx-auto h-72 rounded-2xl bg-muted animate-pulse" />
      ) : (
        <div className="max-w-4xl mx-auto space-y-5">
          <div className="bg-gradient-to-r from-amber-400 to-yellow-300 rounded-2xl p-5 text-gray-900">
            <h1 className="text-[22px] font-bold">💪 ကြိုးစားမှုနဲ့ Premium အခမဲ့ ရယူပါ</h1>
            <p className="text-[13.5px] mt-1">
              ပိုက်ဆံ မလိုပါ — နေ့တိုင်း စာလုပ်တာ၊ သူငယ်ချင်း ဖိတ်တာ၊ အုပ်စုမှာ ပထမ ရတာနဲ့ Premium
              ရပါတယ်
            </p>
            <p className="text-[13px] mt-3 font-semibold">
              {d.premium
                ? `⭐ Premium — ${formatMyDate(new Date(d.premiumUntil!))} အထိ`
                : '🆓 လက်ရှိ အခမဲ့ အသုံးပြုနေပါတယ်'}
              {d.totalDaysEarned > 0 && ` · စုစုပေါင်း ${d.totalDaysEarned} ရက် ရယူပြီး`}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Streak */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <p className="text-3xl">🔥</p>
              <p className="font-bold text-[15px] mt-1">
                Streak {d.rules.streakDays} ရက် = Premium {d.rules.streakReward} ရက်
              </p>
              <p className="text-[12.5px] text-muted-foreground mt-0.5 mb-3">
                နေ့တိုင်း flashcard ဒါမှမဟုတ် mock test တစ်ခုခု လုပ်ပါ
              </p>
              <Progress value={d.rules.streakDays - d.streak.toNext} max={d.rules.streakDays} />
              <p className="text-[12.5px] mt-1.5">
                လက်ရှိ <b>{d.streak.current}</b> ရက် · နောက် <b>{d.streak.toNext}</b> ရက်ဆို ဆုရမယ်
              </p>
              <Link
                href="/flashcards"
                className="inline-block mt-3 text-[13px] text-primary font-semibold"
              >
                ဒီနေ့ စာလုပ်မယ် →
              </Link>
            </div>

            {/* Referral */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <p className="text-3xl">👥</p>
              <p className="font-bold text-[15px] mt-1">
                သူငယ်ချင်း {d.rules.referralsNeeded} ယောက် = Premium {d.rules.referralReward} ရက်
              </p>
              <p className="text-[12.5px] text-muted-foreground mt-0.5 mb-3">
                သင့် link နဲ့ အကောင့်ဖွင့်ပြီး စာစလုပ်တဲ့ သူငယ်ချင်းကို ရေတွက်ပါတယ်
              </p>
              <Progress value={d.referral.progress} max={d.rules.referralsNeeded} />
              <p className="text-[12.5px] mt-1.5">
                ဖိတ်ပြီး {d.referral.invited} ယောက် · စာစလုပ်ပြီး <b>{d.referral.active}</b> ယောက်
              </p>
              <div className="flex gap-2 mt-3">
                <code className="flex-1 text-center font-bold tracking-widest bg-muted rounded-lg py-1.5">
                  {d.referral.code}
                </code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(inviteLink);
                    toast.success('ဖိတ်ခေါ်တဲ့ link ကူးပြီးပါပြီ');
                  }}
                  className="px-3 rounded-lg bg-primary text-white text-[12.5px] font-semibold"
                >
                  Link ကူးမယ်
                </button>
              </div>
              <div className="flex gap-2 mt-2">
                <a
                  href={`https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${encodeURIComponent('ဂျပန်စာကို အခမဲ့ အတူ လေ့လာကြရအောင် 🇯🇵')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center text-[12.5px] py-1.5 rounded-lg border border-border hover:bg-muted"
                >
                  ✈️ Telegram
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(inviteLink)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center text-[12.5px] py-1.5 rounded-lg border border-border hover:bg-muted"
                >
                  📘 Facebook
                </a>
              </div>
            </div>

            {/* Group */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <p className="text-3xl">🏆</p>
              <p className="font-bold text-[15px] mt-1">
                အုပ်စု အပတ်စဉ် ပထမ = Premium {d.rules.groupWinnerReward} ရက်
              </p>
              <p className="text-[12.5px] text-muted-foreground mt-0.5">
                {d.rules.groupMinMembers} ယောက်နဲ့အထက် အုပ်စုတိုင်းမှာ တနင်္လာနေ့ မနက်တိုင်း
                ပြီးခဲ့တဲ့အပတ် ပထမကို ဆုပေးပါတယ်
              </p>
              <Link
                href="/groups"
                className="inline-block mt-3 text-[13px] text-primary font-semibold"
              >
                အုပ်စု ဝင်မယ် →
              </Link>
            </div>

            {/* Scholarship */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <p className="text-3xl">🎓</p>
              <p className="font-bold text-[15px] mt-1">ပညာသင်ဆု — တစ်ယောက်ဝယ် တစ်ယောက်ရ</p>
              <p className="text-[12.5px] text-muted-foreground mt-0.5 mb-3">
                Premium ဝယ်သူ တစ်ယောက်ချင်းစီက စောင့်နေတဲ့ ကျောင်းသား တစ်ယောက်ကို Premium လက်ဆောင်
                ပေးပါတယ်
              </p>
              {d.scholarship?.status === 'pending' ? (
                <div className="bg-warning-bg rounded-xl p-3 text-[13px]">
                  ⏳ လျှောက်ထားပါတယ် — စောင့်နေသူ <b>အမှတ် {d.scholarship.position}</b>
                  <button
                    onClick={withdraw}
                    className="block text-[12px] text-muted-foreground mt-1 hover:text-danger"
                  >
                    ပြန်ရုပ်သိမ်းမယ်
                  </button>
                </div>
              ) : d.premium ? (
                <p className="text-[13px] text-success">
                  ✅ Premium ရှိနေပါတယ်
                  {d.scholarship?.status === 'granted' ? ' — ပညာသင်ဆု ရခဲ့ပါတယ် 🎉' : ''}
                </p>
              ) : (
                <form onSubmit={apply} className="space-y-2">
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    maxLength={600}
                    placeholder="ဘာကြောင့် ဂျပန်စာ လေ့လာနေလဲ၊ ဘာကြောင့် အကူအညီ လိုလဲ အတိုချုပ် ရေးပါ"
                    className="w-full min-h-[80px] px-3 py-2 rounded-xl border border-border bg-background text-[13.5px]"
                  />
                  <button
                    type="submit"
                    disabled={busy || reason.trim().length < 10}
                    className="w-full py-2 rounded-xl bg-primary text-white font-semibold text-[13.5px] disabled:opacity-40"
                  >
                    လျှောက်မယ်
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <p className="px-5 py-3 border-b border-border font-bold text-[14px]">
              🎁 ရရှိခဲ့တဲ့ ဆုများ
            </p>
            {d.rewards.length === 0 ? (
              <p className="px-5 py-4 text-[13px] text-muted-foreground">
                မရသေးပါ — ပထမဆုံး ဆုအတွက် ကြိုးစားကြရအောင်! 💪
              </p>
            ) : (
              <div className="divide-y divide-border">
                {d.rewards.map((r, i) => (
                  <div
                    key={i}
                    className="px-5 py-2.5 flex items-center justify-between gap-3 text-[13px]"
                  >
                    <span>
                      {KIND_ICON[r.kind] ?? '🎁'} {r.note}
                    </span>
                    <span className="text-right flex-shrink-0">
                      <b>+{r.days} ရက်</b>
                      <br />
                      <span className="text-[11px] text-muted-foreground">
                        {formatMyDate(new Date(r.at))}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <p className="text-center text-[13px] text-muted-foreground">
            ပိုက်ဆံနဲ့ ပံ့ပိုးချင်ရင်{' '}
            <Link href="/billing" className="text-primary font-semibold">
              Premium ဝယ်မယ် →
            </Link>{' '}
            (ကျောင်းသား တစ်ယောက်ကိုလည်း လက်ဆောင် ရောက်ပါမယ်)
          </p>
        </div>
      )}
    </AppLayout>
  );
}
