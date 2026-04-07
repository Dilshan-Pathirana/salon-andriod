#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/salon-andriod}"
BRANCH="${BRANCH:-main}"

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is not installed."
  exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "Docker Compose plugin is not installed."
  exit 1
fi

if [ ! -d "$APP_DIR/.git" ]; then
  echo "Cloning repository into $APP_DIR"
  sudo mkdir -p "$APP_DIR"
  sudo chown -R "$USER":"$USER" "$APP_DIR"
  git clone "${REPO_URL:?REPO_URL is required}" "$APP_DIR"
fi

cd "$APP_DIR"

git fetch origin "$BRANCH"
git checkout "$BRANCH"
git pull --ff-only origin "$BRANCH"

if [ ! -f .env ]; then
  echo "Missing .env file in $APP_DIR"
  exit 1
fi

docker compose pull || true
docker compose build --pull
docker compose up -d --remove-orphans

docker image prune -f

echo "Deployment completed"
