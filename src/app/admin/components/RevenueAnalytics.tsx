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
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const monthlyRevenue = [
  { month: 'Jan', revenue: 1600000, subscriptions: 3800 },
  { month: 'Feb', revenue: 1800000, subscriptions: 3950 },
  { month: 'Mar', revenue: 2000000, subscriptions: 4050 },
  { month: 'Apr', revenue: 1900000, subscriptions: 4100 },
  { month: 'May', revenue: 2200000, subscriptions: 4180 },
  { month: 'Jun', revenue: 2100000, subscriptions: 4220 },
  { month: 'Jul', revenue: 2400000, subscriptions: 4291 },
];

const planDistribution = [
  { name: 'Premium', value: 2140, color: '#f59e0b' },
  { name: 'Basic', value: 1560, color: '#3b82f6' },
  { name: 'Free', value: 9147, color: '#e2e8f0' },
];

const recentTransactions = [
  {
    id: 't1',
    user: 'Kenji Watanabe',
    plan: 'Premium',
    amount: '¥4,800',
    date: 'Jul 13, 2026',
    status: 'Paid',
  },
  {
    id: 't2',
    user: 'Ryo Yamamoto',
    plan: 'Basic',
    amount: '¥1,200',
    date: 'Jul 13, 2026',
    status: 'Paid',
  },
  {
    id: 't3',
    user: 'Aiko Sato',
    plan: 'Premium',
    amount: '¥4,800',
    date: 'Jul 12, 2026',
    status: 'Paid',
  },
  {
    id: 't4',
    user: 'Taro Suzuki',
    plan: 'Basic',
    amount: '¥1,200',
    date: 'Jul 12, 2026',
    status: 'Refunded',
  },
  {
    id: 't5',
    user: 'Mei Kobayashi',
    plan: 'Premium',
    amount: '¥4,800',
    date: 'Jul 11, 2026',
    status: 'Paid',
  },
];

const revenueKpis = [
  { label: 'MRR', value: '¥2.4M', change: '+12.3%', positive: true },
  { label: 'ARR', value: '¥28.8M', change: '+15.1%', positive: true },
  { label: 'Avg Revenue/User', value: '¥559', change: '+3.2%', positive: true },
  { label: 'Refund Rate', value: '0.8%', change: '-0.2%', positive: true },
];

export default function RevenueAnalytics() {
  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {revenueKpis.map((kpi, i) => (
          <div
            key={`rkpi-${i}`}
            className="bg-card border border-border rounded-2xl shadow-card p-5"
          >
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
              {kpi.label}
            </p>
            <p className="text-[28px] font-bold text-foreground tabular-nums leading-none">
              {kpi.value}
            </p>
            <div className="flex items-center gap-1 mt-2">
              <Icon
                name={kpi.positive ? 'ArrowTrendingUpIcon' : 'ArrowTrendingDownIcon'}
                size={13}
                className={kpi.positive ? 'text-success' : 'text-danger'}
              />
              <span
                className={`text-[12px] font-medium ${kpi.positive ? 'text-success' : 'text-danger'}`}
              >
                {kpi.change} vs last month
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Revenue Bar */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[14px] font-semibold text-foreground">Monthly Revenue</p>
              <p className="text-[12px] text-muted-foreground">Jan – Jul 2026 (¥)</p>
            </div>
            <button className="flex items-center gap-1 text-[12px] text-muted-foreground hover:text-foreground transition-colors">
              <Icon name="ArrowDownTrayIcon" size={14} />
              Export
            </button>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyRevenue} barSize={32}>
              <XAxis
                dataKey="month"
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
                formatter={(v: number) => [`¥${(v / 1000000).toFixed(1)}M`, 'Revenue']}
              />
              <Bar dataKey="revenue" fill="var(--primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Plan Distribution Pie */}
        <div className="bg-card border border-border rounded-2xl shadow-card p-5">
          <p className="text-[14px] font-semibold text-foreground mb-1">Plan Distribution</p>
          <p className="text-[12px] text-muted-foreground mb-4">Active subscribers</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={planDistribution}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                dataKey="value"
                paddingAngle={3}
              >
                {planDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {planDistribution.map((p) => (
              <div key={p.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
                  <span className="text-[12px] text-muted-foreground">{p.name}</span>
                </div>
                <span className="text-[12px] font-semibold text-foreground">
                  {p.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-card border border-border rounded-2xl shadow-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <p className="text-[14px] font-semibold text-foreground">Recent Transactions</p>
          <button className="text-[12px] text-primary font-semibold hover:underline">
            View all
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  User
                </th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Plan
                </th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Amount
                </th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Date
                </th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3 text-[13px] font-medium text-foreground">{tx.user}</td>
                  <td className="px-5 py-3 text-[13px] text-muted-foreground">{tx.plan}</td>
                  <td className="px-5 py-3 text-[13px] font-semibold text-foreground">
                    {tx.amount}
                  </td>
                  <td className="px-5 py-3 text-[12px] text-muted-foreground">{tx.date}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${tx.status === 'Paid' ? 'bg-success-bg text-success' : 'bg-danger-bg text-danger'}`}
                    >
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
