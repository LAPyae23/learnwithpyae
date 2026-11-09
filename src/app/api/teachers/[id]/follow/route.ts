import { NextResponse } from 'next/server';
import { isValidObjectId } from 'mongoose';
import { jsonError } from '@/lib/auth';
import { getActor } from '@/lib/roles';
import { User } from '@/models/User';
import { Follow } from '@/models/Social';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

async function setFollow(id: string, on: boolean) {
  const actor = await getActor();
  if (!actor) return jsonError('Not signed in', 401);
  if (!isValidObjectId(id)) return jsonError('ဆရာ မတွေ့ပါ', 404);
  if (id === actor.id) return jsonError('ကိုယ့်ကိုယ်ကို follow လုပ်လို့ မရပါ', 400);
  if (!(await User.exists({ _id: id, role: { $in: ['teacher', 'admin'] } }))) {
    return jsonError('ဆရာ မတွေ့ပါ', 404);
  }

  if (on) {
    await Follow.updateOne(
      { follower: actor.id, teacher: id },
      { $setOnInsert: { follower: actor.id, teacher: id } },
      { upsert: true }
    );
  } else {
    await Follow.deleteOne({ follower: actor.id, teacher: id });
  }
  const followers = await Follow.countDocuments({ teacher: id });
  await User.updateOne({ _id: id }, { 'teacherProfile.followers': followers });
  return NextResponse.json({ following: on, followers });
}

export async function POST(_req: Request, { params }: Ctx) {
  return setFollow((await params).id, true);
}

export async function DELETE(_req: Request, { params }: Ctx) {
  return setFollow((await params).id, false);
}
