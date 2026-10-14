import bcrypt from 'bcryptjs';
import { Types } from 'mongoose';
import { env } from '../config/env';
import { ClickEvent, Link, PasswordReset, Report, Session, User } from '../models';
import type { UserDocument } from '../models/User';
import { AppError, conflict, unauthorized } from '../utils/errors';
import { randomToken, sha256 } from '../utils/crypto';
import { logger } from '../utils/logger';
import { mailConfigured, sendMail } from './mailer';

const BCRYPT_COST = 12;
const DUMMY_HASH = bcrypt.hashSync('cymor-tap-dummy-password', BCRYPT_COST);

export const userDto = (u: UserDocument) => ({
  id: String(u._id),
  email: u.email,
  displayName: u.displayName,
  emailVerified: u.emailVerified,
  preferences: { defaultAnalyticsEnabled: u.preferences?.defaultAnalyticsEnabled ?? true },
  createdAt: u.createdAt,
});

export async function createSession(userId: Types.ObjectId, userAgent?: string) {
  const token = randomToken(32);
  const expiresAt = new Date(Date.now() + env.sessionTtlDays * 86_400_000);
  await Session.create({ user: userId, tokenHash: sha256(token), expiresAt, userAgent: userAgent?.slice(0, 200) });
  return { token, expiresAt };
}

export async function validateSession(token: string) {
  if (token.length < 20 || token.length > 200) return null;
  const session = await Session.findOne({ tokenHash: sha256(token), expiresAt: { $gt: new Date() } });
  if (!session) return null;
  const user = await User.findById(session.user);
  if (!user || user.status !== 'active') return null;
  return { user, sessionId: String(session._id) };
}

export async function destroySession(sessionId: string) {
  await Session.deleteOne({ _id: sessionId });
}

export async function register(input: { email: string; password: string; displayName: string }, userAgent?: string) {
  const existing = await User.exists({ email: input.email });
  if (existing) throw conflict('EMAIL_TAKEN', 'An account with this email already exists. Try signing in.');
  const passwordHash = await bcrypt.hash(input.password, BCRYPT_COST);
  let user: UserDocument;
  try {
    user = await User.create({ email: input.email, passwordHash, displayName: input.displayName });
  } catch (err) {
    if ((err as { code?: number }).code === 11000) throw conflict('EMAIL_TAKEN', 'An account with this email already exists. Try signing in.');
    throw err;
  }
  const session = await createSession(user._id, userAgent);
  return { user, session };
}

export async function login(input: { email: string; password: string }, userAgent?: string) {
  const user = await User.findOne({ email: input.email }).select('+passwordHash');
  // Always run one bcrypt comparison so response time does not reveal whether the email exists.
  const ok = await bcrypt.compare(input.password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !ok) throw new AppError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect.');
  if (user.status !== 'active') throw new AppError(403, 'ACCOUNT_SUSPENDED', 'This account is suspended. Contact support.');
  const session = await createSession(user._id, userAgent);
  return { user, session };
}

export async function requestPasswordReset(email: string) {
  const user = await User.findOne({ email, status: 'active' });
  if (!user) return;
  const token = randomToken(32);
  await PasswordReset.deleteMany({ user: user._id });
  await PasswordReset.create({ user: user._id, tokenHash: sha256(token), expiresAt: new Date(Date.now() + 60 * 60 * 1000) });
  const link = `${env.frontendUrl}/reset-password?token=${token}`;
  if (mailConfigured) {
    await sendMail(user.email, 'Reset your CYMOR TAP password', `Use this link within one hour to choose a new password:\n\n${link}\n\nIf you did not ask for this, you can ignore this email.`);
  } else if (!env.isProd) {
    // Development convenience only. Never logged in production.
    logger.warn('SMTP not configured; development reset link', { link });
  }
}

export async function resetPassword(token: string, password: string) {
  const reset = await PasswordReset.findOne({ tokenHash: sha256(token), usedAt: { $exists: false }, expiresAt: { $gt: new Date() } });
  if (!reset) throw new AppError(400, 'INVALID_RESET_TOKEN', 'This reset link is invalid or has expired. Request a new one.');
  const passwordHash = await bcrypt.hash(password, BCRYPT_COST);
  await User.updateOne({ _id: reset.user }, { passwordHash });
  reset.usedAt = new Date();
  await reset.save();
  await Session.deleteMany({ user: reset.user });
}

export async function verifyPassword(userId: Types.ObjectId, password: string) {
  const user = await User.findById(userId).select('+passwordHash');
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new AppError(403, 'WRONG_PASSWORD', 'That password is not correct.');
  }
}

export async function changePassword(user: UserDocument, sessionId: string, current: string, next: string) {
  await verifyPassword(user._id, current);
  const passwordHash = await bcrypt.hash(next, BCRYPT_COST);
  await User.updateOne({ _id: user._id }, { passwordHash });
  await Session.deleteMany({ user: user._id, _id: { $ne: sessionId } });
}

/**
 * Account deletion policy: the account, its sessions, its links, those links' click events
 * and reports about them are permanently deleted. Branded URLs stop working immediately.
 */
export async function deleteAccount(user: UserDocument, password: string) {
  await verifyPassword(user._id, password);
  const ids = (await Link.find({ owner: user._id }).select('_id')).map((l) => l._id);
  await ClickEvent.deleteMany({ link: { $in: ids } });
  await Report.deleteMany({ link: { $in: ids } });
  await Link.deleteMany({ owner: user._id });
  await Session.deleteMany({ user: user._id });
  await PasswordReset.deleteMany({ user: user._id });
  await User.deleteOne({ _id: user._id });
}

export function ensureUnauthorizedIfMissing<T>(v: T | null | undefined): T {
  if (!v) throw unauthorized();
  return v;
}
