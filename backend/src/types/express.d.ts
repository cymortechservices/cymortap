import type { UserDocument } from '../models/User';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auth?: { user: UserDocument; sessionId: string };
    }
  }
}
export {};
