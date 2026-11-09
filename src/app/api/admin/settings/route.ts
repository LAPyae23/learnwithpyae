import { NextResponse } from 'next/server';
import { jsonError } from '@/lib/auth';
import { requireAdmin } from '@/lib/adminGuard';
import { getSiteSettings, SettingsInput } from '@/lib/settings';
import { SiteSettings } from '@/models/SiteSettings';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Admin: all settings, including disabled accounts. */
export async function GET() {
  if (!(await requireAdmin())) return jsonError('Forbidden', 403);
  return NextResponse.json(await getSiteSettings());
}

/** Admin: save plans and payment accounts. */
export async function PUT(req: Request) {
  const adminId = await requireAdmin();
  if (!adminId) return jsonError('Forbidden', 403);
  const parsed = SettingsInput.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? 'Data မမှန်ပါ', 400);

  await SiteSettings.updateOne(
    { key: 'site' },
    { $set: { ...parsed.data, updatedBy: adminId } },
    { upsert: true }
  );
  return NextResponse.json(await getSiteSettings());
}
