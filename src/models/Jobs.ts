import { Schema, model, models, type InferSchemaType, type Model } from 'mongoose';

export const JOB_FIELDS = [
  'kaigo', // care worker
  'food', // food service / restaurant
  'manufacturing',
  'construction',
  'agriculture',
  'hotel',
  'it',
  'other',
] as const;
export const JLPT_CERTS = ['N1', 'N2', 'N3', 'N4', 'N5', 'none'] as const;

/** A learner's opt-in job profile. Contact details are only shown to an agency the learner accepts. */
const jobProfileSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    visible: { type: Boolean, default: false, index: true },
    headline: { type: String, default: '', trim: true, maxlength: 120 },
    fields: [{ type: String, enum: JOB_FIELDS }],
    jlptCertified: { type: String, enum: JLPT_CERTS, default: 'none' },
    location: { type: String, enum: ['japan', 'myanmar', 'any'], default: 'japan' },
    availableFrom: { type: String, default: '' }, // YYYY-MM
    city: { type: String, default: '', trim: true, maxlength: 60 },
    experience: { type: String, default: '', trim: true, maxlength: 800 },
    education: { type: String, default: '', trim: true, maxlength: 200 },
    phone: { type: String, default: '', trim: true, maxlength: 40 },
    telegram: { type: String, default: '', trim: true, maxlength: 60 },
  },
  { timestamps: true }
);

/** A company that recruits Japanese speakers (SSW agencies, employers). Admin-approved, paid manually. */
const agencySchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    companyName: { type: String, required: true, trim: true, maxlength: 120 },
    licenseNo: { type: String, default: '', trim: true, maxlength: 80 },
    country: { type: String, enum: ['myanmar', 'japan', 'other'], default: 'myanmar' },
    contactPerson: { type: String, required: true, trim: true, maxlength: 80 },
    phone: { type: String, required: true, trim: true, maxlength: 40 },
    website: { type: String, default: '', trim: true, maxlength: 200 },
    description: { type: String, default: '', trim: true, maxlength: 1000 },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'suspended'],
      default: 'pending',
      index: true,
    },
    activeUntil: { type: Date, default: null }, // access ends (admin extends after payment)
    note: { type: String, default: '', maxlength: 300 },
  },
  { timestamps: true }
);

/** An agency's interest in a learner. Contacts are exchanged only when the learner accepts. */
const agencyContactSchema = new Schema(
  {
    agency: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    jobTitle: { type: String, required: true, trim: true, maxlength: 120 },
    message: { type: String, required: true, trim: true, maxlength: 1500 },
    status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
    respondedAt: { type: Date, default: null },
  },
  { timestamps: true }
);
agencyContactSchema.index({ agency: 1, student: 1 }, { unique: true });

export const JobProfile: Model<InferSchemaType<typeof jobProfileSchema>> =
  models.JobProfile || model('JobProfile', jobProfileSchema);
export const Agency: Model<InferSchemaType<typeof agencySchema>> =
  models.Agency || model('Agency', agencySchema);
export const AgencyContact: Model<InferSchemaType<typeof agencyContactSchema>> =
  models.AgencyContact || model('AgencyContact', agencyContactSchema);
