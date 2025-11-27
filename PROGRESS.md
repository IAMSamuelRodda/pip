# Zero Agent (Pip) - Progress Tracking

> **Purpose**: Detailed project tracking with epics, features, and tasks from BLUEPRINT.yaml
> **Lifecycle**: Living (update on task completion, status changes, or blocking issues)
> **Alternative to**: GitHub Issues (streamlined approach for solo/small team development)

**Last Updated**: 2025-11-27
**Blueprint**: `specs/BLUEPRINT.yaml` (942 lines)

---

## Project Overview

### Summary
Zero Agent (rebranding to "Pip") is an AI bookkeeping assistant that combines financial data from Xero with business context to provide intelligent, personalized guidance for small business owners.

**One-liner**: "Pip is your AI bookkeeping assistant—ask questions about your business finances and get plain-English answers instantly."

### Current Phase
**Phase 2: Core Differentiator** - Building Business Context Layer and Pip Personality

### Progress Metrics
| Metric | Value |
|--------|-------|
| Milestones | 0/2 |
| Epics Complete | 1/4 (Epic 0: Core Platform) |
| Features Complete | 4/15 |
| Overall Progress | ~30% |

### Key Targets
- [ ] **Thursday Demo** - Basic Business Context Layer working
- [ ] **Milestone 1** - Core Differentiator Release (6-7 weeks)
- [ ] **Milestone 2** - Voice Mode & Premium Features (4-5 weeks)

---

## Milestone 0: Core Platform (Complete)

**Status**: 🟢 Complete
**Completed**: 2025-11-27

### Epic 0: Foundation Infrastructure

#### feature_0_1: VPS Infrastructure ✅
- [x] Docker multi-stage build
- [x] Caddy reverse proxy with auto-HTTPS
- [x] SQLite database with persistence
- [x] Daily backup automation

#### feature_0_2: Express Server ✅
- [x] API routes (chat, sessions, auth, health)
- [x] Helmet security headers
- [x] Rate limiting
- [x] CORS configuration

#### feature_0_3: Agent Orchestrator ✅
- [x] LLM abstraction layer (Anthropic + Ollama)
- [x] Native tool calling
- [x] Session persistence
- [x] Lazy initialization

#### feature_0_4: Xero Integration ✅
- [x] OAuth 2.0 flow
- [x] Token storage and refresh
- [x] XeroClient wrapper
- [x] 11 Xero tools implemented

---

## Milestone 1: Core Differentiator Release

**Status**: 🟡 In Progress
**Timeline**: 6-7 weeks
**Success Criteria**:
- User can upload business plan/KPIs and ask "Can I afford to hire?" with context-aware answer
- Agent personality adapts based on relationship stage
- Demo successfully validates product-market fit

---

### Epic 1: Business Context Layer

**Status**: 🟡 In Progress
**Timeline**: 3-4 weeks
**Completion Criteria**: Users can upload documents, ask context-aware questions, receive answers combining financial data + business knowledge

#### feature_1_1: Document Ingestion & Storage
**Status**: 🔴 Not Started
**Complexity**: 2.8/5 (Medium)
**Estimated Days**: 7
**Priority**: DEMO CRITICAL

**Deliverables**:
- [ ] Upload endpoint accepting PDF, TXT, MD, DOCX files
- [ ] Document parser extracting text from multiple formats
- [ ] SQLite schema: business_context table
- [ ] PWA upload UI with drag-and-drop

**Tasks**:

| ID | Task | Days | Complexity | Status |
|----|------|------|------------|--------|
| task_1_1_1 | Backend Upload API & File Processing | 3 | 2.5 | 🔴 |
| task_1_1_2 | Document Parsing & Text Extraction | 3 | 2.8 | 🔴 |
| task_1_1_3 | SQLite Storage Schema & API | 2 | 2.2 | 🔴 |
| task_1_1_4 | PWA Upload UI Component | 2 | 2.0 | 🔴 |

---

#### feature_1_2: Context Chunking & Summarization
**Status**: 🔴 Not Started
**Complexity**: 3.2/5 (High) ⚠️ NEEDS DECOMPOSITION
**Estimated Days**: 8
**Flag**: `needs_decomposition: true`

**Deliverables**:
- [ ] Document chunking algorithm (max 2000 chars/chunk with overlap)
- [ ] LLM-powered summarization (Claude Haiku for cost efficiency)
- [ ] Chunk storage with semantic boundaries
- [ ] Summary storage for quick context retrieval

**Tasks**:

| ID | Task | Days | Complexity | Status | Notes |
|----|------|------|------------|--------|-------|
| task_1_2_0 | Chunking Strategy Spike | 2 | 2.0 | 🔴 | RESEARCH - reduces uncertainty |
| task_1_2_1 | Chunking Strategy Implementation | 5 | 3.5 | 🔴 | FLAGGED - depends on spike |
| task_1_2_2 | LLM Summarization Pipeline | 3 | 2.8 | 🔴 | |

