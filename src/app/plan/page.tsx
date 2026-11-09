'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import AppLayout from '@/components/AppLayout';
import { api } from '@/lib/api';
import { formatMyDate, jlptSessionLabel, upcomingJlptSessions } from '@/lib/jlpt';
import { STATUS_LABELS, TASK_LABELS, usePlan } from '@/components/usePlan';

const WEEKDAYS = ['တနင်္ဂနွေ', 'တနင်္လာ', 'အင်္ဂါ', 'ဗုဒ္ဓဟူး', 'ကြာသပတေး', 'သောကြာ', 'စနေ'];
const MINUTE_OPTIONS = [15, 30, 45, 60, 90, 120];

export default function PlanPage() {
  const { data, error, reload } = usePlan();
  const [level, setLevel] = useState('N5');
  const [session, setSession] = useState('');
  const [minutes, setMinutes] = useState(30);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!data) return;
    setLevel(data.settings.level);
    setSession(data.settings.examSession ?? '');
    setMinutes(data.settings.minutesPerDay);
  }, [data]);

  async function save() {
    setSaving(true);
    try {
      await api('/api/plan', {
        method: 'PATCH',
        json: { level, examSession: session || null, minutesPerDay: minutes },
      });
      await reload();
      toast.success('အစီအစဉ် ပြင်ပြီးပါပြီ');
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  const plan = data?.plan;
  const status = plan ? STATUS_LABELS[plan.status] : null;

  return (
    <AppLayout activePath="/plan">
      <div className="max-w-4xl mx-auto space-y-5">
        <div>
          <h1 className="text-[22px] font-bold text-foreground">လေ့လာရေး အစီအစဉ်</h1>
          <p className="text-[13px] text-muted-foreground">
            စာမေးပွဲရက်နဲ့ တစ်နေ့ လေ့လာနိုင်တဲ့ အချိန်ကို ပြောပြရုံနဲ့ နေ့စဉ် ဘာလုပ်ရမလဲ
            စီစဉ်ပေးပါမယ်
          </p>
        </div>

        {/* Settings */}
        <div className="bg-card border border-border rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
          <label className="text-[12.5px] font-semibold text-muted-foreground">
            ဖြေမယ့် အဆင့်
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="mt-1 w-full h-10 px-3 rounded-xl border border-border bg-background text-[14px] text-foreground"
            >
              {['N5', 'N4', 'N3'].map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </label>
          <label className="text-[12.5px] font-semibold text-muted-foreground">
            စာမေးပွဲ
            <select
              value={session}
              onChange={(e) => setSession(e.target.value)}
              className="mt-1 w-full h-10 px-3 rounded-xl border border-border bg-background text-[14px] text-foreground"
            >
              <option value="">နောက်လာမယ့် စာမေးပွဲ</option>
              {upcomingJlptSessions(4).map((d) => {
                const v = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                return (
                  <option key={v} value={v}>
                    {jlptSessionLabel(d)}
                  </option>
                );
              })}
            </select>
          </label>
          <label className="text-[12.5px] font-semibold text-muted-foreground">
            တစ်နေ့ လေ့လာချိန်
            <select
              value={minutes}
              onChange={(e) => setMinutes(Number(e.target.value))}
              className="mt-1 w-full h-10 px-3 rounded-xl border border-border bg-background text-[14px] text-foreground"
            >
              {MINUTE_OPTIONS.map((m) => (
                <option key={m} value={m}>
                  {m} မိနစ်
                </option>
              ))}
            </select>
          </label>
          <button
            onClick={save}
            disabled={saving}
            className="h-10 rounded-xl bg-primary text-white font-bold text-[14px] disabled:opacity-50"
          >
            {saving ? 'သိမ်းနေ…' : 'အစီအစဉ် ဆွဲမယ်'}
          </button>
        </div>

        {error && <p className="text-danger text-[14px]">{error}</p>}
        {!plan && !error && <div className="h-64 bg-muted rounded-2xl animate-pulse" />}

        {plan && data && status && (
          <>
            {/* Summary */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <Stat
                label="စာမေးပွဲအထိ"
                value={plan.daysLeft >= 0 ? `${plan.daysLeft} ရက်` : 'ပြီးသွားပြီ'}
                sub={formatMyDate(new Date(data.settings.examDate))}
              />
              <Stat
                label="သင်ရိုး ပြီးမြောက်မှု"
                value={`${Math.round(plan.coverage * 100)}%`}
                sub={`ဝေါဟာရ ${data.learned.vocab} · kanji ${data.learned.kanji} · သဒ္ဒါ ${data.learned.grammar}`}
              />
              <Stat
                label="လိုအပ်တဲ့ အချိန်"
                value={`${plan.requiredMinutes} မိနစ်/နေ့`}
                sub={`သင့်အချိန် ${data.settings.minutesPerDay} မိနစ်`}
              />
              <div className="bg-card border border-border rounded-2xl p-4">
                <p className="text-[12px] text-muted-foreground">အောင်နိုင်ခြေ (ခန့်မှန်း)</p>
                <p
                  className={`text-[28px] font-bold tabular-nums ${
                    plan.passChance >= 70
                      ? 'text-success'
                      : plan.passChance >= 45
                        ? 'text-warning'
                        : 'text-danger'
                  }`}
                >
                  {plan.passChance}%
                </p>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${status.cls}`}
                >
                  {status.text}
                </span>
              </div>
            </div>

            {/* Advice */}
            <div className="bg-secondary/60 border border-primary/20 rounded-2xl p-4 text-[13.5px] text-foreground space-y-1">
              <p className="font-semibold">💡 အကြံပြုချက်</p>
              <p className="text-muted-foreground">
                {plan.phase === 'past'
                  ? 'ရွေးထားတဲ့ စာမေးပွဲ ပြီးသွားပါပြီ။ နောက်စာမေးပွဲကို ရွေးပါ။'
                  : plan.phase !== 'learn'
                    ? 'နောက်ဆုံး အပတ်တွေမှာ အသစ် မသင်တော့ဘဲ ပြန်လှန်ခြင်းနဲ့ mock test ကို အာရုံစိုက်ပါ။'
                    : plan.status === 'behind'
                      ? `ဒီအရှိန်နဲ့ဆိုရင် သင်ရိုး မကုန်နိုင်ပါ။ တစ်နေ့ ${plan.requiredMinutes} မိနစ်လောက် လေ့လာပါ၊ ဒါမှမဟုတ် နောက်စာမေးပွဲကို ရွေးပါ။`
                      : plan.status === 'tight'
                        ? 'အချိန်က နည်းနည်း ကျပ်ပါတယ်။ ရက်မပျက် လေ့လာဖို့ အရေးကြီးပါတယ်။'
                        : 'ကောင်းပါတယ်! ဒီအရှိန်အတိုင်း နေ့တိုင်း ဆက်လေ့လာပါ။'}
                {data.mockCount === 0 &&
                  ' Mock test တစ်ခါမှ မဖြေရသေးလို့ ခန့်မှန်းချက် တိကျမှု နည်းပါသေးတယ်။'}
              </p>
            </div>

            {/* Week */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="px-5 py-3 border-b border-border font-bold text-[15px]">
                ဒီ ၇ ရက် အစီအစဉ်
              </div>
              <div className="divide-y divide-border">
                {plan.week.map((day, i) => (
                  <div key={day.date} className={`px-5 py-3 ${i === 0 ? 'bg-secondary/40' : ''}`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[13.5px] font-semibold text-foreground">
                        {i === 0 ? 'ဒီနေ့' : WEEKDAYS[day.weekday]}
                      </span>
                      <span className="text-[12px] text-muted-foreground tabular-nums">
                        ~{day.minutes} မိနစ်
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {day.tasks.map((t, ti) => {
                        const meta = TASK_LABELS[t.kind];
                        return (
                          <Link
                            key={ti}
                            href={meta.href}
                            className="text-[12.5px] bg-muted/60 hover:bg-secondary border border-border rounded-full px-3 py-1"
                          >
                            {meta.icon} {meta.label}
                            {t.count > 1 || t.kind === 'review' ? ` ${t.count}` : ''}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      <p className="text-[12px] text-muted-foreground">{label}</p>
      <p className="text-[22px] font-bold text-foreground tabular-nums leading-tight mt-0.5">
        {value}
      </p>
      <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>
    </div>
  );
}
