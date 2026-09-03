#!/usr/bin/env bash
# ===========================================================
# RiwiSchool Plus — Setup completo (Ubuntu)
# Instala dependencias + levanta Docker + carga seeders
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
log "Paso 1/5 — Instalando dependencias del sistema..."
if bash scripts/install-deps.sh; then
    log "Dependencias del sistema instaladas."
else
    err "Error al instalar dependencias. Revisa la salida anterior."
    exit 1
fi

# ── 2. Verificar que Docker esté corriendo ──────────────────
log "Paso 2/5 — Verificando Docker..."
if ! docker info &>/dev/null; then
    sudo systemctl start docker || true
    sleep 2
    if ! docker info &>/dev/null; then
        err "Docker no está corriendo. Ejecuta manualmente: sudo systemctl start docker"
        exit 1
    fi
fi
log "Docker corriendo."

# ── 3. Preparar entorno ─────────────────────────────────────
log "Paso 3/5 — Preparando archivos de entorno..."
if [ ! -f ".env" ]; then
    cp .env.example .env
    log ".env creado desde .env.example"
else
    log ".env ya existe."
fi

# ── 4. Levantar Docker ──────────────────────────────────────
log "Paso 4/5 — Levantando contenedores Docker..."
if bash scripts/docker-start.sh; then
    log "Contenedores levantados."
else
    err "Error al levantar Docker."
    exit 1
fi

# ── 5. Instalar dependencias Node.js (para desarrollo local) ─
log "Paso 5/5 — Instalando dependencias Node.js..."
npm install --silent 2>/dev/null
log "node_modules instalado."

# ── Resumen final ────────────────────────────────────────────
echo ""
echo "=========================================="
log "  ¡Setup completo!"
echo "=========================================="
echo ""
echo "  Servidor:    http://localhost:3000"
echo "  Swagger:     http://localhost:3000/api-docs"
echo "  Health:      http://localhost:3000/api/health"
echo ""
echo "  Desarrollo local (fuera de Docker):"
echo "    npm run dev"
echo ""
echo "  Levantar Docker:"
echo "    ./scripts/docker-start.sh"
echo ""
echo "  Cargar seeders de prueba:"
echo "    curl -X POST http://localhost:3000/api/seeders/default -H 'Authorization: Bearer <TOKEN>'"
echo ""
echo "  Detener Docker:"
echo "    docker compose down"
echo ""
