
#!/bin/bash

# =======================================================
# 🇾🇪 YemenJPT Platform Deployment Script (V18.2)
# =======================================================
# This script applies updates from the Git repository
# to the live deployment directory (/opt/presshouse).
# Run this from the repository root after `git pull`.
# =======================================================

set -e # Exit immediately if a command fails.

# --- Terminal Colors ---
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

BASE_DIR="/opt/presshouse"
REPO_DIR=$(pwd)

echo -e "${BLUE}>>> Starting YemenJPT Platform Update...${NC}"

# --- 1. Root Check ---
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}❌ This script must be run as root. Please use 'sudo ./deploy.sh'${NC}"
    exit 1
fi

# --- 2. Check for existing installation ---
if [ ! -d "${BASE_DIR}" ]; then
    echo -e "${RED}❌ ERROR: Deployment directory ${BASE_DIR} not found.${NC}"
    echo -e "${RED}Please run the main install.sh script first.${NC}"
    exit 1
fi

# --- 3. Copy updated files ---
echo -e "⚙️ [1/3] Copying updated configurations and backend code to ${BASE_DIR}..."
cp "${REPO_DIR}/docker-compose.yml" "${BASE_DIR}/docker-compose.yml"
cp "${REPO_DIR}/dashy-admin.yml" "${BASE_DIR}/dashy-admin.yml"
cp "${REPO_DIR}/dashy-journalist.yml" "${BASE_DIR}/dashy-journalist.yml"
cp "${REPO_DIR}/dashy-verifier.yml" "${BASE_DIR}/dashy-verifier.yml"
cp "${REPO_DIR}/panic.sh" "${BASE_DIR}/panic.sh" && chmod +x "${BASE_DIR}/panic.sh"
cp "${REPO_DIR}/secure.sh" "${BASE_DIR}/secure.sh" && chmod +x "${BASE_DIR}/secure.sh"
mkdir -p "${BASE_DIR}/scripts"
cp "${REPO_DIR}/scripts/panic_mode.sh" "${BASE_DIR}/scripts/panic_mode.sh" && chmod +x "${BASE_DIR}/scripts/panic_mode.sh"

# Ensure backend directory exists and copy contents
mkdir -p "${BASE_DIR}/backend"
cp -r "${REPO_DIR}/backend/." "${BASE_DIR}/backend/"
echo "   ✅ Files updated successfully."

# --- 4. Build and Launch Containers ---
echo -e "🐳 [2/3] Building and restarting services..."
cd "${BASE_DIR}"
docker compose up -d --build --remove-orphans

# --- 5. Finalizing ---
echo -e "🚀 [3/3] Deployment process complete."
echo ""
echo -e "${GREEN}======================================================================="
echo -e "✅ YemenJPT Platform update finished!"
echo -e "=======================================================================${NC}"
echo "💡 To see live logs, run: 'cd ${BASE_DIR} && docker compose logs -f'"
echo "💡 To stop the services, run: 'cd ${BASE_DIR} && docker compose down'"
echo "=======================================================================${NC}
