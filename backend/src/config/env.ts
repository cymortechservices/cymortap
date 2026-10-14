import { z } from 'zod';

const emptyToUndefined = (v: unknown) => (typeof v === 'string' && v.trim() === '' ? undefined : v);
const opt = <T extends z.ZodTypeAny>(s: T) => z.preprocess(emptyToUndefined, s.optional());

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  MONGODB_URI: opt(z.string()),
  FRONTEND_URL: z.preprocess(emptyToUndefined, z.string().url().default('http://localhost:3000')),
  SHORT_LINK_BASE_URL: z.preprocess(emptyToUndefined, z.string().url().default('http://localhost:4000')),
  ALLOWED_ORIGINS: opt(z.string()),
  SESSION_SECRET: opt(z.string()),
  COOKIE_DOMAIN: opt(z.string()),
  COOKIE_SAMESITE: z.preprocess(emptyToUndefined, z.enum(['lax', 'strict', 'none']).default('lax')),
  SESSION_TTL_DAYS: z.preprocess(emptyToUndefined, z.coerce.number().int().positive().default(14)),
  GUEST_LINK_TTL_DAYS: z.preprocess(emptyToUndefined, z.coerce.number().int().positive().default(90)),
  REPORT_AUTO_DISABLE_THRESHOLD: z.preprocess(emptyToUndefined, z.coerce.number().int().positive().default(5)),
  REDIRECT_MODE: z.preprocess(emptyToUndefined, z.enum(['http', 'page']).default('http')),
  TRUST_PROXY: z.preprocess(emptyToUndefined, z.coerce.number().int().min(0).default(1)),
  SMTP_HOST: opt(z.string()),
  SMTP_PORT: z.preprocess(emptyToUndefined, z.coerce.number().int().positive().default(587)),
  SMTP_USER: opt(z.string()),
  SMTP_PASS: opt(z.string()),
  MAIL_FROM: z.preprocess(emptyToUndefined, z.string().default('CYMOR TAP <no-reply@localhost>')),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  const issues = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
  throw new Error(`Invalid environment configuration: ${issues}`);
}
const raw = parsed.data;
const isProd = raw.NODE_ENV === 'production';

if (isProd) {
  if (!raw.MONGODB_URI) throw new Error('MONGODB_URI is required in production');
  if (!raw.SESSION_SECRET || raw.SESSION_SECRET.length < 32) {
    throw new Error('SESSION_SECRET must be set to at least 32 characters in production');
  }
}

const DEV_SECRET = 'dev-only-insecure-secret-do-not-use-in-production-0000';

const originOf = (url: string) => {
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
};

const origins = new Set<string>();
const fe = originOf(raw.FRONTEND_URL);
if (fe) origins.add(fe);
for (const o of (raw.ALLOWED_ORIGINS ?? '').split(',')) {
  const origin = originOf(o.trim());
  if (origin) origins.add(origin);
}

export const env = {
  nodeEnv: raw.NODE_ENV,
  isProd,
  isTest: raw.NODE_ENV === 'test',
  port: raw.PORT,
  mongodbUri: raw.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/cymor-tap',
  frontendUrl: raw.FRONTEND_URL.replace(/\/+$/, ''),
  shortLinkBaseUrl: raw.SHORT_LINK_BASE_URL.replace(/\/+$/, ''),
  allowedOrigins: origins,
  sessionSecret: raw.SESSION_SECRET ?? DEV_SECRET,
  cookieDomain: raw.COOKIE_DOMAIN,
  cookieSameSite: raw.COOKIE_SAMESITE,
  sessionTtlDays: raw.SESSION_TTL_DAYS,
  guestLinkTtlDays: raw.GUEST_LINK_TTL_DAYS,
  reportAutoDisableThreshold: raw.REPORT_AUTO_DISABLE_THRESHOLD,
  redirectMode: raw.REDIRECT_MODE,
  trustProxy: raw.TRUST_PROXY,
  smtp: {
    host: raw.SMTP_HOST,
    port: raw.SMTP_PORT,
    user: raw.SMTP_USER,
    pass: raw.SMTP_PASS,
    from: raw.MAIL_FROM,
    configured: Boolean(raw.SMTP_HOST),
  },
} as const;
