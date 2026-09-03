#!/usr/bin/env bash
# ===========================================================
# RiwiSchool Plus — Levantar el proyecto con Docker
# Ejecutar con: chmod +x scripts/docker-start.sh && ./scripts/docker-start.sh
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

# ── Verificar que Docker esté corriendo ────────────────────
if ! docker info &>/dev/null; then
    err "Docker no está corriendo. Iniciando Docker..."
    sudo systemctl start docker || { err "No se pudo iniciar Docker. Ejecuta: sudo systemctl start docker"; exit 1; }
fi

# ── Verificar docker-compose.yml ───────────────────────────
if [ ! -f "docker-compose.yml" ]; then
    err "No se encontró docker-compose.yml en $ROOT"
    exit 1
fi

# ── Copiar .env si no existe ────────────────────────────────
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        log "Archivo .env creado desde .env.example"
    else
        warn "No se encontró .env.example — asegúrate de tener .env configurado"
    fi
fi

# ── Levantar contenedores ───────────────────────────────────
log "Construyendo e iniciando contenedores..."
docker compose up -d --build

# ── Esperar a que PostgreSQL esté listo ─────────────────────
log "Esperando a que PostgreSQL esté disponible..."
RETRIES=30
until docker compose exec -T db pg_isready -U postgres -q 2>/dev/null; do
    RETRIES=$((RETRIES - 1))
    if [ "$RETRIES" -le 0 ]; then
        err "PostgreSQL no respondió. Revisa los logs con: docker compose logs db"
        exit 1
    fi
    sleep 1
done
log "PostgreSQL listo."

# ── Crear la base de datos si no existe ─────────────────────
DB_NAME=$(grep DB_NAME .env | cut -d= -f2)
DB_USER=$(grep DB_USER .env | cut -d= -f2)
docker compose exec -T db psql -U "$DB_USER" -tc \
    "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 \
    || docker compose exec -T db psql -U "$DB_USER" -c "CREATE DATABASE $DB_NAME"
log "Base de datos '$DB_NAME' verificada."

# ── Resumen ─────────────────────────────────────────────────
echo ""
log "Proyecto levantado correctamente."
echo ""
echo "  API:             http://localhost:3000"
echo "  Swagger:         http://localhost:3000/api-docs"
echo "  Health check:    http://localhost:3000/api/health"
echo "  Logs (tiempo real): docker compose logs -f api"
echo ""
echo "  Carga de seeders:"
echo "    curl -X POST http://localhost:3000/api/seeders/default -H 'Authorization: Bearer <TOKEN>'"
echo ""
echo "  Para detener:    docker compose down"
echo ""
