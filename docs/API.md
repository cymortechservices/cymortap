# CYMOR TAP API (v1)

Base URL: `<backend>/api/v1`. JSON in, JSON out.

* Success: `{ "data": ... }`
* Error: `{ "error": { "code": "STRING", "message": "Human text", "fields": { "phone": "..." } } }`
* **Every non-GET request must send `X-Requested-With: cymor-tap`** (CSRF guard) and, if the browser sends `Origin`, it must be in the allowlist.
* Session: HTTP-only cookie `cymor_sid`. Browser clients send `credentials: 'include'`.

## Public
| Method | Path | Notes |
|---|---|---|
| POST | `/links` | Create a link. Signed-in: saved to account, no expiry. Guest: expires in `GUEST_LINK_TTL_DAYS`, `analyticsEnabled=false`. Body: `{ country?, phone, message, title?, description?, slug?, theme?, analyticsEnabled? }`. Returns `201 { link, policy }`. |
| GET | `/links/:slug` | Safe metadata: slug, shortUrl, title, description, theme, masked phone. 404 if not active. |
| POST | `/links/:slug/report` | `{ reason: spam\|scam\|impersonation\|harassment\|other, details? }`. One report per reporter per link; auto-disables at threshold. |
| GET | `/slugs/check?slug=` | `{ available, reason?, message? }`. Advisory only; uniqueness is enforced by the database. |

Error codes on create: `INVALID_PHONE`, `INVALID_MESSAGE`, `SLUG_TAKEN` (409), `SLUG_LENGTH`, `SLUG_CHARS`, `SLUG_RESERVED`, `VALIDATION_ERROR`, `RATE_LIMITED`.

## Auth
| Method | Path | Notes |
|---|---|---|
| POST | `/auth/register` | `{ email, password (10–128), displayName }` → 201, sets cookie. 409 `EMAIL_TAKEN`. |
| POST | `/auth/login` | `{ email, password }`. 401 `INVALID_CREDENTIALS` (same text for unknown email). |
| POST | `/auth/logout` | Deletes the server-side session. |
| GET | `/auth/me` | `{ user, emailDeliveryAvailable }`. |
| POST | `/auth/forgot-password` | `{ email }`. Same response for any email. `emailDelivery` is `enabled` or `unavailable` and the message says honestly whether email can be sent. |
| POST | `/auth/reset-password` | `{ token, password }`. Token valid 1 hour, single use; all sessions revoked. |

## Account (auth required)
| Method | Path | Notes |
|---|---|---|
| GET | `/me/links?search&status=all\|active\|disabled&sort=newest\|oldest\|title&page&limit` | Paginated: `{ items, page, limit, total, pages }`. |
| GET | `/me/links/:id` | 404 for links the user does not own. |
| PATCH | `/me/links/:id` | `{ country?, phone?, message?, title?, description?, theme?, analyticsEnabled? }`. Slug never changes. |
| PATCH | `/me/links/:id/status` | `{ status: active\|disabled }`. 409 `LINK_LOCKED` if disabled by moderation. |
| DELETE | `/me/links/:id` | Soft delete; slug stays reserved. |
| GET | `/me/analytics/overview?from&to` | Totals, top links, recent activity. Dates `YYYY-MM-DD` (UTC), max 366 days. Default last 30 days. |
| GET | `/me/analytics/timeline?from&to&linkId?` | Daily series (zero-filled), devices, referrers, totals. |
| GET | `/me/analytics/links/:id?from&to` | Same as timeline for one owned link, plus the link. |
| GET | `/me/analytics/export?from&to&linkId?` | CSV (`text/csv`), eligible clicks only, no visitor identifiers, max 50,000 rows. |
| PATCH | `/me/profile` | `{ displayName?, preferences?: { defaultAnalyticsEnabled? } }`. |
| POST | `/me/change-password` | `{ currentPassword, newPassword }`; other sessions revoked. |
| DELETE | `/me/account` | `{ password }`. Deletes user, sessions, links, click events, reports. |

## Branded link resolution (not under /api)
| Path | Behaviour |
|---|---|
| `GET /:slug` and `GET /r/:slug` | Active: records click (if enabled and not a preview), `302` to `https://wa.me/<digits>?text=<encoded>` (or HTML hand-off page when `REDIRECT_MODE=page`). Unknown: `404` HTML. Disabled / expired / deleted: `410` HTML. |
| `?preview=1` | Shows the destination page without redirecting or counting. |
| `?utm_source`, `?utm_medium`, `?utm_campaign` | Stored on the click event (max 100 chars). |

Link-preview crawlers (WhatsApp, Facebook, Slack, Telegram, …) receive the preview page, never a redirect, and are not counted.

## Health
`GET /health` → `200 {"status":"ok","database":"connected","uptimeSeconds":N,"time":"..."}`; `503` with `"status":"degraded"` when MongoDB is not connected. Used as the Render health check.

## Click-counting policy
Every request to an analytics-enabled link stores an event. Events flagged `isBot` (bots, crawlers, link previews, empty user agent) or `isDuplicate` (same visitor code on the same link within 30 s) are **never** counted. Dashboard "eligible clicks" = events where both flags are false. "Estimated unique visitors" = distinct daily visitor codes in the range; the code rotates daily, so returning visitors on other days count again.
