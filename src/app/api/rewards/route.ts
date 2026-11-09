import { NextResponse } from 'next/server';
import { jsonError } from '@/lib/auth';
import { getActor } from '@/lib/roles';
import { activeReferrals, EARN_RULES, isPremium, referralCodeFor } from '@/lib/premium';
import { Reward, Scholarship } from '@/models/Reward';
import { User } from '@/models/User';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Everything for the "earn Premium" page. */
export async function GET() {
  const actor = await getActor();
  if (!actor) return jsonError('Not signed in', 401);

  const [code, user, referrals, invited, rewards, scholarship] = await Promise.all([
    referralCodeFor(actor.id),
    User.findById(actor.id).select('streak plan').lean(),
    activeReferrals(actor.id),
    User.countDocuments({ referredBy: actor.id }),
    Reward.find({ user: actor.id }).sort({ createdAt: -1 }).limit(50).lean(),
    Scholarship.findOne({ user: actor.id }).select('status reason queuedAt grantedAt days').lean(),
  ]);

  const streak = user?.streak?.current ?? 0;
  return NextResponse.json({
    rules: EARN_RULES,
    premium: user ? isPremium(user) : false,
    premiumUntil: user && isPremium(user) ? user.plan!.expiresAt : null,
    referral: {
      code,
      invited,
      active: referrals,
      progress: referrals % EARN_RULES.referralsNeeded,
    },
    streak: { current: streak, toNext: EARN_RULES.streakDays - (streak % EARN_RULES.streakDays) },
    rewards: rewards.map((r) => ({ kind: r.kind, days: r.days, note: r.note, at: r.createdAt })),
    totalDaysEarned: rewards.reduce((a, r) => a + r.days, 0),
    scholarship: scholarship
      ? {
          status: scholarship.status,
          reason: scholarship.reason,
          queuedAt: scholarship.queuedAt,
          grantedAt: scholarship.grantedAt,
          days: scholarship.days,
          // Position in the queue, so applicants know roughly how long they'll wait
          position:
            scholarship.status === 'pending'
              ? (await Scholarship.countDocuments({
                  status: 'pending',
                  queuedAt: { $lt: scholarship.queuedAt },
                })) + 1
              : null,
        }
      : null,
  });
}
