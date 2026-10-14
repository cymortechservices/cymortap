import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { type Request, type Response } from 'express';
import helmet from 'helmet';
import mongoose from 'mongoose';
import { env } from './config/env';
import { redirect } from './controllers/redirectController';
import { csrfGuard } from './middleware/csrf';
import { errorHandler, notFoundHandler } from './middleware/error';
import { apiLimiter, redirectLimiter } from './middleware/rateLimit';
import { requestLogger } from './middleware/requestLogger';
import { authRoutes } from './routes/authRoutes';
import { linkRoutes } from './routes/linkRoutes';
import { meRoutes } from './routes/meRoutes';
import { RESERVED_SLUGS } from './utils/slug';
import { AppError } from './utils/errors';

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', env.trustProxy);

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      // Redirect pages set their own strict CSP; the API only returns JSON.
      contentSecurityPolicy: { directives: { defaultSrc: ["'none'"], frameAncestors: ["'none'"] } },
    }),
  );
  app.use(requestLogger);

  // Render health check. 200 only when the database connection is up.
  app.get('/health', (_req: Request, res: Response) => {
    const dbUp = mongoose.connection.readyState === 1;
    res.status(dbUp ? 200 : 503).json({ status: dbUp ? 'ok' : 'degraded', database: dbUp ? 'connected' : 'disconnected', uptimeSeconds: Math.round(process.uptime()), time: new Date().toISOString() });
  });

  app.get('/robots.txt', (_req, res) => res.type('text/plain').send('User-agent: *\nDisallow: /\n'));

  // ---- JSON API ----
  const api = express.Router();
  api.use(
    cors({
      origin(origin, cb) {
        if (!origin || env.allowedOrigins.has(origin)) return cb(null, true);
        return cb(new AppError(403, 'CORS_ORIGIN', 'Origin not allowed.'));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'X-Requested-With'],
      maxAge: 600,
    }),
  );
  api.use(express.json({ limit: '20kb' }));
  api.use(cookieParser());
  api.use(apiLimiter);
  api.use(csrfGuard);
  api.use('/auth', authRoutes);
  api.use('/me', meRoutes);
  api.use('/', linkRoutes);
  api.use(notFoundHandler);
  api.use(errorHandler);
  app.use('/api/v1', api);

  // ---- Branded link resolution ----
  app.get('/r/:slug', redirectLimiter, redirect);
  app.get('/:slug', redirectLimiter, (req, res, next) => {
    const slug = String(req.params.slug).toLowerCase();
    if (RESERVED_SLUGS.has(slug)) return next();
    return redirect(req, res, next);
  });

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
