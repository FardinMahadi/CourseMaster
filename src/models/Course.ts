import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICourse extends Document {
  title: string;
  description: string;
  thumbnail?: string;
  price: number;
  category: string;
  tags: string[];
  instructor: mongoose.Types.ObjectId;
  duration: number; // in minutes
  level: 'beginner' | 'intermediate' | 'advanced';
  language: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface ICourseModel extends Model<ICourse> {
  // Add static methods here if needed
}

const courseSchema = new Schema<ICourse>(
  {
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
      minlength: [3, 'Course title must be at least 3 characters'],
      maxlength: [200, 'Course title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Course description is required'],
      trim: true,
      minlength: [10, 'Course description must be at least 10 characters'],
    },
    thumbnail: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Course price is required'],
      min: [0, 'Price cannot be negative'],
    },
    category: {
      type: String,
      required: [true, 'Course category is required'],
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    instructor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Instructor is required'],
    },
    duration: {
      type: Number,
      required: [true, 'Course duration is required'],
      min: [1, 'Duration must be at least 1 minute'],
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    language: {
      type: String,
      default: 'English',
      trim: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
courseSchema.index({ title: 1 });
courseSchema.index({ category: 1 });
courseSchema.index({ instructor: 1 });
courseSchema.index({ isPublished: 1 });
courseSchema.index({ tags: 1 });

const Course: ICourseModel =
  (mongoose.models.Course as ICourseModel) ||
  mongoose.model<ICourse, ICourseModel>('Course', courseSchema);

export default Course;
