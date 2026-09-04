#!/usr/bin/env bash
# ===========================================================
# RiwiSchool Plus — Start PostgreSQL with Docker (Ubuntu)
# Run with: chmod +x scripts/docker-start.sh && ./scripts/docker-start.sh
# ===========================================================
set -euo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log()  { echo -e "${GREEN}[✓]${NC} $*"; }
warn() { echo -e "${YELLOW}[!]${NC} $*"; }
err()  { echo -e "${RED}[✗]${NC} $*"; }

cd "$(dirname "$0")/.."
ROOT=$(pwd)

# ── Check that Docker is running ──────────────────────────
if ! docker info &>/dev/null; then
    warn "Docker is not running. Starting Docker..."
    sudo systemctl start docker || { err "Could not start Docker. Run: sudo systemctl start docker"; exit 1; }
fi

# ── Check docker-compose.yml ─────────────────────────────
if [ ! -f "docker-compose.yml" ]; then
    err "docker-compose.yml not found in $ROOT"
    exit 1
fi

# ── Copy .env if it does not exist ────────────────────────
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        log "File .env created from .env.example"
    else
        warn ".env.example not found -- make sure you have .env configured"
    fi
fi

# ── Start PostgreSQL only ─────────────────────────────────
log "Starting PostgreSQL..."
docker compose up -d db

# ── Wait for PostgreSQL to be ready ───────────────────────
log "Waiting for PostgreSQL to be available..."
RETRIES=30
until docker compose exec -T db pg_isready -U postgres -q 2>/dev/null; do
    RETRIES=$((RETRIES - 1))
    if [ "$RETRIES" -le 0 ]; then
        err "PostgreSQL did not respond. Check the logs with: docker compose logs db"
        exit 1
    fi
    sleep 1
done
log "PostgreSQL ready."

# ── Create the database if it does not exist ──────────────
DB_NAME=$(grep DB_NAME .env | cut -d= -f2)
DB_USER=$(grep DB_USER .env | cut -d= -f2)
docker compose exec -T db psql -U "$DB_USER" -tc \
    "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 \
    || docker compose exec -T db psql -U "$DB_USER" -c "CREATE DATABASE $DB_NAME"
log "Database '$DB_NAME' verified."

# ── Summary ───────────────────────────────────────────────
echo ""
log "PostgreSQL started successfully."
echo ""
echo "  PostgreSQL: localhost:5432 (Docker)"
echo ""
echo "  To start the API:"
echo "    npm run dev"
echo ""
echo "  To stop PostgreSQL:"
echo "    docker compose down"
echo ""
