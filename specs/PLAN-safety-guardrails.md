# Safety Guardrails Implementation Plan

> **Purpose**: Actionable implementation plan for safety guardrails
> **Branch**: `feature/safety-guardrails`
> **Design Doc**: `specs/SAFETY-ARCHITECTURE.md`
> **Status**: Ready for implementation
> **Can run in parallel with**: Memory branches

---

## Overview

Implement tiered permission model to protect Xero data from accidental AI destruction.
**Critical**: Xero has NO restore functionality. This must be done before ANY write operations.

---

## Phase 1: Database & Settings (Do First)

### task_1_1: Add user_settings table

**File**: `packages/mcp-remote-server/src/db/schema.ts` (or migrations)

```sql
CREATE TABLE user_settings (
  user_id TEXT PRIMARY KEY,
  permission_level INTEGER DEFAULT 0,  -- 0=read, 1=draft, 2=update, 3=delete
  require_confirmation BOOLEAN DEFAULT 1,
  daily_email_summary BOOLEAN DEFAULT 1,
  require_2fa_destructive BOOLEAN DEFAULT 0,
  vacation_mode_until TEXT,  -- ISO date, null = disabled
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

**Acceptance Criteria:**
- [ ] Migration created
- [ ] Default level 0 for all users
- [ ] CRUD functions for settings

### task_1_2: Add operation_snapshots table

**File**: `packages/mcp-remote-server/src/db/schema.ts`

```sql
CREATE TABLE operation_snapshots (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  operation_type TEXT NOT NULL,     -- 'create_invoice', 'void_invoice', etc.
  permission_level INTEGER NOT NULL,
  entity_type TEXT NOT NULL,        -- 'invoice', 'contact', etc.
  entity_id TEXT,                   -- Xero ID (null for creates)
  before_state TEXT,                -- JSON of entity before
  after_state TEXT,                 -- JSON of entity after
  requested_by TEXT NOT NULL,       -- 'agent' | 'user'
  confirmed_by TEXT,                -- 'user' (always)
  status TEXT DEFAULT 'pending',    -- 'pending' | 'confirmed' | 'executed' | 'failed' | 'cancelled'
  error_message TEXT,
  created_at INTEGER NOT NULL,
  executed_at INTEGER,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_snapshots_user ON operation_snapshots(user_id);
CREATE INDEX idx_snapshots_status ON operation_snapshots(status);
```

**Acceptance Criteria:**
- [ ] Migration created
- [ ] Snapshot service with create/get/update functions
- [ ] Auto-cleanup for records > 90 days

### task_1_3: Create settings service

**File**: `packages/mcp-remote-server/src/services/settings.ts`

```typescript
export interface UserSettings {
  userId: string;
  permissionLevel: 0 | 1 | 2 | 3;
  requireConfirmation: boolean;
  dailyEmailSummary: boolean;
  require2faDestructive: boolean;
  vacationModeUntil: Date | null;
}

export async function getUserSettings(userId: string): Promise<UserSettings>;
export async function updateUserSettings(userId: string, settings: Partial<UserSettings>): Promise<void>;
export async function getPermissionLevel(userId: string): Promise<number>;
```

**Acceptance Criteria:**
- [ ] Service created
- [ ] Returns defaults for users without settings row
- [ ] Vacation mode check (force level 0 if active)

---

## Phase 2: Permission Enforcement (Core)

### task_2_1: Define tool permission levels

**File**: `packages/mcp-remote-server/src/config/permissions.ts`

```typescript
export const TOOL_PERMISSIONS: Record<string, number> = {
  // Level 0 - Read only (default)
  get_invoices: 0,
  get_aged_receivables: 0,
  get_aged_payables: 0,
  get_profit_and_loss: 0,
  get_balance_sheet: 0,
  get_bank_accounts: 0,
  get_bank_transactions: 0,
  get_contacts: 0,
  search_contacts: 0,
  get_organisation: 0,
  // Memory tools - no Xero risk
  add_memory: 0,
  search_memory: 0,
  list_memories: 0,
  delete_memory: 0,
  clear_all_memories: 0,

  // Level 1 - Create drafts
  create_invoice_draft: 1,
  create_contact: 1,
  create_credit_note_draft: 1,

  // Level 2 - Approve & Update
  approve_invoice: 2,
  update_invoice: 2,
  update_contact: 2,
  record_payment: 2,

  // Level 3 - Delete & Void
  void_invoice: 3,
  delete_draft_invoice: 3,
  delete_contact: 3,
};

export const LEVEL_NAMES = {
  0: 'Read-Only',
  1: 'Create Drafts',
  2: 'Approve & Update',
  3: 'Full Access',
};
```

### task_2_2: Add permission check to tool router

**File**: `packages/mcp-remote-server/src/index.ts` (or new middleware)

Find the tool execution handler and add:

```typescript
async function executeToolWithPermissions(
  userId: string,
  toolName: string,
  args: Record<string, unknown>
): Promise<ToolResult> {
  // 1. Get required permission level
  const requiredLevel = TOOL_PERMISSIONS[toolName] ?? 0;

  // 2. Get user's permission level
  const userLevel = await getPermissionLevel(userId);

  // 3. Check permission
  if (userLevel < requiredLevel) {
    return {
      success: false,
      error: `This operation requires "${LEVEL_NAMES[requiredLevel]}" permission. ` +
             `Your current level is "${LEVEL_NAMES[userLevel]}". ` +
             `Enable higher permissions in Pip settings to allow this.`,
    };
  }

  // 4. For write operations (level 1+), create snapshot
  if (requiredLevel >= 1) {
    const snapshot = await createOperationSnapshot({
      userId,
      operationType: toolName,
      permissionLevel: requiredLevel,
      entityType: getEntityType(toolName),
      // beforeState captured inside if updating existing
    });

    // 5. For level 2+, return pending confirmation
    if (requiredLevel >= 2) {
      return {
        success: false,
        pendingConfirmation: true,
        snapshotId: snapshot.id,
        message: `This operation requires confirmation. Please confirm in the Pip app.`,
      };
    }
  }

  // 6. Execute the tool
  return executeToolDirectly(toolName, args);
}
```

**Acceptance Criteria:**
- [ ] Permission check runs before every tool
- [ ] Clear error message for insufficient permissions
- [ ] Snapshot created for all write operations

### task_2_3: Dynamic tool visibility

**File**: `packages/mcp-remote-server/src/index.ts`

Modify the `list_tools` response to filter based on permission level:

```typescript
// In the tools/list handler
const userLevel = await getPermissionLevel(userId);
const visibleTools = ALL_TOOLS.filter(tool =>
  TOOL_PERMISSIONS[tool.name] <= userLevel
);
```

**Acceptance Criteria:**
- [ ] Level 0 users only see read tools
- [ ] Level 1 users see read + create draft tools
- [ ] Higher levels see progressively more tools

---

## Phase 3: PWA Settings UI

### task_3_1: Settings page component

**File**: `packages/pwa-app/src/pages/Settings.tsx` (new or existing)

Create a settings page with:
- Permission level selector (radio buttons)
- Checkboxes for additional protections
- Operation history link
- Clear warning about what each level allows

### task_3_2: Settings API endpoint

**File**: `packages/mcp-remote-server/src/index.ts` (or routes file)

```typescript
// GET /api/settings - Get user settings
// PUT /api/settings - Update user settings
```

### task_3_3: Operation history page

**File**: `packages/pwa-app/src/pages/OperationHistory.tsx`

Show list of all write operations with:
- Date/time
- Operation type
- Entity affected
- Status (success/failed)
- Link to view snapshot details

---

## Phase 4: System Prompt Injection

### task_4_1: Add safety context to prompts

**File**: `packages/mcp-remote-server/src/index.ts` (system prompt section)

Inject based on permission level:

```typescript
function getSafetyPromptSection(level: number): string {
  if (level === 0) {
    return `
SAFETY RULES:
- User permission level: READ_ONLY
- You CANNOT modify any Xero data
- Do not suggest creating, updating, or deleting anything
- If user asks you to make changes, explain they need to enable
  write permissions in Pip settings first
`;
  }
  // ... other levels
}
```

---

## Testing Checklist

### Unit Tests
- [ ] Permission level lookup
- [ ] Tool permission mapping
- [ ] Snapshot creation
- [ ] Settings CRUD

### Integration Tests
- [ ] Read-only user blocked from write tools
- [ ] Level 1 user can create drafts
- [ ] Snapshot captures before state correctly

### Manual E2E Tests
- [ ] Settings UI saves correctly
- [ ] Permission change takes effect immediately
- [ ] Error messages are clear and helpful
- [ ] Operation history shows all changes

---

## File Locations Summary

| Task | Primary File(s) |
|------|-----------------|
| Database tables | `packages/mcp-remote-server/src/db/schema.ts` |
| Settings service | `packages/mcp-remote-server/src/services/settings.ts` |
| Permission config | `packages/mcp-remote-server/src/config/permissions.ts` |
| Tool router | `packages/mcp-remote-server/src/index.ts` |
| Settings UI | `packages/pwa-app/src/pages/Settings.tsx` |
| History UI | `packages/pwa-app/src/pages/OperationHistory.tsx` |

---

## Dependencies

- **None from memory branches** - can run in parallel
- Uses existing SQLite database
- Uses existing JWT auth

---

## Notes for Implementation Agent

1. **Start with Phase 1** - database tables are foundation
2. **Phase 2 is critical** - this is the actual safety enforcement
3. **Phase 3 can be minimal** - basic UI is fine for first iteration
4. **Phase 4 is important** - prevents AI from even suggesting forbidden ops

**Reference**: `specs/SAFETY-ARCHITECTURE.md` has full design details including:
- Confirmation flow diagrams
- Snapshot restoration process
- Rate limiting considerations

---

**Last Updated**: 2025-11-30
