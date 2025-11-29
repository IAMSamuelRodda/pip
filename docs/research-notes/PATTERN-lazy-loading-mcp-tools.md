# Pattern: Lazy-Loading MCP Tools for Context Efficiency

> **Status**: Validated pattern (implemented in Claude Code, applicable to Desktop and Remote)
> **Created**: 2025-11-29
> **Applies to**: Claude Code, Claude Desktop, Claude.ai Remote MCP, ChatGPT Remote MCP

## Problem Statement

MCP servers expose tools to LLMs, but each tool definition consumes context tokens. With multiple MCP servers exposing 30+ tools:

- **Without lazy-loading**: ~5,000+ tokens consumed immediately in every conversation
- **Impact**: Reduced space for actual conversation, higher API costs, potential context overflow

This problem exists across ALL MCP client implementations:
- Claude Code (local stdio)
- Claude Desktop (local stdio)
- Claude.ai Integrations (remote HTTP/SSE)
- ChatGPT Actions/Apps (remote HTTP)

## Solution: Lazy-Loading MCP Proxy

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      MCP Client                              │
│              (Claude Code/Desktop/Cloud)                     │
└─────────────────────┬───────────────────────────────────────┘
                      │ Sees only 2 tools initially:
                      │ - get_tools_in_category
                      │ - execute_tool
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    Lazy-MCP Proxy                            │
│                                                              │
│  Categories:                                                 │
│  ├── joplin (11 tools)                                      │
│  ├── todoist (12 tools)                                     │
│  └── nextcloud-calendar (7 tools)                           │
│                                                              │
│  Token cost: ~500 tokens (vs 5,000+ for all tools)          │
└─────────────────────┬───────────────────────────────────────┘
                      │ Proxies to actual servers on demand
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              Underlying MCP Servers                          │
│  ┌─────────┐  ┌─────────┐  ┌──────────────────┐            │
│  │ Joplin  │  │ Todoist │  │ Nextcloud-Calendar│            │
│  └─────────┘  └─────────┘  └──────────────────┘            │
└─────────────────────────────────────────────────────────────┘
```

### Token Savings

| Configuration | Initial Token Cost | Savings |
|--------------|-------------------|---------|
| Direct (30 tools) | ~5,000 tokens | - |
| Lazy-loaded (categories) | ~500 tokens | 90% |
| Expanded (1 category) | ~800 tokens | 84% |

## Implementation: Local MCP (Claude Code/Desktop)

### Current Implementation (lazy-mcp)

```json
// ~/.claude.json or claude_desktop_config.json
{
  "mcpServers": {
    "lazy-mcp": {
      "command": "npx",
      "args": ["lazy-mcp"],
      "env": {}
    }
  }
}
```

The `lazy-mcp` package:
1. Reads MCP server configs from environment or config file
2. Exposes `get_tools_in_category` and `execute_tool` meta-tools
3. Lazily spawns underlying MCP servers on first tool execution
4. Caches server connections for subsequent calls

### Usage Pattern

```
User: "Add a task to my inbox"

Claude: [Calls get_tools_in_category("todoist")]
→ Returns: create_task, get_tasks, update_task, delete_task...

Claude: [Calls execute_tool("todoist.create_task", {content: "..."})]
→ Returns: Task created successfully
```

## Implementation: Remote MCP (Claude.ai/ChatGPT)

### Current State (pip-mcp)

Our pip-mcp server at `pip.arcforge.au` currently exposes all 10 Xero tools directly:

```typescript
// packages/mcp-remote-server/src/index.ts
const tools: Tool[] = [
  { name: "get_invoices", ... },
  { name: "get_profit_and_loss", ... },
  // ... 8 more tools
];
```

### Future Enhancement: Remote Lazy-Loading

For remote MCP servers with many tools, implement the same pattern:

```typescript
// Option 1: Category-based lazy loading
const metaTools: Tool[] = [
  {
    name: "get_available_tools",
    description: "Get tools in a category. Categories: invoices, reports, contacts, banking",
    inputSchema: {
      type: "object",
      properties: {
        category: { type: "string", enum: ["invoices", "reports", "contacts", "banking"] }
      }
    }
  },
  {
    name: "execute_tool",
    description: "Execute a tool by name after discovering it via get_available_tools",
    inputSchema: {
      type: "object",
      properties: {
        tool_name: { type: "string" },
        arguments: { type: "object" }
      },
      required: ["tool_name", "arguments"]
    }
  }
];

// Option 2: Progressive disclosure (recommended for <20 tools)
// Keep all tools but use clear categories in descriptions
const tools: Tool[] = [
  { name: "invoices_get", description: "[Invoices] Get invoices...", ... },
  { name: "invoices_create", description: "[Invoices] Create invoice...", ... },
  { name: "reports_profit_loss", description: "[Reports] Get P&L...", ... },
  // Prefixed names help LLM understand tool organization
];
```

### When to Apply Remote Lazy-Loading

| Tool Count | Recommendation |
|------------|----------------|
| <10 tools | Direct exposure (current pip-mcp) |
| 10-20 tools | Progressive disclosure (prefixed names) |
| 20+ tools | Full lazy-loading proxy pattern |

## Platform-Specific Considerations

### Claude.ai Integrations

- Uses HTTP/SSE transport
- Tools listed in connector settings
- **Consideration**: Claude.ai may cache tool list; lazy-loading reduces initial payload

### ChatGPT Actions/Apps

- Uses OpenAPI spec or function calling
- **Consideration**: OpenAPI schemas can be large; lazy-loading reduces spec size
- **Note**: ChatGPT has different function calling patterns; may need adaptation

### Claude Desktop

- Smaller context window than Claude Code (~8-16k vs larger)
- **Benefit**: Lazy-loading provides proportionally larger benefit
- No subagent delegation (Task tool), so efficient tool use more critical

## Implementation Checklist

### Local (Claude Desktop)

- [x] lazy-mcp package available via npx
- [x] Documented in Claude Code setup
- [ ] Add to Claude Desktop setup guide
- [ ] Create Joplin note for personal reference

### Remote (pip-mcp / future servers)

- [x] Basic tool exposure working
- [ ] Evaluate tool count threshold for lazy-loading
- [ ] Implement category-based discovery if >20 tools
- [ ] Add tool usage analytics to inform optimization

## References

- lazy-mcp: https://github.com/anthropics/lazy-mcp (or similar)
- MCP Specification: https://modelcontextprotocol.io/
- Current pip-mcp: `packages/mcp-remote-server/`

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2025-11-29 | Keep pip-mcp with direct tools (10 tools) | Below threshold, simplicity preferred |
| 2025-11-29 | Document pattern for future scaling | Prepare for tool expansion |
