import type { CookieOptions, Request, Response } from 'express';
import { SESSION_COOKIE } from '../config/constants';
import { env } from '../config/env';
import * as auth from '../services/authService';
import { mailConfigured } from '../services/mailer';
import { asyncHandler } from '../utils/asyncHandler';
import {
  changePasswordSchema, deleteAccountSchema, forgotSchema, loginSchema, profileSchema, registerSchema, resetSchema,
} from '../validation/schemas';

const cookieOptions = (expires?: Date): CookieOptions => ({
  httpOnly: true,
  secure: env.isProd || env.cookieSameSite === 'none',
  sameSite: env.cookieSameSite,
  domain: env.cookieDomain,
  path: '/',
  ...(expires ? { expires } : {}),
});

const setSession = (res: Response, s: { token: string; expiresAt: Date }) => res.cookie(SESSION_COOKIE, s.token, cookieOptions(s.expiresAt));
const clearSession = (res: Response) => res.clearCookie(SESSION_COOKIE, cookieOptions());

export const register = asyncHandler(async (req: Request, res: Response) => {
  const body = registerSchema.parse(req.body);
  const { user, session } = await auth.register(body, req.get('user-agent'));
  setSession(res, session);
  res.status(201).json({ data: { user: auth.userDto(user) } });
});

export const login = asyncHandler(async (req, res) => {
  const body = loginSchema.parse(req.body);
  const { user, session } = await auth.login(body, req.get('user-agent'));
  setSession(res, session);
  res.json({ data: { user: auth.userDto(user) } });
});

export const logout = asyncHandler(async (req, res) => {
  if (req.auth) await auth.destroySession(req.auth.sessionId);
  clearSession(res);
  res.json({ data: { ok: true } });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ data: { user: auth.userDto(req.auth!.user), emailDeliveryAvailable: mailConfigured } });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = forgotSchema.parse(req.body);
  await auth.requestPasswordReset(email);
  // Same response whether or not the account exists. emailDelivery tells the truth about the server, not the account.
  res.json({
    data: {
      emailDelivery: mailConfigured ? 'enabled' : 'unavailable',
      message: mailConfigured
        ? 'If an account exists for that email, a reset link is on its way.'
        : 'Password reset email is not configured on this server, so no email was sent. Contact the site administrator.',
    },
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = resetSchema.parse(req.body);
  await auth.resetPassword(token, password);
  res.json({ data: { ok: true } });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const body = profileSchema.parse(req.body);
  const user = req.auth!.user;
  if (body.displayName !== undefined) user.displayName = body.displayName;
  if (body.preferences?.defaultAnalyticsEnabled !== undefined) user.preferences.defaultAnalyticsEnabled = body.preferences.defaultAnalyticsEnabled;
  await user.save();
  res.json({ data: { user: auth.userDto(user) } });
});

export const changePassword = asyncHandler(async (req, res) => {
  const body = changePasswordSchema.parse(req.body);
  await auth.changePassword(req.auth!.user, req.auth!.sessionId, body.currentPassword, body.newPassword);
  res.json({ data: { ok: true } });
});

export const deleteAccount = asyncHandler(async (req, res) => {
  const body = deleteAccountSchema.parse(req.body);
  await auth.deleteAccount(req.auth!.user, body.password);
  clearSession(res);
  res.json({ data: { ok: true } });
});

