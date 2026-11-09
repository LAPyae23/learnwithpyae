'use client';
import React from 'react';
import Icon from '@/components/ui/AppIcon';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

const kpis = [
  {
    label: 'Total Users',
    value: '12,847',
    change: '+234 this week',
    positive: true,
    icon: 'UsersIcon',
    color: 'bg-blue-50',
    iconColor: 'text-blue-500',
  },
  {
    label: 'Active Subscriptions',
    value: '4,291',
    change: '+89 this month',
    positive: true,
    icon: 'CreditCardIcon',
    color: 'bg-green-50',
    iconColor: 'text-green-500',
  },
  {
    label: 'Monthly Revenue',
    value: '¥2.4M',
    change: '+12.3% vs last month',
    positive: true,
    icon: 'BanknotesIcon',
    color: 'bg-amber-50',
    iconColor: 'text-amber-500',
  },
  {
    label: 'Churn Rate',
    value: '2.1%',
    change: '-0.4% vs last month',
    positive: true,
    icon: 'ArrowTrendingDownIcon',
    color: 'bg-red-50',
    iconColor: 'text-red-500',
  },
  {
    label: 'Avg. Session Time',
    value: '38 min',
    change: '+5 min vs last week',
    positive: true,
    icon: 'ClockIcon',
    color: 'bg-purple-50',
    iconColor: 'text-purple-500',
  },
  {
    label: 'Course Completions',
    value: '1,024',
    change: '+67 this week',
    positive: true,
    icon: 'AcademicCapIcon',
    color: 'bg-teal-50',
    iconColor: 'text-teal-500',
  },
];

const signupData = [
  { day: 'Mon', signups: 42 },
  { day: 'Tue', signups: 58 },
  { day: 'Wed', signups: 35 },
  { day: 'Thu', signups: 71 },
  { day: 'Fri', signups: 63 },
  { day: 'Sat', signups: 29 },
  { day: 'Sun', signups: 18 },
];

const revenueData = [
  { month: 'Feb', revenue: 1.8 },
  { month: 'Mar', revenue: 2.0 },
  { month: 'Apr', revenue: 1.9 },
  { month: 'May', revenue: 2.2 },
  { month: 'Jun', revenue: 2.1 },
  { month: 'Jul', revenue: 2.4 },
];

const recentActivity = [
  {
    id: 'a1',
    user: 'Kenji Watanabe',
    action: 'Upgraded to Premium',
    time: '3m ago',
    type: 'upgrade',
  },
  {
    id: 'a2',
    user: 'Sakura Ito',
    action: 'Completed N3 course',
    time: '12m ago',
    type: 'completion',
  },
  { id: 'a3', user: 'Hiroshi Tanaka', action: 'New registration', time: '28m ago', type: 'signup' },
  {
    id: 'a4',
    user: 'Yuki Nakamura',
    action: 'Cancelled subscription',
    time: '1h ago',
    type: 'cancel',
  },
  {
    id: 'a5',
    user: 'Aiko Sato',
    action: 'Passed JLPT N2 mock',
    time: '2h ago',
    type: 'completion',
  },
  {
    id: 'a6',
    user: 'Ryo Yamamoto',
    action: 'Upgraded to Premium',
    time: '3h ago',
    type: 'upgrade',
  },
];

const activityColors: Record<string, string> = {
  upgrade: 'bg-green-100 text-green-700',
  completion: 'bg-blue-100 text-blue-700',
  signup: 'bg-purple-100 text-purple-700',
  cancel: 'bg-red-100 text-red-700',
};

export default function AdminOverviewBento() {
  return (
    <div className="space-y-6">
      {/* KPI Bento Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map((kpi, i) => (
          <div
            key={`kpi-${i}`}
            className="bg-card border border-border rounded-2xl shadow-card p-4 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                {kpi.label}
              </p>
              <div className={`w-7 h-7 ${kpi.color} rounded-lg flex items-center justify-center`}>
                <Icon
                  name={kpi.icon as Parameters<typeof Icon>[0]['name']}
                  size={14}
                  className={kpi.iconColor}
                />
              </div>
            </div>
            <div>
              <p className="text-[26px] font-bold text-foreground tabular-nums leading-none">
                {kpi.value}
              </p>
              <p
                className={`text-[11px] font-medium mt-1.5 ${kpi.positive ? 'text-success' : 'text-danger'}`}
              >
                {kpi.change}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Signups */}
        <div className="bg-card border border-border rounded-2xl shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[14px] font-semibold text-foreground">Daily Signups</p>
              <p className="text-[12px] text-muted-foreground">This week</p>
            </div>
            <span className="text-[12px] font-semibold text-success bg-success-bg px-2.5 py-1 rounded-full">
              +316 total
            </span>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={signupData} barSize={28}>
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  fontSize: 12,
                }}
                cursor={{ fill: 'var(--muted)' }}
              />
              <Bar dataKey="signups" fill="var(--primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Trend */}
        <div className="bg-card border border-border rounded-2xl shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[14px] font-semibold text-foreground">Revenue Trend</p>
              <p className="text-[12px] text-muted-foreground">Last 6 months (¥M)</p>
            </div>
            <span className="text-[12px] font-semibold text-success bg-success-bg px-2.5 py-1 rounded-full">
              +33% YoY
            </span>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={revenueData}>
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide domain={[1.5, 2.6]} />
              <Tooltip
                contentStyle={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(v: number) => [`¥${v}M`, 'Revenue']}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="var(--primary)"
                strokeWidth={2.5}
                dot={{ fill: 'var(--primary)', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-card border border-border rounded-2xl shadow-card p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[14px] font-semibold text-foreground">Recent Activity</p>
          <button className="text-[12px] text-primary font-semibold hover:underline">
            View all
          </button>
        </div>
        <div className="space-y-2">
          {recentActivity.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0">
                  {item.user
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)}
                </div>
                <div>
                  <p className="text-[13px] font-medium text-foreground">{item.user}</p>
                  <p className="text-[12px] text-muted-foreground">{item.action}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${activityColors[item.type]}`}
                >
                  {item.type}
                </span>
                <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                  {item.time}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
