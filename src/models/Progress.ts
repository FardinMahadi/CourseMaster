import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProgress extends Document {
  student: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  lesson: mongoose.Types.ObjectId;
  isCompleted: boolean;
  completedAt?: Date;
  timeSpent: number; // in minutes
  lastAccessedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface IProgressModel extends Model<IProgress> {
  // Add static methods here if needed
}

const progressSchema = new Schema<IProgress>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student is required'],
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course is required'],
    },
    lesson: {
      type: Schema.Types.ObjectId,
      ref: 'Lesson',
      required: [true, 'Lesson is required'],
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
    },
    timeSpent: {
      type: Number,
      default: 0,
      min: [0, 'Time spent cannot be negative'],
    },
    lastAccessedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
progressSchema.index({ student: 1 });
progressSchema.index({ course: 1 });
progressSchema.index({ lesson: 1 });
progressSchema.index({ student: 1, course: 1, lesson: 1 }, { unique: true });
progressSchema.index({ isCompleted: 1 });

const Progress: IProgressModel =
  (mongoose.models.Progress as IProgressModel) ||
  mongoose.model<IProgress, IProgressModel>('Progress', progressSchema);

export default Progress;
