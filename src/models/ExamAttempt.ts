import { Schema, model, models, type InferSchemaType, type Model } from 'mongoose';

const examAttemptSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    level: { type: String, enum: ['N5', 'N4', 'N3', 'N2', 'N1'], required: true },
    sections: [{ type: String, enum: ['grammar', 'reading', 'listening'] }],
    sectionResults: [
      {
        _id: false,
        section: { type: String, enum: ['grammar', 'reading', 'listening'] },
        score: Number,
        total: Number,
        timeTaken: Number, // seconds
      },
    ],
    answers: [
      {
        _id: false,
        questionId: String,
        selectedIndex: { type: Number, default: null },
        isCorrect: Boolean,
      },
    ],
    totalScore: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
  },
  { timestamps: true }
);
examAttemptSchema.index({ user: 1, createdAt: -1 });

export const ExamAttempt: Model<InferSchemaType<typeof examAttemptSchema>> =
  models.ExamAttempt || model('ExamAttempt', examAttemptSchema);
