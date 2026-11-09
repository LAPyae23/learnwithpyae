import { NextResponse } from 'next/server';
import { z } from 'zod';
import { jsonError } from '@/lib/auth';
import { groupForActor } from '@/lib/groups';
import { GroupMessage, StudyGroup } from '@/models/Group';
import '@/models/User';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

interface Row {
  _id: unknown;
  text: string;
  kind: string;
  createdAt: Date;
  user: {
    _id: unknown;
    name: string;
    role?: string;
    plan?: { type?: string; expiresAt?: Date | null };
  } | null;
}

const view = (m: Row, me: string) => ({
  id: String(m._id),
  text: m.text,
  kind: m.kind,
  createdAt: m.createdAt,
  user: m.user
    ? {
        id: String(m.user._id),
        name: m.user.name,
        isTeacher: m.user.role === 'teacher',
        isSupporter:
          !!m.user.plan?.expiresAt &&
          m.user.plan.type !== 'free' &&
          new Date(m.user.plan.expiresAt) > new Date(),
      }
    : null,
  mine: !!m.user && String(m.user._id) === me,
});

/** Latest 60 messages, or only newer ones with ?after=<ISO date> (the page polls this). */
export async function GET(req: Request, { params }: Ctx) {
  const r = await groupForActor((await params).id);
  if ('error' in r) return jsonError(r.error, r.status);
  const after = new URL(req.url).searchParams.get('after');
  const since = after ? new Date(after) : null;

  const rows = await GroupMessage.find({
    group: r.group._id,
    ...(since && !isNaN(+since) ? { createdAt: { $gt: since } } : {}),
  })
    .sort({ createdAt: -1 })
    .limit(60)
    .populate('user', 'name role plan')
    .lean<Row[]>();
  return NextResponse.json({ messages: rows.reverse().map((m) => view(m, r.actor.id)) });
}

const Input = z.object({ text: z.string().trim().min(1, 'စာ ရေးပါ').max(1000) });
const recent = new Map<string, number[]>();

export async function POST(req: Request, { params }: Ctx) {
  const r = await groupForActor((await params).id);
  if ('error' in r) return jsonError(r.error, r.status);
  if (!r.member) return jsonError('ဒီအုပ်စုထဲ မဝင်ရသေးပါ', 403);
  const parsed = Input.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? 'Data မမှန်ပါ', 400);

  // Flood protection: 15 messages per minute per user
  const now = Date.now();
  const times = (recent.get(r.actor.id) ?? []).filter((t) => now - t < 60_000);
  if (times.length >= 15) return jsonError('ခဏနားပြီးမှ ပြန်ရေးပါ', 429);
  recent.set(r.actor.id, [...times, now]);

  const m = await GroupMessage.create({
    group: r.group._id,
    user: r.actor.id,
    text: parsed.data.text,
  });
  await StudyGroup.updateOne({ _id: r.group._id }, { lastMessageAt: new Date() });
  await m.populate('user', 'name role plan');
  return NextResponse.json({ message: view(m.toObject() as never, r.actor.id) }, { status: 201 });
}
