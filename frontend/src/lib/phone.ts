import { getCountries, getCountryCallingCode, parsePhoneNumberFromString, type CountryCode } from 'libphonenumber-js';

export interface CountryOption {
  code: CountryCode;
  name: string;
  dial: string;
  flag: string;
}

const flag = (code: string) => code.replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));

let cache: CountryOption[] | null = null;

export function countryOptions(): CountryOption[] {
  if (cache) return cache;
  const names = typeof Intl !== 'undefined' && 'DisplayNames' in Intl ? new Intl.DisplayNames(['en'], { type: 'region' }) : null;
  const list: CountryOption[] = getCountries()
    .map((code) => ({ code, name: names?.of(code) ?? code, dial: getCountryCallingCode(code), flag: flag(code) }))
    .sort((a, b) => a.name.localeCompare(b.name));
  cache = list;
  return list;
}

export function validatePhone(raw: string, country: string): { valid: boolean; e164Digits?: string; international?: string } {
  const parsed = parsePhoneNumberFromString(raw.trim(), country as CountryCode);
  if (!parsed || !parsed.isValid()) return { valid: false };
  return { valid: true, e164Digits: parsed.number.replace(/^\+/, ''), international: parsed.formatInternational() };
}
