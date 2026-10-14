# Security and privacy notes

## Controls implemented
| Area | Control |
|---|---|
| Destinations | Built only from a validated E.164 number (`^\d{7,15}$`) and a message encoded once with `encodeURIComponent`. Creators cannot supply URLs, so there is no open redirect. Extra body fields are ignored. |
| Slugs | Allowlist `[a-z0-9-]`, 3–40 chars, no leading/trailing/double hyphen, reserved list (api, admin, whatsapp, cymor, …). Unique index in MongoDB; duplicate-key errors are handled; generated slugs use CSPRNG (31^8 space) with retries. Soft-deleted slugs stay reserved. |
| Passwords | bcrypt (cost 12), 10–128 characters, constant-time-ish login (dummy hash when the email is unknown). Hashes are `select:false` and never returned. |
| Sessions | Random 256-bit token in an HTTP-only cookie (`Secure` in production, configurable SameSite). Only a SHA-256 hash is stored, with a TTL index. Logout, password change/reset and account deletion revoke sessions. |
| CSRF | State-changing requests require `X-Requested-With: cymor-tap` (forces a CORS preflight that only allow-listed origins pass) and a matching `Origin` when present. |
| CORS | Exact-origin allowlist, credentials only for those origins. |
| Headers | Helmet defaults; API CSP `default-src 'none'`; redirect pages carry a strict CSP and `no-referrer`; frontend sets nosniff, frame deny, referrer and permissions policies. |
| Validation | Zod on every request body and query; 20 KB body limit. |
| Authorization | Every `/me/*` query filters by `owner = session user`; other users' ids return 404. Analytics aggregate only over the caller's link ids. |
| Rate limits | Link creation (30/h/IP), auth (10/15 min per IP+email, plus IP limiter), password reset and sensitive endpoints, reports, slug check, redirects, global API. |
| Errors | Central handler; no stack traces; unknown errors return a generic 500 and are logged. |
| Logging | JSON logs with key-based redaction; request logs contain method, path (no query), status, duration. |
| XSS | React escapes output; the preview page HTML-escapes everything before adding its own formatting tags. WhatsApp-style formatting on the frontend is rendered as elements, not HTML strings. |
| CSV | Cells that start with `= + - @` are neutralised. |
| Abuse | Report endpoint (one per reporter per link), auto-disable at `REPORT_AUTO_DISABLE_THRESHOLD` distinct reports, moderation lock owners cannot undo, CLI: `npm run abuse:list`, `abuse:disable -- <slug>`, `abuse:enable -- <slug>`. Terms forbid spam, scams, impersonation and bulk messaging; there is no sending functionality at all. |
| Secrets | Only via environment variables; production refuses to start without `MONGODB_URI` and a ≥32-char `SESSION_SECRET`. `.env*` is git-ignored. |

## Privacy by design
- Click events store: time, device/OS/browser category, referrer **hostname**, three UTM tags, bot/duplicate flags and a daily-rotating HMAC visitor code. **No IP address and no raw user agent are stored.**
- Guest links are not tracked (`analyticsEnabled=false`) because nobody could see the data.
- Retention: click events 400 days (TTL), guest links purged 30 days after expiry, sessions 14 days, reset tokens 1 hour. Account deletion hard-deletes the user, links, events and reports.
- IP addresses are processed transiently for rate limiting and for the visitor hash, never persisted.
- A click does not identify a person and does not prove a WhatsApp message was sent.

## Secret management
Generate `SESSION_SECRET` with `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`. Store secrets in Render/Vercel dashboards. Rotating `SESSION_SECRET` changes visitor hashes (harmless). Rotate the Atlas password if it is ever exposed.

## Scaling the analytics collection
Raw events grow with traffic. When volume rises: (1) add a daily aggregate collection written by a scheduled job and query it for ranges longer than 30 days, (2) lower `EVENT_RETENTION_DAYS`, (3) stop storing flagged bot events, (4) move old events to cold storage (Atlas Online Archive) before the TTL deletes them.

## Not covered (be aware)
No email verification, no 2FA, no admin UI, no automated malware/URL scanning of message text, and the reporter code for abuse reports is derived from IP+UA. Have a lawyer review the policies for your jurisdiction.
