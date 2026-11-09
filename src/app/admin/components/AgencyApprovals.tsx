'use client';
import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { formatMyDate } from '@/lib/jlpt';

type Status = 'pending' | 'approved' | 'rejected' | 'suspended';
interface Row {
  id: string;
  user: { name: string; email: string } | null;
  companyName: string;
  licenseNo: string;
  country: string;
  contactPerson: string;
  phone: string;
  website: string;
  description: string;
  status: Status;
  activeUntil: string | null;
  note: string;
  contacts: number;
  accepted: number;
}

const TABS: [Status, string][] = [
  ['pending', 'စစ်ရန်'],
  ['approved', 'အသုံးပြုနေ'],
  ['suspended', 'ရပ်ဆိုင်း'],
  ['rejected', 'ငြင်းထား'],
];

/** Admin: verify agencies, give/extend paid access, suspend bad actors. */
export default function AgencyApprovals() {
  const [status, setStatus] = useState<Status>('pending');
  const [rows, setRows] = useState<Row[] | null>(null);
  const [days, setDays] = useState(30);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const load = useCallback(() => {
    setRows(null);
    api<{ agencies: Row[] }>(`/api/admin/agencies?status=${status}`)
      .then((r) => setRows(r.agencies))
      .catch((e) => {
        toast.error(e.message);
        setRows([]);
      });
  }, [status]);
  useEffect(load, [load]);

  async function act(id: string, action: 'approve' | 'reject' | 'suspend' | 'extend') {
    if (action === 'suspend' && !window.confirm('ဒီ agency ကို ရပ်ဆိုင်းမလား?')) return;
    try {
      await api('/api/admin/agencies', {
        method: 'POST',
        json: { id, action, days, note: notes[id] ?? '' },
      });
      toast.success('ပြီးပါပြီ');
      load();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  return (
    <div className="space-y-4 max-w-4xl">
      <p className="text-[13px] text-muted-foreground">
        Agency တွေက ပိုက်ဆံပေးပြီး ကျောင်းသား ရှာခွင့် ယူပါတယ် (ငွေကို တိုက်ရိုက် လက်ခံပြီး ဒီမှာ
        ရက် ထည့်ပေးပါ)။ လိုင်စင် စစ်ပြီးမှ အတည်ပြုပါ — ကျောင်းသားတွေကို လိမ်လည်တဲ့ agency ဆိုရင်
        ချက်ချင်း ရပ်ဆိုင်းပါ။
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {TABS.map(([s, label]) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`px-3.5 py-1.5 rounded-full border text-[13px] ${status === s ? 'bg-primary text-white border-primary' : 'border-border text-muted-foreground'}`}
          >
            {label}
          </button>
        ))}
        <label className="ml-auto text-[12.5px] flex items-center gap-1.5">
          ရက်
          <input
            type="number"
            min={1}
            max={3650}
            value={days}
            onChange={(e) => setDays(Number(e.target.value) || 30)}
            className="w-16 h-8 px-2 rounded-lg border border-border bg-background"
          />
        </label>
      </div>
      {rows === null ? (
        <div className="h-32 rounded-2xl bg-muted animate-pulse" />
      ) : rows.length === 0 ? (
        <p className="bg-card border border-border rounded-2xl p-6 text-center text-[13.5px] text-muted-foreground">
          မရှိပါ
        </p>
      ) : (
        rows.map((a) => (
          <div key={a.id} className="bg-card border border-border rounded-2xl p-4 space-y-2">
            <div className="flex flex-wrap justify-between gap-2">
              <div>
                <p className="font-bold text-[15px]">
                  {a.companyName}{' '}
                  <span className="text-[12px] font-normal text-muted-foreground">
                    ({a.country})
                  </span>
                </p>
                <p className="text-[12.5px] text-muted-foreground">
                  {a.contactPerson} · {a.phone} · {a.user?.email}
                  {a.licenseNo && ` · လိုင်စင် ${a.licenseNo}`}
                </p>
                {a.activeUntil && (
                  <p className="text-[12.5px]">⏳ {formatMyDate(new Date(a.activeUntil))} အထိ</p>
                )}
                <p className="text-[12px] text-muted-foreground">
                  စာပို့ {a.contacts} · လက်ခံခံရ {a.accepted}
                </p>
              </div>
            </div>
            {a.website && /^https?:\/\//.test(a.website) && (
              <a
                href={a.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[12.5px] text-primary underline break-all"
              >
                {a.website}
              </a>
            )}
            {a.description && <p className="text-[13px] whitespace-pre-wrap">{a.description}</p>}
            <div className="flex flex-wrap gap-2 items-center">
              <input
                value={notes[a.id] ?? ''}
                onChange={(e) => setNotes({ ...notes, [a.id]: e.target.value })}
                maxLength={300}
                placeholder="မှတ်ချက်"
                className="flex-1 min-w-[160px] h-9 px-3 rounded-lg border border-border bg-background text-[13px]"
              />
              {(a.status === 'pending' || a.status === 'suspended' || a.status === 'rejected') && (
                <button
                  onClick={() => act(a.id, 'approve')}
                  className="px-3 h-9 rounded-lg bg-primary text-white text-[12.5px] font-semibold"
                >
                  ✓ အတည်ပြု ({days} ရက်)
                </button>
              )}
              {a.status === 'approved' && (
                <button
                  onClick={() => act(a.id, 'extend')}
                  className="px-3 h-9 rounded-lg bg-primary text-white text-[12.5px] font-semibold"
                >
                  + {days} ရက် တိုး
                </button>
              )}
              {a.status === 'pending' && (
                <button
                  onClick={() => act(a.id, 'reject')}
                  className="px-3 h-9 rounded-lg border border-border text-[12.5px]"
                >
                  ငြင်းမယ်
                </button>
              )}
              {a.status === 'approved' && (
                <button
                  onClick={() => act(a.id, 'suspend')}
                  className="px-3 h-9 rounded-lg text-danger text-[12.5px] hover:bg-danger-bg"
                >
                  ရပ်ဆိုင်း
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
