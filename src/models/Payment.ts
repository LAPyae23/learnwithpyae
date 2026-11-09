import { Schema, model, models, type InferSchemaType, type Model } from 'mongoose';

const paymentSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    plan: { type: String, enum: ['monthly', 'quarterly', 'annual'], required: true },
    amount: { type: Number, required: true }, // Ks, copied from the plan at submit time
    method: { type: String, enum: ['KBZPay', 'WavePay', 'AYA Pay', 'CB Pay'], required: true },
    transactionId: { type: String, default: '', maxlength: 64 },
    // Screenshot stored inline (compressed JPEG, ≤ 1.5 MB). Excluded from queries unless asked for.
    screenshot: {
      data: { type: Buffer, select: false },
      mime: { type: String },
      size: { type: Number },
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    note: { type: String, default: '', maxlength: 300 }, // admin note shown to the student
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    reviewedAt: { type: Date, default: null },
    planExpiresAt: { type: Date, default: null }, // expiry granted on approval
  },
  { timestamps: true }
);
paymentSchema.index({ status: 1, createdAt: 1 });

export const Payment: Model<InferSchemaType<typeof paymentSchema>> =
  models.Payment || model('Payment', paymentSchema);
