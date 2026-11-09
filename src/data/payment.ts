/**
 * Plans and where students send money. EDIT the receiving accounts before going live.
 */
export type PlanId = 'monthly' | 'quarterly' | 'annual';

export const PLANS: Record<PlanId, { name: string; amount: number; days: number }> = {
  monthly: { name: 'လစဉ်', amount: 15000, days: 30 },
  quarterly: { name: '၃ လ', amount: 36000, days: 90 },
  annual: { name: 'တစ်နှစ်', amount: 120000, days: 365 },
};

export const PAYMENT_METHODS = ['KBZPay', 'WavePay', 'AYA Pay', 'CB Pay'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

/** TODO before launch: replace with your real receiving accounts. */
export const RECEIVING_ACCOUNTS: Record<PaymentMethod, { name: string; number: string }> = {
  KBZPay: { name: 'NihongoAcademy', number: '09-XXX-XXX-XXX' },
  WavePay: { name: 'NihongoAcademy', number: '09-XXX-XXX-XXX' },
  'AYA Pay': { name: 'NihongoAcademy', number: '09-XXX-XXX-XXX' },
  'CB Pay': { name: 'NihongoAcademy', number: '09-XXX-XXX-XXX' },
};

export const formatKs = (n: number) => `${n.toLocaleString('en-US')} Ks`;
