import { z } from 'zod';
import { MAX_MESSAGE_LENGTH } from './config';

export const linkFormSchema = z.object({
  country: z.string().length(2, 'Choose a country.'),
  phone: z.string().trim().min(4, 'Enter a WhatsApp number.').max(40, 'That number is too long.'),
  message: z
    .string()
    .trim()
    .min(1, 'Write the message people will start with.')
    .max(MAX_MESSAGE_LENGTH, `Keep the message under ${MAX_MESSAGE_LENGTH} characters.`),
  title: z.string().trim().max(80, 'Use at most 80 characters.').optional(),
  description: z.string().trim().max(200, 'Use at most 200 characters.').optional(),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .optional()
    .refine((v) => !v || (/^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$/.test(v) && !v.includes('--')), 'Use 3–40 letters, numbers or single hyphens.'),
});
export type LinkFormValues = z.infer<typeof linkFormSchema>;

const email = z.string().trim().email('Enter a valid email address.');
export const loginSchema = z.object({ email, password: z.string().min(1, 'Enter your password.') });
export const registerSchema = z.object({
  displayName: z.string().trim().min(1, 'Enter your name.').max(80),
  email,
  password: z.string().min(10, 'Use at least 10 characters.').max(128),
});
export const forgotSchema = z.object({ email });
export const resetSchema = z.object({ password: z.string().min(10, 'Use at least 10 characters.').max(128) });
