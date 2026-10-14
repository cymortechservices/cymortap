import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { Link, Session, User } from '../src/models';
import { CSRF, app, clearDb, registerAgent, startDb, stopDb, validLink } from './helpers';

beforeAll(startDb);
afterAll(stopDb);
beforeEach(clearDb);

describe('authentication', () => {
  it('registers, sets an HTTP-only cookie and returns the user without secrets', async () => {
    const { res } = await registerAgent();
    expect(res.status).toBe(201);
    expect(res.body.data.user.email).toBe('amina@example.com');
    expect(JSON.stringify(res.body)).not.toMatch(/passwordHash|\$2[aby]\$/);
    const cookie = (res.headers['set-cookie'] as unknown as string[])[0];
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/SameSite=Lax/i);
  });

  it('stores only a bcrypt hash, never the password', async () => {
    await registerAgent();
    const user = await User.findOne({ email: 'amina@example.com' }).select('+passwordHash');
    expect(user!.passwordHash).not.toContain('correct-horse-battery');
    expect(user!.passwordHash.startsWith('$2')).toBe(true);
  });

  it('rejects duplicate emails and weak passwords', async () => {
    await registerAgent();
    const dup = await request(app).post('/api/v1/auth/register').set(CSRF).send({ email: 'amina@example.com', password: 'another-long-password', displayName: 'X' });
    expect(dup.status).toBe(409);
    const weak = await request(app).post('/api/v1/auth/register').set(CSRF).send({ email: 'b@example.com', password: 'short', displayName: 'B' });
    expect(weak.status).toBe(400);
  });

  it('logs in with correct credentials only', async () => {
    await registerAgent();
    const bad = await request(app).post('/api/v1/auth/login').set(CSRF).send({ email: 'amina@example.com', password: 'wrong-password-123' });
    expect(bad.status).toBe(401);
    const unknown = await request(app).post('/api/v1/auth/login').set(CSRF).send({ email: 'nobody@example.com', password: 'wrong-password-123' });
    expect(unknown.status).toBe(401);
    expect(unknown.body.error.message).toBe(bad.body.error.message);
    const ok = await request(app).post('/api/v1/auth/login').set(CSRF).send({ email: 'amina@example.com', password: 'correct-horse-battery' });
    expect(ok.status).toBe(200);
  });

  it('protects authenticated endpoints', async () => {
    for (const path of ['/api/v1/auth/me', '/api/v1/me/links', '/api/v1/me/analytics/overview', '/api/v1/me/analytics/export']) {
      expect((await request(app).get(path)).status).toBe(401);
    }
  });

  it('invalidates the session on logout', async () => {
    const { agent } = await registerAgent();
    expect((await agent.get('/api/v1/auth/me')).status).toBe(200);
    expect((await agent.post('/api/v1/auth/logout').set(CSRF)).status).toBe(200);
    expect(await Session.countDocuments()).toBe(0);
    expect((await agent.get('/api/v1/auth/me')).status).toBe(401);
  });

  it('rejects cross-origin state changes', async () => {
    const res = await request(app).post('/api/v1/auth/login').set(CSRF).set('Origin', 'https://evil.example').send({ email: 'a@b.co', password: 'x' });
    expect(res.status).toBe(403);
  });

  it('changes the password and requires the current one', async () => {
    const { agent } = await registerAgent();
    expect((await agent.post('/api/v1/me/change-password').set(CSRF).send({ currentPassword: 'nope-nope-nope', newPassword: 'brand-new-password' })).status).toBe(403);
    expect((await agent.post('/api/v1/me/change-password').set(CSRF).send({ currentPassword: 'correct-horse-battery', newPassword: 'brand-new-password' })).status).toBe(200);
    expect((await request(app).post('/api/v1/auth/login').set(CSRF).send({ email: 'amina@example.com', password: 'brand-new-password' })).status).toBe(200);
  });

  it('is honest about password reset email when SMTP is not configured', async () => {
    await registerAgent();
    const res = await request(app).post('/api/v1/auth/forgot-password').set(CSRF).send({ email: 'amina@example.com' });
    expect(res.status).toBe(200);
    expect(res.body.data.emailDelivery).toBe('unavailable');
    expect(res.body.data.message).toMatch(/not configured/i);
    const unknown = await request(app).post('/api/v1/auth/forgot-password').set(CSRF).send({ email: 'ghost@example.com' });
    expect(unknown.body.data).toEqual(res.body.data);
  });

  it('rejects invalid reset tokens', async () => {
    const res = await request(app).post('/api/v1/auth/reset-password').set(CSRF).send({ token: 'x'.repeat(40), password: 'a-new-long-password' });
    expect(res.status).toBe(400);
  });

  it('deletes the account together with its links', async () => {
    const { agent } = await registerAgent();
    await agent.post('/api/v1/links').set(CSRF).send(validLink());
    expect((await agent.delete('/api/v1/me/account').set(CSRF).send({ password: 'correct-horse-battery' })).status).toBe(200);
    expect(await Link.countDocuments()).toBe(0);
    expect(await User.countDocuments()).toBe(0);
  });
});

describe('ownership', () => {
  it('prevents users from reading or changing each other’s links', async () => {
    const a = await registerAgent('a@example.com');
    const b = await registerAgent('b@example.com');
    const link = (await a.agent.post('/api/v1/links').set(CSRF).send(validLink())).body.data.link;

    expect((await b.agent.get(`/api/v1/me/links/${link.id}`)).status).toBe(404);
    expect((await b.agent.patch(`/api/v1/me/links/${link.id}`).set(CSRF).send({ message: 'hijack' })).status).toBe(404);
    expect((await b.agent.patch(`/api/v1/me/links/${link.id}/status`).set(CSRF).send({ status: 'disabled' })).status).toBe(404);
    expect((await b.agent.delete(`/api/v1/me/links/${link.id}`).set(CSRF)).status).toBe(404);
    expect((await b.agent.get(`/api/v1/me/analytics/links/${link.id}`)).status).toBe(404);
    expect((await b.agent.get('/api/v1/me/links')).body.data.total).toBe(0);
    expect((await a.agent.get(`/api/v1/me/links/${link.id}`)).status).toBe(200);
  });

  it('lets an owner edit, search, filter and paginate', async () => {
    const { agent } = await registerAgent();
    const first = (await agent.post('/api/v1/links').set(CSRF).send(validLink({ title: 'Shoes', slug: 'shoes-shop' }))).body.data.link;
    await agent.post('/api/v1/links').set(CSRF).send(validLink({ title: 'Tutoring', message: 'Maths help please' }));
    const edit = await agent.patch(`/api/v1/me/links/${first.id}`).set(CSRF).send({ message: 'New message', phone: '+254722000111' });
    expect(edit.status).toBe(200);
    expect(edit.body.data.link.slug).toBe('shoes-shop');
    expect(edit.body.data.link.phone).toBe('254722000111');
    expect((await agent.get('/api/v1/me/links?search=tutoring')).body.data.total).toBe(1);
    expect((await agent.get('/api/v1/me/links?limit=1&page=2')).body.data.items).toHaveLength(1);
    await agent.patch(`/api/v1/me/links/${first.id}/status`).set(CSRF).send({ status: 'disabled' });
    expect((await agent.get('/api/v1/me/links?status=disabled')).body.data.total).toBe(1);
  });
});
