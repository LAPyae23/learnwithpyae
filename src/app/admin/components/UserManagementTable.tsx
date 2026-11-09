'use client';
import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { formatMyDate } from '@/lib/jlpt';
import { PLANS, type PlanId } from '@/data/payment';
import { useCurrentUser } from '@/components/useCurrentUser';

type Role = 'student' | 'teacher' | 'admin';

interface Row {
  id: string;
  name: string;
  email: string;
  role: Role;
  targetLevel: string | null;
  plan: { type: string; expiresAt: string | null; active: boolean };
  streak: number;
  lastStudyDay: string | null;
  telegram: boolean;
  createdAt: string;
}

const ROLE_LABEL: Record<Role, string> = { student: 'ကျောင်းသား', teacher: 'ဆရာ', admin: 'Admin' };
const ROLE_CLS: Record<Role, string> = {
  student: 'bg-muted text-muted-foreground',
  teacher: 'bg-secondary text-primary',
  admin: 'bg-warning-bg text-warning',
};

const control =
  'h-9 px-3 rounded-lg border border-border bg-background text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/30';

/** Admin: search users, change roles, grant or remove premium. */
export default function UserManagementTable({ onChanged }: { onChanged?: () => void }) {
  const { user: me } = useCurrentUser();
  const [q, setQ] = useState('');
  const [query, setQuery] = useState('');
  const [role, setRole] = useState<'' | Role>('');
  const [plan, setPlan] = useState<'' | 'premium' | 'free'>('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<{ total: number; pages: number; users: Row[] } | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [grant, setGrant] = useState<{ plan: PlanId; days: number }>({ plan: 'monthly', days: 30 });

  // Debounce the search box
  useEffect(() => {
    const t = setTimeout(() => {
      setQuery(q.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [q]);

  const load = useCallback(() => {
    const p = new URLSearchParams({ page: String(page) });
    if (query) p.set('q', query);
    if (role) p.set('role', role);
    if (plan) p.set('plan', plan);
    api<{ total: number; pages: number; users: Row[] }>(`/api/admin/users?${p}`)
      .then(setData)
      .catch((e) => toast.error(e.message));
  }, [page, query, role, plan]);
  useEffect(load, [load]);

  async function patch(id: string, body: object, msg: string) {
    setBusy(true);
    try {
      await api(`/api/admin/users/${id}`, { method: 'PATCH', json: body });
      toast.success(msg);
      load();
      onChanged?.();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="🔍 အမည် ဒါမှမဟုတ် email နဲ့ ရှာပါ"
          className={`${control} flex-1 min-w-[220px]`}
        />
        <select
          className={control}
          value={role}
          onChange={(e) => {
            setRole(e.target.value as '' | Role);
            setPage(1);
          }}
        >
          <option value="">Role အားလုံး</option>
          <option value="student">ကျောင်းသား</option>
          <option value="teacher">ဆရာ</option>
          <option value="admin">Admin</option>
        </select>
        <select
          className={control}
          value={plan}
          onChange={(e) => {
            setPlan(e.target.value as '' | 'premium' | 'free');
            setPage(1);
          }}
        >
          <option value="">Plan အားလုံး</option>
          <option value="premium">Premium</option>
          <option value="free">Free</option>
        </select>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-5 py-2.5 border-b border-border text-[12.5px] text-muted-foreground">
          {data ? `${data.total} ယောက်` : '…'}
        </div>
        {!data ? (
          <div className="h-48 bg-muted animate-pulse" />
        ) : data.users.length === 0 ? (
          <p className="px-5 py-6 text-center text-[13px] text-muted-foreground">မတွေ့ပါ</p>
        ) : (
          <div className="divide-y divide-border">
            {data.users.map((u) => {
              const isMe = me?.id === u.id;
              return (
                <div key={u.id}>
                  <button
                    onClick={() => setOpen(open === u.id ? null : u.id)}
                    className="w-full px-5 py-3 flex items-center gap-3 text-left hover:bg-muted/40"
                  >
                    <span className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold text-[14px] flex-shrink-0">
                      {Array.from(u.name.trim())[0] ?? '?'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[14px] truncate">
                        {u.name}{' '}
                        {isMe && (
                          <span className="text-[11px] text-muted-foreground">(ကျွန်ုပ်)</span>
                        )}
                      </p>
                      <p className="text-[12px] text-muted-foreground truncate">{u.email}</p>
                    </div>
                    <div className="hidden sm:flex items-center gap-3 text-[12px] text-muted-foreground">
                      {u.targetLevel && <span>{u.targetLevel}</span>}
                      {u.streak > 0 && <span>🔥{u.streak}</span>}
                      {u.telegram && <span title="Telegram ချိတ်ထား">✈️</span>}
                    </div>
                    {u.plan.active && (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-success-bg text-success">
                        ⭐ Premium
                      </span>
                    )}
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${ROLE_CLS[u.role]}`}
                    >
                      {ROLE_LABEL[u.role]}
                    </span>
                  </button>

                  {open === u.id && (
                    <div className="px-5 pb-4 pt-1 bg-muted/30 space-y-3 text-[13px]">
                      <p className="text-muted-foreground text-[12.5px]">
                        စာရင်းသွင်း {formatMyDate(new Date(u.createdAt))}
                        {u.lastStudyDay && ` · နောက်ဆုံး လေ့လာ ${u.lastStudyDay}`}
                        {u.plan.active &&
                          u.plan.expiresAt &&
                          ` · ${PLANS[u.plan.type as PlanId]?.name ?? u.plan.type} ${formatMyDate(new Date(u.plan.expiresAt))} အထိ`}
                      </p>

                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold w-16">Role</span>
                        {(['student', 'teacher', 'admin'] as Role[]).map((r) => (
                          <button
                            key={r}
                            disabled={busy || u.role === r || (isMe && r !== 'admin')}
                            onClick={() => {
                              if (
                                r === 'admin' &&
                                !window.confirm(
                                  `${u.name} ကို Admin ပေးမှာ သေချာလား? Admin က အကုန် ပြင်လို့ရပါတယ်။`
                                )
                              )
                                return;
                              patch(u.id, { role: r }, `${ROLE_LABEL[r]} အဖြစ် ပြောင်းပြီးပါပြီ`);
                            }}
                            className={`px-3 h-8 rounded-lg border text-[12.5px] disabled:opacity-40 ${
                              u.role === r
                                ? 'bg-primary text-white border-primary'
                                : 'border-border bg-background'
                            }`}
                          >
                            {ROLE_LABEL[r]}
                          </button>
                        ))}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold w-16">Premium</span>
                        <select
                          className={control}
                          value={grant.plan}
                          onChange={(e) => {
                            const p = e.target.value as PlanId;
                            setGrant({ plan: p, days: PLANS[p].days });
                          }}
                        >
                          {(Object.keys(PLANS) as PlanId[]).map((p) => (
                            <option key={p} value={p}>
                              {PLANS[p].name}
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          min={1}
                          max={3650}
                          value={grant.days}
                          onChange={(e) =>
                            setGrant({ ...grant, days: Number(e.target.value) || 1 })
                          }
                          className={`${control} w-20`}
                        />
                        <span className="text-muted-foreground">ရက်</span>
                        <button
                          disabled={busy}
                          onClick={() =>
                            patch(
                              u.id,
                              { premium: grant },
                              `Premium ${grant.days} ရက် ပေးပြီးပါပြီ`
                            )
                          }
                          className="px-3 h-8 rounded-lg bg-primary text-white text-[12.5px] font-semibold disabled:opacity-40"
                        >
                          {u.plan.active ? '+ သက်တမ်းတိုး' : 'ပေးမယ်'}
                        </button>
                        {u.plan.active && (
                          <button
                            disabled={busy}
                            onClick={() => {
                              if (window.confirm(`${u.name} ရဲ့ Premium ကို ဖြုတ်မလား?`))
                                patch(
                                  u.id,
                                  { premium: { plan: 'monthly', days: 0 } },
                                  'Premium ဖြုတ်ပြီးပါပြီ'
                                );
                            }}
                            className="px-3 h-8 rounded-lg text-danger text-[12.5px] hover:bg-danger-bg disabled:opacity-40"
                          >
                            ဖြုတ်မယ်
                          </button>
                        )}
                      </div>
                      {u.role === 'admin' && !isMe && (
                        <p className="text-[11.5px] text-muted-foreground">
                          Admin အသစ်က logout ထွက်ပြီး ပြန်ဝင်မှ Admin page ပွင့်ပါမယ်။
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        {data && data.pages > 1 && (
          <div className="px-5 py-3 border-t border-border flex items-center justify-between text-[13px]">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="disabled:opacity-40"
            >
              ← ရှေ့
            </button>
            <span className="text-muted-foreground">
              {page} / {data.pages}
            </span>
            <button
              disabled={page >= data.pages}
              onClick={() => setPage(page + 1)}
              className="disabled:opacity-40"
            >
              နောက် →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
