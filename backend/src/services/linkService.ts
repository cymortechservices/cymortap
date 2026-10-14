import { Types, type FilterQuery } from 'mongoose';
import { env } from '../config/env';
import { Link, Report } from '../models';
import type { ILink, LinkDocument } from '../models/Link';
import type { UserDocument } from '../models/User';
import { AppError, badRequest, conflict, notFound } from '../utils/errors';
import { maskPhone, normalizePhone } from '../utils/phone';
import { checkCustomSlug, generateSlug } from '../utils/slug';
import { buildWhatsAppUrl, cleanMessage } from '../utils/whatsapp';
import type { CreateLinkInput, UpdateLinkInput } from '../validation/schemas';

export const shortUrlFor = (slug: string) => `${env.shortLinkBaseUrl}/${slug}`;

export function linkDto(l: LinkDocument) {
  return {
    id: String(l._id),
    slug: l.slug,
    shortUrl: shortUrlFor(l.slug),
    whatsappUrl: buildWhatsAppUrl(l.phone, l.message),
    phone: l.phone,
    message: l.message,
    title: l.title ?? null,
    description: l.description ?? null,
    theme: l.theme,
    ownerType: l.ownerType,
    status: effectiveStatus(l),
    disabledReason: l.disabledReason ?? null,
    expiresAt: l.expiresAt ?? null,
    analyticsEnabled: l.analyticsEnabled,
    createdAt: l.createdAt,
    updatedAt: l.updatedAt,
  };
}

export type EffectiveStatus = 'active' | 'disabled' | 'deleted' | 'expired';
export function effectiveStatus(l: Pick<ILink, 'status' | 'expiresAt'>): EffectiveStatus {
  if (l.status === 'deleted') return 'deleted';
  if (l.expiresAt && l.expiresAt.getTime() <= Date.now()) return 'expired';
  return l.status;
}

export function publicLinkDto(l: LinkDocument) {
  return {
    slug: l.slug,
    shortUrl: shortUrlFor(l.slug),
    title: l.title ?? null,
    description: l.description ?? null,
    theme: l.theme,
    maskedPhone: maskPhone(l.phone),
  };
}

function phoneOrThrow(phone: string, country?: string) {
  const normalized = normalizePhone(phone, country);
  if (!normalized) {
    throw badRequest('INVALID_PHONE', 'That phone number is not valid for the selected country.', { phone: 'Enter a valid phone number for the selected country.' });
  }
  return normalized;
}

function messageOrThrow(raw: string) {
  const message = cleanMessage(raw);
  if (!message) throw badRequest('INVALID_MESSAGE', 'Write a message to pre-fill.', { message: 'Write a message to pre-fill.' });
  if (message.length > 1000) {
    throw badRequest('INVALID_MESSAGE', 'Keep the message under 1000 characters.', { message: 'Keep the message under 1000 characters.' });
  }
  return message;
}

const isDuplicateKey = (err: unknown) => (err as { code?: number }).code === 11000;

export async function createLink(input: CreateLinkInput, owner?: UserDocument | null) {
  const phone = phoneOrThrow(input.phone, input.country);
  const message = messageOrThrow(input.message);
  const expiresAt = owner ? null : new Date(Date.now() + env.guestLinkTtlDays * 86_400_000);
  const base = {
    phone,
    message,
    title: input.title,
    description: input.description,
    theme: input.theme ?? 'midnight',
    ownerType: owner ? ('user' as const) : ('guest' as const),
    owner: owner?._id,
    expiresAt,
    analyticsEnabled: owner ? (input.analyticsEnabled ?? owner.preferences?.defaultAnalyticsEnabled ?? true) : false,
  };

  if (input.slug) {
    const check = checkCustomSlug(input.slug);
    if (!check.ok) throw badRequest(check.code, check.message, { slug: check.message });
    try {
      return await Link.create({ ...base, slug: check.slug });
    } catch (err) {
      if (isDuplicateKey(err)) throw new AppError(409, 'SLUG_TAKEN', 'That name is already taken. Try another one.', { slug: 'That name is already taken.' });
      throw err;
    }
  }

  for (let attempt = 0; attempt < 6; attempt += 1) {
    try {
      return await Link.create({ ...base, slug: generateSlug() });
    } catch (err) {
      if (!isDuplicateKey(err)) throw err;
    }
  }
  throw new AppError(503, 'SLUG_GENERATION_FAILED', 'Could not generate a unique link. Please try again.');
}

export async function slugAvailability(slugInput: string) {
  const check = checkCustomSlug(slugInput);
  if (!check.ok) return { available: false, reason: check.code, message: check.message };
  const exists = await Link.exists({ slug: check.slug });
  return exists ? { available: false, reason: 'SLUG_TAKEN', message: 'That name is already taken.' } : { available: true, slug: check.slug };
}

