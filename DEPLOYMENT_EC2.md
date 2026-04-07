# EC2 Deployment Guide (Docker + PWA)

## 1. Current Server Reality (verified)

- Docker and Docker Compose are already installed.
- A separate stack is already bound to ports `80` and `443`.
- `nginx` system service is inactive; reverse proxy is containerized in the other stack.

Implication:
- Deploy this app on a non-conflicting host port first (default `8080`).
- Only move to `80/443` after domain/routing coordination with the existing stack.

## 2. Server Bootstrap

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl git

# Docker (skip if already installed)
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker

docker --version
docker compose version
```

## 3. Application Setup on EC2

```bash
sudo mkdir -p /opt/salon-andriod
sudo chown -R ubuntu:ubuntu /opt/salon-andriod
cd /opt/salon-andriod

git clone <YOUR_REPO_URL> .
cp .env.example .env
```

Set production values in `.env`:
- `MONGO_ROOT_PASSWORD`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `ADMIN_PASSWORD`
- `CORS_ORIGIN`
- `CLIENT_URL`
- `IMAGE_REPOSITORY`

Then run:

```bash
docker compose up -d --build
```

Health check:

```bash
curl http://localhost:8080
curl http://localhost:8080/api/health
```

## 4. Reverse Proxy Strategy

### Option A: Keep isolated (recommended initially)
- Use `http://EC2_PUBLIC_IP:8080`
- No conflicts with existing containerized nginx on 80/443.

### Option B: Domain + HTTPS
- Add a dedicated nginx server block for a new domain/subdomain.
- Point proxy target to `http://127.0.0.1:8080`.
- Use certbot for TLS if DNS is available.

Template config is provided in `deploy/nginx-salon.conf`.

## 5. Zero-Downtime-ish Updates

```bash
cd /opt/salon-andriod
git pull --ff-only
IMAGE_REPOSITORY=<repo> IMAGE_TAG=latest docker compose pull
IMAGE_REPOSITORY=<repo> IMAGE_TAG=latest docker compose up -d --remove-orphans
```

## 6. Restart Persistence

- All services use `restart: unless-stopped`.
- MongoDB data is persisted in `mongo_data` Docker volume.
