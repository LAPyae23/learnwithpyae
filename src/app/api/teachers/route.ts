import { NextResponse } from 'next/server';
import { jsonError } from '@/lib/auth';
import { getActor } from '@/lib/roles';
import { User } from '@/models/User';
import { Lesson } from '@/models/Lesson';
import { Follow } from '@/models/Social';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** All teachers with their published-lesson count, followers, and whether I follow them. */
export async function GET() {
  const actor = await getActor();
  if (!actor) return jsonError('Not signed in', 401);

  const teachers = await User.find({ role: 'teacher' })
    .select('name teacherProfile createdAt')
    .sort({ 'teacherProfile.followers': -1, createdAt: 1 })
    .limit(200)
    .lean();
  const ids = teachers.map((t) => t._id);
  const [counts, following] = await Promise.all([
    Lesson.aggregate<{ _id: unknown; n: number; avg: number }>([
      { $match: { author: { $in: ids }, status: 'published' } },
      { $group: { _id: '$author', n: { $sum: 1 }, avg: { $avg: '$stats.ratingAvg' } } },
    ]),
    Follow.find({ follower: actor.id, teacher: { $in: ids } })
      .select('teacher')
      .lean(),
  ]);
  const countMap = new Map(counts.map((c) => [String(c._id), c]));
  const followSet = new Set(following.map((f) => String(f.teacher)));

  return NextResponse.json({
    teachers: teachers.map((t) => ({
      id: String(t._id),
      name: t.name,
      headline: t.teacherProfile?.headline ?? '',
      jlptLevel: t.teacherProfile?.jlptLevel ?? '',
      followers: t.teacherProfile?.followers ?? 0,
      lessons: countMap.get(String(t._id))?.n ?? 0,
      following: followSet.has(String(t._id)),
    })),
  });
}
