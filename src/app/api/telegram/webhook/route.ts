import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { connectDB } from '@/lib/db';
import { dueCount, formatWordOfTheDay, sendTelegram, siteUrl } from '@/lib/telegram';
import { User } from '@/models/User';

export const runtime = 'nodejs';

interface TgUpdate {
  message?: { chat: { id: number; type: string }; text?: string };
}

const HELP = [
  '🌸 <b>NihongoAcademy Bot</b>',
  '/word — ဒီနေ့ စကားလုံး',
  '/due — ပြန်လှန်ရမယ့် flashcard အရေအတွက်',
  '/reminders_on — နေ့စဉ် သတိပေးချက် ဖွင့်',
  '/reminders_off — နေ့စဉ် သတိပေးချက် ပိတ်',
  '/stop — အကောင့် ချိတ်ဆက်မှု ဖြုတ်',
].join('\n');

function secretOk(req: Request) {
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET;
  const got = req.headers.get('x-telegram-bot-api-secret-token');
  if (!expected || !got) return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(got);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/** Telegram calls this for every message sent to the bot. */
export async function POST(req: Request) {
  if (!secretOk(req)) return new NextResponse('forbidden', { status: 403 });

  const update = (await req.json().catch(() => null)) as TgUpdate | null;
  const msg = update?.message;
  // Always answer 200 so Telegram doesn't retry; only handle private text messages.
  if (!msg?.text || msg.chat.type !== 'private') return NextResponse.json({ ok: true });

  const chatId = String(msg.chat.id);
  const [command, arg] = msg.text.trim().split(/\s+/, 2);

  try {
    await connectDB();

    if (command === '/start' && arg) {
      const user = await User.findOneAndUpdate(
        { 'telegram.linkCode': arg, 'telegram.linkCodeExpiresAt': { $gt: new Date() } },
        {
          $set: {
            'telegram.chatId': chatId,
            'telegram.linkedAt': new Date(),
            'telegram.remindersOn': true,
            'telegram.linkCode': null,
            'telegram.linkCodeExpiresAt': null,
          },
        },
        { returnDocument: 'after' }
      ).lean();
      if (!user) {
        await sendTelegram(
          chatId,
          'ချိတ်ဆက်ကုဒ် မမှန်ပါ၊ ဒါမှမဟုတ် သက်တမ်းကုန်သွားပါပြီ။ Website ကနေ ပြန်ချိတ်ပါ။'
        );
      } else {
        // A Telegram chat can belong to only one account
        await User.updateMany(
          { _id: { $ne: user._id }, 'telegram.chatId': chatId },
          { $set: { 'telegram.chatId': null } }
        );
        await sendTelegram(
          chatId,
          `✅ ${user.name} အကောင့်နဲ့ ချိတ်ပြီးပါပြီ! မနက်တိုင်း ၈ နာရီမှာ သတိပေးပါမယ်။\n\n${HELP}`
        );
      }
      return NextResponse.json({ ok: true });
    }

    const user = await User.findOne({ 'telegram.chatId': chatId }).select('name streak').lean();
    if (!user) {
      await sendTelegram(
        chatId,
        `အကောင့် မချိတ်ရသေးပါ။ ${siteUrl()}/profile မှာ "Telegram ချိတ်မယ်" ကို နှိပ်ပါ။\n\n${formatWordOfTheDay()}`
      );
      return NextResponse.json({ ok: true });
    }

    switch (command) {
      case '/word':
        await sendTelegram(chatId, formatWordOfTheDay());
        break;
      case '/due': {
        const due = await dueCount(String(user._id));
        await sendTelegram(
          chatId,
          due > 0
            ? `🔁 ပြန်လှန်ရမယ့် ကတ် <b>${due}</b> ခု ရှိပါတယ်။\n👉 ${siteUrl()}/flashcards`
            : '✨ ပြန်လှန်ရမယ့် ကတ် မရှိပါ။'
        );
        break;
      }
      case '/reminders_on':
      case '/reminders_off':
        await User.updateOne(
          { _id: user._id },
          { $set: { 'telegram.remindersOn': command === '/reminders_on' } }
        );
        await sendTelegram(
          chatId,
          command === '/reminders_on'
            ? '🔔 သတိပေးချက် ဖွင့်ပြီးပါပြီ'
            : '🔕 သတိပေးချက် ပိတ်ပြီးပါပြီ'
        );
        break;
      case '/stop':
        await User.updateOne({ _id: user._id }, { $set: { 'telegram.chatId': null } });
        await sendTelegram(
          chatId,
          'ချိတ်ဆက်မှု ဖြုတ်ပြီးပါပြီ။ ပြန်ချိတ်ချင်ရင် website ကနေ ချိတ်ပါ။'
        );
        break;
      default:
        await sendTelegram(chatId, HELP);
    }
  } catch (err) {
    console.error('Telegram webhook error', err);
  }
  return NextResponse.json({ ok: true });
}
