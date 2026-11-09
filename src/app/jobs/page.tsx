'use client';
import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import AppLayout from '@/components/AppLayout';
import { api } from '@/lib/api';
import { formatMyDate } from '@/lib/jlpt';

const FIELDS: [string, string][] = [
  ['kaigo', 'သူနာပြု / 介護'],
  ['food', 'စားသောက်ဆိုင် / 外食'],
  ['manufacturing', 'စက်ရုံ / 製造'],
  ['construction', 'ဆောက်လုပ်ရေး / 建設'],
  ['agriculture', 'စိုက်ပျိုးရေး / 農業'],
  ['hotel', 'ဟိုတယ် / 宿泊'],
  ['it', 'IT'],
  ['other', 'အခြား'],
];

interface Profile {
  visible: boolean;
  headline: string;
  fields: string[];
  jlptCertified: string;
  location: string;
  availableFrom: string;
  city: string;
  experience: string;
  education: string;
  phone: string;
  telegram: string;
}
interface Offer {
  id: string;
  jobTitle: string;
  message: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
  agency: {
    companyName: string;
    country: string;
    website: string;
    description: string;
    licenseNo: string;
    contactPerson: string | null;
    phone: string | null;
  } | null;
}

const field =
  'w-full px-3 py-2.5 rounded-xl border border-border bg-background text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/30';

