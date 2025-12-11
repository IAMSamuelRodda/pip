# Issues Tracking

> **Purpose**: Track **open** bugs, improvements, technical debt, and risks
> **Lifecycle**: Living (add when issues arise, remove when resolved)
> **Resolved Issues**: Move to `CHANGELOG.md` under [Unreleased] → "Resolved Issues" section

**Last Updated**: 2025-12-11 (Resolved issues migrated to CHANGELOG.md; see issues_051-056 there)

---

## Status Guide

| Status | Meaning |
|--------|---------|
| 🔴 Open | Issue identified, not yet started |
| 🟡 In Progress | Actively being worked on |
| 🟢 Resolved | Fixed and verified (move to CHANGELOG.md) |
| 🔵 Blocked | Cannot proceed due to external factors |
| ⚠️ Flagged | Needs decomposition or spike before implementation |

## Priority Guide

| Priority | Meaning |
|----------|---------|
| P0 | Critical - System broken, must fix immediately |
| P1 | High - Significant impact, fix this week |
| P2 | Medium - Should fix, can wait for next sprint |
| P3 | Low - Nice to have, backlog |

---

## Open Issues

### Known Issues (Low Priority)

#### issue_050: Tools Dropdown Z-Index Issue
**Status:** 🔴 Open
**Priority:** P3 (Low - Known issue in Claude.ai too)
**Component:** ChatInputArea - Tools dropdown
**Created:** 2025-12-10

**Description:**
Tools dropdown appears underneath sticky header when opening upward (near bottom of viewport), making top portion unusable. Z-index adjustment from 20 to 50 didn't resolve.

**Impact:**
Minor UX annoyance - users need to scroll up slightly before opening tools menu.

**Workaround:**
Scroll up before opening tools dropdown.

**Notes:**
- Same issue exists in Claude.ai's interface
- Likely requires DOM restructuring or React portal implementation
- Not worth fixing immediately given low impact

---

### Critical Issues

#### issue_053: Subscription Tier Infrastructure
**Status:** 🟡 In Progress (Schema done, Stripe integration pending)
**Priority:** P1 (High - Needed for sustainable monetization)
**Component:** `packages/core`, `packages/server` (subscription management)
**Created:** 2025-12-10
**Updated:** 2025-12-10

**Description:**
Design and implement subscription tier system to support freemium business model with BYOM (Bring Your Own Model) option.

**✅ COMPLETED (Dec 10):**
- Database schema: `subscription_tier` column on users table
- Types: `SubscriptionTier = 'free' | 'starter' | 'pro' | 'enterprise'`
- User getter/setter functions updated
- Auto-migration from `is_admin` to `role='superadmin'`

**Proposed Tier Structure:**

**Free/Open Source Tier:**
- Bring your own Anthropic API key OR local Ollama models
- No hosted model access
- Full feature access (MCP, memory, tools)
- Self-hosted deployment option

**Starter Tier ($19/month):**
- Daily rate limits on hosted models (Opus, Sonnet, Haiku)
- No BYOM required
- Hosted deployment
- Email support

**Pro Tier ($49/month):**
- Higher rate limits
- Priority model access
- Priority support
- Advanced features (custom skills, team sharing)

**Enterprise Tier (Custom):**
- Unlimited usage or custom limits
- Dedicated infrastructure
- SLA guarantees
- Custom integrations

**Technical Requirements:**
1. User tier field in database
2. Subscription management (Stripe integration?)
3. Tier-based feature flags
4. API key management for BYOM users
5. Usage analytics per tier

**Acceptance Criteria:**
- [ ] Database schema supports tier management
- [ ] Stripe integration for payments (or alternative)
- [ ] Tier enforcement in agent orchestrator
- [ ] BYOM flow for free tier users
- [ ] Admin panel for subscription management

**Complexity:** 4.5/5 (High - new business logic + payment integration)

**Dependencies:**
- issue_052 (rate limiting) - ✅ Complete

---

### High Priority Issues

---

### Medium Priority Issues

