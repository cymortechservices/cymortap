export const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000').replace(/\/+$/, '');
export const SHORT_LINK_BASE = (process.env.NEXT_PUBLIC_SHORT_LINK_BASE_URL ?? 'http://localhost:4000').replace(/\/+$/, '');
export const GUEST_TTL_DAYS = 90;
export const MAX_MESSAGE_LENGTH = 1000;
