
#!/bin/bash

# ============================================================
# 🇾🇪 YemenJPT & Press House Ecosystem (V25.0 - Enterprise Edition)
# ============================================================

set -e # Exit immediately if a command exits with a non-zero status.

# --- Terminal Colors ---
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# --- Global Variables ---
REPO_DIR=$(cd "$(dirname "$0")" && pwd)
BASE_DIR="/opt/presshouse"

print_header() {
    echo -e "${GREEN}>>> Initializing YemenJPT Platform Automated Installation (V25.0)...${NC}"
    echo ""
}

check_root() {
    if [ "$EUID" -ne 0 ]; then
        echo -e "${RED}❌ This script must be run as root. Please use 'sudo ./install.sh'${NC}"
        exit 1
    fi
}

check_env() {
    echo -e "${BLUE}⚙️ [1/7] Verifying environment configuration...${NC}"
    if [ ! -f "${REPO_DIR}/.env" ]; then
        echo -e "${RED}❌ CRITICAL: .env file not found. Please copy .env.example to .env and fill in your details.${NC}"
        exit 1
    fi

    export $(cat "${REPO_DIR}/.env" | sed 's/#.*//g' | xargs)

    local required_vars=(DOMAIN UNIFIED_PASS)
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            echo -e "${RED}❌ CRITICAL: Required variable '$var' is not set in the .env file. Installation aborted.${NC}"
            exit 1
        fi
    done
    echo "   ✅ Environment variables loaded successfully."
}

prepare_system() {
    echo -e "${BLUE}🛠️ [2/7] Preparing server and installing dependencies...${NC}"
    export DEBIAN_FRONTEND=noninteractive
    apt-get update > /dev/null
    apt-get install -y curl git docker-ce docker-ce-cli containerd.io docker-compose-plugin > /dev/null || {
        echo "   -> Dependency installation failed, trying with Docker's official script..."
        curl -fsSL https://get.docker.com -o get-docker.sh
        sh get-docker.sh
        rm get-docker.sh
        systemctl enable --now docker
    }
    echo "   ✅ System dependencies and Docker are installed."
}

create_directories() {
    echo -e "${BLUE}📂 [3/7] Creating persistent data directories...${NC}"
    mkdir -p "${BASE_DIR}/data/postgres"
    mkdir -p "${BASE_DIR}/data/mariadb"
    mkdir -p "${BASE_DIR}/data/mongodb"
    mkdir -p "${BASE_DIR}/data/ollama"
    mkdir -p "${BASE_DIR}/data/open-webui"
    mkdir -p "${BASE_DIR}/data/qdrant"
    mkdir -p "${BASE_DIR}/data/libretranslate"
    mkdir -p "${BASE_DIR}/data/mattermost/config" "${BASE_DIR}/data/mattermost/data" "${BASE_DIR}/data/mattermost/logs"
    mkdir -p "${BASE_DIR}/data/nextcloud"
    mkdir -p "${BASE_DIR}/data/webtop_config"
    mkdir -p "${BASE_DIR}/data/searxng"
    mkdir -p "${BASE_DIR}/data/spiderfoot"
    mkdir -p "${BASE_DIR}/data/changedetection"
    mkdir -p "${BASE_DIR}/data/archivebox"
    mkdir -p "${BASE_DIR}/data/portainer"
    mkdir -p "${BASE_DIR}/data/uptime-kuma"
    mkdir -p "${BASE_DIR}/data/n8n"
    mkdir -p "${BASE_DIR}/data/gitea"
    mkdir -p "${BASE_DIR}/data/vaultwarden"
    # New directories for Enterprise Edition
    mkdir -p "${BASE_DIR}/data/label-studio"
    mkdir -p "${BASE_DIR}/data/azuracast_stations" "${BASE_DIR}/data/azuracast_db"
    mkdir -p "${BASE_DIR}/data/ghost"
    mkdir -p "${BASE_DIR}/data/posteio"
    mkdir -p "${BASE_DIR}/data/restreamer"
    mkdir -p "${BASE_DIR}/data/mixpost"
    mkdir -p "${BASE_DIR}/data/evolution-api"
    # End new directories
    mkdir -p "${BASE_DIR}/internal_proxy"
    mkdir -p "${BASE_DIR}/decoy"
    mkdir -p "${BASE_DIR}/backend"
    mkdir -p "${BASE_DIR}/backend/forensics"
    mkdir -p "${BASE_DIR}/scripts"
    echo "   ✅ All data directories created in ${BASE_DIR}."
}

