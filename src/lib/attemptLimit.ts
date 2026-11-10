import 'server-only';
import { LoginAttempt } from '@/models/LoginAttempt';

/** A named limit: at most `max` counted attempts per `windowMin` minutes for one key. */
export interface Limit {
  key: string;
  max: number;
  windowMin: number;
}

/** The caller's IP as Vercel reports it (first hop of x-forwarded-for). */
export function clientIp(req: Request) {
  const fwd = req.headers.get('x-forwarded-for');
  return fwd?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
}

/** Minutes until the first exhausted limit resets, or null if none is exhausted. */
export async function blockedFor(limits: Limit[]): Promise<number | null> {
  const rows = await LoginAttempt.find({
    key: { $in: limits.map((l) => l.key) },
    expiresAt: { $gt: new Date() },
  }).lean();
  let wait: number | null = null;
  for (const l of limits) {
    const row = rows.find((r) => r.key === l.key);
    if (row && row.count >= l.max) {
      const mins = Math.max(1, Math.ceil((row.expiresAt.getTime() - Date.now()) / 60_000));
      wait = Math.max(wait ?? 0, mins);
    }
  }
  return wait;
}

/** Counts one attempt against each limit; a window starts at the first attempt after the last one ended. */
export async function countAttempt(limits: Limit[]) {
  const now = new Date();
  await Promise.all(
    limits.map(async (l) => {
      // Start a fresh window if the old one has ended (TTL cleanup can lag up to a minute)
      await LoginAttempt.deleteOne({ key: l.key, expiresAt: { $lte: now } });
      await LoginAttempt.updateOne(
        { key: l.key },
        {
          $inc: { count: 1 },
          $setOnInsert: { expiresAt: new Date(now.getTime() + l.windowMin * 60_000) },
        },
        { upsert: true }
      ).catch((e: { code?: number }) => {
        // Two requests inserting the same key at once: the loser just counts on the winner's row
        if (e?.code !== 11000) throw e;
        return LoginAttempt.updateOne({ key: l.key }, { $inc: { count: 1 } });
      });
    })
  );
}

export async function clearAttempts(keys: string[]) {
  await LoginAttempt.deleteMany({ key: { $in: keys } });
}

export const tooManyMessage = (mins: number) =>
  `ကြိုးစားမှု အကြိမ်ရေ များနေပါတယ်။ ${mins} မိနစ် နေမှ ပြန်ကြိုးစားပါ။`;
