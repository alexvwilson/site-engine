# Task 042: Legal Pages for Child Sites

> **Status:** Planning
> **Priority:** P2 - Medium
> **Complexity:** Medium-High

---

## 1. Task Overview

### Task Title
**Title:** AI-Generated Legal Pages for Child Sites

### Goal Statement
**Goal:** Enable child site owners to generate and customize their own legal pages (Privacy Policy, Terms of Service, Cookie Policy) using AI, so their footer links point to their own policies instead of Site Engine's. Generated pages are regular pages that can be fully edited after creation.

---

## 2. Strategic Analysis & Solution Options

### Problem Context
Footer legal links currently point to Site Engine's legal pages (`/privacy`, `/terms`), not the child site's own policies. This is unprofessional for child sites and may cause legal compliance issues. Site owners need their own legal content specific to their business.

### Recommended Solution
**Trigger.dev + GPT-4o AI Generation Flow:**
1. User fills simple form with business context (business type, data collected, jurisdiction)
2. User selects which legal pages to generate (checkboxes)
3. Background task generates content via GPT-4o
4. Pages are created as regular pages with Text block containing legal content
5. Footer links are auto-updated to point to new legal pages
6. User can edit pages like any other page in the editor

**Why this approach:**
- Consistent with existing patterns (Logo Generation uses same flow)
- Trigger.dev handles long-running AI generation without timeout
- Regular pages mean full editing capability with existing TipTap editor
- Auto-updating footer links provides complete solution

---

## 3. Project Analysis & Current State

### Technology & Architecture
- **Frameworks & Versions:** Next.js 15.3, React 19
- **Language:** TypeScript 5.4 with strict mode
- **Database & ORM:** Supabase (Postgres) via Drizzle ORM
- **UI & Styling:** shadcn/ui components with Tailwind CSS v4
- **Background Jobs:** Trigger.dev v4 for async task orchestration
- **AI Integration:** OpenAI GPT-4o (existing `generateStructuredOutput` utility)

### Current State
- Footer content stored in `sites.footer_content` JSONB column
- Footer links are manually configured with label/url pairs
- Pages can be created via `createPage()` server action
- Sections added via `addSection()` server action
- Logo generation task provides pattern for AI generation + Trigger.dev
- TipTap rich text editor already handles HTML content in Text blocks

### Existing Codebase Analysis

**Relevant Files:**
- `lib/drizzle/schema/sites.ts` - Site schema with `footer_content`
- `lib/drizzle/schema/pages.ts` - Page schema
- `app/actions/pages.ts` - `createPage()` function
- `app/actions/sections.ts` - `addSection()` function
- `components/sites/SettingsTab.tsx` - Settings UI (will add Legal Pages card)
- `trigger/tasks/generate-logo-prompts.ts` - Pattern for AI generation task
- `trigger/utils/ai-providers.ts` - `generateStructuredOutput()` utility

---

## 4. Context & Problem Definition

### Problem Statement
Child sites currently link to Site Engine's legal pages in their footers. This is unprofessional because:
1. Legal content doesn't match the child site's actual business practices
2. Users clicking legal links leave the child site context
3. For e-commerce or data-collecting sites, incorrect legal pages create compliance risks

### Success Criteria
- [ ] User can select which legal pages to generate (Privacy, Terms, Cookie Policy)
- [ ] Simple form collects necessary business context for AI generation
- [ ] AI generates appropriate legal content via Trigger.dev background task
- [ ] Legal pages are created as regular pages (appear in Pages list)
- [ ] Footer links are automatically updated to point to new legal pages
- [ ] Generated pages can be edited using existing page editor
- [ ] Progress indicator shows generation status
- [ ] Error handling for failed generations

---

## 5. Development Mode Context

- **This is a new application in active development**
- **No backwards compatibility concerns** - can add new tables/columns freely
- **Data loss acceptable** - existing data can be migrated aggressively
- **Priority: Speed and simplicity** over data preservation

---

## 6. Technical Requirements

### Functional Requirements
- User can open "Legal Pages" section in Settings tab
- User fills simple form:
  - Business type dropdown (e-commerce, blog, SaaS, portfolio, service business, other)
  - Data collection checkboxes (contact forms, analytics, cookies, user accounts, payments)
  - Jurisdiction dropdown (US, EU/GDPR, UK, Canada, Australia, other)
- User selects which pages to generate via checkboxes:
  - Privacy Policy
  - Terms of Service
  - Cookie Policy
- User clicks "Generate Legal Pages" button
- Progress indicator shows generation status
- Upon completion, pages appear in Pages list with slugs: `privacy-policy`, `terms-of-service`, `cookie-policy`
- Footer links are automatically updated
- User can navigate to pages and edit content like any other page

