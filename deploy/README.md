# Deploy Directory

This directory contains **VPS-specific** deployment configurations and scripts.

## Contents

| File | Purpose |
|------|---------|
| `deploy.sh` | Main deployment script (runs ON VPS) |
| `Caddyfile` | Caddy reverse proxy config for pip-app |
| `Caddyfile.pip-mcp` | Caddy config for MCP server |
| `Caddyfile.snippet` | Shared Caddy snippets |
| `docker-compose.vps-integration.yml` | VPS Docker networking setup |
| `pip.service` | Systemd service definition |
| `DEPLOYMENT.md` | Detailed VPS setup instructions |

## Usage

**You should NOT run these scripts directly.**

Instead, use the scripts in `scripts/`:

```bash
# From your local machine:
./scripts/deploy-vps.sh    # Deploys to production VPS

# Direct VPS access (if needed):
ssh root@170.64.169.203 "cd /opt/pip && ./deploy/deploy.sh"
```

## Script Locations

| Location | Purpose |
|----------|---------|
| `scripts/dev.sh` | Start local development |
| `scripts/deploy-vps.sh` | Deploy to production (from local) |
| `scripts/health-check.sh` | Check server health |
| `deploy/deploy.sh` | Runs ON the VPS (internal) |

## Environment

- **VPS IP**: 170.64.169.203
- **VPS Path**: /opt/pip
- **Containers**: pip-app, pip-mcp
- **Network**: droplet_frontend (Caddy integration)
