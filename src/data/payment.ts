/**
 * Plan and payment-account DEFAULTS. The live values are edited by the admin in
 * /admin → Settings and stored in MongoDB (see src/lib/settings.ts); these are used
 * until the admin saves for the first time.
 */
export type PlanId = 'monthly' | 'quarterly' | 'annual';
export const PLAN_IDS: PlanId[] = ['monthly', 'quarterly', 'annual'];

export interface PlanConfig {
  name: string;
  amount: number; // Ks
  days: number;
  enabled: boolean;
}

export const PAYMENT_METHODS = ['KBZPay', 'WavePay', 'AYA Pay', 'CB Pay'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export interface AccountConfig {
  method: PaymentMethod;
  name: string;
  number: string;
  enabled: boolean;
}

export interface SiteSettingsData {
  plans: Record<PlanId, PlanConfig>;
  accounts: AccountConfig[];
  /** % of Premium revenue shared with teachers, split by lesson views */
  teacherSharePct: number;
  /** % the platform keeps from 1-on-1 class fees */
  tutorCommissionPct: number;
}

export const DEFAULT_SETTINGS: SiteSettingsData = {
  plans: {
    monthly: { name: 'လစဉ်', amount: 15000, days: 30, enabled: true },
    quarterly: { name: '၃ လ', amount: 36000, days: 90, enabled: true },
    annual: { name: 'တစ်နှစ်', amount: 120000, days: 365, enabled: true },
  },
  accounts: [
    { method: 'KBZPay', name: 'Learn with Pyae', number: '09967320321', enabled: true },
    { method: 'WavePay', name: 'Learn with Pyae', number: '09967320321', enabled: true },
    { method: 'AYA Pay', name: '', number: '', enabled: false },
    { method: 'CB Pay', name: '', number: '', enabled: false },
  ],
  teacherSharePct: 50,
  tutorCommissionPct: 20,
};

/** Default plan names, for labels where the live settings aren't loaded. */
export const PLANS = DEFAULT_SETTINGS.plans;

export const formatKs = (n: number) => `${n.toLocaleString('en-US')} Ks`;
