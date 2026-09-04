#!/usr/bin/env bash
# ===========================================================
# RiwiSchool Plus — Setup completo (Ubuntu)
# Instala dependencias + PostgreSQL en Docker + npm run dev
# Ejecutar con: chmod +x scripts/setup.sh && ./scripts/setup.sh
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

echo ""
echo "=========================================="
echo "  RiwiSchool Plus — Setup completo"
echo "=========================================="
echo ""

# ── 1. Instalar dependencias del sistema ────────────────────
log "Paso 1/6 — Instalando dependencias del sistema..."
if bash scripts/install-deps.sh; then
    log "Dependencias del sistema instaladas."
else
    err "Error al instalar dependencias. Revisa la salida anterior."
    exit 1
fi

# ── 2. Verificar que Docker esté corriendo ──────────────────
log "Paso 2/6 — Verificando Docker..."
if ! docker info &>/dev/null; then
    sudo systemctl start docker || true
    sleep 2
    if ! docker info &>/dev/null; then
        err "Docker no está corriendo. Ejecuta: sudo systemctl start docker"
        exit 1
    fi
fi
log "Docker corriendo."

# ── 3. Preparar entorno ─────────────────────────────────────
log "Paso 3/6 — Preparando archivos de entorno..."
if [ ! -f ".env" ]; then
    cp .env.example .env
    log ".env creado desde .env.example"
else
    log ".env ya existe."
fi

# ── 4. Levantar SOLO PostgreSQL en Docker ───────────────────
log "Paso 4/6 — Levantando PostgreSQL en Docker..."
docker compose up -d db

# Esperar a que PostgreSQL esté listo
log "Esperando a que PostgreSQL esté disponible..."
RETRIES=30
until docker compose exec -T db pg_isready -U postgres -q 2>/dev/null; do
    RETRIES=$((RETRIES - 1))
    if [ "$RETRIES" -le 0 ]; then
        err "PostgreSQL no respondió. Revisa: docker compose logs db"
        exit 1
    fi
    sleep 1
done
log "PostgreSQL listo."

# Crear la base de datos si no existe
DB_NAME=$(grep DB_NAME .env | cut -d= -f2)
DB_USER=$(grep DB_USER .env | cut -d= -f2)
docker compose exec -T db psql -U "$DB_USER" -tc \
    "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 \
    || docker compose exec -T db psql -U "$DB_USER" -c "CREATE DATABASE $DB_NAME"
log "Base de datos '$DB_NAME' verificada."

# ── 5. Instalar dependencias Node.js ────────────────────────
log "Paso 5/6 — Instalando dependencias Node.js..."
npm install --silent 2>/dev/null
log "node_modules instalado."

# ── 6. Iniciar servidor en modo desarrollo ───────────────────
log "Paso 6/6 — Iniciando servidor en modo desarrollo..."
echo ""
echo "=========================================="
log "  ¡Setup completo!"
echo "=========================================="
echo ""
echo "  Servidor:    http://localhost:3000"
echo "  Swagger:     http://localhost:3000/api-docs"
echo "  Health:      http://localhost:3000/api/health"
echo ""
echo "  PostgreSQL:  localhost:5432 (Docker)"
echo ""
echo "  Load test seeders:"
echo "    curl -X POST http://localhost:3000/api/seeder/default -H 'Authorization: Bearer <TOKEN>'"
echo ""
echo "  To stop PostgreSQL:"
echo "    docker compose down"
echo ""
echo "  Starting npm run dev..."
echo "=========================================="
echo ""

npm run dev
