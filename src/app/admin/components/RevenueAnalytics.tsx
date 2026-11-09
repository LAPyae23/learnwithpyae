'use client';
import React from 'react';
import { PLANS, formatKs, type PlanId } from '@/data/payment';
import { formatMyDate } from '@/lib/jlpt';
import { bars, type AdminStats } from './adminStats';

const MONTHS_MY = ['ဇန်', 'ဖေ', 'မတ်', 'ဧ', 'မေ', 'ဇွန်', 'ဇူ', 'ဩ', 'စက်', 'အောက်', 'နို', 'ဒီ'];

function Total({
  label,
  total,
  count,
  sub,
}: {
  label: string;
  total: number;
  count: number;
  sub?: string;
}) {
  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      <p className="text-[12px] text-muted-foreground">{label}</p>
      <p className="text-[22px] font-bold tabular-nums mt-1">{formatKs(total)}</p>
      <p className="text-[11.5px] text-muted-foreground">
        ငွေပေးချေမှု {count} ခု{sub ? ` · ${sub}` : ''}
      </p>
    </div>
  );
}

/** Revenue from approved payments only. */
export default function RevenueAnalytics({
  stats,
  error,
}: {
  stats: AdminStats | null;
  error: string;
}) {
  if (error) return <p className="text-danger text-sm">{error}</p>;
  if (!stats) return <div className="h-72 rounded-2xl bg-muted animate-pulse" />;
  const r = stats.revenue;
  const change =
    r.lastMonth.total > 0
      ? Math.round(((r.thisMonth.total - r.lastMonth.total) / r.lastMonth.total) * 100)
      : null;
  const monthBars = bars(r.byMonth, (m) => m.total);
  const methodBars = bars(r.byMethod, (m) => m.total);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Total
          label="ဒီလ"
          {...r.thisMonth}
          sub={change !== null ? `ပြီးခဲ့တဲ့လထက် ${change >= 0 ? '+' : ''}${change}%` : undefined}
        />
        <Total label="ပြီးခဲ့တဲ့လ" {...r.lastMonth} />
        <Total label="စုစုပေါင်း" {...r.allTime} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-5">
          <p className="font-bold text-[14px] mb-4">လအလိုက် ဝင်ငွေ (၆ လ)</p>
          <div className="flex items-end gap-3 h-44">
            {monthBars.map(({ item, pct }) => (
              <div
                key={item.month}
                className="flex-1 flex flex-col items-center justify-end h-full"
              >
                <span className="text-[10.5px] text-muted-foreground tabular-nums mb-1">
                  {item.total ? `${Math.round(item.total / 1000)}k` : ''}
                </span>
                <div
                  className="w-full bg-primary/80 rounded-t-md"
                  style={{ height: `${Math.max(pct, item.total ? 4 : 1)}%` }}
                  title={`${formatKs(item.total)} · ${item.count}`}
                />
                <span className="text-[11px] text-muted-foreground mt-1.5">
                  {MONTHS_MY[Number(item.month.slice(5, 7)) - 1]}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 space-y-5">
          <div>
            <p className="font-bold text-[14px] mb-3">Plan အလိုက်</p>
            {r.byPlan.length === 0 ? (
              <p className="text-[12.5px] text-muted-foreground">မရှိသေးပါ</p>
            ) : (
              <ul className="space-y-1.5 text-[13px]">
                {r.byPlan.map((p) => (
                  <li key={p.plan} className="flex justify-between">
                    <span>
                      {PLANS[p.plan as PlanId]?.name ?? p.plan}{' '}
                      <span className="text-muted-foreground">×{p.count}</span>
                    </span>
                    <span className="tabular-nums font-semibold">{formatKs(p.total)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <p className="font-bold text-[14px] mb-3">Wallet အလိုက်</p>
            {methodBars.length === 0 ? (
              <p className="text-[12.5px] text-muted-foreground">မရှိသေးပါ</p>
            ) : (
              <div className="space-y-2">
                {methodBars.map(({ item, pct }) => (
                  <div key={item.method} className="text-[12.5px]">
                    <div className="flex justify-between mb-0.5">
                      <span>{item.method}</span>
                      <span className="tabular-nums">{formatKs(item.total)}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <p className="px-5 py-3 border-b border-border font-bold text-[14px]">
          နောက်ဆုံး အတည်ပြုထားတဲ့ ငွေပေးချေမှု
        </p>
        {r.recent.length === 0 ? (
          <p className="px-5 py-4 text-[13px] text-muted-foreground">
            မရှိသေးပါ။ Payments tab မှာ အတည်ပြုလိုက်တဲ့ ငွေပေးချေမှုတွေ ဒီမှာ ပေါ်ပါမယ်။
          </p>
        ) : (
          <div className="divide-y divide-border">
            {r.recent.map((p) => (
              <div
                key={p.id}
                className="px-5 py-2.5 flex items-center justify-between gap-3 text-[13px]"
              >
                <div className="min-w-0">
                  <p className="font-semibold truncate">{p.user?.name ?? 'ဖျက်ထားသော user'}</p>
                  <p className="text-[11.5px] text-muted-foreground truncate">
                    {p.user?.email} · {PLANS[p.plan as PlanId]?.name ?? p.plan} · {p.method}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-semibold tabular-nums">{formatKs(p.amount)}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {p.at ? formatMyDate(new Date(p.at)) : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
