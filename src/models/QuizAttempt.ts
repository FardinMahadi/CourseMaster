import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IQuizAnswer {
  questionIndex: number;
  selectedAnswer: number; // Index of selected option
}

export interface IQuizAttempt extends Document {
  quiz: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  answers: IQuizAnswer[];
  score: number;
  isPassed: boolean;
  startedAt: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface IQuizAttemptModel extends Model<IQuizAttempt> {
  // Add static methods here if needed
}

const quizAnswerSchema = new Schema<IQuizAnswer>(
  {
    questionIndex: {
      type: Number,
      required: [true, 'Question index is required'],
      min: [0, 'Question index must be non-negative'],
    },
    selectedAnswer: {
      type: Number,
      required: [true, 'Selected answer is required'],
      min: [0, 'Selected answer index must be non-negative'],
    },
  },
  { _id: false }
);

const quizAttemptSchema = new Schema<IQuizAttempt>(
  {
    quiz: {
      type: Schema.Types.ObjectId,
      ref: 'Quiz',
      required: [true, 'Quiz is required'],
    },
    student: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student is required'],
    },
    answers: {
      type: [quizAnswerSchema],
      required: [true, 'Answers are required'],
    },
    score: {
      type: Number,
      required: [true, 'Score is required'],
      min: [0, 'Score cannot be negative'],
    },
    isPassed: {
      type: Boolean,
      required: [true, 'Pass status is required'],
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
quizAttemptSchema.index({ quiz: 1 });
quizAttemptSchema.index({ student: 1 });
quizAttemptSchema.index({ quiz: 1, student: 1 });

const QuizAttempt: IQuizAttemptModel =
  (mongoose.models.QuizAttempt as IQuizAttemptModel) ||
  mongoose.model<IQuizAttempt, IQuizAttemptModel>('QuizAttempt', quizAttemptSchema);

export default QuizAttempt;
