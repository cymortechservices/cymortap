import { Router } from 'express';
import * as c from '../controllers/authController';
import { optionalAuth, requireAuth } from '../middleware/auth';
import { authIpLimiter, authLimiter, sensitiveLimiter } from '../middleware/rateLimit';

export const authRoutes = Router();
authRoutes.post('/register', authIpLimiter, authLimiter, c.register);
authRoutes.post('/login', authIpLimiter, authLimiter, c.login);
authRoutes.post('/logout', optionalAuth, c.logout);
authRoutes.get('/me', requireAuth, c.me);
authRoutes.post('/forgot-password', sensitiveLimiter, c.forgotPassword);
authRoutes.post('/reset-password', sensitiveLimiter, c.resetPassword);
