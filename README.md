# Salon PWA Platform

Mobile-first salon booking platform using React PWA frontend and Node.js backend.

## Stack

- Frontend: React + Vite + Tailwind + vite-plugin-pwa
- Backend: Node.js + Express + Prisma
- Database: PostgreSQL
- Infra: Docker Compose + GitHub Actions + EC2

## Local Development

```bash
npm install
npm run install:all
npm run dev:backend
npm run dev:web
```

Frontend: `http://localhost:5173`
Backend: `http://localhost:4000/api`

## PWA Build

```bash
cd web
npm run build
npm run preview
```

Installability and service worker are enabled via `vite-plugin-pwa`.

## Docker Run

```bash
cp .env.example .env
# edit .env secrets
docker compose up -d --build
```

App: `http://localhost:8080`
API health: `http://localhost:8080/api/health`

## CI/CD

Workflow: `.github/workflows/docker-ec2-deploy.yml`

Pipeline actions:
1. Build backend/frontend images
2. Push images to GHCR
3. SSH into EC2
4. Pull latest images and restart containers

## Required GitHub Secrets

- `GHCR_USERNAME`
- `GHCR_TOKEN`
- `GHCR_IMAGE_REPOSITORY` (example: `ghcr.io/your-org/salon-andriod`)
- `SSH_PRIVATE_KEY`
- `EC2_HOST`
- `EC2_USER`
- `EC2_APP_DIR` (example: `/opt/salon-andriod`)

Application secrets are stored only on EC2 in `.env`.

## Architecture and Deployment Docs

- `SYSTEM_MAP.md`
- `DEPLOYMENT_EC2.md`
- `database/migrations/001_init_postgresql.sql` (target SQL schema blueprint)
