# Xero API Pricing Changes - Impact Analysis

> **Purpose**: Analysis of Xero's new developer pricing model and its impact on Pip
> **Created**: 2025-12-04
> **Status**: Research Complete

---

## Executive Summary

Xero is replacing its revenue-share model with usage-based pricing tiers effective **March 2, 2026**. For Pip, this is **net positive** in the short term (free tier expanded from 25 to 5 connections, but sufficient for beta) and **manageable** long-term (Core tier at $35 AUD/month covers up to 50 connections).

**Critical Policy Change**: As of December 4, 2025, Xero prohibits using API data to train AI/ML models. This does NOT affect Pip (we use LLMs for inference, not training).

---

## New Pricing Tiers (Effective March 2, 2026)

| Tier | Monthly Fee | Connections | Egress | Rate Limit | App Store |
|------|-------------|-------------|--------|------------|-----------|
| **Starter** | Free | 5 | Unlimited | 1,000/day/org | Not available |
| **Core** | $35 AUD (~$23 USD) | 50 | 10 GB | 5,000/day/org | Not available |
| **Plus** | $245 AUD (~$160 USD) | 1,000 | 50 GB | 5,000/day/org | Optional |
| **Advanced** | $1,445 AUD (~$940 USD) | 10,000 | 250 GB | 5,000/day/org | Optional |
| **Enterprise** | Custom | Unlimited | Custom | Custom | Required |

**Egress Overage**: $2.40 AUD/GB beyond monthly allowance

---

## Key Changes from Current Model

### What's Changing

| Aspect | Current (Pre-March 2026) | New (Post-March 2026) |
|--------|--------------------------|------------------------|
| **Free Tier Limit** | 25 connections (unapproved apps) | 5 connections (Starter) |
| **Paid Entry Point** | Revenue share / App Store listing | $35 AUD/month (Core) |
| **Rate Limits** | Same for all | 1,000/day (Starter) vs 5,000/day (Core+) |
| **App Store Required** | For >25 connections | Only for Plus+ (optional) or Enterprise (required) |

### What's Staying the Same

- OAuth 2.0 authentication model
- API endpoint structure
- Token refresh patterns
- Core API functionality (invoices, reports, contacts, etc.)

---

## Timeline

