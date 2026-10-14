import type { Request } from 'express';
import { DEDUPE_WINDOW_MS } from '../config/constants';
import { ClickEvent } from '../models';
import type { LinkDocument } from '../models/Link';
import { visitorHash } from '../utils/crypto';
import { logger } from '../utils/logger';
import { parseUa } from '../utils/ua';

const clip = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, 100) : undefined);

function referrerHost(req: Request): string | undefined {
  const ref = req.get('referer');
  if (!ref) return undefined;
  try {
    return new URL(ref).hostname.slice(0, 100);
  } catch {
    return undefined;
  }
}

/**
 * Click-counting policy ("eligible clicks"):
 *  - Requests from bots and link-preview fetchers are stored but flagged isBot, never counted.
 *  - A repeat request from the same visitor hash on the same link within 30 seconds is
 *    stored but flagged isDuplicate, never counted.
 *  - Everything else is an eligible click. A click means a browser opened the link; it is
 *    not proof that a WhatsApp message was sent.
 */
export async function recordClick(link: LinkDocument, req: Request) {
  try {
    const uaString = req.get('user-agent');
    const ua = parseUa(uaString);
    const hash = visitorHash(req.ip, uaString);
    let isDuplicate = false;
    if (!ua.isBot) {
      const since = new Date(Date.now() - DEDUPE_WINDOW_MS);
      isDuplicate = Boolean(await ClickEvent.exists({ link: link._id, visitorHash: hash, isBot: false, isDuplicate: false, createdAt: { $gte: since } }));
    }
    await ClickEvent.create({
      link: link._id,
      device: ua.device,
      os: ua.os,
      browser: ua.browser,
      referrerHost: referrerHost(req),
      utmSource: clip(req.query.utm_source),
      utmMedium: clip(req.query.utm_medium),
      utmCampaign: clip(req.query.utm_campaign),
      visitorHash: hash,
      isBot: ua.isBot,
      isDuplicate,
    });
  } catch (err) {
    // Analytics must never block a redirect.
    logger.error('Failed to record click', { err: err instanceof Error ? err : String(err) });
  }
}
