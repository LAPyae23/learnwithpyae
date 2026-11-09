import { Schema, model, models, type Model } from 'mongoose';
import { PAYMENT_METHODS } from '@/data/payment';

/** Single document (key: 'site') holding admin-editable plans and payment accounts. */
const planSchema = new Schema(
  {
    name: { type: String, required: true, maxlength: 40 },
    amount: { type: Number, required: true, min: 0 },
    days: { type: Number, required: true, min: 1 },
    enabled: { type: Boolean, default: true },
  },
  { _id: false }
);

const siteSettingsSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, default: 'site' },
    plans: {
      monthly: planSchema,
      quarterly: planSchema,
      annual: planSchema,
    },
    accounts: [
      {
        _id: false,
        method: { type: String, enum: PAYMENT_METHODS, required: true },
        name: { type: String, default: '', maxlength: 80 },
        number: { type: String, default: '', maxlength: 40 },
        enabled: { type: Boolean, default: false },
      },
    ],
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const SiteSettings: Model<any> =
  models.SiteSettings || model('SiteSettings', siteSettingsSchema);
