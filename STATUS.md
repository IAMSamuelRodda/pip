# Pip - Project Status

> **Purpose**: Current state snapshot (2-week rolling window)
> **Lifecycle**: Living (update daily/weekly during active development)

**Last Updated**: 2025-11-30
**Current Phase**: Memory A/B Testing Setup
**Version**: 0.3.0

---

## Quick Overview

| Aspect | Status | Notes |
|--------|--------|-------|
| **MCP Server** | 🟢 | Live at mcp.pip.arcforge.au |
| **Claude.ai** | 🟢 | Fully validated |
| **ChatGPT** | 🟡 | Working, memory tools need testing |
| **Memory Stack** | 🔵 | A/B architecture implemented, needs deployment |
| **Safety Guardrails** | 🟢 | Complete (tiered permissions) |
| **PWA Frontend** | 🟢 | Live at app.pip.arcforge.au |
| **Xero Integration** | 🟢 | 10 READ-ONLY tools |
| **VPS Ollama** | 🟢 | Installed, nomic-embed-text ready |

**Legend**: 🟢 Good | 🟡 Attention | 🔴 Critical | 🔵 In Progress

---

## Current Focus

**Objective**: Deploy and test memory A/B architecture.

### Just Completed (2025-11-30)

1. **Branch Cleanup** ✅
   - Consolidated all feature branches into main
   - Deleted: `feature/safety-guardrails`, `feature/memory-mem0-ollama`, `feature/memory-mcp-native`
   - All code now in single `main` branch

2. **Memory A/B Architecture** ✅
   - Option A: `memory-mem0.ts` (mem0 + Claude LLM + Ollama embeddings)
   - Option B: `memory-native.ts` (MCP-native + local @xenova/transformers)
   - Router: `memory.ts` (selects via `MEMORY_VARIANT` env var)

3. **VPS Ollama Setup** ✅
   - Ollama installed as systemd service
   - `nomic-embed-text` model pulled (274MB, 768 dimensions)
   - Configured to listen on 0.0.0.0 for Docker access

### Pending Deployment

- Rebuild pip-mcp container with memory tools
- Test memory tools via Claude.ai
- Test memory tools via ChatGPT Dev Mode

---

## Test Plan

### Pre-Deployment Verification

```bash
# SSH to VPS
ssh root@170.64.169.203

# 1. Verify Ollama is running
systemctl status ollama
curl http://localhost:11434/api/tags
# Expected: {"models":[{"name":"nomic-embed-text:latest"...}]}

# 2. Test embedding generation
curl http://localhost:11434/api/embeddings -d '{"model":"nomic-embed-text","prompt":"test"}'
# Expected: {"embedding":[...768 floats...]}
```

### Deployment Steps

```bash
# On VPS
cd /opt/pip && git pull origin main && source .env

# Rebuild container
docker build -t pip-mcp:latest -f packages/mcp-remote-server/Dockerfile .

# Restart with memory config
docker stop pip-mcp && docker rm pip-mcp
docker run -d --name pip-mcp --restart unless-stopped \
  --network droplet_frontend \
  --add-host=host.docker.internal:host-gateway \
  -v zero-agent-data:/app/data \
  -e NODE_ENV=production \
  -e MCP_PORT=3001 \
  -e DATABASE_PATH=/app/data/zero-agent.db \
  -e XERO_CLIENT_ID=$XERO_CLIENT_ID \
  -e XERO_CLIENT_SECRET=$XERO_CLIENT_SECRET \
  -e JWT_SECRET=$JWT_SECRET \
  -e BASE_URL=https://mcp.pip.arcforge.au \
  -e ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY \
  -e OLLAMA_BASE_URL=http://host.docker.internal:11434 \
  -e MEMORY_VARIANT=mem0 \
  pip-mcp:latest

# Verify health
curl https://mcp.pip.arcforge.au/health
```

### Post-Deployment Tests

