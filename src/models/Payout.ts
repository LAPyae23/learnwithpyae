import { Schema, model, models, type InferSchemaType, type Model } from 'mongoose';

/** Money an admin has paid a teacher for one month (views share + 1-on-1 classes). */
const payoutSchema = new Schema(
  {
    teacher: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    month: { type: String, required: true }, // YYYY-MM (Myanmar time)
    amount: { type: Number, required: true, min: 0 },
    note: { type: String, default: '', maxlength: 200 },
    paidAt: { type: Date, default: Date.now },
    paidBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);
payoutSchema.index({ teacher: 1, month: 1 }, { unique: true });

export const Payout: Model<InferSchemaType<typeof payoutSchema>> =
  models.Payout || model('Payout', payoutSchema);
