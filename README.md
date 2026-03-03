# Salon Android

## Deployment options (Vercel + MongoDB Atlas)

### Option A: Single Vercel project (root config)

This repository now includes root [vercel.json](vercel.json) that builds:

- Backend function from `backend/api/index.ts`
- Frontend static app from `web/`

#### Vercel project settings

- Build Command: `npm run vercel-build` (or `npm run build`)
- Output Directory: `.`
- Install Command: `npm install`

#### Steps

1. Create one Vercel project from this repo with **Root Directory = `.`** (repo root).
1. Add these environment variables:

```bash
MONGODB_URI=mongodb+srv://<USER>:<PASSWORD>@<CLUSTER>/<DB_NAME>?retryWrites=true&w=majority
JWT_SECRET=<LONG_RANDOM_SECRET>
CLIENT_URL=https://<your-single-project-domain>
NODE_ENV=production
VITE_API_BASE_URL=/api
```

1. Deploy.

#### Verify

```bash
curl https://<your-single-project-domain>/api/health
curl https://<your-single-project-domain>/api/services
```

### Option B: Two Vercel projects (recommended for production)

Use two projects for better isolation and safer rollbacks:

- `salon-api` with Root Directory `backend`
- `salon-web` with Root Directory `web`

#### Backend (`backend/`)

```bash
MONGODB_URI=mongodb+srv://<USER>:<PASSWORD>@<CLUSTER>/<DB_NAME>?retryWrites=true&w=majority
JWT_SECRET=<LONG_RANDOM_SECRET>
CLIENT_URL=https://<your-frontend-domain>
NODE_ENV=production
```

#### Frontend (`web/`)

```bash
VITE_API_BASE_URL=https://<your-backend-domain>/api
```

#### Verify backend

```bash
curl https://<your-backend-domain>/api/health
curl https://<your-backend-domain>/api/services
```

## Comparison

- Single project: simpler setup, shared deploy/rollback for web + API.
- Two projects: better production safety, clearer blast radius, independent rollback.