| Test | Command/Action | Expected Result |
|------|----------------|-----------------|
| **Health check** | `curl https://mcp.pip.arcforge.au/health` | `{"status":"ok"}` |
| **Container logs** | `docker logs pip-mcp --tail 20` | No errors, memory init logs |
| **Ollama from container** | `docker exec pip-mcp wget -qO- http://host.docker.internal:11434/api/tags` | Model list JSON |

### Memory Tool Tests (Claude.ai)

1. **Connect to MCP**: Settings → Connectors → mcp.pip.arcforge.au
2. **Refresh connection** to get new tools
3. **Verify tools visible**: Should see `memory` category in `get_tools_in_category`

| Test | Prompt | Expected |
|------|--------|----------|
| **Add memory** | "Use add_memory to remember I prefer invoices on Mondays" | Confirmation, logs show `[Memory] Added 1 memories` |
| **Search memory** | "Use search_memory to find my invoice preferences" | Returns the Monday preference |
| **List memories** | "Use list_memories to show everything you know about me" | Shows all stored memories |
| **Delete memory** | "Use delete_memory to remove [memory_id]" | Confirmation of deletion |

### Memory Tool Tests (ChatGPT Dev Mode)

1. **Disconnect and reconnect** the Pip connector
2. **Explicitly request tool usage**: "Use the add_memory tool to..."
3. **Check if tools appear** in connector settings

| Test | Expected (Option A) | Expected (Option B) |
|------|---------------------|---------------------|
| Tool visibility | May be limited | Full visibility |
| Memory add | May timeout | Should work |
| Memory search | May timeout | Should work |

---

## Deployment Status

| Service | URL | Health |
|---------|-----|--------|
| PWA | https://app.pip.arcforge.au | 🟢 |
| MCP Server | https://mcp.pip.arcforge.au | 🟢 (needs redeploy for memory) |
| Landing Page | https://pip.arcforge.au | ⚪ Pending |

**VPS**: DigitalOcean Sydney (170.64.169.203)
**Containers**: pip-app (384MB), pip-mcp (256MB)
**Ollama**: Running as systemd service (~550MB with model loaded)

---

## Known Issues

| ID | Priority | Summary | Status |
|----|----------|---------|--------|
| issue_008 | P1 | Memory architecture decision | ✅ Resolved (A/B implemented) |
| issue_005 | P2 | ChatGPT memory in Dev Mode | Testing needed |
| issue_004 | P3 | Safety guardrails - settings UI | Deferred |

---

## Recent Achievements (Last 2 Weeks)

### 2025-11-30
- Branch cleanup: consolidated 3 feature branches into main
- Memory A/B architecture implemented (mem0 + native options)
- VPS Ollama installed and configured
- Fixed mem0ai TypeScript error (`url` vs `ollamaBaseUrl`)
- Memory router created for variant selection

### 2025-11-29
- Safety architecture implemented (tiered permissions)
- ChatGPT integration validated
- Xero tools audit complete (10 tools hardened)
- Full rebrand: zero-agent → pip

### 2025-11-28
- User authentication with invite codes
- Business context layer (document upload)
- Demo completed with dental practice owner

---

## Next Steps

1. **Deploy memory-enabled container** to VPS
2. **Run test plan** above
3. **If Option A fails with ChatGPT**: Test Option B (`MEMORY_VARIANT=native`)
4. **Document results** for A/B comparison

---

## References

- `PROGRESS.md` - Detailed task tracking
- `ISSUES.md` - Bug and improvement tracking
- `ARCHITECTURE.md` - System design and ADRs
- `CHANGELOG.md` - Release history
- `specs/BLUEPRINT-feature-memory-ab-testing-20251130.yaml` - A/B test spec
- `specs/PLAN-memory-mem0-ollama.md` - Option A details
- `specs/PLAN-memory-mcp-native.md` - Option B details

---

**Archive Policy**: Items older than 2 weeks move to CHANGELOG.md [Unreleased] section.
