import { NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { jsonError } from '@/lib/auth';
import { activeAgency, learnerEvidence } from '@/lib/jobs';
import { JOB_FIELDS, JobProfile, AgencyContact } from '@/models/Jobs';
import { User } from '@/models/User';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const LEVEL_ORDER = ['N5', 'N4', 'N3', 'N2', 'N1'];

/**
 * Active agencies: learners who made their job profile visible.
 * Filters: ?field=kaigo &minLevel=N4 (certified or target) &location=japan
 * Contact details are never included here.
 */
export async function GET(req: Request) {
  const r = await activeAgency();
  if ('error' in r) return jsonError(r.error, r.status);
  const p = new URL(req.url).searchParams;
  const field = p.get('field');
  const minLevel = p.get('minLevel');
  const location = p.get('location');

  const filter: Record<string, unknown> = { visible: true };
  if (field && (JOB_FIELDS as readonly string[]).includes(field)) filter.fields = field;
  if (location === 'japan' || location === 'myanmar') filter.location = { $in: [location, 'any'] };
  if (minLevel && LEVEL_ORDER.includes(minLevel)) {
    filter.jlptCertified = { $in: LEVEL_ORDER.slice(LEVEL_ORDER.indexOf(minLevel)) };
  }

  const profiles = await JobProfile.find(filter).sort({ updatedAt: -1 }).limit(100).lean();
  const ids = profiles.map((x) => x.user as Types.ObjectId);
  const [users, evidence, contacted] = await Promise.all([
    User.find({ _id: { $in: ids } })
      .select('name targetLevel streak')
      .lean(),
    learnerEvidence(ids),
    AgencyContact.find({ agency: r.actor.id, student: { $in: ids } })
      .select('student status')
      .lean(),
  ]);
  const u = new Map(users.map((x) => [String(x._id), x]));
  const sent = new Map(contacted.map((c) => [String(c.student), c.status]));

  return NextResponse.json({
    agency: r.agency.companyName,
    candidates: profiles
      .filter((x) => u.has(String(x.user)))
      .map((x) => {
        const user = u.get(String(x.user))!;
        const ev = evidence.get(String(x.user))!;
        return {
          id: String(x.user),
          name: user.name,
          headline: x.headline,
          fields: x.fields,
          jlptCertified: x.jlptCertified,
          targetLevel: user.targetLevel ?? null,
          location: x.location,
          availableFrom: x.availableFrom,
          city: x.city,
          experience: x.experience,
          education: x.education,
          streak: { current: user.streak?.current ?? 0, longest: user.streak?.longest ?? 0 },
          active30: ev.active30,
          exams: ev.exams,
          contact: sent.get(String(x.user)) ?? null, // null | pending | accepted | declined
        };
      }),
  });
}
