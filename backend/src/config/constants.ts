export const MAX_MESSAGE_LENGTH = 1000;
export const MAX_TITLE_LENGTH = 80;
export const MAX_DESCRIPTION_LENGTH = 200;
export const SLUG_MIN = 3;
export const SLUG_MAX = 40;
/** Clicks from the same visitor on the same link inside this window count once. */
export const DEDUPE_WINDOW_MS = 30_000;
/** Click events are deleted automatically after this many days (TTL index). */
export const EVENT_RETENTION_DAYS = 400;
/** Guest links are purged from the database this many days after expiry. */
export const EXPIRED_LINK_PURGE_DAYS = 30;
export const LINK_THEMES = ['midnight', 'cyan', 'violet', 'sunset', 'forest'] as const;
export const SESSION_COOKIE = 'cymor_sid';
export const CSRF_HEADER_VALUE = 'cymor-tap';
