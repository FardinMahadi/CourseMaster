import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILesson extends Document {
  course: mongoose.Types.ObjectId;
  title: string;
  description: string;
  videoUrl?: string;
  duration: number; // in minutes
  order: number;
  isPreview: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface ILessonModel extends Model<ILesson> {
  // Add static methods here if needed
}

const lessonSchema = new Schema<ILesson>(
  {
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course is required'],
    },
    title: {
      type: String,
      required: [true, 'Lesson title is required'],
      trim: true,
      minlength: [3, 'Lesson title must be at least 3 characters'],
      maxlength: [200, 'Lesson title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
    },
    videoUrl: {
      type: String,
      trim: true,
    },
    duration: {
      type: Number,
      required: [true, 'Lesson duration is required'],
      min: [0, 'Duration cannot be negative'],
    },
    order: {
      type: Number,
      required: [true, 'Lesson order is required'],
      min: [1, 'Order must be at least 1'],
    },
    isPreview: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
lessonSchema.index({ course: 1, order: 1 });
lessonSchema.index({ course: 1 });

const Lesson: ILessonModel =
  (mongoose.models.Lesson as ILessonModel) ||
  mongoose.model<ILesson, ILessonModel>('Lesson', lessonSchema);

export default Lesson;
