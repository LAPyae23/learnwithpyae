'use client';
import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import AppLayout from '@/components/AppLayout';
import { api, ApiError } from '@/lib/api';
import { formatMyDate } from '@/lib/jlpt';

const FIELD_LABEL: Record<string, string> = {
  kaigo: '介護',
  food: '外食',
  manufacturing: '製造',
  construction: '建設',
  agriculture: '農業',
  hotel: '宿泊',
  it: 'IT',
  other: 'Other',
};

interface AgencyInfo {
  companyName: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  activeUntil: string | null;
  note: string;
}
interface Candidate {
  id: string;
  name: string;
  headline: string;
  fields: string[];
  jlptCertified: string;
  targetLevel: string | null;
  location: string;
  availableFrom: string;
  city: string;
  experience: string;
  education: string;
  streak: { current: number; longest: number };
  active30: number;
  exams: Record<string, { best: number; n: number }>;
  contact: null | 'pending' | 'accepted' | 'declined';
}
interface Contact {
  id: string;
  student: { id: string; name: string };
  jobTitle: string;
  message: string;
  status: string;
  createdAt: string;
  reveal: { phone: string; telegram: string; email: string } | null;
}

const field =
  'w-full px-3 py-2.5 rounded-xl border border-border bg-background text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/30';

function ApplyForm({ onDone }: { onDone: () => void }) {
  const [f, setF] = useState({
    companyName: '',
    licenseNo: '',
    country: 'myanmar',
    contactPerson: '',
    phone: '',
    website: '',
    description: '',
  });
  const [busy, setBusy] = useState(false);
  const set =
    (k: keyof typeof f) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setF({ ...f, [k]: e.target.value });
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await api('/api/agency/apply', { method: 'POST', json: f });
      toast.success('လျှောက်ပြီးပါပြီ — admin က စစ်ဆေးပြီး ဆက်သွယ်ပါမယ်');
      onDone();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit} className="bg-card border border-border rounded-2xl p-5 space-y-3">
      <p className="font-bold text-[15px]">🏢 Agency / အလုပ်ရှင် အဖြစ် စာရင်းသွင်းရန်</p>
      <p className="text-[12.5px] text-muted-foreground">
        ဂျပန်စာ တတ်တဲ့ ကျောင်းသားတွေကို ရှာဖွေဖို့ — admin က လိုင်စင်နဲ့ ကုမ္ပဏီ အချက်အလက်
        စစ်ဆေးပြီးမှ ဖွင့်ပေးပါတယ်။ ကျောင်းသားတွေ လုံခြုံအောင် ကျောင်းသားက လက်ခံမှသာ ဖုန်းနံပါတ်
        ရပါမယ်။
      </p>
      <input
        className={field}
        value={f.companyName}
        onChange={set('companyName')}
        maxLength={120}
        placeholder="ကုမ္ပဏီ အမည် *"
        required
      />
      <div className="grid sm:grid-cols-2 gap-3">
        <input
          className={field}
          value={f.licenseNo}
          onChange={set('licenseNo')}
          maxLength={80}
          placeholder="လိုင်စင် အမှတ် (MOLIP / 登録支援機関)"
        />
        <select className={field} value={f.country} onChange={set('country')}>
          <option value="myanmar">🇲🇲 မြန်မာ</option>
          <option value="japan">🇯🇵 ဂျပန်</option>
          <option value="other">အခြား</option>
        </select>
        <input
          className={field}
          value={f.contactPerson}
          onChange={set('contactPerson')}
          maxLength={80}
          placeholder="တာဝန်ရှိသူ အမည် *"
          required
        />
        <input
          className={field}
          value={f.phone}
          onChange={set('phone')}
          maxLength={40}
          placeholder="ဖုန်း *"
          required
        />
      </div>
      <input
        className={field}
        value={f.website}
        onChange={set('website')}
        maxLength={200}
        placeholder="Website / Facebook page"
      />
      <textarea
        className={`${field} min-h-[80px]`}
        value={f.description}
        onChange={set('description')}
        maxLength={1000}
        placeholder="ကုမ္ပဏီ အကြောင်း၊ ပို့ဆောင်ပေးတဲ့ အလုပ် အမျိုးအစား"
      />
      <button
        type="submit"
        disabled={busy}
        className="w-full py-2.5 rounded-xl bg-primary text-white font-bold disabled:opacity-40"
      >
        လျှောက်မယ်
      </button>
    </form>
  );
}

