import { Schema, model, models, type InferSchemaType, type Model } from 'mongoose';

export const REACTIONS = ['love', 'clap', 'fire', 'wow', 'thanks'] as const;
export type Reaction = (typeof REACTIONS)[number];

/** One learner's reaction and star rating on a lesson (either may be empty). */
const lessonVoteSchema = new Schema(
  {
    lesson: { type: Schema.Types.ObjectId, ref: 'Lesson', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reaction: { type: String, enum: [...REACTIONS, null], default: null },
    stars: { type: Number, min: 1, max: 5, default: null },
  },
  { timestamps: true }
);
lessonVoteSchema.index({ lesson: 1, user: 1 }, { unique: true });

const lessonCommentSchema = new Schema(
  {
    lesson: { type: Schema.Types.ObjectId, ref: 'Lesson', required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, trim: true, maxlength: 1000 },
    parent: { type: Schema.Types.ObjectId, ref: 'LessonComment', default: null },
  },
  { timestamps: true }
);
lessonCommentSchema.index({ lesson: 1, createdAt: -1 });

/** Unique viewers: one row per learner per lesson. */
const lessonViewSchema = new Schema({
  lesson: { type: Schema.Types.ObjectId, ref: 'Lesson', required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  at: { type: Date, default: Date.now },
});
lessonViewSchema.index({ lesson: 1, user: 1 }, { unique: true });

const followSchema = new Schema(
  {
    follower: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    teacher: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: true }
);
followSchema.index({ follower: 1, teacher: 1 }, { unique: true });

export const LessonVote: Model<InferSchemaType<typeof lessonVoteSchema>> =
  models.LessonVote || model('LessonVote', lessonVoteSchema);
export const LessonComment: Model<InferSchemaType<typeof lessonCommentSchema>> =
  models.LessonComment || model('LessonComment', lessonCommentSchema);
export const LessonView: Model<InferSchemaType<typeof lessonViewSchema>> =
  models.LessonView || model('LessonView', lessonViewSchema);
export const Follow: Model<InferSchemaType<typeof followSchema>> =
  models.Follow || model('Follow', followSchema);
