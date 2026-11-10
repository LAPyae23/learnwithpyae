import { NextResponse } from 'next/server';
import { z } from 'zod';
import { jsonError } from '@/lib/auth';
import { getActor } from '@/lib/roles';
import { newInviteCode, systemMessage } from '@/lib/groups';
import { GROUP_MAX_MEMBERS, StudyGroup } from '@/models/Group';
import { ALL_LEVELS, LANG_CODES, isLang, isLevelOf } from '@/data/languages';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const LEVELS = ['mixed', ...ALL_LEVELS] as [string, ...string[]];

const card = (g: {
  _id: unknown;
  [k: string]: unknown;
  name: string;
  description?: string | null;
  level?: string | null;
  language?: string | null;
  emoji?: string | null;
  isPublic?: boolean | null;
  memberCount?: number | null;
  lastMessageAt?: Date | null;
}) => ({
  id: String(g._id),
  name: g.name,
  description: g.description ?? '',
  level: g.level ?? 'mixed',
  language: g.language ?? 'ja',
  emoji: g.emoji ?? '📚',
  isPublic: !!g.isPublic,
  memberCount: g.memberCount ?? 0,
  maxMembers: GROUP_MAX_MEMBERS,
  lastMessageAt: g.lastMessageAt ?? null,
});

/** My groups, plus public groups I can join (?level= to filter). */
export async function GET(req: Request) {
  const actor = await getActor();
  if (!actor) return jsonError('Not signed in', 401);
  const sp = new URL(req.url).searchParams;
  const level = sp.get('level');
  const lang = sp.get('lang');

  const [mine, discover] = await Promise.all([
    StudyGroup.find({ 'members.user': actor.id }).sort({ lastMessageAt: -1, updatedAt: -1 }).lean(),
    StudyGroup.find({
      isPublic: true,
      'members.user': { $ne: actor.id },
      memberCount: { $lt: GROUP_MAX_MEMBERS },
      ...(level && LEVELS.includes(level) ? { level } : {}),
      ...(lang && isLang(lang) ? { language: lang } : {}),
    })
      .sort({ memberCount: -1, lastMessageAt: -1 })
      .limit(30)
      .lean(),
  ]);
  return NextResponse.json({ mine: mine.map(card), discover: discover.map(card) });
}

const Input = z.object({
  name: z.string().trim().min(2, 'အုပ်စု အမည် ထည့်ပါ').max(60),
  description: z.string().trim().max(300).optional(),
  language: z.enum(LANG_CODES).default('ja'),
  level: z.enum(LEVELS),
  emoji: z.string().trim().max(8).optional(),
  isPublic: z.boolean(),
});

/** Create a group (you become its owner). */
export async function POST(req: Request) {
  const actor = await getActor();
  if (!actor) return jsonError('Not signed in', 401);
  const parsed = Input.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? 'Data မမှန်ပါ', 400);

  if (parsed.data.level !== 'mixed' && !isLevelOf(parsed.data.language, parsed.data.level)) {
    return jsonError('ဒီဘာသာစကားအတွက် အဆင့် မမှန်ပါ', 400);
  }
  if ((await StudyGroup.countDocuments({ owner: actor.id })) >= 5) {
    return jsonError('အုပ်စု ၅ ခုထက် ပိုမဖန်တီးနိုင်ပါ', 429);
  }
  if ((await StudyGroup.countDocuments({ 'members.user': actor.id })) >= 10) {
    return jsonError('အုပ်စု ၁၀ ခုထက် ပိုမဝင်နိုင်ပါ', 429);
  }

  let inviteCode = newInviteCode();
  while (await StudyGroup.exists({ inviteCode })) inviteCode = newInviteCode();

  const g = await StudyGroup.create({
    ...parsed.data,
    emoji: parsed.data.emoji || '📚',
    inviteCode,
    owner: actor.id,
    members: [{ user: actor.id, role: 'owner' }],
    memberCount: 1,
  });
  await systemMessage(
    g._id,
    `🎉 ${actor.name} က "${g.name}" အုပ်စုကို ဖန်တီးလိုက်ပါပြီ။ သူငယ်ချင်းတွေကို ဖိတ်ပါ!`
  );
  return NextResponse.json({ id: String(g._id) }, { status: 201 });
}
