'use client';
import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import Icon from '@/components/ui/AppIcon';

const retentionData = [
  { id: 'ret-d1', day: 'ရက် ၁', retention: 74, reviewed: 32 },
  { id: 'ret-d2', day: 'ရက် ၂', retention: 71, reviewed: 18 },
  { id: 'ret-d3', day: 'ရက် ၃', retention: 76, reviewed: 45 },
  { id: 'ret-d4', day: 'ရက် ၄', retention: 73, reviewed: 28 },
  { id: 'ret-d5', day: 'ရက် ၅', retention: 78, reviewed: 52 },
  { id: 'ret-d6', day: 'ရက် ၆', retention: 75, reviewed: 20 },
  { id: 'ret-d7', day: 'ရက် ၇', retention: 80, reviewed: 38 },
  { id: 'ret-d8', day: 'ရက် ၈', retention: 77, reviewed: 30 },
  { id: 'ret-d9', day: 'ရက် ၉', retention: 82, reviewed: 44 },
  { id: 'ret-d10', day: 'ရက် ၁၀', retention: 79, reviewed: 36 },
  { id: 'ret-d11', day: 'ရက် ၁၁', retention: 84, reviewed: 55 },
  { id: 'ret-d12', day: 'ရက် ၁၂', retention: 81, reviewed: 40 },
  { id: 'ret-d13', day: 'ရက် ၁၃', retention: 83, reviewed: 48 },
  { id: 'ret-d14', day: 'ဒီနေ့', retention: 83, reviewed: 24 },
];

interface TooltipPayload {
  value: number;
  name: string;
  dataKey: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="bg-card border border-border rounded-xl shadow-modal px-4 py-3 text-[13px]">
      <p className="font-semibold text-foreground mb-1.5">{label}</p>
      {payload.map((p, i) => (
        <p key={`tooltip-ret-${i}`} className="text-muted-foreground">
          <span className="font-semibold text-primary">{p.value}%</span> မှတ်မိနှုန်း
        </p>
      ))}
    </div>
  );
}

export default function VocabRetentionChart() {
  return (
    <div className="bg-card border border-border rounded-2xl shadow-card p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
        <div>
          <h3 className="font-bold text-[15px] text-foreground">ဝေါဟာရ မှတ်မိနှုန်း</h3>
          <p className="text-[13px] text-muted-foreground mt-0.5">ပြီးခဲ့သည့် ၁၄ ရက်</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-primary" />
            <span className="text-[12px] text-muted-foreground">မှတ်မိနှုန်း %</span>
          </div>
          <div className="flex items-center gap-1.5 bg-success-bg border border-green-200 rounded-lg px-2.5 py-1">
            <Icon name="ArrowTrendingUpIcon" size={12} className="text-success" />
            <span className="text-[12px] font-semibold text-success">ဒီအပတ် +9%</span>
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={retentionData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="retentionGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2} />
              <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            tickLine={false}
            axisLine={false}
            interval={3}
          />
          <YAxis
            domain={[65, 90]}
            tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="retention"
            stroke="var(--primary)"
            strokeWidth={2.5}
            fill="url(#retentionGradient)"
            dot={false}
            activeDot={{ r: 5, fill: 'var(--primary)', strokeWidth: 2, stroke: 'var(--card)' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
