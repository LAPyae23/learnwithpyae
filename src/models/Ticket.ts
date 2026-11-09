import { Schema, model, models, type InferSchemaType, type Model } from 'mongoose';

export const TICKET_CATEGORIES = ['request', 'problem', 'payment', 'idea', 'other'] as const;

/** A conversation between a teacher and the admins (requests, problems, ideas). */
const ticketSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    subject: { type: String, required: true, trim: true, maxlength: 140 },
    category: { type: String, enum: TICKET_CATEGORIES, default: 'request' },
    status: { type: String, enum: ['open', 'answered', 'closed'], default: 'open', index: true },
    messages: [
      {
        _id: false,
        author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        fromAdmin: { type: Boolean, default: false },
        text: { type: String, required: true, maxlength: 3000 },
        at: { type: Date, default: Date.now },
      },
    ],
    unreadByAdmin: { type: Boolean, default: true },
    unreadByUser: { type: Boolean, default: false },
    lastMessageAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

export const Ticket: Model<InferSchemaType<typeof ticketSchema>> =
  models.Ticket || model('Ticket', ticketSchema);
