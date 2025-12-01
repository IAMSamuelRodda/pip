# Spike M2-001: Cross-Project Reference Patterns Research

> **Spike**: spike_m2_001
> **Status**: Complete
> **Date**: 2025-12-01
> **Reduces Uncertainty For**: task_2_3_3_1, task_2_3_3_2

## Executive Summary

This research analyzed how existing tools handle cross-project/cross-entity data access. The key finding is that **explicit, read-only, owner-scoped access** is the safest and most common pattern. Pip should adopt a similar approach with a simple "project context" model.

**Recommendation**: Implement a hybrid approach combining Claude Code's `--add-dir` pattern with Notion's relation model - allow users to explicitly reference other projects in queries while maintaining strong isolation by default.

---

## Research Sources

### 1. Claude Code - Multi-Directory Support

**Source**: [Claude Code --add-dir Guide](https://claudelog.com/faqs/--add-dir/), [Anthropic Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices)

**Pattern**: Explicit directory addition to working context

| Feature | Implementation |
|---------|----------------|
| **Activation** | `--add-dir /path` flag or `/add-dir` command |
| **Scope** | Session-scoped (not persistent) |
| **Access** | Full read/write to added directories |
| **Isolation** | Directories remain separate, just accessible |

**Key Insights**:
- Users must **explicitly** add directories - no implicit cross-project access
- Multiple directories can be added: `--add-dir ../api --add-dir ../shared`
- Best practice: Use read-only access for reference, write only when intentional
- File system paths provide the abstraction layer

**Relevance to Pip**: High - this is the closest pattern to what we need. Users would explicitly add project context rather than having automatic cross-project access.

---

### 2. VS Code - Multi-Root Workspaces

**Source**: [VS Code Multi-Root Workspaces](https://code.visualstudio.com/docs/editing/workspaces/multi-root-workspaces), [ISE Developer Blog](https://devblogs.microsoft.com/ise/multi_root_workspaces_in_visual_studio_code/)

**Pattern**: Workspace configuration file listing multiple project roots

| Feature | Implementation |
|---------|----------------|
| **Configuration** | `.code-workspace` JSON file |
| **Settings** | Per-folder settings (resource-scoped only) |
| **Cross-Reference** | Requires symlinks for import paths |
| **Isolation** | Each folder has independent `.vscode` config |

**Key Insights**:
- Workspace file acts as **explicit declaration** of included projects
- Settings that affect the entire editor are ignored per-folder (only resource settings apply)
- Cross-folder references need explicit mechanisms (symlinks, relative paths)
- Good for viewing together, but true integration requires extra work

**Relevance to Pip**: Medium - the workspace file concept maps to a "project group" but VS Code's limitations around cross-folder references suggest we should keep it simple.

---

### 3. Notion - Linked Databases & Relations

**Source**: [Notion API Databases](https://developers.notion.com/docs/working-with-databases), [Notion Data Sources Help](https://www.notion.com/help/data-sources-and-linked-databases)

**Pattern**: Relation properties for cross-database links

| Feature | Implementation |
|---------|----------------|
| **Relation Property** | Links rows between two databases |
| **Linked Views** | Show database in multiple places (UI only) |
| **API Support** | Relations work, linked views do NOT |
| **Data Flow** | Edits propagate to source database |

**Key Insights**:
- Relations are **explicit connections** between specific items
- Linked database views are a UI convenience, not a data model feature
- API limitation: Cannot create linked database views programmatically
- All related databases must be shared with integration for API access

**Relevance to Pip**: Medium - the Relation concept maps to cross-project entity references, but Notion's API limitations show we should focus on query-time access rather than persistent links.

---

### 4. Xero - Multi-Organization

**Source**: [Xero API Overview](https://developer.xero.com/documentation/api/accounting/overview), [Multi-Entity Reporting Guide](https://www.alphapartners.co/blog/xero-consolidated-reporting-tools-software)

**Pattern**: Complete isolation with third-party consolidation

| Feature | Implementation |
|---------|----------------|
| **Organization Model** | Each entity = separate Xero org |
| **Cross-Org Access** | Not natively supported |
| **Consolidation** | Third-party apps (Joiin, Spotlight, dataSights) |
| **OAuth Scope** | Per-organization tokens |

**Key Insights**:
- Xero **deliberately isolates** organizations - this is a feature, not a bug
- Cross-org reporting requires explicit third-party integration
- OAuth tokens are scoped to single organization
- Users manage multiple orgs under one login, but data doesn't cross

**Relevance to Pip**: High - Xero's strict isolation is the model for Pip's Projects. Cross-project is an **opt-in enhancement**, not a default behavior.

---

### 5. SaaS Multi-Tenant Patterns

**Source**: [AWS Multi-Tenant Authorization](https://docs.aws.amazon.com/prescriptive-guidance/latest/saas-multitenant-api-access-authorization/introduction.html), [Azure SaaS Tenancy Patterns](https://learn.microsoft.com/en-us/azure/azure-sql/database/saas-tenancy-app-design-patterns)

**Pattern**: PAP/PDP/PEP authorization architecture

| Component | Purpose |
|-----------|---------|
| **PAP** (Policy Administration Point) | Where policies are stored and managed |
| **PDP** (Policy Decision Point) | Evaluates policies to reach authorization decision |
| **PEP** (Policy Enforcement Point) | Enforces the authorization decision |

**Key Insights**:
- Cross-tenant access is the **exception**, not the rule
- ABAC (Attribute-Based) or RBAC (Role-Based) for access decisions
- Data isolation is the primary concern
- Catalog/mapping required for cross-tenant queries
- Read-only cross-tenant is much safer than write access

**Relevance to Pip**: High - provides the theoretical framework for our permission model.

---

## Pattern Comparison

| Tool | Access Model | Activation | Scope | Write Access |
|------|--------------|------------|-------|--------------|
| Claude Code | Additive | Explicit command | Session | Full |
| VS Code | Workspace file | Configuration | Persistent | Full |
| Notion | Relation property | Per-item link | Persistent | Yes (propagates) |
| Xero | Isolated | Third-party only | N/A | N/A |
| SaaS Multi-tenant | Policy-based | Policy rules | Configurable | Policy-controlled |

---

## Recommendations for Pip

### Design Principles

1. **Default Isolation** (from Xero)
   - Projects are completely isolated by default
   - No automatic cross-project data leakage
   - Each project has independent memory, context, Xero tokens

2. **Explicit Activation** (from Claude Code)
   - User must explicitly request cross-project access
   - Session-scoped (not persistent) for safety
   - Clear syntax: "Compare with Project X" or explicit tool parameter

3. **Read-Only First** (from SaaS patterns)
   - Cross-project access is read-only by default
   - Writing to other projects requires additional confirmation
   - Prevents accidental data pollution

4. **Owner-Only Access** (from all patterns)
   - Only the project owner can reference their own projects
   - No shared project access in MVP
   - Simplifies permission model significantly

5. **Context Preservation** (from VS Code)
   - Current project context is preserved
   - Cross-project data is "brought in" as reference
   - Clear indication when viewing cross-project data

### Proposed Approach

**Option A: Query-Time Project Parameter** (Recommended for MVP)
```
"Compare revenue from [Project A] and [Project B]"
→ LLM extracts project names
→ API validates user owns both projects
→ Read-only query to both project memories
→ Response indicates data sources
```

**Option B: Explicit Context Addition** (Future enhancement)
```
User: /add-project "Client B"
Pip: "I can now see Client B's context (read-only). What would you like to compare?"
```

**Option C: Project Relations** (Deferred - complex)
```
Link Project A → Project B as "sister company"
Automatic cross-reference for related entities
```

### MVP Scope

For task_2_3_3_1 and task_2_3_3_2, implement **Option A**:
- Add optional `projectIds: string[]` parameter to `search_nodes` tool
- Validate all projects belong to current user
- Return results with `sourceProject` annotation
- Keep current project as default if not specified

---

## Uncertainty Assessment

| Question | Before | After | Evidence |
|----------|--------|-------|----------|
| Cross-project patterns exist? | 4 | 1 | Multiple tools have established patterns |
| API design approach? | 4 | 2 | Query-time parameter is simplest, proven by Claude Code |
| Permission model? | 4 | 2 | Owner-only + read-only covers 90% of use cases |
| UX complexity? | 3 | 2 | Explicit mention in natural language works |

**Overall uncertainty reduced from 4 → 2** ✅

---

## Next Steps

1. Design API with query-time project parameter
2. Build POC with cross-project memory search
3. Test UX with natural language project references
4. Document permission model and error handling

---

## References

- [Claude Code --add-dir Guide](https://claudelog.com/faqs/--add-dir/)
- [Anthropic Claude Code Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices)
- [VS Code Multi-Root Workspaces](https://code.visualstudio.com/docs/editing/workspaces/multi-root-workspaces)
- [Notion API Working with Databases](https://developers.notion.com/docs/working-with-databases)
- [Xero API Accounting Overview](https://developer.xero.com/documentation/api/accounting/overview)
- [AWS Multi-Tenant Authorization Guide](https://docs.aws.amazon.com/prescriptive-guidance/latest/saas-multitenant-api-access-authorization/introduction.html)
- [Azure SaaS Tenancy Patterns](https://learn.microsoft.com/en-us/azure/azure-sql/database/saas-tenancy-app-design-patterns)
