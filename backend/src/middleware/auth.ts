import type { NextFunction, Request, Response } from 'express';
import { SESSION_COOKIE } from '../config/constants';
import { validateSession } from '../services/authService';
import { unauthorized } from '../utils/errors';

async function load(req: Request) {
  const token = req.cookies?.[SESSION_COOKIE] as string | undefined;
  if (!token) return;
  const result = await validateSession(token);
  if (result) req.auth = result;
}

export async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    await load(req);
    next();
  } catch (err) {
    next(err);
  }
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    await load(req);
    if (!req.auth) throw unauthorized();
    next();
  } catch (err) {
    next(err);
  }
}
