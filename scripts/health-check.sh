#!/bin/bash
# Check health of local or VPS deployment
# Usage: ./scripts/health-check.sh [local|vps]
#
# Arguments:
#   local   Check localhost:3000 and localhost:3001 (default)
#   vps     Check app.pip.arcforge.au and mcp.pip.arcforge.au

set -e

ENV=${1:-local}

echo "🏥 Health Check ($ENV)"
echo ""

check_endpoint() {
  local url=$1
  local name=$2

  if curl -sf "$url" > /dev/null 2>&1; then
    echo "✅ $name: healthy"
    return 0
  else
    echo "❌ $name: not responding"
    return 1
  fi
}

if [ "$ENV" == "local" ]; then
  echo "Checking local development servers..."
  echo ""

  check_endpoint "http://app.pip.localhost:3000/health" "PWA (app.pip.localhost:3000)"
  check_endpoint "http://mcp.pip.localhost:3001/health" "MCP (mcp.pip.localhost:3001)"

elif [ "$ENV" == "vps" ]; then
  echo "Checking production VPS..."
  echo ""

  check_endpoint "https://app.pip.arcforge.au/health" "PWA (app.pip.arcforge.au)"
  check_endpoint "https://mcp.pip.arcforge.au/health" "MCP (mcp.pip.arcforge.au)"

else
  echo "❌ Unknown environment: $ENV"
  echo ""
  echo "Usage: ./scripts/health-check.sh [local|vps]"
  exit 1
fi

echo ""
echo "Done."
