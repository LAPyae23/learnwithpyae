import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { connectDB } from '@/lib/db';
import { getSession, jsonError } from '@/lib/auth';
import { telegramConfigured } from '@/lib/telegram';
import { User } from '@/models/User';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BOT = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;

export async function GET() {
  const session = await getSession();
  if (!session) return jsonError('Not signed in', 401);
  await connectDB();
  const user = await User.findById(session.sub).select('telegram').lean();
  return NextResponse.json({
    enabled: telegramConfigured() && !!BOT,
    linked: !!user?.telegram?.chatId,
    remindersOn: user?.telegram?.remindersOn ?? true,
  });
}

/** Creates a one-time code and returns the t.me deep link that connects this account. */
export async function POST() {
  const session = await getSession();
  if (!session) return jsonError('Not signed in', 401);
  if (!telegramConfigured() || !BOT) return jsonError('Telegram bot ကို မဖွင့်ရသေးပါ', 503);

  const code = crypto.randomBytes(12).toString('base64url');
  await connectDB();
  await User.updateOne(
    { _id: session.sub },
    {
      $set: {
        'telegram.linkCode': code,
        'telegram.linkCodeExpiresAt': new Date(Date.now() + 15 * 60 * 1000),
      },
    }
  );
  return NextResponse.json({ url: `https://t.me/${BOT}?start=${code}` });
}

/** Disconnects Telegram or toggles reminders. */
export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session) return jsonError('Not signed in', 401);
  const body = (await req.json().catch(() => ({}))) as { unlink?: boolean; remindersOn?: boolean };
  await connectDB();
  if (body.unlink) {
    await User.updateOne(
      { _id: session.sub },
      { $set: { 'telegram.chatId': null, 'telegram.linkedAt': null } }
    );
  } else if (typeof body.remindersOn === 'boolean') {
    await User.updateOne(
      { _id: session.sub },
      { $set: { 'telegram.remindersOn': body.remindersOn } }
    );
  }
  return NextResponse.json({ ok: true });
}
