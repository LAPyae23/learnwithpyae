import { Schema, model, models, type InferSchemaType, type Model } from 'mongoose';

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['student', 'teacher', 'admin', 'agency'], default: 'student' },
    targetLevel: { type: String, enum: ['N5', 'N4', 'N3', 'N2', 'N1', null], default: null },
    examSession: { type: String, default: null }, // e.g. "2026-12"
    studyMinutesPerDay: { type: Number, default: 30, min: 5, max: 600 },
    plan: {
      type: { type: String, enum: ['free', 'monthly', 'quarterly', 'annual'], default: 'free' },
      expiresAt: { type: Date, default: null },
    },
    telegram: {
      chatId: { type: String, default: null, index: true },
      linkedAt: { type: Date, default: null },
      remindersOn: { type: Boolean, default: true },
      // One-time code used in the t.me deep link to connect the account
      linkCode: { type: String, default: null, index: true },
      linkCodeExpiresAt: { type: Date, default: null },
    },
    // Invite friends: my code, and who invited me
    referralCode: { type: String, default: undefined, unique: true, sparse: true },
    referredBy: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    // Public teacher profile (shown on /teachers/[id])
    teacherProfile: {
      headline: { type: String, default: '', maxlength: 120 },
      bio: { type: String, default: '', maxlength: 1500 },
      jlptLevel: { type: String, default: '' },
      followers: { type: Number, default: 0 },
      // 1-on-1 classes
      tutoringEnabled: { type: Boolean, default: false },
      pricePerHour: { type: Number, default: 0, min: 0 },
      tutoringAbout: { type: String, default: '', maxlength: 600 },
    },
    streak: {
      current: { type: Number, default: 0 },
      longest: { type: Number, default: 0 },
      // Calendar day (YYYY-MM-DD, Asia/Yangon) of the last study activity
      lastStudyDay: { type: String, default: null },
    },
  },
  { timestamps: true }
);

export type UserDoc = InferSchemaType<typeof userSchema> & { _id: Schema.Types.ObjectId };

export const User: Model<InferSchemaType<typeof userSchema>> =
  models.User || model('User', userSchema);
