import { createHash, createHmac, randomBytes, randomInt } from 'crypto';
import { env } from '../config/env';

export const randomToken = (bytes = 32) => randomBytes(bytes).toString('base64url');
export const sha256 = (value: string) => createHash('sha256').update(value).digest('hex');

/**
 * Privacy-conscious visitor identifier. The raw IP address and user agent are never stored.
 * The hash is keyed with the server secret and a UTC day salt, so the same visitor
 * produces a different value each day and cannot be tracked across days.
 */
export function visitorHash(ip: string | undefined, userAgent: string | undefined, now = new Date()) {
  const day = now.toISOString().slice(0, 10);
  return createHmac('sha256', env.sessionSecret)
    .update(`${day}|${ip ?? ''}|${userAgent ?? ''}`)
    .digest('hex')
    .slice(0, 32);
}

export const randomFromAlphabet = (alphabet: string, length: number) => {
  let out = '';
  for (let i = 0; i < length; i += 1) out += alphabet[randomInt(alphabet.length)];
  return out;
};
