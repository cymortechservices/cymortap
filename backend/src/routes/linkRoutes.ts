import { Router } from 'express';
import * as c from '../controllers/linkController';
import { optionalAuth } from '../middleware/auth';
import { createLinkLimiter, reportLimiter, slugCheckLimiter } from '../middleware/rateLimit';

export const linkRoutes = Router();
linkRoutes.post('/links', createLinkLimiter, optionalAuth, c.create);
linkRoutes.get('/links/:slug', c.publicMeta);
linkRoutes.post('/links/:slug/report', reportLimiter, c.report);
linkRoutes.get('/slugs/check', slugCheckLimiter, c.slugCheck);
