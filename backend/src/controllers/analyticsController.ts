import * as analytics from '../services/analyticsService';
import { getOwnedLink, linkDto } from '../services/linkService';
import { asyncHandler } from '../utils/asyncHandler';
import { rangeQuery } from '../validation/schemas';

export const overview = asyncHandler(async (req, res) => {
  const q = rangeQuery.parse(req.query);
  res.json({ data: await analytics.overview(req.auth!.user._id, analytics.resolveRange(q.from, q.to)) });
});

export const timeline = asyncHandler(async (req, res) => {
  const q = rangeQuery.parse(req.query);
  res.json({ data: await analytics.timeline(req.auth!.user._id, analytics.resolveRange(q.from, q.to), q.linkId) });
});

export const forLink = asyncHandler(async (req, res) => {
  const q = rangeQuery.parse(req.query);
  const link = await getOwnedLink(req.auth!.user._id, String(req.params.id));
  const data = await analytics.timeline(req.auth!.user._id, analytics.resolveRange(q.from, q.to), String(link._id));
  res.json({ data: { link: linkDto(link), ...data } });
});

export const exportCsv = asyncHandler(async (req, res) => {
  const q = rangeQuery.parse(req.query);
  const csv = await analytics.exportCsv(req.auth!.user._id, analytics.resolveRange(q.from, q.to), q.linkId);
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="cymor-tap-clicks.csv"');
  res.setHeader('Cache-Control', 'no-store');
  res.send(csv);
});