export default function JobsPage() {
  const [p, setP] = useState<Profile | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    api<{ profile: Profile }>('/api/jobs/profile')
      .then((r) => setP(r.profile))
      .catch(() => {});
    api<{ offers: Offer[] }>('/api/jobs/offers')
      .then((r) => setOffers(r.offers))
      .catch(() => {});
  }, []);
  useEffect(load, [load]);

  async function save(visible = p!.visible) {
    setSaving(true);
    try {
      await api('/api/jobs/profile', { method: 'PUT', json: { ...p, visible } });
      setP({ ...p!, visible });
      toast.success(
        visible ? 'Profile ကို agency တွေ မြင်ရအောင် ဖွင့်ပြီးပါပြီ' : 'သိမ်းပြီးပါပြီ'
      );
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function respond(id: string, action: 'accept' | 'decline') {
    try {
      await api('/api/jobs/offers', { method: 'POST', json: { id, action } });
      toast.success(action === 'accept' ? 'ဆက်သွယ်ခွင့် ပြုလိုက်ပါပြီ' : 'ငြင်းလိုက်ပါပြီ');
      load();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  return (
    <AppLayout activePath="/jobs">
      <div className="max-w-4xl mx-auto space-y-5">
        <div className="bg-gradient-to-r from-red-500 to-rose-400 text-white rounded-2xl p-5">
          <h1 className="text-[22px] font-bold">🇯🇵 ဂျပန်မှာ အလုပ်အကိုင်</h1>
          <p className="text-[13.5px] mt-1 text-white/90">
            Profile ဖွင့်ထားရင် admin စစ်ဆေးထားတဲ့ agency / အလုပ်ရှင်တွေက သင့် ဂျပန်စာ အဆင့်၊ Mock
            test အမှတ်၊ စာကြိုးစားမှုကို ကြည့်ပြီး ဆက်သွယ်လာပါမယ် — <b>အခမဲ့</b>ပါ။
          </p>
          <p className="text-[12px] mt-2 text-white/80">
            🔒 ဖုန်းနဲ့ Telegram ကို သင် &quot;လက်ခံမယ်&quot; နှိပ်ထားတဲ့ agency ကိုပဲ ပြပါတယ်။
            ဘယ်အချိန်မဆို ပြန်ပိတ်လို့ရပါတယ်။
          </p>
        </div>

        {offers.length > 0 && (
          <section className="space-y-3">
            <h2 className="font-bold text-[16px]">📨 Agency တွေဆီက စာများ</h2>
            {offers.map((o) => (
              <div key={o.id} className="bg-card border border-border rounded-2xl p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-[15px]">{o.jobTitle}</p>
                    <p className="text-[12.5px] text-muted-foreground">
                      {o.agency?.companyName} ·{' '}
                      {o.agency?.country === 'japan'
                        ? '🇯🇵 ဂျပန်'
                        : o.agency?.country === 'myanmar'
                          ? '🇲🇲 မြန်မာ'
                          : ''}
                      {o.agency?.licenseNo && ` · လိုင်စင် ${o.agency.licenseNo}`} ·{' '}
                      {formatMyDate(new Date(o.createdAt))}
                    </p>
                  </div>
                  <span
                    className={`text-[11.5px] font-semibold px-2.5 py-1 rounded-full ${
                      o.status === 'accepted'
                        ? 'bg-success-bg text-success'
                        : o.status === 'declined'
                          ? 'bg-muted text-muted-foreground'
                          : 'bg-warning-bg text-warning'
                    }`}
                  >
                    {o.status === 'accepted'
                      ? 'လက်ခံပြီး'
                      : o.status === 'declined'
                        ? 'ငြင်းပြီး'
                        : 'အသစ်'}
                  </span>
                </div>
                <p className="text-[13.5px] mt-2 whitespace-pre-wrap">{o.message}</p>
                {o.agency?.website && /^https?:\/\//.test(o.agency.website) && (
                  <a
                    href={o.agency.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[12.5px] text-primary underline break-all"
                  >
                    {o.agency.website}
                  </a>
                )}
                {o.status === 'accepted' && o.agency?.phone && (
                  <p className="text-[13px] mt-2 bg-secondary/60 rounded-lg px-3 py-2">
                    📞 {o.agency.contactPerson}: <b>{o.agency.phone}</b>
                  </p>
                )}
                {o.status === 'pending' && (
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => respond(o.id, 'accept')}
                      className="px-4 py-2 rounded-xl bg-primary text-white text-[13px] font-semibold"
                    >
                      ✓ လက်ခံမယ် (ဆက်သွယ်ခွင့် ပေးမယ်)
                    </button>
                    <button
                      onClick={() => respond(o.id, 'decline')}
                      className="px-4 py-2 rounded-xl border border-border text-[13px]"
                    >
                      ငြင်းမယ်
                    </button>
                  </div>
                )}
                <p className="text-[11px] text-muted-foreground mt-2">
                  ⚠️ အလုပ်အတွက် ပိုက်ဆံ ကြိုတောင်းရင် သတိထားပါ — သံသယ ရှိရင် admin ကို
                  အကြောင်းကြားပါ။
                </p>
              </div>
            ))}
          </section>
        )}

        {!p ? (
          <div className="h-64 rounded-2xl bg-muted animate-pulse" />
        ) : (
          <section className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-bold text-[16px]">👤 ကျွန်ုပ်၏ အလုပ်ရှာ Profile</h2>
              <span
                className={`text-[12px] font-semibold px-2.5 py-1 rounded-full ${p.visible ? 'bg-success-bg text-success' : 'bg-muted text-muted-foreground'}`}
              >
                {p.visible ? '🟢 Agency တွေ မြင်နေရတယ်' : '⚪ ပိတ်ထားတယ်'}
              </span>
            </div>
            <input
              className={field}
              value={p.headline}
              maxLength={120}
              onChange={(e) => setP({ ...p, headline: e.target.value })}
              placeholder="တစ်ကြောင်း မိတ်ဆက် — ဥပမာ: N4 အောင်ထားပြီး 介護 အလုပ် ရှာနေပါတယ်"
            />
            <div>
              <p className="text-[13px] font-semibold mb-1.5">စိတ်ဝင်စားတဲ့ အလုပ်</p>
              <div className="flex flex-wrap gap-2">
                {FIELDS.map(([id, label]) => {
                  const on = p.fields.includes(id);
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() =>
                        setP({
                          ...p,
                          fields: on ? p.fields.filter((f) => f !== id) : [...p.fields, id],
                        })
                      }
                      className={`px-3 py-1.5 rounded-full border text-[12.5px] ${on ? 'bg-primary text-white border-primary' : 'border-border'}`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              <label className="text-[12.5px] font-semibold">
                JLPT အောင်လက်မှတ်
                <select
                  className={`${field} mt-1`}
                  value={p.jlptCertified}
                  onChange={(e) => setP({ ...p, jlptCertified: e.target.value })}
                >
                  {['N1', 'N2', 'N3', 'N4', 'N5'].map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                  <option value="none">မရှိသေး</option>
                </select>
              </label>
              <label className="text-[12.5px] font-semibold">
                အလုပ်လုပ်ချင်တဲ့ နေရာ
                <select
                  className={`${field} mt-1`}
                  value={p.location}
                  onChange={(e) => setP({ ...p, location: e.target.value })}
                >
                  <option value="japan">ဂျပန်</option>
                  <option value="myanmar">မြန်မာ (ဂျပန် ကုမ္ပဏီ)</option>
                  <option value="any">နှစ်ခုလုံး</option>
                </select>
              </label>
              <label className="text-[12.5px] font-semibold">
                စတင်နိုင်မယ့် လ
                <input
                  type="month"
                  className={`${field} mt-1`}
                  value={p.availableFrom}
                  onChange={(e) => setP({ ...p, availableFrom: e.target.value })}
                />
              </label>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <input
                className={field}
                value={p.city}
                maxLength={60}
                onChange={(e) => setP({ ...p, city: e.target.value })}
                placeholder="မြို့ — ဥပမာ: ရန်ကုန်"
              />
              <input
                className={field}
                value={p.education}
                maxLength={200}
                onChange={(e) => setP({ ...p, education: e.target.value })}
                placeholder="ပညာအရည်အချင်း"
              />
            </div>
            <textarea
              className={`${field} min-h-[90px]`}
              value={p.experience}
              maxLength={800}
              onChange={(e) => setP({ ...p, experience: e.target.value })}
              placeholder="အလုပ် အတွေ့အကြုံ"
            />
            <div className="grid sm:grid-cols-2 gap-3">
              <input
                className={field}
                value={p.phone}
                maxLength={40}
                onChange={(e) => setP({ ...p, phone: e.target.value })}
                placeholder="📞 ဖုန်း (လက်ခံတဲ့ agency ကိုပဲ ပြမယ်)"
              />
              <input
                className={field}
                value={p.telegram}
                maxLength={60}
                onChange={(e) => setP({ ...p, telegram: e.target.value })}
                placeholder="✈️ Telegram @username (လက်ခံတဲ့ agency ကိုပဲ ပြမယ်)"
              />
            </div>
            <p className="text-[12px] text-muted-foreground">
              Agency တွေက သင့် Mock test အကောင်းဆုံး အမှတ်၊ streak နဲ့ ပြီးခဲ့တဲ့ ရက် ၃၀ မှာ
              လေ့လာခဲ့တဲ့ ရက်ကိုလည်း မြင်ရပါမယ် — စာကြိုးစားလေ ရွေးခံရဖို့ များလေပါ 💪{' '}
              <Link href="/exam" className="text-primary font-semibold">
                Mock test ဖြေမယ်
              </Link>
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => save()}
                disabled={saving}
                className="px-5 py-2.5 rounded-xl border border-border font-semibold text-[14px] disabled:opacity-40"
              >
                သိမ်းမယ်
              </button>
              <button
                onClick={() => save(!p.visible)}
                disabled={saving}
                className={`px-5 py-2.5 rounded-xl font-bold text-[14px] disabled:opacity-40 ${p.visible ? 'bg-muted' : 'bg-primary text-white'}`}
              >
                {p.visible ? 'Profile ပိတ်မယ်' : '🟢 Agency တွေ မြင်ရအောင် ဖွင့်မယ်'}
              </button>
            </div>
          </section>
        )}

        <p className="text-center text-[12.5px] text-muted-foreground">
          Agency / အလုပ်ရှင်လား?{' '}
          <Link href="/agency" className="text-primary font-semibold">
            ဒီမှာ စာရင်းသွင်းပါ →
          </Link>
        </p>
      </div>
    </AppLayout>
  );
}
