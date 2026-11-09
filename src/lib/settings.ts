import 'server-only';
import { z } from 'zod';
import { connectDB } from './db';
import { SiteSettings } from '@/models/SiteSettings';
import { DEFAULT_SETTINGS, PAYMENT_METHODS, PLAN_IDS, type SiteSettingsData } from '@/data/payment';

/** Live plans and payment accounts: saved values merged over the defaults. */
export async function getSiteSettings(): Promise<SiteSettingsData> {
  await connectDB();
  const doc = await SiteSettings.findOne({ key: 'site' }).lean<Partial<SiteSettingsData>>();
  const plans = { ...DEFAULT_SETTINGS.plans };
  for (const id of PLAN_IDS) {
    if (doc?.plans?.[id]) plans[id] = { ...plans[id], ...doc.plans[id] };
  }
  const accounts = PAYMENT_METHODS.map(
    (method) =>
      doc?.accounts?.find((a) => a.method === method) ??
      DEFAULT_SETTINGS.accounts.find((a) => a.method === method)!
  );
  return { plans, accounts };
}

const planInput = z.object({
  name: z.string().trim().min(1).max(40),
  amount: z.number().int().min(0).max(100_000_000),
  days: z.number().int().min(1).max(3650),
  enabled: z.boolean(),
});

export const SettingsInput = z
  .object({
    plans: z.object({ monthly: planInput, quarterly: planInput, annual: planInput }),
    accounts: z
      .array(
        z.object({
          method: z.enum(PAYMENT_METHODS),
          name: z.string().trim().max(80),
          number: z.string().trim().max(40),
          enabled: z.boolean(),
        })
      )
      .max(PAYMENT_METHODS.length),
  })
  .refine((s) => s.accounts.every((a) => !a.enabled || (a.number && a.name)), {
    message: 'ဖွင့်ထားတဲ့ အကောင့်တိုင်းမှာ အမည်နဲ့ ဖုန်းနံပါတ် ထည့်ပါ',
  })
  .refine((s) => s.accounts.some((a) => a.enabled), {
    message: 'ငွေလက်ခံ အကောင့် အနည်းဆုံး တစ်ခု ဖွင့်ထားပါ',
  })
  .refine((s) => PLAN_IDS.some((id) => s.plans[id].enabled), {
    message: 'Plan အနည်းဆုံး တစ်ခု ဖွင့်ထားပါ',
  });