---

#### feature_1_3: Context Injection into Agent Prompts
**Status**: 🔴 Not Started
**Complexity**: 2.5/5 (Medium)
**Estimated Days**: 6
**Priority**: DEMO CRITICAL

**Deliverables**:
- [ ] Context retrieval based on user query relevance
- [ ] Dynamic system prompt injection with business context
- [ ] Token limit management (max 20k tokens for context)

**Tasks**:

| ID | Task | Days | Complexity | Status |
|----|------|------|------------|--------|
| task_1_3_1 | Context Retrieval & Relevance Ranking | 3 | 2.8 | 🔴 |
| task_1_3_2 | System Prompt Context Injection | 3 | 2.2 | 🔴 |

---

#### feature_1_4: Context-Aware Reasoning
**Status**: 🔴 Not Started
**Complexity**: 2.3/5 (Medium)
**Estimated Days**: 5
**Priority**: DEMO CRITICAL

**Deliverables**:
- [ ] Answer "Can I afford to hire?" using Xero P&L + business plan targets
- [ ] Answer "Am I on track for goals?" using actuals + KPIs
- [ ] Demo-ready test cases for Thursday presentation

**Tasks**:

| ID | Task | Days | Complexity | Status |
|----|------|------|------------|--------|
| task_1_4_1 | Combined Reasoning Prompt Engineering | 3 | 2.5 | 🔴 |
| task_1_4_2 | Demo Test Cases & Validation | 2 | 2.0 | 🔴 |

---

### Epic 2: Pip Personality System

**Status**: 🔴 Not Started
**Timeline**: 2-3 weeks
**Completion Criteria**: Agent adapts personality based on relationship stage, communication preferences, and business context

#### feature_2_1: Dynamic System Prompt Generation
**Status**: 🔴 Not Started
**Complexity**: 2.3/5 (Medium)
**Estimated Days**: 5

**Deliverables**:
- [ ] Prompt template system with variables: {relationship_stage}, {user_preferences}, {business_context}
- [ ] Three personality modes: Colleague (professional), Partner (proactive), Friend (trusted advisor)
- [ ] Pip personality traits: approachable, curious, learns over time (Pippin from LOTR)

**Tasks**:

| ID | Task | Days | Complexity | Status |
|----|------|------|------------|--------|
| task_2_1_1 | Prompt Template Engine | 3 | 2.2 | 🔴 |
| task_2_1_2 | Integration with Memory Manager | 2 | 2.3 | 🔴 |

---

#### feature_2_2: Relationship Stage Tracking
**Status**: 🔴 Not Started
**Complexity**: 2.0/5 (Low)
**Estimated Days**: 4

**Deliverables**:
- [ ] Automatic progression: Colleague (0-3 months) → Partner (3-12 months) → Friend (12+ months)
- [ ] Milestone tracking in core_memory table
- [ ] Display current relationship stage in PWA settings

**Tasks**:

| ID | Task | Days | Complexity | Status |
|----|------|------|------------|--------|
| task_2_2_1 | Relationship Progression Logic | 2 | 2.0 | 🔴 |
| task_2_2_2 | Milestone & Conversation Tracking | 2 | 2.0 | 🔴 |

---

#### feature_2_3: Sub-Agent Architecture
**Status**: 🔴 Not Started
**Complexity**: 2.7/5 (Medium)
**Estimated Days**: 7

**Deliverables**:
- [ ] 4 sub-agents: InvoiceAgent, ReconciliationAgent, ReportingAgent, ExpenseAgent
- [ ] Main orchestrator routes to sub-agents based on intent detection
- [ ] Sub-agents have limited tool access (permission scoping)

**Tasks**:

| ID | Task | Days | Complexity | Status |
|----|------|------|------------|--------|
| task_2_3_1 | Sub-Agent Base Class & Routing | 4 | 2.8 | 🔴 |
| task_2_3_2 | Implement 4 Specialized Sub-Agents | 3 | 2.5 | 🔴 |

---

## Milestone 2: Voice Mode & Premium Features

**Status**: 🔴 Not Started
**Timeline**: 4-5 weeks
**Success Criteria**:
- Voice-to-voice conversation with <200ms latency
- Whisper STT + Chatterbox TTS fully integrated
- WebSocket streaming stable on VPS

---

### Epic 3: Voice Mode Architecture

**Status**: 🔴 Not Started
**Timeline**: 4-5 weeks
**Completion Criteria**: Voice-to-voice conversation working with <2s end-to-end latency

#### feature_3_1: Speech-to-Text (Whisper)
**Status**: 🔴 Not Started
**Complexity**: 2.8/5 (Medium) ⚠️ HIGH UNCERTAINTY
**Estimated Days**: 8
**Flag**: `needs_decomposition: true`

**Deliverables**:
- [ ] Whisper integration (API initially, self-hosted spike)
- [ ] Audio streaming from browser (WebSocket)
- [ ] Real-time transcription endpoint
- [ ] Latency target: <500ms for STT

