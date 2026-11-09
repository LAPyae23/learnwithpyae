// JLPT is held on the first Sunday of July and December.
function firstSunday(year: number, monthIndex: number) {
  const d = new Date(year, monthIndex, 1);
  d.setDate(1 + ((7 - d.getDay()) % 7));
  return d;
}

export function nextJlptDate(from: Date = new Date()) {
  const today = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  for (const year of [today.getFullYear(), today.getFullYear() + 1]) {
    for (const month of [6, 11]) {
      const d = firstSunday(year, month);
      if (d >= today) return d;
    }
  }
  return firstSunday(today.getFullYear() + 1, 6);
}

/** The next `count` JLPT sessions starting from today (inclusive). */
export function upcomingJlptSessions(count = 3, from: Date = new Date()) {
  const sessions: Date[] = [];
  let cursor = from;
  while (sessions.length < count) {
    const d = nextJlptDate(cursor);
    sessions.push(d);
    cursor = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
  }
  return sessions;
}

export function daysUntil(target: Date, from: Date = new Date()) {
  const diff = Math.ceil((target.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(diff, 0);
}

const MY_MONTHS = [
  'ဇန်နဝါရီ',
  'ဖေဖော်ဝါရီ',
  'မတ်',
  'ဧပြီ',
  'မေ',
  'ဇွန်',
  'ဇူလိုင်',
  'ဩဂုတ်',
  'စက်တင်ဘာ',
  'အောက်တိုဘာ',
  'နိုဝင်ဘာ',
  'ဒီဇင်ဘာ',
];

/** Browsers don't ship a Burmese date locale, so format by hand: "2026 ဒီဇင်ဘာ 6". */
export function formatMyDate(d: Date) {
  return `${d.getFullYear()} ${MY_MONTHS[d.getMonth()]} ${d.getDate()}`;
}

export function jlptSessionLabel(d: Date) {
  return `${d.getFullYear()} ${d.getMonth() === 6 ? 'ဇူလိုင်' : 'ဒီဇင်ဘာ'}`;
}
