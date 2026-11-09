import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { dailyReminderText, dueCount, sendTelegram, telegramConfigured } from '@/lib/telegram';
import { User } from '@/models/User';

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
  if (!telegramConfigured()) return NextResponse.json({ skipped: 'telegram not configured' });

  await connectDB();
  const users = await User.find({ 'telegram.chatId': { $ne: null }, 'telegram.remindersOn': true })
    .select('name telegram.chatId streak.current')
    .lean();

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
  return NextResponse.json({ users: users.length, sent, failed });
}
