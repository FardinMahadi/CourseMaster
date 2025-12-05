import { z } from 'zod';

export const batchStatusSchema = z.enum(['upcoming', 'ongoing', 'completed']);

export const createBatchSchema = z.object({
  course: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid course ID'),
  name: z.string().min(3, 'Batch name must be at least 3 characters').max(100),
  startDate: z.string().datetime('Invalid start date'),
  endDate: z.string().datetime('Invalid end date'),
  maxStudents: z.number().min(1, 'Maximum students must be at least 1'),
  instructor: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid instructor ID')
    .optional(),
});

export type CreateBatchInput = z.infer<typeof createBatchSchema>;

export const updateBatchSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  maxStudents: z.number().min(1).optional(),
  status: batchStatusSchema.optional(),
});

export type UpdateBatchInput = z.infer<typeof updateBatchSchema>;

export const batchQuerySchema = z.object({
  course: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .optional(),
  instructor: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .optional(),
  status: batchStatusSchema.optional(),
});

export type BatchQuery = z.infer<typeof batchQuerySchema>;

export const batchIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid batch ID');

export type BatchId = z.infer<typeof batchIdSchema>;
