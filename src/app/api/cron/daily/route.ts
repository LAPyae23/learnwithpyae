import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { dailyReminderText, dueCount, sendTelegram, telegramConfigured } from '@/lib/telegram';
import { User } from '@/models/User';
import { awardWeeklyGroupWinners } from '@/lib/groups';
import { fmtClassTime } from '@/lib/tutoring';
import { Booking } from '@/models/Tutoring';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

/**
 * Daily Telegram reminders. Vercel Cron calls this with `Authorization: Bearer $CRON_SECRET`
 * (schedule in vercel.json: 01:30 UTC = 08:00 Myanmar time).
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return new NextResponse('unauthorized', { status: 401 });
  }
  await connectDB();
  // Local testing only: ?day=YYYY-MM-DD pretends it's that day
  const testDay =
    process.env.NODE_ENV !== 'production' ? new URL(req.url).searchParams.get('day') : null;
  const prizes = await awardWeeklyGroupWinners(testDay ?? undefined).catch((e) => {
    console.error('group prizes failed', e);
    return { error: true };
  });
  if (!telegramConfigured())
    return NextResponse.json({ prizes, skipped: 'telegram not configured' });

  const users = await User.find({ 'telegram.chatId': { $ne: null }, 'telegram.remindersOn': true })
    .select('name telegram.chatId streak.current')
    .lean();

  // Today's 1-on-1 classes (next 24 h): remind teacher and student
  const soon = await Booking.find({
    status: 'confirmed',
    startAt: { $gt: new Date(), $lt: new Date(Date.now() + 86400000) },
  })
    .populate<{
      teacher: { name: string; telegram?: { chatId?: string | null } } | null;
      student: { name: string; telegram?: { chatId?: string | null } } | null;
    }>([
      { path: 'teacher', select: 'name telegram.chatId' },
      { path: 'student', select: 'name telegram.chatId' },
    ])
    .lean();
  for (const b of soon) {
    const when = fmtClassTime(b.startAt);
    const link = b.meetingLink ? `\n🔗 ${b.meetingLink}` : '\n(meeting link မထည့်ရသေးပါ)';
    for (const [who, other] of [
      [b.student, b.teacher],
      [b.teacher, b.student],
    ] as const) {
      if (who?.telegram?.chatId) {
        await sendTelegram(
          who.telegram.chatId,
          `⏰ ဒီနေ့ ${when} — ${other?.name ?? ''} နဲ့ 1-on-1 class ရှိပါတယ်${link}`
        ).catch(() => {});
      }
    }
  }

  let sent = 0;
  let failed = 0;
  for (const u of users) {
    try {
      const due = await dueCount(String(u._id));
      await sendTelegram(
        u.telegram!.chatId!,
        dailyReminderText(u.name, due, u.streak?.current ?? 0)
      );
      sent++;
    } catch (err) {
      failed++;
      console.error('reminder failed', String(u._id), err);
    }
    // Telegram allows ~30 messages/second; stay well under it
    await new Promise((r) => setTimeout(r, 50));
  }
  return NextResponse.json({ prizes, users: users.length, sent, failed });
}