export type ResolveState = 'ok' | 'notfound' | 'disabled' | 'expired' | 'gone';

export async function resolveSlug(slug: string): Promise<{ state: ResolveState; link?: LinkDocument }> {
  if (!/^[a-zA-Z0-9-]{3,40}$/.test(slug)) return { state: 'notfound' };
  const link = await Link.findOne({ slug: slug.toLowerCase() });
  if (!link) return { state: 'notfound' };
  const status = effectiveStatus(link);
  if (status === 'deleted') return { state: 'gone' };
  if (status === 'expired') return { state: 'expired' };
  if (status === 'disabled') return { state: 'disabled' };
  return { state: 'ok', link };
}

export async function getPublicLink(slug: string) {
  const { state, link } = await resolveSlug(slug);
  if (state !== 'ok' || !link) throw notFound('This link is not available.');
  return publicLinkDto(link);
}

// ---- Owner operations (always scoped by owner) ----

export async function listOwnedLinks(ownerId: Types.ObjectId, q: { search?: string; status: 'active' | 'disabled' | 'all'; sort: 'newest' | 'oldest' | 'title'; page: number; limit: number }) {
  const filter: FilterQuery<ILink> = { owner: ownerId, status: { $ne: 'deleted' } };
  if (q.status !== 'all') filter.status = q.status;
  if (q.search) {
    const rx = new RegExp(q.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ slug: rx }, { title: rx }, { message: rx }];
  }
  const sort: Record<string, 1 | -1> = q.sort === 'oldest' ? { createdAt: 1 } : q.sort === 'title' ? { title: 1, createdAt: -1 } : { createdAt: -1 };
  const [items, total] = await Promise.all([
    Link.find(filter).sort(sort).skip((q.page - 1) * q.limit).limit(q.limit),
    Link.countDocuments(filter),
  ]);
  return { items: items.map(linkDto), page: q.page, limit: q.limit, total, pages: Math.max(1, Math.ceil(total / q.limit)) };
}

export async function getOwnedLink(ownerId: Types.ObjectId, id: string) {
  if (!Types.ObjectId.isValid(id)) throw notFound('Link not found.');
  const link = await Link.findOne({ _id: id, owner: ownerId, status: { $ne: 'deleted' } });
  if (!link) throw notFound('Link not found.');
  return link;
}

export async function updateOwnedLink(ownerId: Types.ObjectId, id: string, input: UpdateLinkInput) {
  const link = await getOwnedLink(ownerId, id);
  if (input.phone !== undefined) link.phone = phoneOrThrow(input.phone, input.country);
  else if (input.country !== undefined) throw badRequest('INVALID_PHONE', 'Enter the phone number again when changing the country.', { phone: 'Enter the phone number again.' });
  if (input.message !== undefined) link.message = messageOrThrow(input.message);
  if (input.title !== undefined) link.title = input.title || undefined;
  if (input.description !== undefined) link.description = input.description || undefined;
  if (input.theme !== undefined) link.theme = input.theme;
  if (input.analyticsEnabled !== undefined) link.analyticsEnabled = input.analyticsEnabled;
  await link.save();
  return link;
}

export async function setOwnedStatus(ownerId: Types.ObjectId, id: string, status: 'active' | 'disabled') {
  const link = await getOwnedLink(ownerId, id);
  if (status === 'active' && link.status === 'disabled' && link.disabledReason === 'moderation') {
    throw conflict('LINK_LOCKED', 'This link was disabled after a report and cannot be re-enabled. Contact support.');
  }
  link.status = status;
  link.disabledReason = status === 'disabled' ? 'owner' : undefined;
  await link.save();
  return link;
}

/** Soft delete: the slug stays reserved so a deleted URL can never be re-used to impersonate it. */
export async function deleteOwnedLink(ownerId: Types.ObjectId, id: string) {
  const link = await getOwnedLink(ownerId, id);
  link.status = 'deleted';
  link.deletedAt = new Date();
  await link.save();
}

export async function reportLink(slug: string, reporterHash: string, input: { reason: 'spam' | 'scam' | 'impersonation' | 'harassment' | 'other'; details?: string }) {
  const link = await Link.findOne({ slug: slug.toLowerCase(), status: { $ne: 'deleted' } });
  if (!link) throw notFound('Link not found.');
  try {
    await Report.create({ link: link._id, reporterHash, reason: input.reason, details: input.details });
  } catch (err) {
    if (isDuplicateKey(err)) return { alreadyReported: true };
    throw err;
  }
  const count = await Report.countDocuments({ link: link._id });
  link.reportCount = count;
  if (count >= env.reportAutoDisableThreshold && link.status === 'active') {
    link.status = 'disabled';
    link.disabledReason = 'moderation';
  }
  await link.save();
  return { alreadyReported: false };
}
