'use client';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api';

/** Follow / unfollow a teacher. */
export default function FollowButton({
  teacherId,
  following,
  onChange,
  size = 'md',
}: {
  teacherId: string;
  following: boolean;
  onChange?: (following: boolean, followers: number) => void;
  size?: 'sm' | 'md';
}) {
  const [on, setOn] = useState(following);
  const [busy, setBusy] = useState(false);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault(); // buttons inside cards that are links
    e.stopPropagation();
    setBusy(true);
    try {
      const r = await api<{ following: boolean; followers: number }>(
        `/api/teachers/${teacherId}/follow`,
        { method: on ? 'DELETE' : 'POST' }
      );
      setOn(r.following);
      onChange?.(r.following, r.followers);
      if (r.following) toast.success('Follow လုပ်ပြီးပါပြီ — သင်ခန်းစာ အသစ်တွေ feed မှာ ပေါ်ပါမယ်');
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      className={`rounded-full font-semibold transition-colors disabled:opacity-50 ${
        size === 'sm' ? 'px-3 py-1 text-[12px]' : 'px-4 py-1.5 text-[13px]'
      } ${on ? 'bg-muted text-foreground border border-border' : 'bg-primary text-white'}`}
    >
      {on ? '✓ Following' : '+ Follow'}
    </button>
  );
}
