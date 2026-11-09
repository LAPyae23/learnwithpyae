import { NextResponse } from 'next/server';
import { z } from 'zod';
import { jsonError } from '@/lib/auth';
import { canTeach, getActor } from '@/lib/roles';
import { Ticket, TICKET_CATEGORIES } from '@/models/Ticket';
import '@/models/User';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Teachers: my tickets. Admins: all tickets (?status=open|answered|closed). */
export async function GET(req: Request) {
  const actor = await getActor();
  if (!actor) return jsonError('Not signed in', 401);
  if (!canTeach(actor.role)) return jsonError('Forbidden', 403);

  const isAdmin = actor.role === 'admin';
  const status = new URL(req.url).searchParams.get('status');
  const filter: Record<string, unknown> = isAdmin ? {} : { user: actor.id };
  if (status === 'open' || status === 'answered' || status === 'closed') filter.status = status;

  const tickets = await Ticket.find(filter)
    .sort({ lastMessageAt: -1 })
    .limit(200)
    .select('user subject category status unreadByAdmin unreadByUser lastMessageAt messages')
    .populate<{ user: { _id: unknown; name: string; email: string } | null }>('user', 'name email')
    .lean();

  return NextResponse.json({
    isAdmin,
    tickets: tickets.map((t) => ({
      id: String(t._id),
      subject: t.subject,
      category: t.category,
      status: t.status,
      user: t.user ? { id: String(t.user._id), name: t.user.name, email: t.user.email } : null,
      unread: isAdmin ? t.unreadByAdmin : t.unreadByUser,
      lastMessageAt: t.lastMessageAt,
      preview: t.messages.at(-1)?.text.slice(0, 120) ?? '',
      count: t.messages.length,
    })),
  });
}

const Input = z.object({
  subject: z.string().trim().min(2, 'ခေါင်းစဉ် ထည့်ပါ').max(140),
  category: z.enum(TICKET_CATEGORIES),
  text: z.string().trim().min(2, 'စာ ရေးပါ').max(3000),
});

/** Teacher (or admin) opens a new ticket. */
export async function POST(req: Request) {
  const actor = await getActor();
  if (!actor) return jsonError('Not signed in', 401);
  if (!canTeach(actor.role)) return jsonError('ဆရာ အကောင့်နဲ့ပဲ ပို့လို့ရပါတယ်', 403);
  const parsed = Input.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? 'Data မမှန်ပါ', 400);

  const open = await Ticket.countDocuments({ user: actor.id, status: 'open' });
  if (open >= 10) return jsonError('ဖြေမပြီးသေးတဲ့ စာ ၁၀ စောင် ရှိနေပါတယ်။ ခဏစောင့်ပါ။', 429);

  const t = await Ticket.create({
    user: actor.id,
    subject: parsed.data.subject,
    category: parsed.data.category,
    messages: [{ author: actor.id, fromAdmin: false, text: parsed.data.text }],
  });
  return NextResponse.json({ id: String(t._id) }, { status: 201 });
}
