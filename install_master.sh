#!/bin/bash

# ======================================================================
# 🇾🇪 YemenJPT Enterprise - "Zero-Fail" Master Installer (V4.101)
# ======================================================================
# Target OS: Ubuntu 24.04 LTS
# This script automates the complete setup of the YemenJPT platform.

set -e # Exit immediately if a command exits with a non-zero status.

# --- ANSI Color Codes ---
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# --- Global Variables ---
INSTALL_DIR="/opt/raidanpro"

# --- Helper Functions ---
print_header() {
    echo -e "${BLUE}=====================================================${NC}"
    echo -e "${BLUE}    🇾🇪 YemenJPT Enterprise Platform Installer       ${NC}"
    echo -e "${BLUE}=====================================================${NC}"
    echo
}

check_root() {
    if [ "$EUID" -ne 0 ]; then
        echo -e "${RED}❌ Error: This script must be run as root. Please use 'sudo ./install_master.sh'${NC}"
        exit 1
    fi
}

preflight_checks() {
    echo -e "🔎 [1/7] Performing Pre-flight System Checks..."
    
    MEM_TOTAL_KB=$(grep MemTotal /proc/meminfo | awk '{print $2}')
    MEM_TOTAL_GB=$((MEM_TOTAL_KB / 1024 / 1024))
    if [ "$MEM_TOTAL_GB" -lt 15 ]; then
        echo -e "${YELLOW}   ⚠️ Warning: Less than 16GB RAM detected (${MEM_TOTAL_GB}GB). Performance may be degraded.${NC}"
    else
        echo -e "   ✅ RAM: ${MEM_TOTAL_GB}GB - OK"
    fi

    echo -e "   ✅ CPU Cores: $(nproc) - OK"

    DISK_FREE_GB=$(df -BG / | awk 'NR==2 {print $4}' | sed 's/G//')
    if [ "$DISK_FREE_GB" -lt 100 ]; then
         echo -e "${YELLOW}   ⚠️ Warning: Less than 100GB free disk space detected (${DISK_FREE_GB}GB). This may not be enough for Docker images and data.${NC}"
    else
        echo -e "   ✅ Disk Space: ${DISK_FREE_GB}GB - OK"
    fi

    for cmd in docker curl git; do
        if ! command -v $cmd &> /dev/null; then
            echo -e "   ⏳ '$cmd' not found. Installing dependencies..."
            export DEBIAN_FRONTEND=noninteractive
            apt-get update > /dev/null
            apt-get install -y apt-transport-https ca-certificates curl git software-properties-common > /dev/null
            
            if ! command -v docker &> /dev/null; then
                echo -e "   ⏳ Installing Docker..."
                curl -fsSL https://get.docker.com -o get-docker.sh
                sh get-docker.sh > /dev/null
                rm get-docker.sh
                usermod -aG docker $SUDO_USER || echo "   (Could not add $SUDO_USER to docker group, continuing)"
                systemctl enable --now docker
                echo -e "   ✅ Docker installed successfully."
            fi
        fi
    done
    echo -e "   ✅ All dependencies are present."
}

setup_environment() {
    echo -e "🔑 [2/7] Setting up Environment Configuration in ${INSTALL_DIR}..."
    ENV_FILE="${INSTALL_DIR}/.env"
    ENV_EXAMPLE_FILE=".env.example"

    if [ ! -f "$ENV_EXAMPLE_FILE" ]; then
        echo -e "${RED}❌ Error: .env.example file not found in repository. Aborting.${NC}"
        exit 1
    fi

    cp "$ENV_EXAMPLE_FILE" "$ENV_FILE"

    if grep -q "generate_" "$ENV_FILE"; then
        echo "   -> Found placeholders. Generating secure random passwords..."
        sed -i "s/generate_a_strong_postgres_password/$(openssl rand -base64 32 | tr -d '/+=')/g" "$ENV_FILE"
        sed -i "s/generate_a_strong_mariadb_password/$(openssl rand -base64 32 | tr -d '/+=')/g" "$ENV_FILE"
        sed -i "s/generate_a_very_strong_mariadb_root_password/$(openssl rand -base64 32 | tr -d '/+=')/g" "$ENV_FILE"
        sed -i "s/generate_a_strong_redis_password/$(openssl rand -base64 32 | tr -d '/+=')/g" "$ENV_FILE"
        sed -i "s/generate_a_strong_minio_password/$(openssl rand -base64 32 | tr -d '/+=')/g" "$ENV_FILE"
        echo "   ✅ Secure passwords generated and saved to .env file."
    else
        echo "   ✅ .env file is already configured."
    fi
}

