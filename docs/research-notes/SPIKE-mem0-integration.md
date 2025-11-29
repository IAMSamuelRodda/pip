# SPIKE: Mem0 Integration Feasibility

**Status**: COMPLETE
**Duration**: 1 day (originally estimated 2-3 days)
**Date**: 2025-11-30
**Decision**: Option H - Official Mem0 Node.js SDK

---

## Executive Summary

**MAJOR DISCOVERY**: Mem0 has released an official Node.js SDK (`mem0ai` on npm) with full TypeScript support. This eliminates the need for Python dependencies, subprocess architectures, or major refactoring.

**Recommendation**: Use the official `mem0ai` npm package with in-memory vector store and SQLite history. This is the simplest, most maintainable option that fits Pip's 384MB VPS constraint.

---

## Options Evaluated

| Option | Description | Language | Feasibility | Resource Impact |
|--------|-------------|----------|-------------|-----------------|
| A | OpenMemory MCP | Python | Not feasible | ~2GB+ (Qdrant alone needs 1.2GB for 1M vectors) |
| B | Mem0 Cloud API | REST | Feasible | Zero local resources, but $19-249/month |
| C | Self-hosted Mem0 | Python | Not feasible | Qdrant + Python exceeds 384MB |
| D | Python subprocess | Python + Node | Not feasible | Same resource issues as C |
| E | Refactor Pip to Python | Python | Overkill | Major rewrite unnecessary |
| F | Port Mem0 to TypeScript | TypeScript | Unnecessary | Official SDK exists |
| G | Community TS (mem0-ts) | TypeScript | Not recommended | OpenAI-only, unmaintained |
| **H** | **Official Mem0 Node.js SDK** | **TypeScript** | **RECOMMENDED** | **Minimal (in-memory + SQLite)** |

---

## Option H: Official Mem0 Node.js SDK (RECOMMENDED)

### Discovery

The official `mem0ai` npm package was released with v1.0.0, providing native TypeScript/JavaScript support:

```bash
npm install mem0ai
```

### Features

- **Full API parity** with Python SDK
- **Memory operations**: add, search, getAll, history, delete, deleteAll, reset
- **Vector store options**: memory (default), qdrant, chroma, pinecone, pgvector, 20+ others
- **LLM providers**: OpenAI, Anthropic, Azure, Ollama, Together, Groq, Mistral, Google AI, AWS Bedrock
- **Embedding models**: OpenAI, Azure, Ollama, Hugging Face, Vertex AI, Google AI, Together
- **History storage**: SQLite (default), Supabase

### Default Configuration (VPS-Friendly)

```typescript
import { Memory } from "mem0ai/oss";

const memory = new Memory({
  version: "v1.1",
  vectorStore: {
    provider: "memory",  // In-memory, no external DB
    config: { collectionName: "memories", dimension: 1536 }
  },
  llm: {
    provider: "openai",
    config: { model: "gpt-4-turbo-preview" }
  },
  historyDbPath: "memory.db"  // SQLite file
});
```

### Resource Impact

- **RAM**: Minimal - in-memory vector store only holds active session memories
- **Disk**: SQLite file for history (grows with usage, typically KB-MB range)
- **External API**: Only OpenAI API calls for embeddings/LLM (or Anthropic)
- **Fits 384MB VPS**: Yes, with significant headroom

---

## Option B: Mem0 Cloud API (Alternative for Scale)

### Pricing

| Tier | Price | Memories | Features |
|------|-------|----------|----------|
| Hobby | Free | 10K | Basic operations |
| Starter | $19/month | More | Enhanced features |
| Pro | $249/month | Unlimited | Full platform |
| Enterprise | ~$2000/month | Custom | Dedicated support |

### Performance

- 26% higher accuracy than OpenAI Memory
- 91% lower p95 latency
- 90% token savings vs full-context approaches

### When to Use

- If user base grows beyond in-memory capacity
- If VPS resources become constrained
- If enterprise features needed (team management, analytics)

---

## Options Not Recommended

### Option A: OpenMemory MCP

**Requires Docker + Qdrant + Postgres**. Qdrant alone needs ~1.2GB RAM for 1M vectors. Not feasible for 384MB VPS.

Source: [Qdrant Memory Consumption](https://qdrant.tech/articles/memory-consumption/)

### Options C & D: Self-hosted Python

Same resource constraints as Option A. Python + Qdrant exceeds VPS capacity.

### Option G: mem0-ts Community Port

- Only supports OpenAI (no Anthropic, no Ollama)
- Early stage: 24 commits, 16 stars, single developer
- No releases published
- Not recommended for production

Source: [mem0-ts GitHub](https://github.com/JamieLee0510/mem0-ts)

---

## Implementation Plan

### Phase 1: Basic Integration

1. Install `mem0ai` in `packages/mcp-remote-server`
2. Initialize Memory with in-memory vector store + SQLite history
3. Add memory operations to MCP tool context
4. Test with Claude.ai and ChatGPT

### Phase 2: Memory Injection

1. Extract memories for current user before tool execution
2. Inject relevant memories into system prompt
3. Store new memories after conversation turns

### Phase 3: ChatGPT Memory Import

1. Parse ChatGPT `conversations.json` export
2. Extract memory-worthy facts
3. Bulk import to user's Mem0 store

### Phase 4: Memory Management UI

1. Add memory viewer to PWA
2. Allow manual memory editing
3. Memory search and deletion

---

## Resource Requirements Summary

| Component | RAM | Disk | External |
|-----------|-----|------|----------|
| mem0ai SDK | ~50MB | - | - |
| In-memory vectors | ~10-100MB* | - | - |
| SQLite history | ~1MB | ~10MB+ | - |
| Embeddings | - | - | OpenAI API |
| LLM queries | - | - | OpenAI/Anthropic API |

*Depends on number of active memories. For typical SMB user, likely <1000 memories.

**Total estimate**: ~100-200MB additional RAM usage, well within 384MB VPS allocation.

---

## Decision

**Proceed with Option H: Official Mem0 Node.js SDK**

Rationale:
1. Native TypeScript - no Python dependencies
2. Full feature parity with Python SDK
3. Minimal resource requirements (in-memory + SQLite)
4. Official support from Mem0 team
5. Upgrade path to Cloud API if needed
6. Perfect fit for Pip's VPS constraints

---

## Sources

- [Mem0 Node SDK Quickstart](https://docs.mem0.ai/open-source/node-quickstart)
- [mem0ai npm package](https://www.npmjs.com/package/mem0ai)
- [OpenMemory MCP Overview](https://docs.mem0.ai/openmemory/overview)
- [Mem0 Pricing](https://mem0.ai/pricing)
- [Qdrant Memory Consumption](https://qdrant.tech/articles/memory-consumption/)
- [mem0-ts GitHub](https://github.com/JamieLee0510/mem0-ts)
- [Mem0 GitHub](https://github.com/mem0ai/mem0)

---

**Last Updated**: 2025-11-30
