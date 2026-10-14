import rateLimit from 'express-rate-limit';
import type { Request } from 'express';
import { env } from '../config/env';

const base = {
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => env.isTest,
  message: { error: { code: 'RATE_LIMITED', message: 'Too many requests. Please wait a moment and try again.' } },
} as const;

const emailKey = (req: Request) => {
  const email = typeof req.body?.email === 'string' ? req.body.email.toLowerCase().slice(0, 254) : '';
  return `${req.ip}|${email}`;
};

export const createLinkLimiter = rateLimit({ ...base, windowMs: 60 * 60 * 1000, limit: 30 });
export const slugCheckLimiter = rateLimit({ ...base, windowMs: 60 * 1000, limit: 40 });
export const authLimiter = rateLimit({ ...base, windowMs: 15 * 60 * 1000, limit: 10, keyGenerator: emailKey });
export const authIpLimiter = rateLimit({ ...base, windowMs: 15 * 60 * 1000, limit: 60 });
export const sensitiveLimiter = rateLimit({ ...base, windowMs: 15 * 60 * 1000, limit: 10 });
export const redirectLimiter = rateLimit({ ...base, windowMs: 60 * 1000, limit: 300 });
export const reportLimiter = rateLimit({ ...base, windowMs: 60 * 60 * 1000, limit: 10 });
export const apiLimiter = rateLimit({ ...base, windowMs: 60 * 1000, limit: 240 });
