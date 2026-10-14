import { visitorHash } from '../utils/crypto';
import * as links from '../services/linkService';
import { asyncHandler } from '../utils/asyncHandler';
import { createLinkSchema, listQuery, reportSchema, slugCheckQuery, statusSchema, updateLinkSchema } from '../validation/schemas';

export const create = asyncHandler(async (req, res) => {
  const body = createLinkSchema.parse(req.body);
  const link = await links.createLink(body, req.auth?.user ?? null);
  res.status(201).json({
    data: {
      link: links.linkDto(link),
      policy: link.ownerType === 'guest' ? { guest: true, expiresAt: link.expiresAt, analytics: false, manageable: false } : { guest: false },
    },
  });
});

export const publicMeta = asyncHandler(async (req, res) => {
  res.json({ data: { link: await links.getPublicLink(String(req.params.slug)) } });
});

export const slugCheck = asyncHandler(async (req, res) => {
  const { slug } = slugCheckQuery.parse(req.query);
  res.json({ data: await links.slugAvailability(slug) });
});

export const report = asyncHandler(async (req, res) => {
  const body = reportSchema.parse(req.body);
  const reporter = visitorHash(req.ip, req.get('user-agent'));
  const result = await links.reportLink(String(req.params.slug), reporter, body);
  res.status(result.alreadyReported ? 200 : 201).json({ data: { ok: true, alreadyReported: result.alreadyReported } });
});

export const list = asyncHandler(async (req, res) => {
  res.json({ data: await links.listOwnedLinks(req.auth!.user._id, listQuery.parse(req.query)) });
});

export const get = asyncHandler(async (req, res) => {
  res.json({ data: { link: links.linkDto(await links.getOwnedLink(req.auth!.user._id, String(req.params.id))) } });
});

export const update = asyncHandler(async (req, res) => {
  const body = updateLinkSchema.parse(req.body);
  res.json({ data: { link: links.linkDto(await links.updateOwnedLink(req.auth!.user._id, String(req.params.id), body)) } });
});

export const setStatus = asyncHandler(async (req, res) => {
  const { status } = statusSchema.parse(req.body);
  res.json({ data: { link: links.linkDto(await links.setOwnedStatus(req.auth!.user._id, String(req.params.id), status)) } });
});

export const remove = asyncHandler(async (req, res) => {
  await links.deleteOwnedLink(req.auth!.user._id, String(req.params.id));
  res.json({ data: { ok: true } });
});
