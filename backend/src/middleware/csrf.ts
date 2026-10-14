import type { NextFunction, Request, Response } from 'express';
import { CSRF_HEADER_VALUE } from '../config/constants';
import { env } from '../config/env';
import { AppError } from '../utils/errors';

const SAFE = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * CSRF defence for cookie sessions:
 *  1. State-changing requests must carry a custom header. Browsers only allow that on
 *     cross-origin requests after a CORS preflight, which our allowlist rejects for foreign sites.
 *  2. When the browser sends an Origin header it must be on the allowlist.
 */
export function csrfGuard(req: Request, _res: Response, next: NextFunction) {
  if (SAFE.has(req.method)) return next();
  const origin = req.get('origin');
  if (origin && !env.allowedOrigins.has(origin)) {
    return next(new AppError(403, 'CSRF_ORIGIN', 'Request origin is not allowed.'));
  }
  if (req.get('x-requested-with') !== CSRF_HEADER_VALUE) {
    return next(new AppError(403, 'CSRF_HEADER', 'Missing required request header.'));
  }
  next();
}
