/**
 * Type definitions for agent core
 */

export interface AgentRequest {
  userId: string;
  sessionId: string;
  message: string;
  context?: Record<string, any>;
}

export interface AgentResponse {
  message: string;
  sessionId: string;
  metadata?: {
    toolsUsed?: string[];
    subAgentCalled?: string;
    tokensUsed?: number;
  };
}

export interface Session {
  sessionId: string;
  userId: string;
  messages: Message[];
  agentContext: Record<string, any>;
  createdAt: number;
  updatedAt: number;
  expiresAt: number;
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
}

export interface CoreMemory {
  userId: string;
  preferences: {
    xeroOrg?: string;
    reportingPreferences?: Record<string, any>;
    communicationStyle?: string;
    timezone?: string;
  };
  relationshipStage: 'colleague' | 'partner' | 'friend';
  relationshipStartDate: number;
  keyMilestones: Milestone[];
  criticalContext: string[];
}

export interface Milestone {
  type: string;
  description: string;
  timestamp: number;
}

export interface ExtendedMemory {
  userId: string;
  conversationSummary: string;
  embedding?: number[];
  learnedPatterns: Record<string, any>;
  emotionalContext?: string;
  topics: string[];
  createdAt: number;
  ttl?: number; // Expires if subscription lapses
}
