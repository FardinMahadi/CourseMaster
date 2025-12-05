import { z } from 'zod';

// Course ID validation schema
export const courseIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid course ID');

// Batch ID validation schema (optional)
export const batchIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid batch ID')
  .optional();

// Enrollment creation schema
export const createEnrollmentSchema = z.object({
  courseId: courseIdSchema,
  batchId: batchIdSchema,
});

export type CreateEnrollmentInput = z.infer<typeof createEnrollmentSchema>;

// Enrollment query parameters schema
export const enrollmentQuerySchema = z.object({
  courseId: courseIdSchema.optional(),
  status: z.enum(['enrolled', 'completed', 'dropped']).optional(),
});

export type EnrollmentQuery = z.infer<typeof enrollmentQuerySchema>;