### Non-Functional Requirements
- **Performance:** Generation should complete within 30-60 seconds
- **Security:** Only authenticated site owners can generate pages for their sites
- **Usability:** Clear progress feedback, error messages for failures
- **Theme Support:** Generated pages use existing theme styling

### Technical Constraints
- Must use existing `generateStructuredOutput` AI utility
- Must use existing `createPage` and `addSection` patterns
- Must update `footer_content` JSONB to update footer links
- Pages must be regular pages (not special system pages)

---

## 7. Data & Database Changes

### Database Schema Changes

**New table: `legal_generation_jobs`**
```sql
CREATE TABLE legal_generation_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, generating, completed, failed
  progress_percentage INTEGER NOT NULL DEFAULT 0,

  -- Input configuration
  business_type TEXT NOT NULL,
  data_collection JSONB NOT NULL, -- Array of strings
  jurisdiction TEXT NOT NULL,
  pages_to_generate JSONB NOT NULL, -- Array: ["privacy", "terms", "cookies"]

  -- Output
  generated_content JSONB, -- { privacy: "...", terms: "...", cookies: "..." }
  created_page_ids JSONB, -- { privacy: "uuid", terms: "uuid", cookies: "uuid" }

  -- Error handling
  error_message TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX legal_generation_jobs_site_id_idx ON legal_generation_jobs(site_id);
CREATE INDEX legal_generation_jobs_user_id_idx ON legal_generation_jobs(user_id);
CREATE INDEX legal_generation_jobs_status_idx ON legal_generation_jobs(status);
```

### Data Model Updates

```typescript
// lib/drizzle/schema/legal-generation-jobs.ts
import { pgTable, text, timestamp, uuid, index, jsonb, integer } from "drizzle-orm/pg-core";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { users } from "./users";
import { sites } from "./sites";

export const LEGAL_JOB_STATUSES = ["pending", "generating", "completed", "failed"] as const;
export type LegalJobStatus = (typeof LEGAL_JOB_STATUSES)[number];

export const BUSINESS_TYPES = [
  "ecommerce",
  "blog",
  "saas",
  "portfolio",
  "service",
  "other"
] as const;
export type BusinessType = (typeof BUSINESS_TYPES)[number];

export const DATA_COLLECTION_TYPES = [
  "contact_forms",
  "analytics",
  "cookies",
  "user_accounts",
  "payments"
] as const;
export type DataCollectionType = (typeof DATA_COLLECTION_TYPES)[number];

export const JURISDICTIONS = [
  "us",
  "eu_gdpr",
  "uk",
  "canada",
  "australia",
  "other"
] as const;
export type Jurisdiction = (typeof JURISDICTIONS)[number];

export const LEGAL_PAGE_TYPES = ["privacy", "terms", "cookies"] as const;
export type LegalPageType = (typeof LEGAL_PAGE_TYPES)[number];

export interface LegalGeneratedContent {
  privacy?: string;
  terms?: string;
  cookies?: string;
}

export interface LegalCreatedPageIds {
  privacy?: string;
  terms?: string;
  cookies?: string;
}

export const legalGenerationJobs = pgTable(
  "legal_generation_jobs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    site_id: uuid("site_id")
      .notNull()
      .references(() => sites.id, { onDelete: "cascade" }),
    user_id: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: text("status", { enum: LEGAL_JOB_STATUSES }).notNull().default("pending"),
    progress_percentage: integer("progress_percentage").notNull().default(0),

    // Input configuration
    business_type: text("business_type", { enum: BUSINESS_TYPES }).notNull(),
    data_collection: jsonb("data_collection").$type<DataCollectionType[]>().notNull(),
    jurisdiction: text("jurisdiction", { enum: JURISDICTIONS }).notNull(),
    pages_to_generate: jsonb("pages_to_generate").$type<LegalPageType[]>().notNull(),

    // Output
    generated_content: jsonb("generated_content").$type<LegalGeneratedContent>(),
    created_page_ids: jsonb("created_page_ids").$type<LegalCreatedPageIds>(),

    // Error handling
    error_message: text("error_message"),

    // Timestamps
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("legal_generation_jobs_site_id_idx").on(t.site_id),
    index("legal_generation_jobs_user_id_idx").on(t.user_id),
    index("legal_generation_jobs_status_idx").on(t.status),
  ]
);

export type LegalGenerationJob = InferSelectModel<typeof legalGenerationJobs>;
export type NewLegalGenerationJob = InferInsertModel<typeof legalGenerationJobs>;
```

