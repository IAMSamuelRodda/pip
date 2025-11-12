/**
 * Agent Core - Claude Agent SDK orchestrator
 *
 * Main agent orchestrator that:
 * - Manages conversation flow with users
 * - Delegates tasks to specialized sub-agents
 * - Maintains context in DynamoDB sessions
 * - Invokes MCP tools via Lambda
 * - Handles memory persistence and retrieval
 *
 * Agent Architecture:
 * - Main Agent (orchestrator) - decomposes user requests
 * - Invoice Agent - invoice CRUD operations
 * - Reconciliation Agent - bank transaction matching
 * - Reporting Agent - financial report generation
 * - Expense Agent - expense tracking and categorization
 */

export { AgentOrchestrator } from './orchestrator.js';
export { SessionManager } from './session/manager.js';
export { MemoryManager } from './memory/manager.js';
export * from './types.js';

// Re-export sub-agents
export { InvoiceAgent } from './agents/invoice-agent.js';
export { ReconciliationAgent } from './agents/reconciliation-agent.js';
export { ReportingAgent } from './agents/reporting-agent.js';
export { ExpenseAgent } from './agents/expense-agent.js';
