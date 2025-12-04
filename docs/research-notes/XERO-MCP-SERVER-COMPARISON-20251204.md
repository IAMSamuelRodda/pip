# Xero MCP Server Comparison: Official vs Pip

> **Purpose**: Compare XeroAPI/xero-mcp-server with Pip's MCP implementation
> **Created**: 2025-12-04
> **Decision**: Keep Pip's implementation (different purpose, unique value-add)

---

## Executive Summary

The official Xero MCP server is a **generic API wrapper** for Claude Desktop local use. Pip's MCP server is a **multi-tenant SaaS product** with memory, authentication, safety guardrails, and multi-platform support. They serve different purposes.

**Verdict**: **Keep Pip's implementation** - it provides unique value that the official server doesn't offer.

---

## Feature Comparison

| Feature | Xero Official MCP | Pip MCP Server |
|---------|-------------------|----------------|
| **Target Use Case** | Local Claude Desktop | SaaS (Claude.ai, ChatGPT, PWA) |
| **Deployment** | Local npx/node | Remote server (SSE transport) |
| **Multi-tenant** | No (single user) | Yes (JWT per user) |
| **Authentication** | Env vars / Custom Connection | OAuth 2.0 flow + user accounts |
| **Memory System** | None | Knowledge graph + user preferences |
| **Safety Guardrails** | None | Tiered permissions (read → delete) |
| **Gmail Integration** | No | Yes (4 tools) |
| **Response Formatting** | Raw JSON | Human-readable summaries |
| **Multi-platform** | Claude Desktop only | Claude.ai + ChatGPT + PWA |

---

## Tool Coverage Comparison

### Xero Official MCP (40+ tools)

**Read Operations**:
- `get_accounts`, `get_contacts`, `get_invoices`, `get_quotes`
- `get_credit_notes`, `get_items`, `get_tax_rates`, `get_payments`
- `get_profit_and_loss_report`, `get_balance_sheet`, `get_trial_balance`
- `get_aged_receivables`, `get_aged_payables`
- `get_bank_transactions`, `get_contact_groups`
- `get_organisation`

**Write Operations**:
- `create_contact`, `update_contact`
- `create_invoice`, `update_invoice` (draft only)
- `create_quote`, `update_quote` (draft only)
- `create_credit_note`, `update_credit_note` (draft only)
- `create_payment`

**Payroll (NZ/UK only)**:
- `get_employees`, `get_leave_records`, `get_leave_balances`
- `get_timesheets`, `create_timesheet`, `update_timesheet_line`
- `approve_timesheet`, `revert_timesheet`, `delete_timesheet`

### Pip MCP Server (10 Xero tools + 5 Memory + 4 Gmail)

**Xero Read Operations**:
- `get_invoices` - with status filtering, overdue detection
- `get_profit_and_loss` - with financial year defaults
- `get_balance_sheet` - summarized format
- `get_bank_accounts` - filtered to BANK type
- `get_bank_transactions` - with date ordering
- `get_contacts` - with type labels (customer/supplier)
- `search_contacts` - name-based search
- `get_organisation` - formatted summary
- `get_aged_receivables` - grouped by contact, overdue highlighting
- `get_aged_payables` - grouped by contact, overdue highlighting

**Memory Tools**:
- `add_memory`, `search_memory`, `list_memories`, `delete_memory`, `delete_all_memories`
- `read_memory`, `get_memory_summary`, `save_memory_summary`

**Gmail Tools**:
- `search_gmail`, `get_email_content`, `download_attachment`, `list_email_attachments`

---

## Key Differences

### 1. Architecture Philosophy

| Aspect | Xero Official | Pip |
|--------|---------------|-----|
| **Model** | API wrapper | AI assistant product |
| **Focus** | Complete API coverage | Curated user experience |
| **Output** | Raw data | Interpreted insights |

**Example - Aged Receivables**:

*Xero Official*: Returns raw report JSON with age buckets

*Pip*: Returns "Who owes you money" with contact names, amounts, overdue warnings, and totals

