import { z } from 'zod';

// Schema for sending custom email
export const sendEmailSchema = z.object({
  subject: z
    .string()
    .min(1, 'Subject is required')
    .max(200, 'Subject must be less than 200 characters'),
  message: z
    .string()
    .min(1, 'Message is required')
    .max(5000, 'Message must be less than 5000 characters'),
  actionUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  actionText: z.string().max(50, 'Action text must be less than 50 characters').optional(),
});

export type SendEmailInput = z.infer<typeof sendEmailSchema>;
