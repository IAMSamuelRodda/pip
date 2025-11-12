# Project Status

> **Purpose**: Current work, active bugs, and recent changes (2-week rolling window)
> **Lifecycle**: Living (update daily/weekly during active development)

**Last Updated**: 2025-11-12
**Current Phase**: Initial Setup & Documentation
**Version**: 0.1.0 (Pre-release)

---

## Quick Overview

| Aspect | Status | Notes |
|--------|--------|-------|
| Development | 🔵 | Setting up project structure |
| Staging | ⚪ | Not yet deployed |
| Production | ⚪ | Not yet deployed |
| CI/CD Pipeline | 🔵 | Configuration in progress |
| Test Coverage | ⚪ | No tests yet |
| Known Bugs | 🟢 | None (pre-implementation) |

**Status Guide:** 🟢 Good | 🟡 Attention | 🔴 Critical | 🔵 In Progress | ⚪ Not Started

---

## Current Focus

**Completed Today/This Week:**
- ✅ Created project documentation structure (7 core documents)
- ✅ Migrated architecture from Firebase to AWS
- ✅ Defined DynamoDB single-table design
- ✅ Added ADR-007: Memory persistence and relationship building
- ✅ Added ADR-008: Voice-to-voice integration (premium tier)
- ✅ Defined subscription model (Free, Pro, Enterprise tiers)

**In Progress:**
- 🔵 Planning implementation roadmap
- 🔵 Preparing for initial infrastructure setup

**Next Up:**
- [ ] Create monorepo package structure (mcp-xero-server, agent-core, pwa-app, functions)
- [ ] Set up Terraform infrastructure definitions (DynamoDB, Lambda, API Gateway, Cognito)
- [ ] Configure AWS account and IAM roles
- [ ] Initialize Xero OAuth application in Xero Developer Portal
- [ ] Implement MCP server foundation (Lambda functions)
- [ ] Build agent orchestrator with Claude Agent SDK (Lambda)

---

## Deployment Status

### Development
- **Status**: Local setup in progress
- **URL**: localhost (various ports)
- **Last Activity**: 2025-11-12

### Staging
- **Status**: Not yet configured
- **URL**: TBD
- **Last Deployed**: N/A

### Production
- **Status**: Not yet configured
- **URL**: TBD
- **Last Deployed**: N/A

---

## Known Issues

### Critical
None currently.

### High Priority
None currently.

---

## Recent Achievements (Last 2 Weeks)

**Documentation Foundation** ✅
- Completed: 2025-11-12
- Established 7-document structure (CLAUDE.md, README.md, ARCHITECTURE.md, STATUS.md, CONTRIBUTING.md, DEVELOPMENT.md, CHANGELOG.md)
- Created BLUEPRINT.yaml for project roadmap
- Archived legacy documentation drafts

---

## Next Steps (Priority Order)

1. **Package Structure Setup**
   - Create monorepo with pnpm workspaces
   - Initialize packages: mcp-xero-server, agent-core, pwa-app
   - Create functions directory for Lambda handlers
   - Set up shared TypeScript configuration

2. **AWS Infrastructure (Terraform)**
   - Define DynamoDB single-table design
   - Configure Lambda functions (agent, MCP, auth)
   - Set up API Gateway (REST + Cognito authorizer)
   - Configure S3 + CloudFront for PWA hosting
   - Set up Secrets Manager for Xero tokens
   - Configure Cognito user pool
   - Set up IAM roles and policies

3. **Xero API Integration**
   - Register Xero developer application
   - Configure OAuth 2.0 flow (Cognito + Xero)
   - Implement token storage in Secrets Manager
   - Create Lambda function for OAuth callback

4. **MCP Server Implementation (Lambda)**
   - Define Xero tool schemas with Zod
   - Implement invoice management tools
   - Implement bank transaction tools
   - Implement reporting tools
   - Configure Lambda packaging and deployment

5. **Agent Core Development (Lambda)**
   - Set up Claude Agent SDK in Lambda
   - Create main orchestrator agent
   - Define specialized sub-agents
   - Implement DynamoDB session management
   - Configure Lambda cold start optimization

6. **Memory & Relationship System (Future Phase)**
   - Implement core memory persistence (always free)
   - Build extended memory with semantic search
   - Create relationship progression logic (colleague → partner → friend)
   - Vector embeddings integration (OpenSearch or Pinecone)
   - **Spike Required**: GDPR compliance, data export, retention policies

7. **Voice Integration (Premium Feature - Phase 2)**
   - Set up WebSocket infrastructure for streaming audio
   - Integrate AWS Transcribe for speech-to-text
   - Implement Amazon Polly or ElevenLabs for TTS
   - Build voice session tracking and billing
   - Optimize for < 2s latency

8. **Subscription & Billing (Phase 2)**
   - Integrate Stripe for payment processing
   - Implement subscription tier enforcement
   - Build usage tracking (voice minutes, agent requests)
   - Create graceful degradation for expired subscriptions
   - Implement 90-day extended memory retention for lapsed users

---

**Note**: Archive items older than 2 weeks to keep document focused.
