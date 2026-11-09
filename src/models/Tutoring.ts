import { Schema, model, models, type InferSchemaType, type Model } from 'mongoose';

export const SLOT_DURATIONS = [30, 45, 60, 90] as const;

/** A time a teacher offers for a 1-on-1 class. */
const tutorSlotSchema = new Schema(
  {
    teacher: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    startAt: { type: Date, required: true, index: true },
    durationMin: { type: Number, required: true },
    price: { type: Number, required: true, min: 0 }, // Ks, fixed when the slot is created
    status: { type: String, enum: ['open', 'booked', 'cancelled'], default: 'open', index: true },
  },
  { timestamps: true }
);
tutorSlotSchema.index({ teacher: 1, startAt: 1 });

/**
 * A booking. Money goes to the platform's wallet; an admin checks the screenshot, then the
 * teacher shares a meeting link. pending → confirmed → completed (or rejected / cancelled).
 */
const bookingSchema = new Schema(
  {
    // Not unique: a cancelled/rejected booking frees the slot for someone else.
    // Double booking is prevented by the atomic open → booked update on the slot.
    slot: { type: Schema.Types.ObjectId, ref: 'TutorSlot', required: true, index: true },
    teacher: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    startAt: { type: Date, required: true },
    durationMin: { type: Number, required: true },
    price: { type: Number, required: true },
    topic: { type: String, default: '', maxlength: 300 },
    method: { type: String, default: '' },
    transactionId: { type: String, default: '', maxlength: 64 },
    screenshot: {
      data: { type: Buffer, select: false },
      mime: { type: String },
      size: { type: Number },
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'rejected', 'cancelled'],
      default: 'pending',
      index: true,
    },
    meetingLink: { type: String, default: '', maxlength: 500 },
    note: { type: String, default: '', maxlength: 300 }, // admin / teacher note
    review: {
      stars: { type: Number, min: 1, max: 5, default: null },
      text: { type: String, default: '', maxlength: 500 },
      at: { type: Date, default: null },
    },
  },
  { timestamps: true }
);
bookingSchema.index({ status: 1, createdAt: 1 });

export const TutorSlot: Model<InferSchemaType<typeof tutorSlotSchema>> =
  models.TutorSlot || model('TutorSlot', tutorSlotSchema);
export const Booking: Model<InferSchemaType<typeof bookingSchema>> =
  models.Booking || model('Booking', bookingSchema);
