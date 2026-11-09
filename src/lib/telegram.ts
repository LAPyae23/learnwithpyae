import 'server-only';
import { Types } from 'mongoose';
import { cards } from '@/data/flashcards';
import { CardReview } from '@/models/Flashcard';
import { yangonDay } from './streak';

export function telegramConfigured() {
  return !!process.env.TELEGRAM_BOT_TOKEN;
}

export async function sendTelegram(chatId: string, text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error('TELEGRAM_BOT_TOKEN not set');
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Telegram sendMessage ${res.status}: ${body.slice(0, 200)}`);
  }
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Same word for everyone on a given (Myanmar) day, rotating through the vocabulary cards. */
export function wordOfTheDay(day = yangonDay()) {
  const vocab = cards.filter((c) => c.deck.endsWith('-vocab'));
  const n = [...day].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7);
  return vocab[n % vocab.length];
}

export function formatWordOfTheDay() {
  const w = wordOfTheDay();
  return [
    '📖 <b>ဒီနေ့ စကားလုံး</b>',
    `<b>${escapeHtml(w.front)}</b>（${escapeHtml(w.reading)}）— ${escapeHtml(w.back)}`,
    `${escapeHtml(w.example)}`,
    `<i>${escapeHtml(w.exampleMy)}</i>`,
  ].join('\n');
}

export async function dueCount(userId: string) {
  return CardReview.countDocuments({
    user: new Types.ObjectId(userId),
    dueAt: { $lte: new Date() },
  });
}

export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:4028').replace(/\/$/, '');
}

export function dailyReminderText(name: string, due: number, streak: number) {
  const lines = [`おはようございます、${escapeHtml(name)} 🌸`];
  if (due > 0) lines.push(`🔁 ဒီနေ့ ပြန်လှန်ရမယ့် flashcard <b>${due}</b> ခု ရှိပါတယ်။`);
  else lines.push('✨ ပြန်လှန်ရမယ့် ကတ် မရှိပါ — ကတ်အသစ် နည်းနည်း သင်ကြည့်ပါ။');
  if (streak > 0) lines.push(`🔥 ဆက်တိုက် <b>${streak}</b> ရက် — ဒီနေ့လည်း မပြတ်ပါစေနဲ့!`);
  lines.push('', formatWordOfTheDay(), '', `👉 ${siteUrl()}/flashcards`);
  return lines.join('\n');
}
