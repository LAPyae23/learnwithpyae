import { NextResponse } from 'next/server';
import { isValidObjectId } from 'mongoose';
import { z } from 'zod';
import { jsonError } from '@/lib/auth';
import { getActor } from '@/lib/roles';
import { sendTelegram, siteUrl, telegramConfigured } from '@/lib/telegram';
import { Agency, AgencyContact } from '@/models/Jobs';
import { User } from '@/models/User';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Learner: messages from agencies. The agency's contact details show once accepted. */
export async function GET() {
  const actor = await getActor();
  if (!actor) return jsonError('Not signed in', 401);
  const rows = await AgencyContact.find({ student: actor.id })
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();
  const agencies = await Agency.find({ user: { $in: rows.map((r) => r.agency) } })
    .select('user companyName country website description phone contactPerson licenseNo')
    .lean();
  const byUser = new Map(agencies.map((a) => [String(a.user), a]));
  return NextResponse.json({
    offers: rows.map((r) => {
      const a = byUser.get(String(r.agency));
      const accepted = r.status === 'accepted';
      return {
        id: String(r._id),
        jobTitle: r.jobTitle,
        message: r.message,
        status: r.status,
        createdAt: r.createdAt,
        agency: a
          ? {
              companyName: a.companyName,
              country: a.country,
              website: a.website,
              description: a.description,
              licenseNo: a.licenseNo,
              contactPerson: accepted ? a.contactPerson : null,
              phone: accepted ? a.phone : null,
            }
          : null,
      };
    }),
  });
}

const Input = z.object({ id: z.string(), action: z.enum(['accept', 'decline']) });

/** Learner accepts (shares contact details both ways) or declines an agency's message. */
export async function POST(req: Request) {
  const actor = await getActor();
  if (!actor) return jsonError('Not signed in', 401);
  const parsed = Input.safeParse(await req.json().catch(() => null));
  if (!parsed.success || !isValidObjectId(parsed.data.id)) return jsonError('Data မမှန်ပါ', 400);
  const status = parsed.data.action === 'accept' ? 'accepted' : 'declined';
  const c = await AgencyContact.findOneAndUpdate(
    { _id: parsed.data.id, student: actor.id, status: 'pending' },
    { status, respondedAt: new Date() },
    { returnDocument: 'after' }
  );
  if (!c) return jsonError('ဖြေပြီးသားပါ', 409);
  if (status === 'accepted' && telegramConfigured()) {
    const ag = await User.findById(c.agency).select('telegram').lean();
    if (ag?.telegram?.chatId) {
      sendTelegram(
        ag.telegram.chatId,
        `✅ ${actor.name} က "${c.jobTitle}" အတွက် ဆက်သွယ်ခွင့် ပြုလိုက်ပါပြီ\n${siteUrl()}/agency`
      ).catch(() => {});
    }
  }
  return NextResponse.json({ ok: true, status });
}
