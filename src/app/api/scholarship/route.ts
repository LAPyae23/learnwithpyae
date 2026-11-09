import { NextResponse } from 'next/server';
import { z } from 'zod';
import { jsonError } from '@/lib/auth';
import { getActor } from '@/lib/roles';
import { isPremium } from '@/lib/premium';
import { Scholarship } from '@/models/Reward';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const Input = z.object({
  reason: z.string().trim().min(10, 'အကြောင်းရင်း နည်းနည်း ရေးပေးပါ').max(600),
});

/** Apply for a sponsored Premium (or re-apply after it was granted and has run out). */
export async function POST(req: Request) {
  const actor = await getActor();
  if (!actor) return jsonError('Not signed in', 401);
  if (isPremium(actor)) return jsonError('Premium ရှိနေပြီးသားပါ', 409);
  const parsed = Input.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? 'Data မမှန်ပါ', 400);

  const existing = await Scholarship.findOne({ user: actor.id }).select('status').lean();
  if (existing?.status === 'pending') return jsonError('လျှောက်ထားပြီးသားပါ — စောင့်ပေးပါ', 409);

  await Scholarship.findOneAndUpdate(
    { user: actor.id },
    {
      // Re-applying puts you at the back of the queue
      $set: {
        reason: parsed.data.reason,
        status: 'pending',
        grantedAt: null,
        sponsorPayment: null,
        days: 0,
        queuedAt: new Date(),
      },
    },
    { upsert: true }
  );
  return NextResponse.json({ ok: true }, { status: 201 });
}

/** Withdraw my application. */
export async function DELETE() {
  const actor = await getActor();
  if (!actor) return jsonError('Not signed in', 401);
  await Scholarship.updateOne({ user: actor.id, status: 'pending' }, { status: 'withdrawn' });
  return NextResponse.json({ ok: true });
}
