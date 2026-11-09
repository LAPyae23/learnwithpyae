import { Schema, model, models, type InferSchemaType, type Model } from 'mongoose';

const LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'];
const CARD_TYPES = ['vocabulary', 'kanji', 'grammar'];

const deckSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true },
    label: { type: String, required: true },
    level: { type: String, enum: LEVELS, required: true },
    type: { type: String, enum: CARD_TYPES, required: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const cardSchema = new Schema(
  {
    // Stable key from the content source (e.g. "n5v1") so re-seeding updates instead of duplicating
    key: { type: String, required: true, unique: true },
    deck: { type: Schema.Types.ObjectId, ref: 'Deck', required: true, index: true },
    front: { type: String, required: true },
    reading: { type: String, default: '' },
    back: { type: String, required: true },
    example: { type: String, default: '' },
    exampleMy: { type: String, default: '' },
    level: { type: String, enum: LEVELS, required: true },
    type: { type: String, enum: CARD_TYPES, required: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

/** One row per (user, card): that user's spaced-repetition state for the card. */
const cardReviewSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    card: { type: Schema.Types.ObjectId, ref: 'Card', required: true },
    deck: { type: Schema.Types.ObjectId, ref: 'Deck', required: true },
    easeFactor: { type: Number, default: 2.5 },
    intervalDays: { type: Number, default: 0 },
    repetitions: { type: Number, default: 0 },
    dueAt: { type: Date, required: true },
    lastReviewedAt: { type: Date, required: true },
    reviewCount: { type: Number, default: 0 },
    lapses: { type: Number, default: 0 },
  },
  { timestamps: true }
);
cardReviewSchema.index({ user: 1, card: 1 }, { unique: true });
cardReviewSchema.index({ user: 1, deck: 1, dueAt: 1 });

export const Deck: Model<InferSchemaType<typeof deckSchema>> =
  models.Deck || model('Deck', deckSchema);
export const Card: Model<InferSchemaType<typeof cardSchema>> =
  models.Card || model('Card', cardSchema);
export const CardReview: Model<InferSchemaType<typeof cardReviewSchema>> =
  models.CardReview || model('CardReview', cardReviewSchema);
