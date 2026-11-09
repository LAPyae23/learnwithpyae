'use client';
import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { formatKs } from '@/data/payment';
import { BOOKING_STATUS, fmtMm, mmLocalToIso } from '@/lib/classTime';

interface Settings {
  enabled: boolean;
  pricePerHour: number;
  about: string;
}
interface Slot {
  id: string;
  startAt: string;
  durationMin: number;
  price: number;
  status: 'open' | 'booked';
}
interface Booking {
  id: string;
  startAt: string;
  durationMin: number;
  price: number;
  topic: string;
  status: string;
  meetingLink: string;
  review: { stars: number; text: string } | null;
  student: { name: string } | null;
}

const field = 'h-9 px-3 rounded-lg border border-border bg-background text-[13.5px]';

/** Teacher: 1-on-1 settings, open times and bookings. */
export default function TutoringManager() {
  const [s, setS] = useState<Settings | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [open, setOpen] = useState(false);
  const [when, setWhen] = useState('');
  const [dur, setDur] = useState(60);
  const [links, setLinks] = useState<Record<string, string>>({});

  const load = useCallback(() => {
    api<Settings>('/api/teacher/tutoring')
      .then(setS)
      .catch(() => setS(null));
    api<{ slots: Slot[] }>('/api/tutoring/slots?mine=1')
      .then((r) => setSlots(r.slots))
      .catch(() => {});
    api<{ bookings: Booking[] }>('/api/tutoring/bookings?as=teacher')
      .then((r) => setBookings(r.bookings))
      .catch(() => {});
  }, []);
  useEffect(load, [load]);

  if (!s) return null;
  const upcoming = bookings.filter((b) => b.status === 'confirmed' || b.status === 'pending');

  async function saveSettings() {
    try {
      await api('/api/teacher/tutoring', { method: 'PUT', json: s });
      toast.success('သိမ်းပြီးပါပြီ');
    } catch (e) {
      toast.error((e as Error).message);
    }
  }
  async function addSlot() {
    if (!when) return toast.error('ရက်နဲ့ အချိန် ရွေးပါ');
    try {
      const r = await api<{ price: number }>('/api/tutoring/slots', {
        method: 'POST',
        json: { startAt: mmLocalToIso(when), durationMin: dur },
      });
      toast.success(`အချိန် ဖွင့်ပြီးပါပြီ (${formatKs(r.price)})`);
      setWhen('');
      load();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }
  async function removeSlot(id: string) {
    try {
      await api(`/api/tutoring/slots?id=${id}`, { method: 'DELETE' });
      load();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }
  async function act(id: string, body: object, msg: string) {
    try {
      await api(`/api/tutoring/bookings/${id}`, { method: 'POST', json: body });
      toast.success(msg);
      load();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-bold text-[14px]">📅 1-on-1 class</p>
          <p className="text-[12.5px] text-muted-foreground">
            {s.enabled
              ? `ဖွင့်ထားပါတယ် · တစ်နာရီ ${formatKs(s.pricePerHour)} · လာမယ့် class ${upcoming.length} ခု`
              : 'ကျောင်းသားတွေကို တစ်ယောက်ချင်း သင်ပြီး ဝင်ငွေ ရှာပါ'}
          </p>
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="px-3 py-1.5 rounded-lg bg-primary text-white text-[12.5px] font-semibold"
        >
          {open ? 'ပိတ်မယ်' : 'စီမံမယ်'}
        </button>
      </div>

      {open && (
        <div className="mt-4 space-y-5">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[13.5px] font-semibold">
              <input
                type="checkbox"
                checked={s.enabled}
                onChange={(e) => setS({ ...s, enabled: e.target.checked })}
              />
              1-on-1 class လက်ခံမယ်
            </label>
            <div className="flex flex-wrap items-center gap-2 text-[13px]">
              တစ်နာရီ ဈေး
              <input
                type="number"
                min={0}
                step={500}
                value={s.pricePerHour}
                onChange={(e) => setS({ ...s, pricePerHour: Number(e.target.value) || 0 })}
                className={`${field} w-28`}
              />
              Ks
            </div>
            <textarea
              value={s.about}
              onChange={(e) => setS({ ...s, about: e.target.value })}
              maxLength={600}
              placeholder="ဘာတွေ သင်ပေးမလဲ — ဥပမာ: N4 သဒ္ဒါ၊ အင်တာဗျူး လေ့ကျင့်ခန်း၊ စကားပြော"
              className="w-full min-h-[70px] px-3 py-2 rounded-xl border border-border bg-background text-[13.5px]"
            />
            <button
              onClick={saveSettings}
              className="px-4 py-1.5 rounded-lg bg-primary text-white text-[13px] font-semibold"
            >
              သိမ်းမယ်
            </button>
          </div>

          {s.enabled && (
            <div className="space-y-2">
              <p className="font-semibold text-[13.5px]">
                ➕ သင်ပေးနိုင်တဲ့ အချိန် ဖွင့်မယ် (မြန်မာစံတော်ချိန်)
              </p>
              <div className="flex flex-wrap gap-2">
                <input
                  type="datetime-local"
                  value={when}
                  onChange={(e) => setWhen(e.target.value)}
                  className={field}
                />
                <select
                  value={dur}
                  onChange={(e) => setDur(Number(e.target.value))}
                  className={field}
                >
                  {[30, 45, 60, 90].map((d) => (
                    <option key={d} value={d}>
                      {d} မိနစ်
                    </option>
                  ))}
                </select>
                <button
                  onClick={addSlot}
                  className="px-4 h-9 rounded-lg bg-primary text-white text-[13px] font-semibold"
                >
                  ဖွင့်မယ်
                </button>
              </div>
              {slots.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {slots.map((sl) => (
                    <span
                      key={sl.id}
                      className={`text-[12px] px-2.5 py-1 rounded-full border ${
                        sl.status === 'booked'
                          ? 'bg-secondary border-primary/30 text-primary'
                          : 'border-border'
                      }`}
                    >
                      {fmtMm(sl.startAt)} · {sl.durationMin}′ · {formatKs(sl.price)}
                      {sl.status === 'booked' ? ' · Book ပြီး' : ''}
                      {sl.status === 'open' && new Date(sl.startAt) > new Date() && (
                        <button
                          onClick={() => removeSlot(sl.id)}
                          className="ml-1.5 text-muted-foreground hover:text-danger"
                        >
                          ✕
                        </button>
                      )}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <p className="font-semibold text-[13.5px]">👩‍🎓 Booking များ</p>
            {bookings.length === 0 ? (
              <p className="text-[12.5px] text-muted-foreground">မရှိသေးပါ</p>
            ) : (
              bookings.map((b) => (
                <div
                  key={b.id}
                  className="border border-border rounded-xl p-3 text-[13px] space-y-1.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold">
                      {b.student?.name} · {fmtMm(b.startAt)} · {b.durationMin} မိနစ်
                    </p>
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${BOOKING_STATUS[b.status]?.cls}`}
                    >
                      {BOOKING_STATUS[b.status]?.text}
                    </span>
                  </div>
                  {b.topic && <p className="text-muted-foreground">📝 {b.topic}</p>}
                  {b.status === 'confirmed' && (
                    <div className="flex flex-wrap gap-2">
                      <input
                        value={links[b.id] ?? b.meetingLink}
                        onChange={(e) => setLinks({ ...links, [b.id]: e.target.value })}
                        placeholder="https://meet.google.com/… / Zoom / Telegram link"
                        className={`${field} flex-1 min-w-[200px]`}
                      />
                      <button
                        onClick={() =>
                          act(
                            b.id,
                            { action: 'link', meetingLink: links[b.id] ?? b.meetingLink },
                            'Link ပို့ပြီးပါပြီ'
                          )
                        }
                        className="px-3 h-9 rounded-lg border border-border text-[12.5px]"
                      >
                        Link ပို့မယ်
                      </button>
                      {new Date(b.startAt) < new Date() && (
                        <button
                          onClick={() =>
                            act(b.id, { action: 'complete' }, 'Class ပြီးကြောင်း မှတ်ပြီးပါပြီ')
                          }
                          className="px-3 h-9 rounded-lg bg-primary text-white text-[12.5px]"
                        >
                          ✓ ပြီးပြီ
                        </button>
                      )}
                    </div>
                  )}
                  {b.review && (
                    <p>
                      {'⭐'.repeat(b.review.stars)} {b.review.text}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
