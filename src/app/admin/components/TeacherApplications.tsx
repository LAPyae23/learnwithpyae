'use client';
import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { formatMyDate } from '@/lib/jlpt';

type Status = 'pending' | 'approved' | 'rejected' | 'revoked';

interface Row {
  id: string;
  user: { id: string; name: string; email: string } | null;
  fullName: string;
  jlptLevel: string;
  experience: string;
  bio: string;
  contact: string;
  sampleUrl: string;
  status: Status;
  note: string;
  createdAt: string;
}

const TABS: [Status, string][] = [
  ['pending', 'စစ်ရန်'],
  ['approved', 'ဆရာများ'],
  ['rejected', 'ငြင်းထား'],
  ['revoked', 'ရပ်ဆိုင်း'],
];

/** Admin: review teacher applications; approve, reject, or revoke teachers. */
export default function TeacherApplications() {
  const [status, setStatus] = useState<Status>('pending');
  const [rows, setRows] = useState<Row[] | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(() => {
    setRows(null);
    api<{ applications: Row[] }>(`/api/admin/teachers?status=${status}`)
      .then((r) => setRows(r.applications))
      .catch((e) => {
        toast.error(e.message);
        setRows([]);
      });
  }, [status]);
  useEffect(load, [load]);

  async function act(id: string, action: 'approve' | 'reject' | 'revoke') {
    if (
      action === 'revoke' &&
      !window.confirm('ဒီဆရာကို ရပ်ဆိုင်းမလား? သူ့ သင်ခန်းစာတွေ မူကြမ်း ပြန်ဖြစ်သွားပါမယ်။')
    )
      return;
    setBusy(id);
    try {
      await api(`/api/admin/teachers/${id}`, {
        method: 'POST',
        json: { action, note: notes[id] ?? '' },
      });
      toast.success(
        action === 'approve'
          ? 'ဆရာ အဖြစ် အတည်ပြုပြီးပါပြီ'
          : action === 'reject'
            ? 'ငြင်းပယ်ပြီးပါပြီ'
            : 'ရပ်ဆိုင်းပြီးပါပြီ'
      );
      load();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex gap-2">
        {TABS.map(([id, label]) => (
          <button
            key={id}
            onClick={() => setStatus(id)}
            className={`px-3.5 py-1.5 rounded-full border text-[13px] ${
              status === id
                ? 'bg-primary text-white border-primary'
                : 'border-border text-muted-foreground'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {rows === null ? (
        <div className="h-40 rounded-2xl bg-muted animate-pulse" />
      ) : rows.length === 0 ? (
        <p className="bg-card border border-border rounded-2xl p-6 text-center text-[13.5px] text-muted-foreground">
          {status === 'pending' ? 'လျှောက်လွှာ အသစ် မရှိပါ' : 'မရှိပါ'}
        </p>
      ) : (
        rows.map((r) => (
          <div key={r.id} className="bg-card border border-border rounded-2xl p-5 space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-bold text-[15px]">
                  {r.fullName}{' '}
                  <span className="text-[12px] font-semibold px-2 py-0.5 rounded-full bg-secondary text-primary">
                    {r.jlptLevel === 'none' ? 'JLPT မရှိ' : `JLPT ${r.jlptLevel}`}
                  </span>
                </p>
                <p className="text-[12.5px] text-muted-foreground">
                  {r.user?.email ?? 'deleted user'} · {r.contact} ·{' '}
                  {formatMyDate(new Date(r.createdAt))}
                </p>
              </div>
            </div>
            {r.experience && (
              <p className="text-[13.5px]">
                <b>အတွေ့အကြုံ:</b> {r.experience}
              </p>
            )}
            {r.bio && (
              <p className="text-[13.5px]">
                <b>ကိုယ့်အကြောင်း:</b> {r.bio}
              </p>
            )}
            {r.sampleUrl && /^https?:\/\//.test(r.sampleUrl) && (
              <a
                href={r.sampleUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[13px] text-primary underline break-all"
              >
                🎬 နမူနာ: {r.sampleUrl}
              </a>
            )}
            {r.note && <p className="text-[12.5px] text-muted-foreground">မှတ်ချက်: {r.note}</p>}

            {(status === 'pending' || status === 'approved' || status === 'rejected') && (
              <div className="flex flex-wrap gap-2 items-center pt-1">
                <input
                  value={notes[r.id] ?? ''}
                  onChange={(e) => setNotes({ ...notes, [r.id]: e.target.value })}
                  maxLength={300}
                  placeholder="မှတ်ချက် (ရွေးချယ်နိုင်)"
                  className="flex-1 min-w-[180px] h-9 px-3 rounded-lg border border-border bg-background text-[13px]"
                />
                {status !== 'approved' && (
                  <button
                    disabled={busy === r.id}
                    onClick={() => act(r.id, 'approve')}
                    className="px-4 h-9 rounded-lg bg-primary text-white text-[13px] font-semibold disabled:opacity-40"
                  >
                    ✓ အတည်ပြု
                  </button>
                )}
                {status === 'pending' && (
                  <button
                    disabled={busy === r.id}
                    onClick={() => act(r.id, 'reject')}
                    className="px-4 h-9 rounded-lg border border-border text-[13px] disabled:opacity-40"
                  >
                    ငြင်းမယ်
                  </button>
                )}
                {status === 'approved' && (
                  <button
                    disabled={busy === r.id}
                    onClick={() => act(r.id, 'revoke')}
                    className="px-4 h-9 rounded-lg text-danger text-[13px] hover:bg-danger-bg disabled:opacity-40"
                  >
                    ရပ်ဆိုင်းမယ်
                  </button>
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
