# Deploy SafeDrive: Railway API + Netlify web app

This is the recommended production topology. Railway hosts the FastAPI service and a managed PostgreSQL database. Netlify hosts the Vite web application. Do not use the local Docker Compose credentials in either provider.

## 1. Put this project in a private GitHub repository

Do not commit `.env`, production secrets, database dumps, or telemetry exports. Connect both services to the same repository; each deploys from its own directory.

## 2. Create Railway services

1. Create a Railway project and add a PostgreSQL service.
2. Add a service from the GitHub repository. Set its **root directory** to `backend`; Railway will use `backend/Dockerfile` and `backend/railway.toml`.
3. Generate a public domain for the API service.
4. Set these API service variables:

| Variable | Value |
| --- | --- |
| `DATABASE_URL` | Reference the PostgreSQL service's `DATABASE_URL` |
| `JWT_SECRET` | A newly generated 32-byte-plus secret, stored only in Railway |
| `JWT_ISSUER` | `safedrive-api` |
| `REDIS_URL` | Add a managed Redis service before enabling background workers; omit for this initial API-only release |
| `CORS_ORIGINS` | The final Netlify site URL, for example `https://app.example.com` |

Railway provides the `PORT` variable. The API container honors it and exposes `/healthz` for the platform health check. Run the database migration from `backend/alembic/versions/0001_initial.sql` against the Railway database through an approved release job before the first production traffic.

## 3. Create the Netlify site

1. Import the same GitHub repository in Netlify.
2. Set base directory to the repository root, build command to `bun run build`, and publish directory to `dist` (also configured in `netlify.toml`).
3. Set the build environment variable `VITE_API_BASE_URL` to `https://YOUR-RAILWAY-API-DOMAIN/v1`.
4. Deploy. Add the produced Netlify domain to Railway's `CORS_ORIGINS`, then redeploy the API.

`VITE_API_BASE_URL` is deliberately public and baked into the browser build. Never put `JWT_SECRET`, database URLs, partner tokens, or private telemetry credentials in a `VITE_*` variable.

## 4. Production checks

Before directing users to the app, confirm `https://YOUR-RAILWAY-API-DOMAIN/healthz` returns `{"status":"ok"}`, create a test account, send one test trip, and validate that cross-origin requests are allowed only from the Netlify domain. Configure database backups, a custom domain, error monitoring, and secret rotation before handling real driver data.
