import mongoose, { Schema, Document, Model } from 'mongoose';

export type BatchStatus = 'upcoming' | 'ongoing' | 'completed';

export interface IBatch extends Document {
  course: mongoose.Types.ObjectId;
  name: string;
  startDate: Date;
  endDate: Date;
  maxStudents: number;
  currentStudents: number;
  instructor: mongoose.Types.ObjectId;
  status: BatchStatus;
  createdAt: Date;
  updatedAt: Date;
}

interface IBatchModel extends Model<IBatch> {
  // Add static methods here if needed
}

const batchSchema = new Schema<IBatch>(
  {
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course is required'],
    },
    name: {
      type: String,
      required: [true, 'Batch name is required'],
      trim: true,
      minlength: [3, 'Batch name must be at least 3 characters'],
      maxlength: [100, 'Batch name cannot exceed 100 characters'],
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    maxStudents: {
      type: Number,
      required: [true, 'Maximum students is required'],
      min: [1, 'Maximum students must be at least 1'],
    },
    currentStudents: {
      type: Number,
      default: 0,
      min: [0, 'Current students cannot be negative'],
    },
    instructor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Instructor is required'],
    },
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed'],
      default: 'upcoming',
    },
  },
  {
    timestamps: true,
  }
);

// Validate endDate is after startDate
batchSchema.pre('save', async function () {
  if (this.isModified('endDate') || this.isModified('startDate')) {
    if (this.endDate <= this.startDate) {
      throw new Error('End date must be after start date');
    }
  }
});

// Indexes
batchSchema.index({ course: 1 });
batchSchema.index({ startDate: 1 });
batchSchema.index({ endDate: 1 });
batchSchema.index({ status: 1 });
batchSchema.index({ instructor: 1 });
// Compound index for common queries
batchSchema.index({ course: 1, status: 1 });
batchSchema.index({ instructor: 1, status: 1 });

const Batch: IBatchModel =
  (mongoose.models.Batch as IBatchModel) ||
  mongoose.model<IBatch, IBatchModel>('Batch', batchSchema);

export default Batch;
