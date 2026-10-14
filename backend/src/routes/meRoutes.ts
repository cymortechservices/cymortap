import { Router } from 'express';
import * as a from '../controllers/analyticsController';
import * as auth from '../controllers/authController';
import * as links from '../controllers/linkController';
import { requireAuth } from '../middleware/auth';
import { sensitiveLimiter } from '../middleware/rateLimit';

export const meRoutes = Router();
meRoutes.use(requireAuth);

meRoutes.get('/links', links.list);
meRoutes.get('/links/:id', links.get);
meRoutes.patch('/links/:id', links.update);
meRoutes.delete('/links/:id', links.remove);
meRoutes.patch('/links/:id/status', links.setStatus);

meRoutes.get('/analytics/overview', a.overview);
meRoutes.get('/analytics/timeline', a.timeline);
meRoutes.get('/analytics/export', a.exportCsv);
meRoutes.get('/analytics/links/:id', a.forLink);

meRoutes.patch('/profile', auth.updateProfile);
meRoutes.post('/change-password', sensitiveLimiter, auth.changePassword);
meRoutes.delete('/account', sensitiveLimiter, auth.deleteAccount);
