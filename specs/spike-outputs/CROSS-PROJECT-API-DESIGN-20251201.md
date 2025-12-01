# Cross-Project API Design

> **Spike**: spike_m2_001
> **Status**: Complete
> **Date**: 2025-12-01
> **Implements**: task_2_3_3_1 (Design cross-project API)

## Overview

This document specifies the API design for cross-project data access in Pip. Based on research into Claude Code, VS Code, Notion, Xero, and SaaS multi-tenant patterns, we adopt a **query-time project parameter** approach with **owner-only, read-only** access.

---

## Design Principles

| Principle | Implementation |
|-----------|----------------|
| **Default Isolation** | Projects are isolated by default; cross-project is opt-in |
| **Explicit Activation** | User must explicitly reference other projects |
| **Read-Only Access** | Cross-project queries are read-only |
| **Owner-Only** | Users can only reference their own projects |
| **Context Preservation** | Current project remains primary; cross-project is supplementary |

---

## Permission Model

### Access Control

```typescript
interface CrossProjectPermission {
  // Who can access cross-project data
  access: 'owner-only';  // MVP: Only project owner

  // What operations are allowed
  operations: 'read';    // MVP: Read-only

  // Scope of cross-project access
  scope: 'memory' | 'all';  // MVP: Memory only
}
```

### Validation Flow

```
1. User requests cross-project query
2. Extract target project IDs from request
3. Validate:
   a. User owns current project ✓
   b. User owns all target projects ✓
   c. Operation is read-only ✓
4. Execute query across projects
5. Return results with source annotations
```

### Error Responses

| Error | HTTP Status | Message |
|-------|-------------|---------|
| Project not found | 404 | `Project '{id}' not found` |
| Not owner | 403 | `You don't have access to project '{id}'` |
| Write attempt | 403 | `Cross-project write operations are not allowed` |
| Too many projects | 400 | `Maximum 5 projects per cross-project query` |

---

## API Specification

### Option 1: Extended Memory Tools (Recommended)

Extend existing `search_nodes` tool with optional `projectIds` parameter.

#### search_nodes (Extended)

```typescript
{
  name: "search_nodes",
  description: `Search for entities by name or observation content.
ALWAYS call this before answering questions about the user's business, team, or goals.
Optionally search across multiple projects for comparison.`,
  inputSchema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "Search query"
      },
      limit: {
        type: "number",
        description: "Max results per project (default: 10)"
      },
      projectIds: {
        type: "array",
        items: { type: "string" },
        description: "Optional: Search across these projects (user must own all). Omit for current project only.",
        maxItems: 5
      }
    },
    required: ["query"]
  }
}
```

#### Response Format (Cross-Project)

```typescript
interface CrossProjectSearchResult {
  results: {
    projectId: string;
    projectName: string;
    entities: Entity[];
  }[];
  totalResults: number;
  projectsSearched: number;
}
```

#### Example Usage

**Single Project (Default)**:
```json
{
  "query": "revenue goals"
}
// Searches current project only
```

**Cross-Project**:
```json
{
  "query": "revenue goals",
  "projectIds": ["proj_abc123", "proj_def456"]
}
// Searches specified projects, validates ownership
```

---

### Option 2: Dedicated Cross-Project Tool (Alternative)

Separate tool for explicit cross-project operations.

#### cross_project_search

```typescript
{
  name: "cross_project_search",
  description: `Search memory across multiple projects for comparison.
Use when user wants to compare data between projects/clients.
All projects must be owned by the current user.`,
  inputSchema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "Search query"
      },
      projectIds: {
        type: "array",
        items: { type: "string" },
        description: "Projects to search (2-5 projects)",
        minItems: 2,
        maxItems: 5
      },
      includeCurrentProject: {
        type: "boolean",
        default: true,
        description: "Include current project in search"
      }
    },
    required: ["query", "projectIds"]
  }
}
```

**Pros**: Explicit intent, clearer separation
**Cons**: Tool proliferation, more to learn

---

### Option 3: Project Context Command (Future)

