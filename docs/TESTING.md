# Testing

## Status
The tests were written together with the code but **have not been executed** in the environment that generated this archive (no network, so no dependencies). Run them yourself and fix what they reveal.

## Backend (`backend/`)
```bash
npm install
npm run typecheck
npm run lint
npm test            # Vitest + Supertest + mongodb-memory-server
```
The first run downloads a MongoDB binary (needs internet, ~100 MB). Behind a proxy set `MONGOMS_DOWNLOAD_MIRROR` or point tests at a real Mongo by editing `tests/helpers.ts`.

| File | Covers |
|---|---|
| `tests/units.test.ts` | phone normalisation, wa.me encoding (emoji, `&`, `#`, newlines, no double encoding), slug rules, user-agent/bot detection, visitor hash, HTML escaping and WhatsApp-style formatting, date-range validation |
| `tests/links.test.ts` | guest creation, branded domain, 90-day expiry, CSRF header, invalid phone/message, slug collisions and reserved names, 25 unique random slugs, availability, account links, correct redirect target and encoded message, preview page, disabled/expired/deleted/unknown, injection attempts, report auto-disable, health |
| `tests/auth.test.ts` | register/login/logout, cookie flags, bcrypt hash, duplicate email, weak password, protected endpoints, session invalidation, cross-origin rejection, password change, truthful reset response without SMTP, invalid reset token, account deletion, ownership isolation, edit/search/filter/paginate |
| `tests/analytics.test.ts` | clicks recorded and shown from persisted events, bots/previews/duplicates excluded, `?preview=1` not recorded, date filters, CSV export content and privacy, per-link analytics access control |

## Frontend (`frontend/`)
```bash
npm install
npm run typecheck
npm run lint
npm test            # Vitest + Testing Library
npm run build       # production build
```
`tests/LinkForm.test.tsx` checks validation errors, that the success state shows the URL returned by the (mocked) API, and the formatting toolbar. `tests/waFormat.test.tsx` and `tests/schemas.test.ts` cover the formatter, schemas and phone validation.

## End-to-end (Playwright)
```bash
# terminal 1
cd backend && npm run dev   # needs a reachable MongoDB
# terminal 2
cd frontend && npm run dev
# terminal 3
cd frontend && npx playwright install chromium && npm run e2e
```
`e2e/smoke.spec.ts` runs at a 360 px mobile viewport and desktop: homepage renders, form validation, creating a real link through the API, redirect returns `302` to the right wa.me URL, no horizontal overflow, dashboard redirects when signed out.

## Manual checks still recommended
Widths 360/390/768/1024/1440 px; real phone with WhatsApp installed; QR scan; copy/share on iOS Safari and Android Chrome; keyboard-only navigation and screen reader pass; reduced-motion setting.

## What cannot be tested automatically
Whether a number is registered on WhatsApp, whether anyone presses send, SMTP delivery without credentials, and DNS/custom-domain behaviour.
