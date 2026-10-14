import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { ClickEvent } from '../src/models';
import { BOT_UA, CSRF, DESKTOP_UA, MOBILE_UA, app, clearDb, registerAgent, startDb, stopDb, validLink } from './helpers';

beforeAll(startDb);
afterAll(stopDb);
beforeEach(clearDb);

async function setup() {
  const { agent } = await registerAgent();
  const link = (await agent.post('/api/v1/links').set(CSRF).send(validLink({ slug: 'promo-link' }))).body.data.link;
  return { agent, link };
}

const click = (slug: string, ua: string, ip: string, query = '', referer?: string) => {
  const r = request(app).get(`/${slug}${query}`).set('User-Agent', ua).set('X-Forwarded-For', ip);
  return referer ? r.set('Referer', referer) : r;
};

describe('click analytics', () => {
  it('records eligible clicks and shows them in the dashboard from persisted events', async () => {
    const { agent, link } = await setup();
    await click(link.slug, DESKTOP_UA, '203.0.113.1', '?utm_source=instagram&utm_campaign=launch', 'https://l.instagram.com/x');
    await click(link.slug, MOBILE_UA, '203.0.113.2');
    expect(await ClickEvent.countDocuments()).toBe(2);

    const ov = (await agent.get('/api/v1/me/analytics/overview')).body.data;
    expect(ov.totals.eligibleClicks).toBe(2);
    expect(ov.totals.estimatedUniqueVisitors).toBe(2);
    expect(ov.totals.links).toBe(1);
    expect(ov.topLinks[0].slug).toBe('promo-link');
    expect(ov.recent).toHaveLength(2);

    const tl = (await agent.get('/api/v1/me/analytics/timeline')).body.data;
    expect(tl.days).toHaveLength(30);
    expect(tl.days.reduce((n: number, d: { clicks: number }) => n + d.clicks, 0)).toBe(2);
    expect(tl.devices.map((d: { device: string }) => d.device).sort()).toEqual(['desktop', 'mobile']);
    expect(tl.referrers.some((r: { source: string }) => r.source === 'l.instagram.com')).toBe(true);
  });

  it('does not count bots, link previews or rapid duplicates', async () => {
    const { agent, link } = await setup();
    await click(link.slug, BOT_UA, '203.0.113.3');
    await click(link.slug, 'curl/8.4.0', '203.0.113.4');
    await click(link.slug, DESKTOP_UA, '203.0.113.5');
    await click(link.slug, DESKTOP_UA, '203.0.113.5'); // duplicate within 30 seconds
    expect(await ClickEvent.countDocuments()).toBe(4); // stored for transparency
    const ov = (await agent.get('/api/v1/me/analytics/overview')).body.data;
    expect(ov.totals.eligibleClicks).toBe(1);
  });

  it('does not record ?preview=1 visits', async () => {
    const { link } = await setup();
    await click(link.slug, DESKTOP_UA, '203.0.113.6', '?preview=1');
    expect(await ClickEvent.countDocuments()).toBe(0);
  });

  it('applies date filters', async () => {
    const { agent, link } = await setup();
    await click(link.slug, DESKTOP_UA, '203.0.113.7');
    await ClickEvent.updateOne({}, { createdAt: new Date('2026-01-15T12:00:00Z') });
    const inRange = (await agent.get('/api/v1/me/analytics/overview?from=2026-01-01&to=2026-01-31')).body.data;
    expect(inRange.totals.eligibleClicks).toBe(1);
    const outRange = (await agent.get('/api/v1/me/analytics/overview?from=2026-02-01&to=2026-02-28')).body.data;
    expect(outRange.totals.eligibleClicks).toBe(0);
    expect((await agent.get('/api/v1/me/analytics/overview?from=bad')).status).toBe(400);
  });

  it('exports CSV without visitor identifiers', async () => {
    const { agent, link } = await setup();
    await click(link.slug, DESKTOP_UA, '203.0.113.8', '?utm_source=news');
    const res = await agent.get('/api/v1/me/analytics/export');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/csv/);
    expect(res.text.split('\n')[0]).toBe('timestamp_utc,slug,device,os,browser,referrer,utm_source,utm_medium,utm_campaign');
    expect(res.text).toContain('promo-link');
    expect(res.text).toContain('news');
    const event = await ClickEvent.findOne().lean();
    expect(res.text).not.toContain(event!.visitorHash);
  });

  it('keeps per-link analytics private to the owner', async () => {
    const { link } = await setup();
    const other = await registerAgent('other@example.com');
    expect((await other.agent.get(`/api/v1/me/analytics/links/${link.id}`)).status).toBe(404);
    expect((await request(app).get(`/api/v1/me/analytics/links/${link.id}`)).status).toBe(401);
    const empty = (await other.agent.get('/api/v1/me/analytics/overview')).body.data;
    expect(empty.totals.eligibleClicks).toBe(0);
  });
});
