import { describe, expect, it } from 'vitest';
import { linkFormSchema, registerSchema } from '@/lib/schemas';
import { validatePhone } from '@/lib/phone';

const base = { country: 'KE', phone: '0712345678', message: 'Hello' };

describe('linkFormSchema', () => {
  it('accepts a valid form', () => expect(linkFormSchema.safeParse(base).success).toBe(true));
  it('requires a message and keeps it under the limit', () => {
    expect(linkFormSchema.safeParse({ ...base, message: '   ' }).success).toBe(false);
    expect(linkFormSchema.safeParse({ ...base, message: 'x'.repeat(1001) }).success).toBe(false);
  });
  it('validates custom slugs', () => {
    expect(linkFormSchema.safeParse({ ...base, slug: 'my-shop' }).success).toBe(true);
    expect(linkFormSchema.safeParse({ ...base, slug: 'bad slug!' }).success).toBe(false);
    expect(linkFormSchema.safeParse({ ...base, slug: 'a--b' }).success).toBe(false);
  });
});

describe('registerSchema', () => {
  it('requires a 10 character password', () => {
    expect(registerSchema.safeParse({ displayName: 'A', email: 'a@b.co', password: 'short' }).success).toBe(false);
    expect(registerSchema.safeParse({ displayName: 'A', email: 'a@b.co', password: 'long-enough-password' }).success).toBe(true);
  });
});

describe('validatePhone', () => {
  it('normalises Kenyan numbers', () => {
    expect(validatePhone('0712345678', 'KE')).toMatchObject({ valid: true, e164Digits: '254712345678' });
    expect(validatePhone('12', 'KE').valid).toBe(false);
  });
});
