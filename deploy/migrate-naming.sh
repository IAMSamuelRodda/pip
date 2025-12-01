#!/bin/bash
# Migrate from zero-agent naming to pip naming
# Run ONCE from /opt/pip on VPS: ./deploy/migrate-naming.sh
#
# This script:
# 1. Stops containers
# 2. Creates new pip-data volume
# 3. Copies database from zero-agent-data to pip-data
# 4. Renames database file from zero-agent.db to pip.db
# 5. Starts containers with new volume

set -e

echo "🔄 Migrating from zero-agent to pip naming..."
echo ""

# Stop containers
echo "🛑 Stopping containers..."
docker stop pip-app pip-mcp 2>/dev/null || true
echo ""

# Create new volume if it doesn't exist
echo "📦 Creating pip-data volume..."
docker volume create pip-data 2>/dev/null || echo "  Volume already exists"

# Copy data using a temporary container
echo "📋 Copying data from zero-agent-data to pip-data..."
docker run --rm \
  -v zero-agent-data:/source:ro \
  -v pip-data:/dest \
  alpine sh -c "cp -av /source/. /dest/"

# Rename database file
echo "📝 Renaming database file..."
docker run --rm \
  -v pip-data:/data \
  alpine sh -c "
    if [ -f /data/zero-agent.db ]; then
      mv /data/zero-agent.db /data/pip.db
      echo '  Renamed zero-agent.db → pip.db'
    else
      echo '  Database already named pip.db or does not exist'
    fi
  "

echo ""
echo "✅ Migration complete!"
echo ""
echo "📌 Next steps:"
echo "  1. Update deploy/deploy.sh to use:"
echo "     - Volume: pip-data (instead of zero-agent-data)"
echo "     - DATABASE_PATH: /app/data/pip.db"
echo ""
echo "  2. Run: ./deploy/deploy.sh"
echo ""
echo "  3. Verify everything works"
echo ""
echo "  4. (Optional) Remove old resources:"
echo "     docker volume rm zero-agent-data"
echo "     docker network rm zero-agent-network"