### Data Migration Plan
- [ ] Generate migration for new `legal_generation_jobs` table
- [ ] Create down migration before applying
- [ ] Apply migration

---

## 8. Backend Changes & Background Jobs

### Server Actions

**`app/actions/legal-pages.ts`**
```typescript
"use server";

// Start legal page generation
export async function startLegalPageGeneration(
  siteId: string,
  config: {
    businessType: BusinessType;
    dataCollection: DataCollectionType[];
    jurisdiction: Jurisdiction;
    pagesToGenerate: LegalPageType[];
  }
): Promise<{ success: boolean; jobId?: string; error?: string }>;

// Get job status (for polling or after completion)
export async function getLegalGenerationJob(
  jobId: string
): Promise<LegalGenerationJob | null>;

// Get latest job for a site (to show previous generations)
export async function getLatestLegalJobForSite(
  siteId: string
): Promise<LegalGenerationJob | null>;
```

### Trigger.dev Task

**`trigger/tasks/generate-legal-pages.ts`**

Task Flow:
1. Fetch job from database (0%)
2. Build AI prompt based on business context (10%)
3. Generate content for each selected page type (10-70%)
   - Privacy Policy
   - Terms of Service
   - Cookie Policy
4. Create pages via database insert (70-85%)
5. Add text sections with generated content (85-95%)
6. Update footer links (95-100%)
7. Mark job complete

---

## 8.1 Trigger.dev Task Architecture

### Task Definition Pattern

```typescript
// trigger/tasks/generate-legal-pages.ts
import { schemaTask, logger, metadata } from "@trigger.dev/sdk";
import { z } from "zod";

export const generateLegalPages = schemaTask({
  id: "generate-legal-pages",
  schema: z.object({
    jobId: z.string().uuid(),
  }),
  run: async ({ jobId }) => {
    // Implementation follows logo-prompts pattern
  },
});
```

### Task Utilities

**`trigger/utils/legal-prompts.ts`**
- `buildLegalPrompt()` - Construct AI prompt based on business context
- `legalContentSchema` - Zod schema for AI response validation

---

## 9. Frontend Changes

### New Components

**`components/sites/LegalPagesCard.tsx`**
- Card UI for Settings tab
- Form with:
  - Business type dropdown
  - Data collection checkboxes
  - Jurisdiction dropdown
  - Page type checkboxes (Privacy, Terms, Cookies)
  - Generate button
- Progress indicator during generation
- Success state showing created pages with edit links

**`components/sites/LegalPagesModal.tsx`** (Optional)
- If form is complex, could use modal instead of inline card
- Decision: Start with inline card, simpler UX

### Page Updates
- `components/sites/SettingsTab.tsx` - Add LegalPagesCard after existing cards

### State Management
- Use local state for form inputs
- Poll job status during generation (or use Trigger.dev realtime)
- Refresh page list after completion

---

## 10. Code Changes Overview

### Files to Create
```
lib/drizzle/schema/legal-generation-jobs.ts    # New schema
app/actions/legal-pages.ts                      # Server actions
trigger/tasks/generate-legal-pages.ts           # Background task
trigger/utils/legal-prompts.ts                  # AI prompt utilities
components/sites/LegalPagesCard.tsx             # Settings UI
```

### Files to Modify
```
lib/drizzle/schema/index.ts                     # Export new schema
trigger/index.ts                                # Register new task
components/sites/SettingsTab.tsx                # Add LegalPagesCard
app/actions/sites.ts                            # Add footer link update helper
```

---

## 11. Implementation Plan

### Phase 1: Database Setup
**Goal:** Create legal_generation_jobs table

- [ ] **Task 1.1:** Create schema file `lib/drizzle/schema/legal-generation-jobs.ts`
- [ ] **Task 1.2:** Export from `lib/drizzle/schema/index.ts`
- [ ] **Task 1.3:** Generate migration with `npm run db:generate`
- [ ] **Task 1.4:** Create down migration (MANDATORY)
- [ ] **Task 1.5:** Apply migration with `npm run db:migrate`

### Phase 2: AI Prompt Utilities
**Goal:** Create prompt engineering for legal content generation

- [ ] **Task 2.1:** Create `trigger/utils/legal-prompts.ts`
  - `buildLegalPrompt()` function
  - Zod schema for structured output
  - Prompt templates for each legal page type

### Phase 3: Trigger.dev Task
**Goal:** Implement background generation task

- [ ] **Task 3.1:** Create `trigger/tasks/generate-legal-pages.ts`
- [ ] **Task 3.2:** Register task in `trigger/index.ts`
- [ ] **Task 3.3:** Implement generation flow:
  - Fetch job
  - Generate content via AI
  - Create pages
  - Add text sections
  - Update footer links
  - Mark complete

