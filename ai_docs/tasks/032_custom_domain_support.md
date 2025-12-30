# Task 032: Custom Domain Support

## 1. Task Overview

### Task Title
**Title:** Custom Domain Support with Vercel API Integration

### Goal Statement
**Goal:** Allow users to connect custom domains (e.g., www.example.com) to their published sites. Domains are managed via Vercel's API with automatic SSL provisioning. Sites remain accessible at both the custom domain AND the default `/sites/[slug]` URL.

---

## 2. Strategic Analysis & Solution Options

### Problem Context
Users want professional, branded URLs for their sites instead of `/sites/my-site-slug`. Since we're hosted on Vercel, we can leverage their domain API for automatic DNS verification and SSL certificate provisioning.

### Recommended Solution
**Vercel API Integration with Hybrid Verification**
- Try automatic Vercel verification first
- Fall back to manual DNS instructions if issues arise
- Background polling via Trigger.dev for verification status
- Middleware-based routing for custom domain requests

**Why this approach:**
1. **Vercel handles complexity** - SSL certificates, DNS verification, edge routing
2. **Best UX** - Automatic when possible, clear instructions when manual
3. **Resilient** - Background polling catches delayed DNS propagation
4. **Non-breaking** - `/sites/[slug]` continues working as fallback

---

## 3. Project Analysis & Current State

### Technology & Architecture
- **Frameworks & Versions:** Next.js 15, React 19
- **Database & ORM:** Supabase (Postgres) via Drizzle ORM
- **Background Jobs:** Trigger.dev v4
- **Hosting:** Vercel (automatic SSL, edge network)

### Current State
- `custom_domain` field exists in `sites` table (unique, indexed) but unused
- Settings UI has disabled input with "Coming Soon" label
- `updateSiteSettings()` server action already handles custom_domain field
- No Vercel API integration exists
- Middleware only handles authentication, no domain routing

### Existing Codebase Analysis

**Checked:**
- [x] **Database Schema** (`lib/drizzle/schema/sites.ts`) - custom_domain field exists
- [x] **Server Actions** (`app/actions/sites.ts`) - updateSiteSettings handles custom_domain
- [x] **Middleware** (`middleware.ts`) - Only auth, no domain routing
- [x] **Settings UI** (`components/sites/SettingsTab.tsx`) - Disabled input at lines 226-243
- [x] **Published Routes** (`app/(sites)/sites/[siteSlug]/`) - Current routing structure
- [x] **Trigger.dev Tasks** - Pattern from `trigger/tasks/generate-theme-quick.ts`

---

## 4. Context & Problem Definition

### Problem Statement
Published sites are only accessible via `/sites/[slug]` URLs. Users want to use their own domains for professional branding. The `custom_domain` database field exists but has no functionality.

### Success Criteria
- [x] User can enter a custom domain in Settings
- [x] Domain is added to Vercel project via API
- [x] DNS instructions shown when manual verification needed
- [x] Background task polls for verification status
- [x] Verified domains route correctly via middleware
- [x] SSL certificates provisioned automatically by Vercel
- [x] Both custom domain AND `/sites/[slug]` URLs work
- [x] User can remove a custom domain

---

## 5. Development Mode Context

- **No backwards compatibility concerns** - custom_domain field exists but unused
- **Data loss acceptable** - No production custom domains exist yet
- **Priority: Speed and simplicity** - Leverage Vercel's built-in capabilities

---

## 6. Technical Requirements

### Functional Requirements
- User can add a custom domain (apex or subdomain) in Settings
- System calls Vercel API to add domain to project
- If not auto-verified, show DNS configuration instructions
- Background task polls Vercel for verification status
- Middleware routes custom domain requests to correct site
- User can manually trigger verification retry
- User can remove a custom domain
- Domain verification status visible in Settings UI

### Non-Functional Requirements
- **Performance:** Domain lookup in middleware must be fast (cached)
- **Security:** Only verified domains route to sites
- **Usability:** Clear DNS instructions with copy buttons
- **Reliability:** Background polling handles DNS propagation delays

### Technical Constraints
- Must use Vercel REST API (no SDK needed)
- Requires `VERCEL_API_TOKEN` and `VERCEL_PROJECT_ID` env vars
- Middleware runs on Edge - limited to edge-compatible operations

