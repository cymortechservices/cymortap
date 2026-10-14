import { Types, type FilterQuery, type PipelineStage } from 'mongoose';
import { ClickEvent, Link } from '../models';
import type { ILink } from '../models/Link';
import { badRequest } from '../utils/errors';

const ELIGIBLE = { isBot: false, isDuplicate: false } as const;
const MAX_RANGE_DAYS = 366;
const DAY = 86_400_000;

export interface DateRange {
  from: Date;
  to: Date;
}

/** Inclusive UTC day range. Default: the last 30 days including today. */
export function resolveRange(from?: string, to?: string, now = new Date()): DateRange {
  const end = to ? new Date(`${to}T23:59:59.999Z`) : new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));
  const start = from ? new Date(`${from}T00:00:00.000Z`) : new Date(end.getTime() - 29 * DAY - (DAY - 1));
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) throw badRequest('INVALID_RANGE', 'Dates must use YYYY-MM-DD.');
  if (start > end) throw badRequest('INVALID_RANGE', 'The start date must be before the end date.');
  if ((end.getTime() - start.getTime()) / DAY > MAX_RANGE_DAYS) throw badRequest('INVALID_RANGE', `Choose a range of at most ${MAX_RANGE_DAYS} days.`);
  return { from: start, to: end };
}

const dayKey = (d: Date) => d.toISOString().slice(0, 10);

function fillDays(range: DateRange, rows: { _id: string; clicks: number; visitors: number }[]) {
  const map = new Map(rows.map((r) => [r._id, r]));
  const out: { date: string; clicks: number; uniqueVisitors: number }[] = [];
  for (let t = Date.UTC(range.from.getUTCFullYear(), range.from.getUTCMonth(), range.from.getUTCDate()); t <= range.to.getTime(); t += DAY) {
    const key = dayKey(new Date(t));
    const r = map.get(key);
    out.push({ date: key, clicks: r?.clicks ?? 0, uniqueVisitors: r?.visitors ?? 0 });
  }
  return out;
}

async function ownedLinkIds(ownerId: Types.ObjectId, linkId?: string) {
  const filter: FilterQuery<ILink> = { owner: ownerId, status: { $ne: 'deleted' } };
  if (linkId) filter._id = new Types.ObjectId(linkId);
  return (await Link.find(filter).select('_id')).map((l) => l._id);
}

export async function overview(ownerId: Types.ObjectId, range: DateRange) {
  const [totalLinks, activeLinks, ids] = await Promise.all([
    Link.countDocuments({ owner: ownerId, status: { $ne: 'deleted' } }),
    Link.countDocuments({ owner: ownerId, status: 'active' }),
    ownedLinkIds(ownerId),
  ]);
  const match = { link: { $in: ids }, createdAt: { $gte: range.from, $lte: range.to }, ...ELIGIBLE };
  const [agg] = await ClickEvent.aggregate([
    { $match: match },
    {
      $facet: {
        total: [{ $count: 'n' }],
        visitors: [{ $group: { _id: '$visitorHash' } }, { $count: 'n' }],
        top: [{ $group: { _id: '$link', clicks: { $sum: 1 } } }, { $sort: { clicks: -1 } }, { $limit: 5 }],
      },
    },
  ]);
  const recentEvents = await ClickEvent.find(match).sort({ createdAt: -1 }).limit(10).lean();
  const linkIdsNeeded = [...new Set([...(agg?.top ?? []).map((t: { _id: Types.ObjectId }) => String(t._id)), ...recentEvents.map((e) => String(e.link))])];
  const links = await Link.find({ _id: { $in: linkIdsNeeded } }).select('slug title');
  const byId = new Map(links.map((l) => [String(l._id), l]));
  return {
    range: { from: dayKey(range.from), to: dayKey(range.to) },
    totals: {
      links: totalLinks,
      activeLinks,
      eligibleClicks: agg?.total?.[0]?.n ?? 0,
      estimatedUniqueVisitors: agg?.visitors?.[0]?.n ?? 0,
    },
    topLinks: (agg?.top ?? []).map((t: { _id: Types.ObjectId; clicks: number }) => ({
      id: String(t._id),
      slug: byId.get(String(t._id))?.slug ?? null,
      title: byId.get(String(t._id))?.title ?? null,
      clicks: t.clicks,
    })),
    recent: recentEvents.map((e) => ({
      at: e.createdAt,
      linkId: String(e.link),
      slug: byId.get(String(e.link))?.slug ?? null,
      device: e.device,
      referrer: e.referrerHost ?? 'direct',
    })),
  };
}

export async function timeline(ownerId: Types.ObjectId, range: DateRange, linkId?: string) {
  const ids = await ownedLinkIds(ownerId, linkId);
  const match = { link: { $in: ids }, createdAt: { $gte: range.from, $lte: range.to }, ...ELIGIBLE };
  const pipeline: PipelineStage[] = [
    { $match: match },
    {
      $facet: {
        daily: [
          { $group: { _id: { d: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'UTC' } }, v: '$visitorHash' }, clicks: { $sum: 1 } } },
          { $group: { _id: '$_id.d', clicks: { $sum: '$clicks' }, visitors: { $sum: 1 } } },
        ],
        devices: [{ $group: { _id: '$device', clicks: { $sum: 1 } } }, { $sort: { clicks: -1 } }],
        referrers: [{ $group: { _id: { $ifNull: ['$referrerHost', 'direct'] }, clicks: { $sum: 1 } } }, { $sort: { clicks: -1 } }, { $limit: 10 }],
        total: [{ $count: 'n' }],
        visitors: [{ $group: { _id: '$visitorHash' } }, { $count: 'n' }],
      },
    },
  ];
  const [agg] = await ClickEvent.aggregate(pipeline);
  return {
    range: { from: dayKey(range.from), to: dayKey(range.to) },
    totals: { eligibleClicks: agg?.total?.[0]?.n ?? 0, estimatedUniqueVisitors: agg?.visitors?.[0]?.n ?? 0 },
    days: fillDays(range, agg?.daily ?? []),
    devices: (agg?.devices ?? []).map((d: { _id: string; clicks: number }) => ({ device: d._id, clicks: d.clicks })),
    referrers: (agg?.referrers ?? []).map((r: { _id: string; clicks: number }) => ({ source: r._id, clicks: r.clicks })),
  };
}

const csvCell = (v: unknown) => {
  let s = v === undefined || v === null ? '' : String(v);
  // Neutralise spreadsheet formula injection.
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export async function exportCsv(ownerId: Types.ObjectId, range: DateRange, linkId?: string) {
  const ids = await ownedLinkIds(ownerId, linkId);
  const links = await Link.find({ _id: { $in: ids } }).select('slug');
  const slugs = new Map(links.map((l) => [String(l._id), l.slug]));
  const events = await ClickEvent.find({ link: { $in: ids }, createdAt: { $gte: range.from, $lte: range.to }, ...ELIGIBLE })
    .sort({ createdAt: 1 })
    .limit(50_000)
    .lean();
  const header = 'timestamp_utc,slug,device,os,browser,referrer,utm_source,utm_medium,utm_campaign';
  const rows = events.map((e) =>
    [e.createdAt.toISOString(), slugs.get(String(e.link)), e.device, e.os, e.browser, e.referrerHost ?? 'direct', e.utmSource, e.utmMedium, e.utmCampaign].map(csvCell).join(','),
  );
  return [header, ...rows].join('\n') + '\n';
}

