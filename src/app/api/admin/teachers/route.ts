import { NextResponse } from 'next/server';
import { jsonError } from '@/lib/auth';
import { requireAdmin } from '@/lib/adminGuard';
import { TeacherApplication } from '@/models/TeacherApplication';
import '@/models/User';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const STATUSES = ['pending', 'approved', 'rejected', 'revoked'] as const;
type Status = (typeof STATUSES)[number];

/** Admin: teacher applications, filtered by status. */
export async function GET(req: Request) {
  if (!(await requireAdmin())) return jsonError('Forbidden', 403);
  const s = new URL(req.url).searchParams.get('status') as Status | null;
  const status: Status = s && STATUSES.includes(s) ? s : 'pending';

  const apps = await TeacherApplication.find({ status })
    .sort({ createdAt: status === 'pending' ? 1 : -1 })
    .limit(200)
    .populate<{ user: { _id: unknown; name: string; email: string } | null }>('user', 'name email')
    .lean();

  return NextResponse.json({
    applications: apps.map(({ _id, user, ...a }) => ({
      id: String(_id),
      user: user ? { id: String(user._id), name: user.name, email: user.email } : null,
      fullName: a.fullName,
      jlptLevel: a.jlptLevel,
      experience: a.experience,
      bio: a.bio,
      contact: a.contact,
      sampleUrl: a.sampleUrl,
      status: a.status,
      note: a.note,
      createdAt: a.createdAt,
    })),
  });
}