| Date | Event | Impact on Pip |
|------|-------|---------------|
| **Dec 4, 2025** | New policy terms apply to NEW developers | We registered before this - no immediate impact |
| **Dec 4, 2025** | AI/ML training prohibition in effect | No impact (we don't train models) |
| **Mar 2, 2026** | Migration begins for existing apps | 30-day notice before our migration |
| **Mid-Mar 2026** | Tier assignment starts | We'll be assigned based on current connections |
| **Jul 1, 2026** | XASS (revenue share) fully retired | N/A - we're not on XASS |

---

## Impact Analysis for Pip

### Short Term (Now → March 2026)

**Status**: GREEN - No barriers

| Aspect | Assessment |
|--------|------------|
| Current connections | ~1-2 (development + production testing) |
| Current limit | 25 connections (unapproved app) |
| Runway | Plenty of room for beta testing |
| Rate limits | 5,000/day/org - sufficient for conversational use |
| Cost | $0 - free tier |

**Recommended Actions**:
1. Continue development normally
2. Track connection count in admin dashboard (already planned in risk_000)
3. No need to rush app approval process

### Medium Term (March 2026 → Production)

**Status**: YELLOW - Minor cost consideration

| Scenario | Tier | Monthly Cost | Notes |
|----------|------|--------------|-------|
| Beta (≤5 users) | Starter | $0 | Reduced from 25 to 5 connections |
| Early Production (6-50 users) | Core | $35 AUD | New cost - budget accordingly |
| Growth (51-1000 users) | Plus | $245 AUD | Includes App Store listing option |

**Key Concern**: The free tier drops from 25 → 5 connections. If we have 6+ beta users by March 2026, we'll need to upgrade to Core ($35 AUD/month).

**Recommended Actions**:
1. Monitor connection count - plan for Core tier when approaching 5
2. Budget $35 AUD/month ($420 AUD/year) for production
3. No App Store listing required until Plus tier (optional even then)

### Long Term (Production Scale)

**Status**: GREEN - Predictable costs

| Scale | Tier | Annual Cost | Cost per User |
|-------|------|-------------|---------------|
| 50 users | Core | $420 AUD | $8.40/user/year |
| 1,000 users | Plus | $2,940 AUD | $2.94/user/year |
| 10,000 users | Advanced | $17,340 AUD | $1.73/user/year |

**Observation**: Costs scale favorably. At production scale (1000+ users), Xero API costs become negligible per user.

---

## AI/ML Policy Analysis

### The Restriction

> "Data from Xero APIs may not be used to train or contribute to the creation of any AI or machine learning model."

### Does This Affect Pip?

**NO** - Here's why:

| Activity | Pip's Approach | Policy Status |
|----------|----------------|---------------|
| **Model Training** | We use pre-trained Claude/Ollama models | NOT AFFECTED |
| **Fine-tuning** | Not performed | NOT AFFECTED |
| **RAG/Retrieval** | Data used for context in queries | ALLOWED (inference) |
| **Tool Calling** | LLM calls Xero tools, processes results | ALLOWED (inference) |
| **Memory Storage** | User preferences stored locally | ALLOWED (not training) |

**Clarification**: The policy prohibits using Xero data to improve/train AI models. Using AI to *query* Xero data (inference) is explicitly encouraged via their "AI Toolkit" and "Agentic Toolkit" offerings.

### Evidence of AI-Friendly Intent

Xero's FAQ mentions:
- "AI Toolkit" available to all tiers
- "Agentic Toolkit" for developers
- "MCP Server" compatibility
- "LLM integration" guidance

They're prohibiting data *extraction for training*, not AI-assisted *access* to data.

---

## Comparison: Old vs New Model

### Previous Barrier: 25-User Limit + App Approval

- Required Xero App Store submission for >25 connections
- App approval process (weeks/months)
- Revenue share model if using App Store billing

### New Model: Pay-to-Scale

- 5 free connections (down from 25)
- Pay $35/month for up to 50 connections (no approval needed)
- App Store listing optional until Enterprise tier

**Net Assessment**: **Simpler path to production**, but earlier (lower) paywall.

---

## Risk Updates

### risk_000 (Existing): 25-User Limit

**Status**: NEEDS UPDATE - Limit changing to 5 connections

| Aspect | Old Risk | New Risk |
|--------|----------|----------|
| Limit | 25 connections | 5 connections (Starter tier) |
| Mitigation | Apply for app approval | Upgrade to Core tier ($35/mo) |
| Timeline | Before hitting 25 users | Before hitting 5 users |
| Complexity | App Store submission | Add payment method |

### New Risk: Beta User Limit Reduction

- **Risk**: Free tier drops from 25 → 5 connections in March 2026
- **Impact**: May need to pay $35/month earlier than planned
- **Mitigation**: Budget for Core tier; track connection count

---

## Recommendations

### Immediate (This Week)

- [x] Document pricing changes (this document)
- [ ] Update ISSUES.md with new risk details
- [ ] Add connection count tracking to admin dashboard

### Before March 2026

- [ ] Monitor beta user count vs 5-connection limit
- [ ] Budget $420 AUD/year for Core tier
- [ ] Prepare payment method for Xero Developer Portal

### For Production Planning

- [ ] Include Xero API costs in business model
- [ ] Consider App Store listing at Plus tier (optional - adds discoverability)
- [ ] Plan for egress monitoring (10GB included in Core)

---

## Egress Estimation

**Question**: Will 10GB egress (Core tier) be sufficient?

### Calculation

| API Call | Typical Response Size | Calls/User/Month |
|----------|----------------------|------------------|
| get_invoices | ~5 KB | 30 |
| get_profit_and_loss | ~10 KB | 5 |
| get_balance_sheet | ~10 KB | 5 |
| get_contacts | ~3 KB | 10 |
| get_bank_transactions | ~8 KB | 20 |

**Per User**: ~(30×5 + 5×10 + 5×10 + 10×3 + 20×8) = ~440 KB/month

**50 Users (Core tier max)**: ~22 MB/month

**Conclusion**: 10GB egress is **more than sufficient** - we'd use ~0.02% of allocation.

---

## Sources

- [Xero Developer Pricing](https://developer.xero.com/pricing)
- [Xero Developer FAQ](https://developer.xero.com/faq)
- [OAuth 2.0 API Limits](https://developer.xero.com/documentation/guides/oauth2/limits/)

---

## Document History

| Date | Author | Changes |
|------|--------|---------|
| 2025-12-04 | Claude | Initial research and analysis |
