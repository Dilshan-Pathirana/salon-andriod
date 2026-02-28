# Deployment Guide — Hair Salon Appointment & Live Queue Management System

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Local Development](#local-development)
3. [Railway Deployment](#railway-deployment)
4. [Mobile App Build](#mobile-app-build)
5. [Environment Variables](#environment-variables)
6. [Database Migrations](#database-migrations)

---

## Prerequisites

- Node.js >= 18
- npm >= 9
- Docker & Docker Compose (optional, for local PostgreSQL)
- Expo CLI: `npm install -g expo-cli`
- Railway CLI (optional): `npm install -g @railway/cli`

---

## Local Development

### 1. Start PostgreSQL

**Option A: Docker Compose**
```bash
cd backend
docker-compose up -d postgres
```

**Option B: Existing PostgreSQL**
Ensure you have a running PostgreSQL instance and note the connection URL.

### 2. Backend Setup

```bash
cd backend
npm install

# Copy environment file
cp .env.example .env
# Edit .env with your DATABASE_URL and secrets

# Run database migrations
npx prisma migrate dev --name init

# Seed the database
npx prisma db seed

# Start development server
npm run dev
```

The backend runs on `http://localhost:3000` by default.

**Seeded credentials:**
- Admin: `0712345678` / `admin12345`
- Client: `0771234567` / `client12345`

### 3. Mobile Setup

```bash
cd mobile
npm install

# Start Expo development server
npx expo start
```

Scan the QR code with Expo Go on your phone or press `a` for Android emulator.

> **Note:** Update `API_BASE_URL` in `src/constants/index.ts` to your backend URL (use your local IP for physical devices, e.g., `http://192.168.1.x:3000/api/v1`).

---

## Railway Deployment

### 1. Create Railway Project

1. Go to [railway.app](https://railway.app) and create a new project
2. Add a **PostgreSQL** service (click "New" → "Database" → "PostgreSQL")
3. Add a **Node.js** service (click "New" → "GitHub Repo" and connect your repo)

### 2. Configure Backend Service

Set the **Root Directory** to `backend` in the service settings.

**Environment Variables** (set in Railway dashboard):

| Variable | Value |
|---|---|
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` (Railway auto-links) |
| `JWT_SECRET` | Generate: `openssl rand -hex 32` |
| `JWT_REFRESH_SECRET` | Generate: `openssl rand -hex 32` |
| `PORT` | `3000` |
| `NODE_ENV` | `production` |
| `CORS_ORIGIN` | `*` |

### 3. Build & Deploy Configuration

Railway auto-detects the `railway.json` or Nixpacks configuration:

```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npx prisma generate && npm run build"
  },
  "deploy": {
    "startCommand": "npx prisma migrate deploy && npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### 4. Run Seed (First Deploy Only)

After the first successful deployment, open the Railway service shell:

```bash
npx prisma db seed
```

Or via Railway CLI:
```bash
railway run npx prisma db seed
```

### 5. Get Production URL

Copy the public URL from Railway (e.g., `https://your-app.up.railway.app`).

Update mobile app's `API_BASE_URL`:
```typescript
export const API_BASE_URL = 'https://your-app.up.railway.app/api/v1';
export const SOCKET_URL = 'https://your-app.up.railway.app';
```

---

## Mobile App Build

### Development Build (Expo Go)

```bash
cd mobile
npx expo start
```

### Production Build (EAS)

1. Install EAS CLI:
```bash
npm install -g eas-cli
```

2. Configure EAS:
```bash
cd mobile
eas init
eas build:configure
```

3. Build for Android:
```bash
# Development APK
eas build --platform android --profile development

# Production AAB (for Play Store)
eas build --platform android --profile production
```

4. Build for iOS:
```bash
eas build --platform ios --profile production
```

### Local APK Build (without EAS)

```bash
cd mobile
npx expo prebuild --platform android
cd android
./gradlew assembleRelease
```

The APK will be at `android/app/build/outputs/apk/release/app-release.apk`.

---

## Environment Variables

### Backend (.env)

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/salon_queue

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-key-min-32-chars
JWT_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Server
PORT=3000
NODE_ENV=production
CORS_ORIGIN=*
```

### Mobile (src/constants/index.ts)

```typescript
export const API_BASE_URL = 'https://your-backend.up.railway.app/api/v1';
export const SOCKET_URL = 'https://your-backend.up.railway.app';
```

---

## Database Migrations

### Create a new migration (development)
```bash
npx prisma migrate dev --name your_migration_name
```

### Apply migrations (production)
```bash
npx prisma migrate deploy
```

### Reset database (WARNING: deletes all data)
```bash
npx prisma migrate reset
```

### View database with Prisma Studio
```bash
npx prisma studio
```

---

## Health Check

After deployment, verify:

```bash
# API health
curl https://your-app.up.railway.app/api/v1/health

# Expected: { "status": "ok" }
```

---

## Troubleshooting

| Issue | Solution |
|---|---|
| `ECONNREFUSED` on mobile | Check API_BASE_URL; use machine IP, not localhost |
| `401 Unauthorized` | Token expired; app auto-refreshes, check refresh token logic |
| `P2002` unique constraint | Duplicate entry (e.g., same phone or same date+time slot) |
| Socket not connecting | Verify SOCKET_URL matches backend; check CORS settings |
| `prisma migrate` fails | Ensure DATABASE_URL is correct and DB is accessible |
| Build fails on Railway | Check root directory is set to `backend`; verify Node version >= 18 |
