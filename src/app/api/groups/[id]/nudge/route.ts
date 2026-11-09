import { NextResponse } from 'next/server';
import { z } from 'zod';
import { jsonError } from '@/lib/auth';
import { groupForActor, isMember, systemMessage } from '@/lib/groups';
import { yangonDay } from '@/lib/streak';
import { sendTelegram, siteUrl, telegramConfigured } from '@/lib/telegram';
import { Nudge } from '@/models/Group';
import { User } from '@/models/User';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const Input = z.object({ userId: z.string() });

/** Remind a group member to study today. Once per person per day; Telegram if connected. */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const r = await groupForActor((await params).id);
  if ('error' in r) return jsonError(r.error, r.status);
  if (!r.member) return jsonError('ဒီအုပ်စုထဲ မဝင်ရသေးပါ', 403);
  const parsed = Input.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError('Data မမှန်ပါ', 400);
  const { userId } = parsed.data;
  if (userId === r.actor.id) return jsonError('ကိုယ့်ကိုယ်ကို နှိုးဆော်လို့ မရပါ 😄', 400);
  if (!isMember(r.group, userId)) return jsonError('Member မဟုတ်ပါ', 404);

  try {
    await Nudge.create({ from: r.actor.id, to: userId, day: yangonDay() });
  } catch {
    return jsonError('ဒီနေ့ နှိုးဆော်ပြီးပါပြီ', 409);
  }

  const target = await User.findById(userId).select('name telegram').lean();
  let telegram = false;
  if (target?.telegram?.chatId && telegramConfigured()) {
    telegram = true;
    sendTelegram(
      target.telegram.chatId,
      `👋 ${r.actor.name} က "${r.group.name}" အုပ်စုကနေ နှိုးဆော်နေပါတယ် — ဒီနေ့ စာလုပ်ပြီးပြီလား? 🔥\n${siteUrl()}/flashcards`
    ).catch((e) => console.error('nudge failed', e));
  }
  await systemMessage(
    r.group._id,
    `👋 ${r.actor.name} က ${target?.name ?? ''} ကို စာလုပ်ဖို့ နှိုးဆော်လိုက်တယ်`
  );
  return NextResponse.json({ ok: true, telegram });
}
