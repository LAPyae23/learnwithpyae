import { Schema, model, models, type InferSchemaType, type Model } from 'mongoose';

/** Per-user, per-day AI request counter (day = Asia/Yangon calendar day). */
const aiUsageSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  day: { type: String, required: true }, // YYYY-MM-DD
  count: { type: Number, default: 0 },
  // Let MongoDB drop old counters automatically after 40 days
  createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 40 },
});
aiUsageSchema.index({ user: 1, day: 1 }, { unique: true });

export const AiUsage: Model<InferSchemaType<typeof aiUsageSchema>> =
  models.AiUsage || model('AiUsage', aiUsageSchema);
