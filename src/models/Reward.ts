import { Schema, model, models, type InferSchemaType, type Model } from 'mongoose';

export const REWARD_KINDS = ['streak', 'referral', 'group', 'gift', 'admin'] as const;
export type RewardKind = (typeof REWARD_KINDS)[number];

/** Free Premium days a learner earned. `key` makes each reward grant exactly once. */
const rewardSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    kind: { type: String, enum: REWARD_KINDS, required: true },
    days: { type: Number, required: true, min: 1 },
    key: { type: String, required: true, unique: true },
    note: { type: String, default: '', maxlength: 200 },
  },
  { timestamps: true }
);

/** A learner who can't afford Premium asks for one; buyers' purchases fund it. */
const scholarshipSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    reason: { type: String, required: true, trim: true, maxlength: 600 },
    status: {
      type: String,
      enum: ['pending', 'granted', 'withdrawn'],
      default: 'pending',
      index: true,
    },
    days: { type: Number, default: 0 },
    sponsorPayment: { type: Schema.Types.ObjectId, ref: 'Payment', default: null },
    grantedAt: { type: Date, default: null },
    queuedAt: { type: Date, default: Date.now }, // place in the queue (reset on re-apply)
  },
  { timestamps: true }
);
scholarshipSchema.index({ status: 1, queuedAt: 1 });

export const Reward: Model<InferSchemaType<typeof rewardSchema>> =
  models.Reward || model('Reward', rewardSchema);
export const Scholarship: Model<InferSchemaType<typeof scholarshipSchema>> =
  models.Scholarship || model('Scholarship', scholarshipSchema);
