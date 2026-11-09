import { User } from '@/models/User';

/** Calendar day in Myanmar time (UTC+6:30), so a streak day matches the learner's local midnight. */
export function yangonDay(d = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Yangon' }).format(d); // YYYY-MM-DD
}

function previousDay(day: string) {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

/** Call after any study activity. Idempotent within a day. */
export async function touchStreak(userId: string) {
  const user = await User.findById(userId).select('streak');
  if (!user) return;
  const today = yangonDay();
  const last = user.streak?.lastStudyDay ?? null;
  if (last === today) return;

  const current = last === previousDay(today) ? (user.streak?.current ?? 0) + 1 : 1;
  const longest = Math.max(user.streak?.longest ?? 0, current);
  await User.updateOne(
    { _id: userId },
    { $set: { 'streak.current': current, 'streak.longest': longest, 'streak.lastStudyDay': today } }
  );
}
