#!/usr/bin/env bash
# ===========================================================
# RiwiSchool Plus — Install dependencies (Ubuntu)
# Run with: chmod +x scripts/install-deps.sh && ./scripts/install-deps.sh
# ===========================================================
set -euo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log()  { echo -e "${GREEN}[✓]${NC} $*"; }
warn() { echo -e "${YELLOW}[!]${NC} $*"; }

# ── Update system ────────────────────────────────────────
log "Updating system packages..."
sudo apt-get update -qq
sudo apt-get upgrade -y -qq

# ── Docker ─────────────────────────────────────────────────
if command -v docker &>/dev/null; then
    log "Docker already installed: $(docker --version)"
else
    log "Installing Docker..."
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
    warn "Your user was added to the 'docker' group. Close and reopen the terminal to use docker without sudo."
fi

# ── Docker Compose (legacy compatibility) ────────────────
if docker compose version &>/dev/null; then
    log "Docker Compose plugin detected: $(docker compose version --short)"
elif command -v docker-compose &>/dev/null; then
    log "docker-compose already installed: $(docker-compose --version)"
else
    log "Installing standalone docker-compose..."
    sudo apt-get install -y -qq docker-compose
fi

# ── Node.js 18+ ───────────────────────────────────────────
if command -v node &>/dev/null; then
    NODE_VER=$(node -v | sed 's/v//' | cut -d. -f1)
    if [ "$NODE_VER" -ge 18 ]; then
        log "Node.js already installed: $(node -v)"
    else
        warn "Node.js $(node -v) detected but 18+ is required. Updating..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt-get install -y -qq nodejs
    fi
else
    log "Installing Node.js 18..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y -qq nodejs
fi

# ── Git ────────────────────────────────────────────────────
if command -v git &>/dev/null; then
    log "Git already installed: $(git --version)"
else
    log "Installing Git..."
    sudo apt-get install -y -qq git
fi

# ── Final verification ───────────────────────────────────
echo ""
log "Installed tools summary:"
echo "  Docker:         $(docker --version 2>/dev/null || echo 'NOT INSTALLED')"
echo "  Docker Compose: $(docker compose version 2>/dev/null || docker-compose --version 2>/dev/null || echo 'NOT INSTALLED')"
echo "  Node.js:        $(node -v 2>/dev/null || echo 'NOT INSTALLED')"
echo "  npm:            $(npm -v 2>/dev/null || echo 'NOT INSTALLED')"
echo "  Git:            $(git --version 2>/dev/null || echo 'NOT INSTALLED')"
echo ""
log "System dependencies installed successfully."
echo "  Next step: ./scripts/docker-start.sh"