copy_project_files() {
    echo -e "📂 [3/7] Copying project files to ${INSTALL_DIR}..."
    mkdir -p "${INSTALL_DIR}"
    # Use rsync to copy all files, which is more efficient
    rsync -a --exclude='.git' --exclude='install_master.sh' . "${INSTALL_DIR}/"
    echo "   ✅ Project files copied successfully."
}

create_data_directories() {
    echo -e "📦 [4/7] Creating Persistent Data Directories..."
    DATA_ROOT="${INSTALL_DIR}/data"
    
    declare -a DIRS=(
        "npm/data" "npm/letsencrypt" "portainer" "postgres" "mariadb" "redis" "minio"
        "ollama" "label-studio" "n8n" "ghost" "wordpress" "azuracast/stations" 
        "restreamer/config" "restreamer/data" "vaultwarden" "languagetool" "gitea"
    )

    for dir in "${DIRS[@]}"; do
        mkdir -p "${DATA_ROOT}/${dir}"
    done

    # Set permissions. 1000:1000 is a common user/group for containers.
    chown -R 1000:1000 "${DATA_ROOT}"
    echo "   ✅ Data directory structure created."
}

setup_network() {
    echo -e "🌐 [5/7] Setting up Docker Network..."
    if ! docker network ls | grep -q "raidan_net"; then
        echo "   -> Network 'raidan_net' not found. Creating..."
        docker network create --subnet=172.25.0.0/16 "raidan_net"
        echo "   ✅ Network 'raidan_net' created."
    else
        echo "   ✅ Network 'raidan_net' already exists."
    fi
}

build_and_deploy() {
    cd "${INSTALL_DIR}"
    echo -e "🐳 [6/7] Building Custom Docker Images..."
    docker compose build --no-cache
    echo "   ✅ Custom images built successfully."

    echo -e "🚀 [7/7] Deploying the Enterprise Stack..."
    echo "   (This may take several minutes as images are downloaded)"
    docker compose up -d
    echo "   ✅ All services are starting in the background."
}

health_check_and_summary() {
    echo -e "\n🩺 Performing Health Check..."
    echo -n "   -> Waiting for the gateway service to become healthy"
    
    for i in {1..60}; do
        if curl -s --fail http://127.0.0.1:8181 > /dev/null; then
            echo -e "\n   ${GREEN}✅ Health check passed! Nginx Proxy Manager is responding.${NC}"
            
            SERVER_IP=$(curl -s ifconfig.me)
            
            echo
            echo -e "${GREEN}=====================================================${NC}"
            echo -e "${GREEN}      ✅ DEPLOYMENT SUCCESSFUL! ✅                  ${NC}"
            echo -e "${GREEN}=====================================================${NC}"
            echo
            echo "   The YemenJPT Enterprise stack is now running in ${INSTALL_DIR}."
            echo "   Your next step is to configure Nginx Proxy Manager."
            echo
            echo -e "   ${YELLOW}➡️  Open your browser and navigate to: http://${SERVER_IP}:8181${NC}"
            echo
            echo "   Default Login:"
            echo "   - Email:    admin@example.com"
            echo "   - Password: changeme"
            echo
            echo "   Follow the instructions in the README.md to configure your subdomains for ph-ye.org."
            echo -e "   ${BLUE}To view logs, run: 'cd ${INSTALL_DIR} && sudo docker compose logs -f'${NC}"
            return
        fi
        echo -n "."
        sleep 5
    done

    echo -e "\n   ${RED}❌ Health check failed after 5 minutes.${NC}"
    echo -e "   Please check the container logs for errors:"
    echo -e "   'sudo docker logs nginx-proxy-manager'"
}

main() {
    print_header
    check_root
    preflight_checks
    copy_project_files
    setup_environment
    create_data_directories
    setup_network
    build_and_deploy
    health_check_and_summary
}

main
