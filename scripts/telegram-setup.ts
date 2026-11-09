/**
 * Registers the Telegram webhook and bot commands. Run once after deploying:
 *
 *   npm run telegram:setup -- .env.production.local
 *
 * Needs TELEGRAM_BOT_TOKEN, TELEGRAM_WEBHOOK_SECRET and NEXT_PUBLIC_SITE_URL (your https Vercel URL).
 */
import fs from 'node:fs';

for (const f of [process.argv[2], '.env.local', '.env'].filter(Boolean) as string[]) {
  if (fs.existsSync(f)) process.loadEnvFile(f);
}

const { TELEGRAM_BOT_TOKEN, TELEGRAM_WEBHOOK_SECRET, NEXT_PUBLIC_SITE_URL } = process.env;

async function call(method: string, body: unknown) {
  const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  console.info(method, json.ok ? 'ok' : json);
  if (!json.ok) process.exitCode = 1;
}

async function main() {
  if (
    !TELEGRAM_BOT_TOKEN ||
    !TELEGRAM_WEBHOOK_SECRET ||
    !NEXT_PUBLIC_SITE_URL?.startsWith('https://')
  ) {
    throw new Error(
      'Set TELEGRAM_BOT_TOKEN, TELEGRAM_WEBHOOK_SECRET and an https NEXT_PUBLIC_SITE_URL'
    );
  }
  await call('setWebhook', {
    url: `${NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')}/api/telegram/webhook`,
    secret_token: TELEGRAM_WEBHOOK_SECRET,
    allowed_updates: ['message'],
    drop_pending_updates: true,
  });
  await call('setMyCommands', {
    commands: [
      { command: 'word', description: 'ဒီနေ့ စကားလုံး' },
      { command: 'due', description: 'ပြန်လှန်ရမယ့် flashcard' },
      { command: 'reminders_on', description: 'သတိပေးချက် ဖွင့်' },
      { command: 'reminders_off', description: 'သတိပေးချက် ပိတ်' },
      { command: 'stop', description: 'ချိတ်ဆက်မှု ဖြုတ်' },
    ],
  });
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
