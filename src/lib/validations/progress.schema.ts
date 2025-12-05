import { z } from 'zod';

// Schema for updating progress
export const updateProgressSchema = z.object({
  courseId: z.string().min(1, 'Course ID is required'),
  lessonId: z.string().min(1, 'Lesson ID is required'),
  isCompleted: z.boolean().optional().default(false),
  timeSpent: z.number().min(0, 'Time spent cannot be negative').optional().default(0),
});

export type UpdateProgressInput = z.infer<typeof updateProgressSchema>;

// Schema for querying progress
export const progressQuerySchema = z.object({
  courseId: z.string().min(1, 'Invalid course ID').optional(),
  lessonId: z.string().min(1, 'Invalid lesson ID').optional(),
});

export type ProgressQueryInput = z.infer<typeof progressQuerySchema>;
