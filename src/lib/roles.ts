import 'server-only';
import { connectDB } from './db';
import { getSession } from './auth';
import { User } from '@/models/User';

export type Role = 'student' | 'teacher' | 'admin';

/**
 * The signed-in user with their CURRENT role from the database (the role in the session
 * token can be stale, e.g. right after an admin approves a teacher). Null if not signed in.
 */
export async function getActor(): Promise<{ id: string; role: Role; name: string } | null> {
  const session = await getSession();
  if (!session) return null;
  await connectDB();
  const user = await User.findById(session.sub).select('role name').lean();
  if (!user) return null;
  return { id: session.sub, role: (user.role ?? 'student') as Role, name: user.name };
}

export const canTeach = (role: Role) => role === 'teacher' || role === 'admin';
