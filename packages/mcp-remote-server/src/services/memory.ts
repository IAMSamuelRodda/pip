/**
 * Memory Service Router
 *
 * Routes to the appropriate memory implementation based on MEMORY_VARIANT env var:
 * - "mem0": Uses mem0 + Claude LLM + Ollama embeddings (Option A) - BROKEN in Docker
 * - "native" (default): Uses MCP-native entity storage + local embeddings (Option B)
 *
 * Both implementations now export the same interface:
 * - addMemory, searchMemory, getAllMemories, deleteMemory, deleteAllMemories
 */

// Environment variable for A/B selection
export const MEMORY_VARIANT = process.env.MEMORY_VARIANT || "native";

// Dynamically export from the correct implementation
// Note: ES modules don't support dynamic exports, so we re-export the native implementation
// which is now the default due to mem0 SQLite issues in Docker (issue_010)
export {
  addMemory,
  searchMemory,
  getAllMemories,
  deleteMemory,
  deleteAllMemories,
} from "./memory-native.js";
