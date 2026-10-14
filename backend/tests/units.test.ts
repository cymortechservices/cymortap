import { describe, expect, it } from 'vitest';
import { normalizePhone } from '../src/utils/phone';
import { buildWhatsAppUrl, cleanMessage } from '../src/utils/whatsapp';
import { checkCustomSlug, generateSlug } from '../src/utils/slug';
import { parseUa } from '../src/utils/ua';
import { visitorHash } from '../src/utils/crypto';
import { escapeHtml, formatMessageHtml, handoffPage } from '../src/utils/html';
import { resolveRange } from '../src/services/analyticsService';

describe('phone normalisation', () => {
  it('normalises Kenyan national and international formats', () => {
    expect(normalizePhone('0712345678', 'KE')).toBe('254712345678');
    expect(normalizePhone('+254 712 345 678')).toBe('254712345678');
  });
  it('rejects invalid numbers', () => {
    expect(normalizePhone('123', 'KE')).toBeNull();
    expect(normalizePhone('abc', 'KE')).toBeNull();
    expect(normalizePhone('', 'KE')).toBeNull();
  });
});

describe('WhatsApp URL', () => {
  it('encodes emoji, newlines and reserved characters exactly once', () => {
    const msg = 'Hi 👋 R&D #1 100% ok?\nSecond line';
    const url = buildWhatsAppUrl('254712345678', msg);
    expect(url.startsWith('https://wa.me/254712345678?text=')).toBe(true);
    expect(decodeURIComponent(url.split('?text=')[1])).toBe(msg);
    expect(url).not.toContain('%25');
  });
  it('refuses a malformed stored phone', () => {
    expect(() => buildWhatsAppUrl('evil.com/x', 'hi')).toThrow();
  });
  it('cleans control characters and normalises line endings', () => {
    expect(cleanMessage('a\r\nb\u0000c ')).toBe('a\nbc');
  });
});

describe('slugs', () => {
  it('generates url-safe slugs', () => {
    const s = generateSlug();
    expect(s).toMatch(/^[a-z0-9]{8}$/);
  });
  it('accepts good custom slugs and lowercases them', () => {
    expect(checkCustomSlug('Airforce-Order')).toEqual({ ok: true, slug: 'airforce-order' });
  });
  it.each(['api', 'admin', 'my_slug', '-bad', 'bad-', 'a', '../etc', 'a%2Fb', 'my--slug', 'official-whatsapp', 'x'.repeat(41)])('rejects %s', (slug) => {
    expect(checkCustomSlug(slug).ok).toBe(false);
  });
});

describe('user agent parsing', () => {
  it('flags empty user agents and crawlers as bots', () => {
    expect(parseUa('').isBot).toBe(true);
    expect(parseUa('curl/8.4.0').isBot).toBe(true);
    expect(parseUa('Googlebot/2.1').isBot).toBe(true);
  });
  it('flags link previews', () => {
    const p = parseUa('WhatsApp/2.24.1 A');
    expect(p.isPreview).toBe(true);
    expect(p.isBot).toBe(true);
  });
  it('classifies real browsers', () => {
    expect(parseUa('Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/126.0 Mobile Safari/537.36').device).toBe('mobile');
    expect(parseUa('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0 Safari/537.36').device).toBe('desktop');
  });
});

describe('misc helpers', () => {
  it('visitor hash changes by day and never contains the IP', () => {
    const a = visitorHash('203.0.113.9', 'ua', new Date('2026-01-01T10:00:00Z'));
    const b = visitorHash('203.0.113.9', 'ua', new Date('2026-01-02T10:00:00Z'));
    expect(a).not.toBe(b);
    expect(a).not.toContain('203');
  });
  it('escapes html', () => {
    expect(escapeHtml('<script>"&\'')).toBe('&lt;script&gt;&quot;&amp;&#39;');
  });
  it('validates date ranges', () => {
    expect(() => resolveRange('2026-02-01', '2026-01-01')).toThrow();
    expect(() => resolveRange('2020-01-01', '2026-01-01')).toThrow();
    const r = resolveRange('2026-01-01', '2026-01-31');
    expect(r.from.toISOString()).toBe('2026-01-01T00:00:00.000Z');
  });
});


describe('preview page formatting', () => {
  it('renders WhatsApp formatting and escapes everything else', () => {
    const html = formatMessageHtml('*Bold* and _italic_ and ~gone~ and ```code``` <script>alert(1)</script>');
    expect(html).toContain('<strong>Bold</strong>');
    expect(html).toContain('<em>italic</em>');
    expect(html).toContain('<s>gone</s>');
    expect(html).toContain('<code>code</code>');
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });
  it('does not format stray markers', () => {
    const out = formatMessageHtml('2 * 3 = 6 and snake_case_name');
    expect(out).not.toContain('<strong>');
    expect(out).not.toContain('<em>');
  });
  it('builds a handoff page with the escaped title, the bubble and the button', () => {
    const page = handoffPage({ title: '<b>Shop</b>', message: 'Hello *you*', whatsappUrl: 'https://wa.me/254712345678?text=Hello', auto: true, reportUrl: 'http://x/report' });
    expect(page).toContain('&lt;b&gt;Shop&lt;/b&gt;');
    expect(page).toContain('class="bubble"');
    expect(page).toContain('http-equiv="refresh"');
    expect(page).toContain('Continue to WhatsApp');
  });
});
