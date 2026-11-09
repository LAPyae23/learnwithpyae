'use client';
import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { REACTIONS, totalReactions, type LessonStats, type ReactionId } from '@/data/lessonMeta';

interface Me {
  reaction: ReactionId | null;
  stars: number | null;
  isAuthor: boolean;
}

/** Facebook-style reaction bar + 5-star rating. */
export function ReactionBar({
  slug,
  stats,
  me,
  onChange,
}: {
  slug: string;
  stats: LessonStats;
  me: Me;
  onChange: (stats: LessonStats, me: Me) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [hover, setHover] = useState(0);

  async function vote(body: { reaction?: ReactionId | null; stars?: number }) {
    if (me.isAuthor) return toast('ကိုယ့်သင်ခန်းစာကို ကိုယ်တိုင် အမှတ်ပေးလို့ မရပါ');
    setBusy(true);
    try {
      const r = await api<{
        me: { reaction: ReactionId | null; stars: number | null };
        stats: Omit<LessonStats, 'views'>;
      }>(`/api/lessons/${slug}/vote`, { method: 'POST', json: body });
      onChange({ ...stats, ...r.stats }, { ...me, ...r.me });
      if (body.stars) toast.success(`${body.stars} ⭐ ပေးပြီးပါပြီ — ကျေးဇူးပါ!`);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const total = totalReactions(stats);
  const top = REACTIONS.filter((r) => stats.reactions[r.id] > 0)
    .sort((a, b) => stats.reactions[b.id] - stats.reactions[a.id])
    .slice(0, 3);

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 text-[13px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          {top.length > 0 && (
            <span className="text-[16px]">{top.map((r) => r.emoji).join('')}</span>
          )}
          {total > 0 ? `${total} ယောက်` : 'ပထမဆုံး reaction ပေးလိုက်ပါ'}
        </span>
        <span className="flex items-center gap-3">
          <span>👁 {stats.views}</span>
          <span>💬 {stats.comments}</span>
          {stats.ratingCount > 0 && (
            <span>
              ⭐ {stats.ratingAvg.toFixed(1)} ({stats.ratingCount})
            </span>
          )}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5 border-t border-border pt-3">
        {REACTIONS.map((r) => {
          const on = me.reaction === r.id;
          return (
            <button
              key={r.id}
              disabled={busy}
              onClick={() => vote({ reaction: on ? null : r.id })}
              title={r.label}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full border text-[13px] transition-all active:scale-95 ${
                on
                  ? 'bg-primary/10 border-primary text-primary font-semibold scale-105'
                  : 'border-border hover:bg-muted'
              }`}
            >
              <span className="text-[17px] leading-none">{r.emoji}</span>
              <span className="hidden sm:inline">{r.label}</span>
              {stats.reactions[r.id] > 0 && (
                <span className="text-[11.5px] tabular-nums">{stats.reactions[r.id]}</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2 text-[13px]">
        <span className="text-muted-foreground">အမှတ်ပေးမယ်:</span>
        <div className="flex" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              disabled={busy}
              onMouseEnter={() => setHover(n)}
              onClick={() => vote({ stars: n })}
              className="text-[22px] leading-none px-0.5 transition-transform hover:scale-110"
              aria-label={`${n} stars`}
            >
              <span className={(hover || me.stars || 0) >= n ? 'text-yellow-400' : 'text-gray-300'}>
                ★
              </span>
            </button>
          ))}
        </div>
        {me.stars && <span className="text-muted-foreground">သင် {me.stars} ⭐ ပေးထားတယ်</span>}
      </div>
    </div>
  );
}

interface Comment {
  id: string;
  text: string;
  parent: string | null;
  createdAt: string;
  user: { id: string; name: string; isTeacher: boolean; isAdmin: boolean } | null;
  mine: boolean;
}

function timeAgo(iso: string) {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return 'ခုနက';
  if (s < 3600) return `${Math.floor(s / 60)} မိနစ်က`;
  if (s < 86400) return `${Math.floor(s / 3600)} နာရီက`;
  if (s < 86400 * 30) return `${Math.floor(s / 86400)} ရက်က`;
  return new Date(iso).toLocaleDateString();
}

/** Comments with one level of replies. The lesson's teacher gets a badge. */
export function CommentSection({ slug, onCount }: { slug: string; onCount: (n: number) => void }) {
  const [comments, setComments] = useState<Comment[] | null>(null);
  const [canModerate, setCanModerate] = useState(false);
  const [text, setText] = useState('');
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const [sending, setSending] = useState(false);

  const load = useCallback(() => {
    api<{ comments: Comment[]; canModerate: boolean }>(`/api/lessons/${slug}/comments`)
      .then((r) => {
        setComments(r.comments);
        setCanModerate(r.canModerate);
      })
      .catch(() => setComments([]));
  }, [slug]);
  useEffect(load, [load]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    try {
      const r = await api<{ comment: Comment; comments: number }>(`/api/lessons/${slug}/comments`, {
        method: 'POST',
        json: { text, parent: replyTo?.id },
      });
      setComments((c) => [r.comment, ...(c ?? [])]);
      onCount(r.comments);
      setText('');
      setReplyTo(null);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSending(false);
    }
  }

  async function remove(c: Comment) {
    if (!window.confirm('ဒီ comment ကို ဖျက်မလား?')) return;
    try {
      const r = await api<{ comments: number }>(`/api/lessons/${slug}/comments?id=${c.id}`, {
        method: 'DELETE',
      });
      onCount(r.comments);
      load();
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  const top = (comments ?? []).filter((c) => !c.parent);
  const replies = (id: string) => (comments ?? []).filter((c) => c.parent === id).reverse(); // oldest reply first

  const Item = ({ c, reply }: { c: Comment; reply?: boolean }) => (
    <div className={`flex gap-2.5 ${reply ? 'ml-10 mt-2' : ''}`}>
      <span
        className={`${reply ? 'w-7 h-7 text-[12px]' : 'w-9 h-9 text-[14px]'} rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 ${
          c.user?.isTeacher ? 'bg-primary' : 'bg-gray-400'
        }`}
      >
        {Array.from(c.user?.name ?? '?')[0]}
      </span>
      <div className="flex-1 min-w-0">
        <div className="bg-muted/60 rounded-2xl px-3.5 py-2 inline-block max-w-full">
          <p className="text-[12.5px] font-semibold flex items-center gap-1.5">
            {c.user?.name ?? 'ဖျက်ထားသော user'}
            {c.user?.isTeacher && (
              <span className="text-[10.5px] px-1.5 py-0.5 rounded-full bg-primary text-white">
                ဆရာ
              </span>
            )}
            {c.user?.isAdmin && !c.user.isTeacher && (
              <span className="text-[10.5px] px-1.5 py-0.5 rounded-full bg-warning text-white">
                Admin
              </span>
            )}
          </p>
          <p className="text-[13.5px] whitespace-pre-wrap break-words">{c.text}</p>
        </div>
        <div className="flex gap-3 text-[11.5px] text-muted-foreground mt-0.5 ml-2">
          <span>{timeAgo(c.createdAt)}</span>
          <button
            onClick={() => setReplyTo(reply ? (comments!.find((x) => x.id === c.parent) ?? c) : c)}
            className="font-semibold hover:text-foreground"
          >
            ပြန်ဖြေမယ်
          </button>
          {(c.mine || canModerate) && (
            <button onClick={() => remove(c)} className="hover:text-danger">
              ဖျက်မယ်
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-5">
      <h3 className="font-bold text-[15px] mb-3">💬 မေးခွန်းနဲ့ မှတ်ချက်များ</h3>
      <form onSubmit={send} className="mb-4">
        {replyTo && (
          <p className="text-[12px] text-muted-foreground mb-1">
            {replyTo.user?.name} ကို ပြန်ဖြေနေတယ် ·{' '}
            <button type="button" onClick={() => setReplyTo(null)} className="text-primary">
              မလုပ်တော့ဘူး
            </button>
          </p>
        )}
        <div className="flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={1000}
            placeholder={
              replyTo ? 'ပြန်ဖြေချက် ရေးပါ…' : 'ဆရာ့ကို မေးချင်တာ ဒါမှမဟုတ် မှတ်ချက် ရေးပါ…'
            }
            className="flex-1 h-10 px-4 rounded-full border border-border bg-background text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button
            type="submit"
            disabled={sending || !text.trim()}
            className="px-4 h-10 rounded-full bg-primary text-white text-[13.5px] font-semibold disabled:opacity-40"
          >
            ပို့မယ်
          </button>
        </div>
      </form>

      {comments === null ? (
        <div className="h-20 bg-muted rounded-xl animate-pulse" />
      ) : top.length === 0 ? (
        <p className="text-[13px] text-muted-foreground text-center py-4">
          Comment မရှိသေးပါ။ ပထမဆုံး မေးလိုက်ပါ! 🙋
        </p>
      ) : (
        <div className="space-y-4">
          {top.map((c) => (
            <div key={c.id}>
              <Item c={c} />
              {replies(c.id).map((r) => (
                <Item key={r.id} c={r} reply />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** Shown instead of the video/text for premium lessons when the learner has no plan. */
export function PremiumLock({ title }: { title: string }) {
  return (
    <div className="relative bg-gradient-to-br from-gray-900 via-gray-950 to-[#3d2e00] aspect-video rounded-xl flex items-center justify-center px-6 text-center">
      <div>
        <div className="text-5xl mb-3">🔒</div>
        <p className="text-white font-bold text-[16px]">⭐ Premium သင်ခန်းစာ</p>
        <p className="text-gray-300 text-[13px] mt-1 max-w-sm mx-auto">
          「{title}」 ကို Premium member တွေ ကြည့်လို့ရပါတယ်။
        </p>
        <Link
          href="/billing"
          className="inline-block mt-4 px-5 py-2.5 rounded-xl bg-yellow-400 text-gray-900 font-bold text-[14px] hover:bg-yellow-300"
        >
          Premium ဝယ်မယ် →
        </Link>
      </div>
    </div>
  );
}
