import { Schema, model, models, type InferSchemaType, type Model } from 'mongoose';

/**
 * Failed sign-in / sign-up counters, one per key (e.g. email + IP). Stored in the database
 * rather than memory so the limit holds across every serverless instance. Rows delete
 * themselves when their window ends (TTL index on expiresAt).
 */
const loginAttemptSchema = new Schema({
  key: { type: String, required: true, unique: true },
  count: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
});

export type LoginAttemptDoc = InferSchemaType<typeof loginAttemptSchema>;

export const LoginAttempt: Model<LoginAttemptDoc> =
  models.LoginAttempt || model('LoginAttempt', loginAttemptSchema);