**Tasks**:

| ID | Task | Days | Complexity | Status | Notes |
|----|------|------|------------|--------|-------|
| task_3_1_0 | Whisper Deployment Strategy Spike | 2 | 2.0 | 🔴 | RESEARCH |
| task_3_1_1 | Audio Streaming from Browser | 3 | 2.5 | 🔴 | |
| task_3_1_2 | Whisper STT Endpoint | 4 | 3.0 | 🔴 | Depends on spike |

---

#### feature_3_2: Text-to-Speech (Chatterbox)
**Status**: 🔴 Not Started
**Complexity**: 3.0/5 (High) ⚠️ HIGH RISK
**Estimated Days**: 10
**Flag**: `needs_decomposition: true`

**Risk**: VPS 384MB memory constraint may limit self-hosted Chatterbox

**Deliverables**:
- [ ] Chatterbox TTS self-hosted on VPS or separate instance
- [ ] Custom "Pip" voice persona (optional zero-shot cloning)
- [ ] TTS endpoint: POST /api/voice/tts
- [ ] Latency target: <200ms for TTS generation

**Tasks**:

| ID | Task | Days | Complexity | Status | Notes |
|----|------|------|------------|--------|-------|
| task_3_2_0 | Chatterbox Deployment Feasibility Spike | 3 | 2.5 | 🔴 | RESEARCH - critical |
| task_3_2_1 | Chatterbox Self-Hosting Setup | 5 | 3.5 | 🔴 | FLAGGED - depends on spike |
| task_3_2_2 | TTS API Endpoint & Audio Streaming | 3 | 2.8 | 🔴 | |

---

#### feature_3_3: WebSocket Voice Conversation Flow
**Status**: 🔴 Not Started
**Complexity**: 2.8/5 (Medium)
**Estimated Days**: 8

**Deliverables**:
- [ ] WebSocket /api/voice/conversation endpoint
- [ ] Flow: browser audio → STT → orchestrator → LLM → TTS → browser audio
- [ ] Latency monitoring (<2s end-to-end target)

**Tasks**:

| ID | Task | Days | Complexity | Status |
|----|------|------|------------|--------|
| task_3_3_1 | WebSocket Conversation State Machine | 4 | 2.8 | 🔴 |
| task_3_3_2 | End-to-End Voice Pipeline Integration | 4 | 2.8 | 🔴 |

---

#### feature_3_4: Voice Mode PWA UI
**Status**: 🔴 Not Started
**Complexity**: 2.0/5 (Low)
**Estimated Days**: 4

**Deliverables**:
- [ ] Voice chat interface (push-to-talk)
- [ ] Visual feedback: listening indicator, speaking animation
- [ ] Voice settings: persona selection, speech rate
- [ ] Fallback to text chat if voice fails

**Tasks**:

| ID | Task | Days | Complexity | Status |
|----|------|------|------------|--------|
| task_3_4_1 | Voice UI Components | 3 | 2.0 | 🔴 |
| task_3_4_2 | Voice Settings & Configuration | 1 | 2.0 | 🔴 |

---

## Complexity Assessment Summary

### Tasks Flagged for Decomposition

| Task | Complexity | Reason |
|------|------------|--------|
| task_1_2_1 | 3.5/5 | Uncertainty=4 around optimal chunking strategy |
| task_3_2_1 | 3.5/5 | Risk=4 due to VPS memory constraints |

### Spike Tasks Required

| Spike | Duration | Reduces Uncertainty For |
|-------|----------|------------------------|
| task_1_2_0 | 2 days | task_1_2_1 (Chunking Strategy) |
| task_3_1_0 | 2 days | task_3_1_2 (Whisper Endpoint) |
| task_3_2_0 | 3 days | task_3_2_1 (Chatterbox Setup) |

### Demo Critical Path

**Must complete by Wednesday for Thursday demo:**
1. feature_1_1 (Document Ingestion) - basic upload working
2. feature_1_3 (Context Injection) - inject into prompts
3. task_1_4_2 (Demo Test Cases) - prepared scenarios

---

## Progress Changelog

### 2025-11-27 - Blueprint Created
- Created comprehensive blueprint at `specs/BLUEPRINT.yaml`
- Defined 2 milestones, 3 epics, 11 features, 32+ tasks
- Identified 3 spike tasks for high-uncertainty areas
- Flagged 2 tasks for decomposition (>3.0 complexity)

### 2025-11-27 - Previous Updates
- VPS deployment complete
- PWA chat interface working
- Xero OAuth integration live
- 11 Xero tools implemented

---

## References

- **specs/BLUEPRINT.yaml**: Full architectural blueprint (942 lines)
- **ISSUES.md**: Bug/improvement tracking with flagged items
- **STATUS.md**: 2-week rolling snapshot
- **ARCHITECTURE.md**: Technical design and ADRs