#### issue_036: Collapsible Thinking + Tool Call Visibility
**Status:** 🔴 Open
**Priority:** P2 (Medium - UX improvement)
**Component:** \`packages/pwa-app/src/components/ChatMessage.tsx\`
**Created:** 2025-12-03

**Description:** Add collapsible \`<think>...</think>\` blocks and tool call data visibility following Claude Code pattern

**Requirements:**
- Detect and render \`<think>\` blocks as collapsible sections (default: collapsed)
- Show tool calls with input/output data (for debugging)
- Preserve markdown rendering for non-thinking content

**Complexity:** 2.0/5 (Low-Medium - UI enhancement)

---

### Feature Requests / Improvements

#### issue_037: Intelligent Business vs Personal Expense Separation
**Status:** ⚠️ Flagged (VISION STAGE)
**Priority:** P3 (Future - Milestone 3+)
**Component:** New feature
**Created:** 2025-12-09

**Description:** Enable sole traders to answer "What can I actually spend?" by separating business/personal transactions and reserving tax money.

**Target Users:** Sole traders operating from mixed personal/business accounts

**Core Capabilities:**
- Transaction categorization (business vs personal)
- Tax reservation tracking
- Available balance calculation
- Smart expense detection (patterns, learning)

**Status:** Vision-stage planning complete. Requires spikes before implementation.

**Blueprint:** \`specs/BLUEPRINT-feature-expense-separation-20251209.yaml\`

**Complexity:** TBD (requires spike - likely 4.0+/5)

---

#### issue_034: Skills System - Report Templates & Agent Capabilities
**Status:** ⚠️ Flagged (Spike Required)
**Priority:** P1 (High - core value prop)
**Component:** `packages/agent-core`
**Created:** 2025-12-02
**Updated:** 2025-12-10

**Description:** Implement agent skills/capabilities system for report templates and specialized workflows

**Examples:**
- "Generate monthly financial summary" → Load reporting skill
- "Tax time prep" → Load tax preparation skill
- "Overdue invoice follow-up" → Load collections skill

**Requirements:**
- Skill definition schema (YAML or JSON)
- Skill loading system
- Prompt injection for skill context
- UI for skill selection/activation

**⚠️ SPIKE REQUIRED: Skill Schema Design**
- **Uncertainty**: High (4/5) - unclear whether to use MCP skill format or custom schema
- **Options to explore**:
  1. MCP-compatible skill format (reuse existing patterns from Claude Code skills)
  2. Custom YAML schema optimized for Pip's bookkeeping domain
  3. Hybrid approach with MCP compatibility layer
- **Spike deliverables**: Schema proposal, example skills, integration approach
- **Estimated spike duration**: 1 day

**Complexity:** 3.8/5 (High - new subsystem, needs decomposition)

**Blueprint Reference:** `specs/BLUEPRINT-feature-m2-completion-20251210.yaml` (feature_1_3)

---

#### issue_057: Invite Codes with Pre-defined Flags
**Status:** 🔴 Open
**Priority:** P2 (Medium - improves onboarding workflow)
**Component:** `packages/core/src/database`, `packages/server/src/routes/user-auth.ts`
**Created:** 2025-12-11

**Description:** Enhance invite code system to automatically apply pre-defined feature flags and subscription tiers when a user signs up with a specific code.

**Current State:**
- Invite codes only validate access to signup
- Flags/tiers must be manually assigned via SQL after signup

**Proposed Enhancement:**
```sql
-- New columns for invite_codes table
ALTER TABLE invite_codes ADD COLUMN feature_flags TEXT DEFAULT '[]';
ALTER TABLE invite_codes ADD COLUMN subscription_tier TEXT DEFAULT 'free';
ALTER TABLE invite_codes ADD COLUMN role TEXT DEFAULT 'user';
```

**Example Use Cases:**
- `BETA-2025` → Applies `["beta_tester"]` flag automatically
- `EARLY-ACCESS` → Applies `["early_access", "beta_tester"]` flags
- `STARTER-PROMO` → Sets `subscription_tier = 'starter'`

**Requirements:**
- Add flag/tier columns to `invite_codes` table
- Update signup flow to copy flags/tier from invite code to new user
- Admin UI to create invite codes with specific flags (future)

**Complexity:** 2.0/5 (Low-Medium - schema change + signup logic)

---

#### issue_016: Light/Dark Mode Theme Support
**Status:** 🔴 Open
**Priority:** P3 (Low - nice to have)
**Component:** \`packages/pwa-app\`
**Created:** 2025-12-01

**Description:** Add theme toggle for light/dark mode (currently dark mode only)

**Requirements:**
- Theme toggle in Settings
- Light theme CSS variables
- Persist theme preference in localStorage
- Respect system preference (prefers-color-scheme)

**Complexity:** 2.0/5 (Low-Medium - CSS/state management)

---

#### issue_017: Ollama Model Warm-Up Strategy
**Status:** 🔴 Open
**Priority:** P3 (Low - optimization)
**Component:** \`packages/agent-core\`
**Created:** 2025-12-01

**Description:** First request to Ollama model has ~10s delay while model loads. Implement warm-up strategy.

**Options:**
1. Background ping on server start (simple but wastes resources)
2. Warm up on first user login (better UX)
3. LRU cache with auto-unload (complex but optimal)

**Complexity:** 2.5/5 (Medium - depends on approach)

---

### Technical Debt

#### debt_004: ESLint v9 Flat Config Migration
**Status:** 🔴 Open
**Priority:** P3 (Low - deferred)
**Component:** Build tooling
**Created:** 2025-12-01

**Description:** Migrate from eslintrc to flat config (ESLint v9)

**Rationale for Deferral:** Current config works, migration provides no immediate value

**Complexity:** 1.5/5 (Low - mechanical change)

---

#### issue_024: DESIGN.md Visual Reference Workflow
**Status:** 🔴 Open
**Priority:** P3 (Low - future)
**Component:** Documentation
**Created:** 2025-12-02

**Description:** Establish workflow for visual design references (screenshots, mockups)

**Problem:** DESIGN.md becomes stale as UI evolves
**Proposed:** Move to wiki or use screenshot-based system with version tags

**Complexity:** 1.0/5 (Low - process change)

---

## Archive Policy

**Resolved issues** should be moved to \`CHANGELOG.md\` under [Unreleased] → "Resolved Issues (Migrated from ISSUES.md)" section with:
- Root cause analysis
- Key learnings and patterns
- File references and commit hashes

This keeps ISSUES.md focused on current work while preserving historical context in CHANGELOG.

---

**See Also:**
- \`CHANGELOG.md\` - Resolved issues with learnings and patterns
- \`STATUS.md\` - Current sprint focus and recently completed work
- \`PROGRESS.md\` - Detailed task tracking
