import 'server-only';
import crypto from 'node:crypto';
import { isValidObjectId, Types } from 'mongoose';
import { getActor, type Actor } from './roles';
import { previousDay, yangonDay } from './streak';
import { DailyActivity, GroupMessage, StudyGroup, type StudyGroupDoc } from '@/models/Group';

export const newInviteCode = () =>
  crypto.randomBytes(5).toString('base64url').slice(0, 7).toUpperCase();

type GroupDoc = StudyGroupDoc;

export const isMember = (g: { members: { user: unknown }[] }, userId: string) =>
  g.members.some((m) => String(m.user) === userId);

/** Loads a group the signed-in user belongs to (or any group for `allowNonMember`). */
export async function groupForActor(
  id: string,
  { allowNonMember = false } = {}
): Promise<{ error: string; status: number } | { actor: Actor; group: GroupDoc; member: boolean }> {
  const actor = await getActor();
  if (!actor) return { error: 'Not signed in', status: 401 };
  if (!isValidObjectId(id)) return { error: 'အုပ်စု မတွေ့ပါ', status: 404 };
  const group = await StudyGroup.findById(id);
  if (!group) return { error: 'အုပ်စု မတွေ့ပါ', status: 404 };
  const member = isMember(group, actor.id);
  if (!member && !allowNonMember && actor.role !== 'admin') {
    return { error: 'ဒီအုပ်စုထဲ မဝင်ရသေးပါ', status: 403 };
  }
  return { actor, group, member };
}

export async function systemMessage(groupId: unknown, text: string) {
  const id = new Types.ObjectId(String(groupId));
  await GroupMessage.create({ group: id, user: null, kind: 'system', text });
  await StudyGroup.updateOne({ _id: id }, { lastMessageAt: new Date() });
}

/**
 * Group streak: consecutive days on which at least half the members (min. 1) studied.
 * Today counts if it already qualifies; otherwise the streak runs up to yesterday.
 */
export async function groupProgress(memberIds: string[]) {
  const today = yangonDay();
  const days: string[] = [today];
  for (let i = 0; i < 60; i++) days.push(previousDay(days[days.length - 1]));
  const weekDays = new Set(days.slice(0, 7));

  const rows = await DailyActivity.find({
    user: { $in: memberIds.map((id) => new Types.ObjectId(id)) },
    day: { $in: days },
    points: { $gt: 0 },
  })
    .select('user day points')
    .lean();

  const activeByDay = new Map<string, Set<string>>();
  const week = new Map<string, { points: number; days: number }>();
  for (const r of rows) {
    const u = String(r.user);
    if (!activeByDay.has(r.day)) activeByDay.set(r.day, new Set());
    activeByDay.get(r.day)!.add(u);
    if (weekDays.has(r.day)) {
      const w = week.get(u) ?? { points: 0, days: 0 };
      w.points += r.points;
      w.days += 1;
      week.set(u, w);
    }
  }

  const need = Math.max(1, Math.ceil(memberIds.length / 2));
  const qualifies = (d: string) => (activeByDay.get(d)?.size ?? 0) >= need;
  let streak = 0;
  let i = qualifies(today) ? 0 : 1;
  while (i < days.length && qualifies(days[i])) {
    streak++;
    i++;
  }

  return {
    today,
    need,
    activeToday: [...(activeByDay.get(today) ?? [])],
    streak,
    // Last 7 days, oldest first: how many members studied each day
    last7: days
      .slice(0, 7)
      .reverse()
      .map((d) => ({ day: d, active: activeByDay.get(d)?.size ?? 0 })),
    week: Object.fromEntries(week),
  };
}

/**
 * Weekly group prize (run by the daily cron on Mondays, Myanmar time): in every group with
 * at least 3 members, the top scorer(s) of the past 7 days get free Premium days.
 */
export async function awardWeeklyGroupWinners(today = yangonDay()) {
  const weekday = new Date(`${today}T00:00:00Z`).getUTCDay();
  if (weekday !== 1) return { skipped: 'not Monday' };
  const { grantPremium, EARN_RULES } = await import('./premium');

  const days: string[] = [previousDay(today)];
  for (let i = 0; i < 6; i++) days.push(previousDay(days[days.length - 1]));
  const weekKey = days[0]; // last Sunday

  const groups = await StudyGroup.find({ memberCount: { $gte: EARN_RULES.groupMinMembers } })
    .select('name members')
    .lean();
  let winners = 0;
  for (const g of groups) {
    const ids = g.members.map((m) => m.user);
    const rows = await DailyActivity.aggregate<{ _id: Types.ObjectId; points: number }>([
      { $match: { user: { $in: ids }, day: { $in: days } } },
      { $group: { _id: '$user', points: { $sum: '$points' } } },
      { $sort: { points: -1 } },
    ]);
    const top = rows[0]?.points ?? 0;
    if (top <= 0) continue;
    for (const r of rows.filter((x) => x.points === top)) {
      const granted = await grantPremium(r._id, EARN_RULES.groupWinnerReward, {
        kind: 'group',
        key: `group:${g._id}:${weekKey}:${r._id}`,
        note: `🏆 "${g.name}" အုပ်စု အပတ်စဉ် ပြိုင်ပွဲ ပထမ (${top} မှတ်)`,
      });
      if (granted) {
        winners++;
        const { User } = await import('@/models/User');
        const u = await User.findById(r._id).select('name').lean();
        await systemMessage(
          g._id,
          `🏆 ပြီးခဲ့တဲ့အပတ် ပထမ: ${u?.name ?? ''} (${top} မှတ်) — Premium ${EARN_RULES.groupWinnerReward} ရက် ဆုရပါတယ်! 🎉`
        );
      }
    }
  }
  return { groups: groups.length, winners };
}
