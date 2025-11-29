# Pip Safety Architecture

> **Purpose**: Design document for Xero API safety guardrails
> **Status**: Draft
> **Last Updated**: 2025-11-29

---

## Problem Statement

Xero has **no user-accessible restore functionality**. Once data is voided, deleted, or incorrectly modified, it cannot be undone through Xero's interface or API. Third-party backup services exist but have significant limitations.

An AI agent with unrestricted write access could cause catastrophic damage:
- Void all invoices (lose accounts receivable history)
- Delete contacts (lose customer/supplier relationships)
- Incorrectly allocate payments (accounting errors)
- Create fraudulent invoices

**User trust is paramount** - businesses will not adopt Pip if there's any risk of data destruction.

---

## Design Principles

1. **Read-only by default** - Write operations are opt-in
2. **Graduated permissions** - Users control exactly what Pip can do
3. **Pre-operation snapshots** - Capture state before any write
4. **Explicit confirmation** - Destructive operations require human approval
5. **Audit everything** - Full trail of what Pip did and why

---

## Tiered Permission Model

### Level 0: Read-Only (Default)

**Risk**: None
**Operations**: All current get_* and search_* tools

| Tool | Category | Risk |
|------|----------|------|
| get_invoices | Invoices | None |
| get_aged_receivables | Invoices | None |
| get_aged_payables | Invoices | None |
| get_profit_and_loss | Reports | None |
| get_balance_sheet | Reports | None |
| get_bank_accounts | Banking | None |
| get_bank_transactions | Banking | None |
| get_contacts | Contacts | None |
| search_contacts | Contacts | None |
| get_organisation | Organisation | None |

### Level 1: Create Drafts (Low Risk)

**Risk**: Low - drafts don't affect accounting until approved
**Requires**: User enables "Allow Creating Drafts" in settings

| Tool | Description | Risk Level |
|------|-------------|------------|
| create_invoice_draft | Creates DRAFT invoice (not approved) | Low |
| create_contact | Creates new contact | Low |
| create_credit_note_draft | Creates DRAFT credit note | Low |

**Safeguards**:
- Drafts must be manually approved in Xero
- Cannot create AUTHORISED invoices directly
- Creates snapshot of operation for audit trail

### Level 2: Approve & Update (Medium Risk)

**Risk**: Medium - affects accounting records
**Requires**: User enables "Allow Approving/Updating" + confirmation dialog

| Tool | Description | Risk Level |
|------|-------------|------------|
| approve_invoice | Changes DRAFT → AUTHORISED | Medium |
| update_invoice | Modifies existing invoice | Medium |
| update_contact | Modifies contact details | Medium |
| record_payment | Records payment against invoice | Medium |

**Safeguards**:
- Pre-operation snapshot of affected entities
- Confirmation dialog showing exactly what will change
- Daily summary email of all write operations
- Rate limit: max 10 write operations per hour

### Level 3: Delete & Void (High Risk)

**Risk**: High - irreversible data loss
**Requires**: User enables "Allow Destructive Operations" + per-operation confirmation + optional 2FA

| Tool | Description | Risk Level |
|------|-------------|------------|
| void_invoice | Voids approved invoice (irreversible) | High |
| delete_draft_invoice | Deletes draft invoice | High |
| delete_contact | Removes contact from Xero | High |

**Safeguards**:
- Pre-operation full snapshot
- Explicit confirmation with entity details shown
- 10-second delay before execution (cancel window)
- Optional: require SMS/email verification code
- Cannot be triggered by AI alone - requires human click

---

## Pre-Operation Snapshot System

Before any Level 1+ operation, Pip captures the current state:

```typescript
interface OperationSnapshot {
  id: string;                    // UUID
  userId: string;                // Who authorized
  operationType: string;         // "create_invoice", "void_invoice", etc.
  permissionLevel: 1 | 2 | 3;    // Which tier
  entityType: string;            // "invoice", "contact", etc.
  entityId?: string;             // Xero ID (if updating existing)
  beforeState?: object;          // Full entity state before operation
  afterState?: object;           // Full entity state after operation
  requestedBy: "agent" | "user"; // Who initiated
  confirmedBy: "user";           // Always requires user confirmation
  timestamp: Date;
  success: boolean;
  errorMessage?: string;
}
```

**Storage**: SQLite table `operation_snapshots`
**Retention**: 90 days (configurable)

