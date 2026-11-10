'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import AppLayout from '@/components/AppLayout';
import { api } from '@/lib/api';
import { LangMultiPicker } from '@/components/LangPicker';

interface Application {
  fullName: string;
  jlptLevel: string;
  experience: string;
  bio: string;
  contact: string;
  sampleUrl: string;
  status: 'pending' | 'approved' | 'rejected' | 'revoked';
  note: string;
}

const field =
  'w-full px-3 py-2.5 rounded-xl border border-border bg-background text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/30';

const PERKS = [
  ['🎬', 'Video သင်ခန်းစာ တင်ပါ', 'YouTube link ထည့်ရုံပါပဲ။ Hosting မလိုပါဘူး။'],
  ['👩‍🎓', 'ကျောင်းသားတွေဆီ ရောက်ပါ', 'သင့်အမည်နဲ့ သင်ခန်းစာတွေ ပေါ်ပါမယ်။'],
  ['✅', 'Admin က စစ်ပေးပါတယ်', 'ထုတ်ဝေခင် အရည်အသွေး စစ်ပေးပါမယ်။'],
];

export default function TeachPage() {
  const [role, setRole] = useState<string | null>(null);
  const [app, setApp] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    languages: ['ja'] as string[],
    jlptLevel: 'N2',
    experience: '',
    bio: '',
    contact: '',
    sampleUrl: '',
  });

  useEffect(() => {
    api<{ role: string; application: Application | null }>('/api/teacher/apply')
      .then((r) => {
        setRole(r.role);
        setApp(r.application);
        if (r.application) {
          const { fullName, jlptLevel, experience, bio, contact, sampleUrl } = r.application;
          const languages = (r.application as { languages?: string[] }).languages ?? ['ja'];
          setForm({ fullName, languages, jlptLevel, experience, bio, contact, sampleUrl });
        }
      })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    try {
      const r = await api<{ application: Application }>('/api/teacher/apply', {
        method: 'POST',
        json: form,
      });
      setApp(r.application);
      setEditing(false);
      toast.success('လျှောက်လွှာ ပို့ပြီးပါပြီ! Admin က စစ်ပြီး အကြောင်းပြန်ပါမယ်');
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSending(false);
    }
  }

  const set =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm({ ...form, [k]: e.target.value });

  const showForm = role === 'student' && (!app || editing || app.status === 'rejected');

  return (
    <AppLayout activePath="/teach">
      <div className="max-w-2xl mx-auto space-y-5">
        <div>
          <h1 className="text-[22px] font-bold text-foreground">ဆရာ အဖြစ် ပါဝင်ရန်</h1>
          <p className="text-[13.5px] text-muted-foreground mt-1">
            ဂျပန်၊ တရုတ်၊ ကိုရီးယား၊ English — ဘာသာစကား သင်ပေးချင်ပါသလား? NihongoAcademy မှာ
            သင်ခန်းစာ တင်ပြီး မြန်မာ ကျောင်းသားတွေကို ကူညီပါ။
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-3">
          {PERKS.map(([icon, t, d]) => (
            <div key={t} className="bg-card border border-border rounded-2xl p-4">
              <div className="text-2xl mb-1">{icon}</div>
              <p className="font-semibold text-[13.5px]">{t}</p>
              <p className="text-[12px] text-muted-foreground mt-0.5">{d}</p>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="h-48 rounded-2xl bg-muted animate-pulse" />
        ) : role === 'teacher' || role === 'admin' ? (
          <div className="bg-success-bg border border-green-200 rounded-2xl p-5">
            <p className="font-bold text-[15px]">
              🎉 {role === 'admin' ? 'Admin' : 'ဆရာ'} အကောင့် ဖြစ်ပါတယ်
            </p>
            <Link
              href="/studio"
              className="inline-block mt-3 px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold"
            >
              သင်ခန်းစာ Studio ကို သွားမယ် →
            </Link>
          </div>
        ) : (
          <>
            {app && !editing && (
              <div
                className={`rounded-2xl p-5 border ${
                  app.status === 'pending'
                    ? 'bg-warning-bg border-yellow-200'
                    : app.status === 'rejected'
                      ? 'bg-danger-bg border-red-200'
                      : 'bg-muted border-border'
                }`}
              >
                <p className="font-bold text-[15px]">
                  {app.status === 'pending' && '⏳ လျှောက်လွှာ စစ်ဆေးဆဲ ဖြစ်ပါတယ်'}
                  {app.status === 'rejected' && 'လျှောက်လွှာကို အတည်မပြုနိုင်သေးပါ'}
                  {app.status === 'revoked' && 'ဆရာ အခွင့်အရေးကို ရပ်ဆိုင်းထားပါတယ်'}
                </p>
                {app.note && <p className="text-[13.5px] mt-1">Admin မှတ်ချက်: {app.note}</p>}
                {app.status === 'rejected' && (
                  <p className="text-[13px] mt-1">အောက်မှာ ပြင်ပြီး ပြန်လျှောက်လို့ရပါတယ်။</p>
                )}
                {app.status === 'revoked' && (
                  <p className="text-[13px] mt-1">Admin ကို တိုက်ရိုက် ဆက်သွယ်ပါ။</p>
                )}
              </div>
            )}

            {showForm && (
              <form
                onSubmit={submit}
                className="bg-card border border-border rounded-2xl p-5 space-y-4"
              >
                <label className="block text-[13px] font-semibold">
                  အမည် အပြည့်အစုံ *
                  <input
                    className={`${field} mt-1`}
                    value={form.fullName}
                    onChange={set('fullName')}
                    required
                    maxLength={80}
                  />
                </label>
                <div>
                  <p className="text-[13px] font-semibold mb-1.5">သင်ပေးမယ့် ဘာသာစကား *</p>
                  <LangMultiPicker
                    value={form.languages}
                    onChange={(languages) => setForm({ ...form, languages })}
                  />
                </div>
                <label className="block text-[13px] font-semibold">
                  ဂျပန်စာ အဆင့် (ဂျပန်စာ သင်ရင်)
                  <select
                    className={`${field} mt-1`}
                    value={form.jlptLevel}
                    onChange={set('jlptLevel')}
                  >
                    {['N1', 'N2', 'N3', 'N4', 'N5'].map((l) => (
                      <option key={l} value={l}>
                        JLPT {l}
                      </option>
                    ))}
                    <option value="none">JLPT မရှိ / ဂျပန်စာ မသင်ပါ</option>
                  </select>
                </label>
                <label className="block text-[13px] font-semibold">
                  သင်ကြားဖူးတဲ့ အတွေ့အကြုံ
                  <textarea
                    className={`${field} mt-1 min-h-[90px]`}
                    value={form.experience}
                    onChange={set('experience')}
                    maxLength={1000}
                    placeholder="ဥပမာ - ဂျပန်စာ သင်တန်းမှာ N5 ၂ နှစ် သင်ဖူးပါတယ်"
                  />
                </label>
                <label className="block text-[13px] font-semibold">
                  ကိုယ့်အကြောင်း အတိုချုပ်
                  <textarea
                    className={`${field} mt-1 min-h-[70px]`}
                    value={form.bio}
                    onChange={set('bio')}
                    maxLength={1000}
                  />
                </label>
                <label className="block text-[13px] font-semibold">
                  ဖုန်း ဒါမှမဟုတ် Telegram *
                  <input
                    className={`${field} mt-1`}
                    value={form.contact}
                    onChange={set('contact')}
                    required
                    maxLength={120}
                    placeholder="09xxxxxxxxx / @username"
                  />
                </label>
                <label className="block text-[13px] font-semibold">
                  နမူနာ သင်ခန်းစာ link (ရှိရင်)
                  <input
                    className={`${field} mt-1`}
                    value={form.sampleUrl}
                    onChange={set('sampleUrl')}
                    maxLength={500}
                    placeholder="https://youtu.be/..."
                  />
                </label>
                <button
                  type="submit"
                  disabled={sending}
                  className="w-full py-3 rounded-xl bg-primary text-white font-bold text-[15px] disabled:opacity-40"
                >
                  {sending ? 'ပို့နေပါတယ်…' : app ? 'ပြန်လျှောက်မယ်' : 'လျှောက်မယ်'}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
