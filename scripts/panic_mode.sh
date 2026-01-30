
#!/bin/bash
# =======================================================
# PANIC SCRIPT - Activates Emergency Shutdown (v18.3)
# =======================================================
set -e

echo "🔴 Activating PANIC MODE..."

# This script uses the 'docker' command, assuming it's run by a user 
# (or a container) with access to the Docker socket.

echo "   - Stopping database containers..."
docker stop ph-postgres ph-mariadb

echo "   - Stopping internal proxy..."
docker stop ph-internal-proxy

echo "✅ Critical services stopped."
echo "💥 Panic mode complete."
