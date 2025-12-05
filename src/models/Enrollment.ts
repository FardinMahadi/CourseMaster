import mongoose, { Schema, Document, Model } from 'mongoose';

export type EnrollmentStatus = 'enrolled' | 'completed' | 'dropped';

export interface IEnrollment extends Document {
  student: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  batch?: mongoose.Types.ObjectId;
  enrolledAt: Date;
  completedAt?: Date;
  status: EnrollmentStatus;
  createdAt: Date;
  updatedAt: Date;
}

interface IEnrollmentModel extends Model<IEnrollment> {
  // Add static methods here if needed
}

const enrollmentSchema = new Schema<IEnrollment>(
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
    batch: {
      type: Schema.Types.ObjectId,
      ref: 'Batch',
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['enrolled', 'completed', 'dropped'],
      default: 'enrolled',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
enrollmentSchema.index({ student: 1 });
enrollmentSchema.index({ course: 1 });
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });
enrollmentSchema.index({ status: 1 });
enrollmentSchema.index({ enrolledAt: -1 });
enrollmentSchema.index({ batch: 1 });
// Compound index for common queries
enrollmentSchema.index({ course: 1, status: 1 });
enrollmentSchema.index({ student: 1, status: 1 });

const Enrollment: IEnrollmentModel =
  (mongoose.models.Enrollment as IEnrollmentModel) ||
  mongoose.model<IEnrollment, IEnrollmentModel>('Enrollment', enrollmentSchema);

export default Enrollment;
