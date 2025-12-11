#!/bin/bash
# Deploy to Production VPS
# Usage: ./scripts/deploy-vps.sh
#
# What this does:
# 1. Checks for uncommitted changes (prompts to commit)
# 2. Pushes to GitHub
# 3. SSHs to VPS and runs the deployment script
# 4. Runs health checks on production
#
# VPS: 170.64.169.203
# URLs: app.pip.arcforge.au, mcp.pip.arcforge.au

set -e

cd "$(dirname "$0")/.."

VPS_HOST="root@170.64.169.203"
VPS_PATH="/opt/pip"

echo "🚀 Deploy to Production VPS"
echo "   Target: $VPS_HOST"
echo ""

echo "🔍 Pre-flight checks..."
echo ""

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
  echo "❌ Uncommitted changes detected:"
  git status --short
  echo ""
  read -p "Would you like to commit these changes? (y/n) " -n 1 -r
  echo ""
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Enter commit message: " commit_msg
    git add -A
    git commit -m "$commit_msg

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
  else
    echo "❌ Cannot deploy with uncommitted changes. Please commit first."
    exit 1
  fi
fi

# Check for unpushed commits
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse @{u} 2>/dev/null || echo "none")

if [ "$LOCAL" != "$REMOTE" ]; then
  echo "📤 Pushing changes to remote..."
  git push origin main
  echo ""
fi

echo "✅ Local repo is clean and synced"
echo ""

# Deploy to VPS
echo "🌐 Connecting to VPS and deploying..."
ssh $VPS_HOST "cd $VPS_PATH && ./deploy/deploy.sh"

echo ""
echo "🏥 Running health checks..."
echo ""

# Health checks
sleep 3  # Give containers a moment to start

if curl -sf "https://app.pip.arcforge.au/health" > /dev/null 2>&1; then
  echo "✅ PWA (app.pip.arcforge.au): healthy"
else
  echo "❌ PWA (app.pip.arcforge.au): not responding"
fi

if curl -sf "https://mcp.pip.arcforge.au/health" > /dev/null 2>&1; then
  echo "✅ MCP (mcp.pip.arcforge.au): healthy"
else
  echo "❌ MCP (mcp.pip.arcforge.au): not responding"
fi

echo ""
echo "🎉 Deployment complete!"
