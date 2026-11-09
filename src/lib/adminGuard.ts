import 'server-only';
import { connectDB } from './db';
import { getSession } from './auth';
import { User } from '@/models/User';

/** Returns the admin's user id, or null. Checks the database, not just the token's role claim. */
export async function requireAdmin(): Promise<string | null> {
  const session = await getSession();
  if (!session || session.role !== 'admin') return null;
  await connectDB();
  const user = await User.findById(session.sub).select('role').lean();
  return user?.role === 'admin' ? session.sub : null;
}
