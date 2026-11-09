import 'server-only';
import { Types } from 'mongoose';
import { getActor, type Actor } from './roles';
import { Agency } from '@/models/Jobs';
import { ExamAttempt } from '@/models/ExamAttempt';
import { DailyActivity } from '@/models/Group';
import { previousDay, yangonDay } from './streak';

export const JOB_FIELD_LABEL: Record<string, string> = {
  kaigo: 'သူနာပြု / 介護',
  food: 'စားသောက်ဆိုင် / 外食',
  manufacturing: 'စက်ရုံ / 製造',
  construction: 'ဆောက်လုပ်ရေး / 建設',
  agriculture: 'စိုက်ပျိုးရေး / 農業',
  hotel: 'ဟိုတယ် / 宿泊',
  it: 'IT',
  other: 'အခြား',
};

/** The signed-in agency, only if approved and its access is still active. */
export async function activeAgency(): Promise<
  | { error: string; status: number }
  | { actor: Actor; agency: { _id: unknown; companyName: string } }
> {
  const actor = await getActor();
  if (!actor) return { error: 'Not signed in', status: 401 };
  const agency = await Agency.findOne({ user: actor.id })
    .select('companyName status activeUntil')
    .lean();
  if (!agency || agency.status !== 'approved')
    return { error: 'Agency အဖြစ် အတည်ပြုချက် မရသေးပါ', status: 403 };
  if (!agency.activeUntil || agency.activeUntil < new Date()) {
    return { error: 'Agency သုံးခွင့် သက်တမ်း ကုန်သွားပါပြီ — admin ကို ဆက်သွယ်ပါ', status: 402 };
  }
  return { actor, agency };
}

/** Study evidence agencies see for a learner: best mock test per level, streak, recent activity. */
export async function learnerEvidence(userIds: Types.ObjectId[]) {
  const days = [yangonDay()];
  for (let i = 0; i < 29; i++) days.push(previousDay(days[days.length - 1]));
  const [exams, activity] = await Promise.all([
    ExamAttempt.aggregate<{
      _id: { user: Types.ObjectId; level: string };
      best: number;
      n: number;
    }>([
      { $match: { user: { $in: userIds }, totalQuestions: { $gt: 0 } } },
      {
        $group: {
          _id: { user: '$user', level: '$level' },
          best: { $max: { $divide: ['$totalScore', '$totalQuestions'] } },
          n: { $sum: 1 },
        },
      },
    ]),
    DailyActivity.aggregate<{ _id: Types.ObjectId; days: number }>([
      { $match: { user: { $in: userIds }, day: { $in: days }, points: { $gt: 0 } } },
      { $group: { _id: '$user', days: { $sum: 1 } } },
    ]),
  ]);
  const map = new Map<
    string,
    { exams: Record<string, { best: number; n: number }>; active30: number }
  >();
  for (const id of userIds) map.set(String(id), { exams: {}, active30: 0 });
  for (const e of exams) {
    map.get(String(e._id.user))!.exams[e._id.level] = { best: Math.round(e.best * 100), n: e.n };
  }
  for (const a of activity) map.get(String(a._id))!.active30 = a.days;
  return map;
}
