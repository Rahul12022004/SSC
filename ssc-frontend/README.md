# SSC Pathnirman — Frontend

Vite + React + TypeScript SPA.

## Local development

```bash
cp .env.example .env
# set VITE_API_URL=http://localhost:5000/api  (or use proxy — vite.config.ts already proxies /api)
npm install
npm run dev
```

## Build

```bash
npm run build   # outputs to dist/
npm run preview # preview the production build locally
```

## Deploy to Vercel

### Option A — Vercel CLI
```bash
npm i -g vercel
vercel
```

### Option B — GitHub import
1. Push this directory to a new GitHub repo.
2. Go to vercel.com → New Project → import the repo.
3. Framework: **Vite** (Vercel auto-detects it).
4. Set environment variables:

| Variable | Value |
|---|---|
| `VITE_API_URL` | `https://your-backend.up.railway.app/api` |
| `VITE_RECAPTCHA_SITE_KEY` | your reCAPTCHA v2 site key (optional) |

5. Deploy.

The `vercel.json` included in this project configures all routes to serve `index.html`
so client-side routing (React Router) works correctly.

### Build settings (Vercel auto-detects, but for reference)
| Setting | Value |
|---|---|
| Build command | `npm run build` |
| Output directory | `dist` |
| Install command | `npm install` |
