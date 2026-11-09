import { NextResponse } from 'next/server';
import { isValidObjectId } from 'mongoose';
import { z } from 'zod';
import { jsonError } from '@/lib/auth';
import { getActor } from '@/lib/roles';
import { sendTelegram, telegramConfigured } from '@/lib/telegram';
import { Ticket } from '@/models/Ticket';
import { User } from '@/models/User';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

async function load(id: string) {
  const actor = await getActor();
  if (!actor) return { error: jsonError('Not signed in', 401) };
  if (!isValidObjectId(id)) return { error: jsonError('မတွေ့ပါ', 404) };
  const ticket = await Ticket.findById(id);
  if (!ticket) return { error: jsonError('မတွေ့ပါ', 404) };
  const isAdmin = actor.role === 'admin';
  if (!isAdmin && String(ticket.user) !== actor.id) return { error: jsonError('မတွေ့ပါ', 404) };
  return { actor, ticket, isAdmin };
}

/** The full conversation. Opening it marks it read for the viewer's side. */
export async function GET(_req: Request, { params }: Ctx) {
  const r = await load((await params).id);
  if ('error' in r) return r.error;
  const { ticket, isAdmin } = r;
  if (isAdmin ? ticket.unreadByAdmin : ticket.unreadByUser) {
    ticket.set(isAdmin ? 'unreadByAdmin' : 'unreadByUser', false);
    await ticket.save();
  }
  await ticket.populate([
    { path: 'user', select: 'name email' },
    { path: 'messages.author', select: 'name' },
  ]);
  const t = ticket.toObject() as unknown as {
    _id: unknown;
    subject: string;
    category: string;
    status: string;
    createdAt: Date;
    user: { _id: unknown; name: string; email: string } | null;
    messages: { author: { name: string } | null; fromAdmin: boolean; text: string; at: Date }[];
  };
  return NextResponse.json({
    isAdmin,
    ticket: {
      id: String(t._id),
      subject: t.subject,
      category: t.category,
      status: t.status,
      createdAt: t.createdAt,
      user: t.user ? { id: String(t.user._id), name: t.user.name, email: t.user.email } : null,
      messages: t.messages.map((m) => ({
        author: m.author?.name ?? '',
        fromAdmin: m.fromAdmin,
        text: m.text,
        at: m.at,
      })),
    },
  });
}

const Input = z.union([
  z.object({ text: z.string().trim().min(1, 'စာ ရေးပါ').max(3000) }),
  z.object({ status: z.enum(['open', 'closed']) }),
]);

/** Reply, or close / reopen. */
export async function POST(req: Request, { params }: Ctx) {
  const r = await load((await params).id);
  if ('error' in r) return r.error;
  const { actor, ticket, isAdmin } = r;
  const parsed = Input.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? 'Data မမှန်ပါ', 400);

  if ('status' in parsed.data) {
    ticket.status = parsed.data.status;
    await ticket.save();
    return NextResponse.json({ ok: true, status: ticket.status });
  }

  if (ticket.messages.length >= 200) return jsonError('စာ အရမ်းများနေပါပြီ။ စာအသစ် ဖွင့်ပါ။', 400);
  ticket.messages.push({
    author: actor.id,
    fromAdmin: isAdmin,
    text: parsed.data.text,
    at: new Date(),
  });
  ticket.status = isAdmin ? 'answered' : 'open';
  ticket.unreadByAdmin = !isAdmin;
  ticket.unreadByUser = isAdmin;
  ticket.lastMessageAt = new Date();
  await ticket.save();

  // Tell the teacher on Telegram when an admin replies (best effort)
  if (isAdmin && telegramConfigured()) {
    const u = await User.findById(ticket.user).select('telegram').lean();
    if (u?.telegram?.chatId) {
      sendTelegram(
        u.telegram.chatId,
        `📩 Admin က "${ticket.subject}" ကို ပြန်ဖြေထားပါတယ်။ website ရဲ့ "စာများ" မှာ ကြည့်ပါ။`
      ).catch((e) => console.error('notify failed', e));
    }
  }
  return NextResponse.json({ ok: true, status: ticket.status });
}
