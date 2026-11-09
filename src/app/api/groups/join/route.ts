import { NextResponse } from 'next/server';
import { z } from 'zod';
import { isValidObjectId } from 'mongoose';
import { jsonError } from '@/lib/auth';
import { getActor } from '@/lib/roles';
import { isMember, systemMessage } from '@/lib/groups';
import { GROUP_MAX_MEMBERS, StudyGroup } from '@/models/Group';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const Input = z.union([
  z.object({ code: z.string().trim().min(4).max(12) }),
  z.object({ groupId: z.string() }), // public groups only
]);

/** Join with an invite code (any group) or by id (public groups). */
export async function POST(req: Request) {
  const actor = await getActor();
  if (!actor) return jsonError('Not signed in', 401);
  const parsed = Input.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError('Code မမှန်ပါ', 400);

  let group;
  if ('code' in parsed.data) {
    group = await StudyGroup.findOne({ inviteCode: parsed.data.code.toUpperCase() });
    if (!group) return jsonError('ဒီ code နဲ့ အုပ်စု မတွေ့ပါ', 404);
  } else {
    if (!isValidObjectId(parsed.data.groupId)) return jsonError('အုပ်စု မတွေ့ပါ', 404);
    group = await StudyGroup.findById(parsed.data.groupId);
    if (!group) return jsonError('အုပ်စု မတွေ့ပါ', 404);
    if (!group.isPublic) return jsonError('ဒီအုပ်စုက ဖိတ်ခေါ်မှ ဝင်လို့ရပါတယ်', 403);
  }

  if (isMember(group, actor.id)) return NextResponse.json({ id: String(group._id), already: true });
  if ((await StudyGroup.countDocuments({ 'members.user': actor.id })) >= 10) {
    return jsonError('အုပ်စု ၁၀ ခုထက် ပိုမဝင်နိုင်ပါ', 429);
  }

  // Atomic: only add if not full and not already a member
  const res = await StudyGroup.updateOne(
    { _id: group._id, memberCount: { $lt: GROUP_MAX_MEMBERS }, 'members.user': { $ne: actor.id } },
    { $push: { members: { user: actor.id, role: 'member' } }, $inc: { memberCount: 1 } }
  );
  if (!res.modifiedCount) return jsonError('အုပ်စု ပြည့်နေပါပြီ', 409);
  await systemMessage(group._id, `👋 ${actor.name} အုပ်စုထဲ ဝင်လာပါပြီ`);
  return NextResponse.json({ id: String(group._id) });
}
