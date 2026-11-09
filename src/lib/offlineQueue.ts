'use client';
/**
 * Flashcard answers made while offline are queued in localStorage and sent when the
 * connection returns, with their original timestamps so scheduling stays correct.
 */
import { api, ApiError } from './api';

const KEY = 'na_review_queue_v1';

interface QueuedReview {
  cardId: string;
  difficulty: 'again' | 'hard' | 'good' | 'easy';
  reviewedAt: string;
}

function read(): QueuedReview[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}
function write(q: QueuedReview[]) {
  localStorage.setItem(KEY, JSON.stringify(q.slice(-500)));
}

export function pendingReviewCount() {
  return typeof window === 'undefined' ? 0 : read().length;
}

/** Sends one review; queues it if the network is unavailable. Returns 'sent' | 'queued'. */
export async function submitReview(
  cardId: string,
  difficulty: QueuedReview['difficulty']
): Promise<'sent' | 'queued'> {
  const item: QueuedReview = { cardId, difficulty, reviewedAt: new Date().toISOString() };
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    write([...read(), item]);
    return 'queued';
  }
  try {
    await api('/api/reviews', { method: 'POST', json: item });
    return 'sent';
  } catch (err) {
    if (err instanceof ApiError && err.status === 0) {
      write([...read(), item]);
      return 'queued';
    }
    throw err;
  }
}

let flushing = false;
/** Sends queued reviews in order. Stops at the first network failure. */
export async function flushReviewQueue(): Promise<number> {
  if (flushing || typeof window === 'undefined') return 0;
  flushing = true;
  let sent = 0;
  try {
    let queue = read();
    while (queue.length) {
      try {
        await api('/api/reviews', { method: 'POST', json: queue[0] });
      } catch (err) {
        if (err instanceof ApiError && err.status === 0) break; // still offline
        // Any other error (e.g. card deleted) — drop that item so the queue doesn't get stuck
      }
      queue = queue.slice(1);
      write(queue);
      sent++;
    }
  } finally {
    flushing = false;
  }
  return sent;
}
