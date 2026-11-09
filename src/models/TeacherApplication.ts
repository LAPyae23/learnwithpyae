import { Schema, model, models, type InferSchemaType, type Model } from 'mongoose';

/** A student's request to become a teacher. One per user; re-submitting updates it. */
const teacherApplicationSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    fullName: { type: String, required: true, trim: true, maxlength: 80 },
    jlptLevel: { type: String, enum: ['N1', 'N2', 'N3', 'N4', 'N5', 'none'], required: true },
    experience: { type: String, default: '', trim: true, maxlength: 1000 },
    bio: { type: String, default: '', trim: true, maxlength: 1000 },
    contact: { type: String, required: true, trim: true, maxlength: 120 }, // phone / Telegram
    sampleUrl: { type: String, default: '', trim: true, maxlength: 500 }, // e.g. a YouTube video
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'revoked'],
      default: 'pending',
      index: true,
    },
    note: { type: String, default: '', maxlength: 300 }, // admin note shown to the applicant
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const TeacherApplication: Model<InferSchemaType<typeof teacherApplicationSchema>> =
  models.TeacherApplication || model('TeacherApplication', teacherApplicationSchema);
