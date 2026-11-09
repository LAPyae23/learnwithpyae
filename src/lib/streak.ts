import { Types } from 'mongoose';
import { User } from '@/models/User';
import { DailyActivity } from '@/models/Group';

/** Calendar day in Myanmar time (UTC+6:30), so a streak day matches the learner's local midnight. */
export function yangonDay(d = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Yangon' }).format(d); // YYYY-MM-DD
}

function previousDay(day: string) {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

export { previousDay };

/**
 * Call after any study activity. The streak part is idempotent within a day; `points` are added
 * to today's activity (used by study-group streaks and leaderboards).
 */
export async function touchStreak(userId: string, points = 1) {
  const today = yangonDay();
  await DailyActivity.updateOne(
    { user: new Types.ObjectId(userId), day: today },
    { $inc: { points }, $setOnInsert: { createdAt: new Date() } },
    { upsert: true }
  );
  const user = await User.findById(userId).select('streak');
  if (!user) return;
  const last = user.streak?.lastStudyDay ?? null;
  if (last === today) return;

  const current = last === previousDay(today) ? (user.streak?.current ?? 0) + 1 : 1;
  const longest = Math.max(user.streak?.longest ?? 0, current);
  await User.updateOne(
    { _id: userId },
    { $set: { 'streak.current': current, 'streak.longest': longest, 'streak.lastStudyDay': today } }
  );

  // Learn to earn (imported lazily to avoid a circular import through the Telegram helpers)
  try {
    const { onFirstStudy, onStreak } = await import('./premium');
    if (!last) await onFirstStudy(userId);
    await onStreak(userId, current, today);
  } catch (e) {
    console.error('reward check failed', e);
  }
}