function ContactForm({ c, onSent }: { c: Candidate; onSent: () => void }) {
  const [jobTitle, setJobTitle] = useState('');
  const [message, setMessage] = useState('');
  async function send() {
    try {
      await api('/api/agency/contacts', {
        method: 'POST',
        json: { studentId: c.id, jobTitle, message },
      });
      toast.success(`${c.name} ဆီ ပို့ပြီးပါပြီ`);
      onSent();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }
  return (
    <div className="mt-3 space-y-2 bg-muted/40 rounded-xl p-3">
      <input
        className={field}
        value={jobTitle}
        onChange={(e) => setJobTitle(e.target.value)}
        maxLength={120}
        placeholder="အလုပ် — ဥပမာ: 特定技能 介護 (大阪)"
      />
      <textarea
        className={`${field} min-h-[80px]`}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        maxLength={1500}
        placeholder="လစာ၊ နေရာ၊ လိုအပ်ချက်၊ ဆက်သွယ်ရမယ့် နည်းလမ်း"
      />
      <button
        onClick={send}
        disabled={jobTitle.trim().length < 2 || message.trim().length < 10}
        className="px-4 py-2 rounded-xl bg-primary text-white text-[13px] font-semibold disabled:opacity-40"
      >
        စာပို့မယ်
      </button>
    </div>
  );
}

export default function AgencyPage() {
  const [info, setInfo] = useState<{ agency: AgencyInfo | null } | null>(null);
  const [cands, setCands] = useState<Candidate[] | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [blocked, setBlocked] = useState('');
  const [filters, setFilters] = useState({ field: '', minLevel: '', location: '' });
  const [open, setOpen] = useState<string | null>(null);

  const loadInfo = useCallback(() => {
    api<{ agency: AgencyInfo | null }>('/api/agency/apply')
      .then(setInfo)
      .catch(() => setInfo({ agency: null }));
  }, []);
  useEffect(loadInfo, [loadInfo]);

  const active = info?.agency?.status === 'approved';
  const loadData = useCallback(() => {
    if (!active) return;
    const q = new URLSearchParams(Object.entries(filters).filter(([, v]) => v));
    api<{ candidates: Candidate[] }>(`/api/agency/candidates?${q}`)
      .then((r) => {
        setCands(r.candidates);
        setBlocked('');
      })
      .catch((e) => setBlocked(e instanceof ApiError ? e.message : 'Error'));
    api<{ contacts: Contact[] }>('/api/agency/contacts')
      .then((r) => setContacts(r.contacts))
      .catch(() => {});
  }, [active, filters]);
  useEffect(loadData, [loadData]);

  return (
    <AppLayout activePath="/agency">
      <div className="max-w-5xl mx-auto space-y-5">
        <div>
          <h1 className="text-[22px] font-bold">🏢 Agency — ဂျပန်စာ တတ် ဝန်ထမ်း ရှာရန်</h1>
          <p className="text-[13px] text-muted-foreground">
            ကျောင်းသားတွေရဲ့ JLPT အဆင့်၊ Mock test အမှတ်၊ လေ့လာမှု မှတ်တမ်း အစစ်ကို ကြည့်ပြီး
            ရွေးချယ်ပါ
          </p>
        </div>

        {!info ? (
          <div className="h-40 rounded-2xl bg-muted animate-pulse" />
        ) : !info.agency || info.agency.status === 'rejected' ? (
          <>
            {info.agency?.status === 'rejected' && (
              <p className="bg-danger-bg text-danger rounded-xl p-3 text-[13px]">
                အတည်မပြုနိုင်ခဲ့ပါ{info.agency.note && `: ${info.agency.note}`} — ပြင်ပြီး
                ပြန်လျှောက်နိုင်ပါတယ်
              </p>
            )}
            <ApplyForm onDone={loadInfo} />
          </>
        ) : info.agency.status === 'pending' ? (
          <p className="bg-warning-bg rounded-2xl p-5 text-[14px]">
            ⏳ {info.agency.companyName} — admin စစ်ဆေးနေပါတယ်။ အတည်ပြုရင် အကြောင်းကြားပါမယ်။
          </p>
        ) : info.agency.status === 'suspended' ? (
          <p className="bg-danger-bg rounded-2xl p-5 text-[14px]">
            ရပ်ဆိုင်းထားပါတယ်{info.agency.note && `: ${info.agency.note}`}
          </p>
        ) : (
          <>
            <div className="bg-success-bg border border-green-200 rounded-2xl p-4 text-[13.5px]">
              ✅ <b>{info.agency.companyName}</b> —{' '}
              {info.agency.activeUntil && formatMyDate(new Date(info.agency.activeUntil))} အထိ
            </div>
            {blocked ? (
              <p className="bg-danger-bg text-danger rounded-xl p-4 text-[13.5px]">{blocked}</p>
            ) : (
              <>
                <div className="flex flex-wrap gap-2">
                  <select
                    className="h-9 px-3 rounded-lg border border-border bg-background text-[13px]"
                    value={filters.field}
                    onChange={(e) => setFilters({ ...filters, field: e.target.value })}
                  >
                    <option value="">အလုပ် အားလုံး</option>
                    {Object.entries(FIELD_LABEL).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                  <select
                    className="h-9 px-3 rounded-lg border border-border bg-background text-[13px]"
                    value={filters.minLevel}
                    onChange={(e) => setFilters({ ...filters, minLevel: e.target.value })}
                  >
                    <option value="">JLPT အားလုံး</option>
                    {['N5', 'N4', 'N3', 'N2', 'N1'].map((l) => (
                      <option key={l} value={l}>
                        {l} နှင့်အထက် (လက်မှတ်)
                      </option>
                    ))}
                  </select>
                  <select
                    className="h-9 px-3 rounded-lg border border-border bg-background text-[13px]"
                    value={filters.location}
                    onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  >
                    <option value="">နေရာ အားလုံး</option>
                    <option value="japan">ဂျပန်</option>
                    <option value="myanmar">မြန်မာ</option>
                  </select>
                </div>
                {cands === null ? (
                  <div className="h-40 rounded-2xl bg-muted animate-pulse" />
                ) : cands.length === 0 ? (
                  <p className="bg-card border border-border rounded-2xl p-6 text-center text-[13.5px] text-muted-foreground">
                    ကိုက်ညီတဲ့ ကျောင်းသား မရှိသေးပါ
                  </p>
                ) : (
                  <div className="grid md:grid-cols-2 gap-3">
                    {cands.map((c) => (
                      <div key={c.id} className="bg-card border border-border rounded-2xl p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-bold text-[15px]">{c.name}</p>
                            <p className="text-[12.5px] text-muted-foreground">
                              JLPT {c.jlptCertified === 'none' ? 'မရှိ' : c.jlptCertified} · လေ့လာနေ{' '}
                              {c.targetLevel ?? '—'} · {c.city}
                            </p>
                          </div>
                          {c.contact && (
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-secondary text-primary">
                              {c.contact === 'accepted'
                                ? '✓ လက်ခံ'
                                : c.contact === 'declined'
                                  ? 'ငြင်း'
                                  : 'ပို့ပြီး'}
                            </span>
                          )}
                        </div>
                        {c.headline && <p className="text-[13px] mt-1">{c.headline}</p>}
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {c.fields.map((f) => (
                            <span key={f} className="text-[11px] px-2 py-0.5 rounded-full bg-muted">
                              {FIELD_LABEL[f] ?? f}
                            </span>
                          ))}
                        </div>
                        <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                          <div className="bg-muted/40 rounded-lg py-1.5">
                            <p className="text-[15px] font-bold">🔥 {c.streak.current}</p>
                            <p className="text-[10.5px] text-muted-foreground">streak</p>
                          </div>
                          <div className="bg-muted/40 rounded-lg py-1.5">
                            <p className="text-[15px] font-bold">{c.active30}/30</p>
                            <p className="text-[10.5px] text-muted-foreground">လေ့လာခဲ့ ရက်</p>
                          </div>
                          <div className="bg-muted/40 rounded-lg py-1.5">
                            <p className="text-[15px] font-bold">
                              {Object.keys(c.exams).length
                                ? Object.entries(c.exams)
                                    .map(([l, e]) => `${l} ${e.best}%`)
                                    .join(' ')
                                : '—'}
                            </p>
                            <p className="text-[10.5px] text-muted-foreground">
                              Mock test အကောင်းဆုံး
                            </p>
                          </div>
                        </div>
                        {(c.experience || c.education || c.availableFrom) && (
                          <p className="text-[12.5px] text-muted-foreground mt-2">
                            {c.availableFrom && `📅 ${c.availableFrom} မှ · `}
                            {c.education && `🎓 ${c.education} · `}
                            {c.experience}
                          </p>
                        )}
                        {!c.contact && (
                          <>
                            <button
                              onClick={() => setOpen(open === c.id ? null : c.id)}
                              className="mt-3 text-[13px] text-primary font-semibold"
                            >
                              {open === c.id ? 'ပိတ်မယ်' : '✉️ အလုပ်ကမ်းလှမ်းစာ ပို့မယ်'}
                            </button>
                            {open === c.id && (
                              <ContactForm
                                c={c}
                                onSent={() => {
                                  setOpen(null);
                                  loadData();
                                }}
                              />
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <section className="bg-card border border-border rounded-2xl overflow-hidden">
                  <p className="px-5 py-3 border-b border-border font-bold text-[14px]">
                    📤 ပို့ထားတဲ့ စာများ
                  </p>
                  {contacts.length === 0 ? (
                    <p className="px-5 py-4 text-[13px] text-muted-foreground">မရှိသေးပါ</p>
                  ) : (
                    <div className="divide-y divide-border">
                      {contacts.map((c) => (
                        <div key={c.id} className="px-5 py-3 text-[13px]">
                          <div className="flex justify-between gap-2">
                            <p className="font-semibold">
                              {c.student.name} — {c.jobTitle}
                            </p>
                            <span className="text-[11.5px] text-muted-foreground">
                              {c.status === 'accepted'
                                ? '✓ လက်ခံ'
                                : c.status === 'declined'
                                  ? 'ငြင်း'
                                  : 'စောင့်ဆဲ'}
                            </span>
                          </div>
                          {c.reveal && (
                            <p className="mt-1 bg-secondary/60 rounded-lg px-3 py-1.5">
                              {c.reveal.phone && `📞 ${c.reveal.phone} `}
                              {c.reveal.telegram && `✈️ ${c.reveal.telegram} `}
                              {c.reveal.email && `✉️ ${c.reveal.email}`}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