Add project context to session (like Claude Code's `--add-dir`).

#### MCP Resource: project_context

```typescript
// Add project context
POST /api/session/projects
{
  "projectId": "proj_abc123",
  "accessLevel": "read"
}

// Remove project context
DELETE /api/session/projects/{projectId}

// List active project contexts
GET /api/session/projects
```

**Pros**: Persistent within session, natural for extended comparison
**Cons**: More complex, state management required

---

## Recommended Implementation (MVP)

### Phase 1: Extended search_nodes

1. Add `projectIds` parameter to `search_nodes` tool
2. Implement ownership validation
3. Return results with project annotations
4. Handle errors gracefully

### Implementation

```typescript
// In memory-tools.ts

case "search_nodes": {
  const { query, limit, projectIds } = args as {
    query: string;
    limit?: number;
    projectIds?: string[];
  };

  // Determine which projects to search
  const targetProjects = projectIds?.length
    ? projectIds
    : [currentProjectId]; // Default to current project

  // Validate ownership for all projects
  for (const projId of targetProjects) {
    if (!userOwnsProject(userId, projId)) {
      return {
        content: [{
          type: "text",
          text: `Error: You don't have access to project '${projId}'`
        }],
        isError: true
      };
    }
  }

  // Search across projects
  const results: CrossProjectSearchResult = {
    results: [],
    totalResults: 0,
    projectsSearched: targetProjects.length
  };

  for (const projId of targetProjects) {
    const manager = getMemoryManager(userId, projId);
    const entities = manager.searchNodes(query, limit || 10);

    const project = getProject(projId);
    results.results.push({
      projectId: projId,
      projectName: project.name,
      entities
    });
    results.totalResults += entities.length;
  }

  return {
    content: [{
      type: "text",
      text: formatCrossProjectResults(results)
    }]
  };
}
```

### Response Formatting

```typescript
function formatCrossProjectResults(results: CrossProjectSearchResult): string {
  if (results.projectsSearched === 1) {
    // Single project - use existing format
    return formatSingleProjectResults(results.results[0].entities);
  }

  // Multi-project - annotate by source
  let output = `**Cross-Project Search Results** (${results.projectsSearched} projects, ${results.totalResults} total)\n\n`;

  for (const projectResult of results.results) {
    output += `### ${projectResult.projectName}\n`;
    if (projectResult.entities.length === 0) {
      output += `_No matches found_\n\n`;
    } else {
      output += projectResult.entities.map(formatEntity).join("\n") + "\n\n";
    }
  }

  return output;
}
```

---

## UX Considerations

### Natural Language Detection

The LLM should recognize cross-project intent from natural language:

| User Says | Intent |
|-----------|--------|
| "Compare revenue from Client A and Client B" | Cross-project search |
| "What are my goals for the dental practice?" | Single project (current) |
| "Show me all invoices across all my projects" | Cross-project search (all) |
| "How does this client's performance compare to my other clients?" | Cross-project comparison |

### System Prompt Enhancement

Add to system prompt:
```
When the user asks to compare data across projects or clients, use the search_nodes tool with the projectIds parameter. First use list_projects to get available project IDs if needed.
```

### Error UX

```
User: "Compare revenue with Acme Corp project"

Pip: "I found the Acme Corp project, but I don't have permission to access it.
You can only compare projects you own. Would you like me to search your current
project instead?"
```

---

## Database Schema (No Changes Required)

The existing schema already supports cross-project queries:

```sql
-- Existing tables have project_id column
SELECT * FROM memory_entities
WHERE user_id = ? AND project_id IN (?, ?, ?)

-- Ownership validation via projects table
SELECT id FROM projects
WHERE id IN (?, ?, ?) AND user_id = ?
```

---

## Security Considerations

### 1. Ownership Validation
- **ALWAYS** validate user owns target projects before querying
- Use database-level check, not client-provided claims

### 2. Rate Limiting
- Cross-project queries may be more expensive
- Consider separate rate limit tier for cross-project operations

### 3. Audit Logging
- Log all cross-project access attempts
- Include: user_id, source_project, target_projects, timestamp, success/failure

```typescript
interface CrossProjectAuditLog {
  userId: string;
  sourceProjectId: string;
  targetProjectIds: string[];
  operation: 'search_nodes' | 'read_graph' | 'open_nodes';
  success: boolean;
  errorReason?: string;
  timestamp: number;
}
```

### 4. Data Leakage Prevention
- Never include project data in error messages
- Generic "not found" for projects user doesn't own
- Don't reveal project existence to non-owners

---

## Future Enhancements (Post-MVP)

### 1. Project Groups
```typescript
interface ProjectGroup {
  id: string;
  name: string;
  projectIds: string[];
  userId: string;
}
// "Search all clients" → searches all projects in group
```

### 2. Cross-Project Relations
```typescript
// Link entities across projects
{
  from: "proj_a:entity_123",
  to: "proj_b:entity_456",
  relationType: "sister_company"
}
```

### 3. Shared Project Access
```typescript
interface ProjectShare {
  projectId: string;
  sharedWithUserId: string;
  accessLevel: 'read' | 'write';
  grantedBy: string;
  grantedAt: number;
}
```

### 4. Cross-Project Write Operations
- Require explicit confirmation
- Audit trail for all cross-project writes
- Undo capability

---

## Testing Plan

### Unit Tests

1. `search_nodes` with single project (backwards compatible)
2. `search_nodes` with multiple owned projects
3. `search_nodes` with non-owned project (should fail)
4. `search_nodes` with mix of owned/non-owned (should fail)
5. `search_nodes` with >5 projects (should fail)

### Integration Tests

1. End-to-end cross-project search via MCP
2. Natural language cross-project intent recognition
3. Error handling for permission failures

### Manual Testing

1. Claude.ai: "Compare Client A and Client B revenue"
2. ChatGPT: Same query via meta-tool pattern
3. Verify response formatting with project annotations

---

## Implementation Checklist

- [ ] Add `projectIds` parameter to `search_nodes` tool definition
- [ ] Implement ownership validation helper
- [ ] Update `executeMemoryTool` for cross-project logic
- [ ] Create `formatCrossProjectResults` formatter
- [ ] Add audit logging for cross-project operations
- [ ] Update tool description with cross-project usage
- [ ] Test backwards compatibility (single project)
- [ ] Test cross-project scenarios
- [ ] Update PROGRESS.md with completion

---

## Acceptance Criteria

- [x] API design covers read-only cross-project access
- [x] Permission model clearly documented (owner-only)
- [x] Error handling patterns defined
- [x] Backwards compatibility maintained
- [x] Security considerations addressed
- [ ] POC implementation (next deliverable)
