import 'server-only';
import { sendTelegram, siteUrl, telegramConfigured } from './telegram';
import { User } from '@/models/User';

/** "12 Nov, 19:00" in Myanmar time. */
export const fmtClassTime = (d: Date) =>
  new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Yangon',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);

/** Price for a slot: hourly rate × length, rounded to 500 Ks. */
export const slotPrice = (pricePerHour: number, minutes: number) =>
  Math.round((pricePerHour * minutes) / 60 / 500) * 500;

export async function tellUser(userId: unknown, text: string) {
  if (!telegramConfigured()) return;
  const u = await User.findById(userId).select('telegram').lean();
  if (u?.telegram?.chatId) {
    sendTelegram(u.telegram.chatId, `${text}\n${siteUrl()}/classes`).catch(() => {});
  }
}

export interface BookingLike {
  _id: unknown;
  startAt: Date;
  durationMin: number;
  price: number;
  topic?: string | null;
  status: string;
  meetingLink?: string | null;
  note?: string | null;
  review?: { stars?: number | null; text?: string | null; at?: Date | null } | null;
  createdAt?: Date;
}

/** Booking as shown to its student or teacher. The meeting link only once confirmed. */
export function bookingView(
  b: BookingLike,
  people: {
    teacher?: { _id: unknown; name: string } | null;
    student?: { _id: unknown; name: string } | null;
  }
) {
  return {
    id: String(b._id),
    startAt: b.startAt,
    durationMin: b.durationMin,
    price: b.price,
    topic: b.topic ?? '',
    status: b.status,
    meetingLink: b.status === 'confirmed' || b.status === 'completed' ? (b.meetingLink ?? '') : '',
    note: b.note ?? '',
    review: b.review?.stars
      ? { stars: b.review.stars, text: b.review.text ?? '', at: b.review.at }
      : null,
    teacher: people.teacher ? { id: String(people.teacher._id), name: people.teacher.name } : null,
    student: people.student ? { id: String(people.student._id), name: people.student.name } : null,
    createdAt: b.createdAt,
  };
}
