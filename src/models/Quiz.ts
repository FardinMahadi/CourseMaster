import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IQuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number; // Index of correct option
  points: number;
}

export interface IQuiz extends Document {
  course: mongoose.Types.ObjectId;
  lesson?: mongoose.Types.ObjectId;
  title: string;
  description: string;
  questions: IQuizQuestion[];
  timeLimit?: number; // in minutes
  passingScore: number; // percentage
  createdAt: Date;
  updatedAt: Date;
}

interface IQuizModel extends Model<IQuiz> {
  // Add static methods here if needed
}

const quizQuestionSchema = new Schema<IQuizQuestion>(
  {
    question: {
      type: String,
      required: [true, 'Question is required'],
      trim: true,
    },
    options: {
      type: [String],
      required: [true, 'Options are required'],
      validate: {
        validator: function (options: string[]) {
          return options.length >= 2 && options.length <= 6;
        },
        message: 'Quiz must have between 2 and 6 options',
      },
    },
    correctAnswer: {
      type: Number,
      required: [true, 'Correct answer is required'],
      min: [0, 'Correct answer index must be non-negative'],
    },
    points: {
      type: Number,
      required: [true, 'Points are required'],
      min: [0, 'Points cannot be negative'],
      default: 1,
    },
  },
  { _id: false }
);

const quizSchema = new Schema<IQuiz>(
  {
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course is required'],
    },
    lesson: {
      type: Schema.Types.ObjectId,
      ref: 'Lesson',
    },
    title: {
      type: String,
      required: [true, 'Quiz title is required'],
      trim: true,
      minlength: [3, 'Quiz title must be at least 3 characters'],
      maxlength: [200, 'Quiz title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
    },
    questions: {
      type: [quizQuestionSchema],
      required: [true, 'Questions are required'],
      validate: {
        validator: function (questions: IQuizQuestion[]) {
          return questions.length > 0;
        },
        message: 'Quiz must have at least one question',
      },
    },
    timeLimit: {
      type: Number,
      min: [1, 'Time limit must be at least 1 minute'],
    },
    passingScore: {
      type: Number,
      required: [true, 'Passing score is required'],
      min: [0, 'Passing score cannot be negative'],
      max: [100, 'Passing score cannot exceed 100'],
      default: 60,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
quizSchema.index({ course: 1 });
quizSchema.index({ lesson: 1 });

const Quiz: IQuizModel =
  (mongoose.models.Quiz as IQuizModel) || mongoose.model<IQuiz, IQuizModel>('Quiz', quizSchema);

export default Quiz;
