#!/bin/bash
# Start local development environment
# Usage: ./scripts/dev.sh [--docker]
#
# Options:
#   (default)  Use pnpm dev (fast reload, recommended)
#   --docker   Use Docker Compose (slower, matches VPS config exactly)

set -e

cd "$(dirname "$0")/.."

echo "🚀 Starting Pip local development..."
echo ""

if [[ "$1" == "--docker" ]]; then
  echo "📦 Using Docker (matches VPS config)..."
  echo ""

  if [ ! -f docker-compose.yml ]; then
    echo "❌ docker-compose.yml not found"
    exit 1
  fi

  docker compose up --build
else
  echo "⚡ Using pnpm dev (fast reload)..."
  echo ""
  echo "📍 Endpoints:"
  echo "   PWA:  http://app.pip.localhost:3000"
  echo "   MCP:  http://mcp.pip.localhost:3001"
  echo ""
  echo "💡 Using .localhost subdomains for easy identification"
  echo "   (resolves to 127.0.0.1 automatically)"
  echo ""

  pnpm dev
fi
