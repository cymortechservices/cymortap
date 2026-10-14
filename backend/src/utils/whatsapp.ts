/**
 * Builds the WhatsApp click-to-chat URL from validated data only.
 * Creators never supply a destination URL, which rules out open redirects.
 * The message is stored raw and encoded exactly once, here.
 */
export function buildWhatsAppUrl(phoneDigits: string, message: string): string {
  if (!/^\d{7,15}$/.test(phoneDigits)) throw new Error('Invalid stored phone number');
  const base = `https://wa.me/${phoneDigits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function cleanMessage(input: string): string {
  return input
    .replace(/\r\n?/g, '\n')
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/\n{4,}/g, '\n\n\n')
    .trim();
}