---

## 7. Data & Database Changes

### Database Schema Changes

**File: `lib/drizzle/schema/sites.ts`**

Add columns to existing sites table:
```typescript
// Domain verification status
domain_verification_status: text("domain_verification_status"), // "pending" | "verified" | "failed"
domain_verification_challenges: jsonb("domain_verification_challenges").$type<VercelVerificationChallenge[]>(),
domain_verified_at: timestamp("domain_verified_at", { withTimezone: true }),
domain_ssl_status: text("domain_ssl_status"), // "pending" | "issued" | "failed"
domain_error_message: text("domain_error_message"),
```

**New File: `lib/drizzle/schema/domain-verification-jobs.ts`**

```typescript
export const domainVerificationJobs = pgTable(
  "domain_verification_jobs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    site_id: uuid("site_id").notNull().references(() => sites.id, { onDelete: "cascade" }),
    user_id: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    domain: text("domain").notNull(),
    status: text("status", { enum: ["pending", "verifying", "completed", "failed"] }).notNull().default("pending"),
    verification_attempts: integer("verification_attempts").notNull().default(0),
    max_attempts: integer("max_attempts").notNull().default(20),
    last_check_at: timestamp("last_check_at", { withTimezone: true }),
    error_message: text("error_message"),
    trigger_run_id: text("trigger_run_id"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("domain_verification_jobs_site_id_idx").on(t.site_id),
    index("domain_verification_jobs_status_idx").on(t.status),
  ]
);
```

### Down Migration Safety Protocol
- [ ] **Step 1:** Generate migration with `npm run db:generate`
- [ ] **Step 2:** Create down migration following `drizzle_down_migration.md`
- [ ] **Step 3:** Create `drizzle/migrations/[timestamp]/down.sql`
- [ ] **Step 4:** Verify all operations use `IF EXISTS`
- [ ] **Step 5:** Only then run `npm run db:migrate`

---

## 8. Backend Changes & Background Jobs

### Server Actions

**New File: `app/actions/domains.ts`**

| Action | Description |
|--------|-------------|
| `addCustomDomain(siteId, domain)` | Validate, call Vercel API, start verification job |
| `retryDomainVerification(siteId)` | Manual verification retry |
| `removeCustomDomain(siteId)` | Remove from Vercel and clear database |

### Trigger.dev Task

**New File: `trigger/tasks/verify-domain.ts`**

- Polls Vercel API every 30 seconds
- Max 20 attempts (~10 minutes)
- Updates site status when verified
- Marks as failed on timeout

### New Utility Files

**`lib/vercel.ts`** - Vercel API client
- `addDomainToProject(domain)`
- `verifyDomain(domain)`
- `getDomainConfig(domain)`
- `removeDomainFromProject(domain)`

**`lib/domain-utils.ts`** - Client-safe utilities
- `isValidDomain(domain)`
- `normalizeDomain(input)`
- `formatDnsInstructions(domain, challenges)`

### Query Functions

**`lib/queries/sites.ts`** - Add:
- `getPublishedSiteByDomain(domain)` - For middleware lookup

---

## 8.1. Trigger.dev Task Architecture

### Task Definition

```typescript
// trigger/tasks/verify-domain.ts
import { schemaTask, logger, metadata, wait } from "@trigger.dev/sdk";
import { z } from "zod";

export const verifyDomainTask = schemaTask({
  id: "verify-domain",
  schema: z.object({ jobId: z.string().uuid() }),
  run: async ({ jobId }) => {
    metadata.set("progress", 0);
    metadata.set("status", "verifying");

    // Polling loop with 30s intervals
    // Max 20 attempts
    // Update database on verification
  },
});
```

### Triggering from Server Action

```typescript
// In app/actions/domains.ts
import { tasks } from "@trigger.dev/sdk";
import type { verifyDomainTask } from "@/trigger/tasks/verify-domain";

const handle = await tasks.trigger<typeof verifyDomainTask>("verify-domain", { jobId });
await db.update(domainVerificationJobs).set({ trigger_run_id: handle.id });
```

---

## 9. Frontend Changes

### Modified Components

**`components/sites/SettingsTab.tsx`**

