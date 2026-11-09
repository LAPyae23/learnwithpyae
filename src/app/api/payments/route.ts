import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { getSession, jsonError } from '@/lib/auth';
import { PAYMENT_METHODS, PLANS, type PaymentMethod, type PlanId } from '@/data/payment';
import { Payment } from '@/models/Payment';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BYTES = 1.5 * 1024 * 1024;
const MIMES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_PENDING = 3;

/** Checks the real file signature, not just the declared type. */
function sniffImage(buf: Buffer): string | null {
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
  if (
    buf.length > 8 &&
    buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  )
    return 'image/png';
  if (
    buf.length > 12 &&
    buf.subarray(0, 4).toString() === 'RIFF' &&
    buf.subarray(8, 12).toString() === 'WEBP'
  )
    return 'image/webp';
  return null;
}

/** Student submits a payment screenshot for a plan. */
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return jsonError('Not signed in', 401);

  const form = await req.formData().catch(() => null);
  if (!form) return jsonError('Form မမှန်ပါ', 400);
  const plan = String(form.get('plan') ?? '') as PlanId;
  const method = String(form.get('method') ?? '') as PaymentMethod;
  const transactionId = String(form.get('transactionId') ?? '')
    .trim()
    .slice(0, 64);
  const file = form.get('screenshot');

  if (!(plan in PLANS)) return jsonError('Plan ရွေးပါ', 400);
  if (!PAYMENT_METHODS.includes(method)) return jsonError('ငွေပေးချေမှု နည်းလမ်း ရွေးပါ', 400);
  if (!(file instanceof File) || file.size === 0) return jsonError('Screenshot တင်ပါ', 400);
  if (file.size > MAX_BYTES) return jsonError('ပုံ အရမ်းကြီးနေပါတယ် (1.5MB ထက် မကျော်ရ)', 413);

  const buf = Buffer.from(await file.arrayBuffer());
  const mime = sniffImage(buf);
  if (!mime || !MIMES.has(mime)) return jsonError('JPG / PNG ပုံပဲ တင်လို့ရပါတယ်', 415);

  await connectDB();
  if ((await Payment.countDocuments({ user: session.sub, status: 'pending' })) >= MAX_PENDING) {
    return jsonError('စစ်ဆေးဆဲ ငွေပေးချေမှု ရှိနေပါသေးတယ်။ ခဏစောင့်ပါ။', 429);
  }

  const payment = await Payment.create({
    user: session.sub,
    plan,
    amount: PLANS[plan].amount,
    method,
    transactionId,
    screenshot: { data: buf, mime, size: buf.length },
  });
  return NextResponse.json({ id: String(payment._id) }, { status: 201 });
}

/** The student's own payment history. */
export async function GET() {
  const session = await getSession();
  if (!session) return jsonError('Not signed in', 401);
  await connectDB();
  const payments = await Payment.find({ user: session.sub })
    .sort({ createdAt: -1 })
    .limit(20)
    .select('plan amount method status note createdAt planExpiresAt')
    .lean();
  return NextResponse.json({
    payments: payments.map(({ _id, ...p }) => ({ id: String(_id), ...p })),
  });
}
