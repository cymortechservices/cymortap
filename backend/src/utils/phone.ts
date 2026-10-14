import { parsePhoneNumberFromString, type CountryCode } from 'libphonenumber-js';

/**
 * Returns the E.164 number without the leading plus sign (the format wa.me expects),
 * or null when the number is not a valid phone number. A valid number is not
 * guaranteed to be registered on WhatsApp.
 */
export function normalizePhone(raw: string, country?: string): string | null {
  if (!raw || raw.length > 40) return null;
  const parsed = parsePhoneNumberFromString(raw.trim(), (country?.toUpperCase() as CountryCode | undefined) || undefined);
  if (!parsed || !parsed.isValid()) return null;
  return parsed.number.replace(/^\+/, '');
}

export const maskPhone = (digits: string) => `+${digits.slice(0, 3)}${'•'.repeat(Math.max(0, digits.length - 6))}${digits.slice(-3)}`;
