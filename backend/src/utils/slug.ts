import { SLUG_MAX, SLUG_MIN } from '../config/constants';
import { randomFromAlphabet } from './crypto';

// No look-alike characters (0/o, 1/l/i) so generated slugs are easy to read aloud.
const ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789';
export const GENERATED_SLUG_LENGTH = 8;

export const SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])$/;

export const RESERVED_SLUGS = new Set([
  'api', 'r', 'health', 'healthz', 'status', 'admin', 'administrator', 'root', 'system', 'support', 'help',
  'login', 'logout', 'signin', 'signup', 'register', 'dashboard', 'account', 'settings', 'auth', 'oauth',
  'static', 'assets', 'public', 'robots', 'sitemap', 'favicon', 'well-known', 'privacy', 'terms', 'contact',
  'faq', 'pricing', 'about', 'blog', 'docs', 'billing', 'security', 'abuse', 'report', 'verify', 'official',
  'cymor', 'cymortap', 'cymor-tap', 'tap', 'whatsapp', 'wa', 'meta', 'facebook', 'instagram', 'www', 'mail',
  'null', 'undefined', 'new', 'edit', 'delete', 'create', 'links', 'link', 'analytics', 'preview',
]);

export function generateSlug(): string {
  return randomFromAlphabet(ALPHABET, GENERATED_SLUG_LENGTH);
}

export type SlugCheck = { ok: true; slug: string } | { ok: false; code: string; message: string };

export function checkCustomSlug(input: string): SlugCheck {
  const slug = input.trim().toLowerCase();
  if (slug.length < SLUG_MIN || slug.length > SLUG_MAX) {
    return { ok: false, code: 'SLUG_LENGTH', message: `Use ${SLUG_MIN}–${SLUG_MAX} characters.` };
  }
  if (!SLUG_PATTERN.test(slug)) {
    return { ok: false, code: 'SLUG_CHARS', message: 'Use only letters, numbers and hyphens, and do not start or end with a hyphen.' };
  }
  if (slug.includes('--')) {
    return { ok: false, code: 'SLUG_CHARS', message: 'Do not use two hyphens in a row.' };
  }
  if (RESERVED_SLUGS.has(slug) || slug.includes('whatsapp') || slug.includes('cymortap') || /^(wa|api|admin)-/.test(slug)) {
    return { ok: false, code: 'SLUG_RESERVED', message: 'That name is reserved. Try another one.' };
  }
  return { ok: true, slug };
}
