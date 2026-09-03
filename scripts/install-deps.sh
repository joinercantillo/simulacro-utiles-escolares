#!/usr/bin/env bash
# ===========================================================
# RiwiSchool Plus — Instalación de dependencias (Ubuntu)
# Ejecutar con: chmod +x scripts/install-deps.sh && ./scripts/install-deps.sh
# ===========================================================
set -euo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log()  { echo -e "${GREEN}[✓]${NC} $*"; }
warn() { echo -e "${YELLOW}[!]${NC} $*"; }

# ── Actualizar sistema ──────────────────────────────────────
log "Actualizando paquetes del sistema..."
sudo apt-get update -qq
sudo apt-get upgrade -y -qq

# ── Docker ─────────────────────────────────────────────────
if command -v docker &>/dev/null; then
    log "Docker ya está instalado: $(docker --version)"
else
    log "Instalando Docker..."
    sudo apt-get install -y -qq ca-certificates curl gnupg
    sudo install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
        | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get update -qq
    sudo apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-compose-plugin
    sudo usermod -aG docker "$USER"
    warn "Se añadió tu usuario al grupo 'docker'. Cierra y vuelve a abrir la terminal para usar docker sin sudo."
fi

# ── Docker Compose (compatibilidad legacy) ─────────────────
if docker compose version &>/dev/null; then
    log "Docker Compose plugin detectado: $(docker compose version --short)"
elif command -v docker-compose &>/dev/null; then
    log "docker-compose ya instalado: $(docker-compose --version)"
else
    log "Instalando docker-compose standalone..."
    sudo apt-get install -y -qq docker-compose
fi

# ── Node.js 18+ ───────────────────────────────────────────
if command -v node &>/dev/null; then
    NODE_VER=$(node -v | sed 's/v//' | cut -d. -f1)
    if [ "$NODE_VER" -ge 18 ]; then
        log "Node.js ya instalado: $(node -v)"
    else
        warn "Node.js $(node -v) detectado pero se necesita 18+. Actualizando..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt-get install -y -qq nodejs
    fi
else
    log "Instalando Node.js 18..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y -qq nodejs
fi

# ── Git ────────────────────────────────────────────────────
if command -v git &>/dev/null; then
    log "Git ya instalado: $(git --version)"
else
    log "Instalando Git..."
    sudo apt-get install -y -qq git
fi

# ── Verificación final ─────────────────────────────────────
echo ""
log "Resumen de herramientas instaladas:"
echo "  Docker:         $(docker --version 2>/dev/null || echo 'NO INSTALADO')"
echo "  Docker Compose: $(docker compose version 2>/dev/null || docker-compose --version 2>/dev/null || echo 'NO INSTALADO')"
echo "  Node.js:        $(node -v 2>/dev/null || echo 'NO INSTALADO')"
echo "  npm:            $(npm -v 2>/dev/null || echo 'NO INSTALADO')"
echo "  Git:            $(git --version 2>/dev/null || echo 'NO INSTALADO')"
echo ""
log "Dependencias del sistema instaladas correctamente."
echo "  Siguiente paso: ./scripts/docker-start.sh"
