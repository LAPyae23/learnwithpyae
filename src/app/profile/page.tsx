'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Icon from '@/components/ui/AppIcon';
import { initial, logout, useCurrentUser } from '@/components/useCurrentUser';
import { formatMyDate } from '@/lib/jlpt';
import TelegramCard from '@/components/TelegramCard';

// ─── Types ────────────────────────────────────────────────────────────────────
interface BillingRecord {
  id: string;
  date: string;
  description: string;
  amount: string;
  status: 'paid' | 'pending' | 'failed';
}

interface SettingToggle {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────
const billingHistory: BillingRecord[] = [
  {
    id: 'inv-001',
    date: '၁ နိုဝင်ဘာ',
    description: '၃ လ Plan — KBZPay',
    amount: '36,000 Ks',
    status: 'paid',
  },
  {
    id: 'inv-002',
    date: '၁ ဩဂုတ်',
    description: '၃ လ Plan — WavePay',
    amount: '36,000 Ks',
    status: 'paid',
  },
  {
    id: 'inv-003',
    date: '၁ ဇူလိုင်',
    description: 'လစဉ် Plan — KBZPay',
    amount: '15,000 Ks',
    status: 'paid',
  },
];

const statusLabels: Record<BillingRecord['status'], string> = {
  paid: 'ပေးပြီး',
  pending: 'စစ်ဆေးဆဲ',
  failed: 'မအောင်မြင်',
};

const studyStats = {
  totalStudyHours: 142,
  lessonsCompleted: 34,
  flashcardsReviewed: 2840,
  quizzesTaken: 18,
  currentStreak: 14,
  longestStreak: 21,
  vocabLearned: 1240,
  avgDailyMinutes: 38,
  weeklyData: [45, 60, 30, 75, 50, 90, 55],
};

const weekDays = ['လာ', 'ဂါ', 'ဟူး', 'ကြာ', 'သော', 'နေ', 'နွေ'];

// ─── Sub-components ────────────────────────────────────────────────────────────

function AccountInfoSection() {
  const [editing, setEditing] = useState(false);
  const { user } = useCurrentUser();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [displayEmail, setDisplayEmail] = useState('');

  React.useEffect(() => {
    if (!user) return;
    setName(user.name);
    setEmail(user.email);
    setDisplayName(user.name);
    setDisplayEmail(user.email);
  }, [user]);

  const handleSave = () => {
    setDisplayName(name);
    setDisplayEmail(email);
    setEditing(false);
  };

  return (
    <div className="bg-card border border-border rounded-2xl shadow-card p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-[15px] font-bold text-foreground">အကောင့် အချက်အလက်</h2>
        <button
          onClick={() => setEditing(!editing)}
          className="flex items-center gap-1.5 text-[12.5px] font-semibold text-primary hover:text-primary/80 transition-colors"
        >
          <Icon name={editing ? 'XMarkIcon' : 'PencilSquareIcon'} size={14} />
          {editing ? 'မလုပ်တော့' : 'ပြင်မယ်'}
        </button>
      </div>

      <div className="flex flex-wrap items-start gap-4 md:gap-5 mb-6">
        <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-white text-[22px] font-bold flex-shrink-0">
          {initial(displayName)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[18px] font-bold text-foreground leading-tight">{displayName}</p>
          <p className="text-[13px] text-muted-foreground mt-0.5">{displayEmail}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[11px] bg-secondary text-primary font-semibold px-2.5 py-0.5 rounded-full">
              {user?.targetLevel ?? 'N5'} ကျောင်းသား
            </span>
            <span className="text-[11px] bg-success-bg text-success font-semibold px-2.5 py-0.5 rounded-full">
              ၃ လ Plan
            </span>
          </div>
        </div>
        {!editing && (
          <button className="flex-shrink-0 text-[12px] text-muted-foreground hover:text-foreground border border-border rounded-lg px-3 py-1.5 transition-colors">
            ဓာတ်ပုံ ပြောင်းမယ်
          </button>
        )}
      </div>

      {editing ? (
        <div className="space-y-4">
          <div>
            <label className="block text-[12px] font-semibold text-muted-foreground mb-1.5">
              အမည်
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-[14px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-muted-foreground mb-1.5">
              Email လိပ်စာ
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-[14px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-muted-foreground mb-1.5">
              ဖြေမယ့် JLPT အဆင့်
            </label>
            <select className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-[14px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all">
              <option>N5 (လက်ရှိ)</option>
              <option>N4</option>
              <option>N3</option>
            </select>
          </div>
          <div className="flex gap-3 pt-1">
            <button
              onClick={handleSave}
              className="px-5 py-2 bg-primary text-white text-[13px] font-bold rounded-xl hover:opacity-90 transition-opacity active:scale-95"
            >
              သိမ်းမယ်
            </button>
            <button
              onClick={() => setEditing(false)}
              className="px-5 py-2 bg-muted text-foreground text-[13px] font-semibold rounded-xl hover:bg-muted/80 transition-colors"
            >
              မလုပ်တော့
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {[
            {
              label: 'အသင်းဝင်သည့်နေ့',
              value: user?.createdAt ? formatMyDate(new Date(user.createdAt)) : '—',
            },
            { label: 'ဖြေမယ့် အဆင့်', value: `JLPT ${user?.targetLevel ?? 'N5'}` },
            { label: 'လေ့လာနေသော ဘာသာ', value: 'ဂျပန်' },
            { label: 'ဆက်တိုက် လေ့လာ', value: `${user?.streak.current ?? 0} ရက်` },
          ].map((item) => (
            <div key={item.label} className="bg-muted/40 rounded-xl px-4 py-3">
              <p className="text-[11px] font-semibold text-muted-foreground mb-0.5">{item.label}</p>
              <p className="text-[13.5px] font-semibold text-foreground">{item.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SubscriptionSection() {
  const plans = [
    {
      id: 'monthly',
      name: 'လစဉ်',
      price: '15,000',
      period: 'Ks / လ',
      features: ['JLPT အဆင့် ၁ ခု', 'Video + quiz', 'Flashcard', 'တစ်လ mock test ၃ ကြိမ်'],
      current: false,
      color: 'border-border',
      badge: '',
    },
    {
      id: 'quarterly',
      name: '၃ လ',
      price: '36,000',
      period: 'Ks / ၃ လ',
      features: [
        'JLPT အဆင့် အားလုံး',
        'Mock test အကန့်အသတ်မဲ့',
        'သဒ္ဒါပုံစံ စုစည်းမှု',
        'PDF စာရွက်များ',
      ],
      current: true,
      color: 'border-primary',
      badge: 'လက်ရှိ Plan',
    },
    {
      id: 'annual',
      name: 'တစ်နှစ်',
      price: '120,000',
      period: 'Ks / နှစ်',
      features: [
        '၃ လ Plan ပါ အားလုံး',
        'ဆရာ့ကို မေးခွင့် (တစ်လ ၂ ကြိမ်)',
        'ကိုယ်ပိုင် လေ့လာရေး အစီအစဉ်',
        '33% သက်သာ',
      ],
      current: false,
      color: 'border-border',
      badge: '',
    },
  ];

  return (
    <div className="bg-card border border-border rounded-2xl shadow-card p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-[15px] font-bold text-foreground">Subscription</h2>
        <div className="flex items-center gap-1.5 bg-success-bg border border-green-200 rounded-full px-3 py-1">
          <div className="w-1.5 h-1.5 bg-success rounded-full" />
          <span className="text-[11.5px] font-semibold text-success">အသုံးပြုနေဆဲ</span>
        </div>
      </div>

      {/* Current plan highlight */}
      <div className="bg-secondary/50 border border-primary/20 rounded-xl p-4 mb-5 flex items-center justify-between">
        <div>
          <p className="text-[12px] font-semibold text-muted-foreground mb-0.5">လက်ရှိ Plan</p>
          <p className="text-[20px] font-bold text-foreground">၃ လ Plan</p>
          <p className="text-[13px] text-muted-foreground">
            <span className="font-semibold text-foreground">၁ ဖေဖော်ဝါရီ</span> မှာ သက်တမ်းကုန်ပါမယ်
          </p>
        </div>
        <div className="text-right">
          <p className="text-[24px] md:text-[28px] font-bold text-primary">36,000 Ks</p>
          <p className="text-[12px] text-muted-foreground">၃ လ</p>
        </div>
      </div>

      {/* Plan comparison */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-3">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative border-2 rounded-xl p-4 transition-all ${plan.current ? 'border-primary bg-secondary/30' : 'border-border hover:border-border/80'}`}
          >
            {plan.badge && (
              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap">
                {plan.badge}
              </span>
            )}
            <p className="text-[13px] font-bold text-foreground mb-1">{plan.name}</p>
            <div className="flex items-end gap-0.5 mb-3">
              <span className="text-[18px] font-bold text-foreground">{plan.price}</span>
              <span className="text-[11px] text-muted-foreground mb-0.5">{plan.period}</span>
            </div>
            <ul className="space-y-1.5 mb-3">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-1.5">
                  <Icon name="CheckIcon" size={12} className="text-success mt-0.5 flex-shrink-0" />
                  <span className="text-[11.5px] text-muted-foreground leading-snug">{f}</span>
                </li>
              ))}
            </ul>
            {!plan.current && (
              <button className="w-full py-1.5 border border-primary text-primary text-[12px] font-semibold rounded-lg hover:bg-secondary transition-colors">
                ပြောင်းမယ်
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-border">
        <button className="text-[12.5px] text-muted-foreground hover:text-foreground font-medium transition-colors flex items-center gap-1.5">
          <Icon name="CreditCardIcon" size={14} />
          ငွေပေးချေမှု နည်းလမ်း
        </button>
        <span className="text-border">·</span>
        <button className="text-[12.5px] text-danger hover:text-danger/80 font-medium transition-colors">
          Subscription ရပ်မယ်
        </button>
      </div>
    </div>
  );
}

function BillingHistorySection() {
  const statusStyles: Record<BillingRecord['status'], string> = {
    paid: 'bg-success-bg text-success',
    pending: 'bg-warning-bg text-warning',
    failed: 'bg-danger-bg text-danger',
  };

  return (
    <div className="bg-card border border-border rounded-2xl shadow-card p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-[15px] font-bold text-foreground">ငွေပေးချေမှု မှတ်တမ်း</h2>
        <button className="flex items-center gap-1.5 text-[12.5px] font-semibold text-primary hover:text-primary/80 transition-colors">
          <Icon name="ArrowDownTrayIcon" size={14} />
          အားလုံး ထုတ်ယူ
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[480px]">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-muted-foreground">
                ရက်စွဲ
              </th>
              <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-muted-foreground">
                အကြောင်းအရာ
              </th>
              <th className="text-right px-4 py-2.5 text-[11px] font-semibold text-muted-foreground">
                ပမာဏ
              </th>
              <th className="text-center px-4 py-2.5 text-[11px] font-semibold text-muted-foreground">
                အခြေအနေ
              </th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {billingHistory.map((record, idx) => (
              <tr
                key={record.id}
                className={`border-b border-border last:border-0 hover:bg-muted/30 transition-colors ${idx % 2 === 0 ? '' : 'bg-muted/10'}`}
              >
                <td className="px-4 py-3 text-[13px] text-muted-foreground whitespace-nowrap">
                  {record.date}
                </td>
                <td className="px-4 py-3 text-[13px] font-medium text-foreground">
                  {record.description}
                </td>
                <td className="px-4 py-3 text-[13px] font-bold text-foreground text-right tabular-nums">
                  {record.amount}
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${statusStyles[record.status]}`}
                  >
                    {statusLabels[record.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button className="text-[12px] text-primary hover:text-primary/80 font-medium transition-colors flex items-center gap-1 ml-auto">
                    <Icon name="DocumentArrowDownIcon" size={13} />
                    PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StudyStatisticsSection() {
  const maxMinutes = Math.max(...studyStats.weeklyData);

  const statCards = [
    {
      label: 'စုစုပေါင်း လေ့လာချိန်',
      value: studyStats.totalStudyHours,
      unit: 'နာရီ',
      icon: 'ClockIcon',
      color: 'text-level-n5',
      bg: 'bg-blue-50',
    },
    {
      label: 'ပြီးခဲ့သော သင်ခန်းစာ',
      value: studyStats.lessonsCompleted,
      unit: '',
      icon: 'PlayCircleIcon',
      color: 'text-primary',
      bg: 'bg-secondary',
    },
    {
      label: 'ပြန်လှန်ခဲ့သော flashcard',
      value: studyStats.flashcardsReviewed.toLocaleString(),
      unit: '',
      icon: 'RectangleStackIcon',
      color: 'text-level-n2',
      bg: 'bg-orange-50',
    },
    {
      label: 'သင်ပြီး ဝေါဟာရ',
      value: studyStats.vocabLearned.toLocaleString(),
      unit: 'လုံး',
      icon: 'BookOpenIcon',
      color: 'text-success',
      bg: 'bg-success-bg',
    },
    {
      label: 'ဆက်တိုက် ရက်',
      value: studyStats.currentStreak,
      unit: 'ရက်',
      icon: 'FireIcon',
      color: 'text-amber-500',
      bg: 'bg-amber-50',
    },
    {
      label: 'နေ့စဉ် ပျမ်းမျှ',
      value: studyStats.avgDailyMinutes,
      unit: 'မိနစ်',
      icon: 'ChartBarIcon',
      color: 'text-purple-500',
      bg: 'bg-purple-50',
    },
  ];

  return (
    <div className="bg-card border border-border rounded-2xl shadow-card p-6">
      <h2 className="text-[15px] font-bold text-foreground mb-5">လေ့လာမှု စာရင်းအင်း</h2>

      {/* Stat grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-muted/30 rounded-xl p-4 flex items-start gap-3">
            <div
              className={`w-9 h-9 ${stat.bg} rounded-lg flex items-center justify-center flex-shrink-0`}
            >
              <Icon
                name={stat.icon as Parameters<typeof Icon>[0]['name']}
                size={17}
                className={stat.color}
              />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground leading-tight mb-0.5">
                {stat.label}
              </p>
              <div className="flex items-end gap-1">
                <span className="text-[20px] font-bold text-foreground tabular-nums leading-none">
                  {stat.value}
                </span>
                {stat.unit && (
                  <span className="text-[11px] text-muted-foreground mb-0.5">{stat.unit}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Weekly activity bar chart */}
      <div>
        <p className="text-[12px] font-semibold text-muted-foreground mb-3">
          ဒီအပတ် လေ့လာချိန် (မိနစ်)
        </p>
        <div className="flex items-end gap-2 h-20">
          {studyStats.weeklyData.map((minutes, i) => (
            <div key={weekDays[i]} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] text-muted-foreground tabular-nums">{minutes}</span>
              <div
                className="w-full rounded-t-md bg-primary/20 relative overflow-hidden"
                style={{ height: 48 }}
              >
                <div
                  className="absolute bottom-0 left-0 right-0 bg-primary rounded-t-md transition-all duration-500"
                  style={{ height: `${(minutes / maxMinutes) * 100}%` }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground">{weekDays[i]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SettingsSection() {
  const [toggles, setToggles] = useState<SettingToggle[]>([
    {
      id: 'email-reminders',
      label: 'နေ့စဉ် လေ့လာရန် သတိပေးချက်',
      description: 'Streak မပြတ်အောင် သတိပေးပါမယ်',
      enabled: true,
    },
    {
      id: 'push-notifs',
      label: 'Push အသိပေးချက်',
      description: 'Flashcard ပြန်လှန်ချိန်နဲ့ သင်ခန်းစာအသစ်',
      enabled: true,
    },
    {
      id: 'weekly-report',
      label: 'အပတ်စဉ် တိုးတက်မှု report',
      description: 'တနင်္ဂနွေတိုင်း လေ့လာမှု အကျဉ်းချုပ်',
      enabled: false,
    },
    {
      id: 'marketing',
      label: 'သတင်းနဲ့ လေ့လာနည်း အကြံပြုချက်',
      description: 'Feature အသစ်၊ လေ့လာနည်းနဲ့ JLPT သတင်း',
      enabled: false,
    },
  ]);

  const toggle = (id: string) => {
    setToggles((prev) => prev.map((t) => (t.id === id ? { ...t, enabled: !t.enabled } : t)));
  };

  return (
    <div className="bg-card border border-border rounded-2xl shadow-card p-6">
      <h2 className="text-[15px] font-bold text-foreground mb-5">ဆက်တင်များ</h2>

      {/* Notification preferences */}
      <div className="mb-6">
        <p className="text-[12px] font-semibold text-muted-foreground mb-3">အသိပေးချက်များ</p>
        <div className="space-y-3">
          {toggles.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-4 py-2.5 border-b border-border last:border-0"
            >
              <div>
                <p className="text-[13.5px] font-semibold text-foreground">{item.label}</p>
                <p className="text-[12px] text-muted-foreground mt-0.5">{item.description}</p>
              </div>
              <button
                onClick={() => toggle(item.id)}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${item.enabled ? 'bg-primary' : 'bg-muted'}`}
                aria-label={`${item.label} ဖွင့်/ပိတ်`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${item.enabled ? 'translate-x-5' : 'translate-x-0'}`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Study preferences */}
      <div className="mb-6">
        <p className="text-[12px] font-semibold text-muted-foreground mb-3">
          လေ့လာမှု ရွေးချယ်ချက်
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[12px] font-semibold text-muted-foreground mb-1.5">
              နေ့စဉ် ပန်းတိုင်
            </label>
            <select
              defaultValue="45 မိနစ်"
              className="w-full bg-background border border-border rounded-xl px-3 py-2 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            >
              <option>30 မိနစ်</option>
              <option>45 မိနစ်</option>
              <option>60 မိနစ်</option>
              <option>90 မိနစ်</option>
            </select>
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-muted-foreground mb-1.5">
              Flashcard ပြပုံ
            </label>
            <select
              defaultValue="Spaced Repetition"
              className="w-full bg-background border border-border rounded-xl px-3 py-2 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            >
              <option>Spaced Repetition</option>
              <option>အစဉ်လိုက်</option>
              <option>ကျပန်း</option>
            </select>
          </div>
        </div>
      </div>

      {/* Danger zone */}
      <div className="border border-red-200 bg-danger-bg/30 rounded-xl p-4">
        <p className="text-[12px] font-semibold text-danger mb-3">သတိထားရန်</p>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[13.5px] font-semibold text-foreground">အကောင့် ဖျက်ရန်</p>
            <p className="text-[12px] text-muted-foreground mt-0.5">
              အကောင့်နဲ့ လေ့လာမှု data အားလုံးကို အပြီးတိုင် ဖျက်ပါမယ်
            </p>
          </div>
          <button className="flex-shrink-0 px-4 py-2 border border-danger text-danger text-[12.5px] font-semibold rounded-xl hover:bg-danger hover:text-white transition-all">
            အကောင့် ဖျက်မယ်
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  return (
    <AppLayout activePath="/profile">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[22px] md:text-[24px] font-bold text-foreground">ကိုယ်ရေးအချက်အလက်</h1>
        <div className="flex flex-wrap items-center justify-between gap-3 mt-1">
          <p className="text-[14px] text-muted-foreground">
            အကောင့်၊ subscription နဲ့ လေ့လာမှု ဆက်တင်တွေကို စီမံပါ
          </p>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-4 py-2 border border-border rounded-xl text-[13px] font-semibold text-muted-foreground hover:text-danger hover:border-danger transition-colors"
          >
            <Icon name="ArrowRightOnRectangleIcon" size={15} />
            အကောင့်မှ ထွက်ရန်
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="xl:col-span-2 space-y-6">
          <AccountInfoSection />
          <SubscriptionSection />
          <BillingHistorySection />
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <StudyStatisticsSection />
          <TelegramCard />
          <SettingsSection />
        </div>
      </div>
    </AppLayout>
  );
}