Replace disabled input (lines 226-243) with:
- **No domain:** Input field + "Connect Domain" button
- **Pending:** Yellow badge, DNS instructions, retry button
- **Verified:** Green badge, SSL status, remove button

### New Components

**`components/sites/DnsInstructionsCard.tsx`**
- Display DNS records to configure
- Copy button for each value
- Record type badges (A, CNAME, TXT)

---

## 10. Code Changes Overview

### Current Implementation (Before)

```typescript
// components/sites/SettingsTab.tsx (lines 226-243)
<div className="space-y-2">
  <Label htmlFor="customDomain">
    Custom Domain{" "}
    <span className="text-muted-foreground">(Coming Soon)</span>
  </Label>
  <Input
    id="customDomain"
    placeholder="www.example.com"
    value={customDomain}
    onChange={(e) => setCustomDomain(e.target.value)}
    disabled={true}
    className="max-w-md"
  />
  <p className="text-sm text-muted-foreground">
    Connect your own domain to this site. This feature will be
    available soon.
  </p>
</div>
```

### After Implementation

```typescript
// Full domain management UI with three states:
// 1. No domain - input + connect button
// 2. Pending verification - DNS instructions + retry
// 3. Verified - green badge + SSL status + remove
```

### Key Changes Summary
- [ ] **Database:** Add 5 domain columns to sites + verification jobs table
- [ ] **Environment:** Add VERCEL_API_TOKEN, VERCEL_PROJECT_ID
- [ ] **API Client:** Create lib/vercel.ts for Vercel REST API
- [ ] **Server Actions:** Create app/actions/domains.ts
- [ ] **Background Task:** Create trigger/tasks/verify-domain.ts
- [ ] **Middleware:** Add custom domain routing logic
- [ ] **UI:** Full domain management in SettingsTab

---

## 11. Implementation Plan

### Phase 1: Database Schema
**Goal:** Add domain verification fields and job tracking table

- [ ] **Task 1.1:** Update `lib/drizzle/schema/sites.ts` with domain columns
- [ ] **Task 1.2:** Create `lib/drizzle/schema/domain-verification-jobs.ts`
- [ ] **Task 1.3:** Update `lib/drizzle/schema/index.ts` exports
- [ ] **Task 1.4:** Generate migration with `npm run db:generate`
- [ ] **Task 1.5:** Create down migration file
- [ ] **Task 1.6:** Apply migration with `npm run db:migrate`

### Phase 2: Environment & Utilities
**Goal:** Set up Vercel API access and helper functions

- [ ] **Task 2.1:** Update `lib/env.ts` with VERCEL_API_TOKEN, VERCEL_PROJECT_ID, VERCEL_TEAM_ID
- [ ] **Task 2.2:** Create `lib/domain-utils.ts` (client-safe validation)
- [ ] **Task 2.3:** Create `lib/vercel.ts` (API client)

### Phase 3: Server Actions
**Goal:** Implement domain management operations

- [ ] **Task 3.1:** Create `app/actions/domains.ts` with addCustomDomain, retryDomainVerification, removeCustomDomain

### Phase 4: Background Task
**Goal:** Implement verification polling

- [ ] **Task 4.1:** Create `trigger/tasks/verify-domain.ts`
- [ ] **Task 4.2:** Update `trigger/index.ts` to export new task

### Phase 5: Middleware Routing
**Goal:** Route custom domains to correct sites

- [ ] **Task 5.1:** Update `middleware.ts` with domain detection and rewriting
- [ ] **Task 5.2:** Add `getPublishedSiteByDomain` to `lib/queries/sites.ts`

### Phase 6: UI Components
**Goal:** Build domain configuration interface

- [ ] **Task 6.1:** Create `components/sites/DnsInstructionsCard.tsx`
- [ ] **Task 6.2:** Update `components/sites/SettingsTab.tsx` with full domain UI

### Phase 7: Testing & Validation
**Goal:** Verify all functionality works

- [ ] **Task 7.1:** Test domain addition flow
- [ ] **Task 7.2:** Test DNS instructions display
- [ ] **Task 7.3:** Test verification polling
- [ ] **Task 7.4:** Test middleware routing
- [ ] **Task 7.5:** Test domain removal

### Phase 8: Code Review
**Goal:** Comprehensive review of all changes

- [ ] **Task 8.1:** Present "Implementation Complete!" message
- [ ] **Task 8.2:** Execute comprehensive code review

