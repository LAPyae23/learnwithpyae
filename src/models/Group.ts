import {
  Schema,
  model,
  models,
  type HydratedDocument,
  type InferSchemaType,
  type Model,
} from 'mongoose';

export const GROUP_MAX_MEMBERS = 30;

/** A study group: learners who keep each other going (shared streak, chat, leaderboard). */
const studyGroupSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    description: { type: String, default: '', trim: true, maxlength: 300 },
    level: { type: String, enum: ['N5', 'N4', 'N3', 'N2', 'N1', 'mixed'], default: 'mixed' },
    emoji: { type: String, default: '📚', maxlength: 8 },
    isPublic: { type: Boolean, default: true },
    inviteCode: { type: String, required: true, unique: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    members: [
      {
        _id: false,
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        role: { type: String, enum: ['owner', 'member'], default: 'member' },
        joinedAt: { type: Date, default: Date.now },
      },
    ],
    memberCount: { type: Number, default: 1 },
    lastMessageAt: { type: Date, default: null },
  },
  { timestamps: true }
);
studyGroupSchema.index({ 'members.user': 1 });
studyGroupSchema.index({ isPublic: 1, level: 1, memberCount: -1 });

const groupMessageSchema = new Schema(
  {
    group: { type: Schema.Types.ObjectId, ref: 'StudyGroup', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', default: null }, // null = system message
    text: { type: String, required: true, maxlength: 1000 },
    kind: { type: String, enum: ['text', 'system'], default: 'text' },
  },
  { timestamps: true }
);
groupMessageSchema.index({ group: 1, createdAt: -1 });

/** Study points per learner per Myanmar day (cards reviewed, tests taken…). Kept 120 days. */
const dailyActivitySchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  day: { type: String, required: true }, // YYYY-MM-DD (Asia/Yangon)
  points: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 120 },
});
dailyActivitySchema.index({ user: 1, day: 1 }, { unique: true });
dailyActivitySchema.index({ day: 1 });

/** One nudge per sender → receiver per day. */
const nudgeSchema = new Schema({
  from: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  to: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  day: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 48 },
});
nudgeSchema.index({ from: 1, to: 1, day: 1 }, { unique: true });

export type StudyGroupDoc = HydratedDocument<InferSchemaType<typeof studyGroupSchema>>;

export const StudyGroup: Model<InferSchemaType<typeof studyGroupSchema>> =
  models.StudyGroup || model('StudyGroup', studyGroupSchema);
export const GroupMessage: Model<InferSchemaType<typeof groupMessageSchema>> =
  models.GroupMessage || model('GroupMessage', groupMessageSchema);
export const DailyActivity: Model<InferSchemaType<typeof dailyActivitySchema>> =
  models.DailyActivity || model('DailyActivity', dailyActivitySchema);
export const Nudge: Model<InferSchemaType<typeof nudgeSchema>> =
  models.Nudge || model('Nudge', nudgeSchema);
