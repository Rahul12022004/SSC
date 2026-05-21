# SSC Pathnirman — Backend

Express + TypeScript + MongoDB API.

## Local development

```bash
cp .env.example .env
# fill in .env values
npm install
npm run dev
```

## Build & start

```bash
npm run build   # tsc → dist/
npm run start   # node dist/index.js
```

## Deploy to Railway

1. Push this directory to a new GitHub repo.
2. Create a new Railway project → "Deploy from GitHub repo".
3. Set these environment variables in Railway dashboard:

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` |
| `MONGO_URI` | your Atlas connection string |
| `JWT_SECRET` | 32+ char random string |
| `JWT_EXPIRES_IN` | `7d` |
| `SESSION_SECRET` | 16+ char random string |
| `CLIENT_URL` | `https://your-app.vercel.app` |
| `CLOUDINARY_CLOUD_NAME` | (optional) |
| `CLOUDINARY_API_KEY` | (optional) |
| `CLOUDINARY_API_SECRET` | (optional) |
| `RESEND_API_KEY` | (optional) |
| `RESEND_FROM` | (optional) |
| `BLOB_READ_WRITE_TOKEN` | (optional) |
| `RECAPTCHA_SECRET_KEY` | (optional) |

Railway auto-detects `railway.toml`:
- Build: `npm run build`
- Start: `node dist/index.js`
- Health check: `/health`

## Deploy to Render

1. Push this directory to a new GitHub repo.
2. Render → New → Web Service → connect repo.
3. Runtime: **Node**
4. Build command: `npm install && npm run build`
5. Start command: `npm run start`
6. Add the same environment variables as above.
