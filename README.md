<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# SafeDrive / Kinetic

Production-oriented road-safety platform foundation. The original visual prototype remains in `src/`; the FastAPI API supplies authenticated trip ingestion, idempotent telemetry, server-side scoring, crash candidates, and an immutable reward ledger.

## Run locally

1. Copy `.env.example` to `.env` and set a development JWT secret.
2. Run `docker compose up --build`.
3. Open the web app and create an account using the built-in sign-in screen.

The web app is at `http://localhost:3000`; API docs are at `http://localhost:8000/docs`. Run `backend/alembic/versions/0001_initial.sql` through an approved migration pipeline for production rather than relying on development schema creation.

See [the production plan](docs/PRODUCTION_PLAN.md) for privacy, self-learning safeguards, event flow, deployment, and launch gates.

For hosted deployment, use [the Railway + Netlify guide](docs/DEPLOY_RAILWAY_NETLIFY.md).
