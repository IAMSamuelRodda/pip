# Development Workflow

> **Purpose**: Git workflow, CI/CD pipelines, and pre-commit checklist
> **Lifecycle**: Stable (update when processes change)

---

## Git Branching Strategy

**Model**: Three-Tier with Aggressive Branch Protection

### Branch Structure & Environments

| Branch | Environment | Purpose | PR Source | Deployment Trigger |
|--------|-------------|---------|-----------|-------------------|
| `main` | **Production** | Stable releases only | ⚠️ ONLY from `dev` | `v*.*.*` tags |
| `dev` | **Staging** | Integration testing | feature/fix/sync/* | `staging-*` tags |
| `feature/*` | Local | Feature development | N/A | N/A |
| `fix/*` | Local | Bug fixes | N/A | N/A |
| `sync/*` | Local | Dependency updates | N/A | N/A |

### Critical Branch Protection Rules

**⛔ main branch** - ONLY accepts PRs from `dev`:
- Enforced by `.github/workflows/enforce-main-pr-source.yml`
- Any PR from feature/fix/sync branches → main will be REJECTED
- Prevents accidental production deployments

**⛔ dev branch** - ONLY accepts PRs from feature/fix/sync branches:
- Configure in GitHub: Settings → Branches → Branch protection rules
- Enable "Require pull request reviews before merging"
- Enable "Require status checks to pass before merging"

**Why these rules exist**: They ensure ALL code passes through staging testing before reaching production.

### Development Flow

```bash
# 1. Always branch from dev (NOT main)
git checkout dev
git pull origin dev
git checkout -b feature/add-user-auth

# 2. Develop and commit
git add .
git commit -m "feat: add user authentication

Implements login/logout flows with JWT tokens

Relates to #42"

# 3. Push and create PR to dev (NOT main)
git push -u origin feature/add-user-auth
gh pr create --base dev --head feature/add-user-auth

# 4. After PR approval and merge to dev:
#    - Code automatically deploys to staging environment
#    - Comprehensive E2E tests run on staging
#    - If tests pass, code is ready for production release

# 5. To release to production (maintainers only):
git checkout dev
git pull origin dev
gh pr create --base main --head dev --title "Release v1.2.0"
```

### Deployment Flow

```
feature branch → (PR) → dev branch
                           ↓
                    [Deploy to Staging]
                           ↓
                    [Comprehensive E2E Tests]
                           ↓
                    [Lighthouse Audits]
                           ↓
                (When ready for production)
                           ↓
dev branch → (PR) → main branch
                           ↓
                 [Deploy to Production]
                           ↓
                    [Smoke Tests Only]
                           ↓
                  [CloudWatch Monitoring]
```

### Merge Strategy
**Use**: `--merge` (preserve feature branch history)

**Reason**: Full commit history preserved for debugging and audit trails

---

## Pre-Commit Checklist

Before every commit:

```bash
# 1. Lint and format
[lint-command]
[format-command]

# 2. Run tests
[test-command]

# 3. Review changes
git diff --staged

# 4. Verify commit message includes issue reference
```

---

## CI/CD Workflows

### Branch Protection Enforcement

**enforce-main-pr-source.yml** - CRITICAL
- **Trigger**: Any PR to `main` branch
- **Purpose**: Enforce that main ONLY accepts PRs from `dev`
- **Action**: Rejects PRs from any other branch with helpful error message
- **Status**: ✅ Must be in place from project start

### Standard Workflows

| Workflow | Triggers | Purpose | Duration |
|----------|----------|---------|----------|
| **validate.yml** | All PRs + pushes to dev/main | Linting, formatting, security scans | ~2-3min |
| **test.yml** | All PRs + pushes to dev/main | Unit + integration tests | ~3-5min |
| **build.yml** | Push to main branch | Build Docker images, push to ECR | ~5-8min |
| **deploy-staging.yml** | Tags: `staging-*` | Deploy to staging + comprehensive E2E tests | ~10-15min |
| **deploy-prod.yml** | Tags: `v*.*.*` | Deploy to production + smoke tests | ~15-20min |

### Testing Strategy (Amazon-Style)

**Staging Environment** (comprehensive testing):
- ALL E2E tests run (complete test suite)
- Lighthouse performance audits
- Security scans
- Load testing (if applicable)
- **Goal**: Catch ALL bugs before production

**Production Environment** (minimal testing):
- ONLY smoke tests (authentication, health checks)
- Fast validation (< 2 minutes)
- Comprehensive tests already passed on staging
- **Goal**: Fast deployment + rollback capability

**Why this approach**: Staging validates quality, production prioritizes speed and stability.

---

## Environment Setup

### Prerequisites
- [Requirement 1]
- [Requirement 2]

### Installation
```bash
# Install dependencies
[install-command]

# Configure environment
[config-command]

# Start development servers
[start-command]
```

---

## Testing

### Unit Tests
```bash
[test-command]
```

### E2E Tests
```bash
[e2e-command]
```

### Test Organization
- Unit tests: [location/pattern]
- E2E tests: [location/pattern]

---

## Troubleshooting

### Common Issues

**[Issue 1]**
```bash
# Solution
[command]
```

**[Issue 2]**
```bash
# Solution
[command]
```

---

**Last Updated**: {{DATE}}
