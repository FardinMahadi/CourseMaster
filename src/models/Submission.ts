import mongoose, { Schema, Document, Model } from 'mongoose';

export type SubmissionStatus = 'submitted' | 'graded' | 'returned';

export interface ISubmission extends Document {
  assignment: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  submissionText?: string;
  submissionUrl?: string; // Google Drive link
  submittedAt: Date;
  gradedAt?: Date;
  score?: number;
  feedback?: string;
  status: SubmissionStatus;
  createdAt: Date;
  updatedAt: Date;
}

interface ISubmissionModel extends Model<ISubmission> {
  // Add static methods here if needed
}

const submissionSchema = new Schema<ISubmission>(
  {
    assignment: {
      type: Schema.Types.ObjectId,
      ref: 'Assignment',
      required: [true, 'Assignment is required'],
    },
    student: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student is required'],
    },
    submissionText: {
      type: String,
      trim: true,
    },
    submissionUrl: {
      type: String,
      trim: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    gradedAt: {
      type: Date,
    },
    score: {
      type: Number,
      min: [0, 'Score cannot be negative'],
    },
    feedback: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['submitted', 'graded', 'returned'],
      default: 'submitted',
    },
  },
  {
    timestamps: true,
  }
);

// Validate at least one submission method is provided
submissionSchema.pre('save', async function () {
  if (this.isNew || this.isModified('submissionText') || this.isModified('submissionUrl')) {
    if (!this.submissionText && !this.submissionUrl) {
      throw new Error('Either submission text or submission URL is required');
    }
  }
});

// Indexes
submissionSchema.index({ assignment: 1 });
submissionSchema.index({ student: 1 });
submissionSchema.index({ assignment: 1, student: 1 }, { unique: true });
submissionSchema.index({ status: 1 });

const Submission: ISubmissionModel =
  (mongoose.models.Submission as ISubmissionModel) ||
  mongoose.model<ISubmission, ISubmissionModel>('Submission', submissionSchema);

export default Submission;
