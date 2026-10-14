import { env } from '../config/env';
import { recordClick } from '../services/clickService';
import { resolveSlug } from '../services/linkService';
import { asyncHandler } from '../utils/asyncHandler';
import { handoffPage, statePage } from '../utils/html';
import { parseUa } from '../utils/ua';
import { buildWhatsAppUrl } from '../utils/whatsapp';

const PAGE_CSP = "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'";

function sendHtml(res: import('express').Response, status: number, html: string) {
  res.status(status).set({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'Content-Security-Policy': PAGE_CSP, 'Referrer-Policy': 'no-referrer' }).send(html);
}

/**
 * Resolves a branded link and sends the visitor to WhatsApp.
 * The destination is always rebuilt from the stored, validated phone and message.
 */
export const redirect = asyncHandler(async (req, res) => {
  const slug = String(req.params.slug);
  const { state, link } = await resolveSlug(slug);
  if (state !== 'ok' || !link) {
    return sendHtml(res, state === 'notfound' ? 404 : 410, statePage(state === 'ok' ? 'notfound' : state, env.frontendUrl));
  }
  const whatsappUrl = buildWhatsAppUrl(link.phone, link.message);
  const reportUrl = `${env.frontendUrl}/report?slug=${encodeURIComponent(link.slug)}`;
  const ua = parseUa(req.get('user-agent'));
  const previewRequested = req.query.preview === '1';

  // Link-preview fetchers and explicit previews get a page and are never counted or redirected.
  if (previewRequested || ua.isPreview) {
    if (!previewRequested && link.analyticsEnabled) await recordClick(link, req);
    return sendHtml(res, 200, handoffPage({ title: link.title ?? '', message: link.message, whatsappUrl, auto: false, reportUrl }));
  }

  if (link.analyticsEnabled) await recordClick(link, req);

  if (env.redirectMode === 'page') {
    return sendHtml(res, 200, handoffPage({ title: link.title ?? '', message: link.message, whatsappUrl, auto: true, reportUrl }));
  }
  res.set('Cache-Control', 'no-store, max-age=0');
  res.redirect(302, whatsappUrl);
});
