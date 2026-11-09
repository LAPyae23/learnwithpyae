'use client';
import React, { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import AppLayout from '@/components/AppLayout';
import { api } from '@/lib/api';
import { compressImage } from '@/lib/compressImage';
import { fmtMm } from '@/lib/classTime';
import { formatKs, type AccountConfig, type SiteSettingsData } from '@/data/payment';

interface Slot {
  id: string;
  startAt: string;
  durationMin: number;
  price: number;
  available: boolean;
  teacher: { id: string; name: string };
}

export default function BookPage({ params }: { params: Promise<{ slotId: string }> }) {
  const { slotId } = use(params);
  const router = useRouter();
  const [slot, setSlot] = useState<Slot | null>(null);
  const [error, setError] = useState('');
  const [accounts, setAccounts] = useState<AccountConfig[]>([]);
  const [method, setMethod] = useState('');
  const [topic, setTopic] = useState('');
  const [txn, setTxn] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    api<{ slot: Slot }>(`/api/tutoring/slots?slot=${slotId}`)
      .then((r) => setSlot(r.slot))
      .catch((e) => setError(e.message));
    api<SiteSettingsData>('/api/settings')
      .then((s) => {
        setAccounts(s.accounts);
        if (s.accounts[0]) setMethod(s.accounts[0].method);
      })
      .catch(() => {});
  }, [slotId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return toast.error('ငွေလွှဲ screenshot ရွေးပါ');
    setSending(true);
    try {
      const form = new FormData();
      form.set('slotId', slotId);
      form.set('method', method);
      form.set('topic', topic);
      form.set('transactionId', txn);
      form.set('screenshot', await compressImage(file), 'payment.jpg');
      const res = await fetch('/api/tutoring/bookings', { method: 'POST', body: form });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Book လို့ မရပါ');
      toast.success('Book ပြီးပါပြီ! Admin ငွေစစ်ပြီးရင် အတည်ဖြစ်ပါမယ်');
      router.push('/classes');
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSending(false);
    }
  }

  const account = accounts.find((a) => a.method === method);

  return (
    <AppLayout activePath="/classes">
      <div className="max-w-xl mx-auto space-y-4">
        {error ? (
          <p className="text-center text-muted-foreground py-10">{error}</p>
        ) : !slot ? (
          <div className="h-64 rounded-2xl bg-muted animate-pulse" />
        ) : !slot.available ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground mb-3">ဒီအချိန်ကို တခြားသူ book ပြီးသွားပါပြီ</p>
            <Link href={`/teachers/${slot.teacher.id}`} className="text-primary font-semibold">
              တခြား အချိန် ရွေးမယ် →
            </Link>
          </div>
        ) : (
          <>
            <div className="bg-card border border-border rounded-2xl p-5">
              <p className="text-[12px] text-muted-foreground">1-on-1 class</p>
              <h1 className="text-[20px] font-bold">{slot.teacher.name}</h1>
              <p className="text-[14px] mt-1">
                📅 {fmtMm(slot.startAt)} · {slot.durationMin} မိနစ်
              </p>
              <p className="text-[22px] font-bold text-primary mt-2">{formatKs(slot.price)}</p>
            </div>
            <form
              onSubmit={submit}
              className="bg-card border border-border rounded-2xl p-5 space-y-4"
            >
              <label className="block text-[13px] font-semibold">
                ဘာလေ့လာချင်လဲ (ရွေးချယ်နိုင်)
                <input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  maxLength={300}
                  placeholder="ဥပမာ: N4 て形၊ အင်တာဗျူး လေ့ကျင့်ခန်း"
                  className="mt-1 w-full h-10 px-3 rounded-xl border border-border bg-background text-[14px]"
                />
              </label>
              <div>
                <p className="text-[13px] font-semibold mb-2">
                  ဒီအကောင့်ကို {formatKs(slot.price)} လွှဲပါ
                </p>
                <div className="flex flex-wrap gap-2 mb-2">
                  {accounts.map((a) => (
                    <button
                      type="button"
                      key={a.method}
                      onClick={() => setMethod(a.method)}
                      className={`px-3 py-1.5 rounded-full border text-[13px] ${
                        method === a.method
                          ? 'bg-primary text-white border-primary'
                          : 'border-border'
                      }`}
                    >
                      {a.method}
                    </button>
                  ))}
                </div>
                {account && (
                  <div className="bg-muted/50 rounded-xl p-3 text-[14px]">
                    <p className="font-bold tabular-nums text-[16px]">{account.number}</p>
                    <p>{account.name}</p>
                  </div>
                )}
              </div>
              <label className="block border-2 border-dashed border-border rounded-xl p-4 text-center cursor-pointer hover:border-primary/40">
                {preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={preview} alt="screenshot" className="max-h-56 mx-auto rounded-lg" />
                ) : (
                  <span className="text-[13px] text-muted-foreground">
                    📷 ငွေလွှဲ screenshot ရွေးပါ
                  </span>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0] ?? null;
                    setFile(f);
                    setPreview(f ? URL.createObjectURL(f) : null);
                  }}
                />
              </label>
              <input
                value={txn}
                onChange={(e) => setTxn(e.target.value)}
                maxLength={64}
                placeholder="Transaction ID (ရှိရင်)"
                className="w-full h-10 px-3 rounded-xl border border-border bg-background text-[14px]"
              />
              <button
                type="submit"
                disabled={sending || !file || !account}
                className="w-full py-3 rounded-xl bg-primary text-white font-bold text-[15px] disabled:opacity-40"
              >
                {sending ? 'တင်နေပါတယ်…' : 'Book မယ်'}
              </button>
              <p className="text-[12px] text-muted-foreground">
                Admin က ငွေစစ်ပြီး အတည်ပြုရင် ဆရာက meeting link (Zoom / Google Meet / Telegram)
                ပို့ပေးပါမယ်။
              </p>
            </form>
          </>
        )}
      </div>
    </AppLayout>
  );
}
