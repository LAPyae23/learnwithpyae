import { NextResponse } from 'next/server';
import { z } from 'zod';
import { jsonError } from '@/lib/auth';
import { groupForActor, groupProgress, systemMessage } from '@/lib/groups';
import { GroupMessage, GROUP_MAX_MEMBERS, StudyGroup } from '@/models/Group';
import { User } from '@/models/User';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

/** Group detail: members with today's status, group streak, weekly leaderboard. */
export async function GET(_req: Request, { params }: Ctx) {
  const r = await groupForActor((await params).id, { allowNonMember: true });
  if ('error' in r) return jsonError(r.error, r.status);
  const { actor, group, member } = r;

  // Non-members only see a public preview
  if (!member && actor.role !== 'admin') {
    if (!group.isPublic) return jsonError('ဒီအုပ်စုက ဖိတ်ခေါ်မှ ဝင်လို့ရပါတယ်', 403);
    return NextResponse.json({
      member: false,
      group: {
        id: String(group._id),
        name: group.name,
        description: group.description,
        level: group.level,
        emoji: group.emoji,
        memberCount: group.memberCount,
        maxMembers: GROUP_MAX_MEMBERS,
        isPublic: group.isPublic,
      },
    });
  }

  const ids = group.members.map((m) => String(m.user));
  const [users, progress] = await Promise.all([
    User.find({ _id: { $in: ids } })
      .select('name role targetLevel streak.current')
      .lean(),
    groupProgress(ids),
  ]);
  const byId = new Map(users.map((u) => [String(u._id), u]));
  const active = new Set(progress.activeToday);

  const members = group.members
    .map((m) => {
      const u = byId.get(String(m.user));
      const w = progress.week[String(m.user)] ?? { points: 0, days: 0 };
      return {
        id: String(m.user),
        name: u?.name ?? 'ဖျက်ထားသော user',
        role: m.role,
        isTeacher: u?.role === 'teacher',
        level: u?.targetLevel ?? null,
        streak: u?.streak?.current ?? 0,
        studiedToday: active.has(String(m.user)),
        weekPoints: w.points,
        weekDays: w.days,
        joinedAt: m.joinedAt,
      };
    })
    .sort((a, b) => b.weekPoints - a.weekPoints);

  return NextResponse.json({
    member: true,
    isOwner: String(group.owner) === actor.id,
    me: actor.id,
    group: {
      id: String(group._id),
      name: group.name,
      description: group.description,
      level: group.level,
      emoji: group.emoji,
      isPublic: group.isPublic,
      inviteCode: group.inviteCode,
      memberCount: group.memberCount,
      maxMembers: GROUP_MAX_MEMBERS,
    },
    progress: {
      streak: progress.streak,
      need: progress.need,
      activeToday: progress.activeToday.length,
      last7: progress.last7,
    },
    members,
  });
}

const Patch = z.object({
  name: z.string().trim().min(2).max(60).optional(),
  description: z.string().trim().max(300).optional(),
  level: z.enum(['N5', 'N4', 'N3', 'N2', 'N1', 'mixed']).optional(),
  emoji: z.string().trim().min(1).max(8).optional(),
  isPublic: z.boolean().optional(),
});

/** Owner edits the group. */
export async function PATCH(req: Request, { params }: Ctx) {
  const r = await groupForActor((await params).id);
  if ('error' in r) return jsonError(r.error, r.status);
  if (String(r.group.owner) !== r.actor.id)
    return jsonError('အုပ်စုပိုင်ရှင်ပဲ ပြင်လို့ရပါတယ်', 403);
  const parsed = Patch.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError('Data မမှန်ပါ', 400);
  await StudyGroup.updateOne({ _id: r.group._id }, { $set: parsed.data });
  return NextResponse.json({ ok: true });
}

/**
 * Leave the group (?user= lets the owner remove a member). If the owner leaves, the longest-
 * standing member becomes owner; the group is deleted when nobody is left.
 * ?delete=1 lets the owner delete the whole group.
 */
export async function DELETE(req: Request, { params }: Ctx) {
  const r = await groupForActor((await params).id);
  if ('error' in r) return jsonError(r.error, r.status);
  const { actor, group } = r;
  const q = new URL(req.url).searchParams;
  const isOwner = String(group.owner) === actor.id;

  if (q.get('delete') === '1') {
    if (!isOwner && actor.role !== 'admin')
      return jsonError('အုပ်စုပိုင်ရှင်ပဲ ဖျက်လို့ရပါတယ်', 403);
    await Promise.all([
      StudyGroup.deleteOne({ _id: group._id }),
      GroupMessage.deleteMany({ group: group._id }),
    ]);
    return NextResponse.json({ ok: true, deleted: true });
  }

  const target = q.get('user') ?? actor.id;
  if (target !== actor.id && !isOwner) return jsonError('အုပ်စုပိုင်ရှင်ပဲ ဖယ်လို့ရပါတယ်', 403);
  const leaving = group.members.find((m) => String(m.user) === target);
  if (!leaving) return jsonError('Member မဟုတ်ပါ', 404);
  const leavingUser = await User.findById(target).select('name').lean();

  const rest = group.members.filter((m) => String(m.user) !== target);
  if (rest.length === 0) {
    await Promise.all([
      StudyGroup.deleteOne({ _id: group._id }),
      GroupMessage.deleteMany({ group: group._id }),
    ]);
    return NextResponse.json({ ok: true, deleted: true });
  }

  let owner = group.owner;
  if (String(group.owner) === target) {
    const next = [...rest].sort((a, b) => +new Date(a.joinedAt) - +new Date(b.joinedAt))[0];
    next.role = 'owner';
    owner = next.user;
  }
  group.set('members', rest);
  group.owner = owner;
  group.memberCount = rest.length;
  await group.save();
  await systemMessage(
    group._id,
    target === actor.id
      ? `${leavingUser?.name ?? 'တစ်ယောက်'} အုပ်စုက ထွက်သွားပါပြီ`
      : `${leavingUser?.name ?? 'တစ်ယောက်'} ကို အုပ်စုက ဖယ်လိုက်ပါပြီ`
  );
  return NextResponse.json({ ok: true });
}
