import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    questionId: { type: String, required: true, unique: true },
    questionText: { type: String, required: true },
    answer: { type: String, default: null },
    status: { type: String, enum: ['pending', 'answered', 'timeout'], default: 'pending' },
    createdAt: { type: Date, default: Date.now },
    answeredAt: { type: Date },
  },
  { timestamps: true },
);

export const Question = mongoose.model('Question', questionSchema);
