import { NextResponse } from 'next/server';
import { isValidObjectId } from 'mongoose';
import { jsonError } from '@/lib/auth';
import { getActor } from '@/lib/roles';
import { serializeLesson } from '@/lib/lessons';
import { User } from '@/models/User';
import { Lesson } from '@/models/Lesson';
import { Follow } from '@/models/Social';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

/** A teacher's public profile and published lessons. */
export async function GET(_req: Request, { params }: Ctx) {
  const actor = await getActor();
  if (!actor) return jsonError('Not signed in', 401);
  const { id } = await params;
  if (!isValidObjectId(id)) return jsonError('ဆရာ မတွေ့ပါ', 404);

  const t = await User.findOne({ _id: id, role: { $in: ['teacher', 'admin'] } })
    .select('name role teacherProfile createdAt')
    .lean();
  if (!t) return jsonError('ဆရာ မတွေ့ပါ', 404);

  const [lessons, following] = await Promise.all([
    Lesson.find({ author: id, status: 'published' })
      .select('-content')
      .sort({ publishedAt: -1 })
      .limit(200)
      .lean(),
    Follow.exists({ follower: actor.id, teacher: id }),
  ]);
  const totals = lessons.reduce(
    (a, l) => ({
      views: a.views + (l.stats?.views ?? 0),
      ratings: a.ratings + (l.stats?.ratingCount ?? 0),
      starSum: a.starSum + (l.stats?.ratingAvg ?? 0) * (l.stats?.ratingCount ?? 0),
    }),
    { views: 0, ratings: 0, starSum: 0 }
  );

  return NextResponse.json({
    teacher: {
      id: String(t._id),
      name: t.name,
      isAdmin: t.role === 'admin',
      headline: t.teacherProfile?.headline ?? '',
      bio: t.teacherProfile?.bio ?? '',
      jlptLevel: t.teacherProfile?.jlptLevel ?? '',
      languages: t.teacherProfile?.languages?.length ? t.teacherProfile.languages : ['ja'],
      followers: t.teacherProfile?.followers ?? 0,
      joinedAt: t.createdAt,
      totalViews: totals.views,
      ratingAvg: totals.ratings ? Math.round((totals.starSum / totals.ratings) * 10) / 10 : 0,
      ratingCount: totals.ratings,
    },
    following: !!following,
    isMe: actor.id === id,
    lessons: lessons.map((l) => ({ ...serializeLesson(l as never), author: { id, name: t.name } })),
  });
}
