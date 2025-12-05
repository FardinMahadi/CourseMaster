import { z } from 'zod';

// Schema for submitting an assignment
export const submitAssignmentSchema = z
  .object({
    assignmentId: z.string().min(1, 'Assignment ID is required'),
    submissionText: z.string().trim().optional(),
    submissionUrl: z
      .string()
      .url('Invalid URL format')
      .trim()
      .optional()
      .refine(
        url => {
          // Validate Google Drive URL format
          if (url) {
            return (
              url.includes('drive.google.com') ||
              url.includes('docs.google.com') ||
              url.startsWith('https://')
            );
          }
          return true;
        },
        {
          message: 'Submission URL must be a valid Google Drive link or HTTPS URL',
        }
      ),
  })
  .refine(
    data => {
      // At least one submission method must be provided
      return !!(data.submissionText || data.submissionUrl);
    },
    {
      message: 'Either submission text or submission URL is required',
      path: ['submissionText'],
    }
  );

export type SubmitAssignmentInput = z.infer<typeof submitAssignmentSchema>;

// Schema for querying assignments
export const assignmentQuerySchema = z.object({
  courseId: z.string().min(1, 'Invalid course ID').optional(),
  lessonId: z.string().min(1, 'Invalid lesson ID').optional(),
});

export type AssignmentQueryInput = z.infer<typeof assignmentQuerySchema>;

// Schema for assignment ID validation
export const assignmentIdSchema = z
  .string()
  .min(1, 'Assignment ID is required')
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid assignment ID format');

// Schema for grading an assignment (admin only)
export const gradeAssignmentSchema = z.object({
  score: z.number().min(0, 'Score cannot be negative'),
  feedback: z.string().trim().optional(),
  status: z.enum(['submitted', 'graded', 'returned']),
});

export type GradeAssignmentInput = z.infer<typeof gradeAssignmentSchema>;
