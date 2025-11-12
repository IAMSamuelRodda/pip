/**
 * Main Agent Orchestrator
 *
 * Coordinates conversation flow and delegates to sub-agents
 */

import { SessionManager } from './session/manager.js';
import { MemoryManager } from './memory/manager.js';
import type { AgentRequest, AgentResponse } from './types.js';

export class AgentOrchestrator {
  private sessionManager: SessionManager;
  private memoryManager: MemoryManager;

  constructor() {
    this.sessionManager = new SessionManager();
    this.memoryManager = new MemoryManager();
  }

  /**
   * Process user message and generate response
   */
  async processMessage(request: AgentRequest): Promise<AgentResponse> {
    const { userId, sessionId, message } = request;

    try {
      // 1. Load session context from DynamoDB
      const session = await this.sessionManager.getSession(userId, sessionId);

      // 2. Load user memory (preferences, relationship stage)
      const memory = await this.memoryManager.getCoreMemory(userId);

      // 3. TODO: Analyze message intent and route to appropriate sub-agent
      // - Invoice operations → InvoiceAgent
      // - Bank reconciliation → ReconciliationAgent
      // - Financial reports → ReportingAgent
      // - Expense tracking → ExpenseAgent

      // 4. TODO: Invoke Claude Agent SDK with context

      // 5. TODO: Invoke MCP tools via Lambda if needed

      // 6. Update session history
      await this.sessionManager.updateSession(userId, sessionId, {
        messages: [
          ...(session?.messages || []),
          { role: 'user', content: message },
        ],
      });

      // 7. Update memory if needed
      // TODO: Extract learnings from conversation

      // Placeholder response
      return {
        message: 'Agent orchestrator not yet fully implemented',
        sessionId,
      };
    } catch (error) {
      console.error('Error processing message:', error);
      throw error;
    }
  }

  /**
   * Create new conversation session
   */
  async createSession(userId: string): Promise<string> {
    return await this.sessionManager.createSession(userId);
  }

  /**
   * Get conversation history
   */
  async getHistory(userId: string, sessionId: string) {
    const session = await this.sessionManager.getSession(userId, sessionId);
    return session?.messages || [];
  }
}
