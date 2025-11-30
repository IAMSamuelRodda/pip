# Development Workflow

> **Purpose**: Git workflow, CI/CD pipelines, and pre-commit checklist
> **Lifecycle**: Stable (update when processes change)

---

## Git Workflow

**Model**: Simple (main only)

Fast prototyping phase - direct commits to main, manual VPS deployment.

### Development Flow

```bash
# Start work
git pull origin main

# Develop and commit directly to main
git add .
git commit -m "[type]: description"
git push origin main

# Deploy to VPS (manual)
ssh root@170.64.169.203 "cd /opt/pip && git pull && docker compose up -d --build"

# Verify deployment
curl https://app.pip.arcforge.au/health
curl https://mcp.pip.arcforge.au/health
```

### Commit Message Types
- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `refactor:` - Code changes that neither fix bugs nor add features
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

### When to Upgrade to Standard Tier (main + dev)
- Multiple developers need release isolation
- Production stability becomes critical
- Need staging environment for testing

See `CONTRIBUTING.md` for workflow tier definitions

---

## Pre-Commit Checklist

Before every commit:

```bash
# 1. Lint
pnpm lint

# 2. Run tests
pnpm test

# 3. Build to verify compilation
pnpm build

# 4. Review changes
git diff --staged

# 5. Verify commit message includes issue reference (if applicable)
```

---

## CI/CD Workflows

### Current State: Manual Deployment

Simple tier uses manual VPS deployment (no automated CI/CD pipelines yet).

```bash
# Deploy to production VPS
ssh root@170.64.169.203 "cd /opt/pip && git pull && docker compose up -d --build"
```

### Future: Automated Workflows

When upgrading to Standard tier, add these workflows:

| Workflow | Triggers | Purpose |
|----------|----------|---------|
| **validate.yml** | All pushes | Linting, formatting, type checking |
| **test.yml** | All pushes | Unit + integration tests |
| **deploy.yml** | Push to main | Build + deploy to VPS |

### Branch Protection (When Needed)

**enforce-main-pr-source.yml** - For Standard tier
- Enforce main ONLY accepts PRs from `dev`
- Not needed for Simple tier (direct commits)

---

## Environment Setup

### Prerequisites
- Node.js 20+
- pnpm 9+ (`npm install -g pnpm`)
- Xero Developer Account (for OAuth credentials)
- Anthropic API Key (for LLM)

### Installation
```bash
# Install dependencies
pnpm install

# Configure environment
cp .env.example .env
# Edit .env with your API keys and credentials

# Start development servers
pnpm dev
```

---

## Testing

### Unit Tests
```bash
pnpm test
```

### E2E Tests
```bash
# Not yet implemented - see debt_001 in ISSUES.md
```

### Test Organization
- Unit tests: `packages/*/src/**/*.test.ts`
- E2E tests: `packages/*/e2e/**/*.spec.ts` (planned)

---

## Troubleshooting

### Common Issues

**pnpm install fails with peer dependency errors**
```bash
# Use --shamefully-hoist flag
pnpm install --shamefully-hoist
```

**Docker build fails on Apple Silicon**
```bash
# Build for linux/amd64
docker build --platform linux/amd64 -t pip-app .
```

**Xero OAuth callback fails**
```bash
# Ensure XERO_REDIRECT_URI matches your callback URL
# Check service worker isn't intercepting /auth/callback
```

---

**Last Updated**: 2025-12-01
