import 'server-only';
import crypto from 'node:crypto';
import { Types } from 'mongoose';
import { sendTelegram, siteUrl, telegramConfigured } from './telegram';
import { Reward, Scholarship, type RewardKind } from '@/models/Reward';
import { User } from '@/models/User';

const DAY = 86_400_000;

/** Rules for earning Premium by studying. Shown on /rewards. */
export const EARN_RULES = {
  streakDays: 30, // every 30-day streak
  streakReward: 30,
  referralsNeeded: 3, // friends who started studying
  referralReward: 30,
  groupWinnerReward: 7,
  groupMinMembers: 3,
};

export function isPremium(u: { plan?: { type?: string | null; expiresAt?: Date | null } | null }) {
  return (
    !!u.plan?.type &&
    u.plan.type !== 'free' &&
    !!u.plan.expiresAt &&
    new Date(u.plan.expiresAt) > new Date()
  );
}

async function notify(userId: unknown, text: string) {
  if (!telegramConfigured()) return;
  const u = await User.findById(userId).select('telegram').lean();
  if (u?.telegram?.chatId) sendTelegram(u.telegram.chatId, text).catch(() => {});
}

/**
 * Adds `days` of Premium (extending an active plan). Returns false if this `key` was already
 * granted, so callers can run it repeatedly without double rewards.
 */
export async function grantPremium(
  userId: string | Types.ObjectId,
  days: number,
  { kind, key, note = '' }: { kind: RewardKind; key: string; note?: string }
): Promise<boolean> {
  try {
    await Reward.create({ user: userId, kind, days, key, note });
  } catch (e) {
    if ((e as { code?: number }).code === 11000) return false; // already granted
    throw e;
  }
  const user = await User.findById(userId).select('plan').lean();
  if (!user) return false;
  const base = isPremium(user) ? new Date(user.plan!.expiresAt!).getTime() : Date.now();
  await User.updateOne(
    { _id: userId },
    {
      'plan.type': isPremium(user) ? user.plan!.type : 'monthly',
      'plan.expiresAt': new Date(base + days * DAY),
    }
  );
  await notify(userId, `🎁 Premium ${days} ရက် ရပါပြီ! ${note}\n${siteUrl()}/rewards`);
  return true;
}

/** My invite code (created on first use). */
export async function referralCodeFor(userId: string) {
  const u = await User.findById(userId).select('referralCode').lean();
  if (u?.referralCode) return u.referralCode;
  for (;;) {
    const code = crypto
      .randomBytes(4)
      .toString('base64url')
      .replace(/[-_]/g, 'x')
      .slice(0, 6)
      .toUpperCase();
    const res = await User.updateOne(
      { _id: userId, referralCode: { $exists: false } },
      { referralCode: code }
    ).catch((e) => {
      if (e.code === 11000) return null; // code taken, try another
      throw e;
    });
    if (res) {
      const again = await User.findById(userId).select('referralCode').lean();
      if (again?.referralCode) return again.referralCode;
    }
  }
}

/** Friends I invited who have started studying. */
export const activeReferrals = (userId: string | Types.ObjectId) =>
  User.countDocuments({ referredBy: userId, 'streak.lastStudyDay': { $ne: null } });

/** Called on a learner's first-ever study day: rewards whoever invited them, every 3 friends. */
export async function onFirstStudy(userId: string) {
  const me = await User.findById(userId).select('referredBy name').lean();
  if (!me?.referredBy) return;
  const n = await activeReferrals(me.referredBy);
  if (n > 0 && n % EARN_RULES.referralsNeeded === 0) {
    await grantPremium(me.referredBy, EARN_RULES.referralReward, {
      kind: 'referral',
      key: `referral:${me.referredBy}:${n / EARN_RULES.referralsNeeded}`,
      note: `သူငယ်ချင်း ${n} ယောက် စာစလုပ်ပြီလို့ ဆုရပါတယ် 👥`,
    });
  } else {
    await notify(
      me.referredBy,
      `👥 ${me.name} က စာစလုပ်ပါပြီ! (${n % EARN_RULES.referralsNeeded}/${EARN_RULES.referralsNeeded}) နောက် ${EARN_RULES.referralsNeeded - (n % EARN_RULES.referralsNeeded)} ယောက်ဆို Premium ၁ လ ရမယ်`
    );
  }
}

/** Called when a learner's streak changes. */
export async function onStreak(userId: string, current: number, today: string) {
  if (current > 0 && current % EARN_RULES.streakDays === 0) {
    await grantPremium(userId, EARN_RULES.streakReward, {
      kind: 'streak',
      key: `streak:${userId}:${today}`,
      note: `🔥 ${current} ရက် ဆက်တိုက် လေ့လာလို့ ဆုရပါတယ်`,
    });
  }
}

/**
 * Buy one, gift one: when a purchase is approved, the longest-waiting scholarship applicant
 * (not the buyer, not already premium) gets the same number of days.
 */
export async function sponsorScholarship(paymentId: unknown, buyerId: unknown, days: number) {
  const queue = await Scholarship.find({ status: 'pending', user: { $ne: String(buyerId) } })
    .sort({ queuedAt: 1 })
    .limit(20)
    .lean();
  for (const s of queue) {
    const u = await User.findById(s.user).select('plan name').lean();
    if (!u) continue;
    if (isPremium(u)) continue; // already covered (e.g. earned it); try the next one
    const claimed = await Scholarship.findOneAndUpdate(
      { _id: s._id, status: 'pending' },
      { status: 'granted', days, sponsorPayment: paymentId, grantedAt: new Date() }
    );
    if (!claimed) continue;
    await grantPremium(s.user, days, {
      kind: 'gift',
      key: `gift:${paymentId}`,
      note: 'Premium ဝယ်သူ တစ်ယောက်က သင့်ကို လက်ဆောင် ပေးလိုက်ပါတယ် 🎓',
    });
    return { userId: s.user, name: u.name };
  }
  return null;
}
