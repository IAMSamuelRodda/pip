/**
 * Chat API Routes
 *
 * Handles conversation with the AI agent
 * Replaces: Agent Lambda (functions/agent/)
 */

import { Router } from 'express';
import { AgentOrchestrator } from '@pip/agent-core';
import type { DatabaseProvider } from '@pip/core';
import Anthropic from '@anthropic-ai/sdk';

/**
 * Generate a smart title for a chat using Haiku
 * Returns a short, concise 3-5 word title based on the user's first message
 */
async function generateSmartTitle(message: string): Promise<string> {
  try {
    const anthropic = new Anthropic();
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 30,
      messages: [
        {
          role: 'user',
          content: `Generate a 3-5 word chat title for this message. Respond with ONLY the title, no quotes or explanation:\n\n"${message.substring(0, 200)}"`,
        },
      ],
    });

    const title = (response.content[0] as { type: 'text'; text: string }).text.trim();
    // Clean up any quotes that slipped through
    return title.replace(/^["']|["']$/g, '').substring(0, 50);
  } catch (error) {
    console.error('Failed to generate smart title:', error);
    // Fallback to simple truncation
    return message.substring(0, 50).trim() + (message.length > 50 ? '...' : '');
  }
}

export function createChatRoutes(db: DatabaseProvider): Router {
  const router = Router();

  // Orchestrator with lazy initialization - only initializes on first chat request
  const orchestrator = new AgentOrchestrator();

  /**
   * POST /api/chat
   * Send a message and get AI response
   */
  router.post('/', async (req, res, next) => {
    try {
      const { message, sessionId, projectId, model } = req.body;

      if (!message || typeof message !== 'string') {
        return res.status(400).json({
          error: 'Missing required field: message',
        });
      }

      // Get userId from auth middleware
      const userId = req.userId!;

      // Track if this is a new session (for title generation)
      const isNewSession = !sessionId;

      // Create session if not provided (with optional project scope)
      let activeSessionId = sessionId;
      if (!activeSessionId) {
        activeSessionId = await orchestrator.createSession(userId, projectId || undefined);
      }

      // Process message through orchestrator
      const response = await orchestrator.processMessage({
        userId,
        sessionId: activeSessionId,
        message,
        projectId: projectId || undefined,
        model: model || undefined,
      });

      // Generate smart title for new sessions (async, don't block response)
      if (isNewSession) {
        generateSmartTitle(message).then(async (title) => {
          try {
            await db.updateSession(userId, activeSessionId, { title });
          } catch (err) {
            console.error('Failed to save chat title:', err);
          }
        });
      }

      res.json({
        message: response.message,
        sessionId: response.sessionId,
        metadata: response.metadata,
      });

    } catch (error: any) {
      // Handle initialization errors gracefully
      if (error.name === 'AuthenticationError' || error.message?.includes('API key')) {
        return res.status(503).json({
          error: 'AI service not configured',
          details: 'ANTHROPIC_API_KEY is not set. Please configure the API key.',
        });
      }
      next(error);
    }
  });

  /**
   * POST /api/chat/stream (future)
   * Stream AI response for real-time updates
   */
  router.post('/stream', async (req, res, next) => {
    // TODO: Implement streaming response using Server-Sent Events
    res.status(501).json({
      error: 'Streaming not yet implemented',
    });
  });

  return router;
}
