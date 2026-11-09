'use client';
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import Icon from '@/components/ui/AppIcon';

const studyData = [
  { id: 'study-mon', day: 'တနင်္လာ', minutes: 45, date: 'Jul 6' },
  { id: 'study-tue', day: 'အင်္ဂါ', minutes: 30, date: 'Jul 7' },
  { id: 'study-wed', day: 'ဗုဒ္ဓ', minutes: 72, date: 'Jul 8' },
  { id: 'study-thu', day: 'ကြာ', minutes: 15, date: 'Jul 9' },
  { id: 'study-fri', day: 'သောကြာ', minutes: 58, date: 'Jul 10' },
  { id: 'study-sat', day: 'စနေ', minutes: 90, date: 'Jul 11' },
  { id: 'study-sun', day: 'နွေ', minutes: 24, date: 'Jul 12' },
];

interface TooltipPayload {
  value: number;
  name: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const mins = payload[0]?.value ?? 0;
  return (
    <div className="bg-card border border-border rounded-xl shadow-modal px-4 py-3 text-[13px]">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      <p className="text-muted-foreground">
        <span className="font-semibold text-foreground">{mins} မိနစ်</span>
      </p>
      {mins >= 51 ? (
        <p className="text-success text-[11px] mt-0.5 flex items-center gap-1">
          <Icon name="CheckCircleIcon" size={11} className="text-success" /> နေ့စဉ် ပန်းတိုင်
          ပြည့်ပြီ
        </p>
      ) : (
        <p className="text-warning text-[11px] mt-0.5">ပန်းတိုင်အထိ {51 - mins} မိနစ် လိုသေး</p>
      )}
    </div>
  );
}

export default function StudyTimeChart() {
  const totalMins = studyData.reduce((acc, d) => acc + d.minutes, 0);
  const goalMins = 6 * 60;

  return (
    <div className="bg-card border border-border rounded-2xl shadow-card p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-bold text-[15px] text-foreground">နေ့စဉ် လေ့လာချိန်</h3>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            ဒီအပတ် · ပန်းတိုင် တစ်နေ့ ၅၁ မိနစ်
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="text-[18px] font-bold text-foreground tabular-nums leading-tight">
              {Math.floor(totalMins / 60)} နာရီ {totalMins % 60} မိနစ်
            </p>
            <p className="text-[11px] text-muted-foreground">
              ပန်းတိုင် {Math.floor(goalMins / 60)} နာရီ
            </p>
          </div>
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[12px] font-semibold ${totalMins >= goalMins ? 'bg-success-bg text-success' : 'bg-warning-bg text-warning'}`}
          >
            <Icon
              name={totalMins >= goalMins ? 'CheckCircleIcon' : 'ExclamationTriangleIcon'}
              size={12}
            />
            {totalMins >= goalMins ? 'ပန်းတိုင်အတိုင်း' : 'နောက်ကျနေ'}
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={studyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barSize={28}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${v}`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--muted)', opacity: 0.5 }} />
          <ReferenceLine y={51} stroke="var(--warning)" strokeDasharray="4 4" strokeWidth={1.5} />
          <Bar dataKey="minutes" radius={[6, 6, 0, 0]} fill="var(--primary)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
