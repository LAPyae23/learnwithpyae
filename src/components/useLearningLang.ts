'use client';
import { useEffect, useState } from 'react';
import { isLang, type LangCode } from '@/data/languages';
import { api } from '@/lib/api';
import { patchCachedUser, useCurrentUser } from './useCurrentUser';

// Shared across components so the menu updates the moment the learner switches language
let override: LangCode | null = null;
const listeners = new Set<(l: LangCode) => void>();

/** The language the learner is studying (drives the menu, home tools and lesson filters). */
export function useLearningLang() {
  const { user } = useCurrentUser();
  const [local, setLocal] = useState<LangCode | null>(override);

  useEffect(() => {
    listeners.add(setLocal);
    return () => {
      listeners.delete(setLocal);
    };
  }, []);

  const fromUser = user?.learningLang && isLang(user.learningLang) ? user.learningLang : null;
  return (local ?? fromUser ?? 'ja') as LangCode;
}

/** Switches the learning language everywhere at once and saves it to the account. */
export async function setLearningLang(lang: LangCode) {
  override = lang;
  listeners.forEach((l) => l(lang));
  patchCachedUser({ learningLang: lang });
  await api('/api/auth/me', { method: 'PATCH', body: JSON.stringify({ learningLang: lang }) });
}