### Phase 4: Server Actions
**Goal:** Create API layer for frontend

- [ ] **Task 4.1:** Create `app/actions/legal-pages.ts`
  - `startLegalPageGeneration()`
  - `getLegalGenerationJob()`
  - `getLatestLegalJobForSite()`

### Phase 5: Frontend UI
**Goal:** Build Settings tab integration

- [ ] **Task 5.1:** Create `components/sites/LegalPagesCard.tsx`
  - Form with all inputs
  - Generate button
  - Progress state
  - Success state with page links
- [ ] **Task 5.2:** Integrate into `components/sites/SettingsTab.tsx`

### Phase 6: Testing & Validation
**Goal:** Verify end-to-end flow

- [ ] **Task 6.1:** Test generation with different business types
- [ ] **Task 6.2:** Verify pages appear in Pages list
- [ ] **Task 6.3:** Verify footer links are updated
- [ ] **Task 6.4:** Verify pages are editable
- [ ] **Task 6.5:** Test error handling for failed generations

---

## 12. Task Completion Tracking

_Will be updated during implementation_

---

## 13. File Structure & Organization

### New Files to Create
```
project-root/
├── lib/drizzle/schema/
│   └── legal-generation-jobs.ts      # Database schema
├── app/actions/
│   └── legal-pages.ts                # Server actions
├── trigger/
│   ├── tasks/
│   │   └── generate-legal-pages.ts   # Background task
│   └── utils/
│       └── legal-prompts.ts          # AI prompts
└── components/sites/
    └── LegalPagesCard.tsx            # Settings UI
```

### Files to Modify
- `lib/drizzle/schema/index.ts` - Export new schema
- `trigger/index.ts` - Register new task
- `components/sites/SettingsTab.tsx` - Add LegalPagesCard
- `app/actions/sites.ts` - Footer link update utility (optional, may integrate directly)

---

## 14. Potential Issues & Security Review

### Error Scenarios
- [ ] **AI generation timeout:** Task has built-in retry, metadata tracks failure
- [ ] **Page slug conflict:** Generate unique slugs if `privacy-policy` already exists
- [ ] **Partial generation failure:** If one page fails, still create successful ones

### Edge Cases
- [ ] **Regeneration:** User wants to regenerate - should warn about overwriting
- [ ] **Existing legal pages:** Check if pages with legal slugs exist, warn user
- [ ] **Footer already has legal links:** Update existing vs add new

### Security
- [ ] **Site ownership:** Verify user owns site before generation
- [ ] **Rate limiting:** Consider limiting regenerations (cost of AI calls)

---

## 15. Deployment & Configuration

### Environment Variables
No new environment variables needed - uses existing `OPENAI_API_KEY`.

---

## 16. AI Agent Instructions

### Implementation Approach
1. Create database schema first
2. Build AI prompt utilities (test prompts separately if needed)
3. Implement Trigger.dev task
4. Create server actions
5. Build frontend UI
6. Test end-to-end flow

### Code Quality Standards
- Follow existing patterns from `generate-logo-prompts.ts`
- Use `schemaTask` with Zod validation
- Progress tracking via `metadata.set()`
- Proper error handling and database status updates

---

## 17. Notes & Additional Context

### AI Prompt Strategy
Legal content generation should:
- Be clearly labeled as AI-generated (user should review)
- Include appropriate disclaimers
- Be jurisdiction-aware (GDPR for EU, CCPA for California, etc.)
- Be business-type specific
- Reference actual data collection practices

### Footer Link Slugs
Standard slugs for legal pages:
- Privacy Policy: `/privacy-policy`
- Terms of Service: `/terms-of-service`
- Cookie Policy: `/cookie-policy`

### Reference Implementation
See `trigger/tasks/generate-logo-prompts.ts` for:
- Task structure
- Progress tracking
- Error handling
- Database updates

---

## 18. Second-Order Consequences & Impact Analysis

### Breaking Changes Analysis
- [ ] **No breaking changes** - all new functionality
- [ ] Pages table unchanged - just adding pages normally
- [ ] Footer content structure unchanged - just adding/updating links

### Ripple Effects Assessment
- [ ] **Footer rendering** - no changes needed, already handles links array
- [ ] **Page list** - new pages appear automatically
- [ ] **Published site** - legal pages render like any other page

### User Experience Impacts
- [ ] **Positive:** Site owners get professional legal pages easily
- [ ] **Consideration:** Generated content should include disclaimer to review with lawyer

---

**Last Updated:** 2025-12-30
**Created By:** Claude Code

---

**Total Estimated Files:** 6 new files, 4 modified files
