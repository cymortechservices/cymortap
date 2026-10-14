# Deployment

Two independent deployments: **frontend on Vercel**, **backend on Render**, **database on MongoDB Atlas**. Nothing here has been performed for you; no domain, cluster or project exists until you create it.

## MongoDB Atlas
1. Create an Atlas account and a cluster (the free M0 tier is enough to start).
2. **Database Access → Add New Database User.** Use a generated password and the built-in role *readWrite* on the `cymor-tap` database only.
3. **Network Access.** Prefer an allow-list. Render publishes outbound IP ranges for your region (Dashboard → Service → Connect → Outbound). Add them. `0.0.0.0/0` works but is weaker; if you use it, rely on the strong user password and rotate it.
4. **Connect → Drivers** and copy the SRV string, e.g. `mongodb+srv://USER:PASSWORD@cluster0.xxxx.mongodb.net/cymor-tap?retryWrites=true&w=majority`. URL-encode special characters in the password.
5. Put it in `MONGODB_URI` on the backend. Never commit it.
6. Create indexes once: `cd backend && MONGODB_URI="..." npm run db:init`.
7. Verify: start the backend and open `/health`; it must return `"database":"connected"`.

## Backend on Render
Option A, Blueprint: push the repo, Render → New → Blueprint, pick the repo (it reads `render.yaml`).
Option B, manual: New → Web Service, root directory `backend`, runtime Node, build `npm install && npm run build`, start `npm start`, health check path `/health`.

Set environment variables:

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | Atlas string |
| `SESSION_SECRET` | 48+ random characters (Blueprint generates one) |
| `FRONTEND_URL` | your Vercel URL or custom domain, e.g. `https://app.example.com` |
| `ALLOWED_ORIGINS` | extra allowed origins, comma separated (e.g. preview URLs) |
| `SHORT_LINK_BASE_URL` | `https://tap.example.com` (or `https://<service>.onrender.com/r` before DNS is ready) |
| `COOKIE_SAMESITE` | `lax` (same registrable domain) or `none` |
| `COOKIE_DOMAIN` | `.example.com` when frontend and API are sibling subdomains |
| `SMTP_*`, `MAIL_FROM` | optional; without them password-reset emails are not sent and the UI says so |

CORS: the browser origin must be exactly in `FRONTEND_URL` ∪ `ALLOWED_ORIGINS`.

## Frontend on Vercel
1. Import the repo. **Root Directory: `frontend`**. Framework preset: Next.js (`vercel.json` pins install/build commands).
2. Environment variables: `NEXT_PUBLIC_API_BASE_URL` = backend URL (e.g. `https://api.example.com`), `NEXT_PUBLIC_SHORT_LINK_BASE_URL` = same value as the backend `SHORT_LINK_BASE_URL`.
3. Deploy, then put the final Vercel/custom URL into the backend `FRONTEND_URL` and redeploy the backend.
4. Only `NEXT_PUBLIC_*` values are exposed to browsers. Put no secrets in them.

## Custom domains and the short-link domain
Recommended layout (all under one registrable domain so cookies work first-party):

| Host | Points to | Purpose |
|---|---|---|
| `example.com` / `app.example.com` | Vercel | marketing site and dashboard |
| `api.example.com` | Render | JSON API |
| `tap.example.com` | Render (same service) | branded links `https://tap.example.com/<slug>` |

On Render add both `api.` and `tap.` as custom domains of the backend service and create the CNAME records it shows. Set `SHORT_LINK_BASE_URL=https://tap.example.com`, `COOKIE_DOMAIN=.example.com`, `COOKIE_SAMESITE=lax`.
If the short-link domain differs entirely from the marketing domain, nothing else changes: the redirect service only needs `SHORT_LINK_BASE_URL`.
Local testing needs no DNS: `SHORT_LINK_BASE_URL=http://localhost:4000`.

## After deploying: checklist
- `/health` returns ok.
- Create a guest link on the site; open the returned URL; confirm WhatsApp opens with the message.
- Register, create a link, open it in a private window, see the click in the dashboard.
- Disable the link; the URL now shows the "turned off" page.

## Troubleshooting
- **CORS errors**: origin mismatch (scheme, host, port, trailing slash).
- **Dashboard logs you out**: cookie blocked; see COOKIE_* above.
- **Backend crashes on boot**: the error names the missing variable.
- **Render cold starts**: free instances sleep; the first request can take ~30 s. A paid plan avoids this.
- **`npm ci` fails**: no lockfile committed. Use `npm install` as the install/build command, or run `npm install` locally and commit `package-lock.json` first.
- **Frontend on `*.vercel.app` and backend on `*.onrender.com`**: these are different sites, so set `COOKIE_SAMESITE=none` on the backend (cookies become `Secure` automatically). Safari and some privacy modes block such third-party cookies, so for real users put both on subdomains of one domain and use `lax`.