### 2. Authentication Model

**Xero Official**:
```bash
# Local environment variables
XERO_CLIENT_ID=xxx
XERO_CLIENT_SECRET=xxx
# OR
XERO_CLIENT_BEARER_TOKEN=xxx
```
- Single organization
- User manages credentials
- No multi-tenant support

**Pip**:
```
User → OAuth login → JWT token → Per-request tenant lookup
```
- Multi-tenant by design
- User accounts with invite codes
- Automatic token refresh
- Works across Claude.ai, ChatGPT, PWA

### 3. Safety Model

**Xero Official**: None
- Write operations available by default
- No confirmation flows
- No audit trail

**Pip**:
- Tiered permissions (Level 0-3)
- Default: Read-only
- Write operations require explicit opt-in
- Operation snapshots for recovery
- Dynamic tool visibility based on permission level

### 4. Memory & Context

**Xero Official**: Stateless
- No memory between sessions
- No user preferences
- No business context

**Pip**:
- Knowledge graph memory
- User preference tracking
- Business context injection
- Cross-session continuity

### 5. Platform Support

**Xero Official**: Claude Desktop only
- Local MCP (stdio transport)
- Requires local Node.js
- Single user

**Pip**: Multi-platform
- Remote MCP (SSE transport)
- Claude.ai (native MCP connector)
- ChatGPT (Developer Mode MCP)
- PWA (direct API)
- No local installation required

---

## When to Use Each

### Use Xero Official MCP When:
- You want local Claude Desktop integration
- You need write operations immediately
- You want complete API coverage
- Single user, single organization
- Development/testing workflows
- You're comfortable with env var configuration

### Use Pip When:
- You want SaaS-style deployment
- Multi-user/multi-tenant required
- Safety guardrails are important
- Memory and context matter
- Using Claude.ai or ChatGPT (not Claude Desktop)
- Want combined Xero + Gmail access
- Need human-readable responses

---

## What Pip Could Adopt from Xero Official

### Worth Considering

| Feature | Effort | Value | Priority |
|---------|--------|-------|----------|
| Trial Balance report | Low | Medium | P3 |
| Quote management | Medium | Medium | P3 |
| Credit note management | Medium | Medium | P3 |
| Items endpoint | Low | Low | P4 |
| Tax rates endpoint | Low | Low | P4 |

### Not Worth Adopting

| Feature | Reason |
|---------|--------|
| Payroll tools | NZ/UK only, limited market |
| Write operations | Safety concerns, requires approval flow |
| Contact groups | Niche use case |
| Raw JSON output | Pip's human-readable format is better UX |

---

## Conclusion

**The official Xero MCP server and Pip serve fundamentally different purposes.**

| Aspect | Xero Official | Pip |
|--------|---------------|-----|
| **Purpose** | API wrapper for developers | AI assistant for SMB users |
| **Audience** | Developers using Claude Desktop | End users on any platform |
| **Value Prop** | Complete Xero API access | Intelligent bookkeeping assistant |

**Recommendation**: Keep Pip's implementation. The unique value is:

1. **Multi-tenant SaaS architecture** - users don't manage credentials
2. **Memory system** - Pip "knows" the user across sessions
3. **Safety guardrails** - critical for write operations
4. **Human-readable output** - not raw JSON
5. **Multi-platform** - Claude.ai + ChatGPT + PWA
6. **Gmail integration** - combined financial + email context

The official Xero MCP is useful for **developers** who want direct Xero API access in Claude Desktop. Pip is a **product** for **SMB users** who want an AI bookkeeping assistant.

---

## Future Consideration

If Pip adds write operations, study the official server's approach:
- They limit updates to DRAFT status only
- No delete operations on critical resources
- Confirmation patterns could be adopted

But this is a "Phase 2" concern - Pip's read-only focus is correct for MVP.

---

## References

- [XeroAPI/xero-mcp-server](https://github.com/XeroAPI/xero-mcp-server)
- Pip MCP: `packages/mcp-remote-server/src/handlers/xero-tools.ts`