generate_configs() {
    echo -e "${BLUE}📝 [4/7] Generating dynamic configurations...${NC}"

    # Copy primary docker-compose and .env
    cp "${REPO_DIR}/docker-compose.yml" "${BASE_DIR}/docker-compose.yml"
    cp "${REPO_DIR}/.env" "${BASE_DIR}/.env"
    
    # Copy Dashy dashboard configurations
    cp "${REPO_DIR}/dashy-admin.yml" "${BASE_DIR}/dashy-admin.yml"
    cp "${REPO_DIR}/dashy-journalist.yml" "${BASE_DIR}/dashy-journalist.yml"
    cp "${REPO_DIR}/dashy-verifier.yml" "${BASE_DIR}/dashy-verifier.yml"

    # Copy security scripts
    cp "${REPO_DIR}/panic.sh" "${BASE_DIR}/panic.sh"
    cp "${REPO_DIR}/secure.sh" "${BASE_DIR}/secure.sh"
    cp "${REPO_DIR}/scripts/panic_mode.sh" "${BASE_DIR}/scripts/panic_mode.sh"
    chmod +x "${BASE_DIR}/panic.sh" "${BASE_DIR}/secure.sh" "${BASE_DIR}/scripts/panic_mode.sh"

    # Copy backend source code
    cp -r "${REPO_DIR}/backend/." "${BASE_DIR}/backend/"
    
    # Create default Nginx config for the internal proxy
    cat > "${BASE_DIR}/internal_proxy/nginx.conf" << EOL
events {}
http {
    server {
        listen 80;

        # --- Security Headers ---
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;
        add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://esm.sh; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://i.pravatar.cc https://picsum.photos https://www.svgrepo.com; connect-src 'self' https://generativelanguage.googleapis.com;" always;
        add_header X-XSS-Protection "1; mode=block" always;

        location / {
            proxy_pass http://yemenjpt_app:80;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }
        
        location /api/ {
            proxy_pass http://backend:3000/;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }
    }
}
EOL

    # Create the decoy index file
    cat > "${BASE_DIR}/decoy/index.html" << EOL
<!DOCTYPE html>
<html>
<head><title>Under Maintenance</title></head>
<body style="font-family: sans-serif; text-align: center; padding-top: 50px;">
  <h1>Service Temporarily Unavailable</h1>
  <p>This service is currently undergoing maintenance. Please check back later.</p>
</body>
</html>
EOL

    echo "   ✅ Configurations generated."
}

build_frontend() {
    echo -e "${BLUE}🏗️ [5/7] Building Frontend Application Docker Image...${NC}"
    # We build the image directly using the multi-stage Dockerfile
    # This avoids dependency hell on the host machine.
    
    cd "${REPO_DIR}"
    docker build -t yemenjpt-frontend-prod -f frontend/Dockerfile .
    
    echo "   ✅ Frontend image built successfully."
}

launch_services() {
    echo -e "${BLUE}🚀 [6/7] Launching all platform services via Docker Compose...${NC}"
    echo "   (This may take several minutes on the first run as images are downloaded)"
    
    cd "${BASE_DIR}"
    docker compose up -d --build --remove-orphans
    echo "   ✅ Services are starting in the background."
}

print_summary() {
    echo -e "${GREEN}======================================================================="
    echo -e "✅ YemenJPT Platform Installation for localhost Completed!"
    echo -e "=======================================================================${NC}"
    echo "All services are running and exposed on localhost ports."
    echo ""
    echo "--- Main Application ---"
    echo "🔗 Main App:           http://localhost:8080"
    echo ""
    echo "--- Media Empire ---"
    echo "🔗 Radio Broadcasting: http://localhost:8088 (AzuraCast)"
    echo "🔗 Publishing CMS:     http://localhost:2368 (Ghost)"
    echo "🔗 Mail Server Admin:  http://localhost:8089 (Poste.io)"
    echo "🔗 Live Streaming:     http://localhost:8091 (Restreamer)"
    echo "🔗 Social Scheduling:  http://localhost:8092 (Mixpost)"
    echo "🔗 WhatsApp API:       http://localhost:8093 (Evolution)"
    echo ""
    echo "--- Data & AI ---"
    echo "🔗 AI Interface:       http://localhost:8081 (Open WebUI)"
    echo "🔗 Data Labeling:      http://localhost:8090 (Label Studio)"
    echo "🔗 AI Feedback:        http://localhost:3006 (Langfuse)"
    echo ""
    echo "--- Admin & Management ---"
    echo "🔗 Container Manager:  http://localhost:9000 (Portainer)"
    echo "🔗 System Monitoring:  http://localhost:61208 (Glances)"
    echo "🔗 Service Status:     http://localhost:3001 (Uptime Kuma)"
    echo ""
    echo -e "${GREEN}-----------------------------------------------------------------------"
    echo "💡 To see live logs, run: 'cd ${BASE_DIR} && sudo docker compose logs -f'"
    echo "💡 To stop all services, run: 'cd ${BASE_DIR} && sudo docker compose down'"
    echo "=======================================================================${NC}"
}

# --- Main Execution ---
main() {
    check_root
    print_header
    check_env
    prepare_system
    create_directories
    generate_configs
    build_frontend
    launch_services
    print_summary
}

main
