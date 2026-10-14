import type { NextFunction, Request, Response } from 'express';
import { logger } from '../utils/logger';

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = process.hrtime.bigint();
  res.on('finish', () => {
    const ms = Number(process.hrtime.bigint() - start) / 1e6;
    // Path only: query strings and bodies can contain messages or tokens.
    logger.info('request', { method: req.method, path: req.path, status: res.statusCode, ms: Math.round(ms) });
  });
  next();
}
