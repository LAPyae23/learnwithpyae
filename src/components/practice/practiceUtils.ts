'use client';
import { useEffect, useRef } from 'react';
import type { PracticeLang } from './types';

/** Lowercase, drop punctuation and spaces so recognizer output can be compared with the target. */
export function normalizeSpeech(s: string, lang: PracticeLang) {
  const base = s
    .toLowerCase()
    .normalize('NFC')
    .replace(/[.,!?;:'"“”‘’。，！？、·…\-–—()]/g, '');
  return lang === 'en' ? base.replace(/\s+/g, ' ').trim() : base.replace(/\s+/g, '');
}

function levenshtein(a: string[], b: string[]) {
  const prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let diag = prev[0];
    prev[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = prev[j];
      prev[j] = Math.min(prev[j] + 1, prev[j - 1] + 1, diag + (a[i - 1] === b[j - 1] ? 0 : 1));
      diag = tmp;
    }
  }
  return prev[b.length];
}

/** 0–100 similarity between what the recognizer heard and the target sentence. */
export function speechScore(heard: string, target: string, lang: PracticeLang) {
  const h = normalizeSpeech(heard, lang);
  const t = normalizeSpeech(target, lang);
  if (!h || !t) return 0;
  // English compares letters without spaces so "can you" vs "canyou" doesn't matter
  const hs = Array.from(lang === 'en' ? h.replace(/ /g, '') : h);
  const ts = Array.from(lang === 'en' ? t.replace(/ /g, '') : t);
  const dist = levenshtein(hs, ts);
  return Math.max(0, Math.round((1 - dist / Math.max(hs.length, ts.length)) * 100));
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** `count` items from `pool` other than `answer`, plus the answer, shuffled. */
export function choicesFor<T>(answer: T, pool: T[], count = 3, key: (t: T) => string = String) {
  const others = shuffle(pool.filter((p) => key(p) !== key(answer)));
  const seen = new Set([key(answer)]);
  const picked: T[] = [];
  for (const o of others) {
    if (picked.length >= count) break;
    if (seen.has(key(o))) continue;
    seen.add(key(o));
    picked.push(o);
  }
  return shuffle([answer, ...picked]);
}

/**
 * Sends correct answers to the server in small batches so learners of every language keep
 * their streak and group points. Flushes every 5 points and when the page is left.
 */
export function usePracticeReporter(lang: PracticeLang) {
  const pending = useRef(0);

  const flush = useRef(() => {
    const points = Math.min(pending.current, 10);
    if (points <= 0) return;
    pending.current -= points;
    const body = JSON.stringify({ lang, points });
    if (document.visibilityState === 'hidden' && navigator.sendBeacon) {
      navigator.sendBeacon('/api/me/practice', new Blob([body], { type: 'application/json' }));
    } else {
      fetch('/api/me/practice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive: true,
      }).catch(() => {});
    }
  });

  useEffect(() => {
    const f = flush.current;
    const onHide = () => document.visibilityState === 'hidden' && f();
    document.addEventListener('visibilitychange', onHide);
    return () => {
      document.removeEventListener('visibilitychange', onHide);
      f();
    };
  }, []);

  return (points = 1) => {
    pending.current += points;
    if (pending.current >= 5) flush.current();
  };
}

/** Small localStorage-backed record (best scores, known cards). */
export function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function saveJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or private mode */
  }
}
