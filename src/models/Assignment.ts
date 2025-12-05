import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAssignment extends Document {
  course: mongoose.Types.ObjectId;
  lesson?: mongoose.Types.ObjectId;
  title: string;
  description: string;
  instructions: string;
  dueDate?: Date;
  maxScore: number;
  createdAt: Date;
  updatedAt: Date;
}

interface IAssignmentModel extends Model<IAssignment> {
  // Add static methods here if needed
}

const assignmentSchema = new Schema<IAssignment>(
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
      required: [true, 'Assignment title is required'],
      trim: true,
      minlength: [3, 'Assignment title must be at least 3 characters'],
      maxlength: [200, 'Assignment title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
    },
    instructions: {
      type: String,
      required: [true, 'Assignment instructions are required'],
      trim: true,
    },
    dueDate: {
      type: Date,
    },
    maxScore: {
      type: Number,
      required: [true, 'Maximum score is required'],
      min: [0, 'Maximum score cannot be negative'],
      default: 100,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
assignmentSchema.index({ course: 1 });
assignmentSchema.index({ lesson: 1 });
assignmentSchema.index({ dueDate: 1 });

const Assignment: IAssignmentModel =
  (mongoose.models.Assignment as IAssignmentModel) ||
  mongoose.model<IAssignment, IAssignmentModel>('Assignment', assignmentSchema);

export default Assignment;
