import mongoose from 'mongoose';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { Link } from '../src/models';
import { BOT_UA, CSRF, DESKTOP_UA, app, clearDb, registerAgent, startDb, stopDb, validLink } from './helpers';

beforeAll(startDb);
afterAll(stopDb);
beforeEach(clearDb);

const create = (body: Record<string, unknown>) => request(app).post('/api/v1/links').set(CSRF).send(body);

describe('link creation', () => {
  it('lets a guest create a link without an account, using the configured branded domain', async () => {
    const res = await create(validLink());
    expect(res.status).toBe(201);
    const { link, policy } = res.body.data;
    expect(link.shortUrl).toBe(`https://tap.test/${link.slug}`);
    expect(link.phone).toBe('254712345678');
    expect(link.ownerType).toBe('guest');
    expect(policy.guest).toBe(true);
    const days = (new Date(link.expiresAt).getTime() - Date.now()) / 86_400_000;
    expect(days).toBeGreaterThan(89);
    expect(days).toBeLessThanOrEqual(90);
    expect(await Link.countDocuments()).toBe(1);
  });

  it('rejects requests without the CSRF header', async () => {
    const res = await request(app).post('/api/v1/links').send(validLink());
    expect(res.status).toBe(403);
  });

  it('rejects invalid phone numbers, empty and oversized messages', async () => {
    expect((await create(validLink({ phone: '123' }))).status).toBe(400);
    expect((await create(validLink({ message: '   ' }))).status).toBe(400);
    const long = await create(validLink({ message: 'x'.repeat(1200) }));
    expect(long.status).toBe(400);
    expect(long.body.error.code).toBe('INVALID_MESSAGE');
  });

  it('handles custom slug collisions with 409 and rejects reserved names', async () => {
    expect((await create(validLink({ slug: 'my-shop' }))).status).toBe(201);
    const dup = await create(validLink({ slug: 'My-Shop' }));
    expect(dup.status).toBe(409);
    expect(dup.body.error.code).toBe('SLUG_TAKEN');
    expect((await create(validLink({ slug: 'admin' }))).status).toBe(400);
    expect((await create(validLink({ slug: '../etc' }))).status).toBe(400);
  });

  it('generates unique random slugs', async () => {
    const slugs = new Set<string>();
    for (let i = 0; i < 25; i += 1) slugs.add((await create(validLink())).body.data.link.slug);
    expect(slugs.size).toBe(25);
  });

  it('reports slug availability', async () => {
    await create(validLink({ slug: 'taken-one' }));
    expect((await request(app).get('/api/v1/slugs/check?slug=taken-one')).body.data.available).toBe(false);
    expect((await request(app).get('/api/v1/slugs/check?slug=free-one')).body.data.available).toBe(true);
  });

  it('creates account links with no expiry for signed-in users', async () => {
    const { agent } = await registerAgent();
    const res = await agent.post('/api/v1/links').set(CSRF).send(validLink());
    expect(res.status).toBe(201);
    expect(res.body.data.link.ownerType).toBe('user');
    expect(res.body.data.link.expiresAt).toBeNull();
  });
});

describe('redirects', () => {
  it('redirects to the correct wa.me destination with the encoded message', async () => {
    const message = 'Hello 👋 R&D #1\nSecond line';
    const { slug } = (await create(validLink({ message }))).body.data.link;
    const res = await request(app).get(`/${slug}`).set('User-Agent', DESKTOP_UA);
    expect(res.status).toBe(302);
    const loc = res.headers.location as string;
    expect(loc.startsWith('https://wa.me/254712345678?text=')).toBe(true);
    expect(decodeURIComponent(loc.split('?text=')[1])).toBe(message);
    const viaR = await request(app).get(`/r/${slug}`).set('User-Agent', DESKTOP_UA);
    expect(viaR.headers.location).toBe(loc);
  });

  it('serves a preview page instead of redirecting for ?preview=1 and link-preview bots', async () => {
    const { slug } = (await create(validLink())).body.data.link;
    const p = await request(app).get(`/r/${slug}?preview=1`).set('User-Agent', DESKTOP_UA);
    expect(p.status).toBe(200);
    expect(p.text).toContain('Continue to WhatsApp');
    const bot = await request(app).get(`/r/${slug}`).set('User-Agent', BOT_UA);
    expect(bot.status).toBe(200);
  });

  it('never redirects disabled, expired or deleted links', async () => {
    const { agent } = await registerAgent();
    const a = (await agent.post('/api/v1/links').set(CSRF).send(validLink())).body.data.link;
    expect((await agent.patch(`/api/v1/me/links/${a.id}/status`).set(CSRF).send({ status: 'disabled' })).status).toBe(200);
    const disabled = await request(app).get(`/${a.slug}`).set('User-Agent', DESKTOP_UA);
    expect(disabled.status).toBe(410);
    expect(disabled.headers.location).toBeUndefined();

    const g = (await create(validLink())).body.data.link;
    await Link.updateOne({ slug: g.slug }, { expiresAt: new Date(Date.now() - 1000) });
    const expired = await request(app).get(`/${g.slug}`).set('User-Agent', DESKTOP_UA);
    expect(expired.status).toBe(410);
    expect(expired.headers.location).toBeUndefined();

    const b = (await agent.post('/api/v1/links').set(CSRF).send(validLink())).body.data.link;
    expect((await agent.delete(`/api/v1/me/links/${b.id}`).set(CSRF)).status).toBe(200);
    const deleted = await request(app).get(`/${b.slug}`).set('User-Agent', DESKTOP_UA);
    expect(deleted.status).toBe(410);
    expect(deleted.headers.location).toBeUndefined();
  });

  it('returns 404 for unknown and malformed slugs', async () => {
    expect((await request(app).get('/nothere1').set('User-Agent', DESKTOP_UA)).status).toBe(404);
    expect((await request(app).get('/r/%2e%2e%2fetc').set('User-Agent', DESKTOP_UA)).status).toBe(404);
  });

  it('cannot be tricked into redirecting to an arbitrary destination', async () => {
    const res = await create({ ...validLink(), url: 'https://evil.example', destination: 'https://evil.example', phone: 'https://evil.example' });
    expect(res.status).toBe(400);
    const ok = await create({ ...validLink(), url: 'https://evil.example', destination: 'https://evil.example' });
    const redirect = await request(app).get(`/${ok.body.data.link.slug}`).set('User-Agent', DESKTOP_UA);
    expect((redirect.headers.location as string).startsWith('https://wa.me/')).toBe(true);
  });

  it('auto-disables a link after enough distinct reports', async () => {
    const { slug } = (await create(validLink())).body.data.link;
    await request(app).post(`/api/v1/links/${slug}/report`).set(CSRF).set('User-Agent', 'reporter-a').send({ reason: 'scam' });
    await request(app).post(`/api/v1/links/${slug}/report`).set(CSRF).set('User-Agent', 'reporter-b').send({ reason: 'spam' });
    const res = await request(app).get(`/${slug}`).set('User-Agent', DESKTOP_UA);
    expect(res.status).toBe(410);
  });
});

describe('health', () => {
  it('reports database state', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(mongoose.connection.readyState === 1 ? 200 : 503);
    expect(res.body.status).toBe('ok');
  });
});
