# Contributing to {{PROJECT_NAME}}

> **Purpose**: Workflow guide and progress tracking
> **Lifecycle**: Stable (update when processes change)

> **Technical setup**: See `DEVELOPMENT.md` for git workflow, pre-commit checklist, CI/CD

## Quick Start

```bash
[Setup command]
```

See [`DEVELOPMENT.md`](./DEVELOPMENT.md) for complete environment setup.

---

## Definition of Done

### Feature Development
- [ ] Feature implemented and tested
- [ ] Tests written and passing
- [ ] Documentation updated
- [ ] PR reviewed and merged

### Bug Fixes
- [ ] Root cause documented
- [ ] Test written that reproduces bug
- [ ] Fix implemented
- [ ] Issue updated with notes

---

## Progress Tracking

**Tool**: [GitHub Issues | Jira | Linear | Other]

**Hierarchy**: [Optional - describe issue structure if using hierarchical tracking]

**Commands**:
```bash
# View current work
[command]

# Mark in progress
[command]

# Mark complete
[command]
```

---

## Workflow

### Starting Work
```bash
# Always branch from dev (NOT main)
git checkout dev
git pull origin dev
git checkout -b feature/[feature-name]  # or fix/, sync/, etc.

# Update issue status
[command]
```

### Completing Work
```bash
# Commit with issue reference
git commit -m "[type]: [description]

Closes #[issue-number]"

# Push and create PR targeting dev branch
git push -u origin feature/[feature-name]
gh pr create --base dev --head feature/[feature-name]

# ⚠️ IMPORTANT: PR must target 'dev' branch, NOT 'main'
# CI will reject PRs to main from feature branches
```

### Releasing to Production
```bash
# After staging testing is complete, create dev → main PR
gh pr create --base main --head dev --title "Release v[version]"

# ✅ This is the ONLY way to get code into main
# PRs from any other branch will be rejected by CI
```

### Marking Blocked
```bash
# Mark blocked with reason
[command]
```

---

## Git Workflow

**Branching Strategy**: Three-Tier with Aggressive Branch Protection

```
feature/fix/sync branches
         ↓  (PR only)
      dev branch → staging environment
         ↓  (PR only - main ONLY accepts PRs from dev)
     main branch → production environment
```

**Critical Rules** (enforced by CI/CD):
- ⛔ **main branch**: ONLY accepts PRs from `dev` branch (all other PRs rejected)
- ⛔ **dev branch**: ONLY accepts PRs from feature/fix/sync branches (no direct commits)
- ⚠️ **No direct commits** to dev or main allowed

**Why this matters**: These rules prevent accidental production deployments and ensure all code goes through staging testing first.

See [`DEVELOPMENT.md`](./DEVELOPMENT.md) for complete git workflow, branch protection setup, and CI/CD details.

---

## Best Practices

1. **Check current state** before starting
2. **Update status** when you begin work
3. **Comment on progress** regularly
4. **Link commits to issues** (use `Closes #N` or `Relates to #N`)

---

**Last Updated**: {{DATE}}
