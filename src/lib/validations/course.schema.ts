import { z } from 'zod';

// Course level enum
export const courseLevelSchema = z.enum(['beginner', 'intermediate', 'advanced']);

// Course creation schema (admin only)
export const createCourseSchema = z.object({
  title: z
    .string()
    .min(3, 'Course title must be at least 3 characters')
    .max(200, 'Course title cannot exceed 200 characters')
    .trim(),
  description: z.string().min(10, 'Course description must be at least 10 characters').trim(),
  thumbnail: z.string().url('Invalid thumbnail URL').optional().or(z.literal('')),
  price: z.number().min(0, 'Price cannot be negative'),
  category: z.string().min(1, 'Course category is required').trim(),
  tags: z.array(z.string().trim()).default([]),
  duration: z.number().min(1, 'Duration must be at least 1 minute'),
  level: courseLevelSchema.default('beginner'),
  language: z.string().trim().default('English'),
  isPublished: z.boolean().default(false),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;

// Course update schema (admin only)
export const updateCourseSchema = z.object({
  title: z
    .string()
    .min(3, 'Course title must be at least 3 characters')
    .max(200, 'Course title cannot exceed 200 characters')
    .trim()
    .optional(),
  description: z
    .string()
    .min(10, 'Course description must be at least 10 characters')
    .trim()
    .optional(),
  thumbnail: z.string().url('Invalid thumbnail URL').optional().or(z.literal('')),
  price: z.number().min(0, 'Price cannot be negative').optional(),
  category: z.string().min(1, 'Course category is required').trim().optional(),
  tags: z.array(z.string().trim()).optional(),
  duration: z.number().min(1, 'Duration must be at least 1 minute').optional(),
  level: courseLevelSchema.optional(),
  language: z.string().trim().optional(),
  isPublished: z.boolean().optional(),
});

export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;

// Course list query parameters schema
export const courseListQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform(val => (val ? parseInt(val, 10) : 1))
    .pipe(z.number().min(1, 'Page must be at least 1')),
  limit: z
    .string()
    .optional()
    .transform(val => (val ? parseInt(val, 10) : 12))
    .pipe(z.number().min(1, 'Limit must be at least 1').max(50, 'Limit cannot exceed 50')),
  search: z.string().optional(),
  sort: z.enum(['price-asc', 'price-desc', 'title-asc', 'title-desc']).optional(),
  category: z.string().optional(),
  tags: z
    .string()
    .optional()
    .transform(val => (val ? val.split(',').map(tag => tag.trim()) : undefined)),
  level: courseLevelSchema.optional(),
});

export type CourseListQuery = z.infer<typeof courseListQuerySchema>;

// Course ID validation schema
export const courseIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid course ID');

export type CourseId = z.infer<typeof courseIdSchema>;
