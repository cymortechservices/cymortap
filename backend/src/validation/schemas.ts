import { z } from 'zod';
import { LINK_THEMES, MAX_DESCRIPTION_LENGTH, MAX_MESSAGE_LENGTH, MAX_TITLE_LENGTH } from '../config/constants';

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Use at most ${max} characters.`)
    .optional()
    .transform((v) => (v === '' ? undefined : v));

const country = z.string().trim().length(2, 'Choose a country.').toUpperCase().optional();

export const messageField = z
  .string({ required_error: 'Write the message people will start with.' })
  .max(MAX_MESSAGE_LENGTH * 2, `Keep the message under ${MAX_MESSAGE_LENGTH} characters.`);

export const createLinkSchema = z.object({
  country,
  phone: z.string({ required_error: 'Enter a WhatsApp number.' }).trim().min(4, 'Enter a WhatsApp number.').max(40),
  message: messageField,
  title: optionalText(MAX_TITLE_LENGTH),
  description: optionalText(MAX_DESCRIPTION_LENGTH),
  slug: z.string().trim().max(60).optional().transform((v) => (v === '' ? undefined : v)),
  theme: z.enum(LINK_THEMES).optional(),
  analyticsEnabled: z.boolean().optional(),
});
export type CreateLinkInput = z.infer<typeof createLinkSchema>;

export const updateLinkSchema = z
  .object({
    country,
    phone: z.string().trim().min(4).max(40).optional(),
    message: messageField.optional(),
    title: z.string().trim().max(MAX_TITLE_LENGTH).optional(),
    description: z.string().trim().max(MAX_DESCRIPTION_LENGTH).optional(),
    theme: z.enum(LINK_THEMES).optional(),
    analyticsEnabled: z.boolean().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: 'Nothing to update.' });
export type UpdateLinkInput = z.infer<typeof updateLinkSchema>;

export const statusSchema = z.object({ status: z.enum(['active', 'disabled']) });

export const slugCheckQuery = z.object({ slug: z.string().trim().min(1).max(60) });

export const reportSchema = z.object({
  reason: z.enum(['spam', 'scam', 'impersonation', 'harassment', 'other']),
  details: z.string().trim().max(500).optional(),
});

const password = z.string().min(10, 'Use at least 10 characters.').max(128, 'Use at most 128 characters.');
const email = z.string().trim().toLowerCase().email('Enter a valid email address.').max(254);

export const registerSchema = z.object({
  email,
  password,
  displayName: z.string().trim().min(1, 'Enter your name.').max(80),
});
export const loginSchema = z.object({ email, password: z.string().min(1, 'Enter your password.').max(128) });
export const forgotSchema = z.object({ email });
export const resetSchema = z.object({ token: z.string().min(20).max(200), password });
export const changePasswordSchema = z.object({ currentPassword: z.string().min(1).max(128), newPassword: password });
export const profileSchema = z
  .object({
    displayName: z.string().trim().min(1).max(80).optional(),
    preferences: z.object({ defaultAnalyticsEnabled: z.boolean().optional() }).optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: 'Nothing to update.' });
export const deleteAccountSchema = z.object({ password: z.string().min(1).max(128) });

export const listQuery = z.object({
  search: z.string().trim().max(80).optional(),
  status: z.enum(['active', 'disabled', 'all']).default('all'),
  sort: z.enum(['newest', 'oldest', 'title']).default('newest'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

const isoDay = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD.');
export const rangeQuery = z.object({ from: isoDay.optional(), to: isoDay.optional(), linkId: z.string().regex(/^[a-f\d]{24}$/i).optional() });
