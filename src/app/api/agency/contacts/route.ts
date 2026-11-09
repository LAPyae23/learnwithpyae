import { NextResponse } from 'next/server';
import { isValidObjectId } from 'mongoose';
import { z } from 'zod';
import { jsonError } from '@/lib/auth';
import { activeAgency } from '@/lib/jobs';
import { sendTelegram, siteUrl, telegramConfigured } from '@/lib/telegram';
import { AgencyContact, JobProfile } from '@/models/Jobs';
import { User } from '@/models/User';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Agency: messages I sent; learner contact details appear once they accept. */
export async function GET() {
  const r = await activeAgency();
  if ('error' in r) return jsonError(r.error, r.status);
  const rows = await AgencyContact.find({ agency: r.actor.id })
    .sort({ createdAt: -1 })
    .limit(200)
    .lean();
  const ids = rows.map((x) => x.student);
  const [users, profiles] = await Promise.all([
    User.find({ _id: { $in: ids } })
      .select('name email')
      .lean(),
    JobProfile.find({ user: { $in: ids } })
      .select('user phone telegram')
      .lean(),
  ]);
  const u = new Map(users.map((x) => [String(x._id), x]));
  const pr = new Map(profiles.map((x) => [String(x.user), x]));
  return NextResponse.json({
    contacts: rows.map((c) => {
      const accepted = c.status === 'accepted';
      const p = pr.get(String(c.student));
      const user = u.get(String(c.student));
      return {
        id: String(c._id),
        student: { id: String(c.student), name: user?.name ?? '—' },
        jobTitle: c.jobTitle,
        message: c.message,
        status: c.status,
        createdAt: c.createdAt,
        reveal: accepted
          ? { phone: p?.phone ?? '', telegram: p?.telegram ?? '', email: user?.email ?? '' }
          : null,
      };
    }),
  });
}

const Input = z.object({
  studentId: z.string(),
  jobTitle: z.string().trim().min(2, 'အလုပ် အမည် ထည့်ပါ').max(120),
  message: z.string().trim().min(10, 'စာ နည်းနည်း ရှည်ရှည် ရေးပါ').max(1500),
});

/** Agency sends a job message to a visible learner (once per learner; 30 a day). */
export async function POST(req: Request) {
  const r = await activeAgency();
  if ('error' in r) return jsonError(r.error, r.status);
  const parsed = Input.safeParse(await req.json().catch(() => null));
  if (!parsed.success || !isValidObjectId(parsed.data.studentId)) {
    return jsonError(
      parsed.success ? 'Data မမှန်ပါ' : (parsed.error.issues[0]?.message ?? 'Data မမှန်ပါ'),
      400
    );
  }
  const { studentId, jobTitle, message } = parsed.data;
  if (!(await JobProfile.exists({ user: studentId, visible: true }))) {
    return jsonError('ဒီကျောင်းသားက profile ကို ဖွင့်မထားပါ', 404);
  }
  const today = new Date(Date.now() - 86400000);
  if (
    (await AgencyContact.countDocuments({ agency: r.actor.id, createdAt: { $gt: today } })) >= 30
  ) {
    return jsonError('တစ်ရက် ၃၀ ယောက်ထက် ပိုမပို့နိုင်ပါ', 429);
  }
  try {
    await AgencyContact.create({ agency: r.actor.id, student: studentId, jobTitle, message });
  } catch (e) {
    if ((e as { code?: number }).code === 11000)
      return jsonError('ဒီကျောင်းသားကို ပို့ပြီးသားပါ', 409);
    throw e;
  }
  if (telegramConfigured()) {
    const s = await User.findById(studentId).select('telegram').lean();
    if (s?.telegram?.chatId) {
      sendTelegram(
        s.telegram.chatId,
        `🇯🇵 ${r.agency.companyName} က "${jobTitle}" အလုပ်အတွက် စိတ်ဝင်စားကြောင်း စာပို့ထားပါတယ်\n${siteUrl()}/jobs`
      ).catch(() => {});
    }
  }
  return NextResponse.json({ ok: true }, { status: 201 });
}
