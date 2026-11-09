'use client';
import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api';

interface Status {
  enabled: boolean;
  linked: boolean;
  remindersOn: boolean;
}

export default function TelegramCard() {
  const [s, setS] = useState<Status | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    api<Status>('/api/telegram/link')
      .then(setS)
      .catch(() => setS(null));
  }, []);
  useEffect(load, [load]);

  async function connect() {
    setBusy(true);
    try {
      const { url } = await api<{ url: string }>('/api/telegram/link', { method: 'POST' });
      window.open(url, '_blank', 'noopener');
      toast.info('Telegram မှာ "Start" ကို နှိပ်ပါ၊ ပြီးရင် ဒီ page ကို refresh လုပ်ပါ');
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function patch(body: object) {
    setBusy(true);
    try {
      await api('/api/telegram/link', { method: 'PATCH', json: body });
      load();
    } finally {
      setBusy(false);
    }
  }

  if (!s) return null;

  return (
    <div className="bg-card border border-border rounded-2xl shadow-card p-6">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center text-[20px]">
          ✈️
        </div>
        <div>
          <h2 className="text-[15px] font-bold text-foreground">Telegram သတိပေးချက်</h2>
          <p className="text-[12px] text-muted-foreground">
            မနက်တိုင်း ၈ နာရီ — ပြန်လှန်ရမယ့် ကတ်၊ streak နဲ့ ဒီနေ့ စကားလုံး
          </p>
        </div>
      </div>

      {!s.enabled ? (
        <p className="text-[13px] text-muted-foreground">Telegram bot ကို မကြာမီ ဖွင့်ပေးပါမယ်။</p>
      ) : s.linked ? (
        <div className="space-y-3">
          <p className="text-[13px] text-success font-semibold">✅ ချိတ်ဆက်ပြီးပါပြီ</p>
          <div className="flex flex-wrap gap-2">
            <button
              disabled={busy}
              onClick={() => patch({ remindersOn: !s.remindersOn })}
              className="px-4 py-2 rounded-xl border border-border text-[13px] font-semibold"
            >
              {s.remindersOn ? '🔕 သတိပေးချက် ပိတ်မယ်' : '🔔 သတိပေးချက် ဖွင့်မယ်'}
            </button>
            <button
              disabled={busy}
              onClick={() => patch({ unlink: true })}
              className="px-4 py-2 rounded-xl border border-border text-[13px] text-danger"
            >
              ချိတ်ဆက်မှု ဖြုတ်မယ်
            </button>
          </div>
        </div>
      ) : (
        <button
          disabled={busy}
          onClick={connect}
          className="w-full py-2.5 rounded-xl bg-sky-500 text-white font-bold text-[14px] disabled:opacity-50"
        >
          Telegram ချိတ်မယ်
        </button>
      )}
    </div>
  );
}