### Restoration Process

While Xero doesn't support true restore, Pip can help users manually fix issues:

1. User reports problem ("wrong invoice was voided")
2. Pip retrieves snapshot from before operation
3. Shows user exactly what changed
4. Provides guidance on manual correction in Xero
5. For Level 1 operations: can recreate draft automatically

---

## User-Facing Safety Controls

### Settings Page (PWA)

```
🔒 Safety Settings

Permission Level: [Read-Only ▼]
  ○ Read-Only (Default)
    Pip can only view your Xero data. No changes possible.

  ○ Create Drafts
    Pip can create draft invoices and contacts.
    Drafts must be manually approved in Xero.

  ○ Full Access
    Pip can approve, update, and void items.
    Each operation requires your confirmation.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Additional Protections:

☑ Require confirmation for all write operations
☑ Send daily email summary of changes
☐ Require 2FA for destructive operations
☐ Enable "vacation mode" (read-only until date)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Operation History: [View All →]
Last 7 days: 0 write operations
```

### MCP Tool Visibility

Based on permission level, MCP tools are dynamically shown/hidden:

- **Level 0**: Only read tools appear in tool list
- **Level 1**: Read + create_draft tools appear
- **Level 2+**: All tools appear, but execute with confirmation gates

This prevents agents from even attempting operations the user hasn't authorized.

---

## Agent Guardrails

### System Prompt Injection

For all AI interactions, inject safety context:

```
SAFETY RULES:
- User permission level: READ_ONLY
- You CANNOT modify any Xero data
- Do not suggest creating, updating, or deleting anything
- If user asks you to make changes, explain they need to enable
  write permissions in Pip settings first
```

### Tool-Level Validation

Every write tool checks:

```typescript
async function executeWriteTool(userId: string, tool: string, args: object) {
  // 1. Check permission level
  const level = await getUserPermissionLevel(userId);
  const requiredLevel = TOOL_PERMISSION_LEVELS[tool];

  if (level < requiredLevel) {
    return errorResult(
      `This operation requires "${LEVEL_NAMES[requiredLevel]}" permission. ` +
      `Your current level is "${LEVEL_NAMES[level]}". ` +
      `Enable higher permissions in Pip settings if you want to allow this.`
    );
  }

  // 2. Create pre-operation snapshot
  const snapshot = await createSnapshot(userId, tool, args);

  // 3. For Level 2+, require explicit confirmation
  if (requiredLevel >= 2) {
    return pendingConfirmationResult(snapshot.id, tool, args);
  }

  // 4. Execute operation
  return executeOperation(tool, args, snapshot);
}
```

---

## Implementation Phases

### Phase 1: Foundation (Current Priority)

1. Add `user_settings` table with `permission_level` column
2. Add `operation_snapshots` table
3. Add permission check to tool router
4. Add settings UI to PWA

### Phase 2: Create Tools

1. Implement `create_invoice_draft`
2. Implement `create_contact`
3. Add snapshot capture before operations
4. Add operation history view

### Phase 3: Update Tools

1. Implement `approve_invoice`
2. Implement `update_invoice`
3. Implement `update_contact`
4. Add confirmation dialog system

### Phase 4: Destructive Tools (Optional)

1. Implement `void_invoice`
2. Implement `delete_contact`
3. Add 2FA confirmation option
4. Add 10-second cancel window

---

## Testing Strategy

### Unit Tests

- Permission level checks
- Snapshot creation/retrieval
- Tool visibility based on level

### Integration Tests

- Full write operation flow with confirmation
- Snapshot restoration guidance
- Permission upgrade/downgrade

### Manual Testing Checklist

- [ ] Read-only user cannot see write tools
- [ ] Level 1 user can create drafts
- [ ] Level 2 operation shows confirmation
- [ ] Level 3 operation has delay + confirmation
- [ ] Snapshot captures correct before state
- [ ] Operation history shows all changes

---

## References

- [Xero API Invoices](https://developer.xero.com/documentation/api/accounting/invoices)
- [Xero Community - Backup and Restore](https://community.xero.com/developer/discussion/4699429)
- [Understanding Xero Data Restoration](https://control-c.com/docs/understanding-xero-data-restoration-what-you-need-to-know/)
- [Xero Audit Trail](https://www.quikk.co.uk/)

---

**Next Step**: Add to ISSUES.md and PROGRESS.md for tracking
