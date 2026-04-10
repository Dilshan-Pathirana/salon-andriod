# Firebase Hosting + Cloud Run Migration (Parallel with VM)

This guide moves traffic to Firebase Hosting (frontend) and Cloud Run (backend), while your current VM deployment can continue running until cutover is complete.

## 0. Preconditions

Install tools:

```bash
npm install -g firebase-tools
```

Ensure these are available:
- Node.js 20+
- Docker
- gcloud CLI
- Firebase CLI

Authenticate and set project:

```bash
firebase login
gcloud auth login
gcloud config set project ruwan-salon
```

## 1. Backend (Cloud Run)

Backend is already Cloud Run compatible in this repo:
- Uses `process.env.PORT` via `env.port`
- Dockerfile exposes `8080`
- Start command runs migrations then starts API

Enable required APIs:

```bash
gcloud services enable run.googleapis.com cloudbuild.googleapis.com
```

Build and deploy backend from `backend/`:

```bash
cd backend
gcloud run deploy backend-service \
  --source . \
  --region asia-south1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production \
  --set-env-vars CORS_ORIGIN=https://ruwan-salon.web.app,https://ruwan-salon.firebaseapp.com \
  --set-env-vars CLIENT_URL=https://ruwan-salon.web.app
```

Set secrets/config values (example):

```bash
gcloud run services update backend-service \
  --region asia-south1 \
  --set-env-vars DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DB?schema=public,JWT_ACCESS_SECRET=replace_me,JWT_REFRESH_SECRET=replace_me,ADMIN_PHONE=0753198248,ADMIN_PASSWORD=12345678,ADMIN_FIRST_NAME=Ruwan,ADMIN_LAST_NAME=Chandana
```

Performance settings:

```bash
gcloud run services update backend-service \
  --region asia-south1 \
  --min-instances=0 \
  --max-instances=3 \
  --memory=512Mi \
  --cpu=1
```

Test backend:

```bash
curl https://backend-service-<hash>-as.a.run.app/api/health
curl https://backend-service-<hash>-as.a.run.app/api/test
```

## 2. Frontend (Firebase Hosting)

Frontend production API base should be same-origin `/api` for rewrite mode.

Build frontend:

```bash
cd web
npm install
npm run build
```

Deploy hosting from repo root:

```bash
cd ..
firebase deploy --only hosting
```

## 3. Rewrite Routing

Configured in `firebase.json`:
- `/api/**` -> Cloud Run service `backend-service` in `asia-south1`
- All other paths -> `index.html` (SPA fallback)

## 4. Cutover Strategy (No Downtime)

1. Keep VM live as current production.
2. Deploy Cloud Run + Firebase Hosting and verify all critical user flows.
3. Share and test `https://ruwan-salon.web.app`.
4. Switch user-facing DNS/entrypoint when satisfied.
5. Keep VM as rollback target for 24-48 hours.

## 5. Notes for This Repo

- Backend currently uses PostgreSQL via Prisma, not MongoDB.
- If you keep PostgreSQL, provide a Cloud-accessible managed PostgreSQL URL in `DATABASE_URL`.
- If migrating to MongoDB later, backend data layer must be rewritten (Prisma schema/models and repository logic).
