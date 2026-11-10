'use client';
import React, { Suspense, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import AppLayout from '@/components/AppLayout';
import RichText from '@/components/RichText';
import { api } from '@/lib/api';
import { youTubeId } from '@/lib/youtube';
import { useCurrentUser } from '@/components/useCurrentUser';
import LangPicker, { LangMultiPicker, flagOf } from '@/components/LangPicker';
import { isLang, LANGUAGES, type LangCode } from '@/data/languages';
import { STATUS_LABEL, type LessonItem, type LessonStatus, type Level } from '@/data/lessonMeta';

const field =
  'w-full px-3 py-2.5 rounded-xl border border-border bg-background text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/30';

interface Draft {
  title: string;
  level: Level;
  language: LangCode;
  chapter: string;
  summary: string;
  videoUrl: string;
  content: string;
  durationMin: number;
  order: number;
  status: LessonStatus;
  access: 'free' | 'premium';
  reviewNote: string;
}

const EMPTY: Draft = {
  title: '',
  level: 'N5',
  language: 'ja',
  chapter: '',
  summary: '',
  videoUrl: '',
  content: '',
  durationMin: 0,
  order: 0,
  status: 'draft',
  access: 'free',
  reviewNote: '',
};

const toDraft = (l: LessonItem): Draft => ({
  title: l.title,
  level: l.level,
  language: (isLang(l.language) ? l.language : 'ja') as LangCode,
  chapter: l.chapter,
  summary: l.summary,
  videoUrl: l.videoUrl,
  content: l.content ?? '',
  durationMin: l.durationMin,
  order: l.order,
  status: l.status,
  access: l.access ?? 'free',
  reviewNote: l.reviewNote,
});

function Editor({
  slug,
  isAdmin,
  onDone,
}: {
  slug: string | null; // null = new lesson
  isAdmin: boolean;
  onDone: () => void;
}) {
  const [d, setD] = useState<Draft>(EMPTY);
  const [loaded, setLoaded] = useState(!slug);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  const [authorName, setAuthorName] = useState('');

  useEffect(() => {
    if (!slug) return;
    api<{ lesson: LessonItem }>(`/api/lessons/${slug}`)
      .then((r) => {
        setD(toDraft(r.lesson));
        setAuthorName(r.lesson.author?.name ?? '');
        setLoaded(true);
      })
      .catch((e) => toast.error(e.message));
  }, [slug]);

  const set =
    <K extends keyof Draft>(k: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setD({
        ...d,
        [k]: typeof EMPTY[k] === 'number' ? Number(e.target.value) || 0 : e.target.value,
      });

  async function save(mode: 'draft' | 'submit' | 'admin') {
    setSaving(true);
    const body: Record<string, unknown> = {
      title: d.title,
      level: d.level,
      language: d.language,
      chapter: d.chapter,
      summary: d.summary,
      videoUrl: d.videoUrl,
      content: d.content,
      durationMin: d.durationMin,
      order: d.order,
      access: d.access,
    };
    if (mode === 'admin') {
      body.status = d.status;
      body.reviewNote = d.reviewNote;
    } else body.submit = mode === 'submit';
    try {
      await api(slug ? `/api/lessons/${slug}` : '/api/lessons', {
        method: slug ? 'PATCH' : 'POST',
        json: body,
      });
      toast.success(mode === 'submit' ? 'Admin ဆီ စစ်ဆေးဖို့ ပို့ပြီးပါပြီ' : 'သိမ်းပြီးပါပြီ');
      onDone();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!slug || !window.confirm('ဒီသင်ခန်းစာကို ဖျက်မှာ သေချာလား? ပြန်ယူလို့ မရပါ။')) return;
    try {
      await api(`/api/lessons/${slug}`, { method: 'DELETE' });
      toast.success('ဖျက်ပြီးပါပြီ');
      onDone();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  if (!loaded) return <div className="h-96 rounded-2xl bg-muted animate-pulse" />;
  const ytId = d.videoUrl ? youTubeId(d.videoUrl) : null;

  return (
    <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-[16px]">
          {slug ? 'သင်ခန်းစာ ပြင်ရန်' : 'သင်ခန်းစာ အသစ်'}
          {authorName && (
            <span className="text-[12.5px] font-normal text-muted-foreground"> · {authorName}</span>
          )}
        </h2>
        <button
          onClick={onDone}
          className="text-[13px] text-muted-foreground hover:text-foreground"
        >
          ✕ ပိတ်မယ်
        </button>
      </div>

      {d.status === 'rejected' && d.reviewNote && !isAdmin && (
        <p className="text-[13px] bg-danger-bg text-danger rounded-xl p-3">
          Admin မှတ်ချက်: {d.reviewNote}
        </p>
      )}

      <label className="block text-[13px] font-semibold">
        ခေါင်းစဉ် *
        <input
          className={`${field} mt-1`}
          value={d.title}
          onChange={set('title')}
          maxLength={140}
        />
      </label>

      <div>
        <p className="text-[13px] font-semibold mb-1.5">ဘာသာစကား</p>
        <LangPicker
          value={d.language}
          onChange={(v) =>
            v !== 'all' && setD({ ...d, language: v, level: LANGUAGES[v].levels[0] })
          }
          size="sm"
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <label className="block text-[13px] font-semibold">
          အဆင့် ({LANGUAGES[d.language].exam})
          <select className={`${field} mt-1`} value={d.level} onChange={set('level')}>
            {LANGUAGES[d.language].levels.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </label>
        <label className="block text-[13px] font-semibold col-span-1 sm:col-span-1">
          ကြာချိန် (မိနစ်)
          <input
            className={`${field} mt-1`}
            type="number"
            min={0}
            value={d.durationMin}
            onChange={set('durationMin')}
          />
        </label>
        <label className="block text-[13px] font-semibold col-span-2">
          အခန်း
          <input
            className={`${field} mt-1`}
            value={d.chapter}
            onChange={set('chapter')}
            maxLength={80}
            placeholder="ဥပမာ - အခန်း ၄ — て ပုံစံ"
          />
        </label>
      </div>

      <label className="block text-[13px] font-semibold">
        အကျဉ်းချုပ်
        <input
          className={`${field} mt-1`}
          value={d.summary}
          onChange={set('summary')}
          maxLength={400}
        />
      </label>

      <div>
        <p className="text-[13px] font-semibold mb-1.5">ဘယ်သူတွေ ကြည့်လို့ရမလဲ?</p>
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              ['free', '🆓 Free', 'ကျောင်းသား အားလုံး ကြည့်လို့ရမယ် — follower တိုးဖို့ ကောင်းတယ်'],
              ['premium', '⭐ Premium', 'Premium ဝယ်ထားတဲ့သူတွေပဲ ကြည့်လို့ရမယ်'],
            ] as const
          ).map(([id, label, desc]) => (
            <button
              key={id}
              type="button"
              onClick={() => setD({ ...d, access: id })}
              className={`text-left p-3 rounded-xl border-2 transition-colors ${
                d.access === id
                  ? id === 'premium'
                    ? 'border-yellow-400 bg-yellow-50'
                    : 'border-primary bg-secondary'
                  : 'border-border'
              }`}
            >
              <p className="font-bold text-[14px]">{label}</p>
              <p className="text-[11.5px] text-muted-foreground mt-0.5">{desc}</p>
            </button>
          ))}
        </div>
      </div>

      <label className="block text-[13px] font-semibold">
        Video link (YouTube ဒါမှမဟုတ် .mp4)
        <input
          className={`${field} mt-1`}
          value={d.videoUrl}
          onChange={set('videoUrl')}
          maxLength={500}
          placeholder="https://youtu.be/..."
        />
      </label>
      {d.videoUrl && (
        <p className={`text-[12px] -mt-2 ${ytId ? 'text-success' : 'text-muted-foreground'}`}>
          {ytId ? `✓ YouTube video (${ytId})` : 'YouTube link မဟုတ်ပါ — .mp4 link ဖြစ်ရပါမယ်'}
        </p>
      )}
      {ytId && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`}
          alt="video thumbnail"
          className="w-48 rounded-lg border border-border"
        />
      )}

      <div>
        <div className="flex items-center justify-between">
          <p className="text-[13px] font-semibold">သင်ခန်းစာ စာသား</p>
          <button
            type="button"
            onClick={() => setPreview(!preview)}
            className="text-[12.5px] text-primary font-medium"
          >
            {preview ? '✏️ ပြန်ရေးမယ်' : '👁 Preview'}
          </button>
        </div>
        {preview ? (
          <div className="mt-1 min-h-[200px] rounded-xl border border-border p-4">
            <RichText text={d.content || '—'} className="text-[14px]" />
          </div>
        ) : (
          <textarea
            className={`${field} mt-1 min-h-[240px] font-mono text-[13.5px]`}
            value={d.content}
            onChange={set('content')}
            maxLength={20000}
            placeholder={
              'စာပိုဒ်တွေကို လိုင်းအလွတ်နဲ့ ခြားပါ။\n- စာရင်းအတွက် "- " နဲ့ စပါ\n1. နံပါတ်စဉ်အတွက် "1. "\n**စာလုံးထူ** အတွက် ** နှစ်ခုကြား ထည့်ပါ'
            }
          />
        )}
      </div>

      {isAdmin && (
        <div className="grid sm:grid-cols-[160px_100px_1fr] gap-3 p-3 rounded-xl bg-muted/50">
          <label className="block text-[13px] font-semibold">
            အခြေအနေ
            <select className={`${field} mt-1`} value={d.status} onChange={set('status')}>
              {(Object.keys(STATUS_LABEL) as LessonStatus[]).map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s].text}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-[13px] font-semibold">
            အစီအစဉ်
            <input
              className={`${field} mt-1`}
              type="number"
              value={d.order}
              onChange={set('order')}
            />
          </label>
          <label className="block text-[13px] font-semibold">
            ဆရာ့ကို မှတ်ချက်
            <input
              className={`${field} mt-1`}
              value={d.reviewNote}
              onChange={set('reviewNote')}
              maxLength={300}
            />
          </label>
        </div>
      )}

      <div className="flex flex-wrap gap-2 pt-1">
        {isAdmin ? (
          <button
            onClick={() => save('admin')}
            disabled={saving || d.title.trim().length < 2}
            className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-[14px] disabled:opacity-40"
          >
            {saving ? 'သိမ်းနေပါတယ်…' : 'သိမ်းမယ်'}
          </button>
        ) : (
          <>
            <button
              onClick={() => save('submit')}
              disabled={saving || d.title.trim().length < 2}
              className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-[14px] disabled:opacity-40"
            >
              Admin ဆီ ပို့မယ်
            </button>
            <button
              onClick={() => save('draft')}
              disabled={saving || d.title.trim().length < 2}
              className="px-5 py-2.5 rounded-xl border border-border font-semibold text-[14px] disabled:opacity-40"
            >
              မူကြမ်း သိမ်းမယ်
            </button>
          </>
        )}
        {slug && (
          <button
            onClick={remove}
            className="ml-auto px-4 py-2.5 rounded-xl text-danger text-[13.5px] hover:bg-danger-bg"
          >
            ဖျက်မယ်
          </button>
        )}
      </div>
      {!isAdmin && (
        <p className="text-[12px] text-muted-foreground">
          ထုတ်ဝေပြီးသား သင်ခန်းစာကို ပြင်ရင် admin ပြန်စစ်ပြီးမှ ပြန်ပေါ်ပါမယ်။
        </p>
      )}
    </div>
  );
}

/** The teacher's public profile (shown on /teachers/[id]). */
function ProfileEditor() {
  const [p, setP] = useState<{
    id: string;
    headline: string;
    bio: string;
    languages: string[];
  } | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    api<{ id: string; headline: string; bio: string; languages: string[] }>('/api/teacher/profile')
      .then(setP)
      .catch(() => setP(null));
  }, []);
  if (!p) return null;

  async function save() {
    setSaving(true);
    try {
      await api('/api/teacher/profile', {
        method: 'PUT',
        json: { headline: p!.headline, bio: p!.bio, languages: p!.languages },
      });
      toast.success('Profile သိမ်းပြီးပါပြီ');
      setOpen(false);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-bold text-[14px]">👩‍🏫 ကျွန်ုပ်၏ ဆရာ Profile</p>
          <p className="text-[12.5px] text-muted-foreground">
            {p.headline || 'ကျောင်းသားတွေ မြင်ရမယ့် ကိုယ့်အကြောင်း ထည့်ပါ'}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/teachers/${p.id}`}
            className="px-3 py-1.5 rounded-lg border border-border text-[12.5px]"
          >
            ကြည့်မယ်
          </Link>
          <button
            onClick={() => setOpen(!open)}
            className="px-3 py-1.5 rounded-lg bg-primary text-white text-[12.5px] font-semibold"
          >
            {open ? 'ပိတ်မယ်' : 'ပြင်မယ်'}
          </button>
        </div>
      </div>
      {open && (
        <div className="mt-3 space-y-3">
          <label className="block text-[13px] font-semibold">
            တစ်ကြောင်း မိတ်ဆက်
            <input
              className={`${field} mt-1`}
              value={p.headline}
              maxLength={120}
              onChange={(e) => setP({ ...p, headline: e.target.value })}
              placeholder="ဥပမာ - N5 ကနေ N3 အထိ လွယ်လွယ်ကူကူ သင်ပေးမယ့် ဆရာမ"
            />
          </label>
          <div>
            <p className="text-[13px] font-semibold mb-1.5">သင်ပေးတဲ့ ဘာသာစကား</p>
            <LangMultiPicker
              value={p.languages}
              onChange={(languages) => setP({ ...p, languages })}
            />
          </div>
          <label className="block text-[13px] font-semibold">
            ကိုယ့်အကြောင်း
            <textarea
              className={`${field} mt-1 min-h-[100px]`}
              value={p.bio}
              maxLength={1500}
              onChange={(e) => setP({ ...p, bio: e.target.value })}
            />
          </label>
          <button
            onClick={save}
            disabled={saving}
            className="px-5 py-2 rounded-xl bg-primary text-white font-bold text-[13.5px] disabled:opacity-40"
          >
            {saving ? 'သိမ်းနေပါတယ်…' : 'သိမ်းမယ်'}
          </button>
        </div>
      )}
    </div>
  );
}

function Studio() {
  const router = useRouter();
  const params = useSearchParams();
  const { user, loading } = useCurrentUser();
  const isAdmin = user?.role === 'admin';
  const canTeach = isAdmin || user?.role === 'teacher';

  const [scope, setScope] = useState<'mine' | 'all' | 'pending'>('mine');
  const [lessons, setLessons] = useState<LessonItem[] | null>(null);
  const editing = params.get('edit');
  const creating = params.get('new') === '1';

  const load = useCallback(() => {
    if (!canTeach) return;
    setLessons(null);
    const q =
      scope === 'mine' ? 'scope=mine' : scope === 'all' ? 'scope=all' : 'scope=all&status=pending';
    api<{ lessons: LessonItem[] }>(`/api/lessons?${q}`)
      .then((r) => setLessons(r.lessons))
      .catch((e) => toast.error(e.message));
  }, [canTeach, scope]);
  useEffect(load, [load]);

  useEffect(() => {
    if (isAdmin && params.get('scope') === 'pending') setScope('pending');
  }, [isAdmin, params]);

  const closeEditor = () => {
    router.replace('/studio');
    load();
  };

  if (loading) return <div className="h-64 rounded-2xl bg-muted animate-pulse" />;
  if (!canTeach) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <p className="text-muted-foreground mb-3">ဆရာ အကောင့်နဲ့ပဲ သင်ခန်းစာ ရေးလို့ရပါတယ်။</p>
        <Link href="/teach" className="text-primary font-semibold">
          ဆရာ အဖြစ် လျှောက်မယ် →
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-bold text-foreground">သင်ခန်းစာ Studio</h1>
          <p className="text-[13px] text-muted-foreground">
            {isAdmin
              ? 'သင်ခန်းစာ ရေးမယ်၊ ဆရာတွေ ပို့ထားတာ စစ်ပြီး ထုတ်ဝေမယ်'
              : 'သင်ခန်းစာ ရေးပြီး admin ဆီ ပို့ပါ — စစ်ပြီးရင် ကျောင်းသားတွေ မြင်ရပါမယ်'}
          </p>
        </div>
        {!editing && !creating && (
          <button
            onClick={() => router.push('/studio?new=1')}
            className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold"
          >
            + သင်ခန်းစာ အသစ်
          </button>
        )}
      </div>

      {editing || creating ? (
        <Editor key={editing ?? 'new'} slug={editing} isAdmin={isAdmin} onDone={closeEditor} />
      ) : (
        <>
          <ProfileEditor />
          {isAdmin && (
            <div className="flex gap-2">
              {(
                [
                  ['pending', 'စစ်ရန်'],
                  ['all', 'အားလုံး'],
                  ['mine', 'ကျွန်ုပ်၏'],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => setScope(id)}
                  className={`px-3.5 py-1.5 rounded-full border text-[13px] ${
                    scope === id
                      ? 'bg-primary text-white border-primary'
                      : 'border-border text-muted-foreground'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            {lessons === null ? (
              <div className="h-32 bg-muted animate-pulse" />
            ) : lessons.length === 0 ? (
              <p className="p-6 text-[13.5px] text-muted-foreground text-center">
                {scope === 'pending' ? 'စစ်ရန် သင်ခန်းစာ မရှိပါ 🎉' : 'သင်ခန်းစာ မရှိသေးပါ'}
              </p>
            ) : (
              <div className="divide-y divide-border">
                {lessons.map((l) => (
                  <div key={l.id} className="px-5 py-3 flex items-center gap-3">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-secondary text-primary">
                      {flagOf(l.language)} {l.level}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[14px] truncate">{l.title}</p>
                      <p className="text-[12px] text-muted-foreground truncate">
                        {l.author?.name ?? 'NihongoAcademy'}
                        {l.hasVideo ? ' · 🎬' : ''}
                        {l.access === 'premium' ? ' · ⭐ Premium' : ' · Free'}
                        {l.status === 'published' ? ` · 👁 ${l.stats.views}` : ''}
                        {l.reviewNote ? ` · ${l.reviewNote}` : ''}
                      </p>
                    </div>
                    <span
                      className={`text-[11.5px] font-semibold px-2.5 py-1 rounded-full ${STATUS_LABEL[l.status].cls}`}
                    >
                      {STATUS_LABEL[l.status].text}
                    </span>
                    <Link
                      href={`/lesson/${l.slug}`}
                      className="text-[12.5px] text-muted-foreground hover:text-foreground"
                    >
                      ကြည့်
                    </Link>
                    <button
                      onClick={() => router.push(`/studio?edit=${l.slug}`)}
                      className="text-[12.5px] text-primary font-semibold"
                    >
                      ပြင်
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default function StudioPage() {
  return (
    <AppLayout activePath="/studio">
      <Suspense fallback={<div className="h-64 rounded-2xl bg-muted animate-pulse" />}>
        <Studio />
      </Suspense>
    </AppLayout>
  );
}
