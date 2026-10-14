# Changelog

## 1.0.1 – build fixes after the first Render deploy
- Backend `tsconfig`: `module`/`moduleResolution` set to `nodenext` (works on old and new TypeScript); removed `noImplicitReturns`.
- `config/db.ts`: static import instead of dynamic `import()` (not allowed under `nodenext`); test helper updated.
- Build-time packages (`typescript`, `@types/*`) moved to `dependencies` so `npm install` works even when `NODE_ENV=production`.
- `bcryptjs` imported by name; analytics filter typed as `FilterQuery`; removed unused helpers and a stray re-export.
- Frontend: `qrcode` imported by name, API client headers simplified, `FormEvent` imported explicitly, `vercel.json` no longer forces `npm ci`, lint no longer blocks `next build`.
- `render.yaml` and docs use `npm install` until lockfiles are committed.