---

## 12. Task Completion Tracking

Timestamps will be added as tasks are completed.

---

## 13. File Structure & Organization

### New Files to Create
```
lib/
├── vercel.ts                    # Vercel API client
├── domain-utils.ts              # Domain validation (client-safe)
├── drizzle/schema/
│   └── domain-verification-jobs.ts

app/actions/
└── domains.ts                   # Domain management server actions

trigger/tasks/
└── verify-domain.ts             # Background verification polling

components/sites/
└── DnsInstructionsCard.tsx      # DNS configuration display
```

### Files to Modify
- [ ] `lib/drizzle/schema/sites.ts` - Add domain columns
- [ ] `lib/drizzle/schema/index.ts` - Export new schema
- [ ] `lib/env.ts` - Add Vercel env vars
- [ ] `lib/queries/sites.ts` - Add getPublishedSiteByDomain
- [ ] `middleware.ts` - Add domain routing
- [ ] `components/sites/SettingsTab.tsx` - Domain configuration UI
- [ ] `trigger/index.ts` - Export verify-domain task

### Dependencies to Add
None - using Vercel REST API directly (no SDK needed)

---

## 14. Potential Issues & Security Review

### Error Scenarios
- [ ] **Vercel API rate limits** - Add exponential backoff
- [ ] **DNS propagation delays** - Background polling handles this
- [ ] **Domain already on Vercel** - Clear error message
- [ ] **Invalid domain format** - Client-side validation

### Edge Cases
- [ ] **Apex vs subdomain** - Both supported, different DNS records
- [ ] **Domain used by another site** - Unique constraint in DB
- [ ] **User removes domain mid-verification** - Cancel polling job

### Security Considerations
- [ ] **Only site owner can manage domain** - Check user_id in actions
- [ ] **Only verified domains route** - Middleware checks verification status
- [ ] **Vercel API token server-only** - In env.ts server section

---

## 15. Deployment & Configuration

### Environment Variables Required
```bash
# Add to .env.local and production
VERCEL_API_TOKEN=your_token_here
VERCEL_PROJECT_ID=prj_xxxxxxxxxxxxx
VERCEL_TEAM_ID=team_xxxxxxxxxxxxx  # Optional, for team accounts
```

### How to Get These Values
1. **VERCEL_API_TOKEN:** Vercel Dashboard → Settings → Tokens → Create
2. **VERCEL_PROJECT_ID:** Project Settings → General → Project ID
3. **VERCEL_TEAM_ID:** Team Settings → General → Team ID (if applicable)

---

## 16. AI Agent Instructions

Follow standard task template workflow:
1. Execute phase-by-phase with user approval between phases
2. Update this document with completion timestamps
3. Create down migration before applying database changes
4. Present comprehensive code review after implementation

---

## 17. Notes & Additional Context

### Vercel API Documentation
- Domains API: https://vercel.com/docs/rest-api/endpoints#domains
- Project Domains: https://vercel.com/docs/rest-api/endpoints#project-domains

### DNS Record Types
- **A Record:** For apex domains (example.com) → 76.76.21.21
- **CNAME:** For subdomains (www.example.com) → cname.vercel-dns.com
- **TXT:** For verification challenges

### User Flow
1. User enters domain in Settings
2. We call Vercel API to add domain
3. If auto-verified (rare) → Done, SSL provisioned
4. If not → Show DNS instructions, start polling
5. User adds DNS records at their registrar
6. Polling detects verification → Update status
7. Site accessible at custom domain + /sites/slug

---

## 18. Second-Order Consequences & Impact Analysis

### Breaking Changes Identified
- None - new feature, no existing functionality affected

### Performance Implications
- Middleware adds domain lookup - mitigated by caching
- Background polling uses Trigger.dev resources

### Security Considerations
- New API token required (VERCEL_API_TOKEN)
- Only verified domains can route to sites

### User Experience Impacts
- Positive - users get professional custom domains
- Clear DNS instructions reduce confusion

### Mitigation Strategies
- Domain lookup caching (1 min TTL) in middleware
- Max polling attempts prevent runaway jobs
- Both URLs continue working for reliability

---

*Task Document Created: 2025-12-30*
*Status: Ready for Implementation*
