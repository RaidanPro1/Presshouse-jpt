#!/bin/bash
# =======================================================
# PANIC SCRIPT - Activates Digital Chameleon (v2 - Nginx Proxy)
# =======================================================
set -e

CONFIG_FILE="/opt/presshouse/internal_proxy/nginx.conf"
PROXY_CONTAINER="ph-internal-proxy"

echo "🔴 Activating PANIC MODE (Digital Chameleon)..."

# Use sed to replace the proxy_pass target from the real app to the decoy app
sed -i 's/proxy_pass http:\/\/yemenjpt_app:80;/proxy_pass http:\/\/decoy_app:80;/g' "${CONFIG_FILE}"

# Reload Nginx inside the container to apply changes without downtime
docker exec "${PROXY_CONTAINER}" nginx -s reload

echo "✅ Internal proxy switched to DECOY mode."
echo "ℹ️ The main portal will now show the decoy site."
