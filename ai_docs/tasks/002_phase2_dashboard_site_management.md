# AI Task Template

---

## 1. Task Overview

### Task Title
**Title:** Phase 2: Dashboard & Site Management - Replace Transcription with Sites

### Goal Statement
**Goal:** Transform the transcription application into a site management platform by removing all transcription-related code/tables and building a new sites dashboard where users can create, view, and manage their websites. This establishes the core data model and UI foundation for the Site Engine application.

---

## 2. Strategic Analysis & Solution Options

### When to Use Strategic Analysis
This task is straightforward - the roadmap has already defined the approach. No strategic analysis needed as the implementation path is clear.

---

## 3. Project Analysis & Current State

### Technology & Architecture
- **Frameworks & Versions:** Next.js 15.3, React 19
- **Language:** TypeScript 5.x with strict mode
- **Database & ORM:** Supabase (Postgres) via Drizzle ORM
- **UI & Styling:** shadcn/ui components with Tailwind CSS v4
- **Authentication:** Supabase Auth managed by `middleware.ts` for protected routes
- **Background Jobs:** Trigger.dev v4 for async task orchestration
- **Key Architectural Patterns:** Next.js App Router, Server Components, Server Actions

### Current State
The application is currently a transcription app with:
- **Database tables:** `transcription_jobs`, `transcripts`, `ai_summaries`, `transcript_conversations`, `transcript_messages`, `users`
- **Trigger.dev tasks:** 5 transcription-related tasks (extract-audio, chunk-audio, transcribe-audio, generate-ai-summary, answer-transcript-question)
- **Components:** 20+ transcription-specific components in `components/transcripts/`
- **Routes:** `/transcripts` and `/transcripts/[jobId]` pages
- **Actions:** `transcriptions.ts`, `transcript-qa.ts` in `app/actions/`
- **Lib files:** Multiple transcription-related utilities (`jobs.ts`, `transcripts.ts`, `upload.ts`, etc.)

### Existing Codebase Analysis

**Checked Areas:**

- [x] **Database Schema** (`lib/drizzle/schema/*.ts`)
  - 6 schema files: users (keep), transcription-jobs, transcripts, ai-summaries, transcript-conversations, transcript-messages (all to be dropped)
  - Index file exports all schemas

- [x] **Server Actions** (`app/actions/*.ts`)
  - `transcriptions.ts` - to be deleted
  - `transcript-qa.ts` - to be deleted
  - `auth.ts`, `profile.ts`, `admin.ts` - keep

- [x] **Trigger.dev Tasks** (`trigger/tasks/`, `trigger/utils/`)
  - 5 tasks to delete: extract-audio, chunk-audio, transcribe-audio, generate-ai-summary, answer-transcript-question
  - Utils to delete: ffmpeg.ts, formats.ts, prompts.ts, transcript-context.ts
  - Utils to keep: openai.ts (for Phase 5 theme generation)

- [x] **Component Patterns** (`components/transcripts/`)
  - 20 components all transcription-specific - entire directory to be deleted

- [x] **Navigation** (`components/layout/AppSidebar.tsx`)
  - Currently has "Transcripts" nav item pointing to `/transcripts`
  - Need to change to "Dashboard" pointing to `/app`

---

## 4. Context & Problem Definition

### Problem Statement
The application is currently a transcription tool, but we're pivoting to Site Engine - an AI-powered website builder. We need to:
1. Remove all transcription functionality (database, code, UI)
2. Create the new sites data model
3. Build the dashboard UI for site management
4. Update navigation to reflect the new purpose

This is a foundational change that must be completed before any other Site Engine features can be built.

### Success Criteria
- [ ] All transcription database tables dropped
- [ ] New `sites` table created with correct schema
- [ ] All transcription code removed (tasks, utils, components, actions, lib files)
- [ ] Dashboard page at `/app` displays user's sites in a grid
- [ ] Users can create new sites via modal
- [ ] Users can view site cards with name, status badge, page count (0), last updated
- [ ] Sites can be sorted by last updated, name, or date created
- [ ] Empty state shows when user has no sites
- [ ] Navigation updated to show "Dashboard" instead of "Transcripts"
- [ ] All lint and type checks pass

---

## 5. Development Mode Context

### Development Mode Context
- **This is a new application in active development**
- **No backwards compatibility concerns** - feel free to make breaking changes
- **Data loss acceptable** - existing transcription data can be wiped
- **Users are developers/testers** - not production users
- **Priority: Speed and simplicity** over data preservation

---

## 6. Technical Requirements

### Functional Requirements
- User can view all their sites on the dashboard
- User can create a new site with name and optional description
- User can see site status (Draft/Published) on cards
- User can sort sites by: Last Updated (default), Name (A-Z), Date Created
- User can click a site card to navigate to site detail (Phase 3 - just route for now)
- Empty state displays when user has no sites with CTA to create first site

### Non-Functional Requirements
- **Performance:** Dashboard should load in <2s with up to 50 sites
- **Security:** Sites are scoped to authenticated user only
- **Usability:** Clean, intuitive grid layout with clear CTAs
- **Responsive Design:** Mobile (320px+), Tablet (768px+), Desktop (1024px+)
- **Theme Support:** Light and dark mode using existing theme system

### Technical Constraints
- Must use existing Drizzle ORM patterns
- Must use existing shadcn/ui component library
- Must follow Server Component patterns for data fetching
- Must use Server Actions for mutations

---

## 7. Data & Database Changes

### Database Schema Changes

**Tables to DROP:**
```sql
-- Drop in correct order due to foreign key constraints
DROP TABLE IF EXISTS transcript_messages;
DROP TABLE IF EXISTS transcript_conversations;
DROP TABLE IF EXISTS ai_summaries;
DROP TABLE IF EXISTS transcripts;
DROP TABLE IF EXISTS transcription_jobs;

-- Drop enums if they exist
DROP TYPE IF EXISTS transcription_job_status;
DROP TYPE IF EXISTS timestamp_granularity;
DROP TYPE IF EXISTS file_type;
```

**New Table to CREATE:**
```sql
-- Sites table
CREATE TABLE sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  slug TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX sites_user_id_idx ON sites(user_id);
CREATE INDEX sites_slug_idx ON sites(slug);
CREATE INDEX sites_status_idx ON sites(status);
CREATE INDEX sites_updated_at_idx ON sites(updated_at);
```

### Data Model Updates

```typescript
// lib/drizzle/schema/sites.ts
import { pgTable, text, timestamp, uuid, index } from "drizzle-orm/pg-core";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { users } from "./users";

export const SITE_STATUSES = ["draft", "published"] as const;
export type SiteStatus = (typeof SITE_STATUSES)[number];

export const sites = pgTable(
  "sites",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    user_id: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    slug: text("slug").notNull().unique(),
    status: text("status", { enum: SITE_STATUSES }).notNull().default("draft"),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    published_at: timestamp("published_at", { withTimezone: true }),
  },
  (t) => [
    index("sites_user_id_idx").on(t.user_id),
    index("sites_slug_idx").on(t.slug),
    index("sites_status_idx").on(t.status),
    index("sites_updated_at_idx").on(t.updated_at),
  ]
);

export type Site = InferSelectModel<typeof sites>;
export type NewSite = InferInsertModel<typeof sites>;
```

### Data Migration Plan
- [ ] No data migration needed - dropping all transcription data (development mode)
- [ ] Create migration to drop transcription tables
- [ ] Create migration to add sites table
- [ ] Run migrations in order

### Down Migration Safety Protocol
- [ ] **Step 1: Generate Migration** - Run `npm run db:generate`
- [ ] **Step 2: Create Down Migration** - Create `down.sql` for sites table
- [ ] **Step 3: Apply Migration** - Run `npm run db:migrate`

---

## 8. Backend Changes & Background Jobs

### Data Access Patterns

#### **MUTATIONS (Server Actions)** → `app/actions/sites.ts`
- [ ] `createSite(data: { name: string; description?: string })` - Create site with auto-generated slug
- [ ] `updateSite(siteId: string, data: { name?: string; description?: string; slug?: string })` - Update site
- [ ] `deleteSite(siteId: string)` - Delete site (cascades to pages in future)
- [ ] `publishSite(siteId: string)` - Set status to published, set published_at
- [ ] `unpublishSite(siteId: string)` - Set status to draft

#### **QUERIES (Data Fetching)** → `lib/queries/sites.ts`
- [ ] `getSites(userId: string, options?: { sortBy?: 'updated_at' | 'name' | 'created_at'; sortOrder?: 'asc' | 'desc' })` - All sites for user with sorting
- [ ] `getSiteById(siteId: string, userId: string)` - Single site with ownership check
- [ ] `getSiteBySlug(slug: string)` - For URL routing (no user check - for public access)

### No Trigger.dev Tasks in This Phase
Phase 2 does not require any background jobs. All operations are synchronous CRUD.

---

## 9. Frontend Changes

### New Components

#### `components/sites/` Directory
- [ ] **`SiteCard.tsx`** - Individual site card for grid display
  - Props: `site: Site`
  - Shows: name, description preview (truncated), status badge, page count (hardcoded 0), last updated relative time
  - Click navigates to `/app/sites/[siteId]`

- [ ] **`CreateSiteModal.tsx`** - Modal for creating new sites
  - Form fields: Site name (required), Description (optional)
  - Auto-generates slug from name on blur
  - Submit creates site and closes modal
  - Uses shadcn Dialog component

- [ ] **`EmptyState.tsx`** - Empty state for no sites
  - Friendly illustration/icon
  - "Create your first site" heading
  - "Get started by creating your first website" subtext
  - Primary CTA button opens CreateSiteModal

- [ ] **`SiteStatusBadge.tsx`** - Reusable status badge
  - Props: `status: 'draft' | 'published'`
  - Draft: gray/muted styling
  - Published: green/success styling

- [ ] **`SiteSortDropdown.tsx`** - Sorting dropdown
  - Options: Last Updated, Name (A-Z), Date Created
  - Uses shadcn Select or DropdownMenu

### Page Updates
- [ ] **Create `app/(protected)/app/page.tsx`** - Main dashboard
  - Server Component fetching user's sites
  - Grid layout (responsive: 1 col mobile, 2 col tablet, 3 col desktop)
  - Header with "My Sites" title and "Create Site" button
  - Sort dropdown in header
  - Empty state when no sites

- [ ] **Create `app/(protected)/app/loading.tsx`** - Loading skeleton
- [ ] **Create `app/(protected)/app/error.tsx`** - Error boundary

- [ ] **Delete `app/(protected)/transcripts/` directory** - All transcription pages

### Navigation Updates
- [ ] **Update `components/layout/AppSidebar.tsx`**
  - Change "Transcripts" to "Dashboard"
  - Change href from `/transcripts` to `/app`
  - Update icon from `FileAudio` to `LayoutDashboard` or similar
  - Update `getLinkClasses` function for new route matching

### State Management
- Dashboard uses Server Components - no client state for initial load
- CreateSiteModal uses local form state (React Hook Form or useState)
- Sorting uses URL search params for shareable/bookmarkable state

---

## 10. Code Changes Overview

### Files to DELETE

**Schema Files (5 files):**
```
lib/drizzle/schema/transcription-jobs.ts
lib/drizzle/schema/transcripts.ts
lib/drizzle/schema/ai-summaries.ts
lib/drizzle/schema/transcript-conversations.ts
lib/drizzle/schema/transcript-messages.ts
```

**Trigger Tasks (5 files):**
```
trigger/tasks/extract-audio.ts
trigger/tasks/chunk-audio.ts
trigger/tasks/transcribe-audio.ts
trigger/tasks/generate-ai-summary.ts
trigger/tasks/answer-transcript-question.ts
```

**Trigger Utils (4 files - keep openai.ts):**
```
trigger/utils/ffmpeg.ts
trigger/utils/formats.ts
trigger/utils/prompts.ts
trigger/utils/transcript-context.ts
```

**Components (entire directory - 20 files):**
```
components/transcripts/ (all files)
```

**Actions (2 files):**
```
app/actions/transcriptions.ts
app/actions/transcript-qa.ts
```

**Lib Files (5 files):**
```
lib/jobs.ts
lib/transcripts.ts
lib/transcription-constants.ts
lib/transcript-conversations.ts
lib/upload.ts
```

**Pages (entire directory):**
```
app/(protected)/transcripts/ (all files)
```

**API Routes:**
```
app/api/download/ (if exists)
```

### Files to CREATE

**Schema:**
```
lib/drizzle/schema/sites.ts
```

**Queries:**
```
lib/queries/sites.ts
```

**Actions:**
```
app/actions/sites.ts
```

**Components:**
```
components/sites/SiteCard.tsx
components/sites/CreateSiteModal.tsx
components/sites/EmptyState.tsx
components/sites/SiteStatusBadge.tsx
components/sites/SiteSortDropdown.tsx
```

**Pages:**
```
app/(protected)/app/page.tsx
app/(protected)/app/loading.tsx
app/(protected)/app/error.tsx
```

### Files to MODIFY

**Schema Index:**
```typescript
// lib/drizzle/schema/index.ts
// BEFORE:
export * from "./users";
export * from "./transcription-jobs";
export * from "./transcripts";
export * from "./ai-summaries";
export * from "./transcript-conversations";
export * from "./transcript-messages";

// AFTER:
export * from "./users";
export * from "./sites";
```

**Trigger Index:**
```typescript
// trigger/index.ts
// BEFORE:
export { extractAudioTask } from "./tasks/extract-audio";
export { chunkAudioTask } from "./tasks/chunk-audio";
export { transcribeAudioTask } from "./tasks/transcribe-audio";
export { generateAISummaryTask } from "./tasks/generate-ai-summary";
export * from "./utils/ffmpeg";
export * from "./utils/formats";
export * from "./utils/openai";
export * from "./utils/prompts";

// AFTER:
// Keep only OpenAI utility for Phase 5 theme generation
export * from "./utils/openai";
```

**AppSidebar Navigation:**
```typescript
// components/layout/AppSidebar.tsx
// BEFORE:
import { FileAudio } from "lucide-react";
const userNavItems = [
  { href: "/transcripts", label: "Transcripts", icon: FileAudio },
  { href: "/profile", label: "Profile", icon: User },
];

// AFTER:
import { LayoutDashboard } from "lucide-react";
const userNavItems = [
  { href: "/app", label: "Dashboard", icon: LayoutDashboard },
  { href: "/profile", label: "Profile", icon: User },
];
```

---

## 11. Implementation Plan

### Phase 1: Database Schema Changes
**Goal:** Drop transcription tables and create sites table

- [ ] **Task 1.1:** Delete schema files for transcription tables
  - Files: `lib/drizzle/schema/transcription-jobs.ts`, `transcripts.ts`, `ai-summaries.ts`, `transcript-conversations.ts`, `transcript-messages.ts`

- [ ] **Task 1.2:** Create sites schema file
  - File: `lib/drizzle/schema/sites.ts`
  - Define sites table with all fields and indexes

- [ ] **Task 1.3:** Update schema index
  - File: `lib/drizzle/schema/index.ts`
  - Remove transcription exports, add sites export

- [ ] **Task 1.4:** Generate and apply migration
  - Run `npm run db:generate`
  - Create down migration file
  - Run `npm run db:migrate`

### Phase 2: Remove Transcription Code
**Goal:** Delete all transcription-related code

- [ ] **Task 2.1:** Delete Trigger.dev tasks
  - Files: All 5 files in `trigger/tasks/`

- [ ] **Task 2.2:** Delete Trigger.dev utils (keep openai.ts)
  - Files: `ffmpeg.ts`, `formats.ts`, `prompts.ts`, `transcript-context.ts`

- [ ] **Task 2.3:** Update trigger/index.ts
  - File: `trigger/index.ts`
  - Remove task exports, keep only openai utility

- [ ] **Task 2.4:** Delete transcription actions
  - Files: `app/actions/transcriptions.ts`, `app/actions/transcript-qa.ts`

- [ ] **Task 2.5:** Delete lib files
  - Files: `lib/jobs.ts`, `lib/transcripts.ts`, `lib/transcription-constants.ts`, `lib/transcript-conversations.ts`, `lib/upload.ts`

- [ ] **Task 2.6:** Delete components/transcripts directory
  - Directory: `components/transcripts/` (all 20 files)

- [ ] **Task 2.7:** Delete transcripts pages
  - Directory: `app/(protected)/transcripts/` (all files)

- [ ] **Task 2.8:** Delete API routes if any
  - Directory: `app/api/download/` (if exists)

### Phase 3: Create Sites Backend
**Goal:** Build server actions and queries for sites

- [ ] **Task 3.1:** Create sites queries
  - File: `lib/queries/sites.ts`
  - Functions: `getSites`, `getSiteById`, `getSiteBySlug`

- [ ] **Task 3.2:** Create sites server actions
  - File: `app/actions/sites.ts`
  - Functions: `createSite`, `updateSite`, `deleteSite`, `publishSite`, `unpublishSite`

- [ ] **Task 3.3:** Create slug utility
  - Add to actions or create `lib/slug-utils.ts`
  - Function to generate URL-safe slug from name

### Phase 4: Build Dashboard UI
**Goal:** Create dashboard page and site components

- [ ] **Task 4.1:** Create SiteStatusBadge component
  - File: `components/sites/SiteStatusBadge.tsx`

- [ ] **Task 4.2:** Create SiteCard component
  - File: `components/sites/SiteCard.tsx`

- [ ] **Task 4.3:** Create EmptyState component
  - File: `components/sites/EmptyState.tsx`

- [ ] **Task 4.4:** Create SiteSortDropdown component
  - File: `components/sites/SiteSortDropdown.tsx`

- [ ] **Task 4.5:** Create CreateSiteModal component
  - File: `components/sites/CreateSiteModal.tsx`

- [ ] **Task 4.6:** Create dashboard page
  - File: `app/(protected)/app/page.tsx`

- [ ] **Task 4.7:** Create loading and error pages
  - Files: `app/(protected)/app/loading.tsx`, `app/(protected)/app/error.tsx`

### Phase 5: Update Navigation
**Goal:** Update sidebar to reflect new Site Engine navigation

- [ ] **Task 5.1:** Update AppSidebar
  - File: `components/layout/AppSidebar.tsx`
  - Change nav items and route matching logic

### Phase 6: Testing & Validation
**Goal:** Verify all changes work correctly

- [ ] **Task 6.1:** Run linting
  - Command: `npm run lint`

- [ ] **Task 6.2:** Run type checking
  - Command: `npm run type-check`

- [ ] **Task 6.3:** Verify database migration applied
  - Check `sites` table exists, transcription tables dropped

---

## 12. Task Completion Tracking - MANDATORY WORKFLOW

- [ ] **GET TODAY'S DATE FIRST** - Use time tool before adding timestamps
- [ ] **Update task document immediately** after each completed subtask
- [ ] **Mark checkboxes as [x]** with completion timestamp
- [ ] **Add brief completion notes** (file paths, key changes)

---

## 13. File Structure & Organization

### New Files to Create
```
project-root/
├── app/(protected)/app/
│   ├── page.tsx                      # Dashboard main page
│   ├── loading.tsx                   # Loading skeleton
│   └── error.tsx                     # Error boundary
├── app/actions/
│   └── sites.ts                      # Sites server actions
├── components/sites/
│   ├── SiteCard.tsx                  # Site card component
│   ├── CreateSiteModal.tsx           # Create site modal
│   ├── EmptyState.tsx                # Empty state component
│   ├── SiteStatusBadge.tsx           # Status badge component
│   └── SiteSortDropdown.tsx          # Sort dropdown component
└── lib/
    ├── drizzle/schema/sites.ts       # Sites schema
    └── queries/sites.ts              # Sites query functions
```

### Files to Modify
- [ ] `lib/drizzle/schema/index.ts` - Update exports
- [ ] `trigger/index.ts` - Remove task exports
- [ ] `components/layout/AppSidebar.tsx` - Update navigation

### Dependencies to Add
No new dependencies required - using existing shadcn/ui components.

---

## 14. Potential Issues & Security Review

### Error Scenarios to Analyze
- [ ] **Duplicate slug creation** - What happens if user creates site with name that generates existing slug?
  - **Code Review Focus:** `createSite` action slug generation
  - **Potential Fix:** Add numeric suffix (e.g., "my-site-2") or show error

- [ ] **Empty site name** - Validation for required name field
  - **Code Review Focus:** CreateSiteModal form validation
  - **Potential Fix:** Client and server-side validation

### Edge Cases to Consider
- [ ] **Very long site names** - How to handle in UI and slug generation
  - **Analysis Approach:** Check card layout with long names
  - **Recommendation:** Truncate display, limit slug length

- [ ] **Unicode characters in names** - Slug generation from non-ASCII
  - **Analysis Approach:** Test with emoji, international characters
  - **Recommendation:** Use slugify library or transliterate

### Security & Access Control Review
- [ ] **Site ownership verification** - All queries/actions verify user_id
- [ ] **Authentication check** - Dashboard requires authenticated user
- [ ] **Input validation** - Name and description sanitized

---

## 15. Deployment & Configuration

### Environment Variables
No new environment variables required for Phase 2.

---

## 16. AI Agent Instructions

### Implementation Approach
Follow the standard workflow:
1. Create task document (this file) ✓
2. Get user approval
3. Implement phase-by-phase with progress updates
4. Mark tasks complete with timestamps
5. Run comprehensive code review
6. Request user browser testing

### Code Quality Standards
- [ ] TypeScript strict mode compliance
- [ ] No `any` types
- [ ] Early returns for cleaner code
- [ ] async/await instead of .then() chains
- [ ] Proper error handling with descriptive messages
- [ ] Responsive design (mobile-first)
- [ ] Light/dark mode support

### Architecture Compliance
- [ ] Server Components for data fetching
- [ ] Server Actions for mutations
- [ ] No API routes (not needed for this phase)
- [ ] Drizzle ORM type-safe queries

---

## 17. Notes & Additional Context

### Design Decisions Made
1. **No down migrations for transcription tables** - Early development, data can be dropped
2. **custom_domain deferred to Phase 8** - Not needed until published sites feature
3. **Delete ffmpeg.ts** - Can re-add if needed later
4. **Keep openai.ts** - Needed for Phase 5 theme generation
5. **Dashboard route at /app** - As specified in roadmap
6. **Show "0 pages" placeholder** - Until Phase 3 adds pages
7. **Add sorting options** - Last Updated, Name, Date Created
8. **Global slug uniqueness** - Simpler for now (single user)
9. **No slug validation** - Keep simple for MVP
10. **Basic sidebar** - Extend in Phase 3 for site context

### Reference from Roadmap
See `ai_docs/prep/roadmap.md` Phase 2 section for original requirements.

---

## 18. Second-Order Consequences & Impact Analysis

### Impact Assessment

#### 1. Breaking Changes Analysis
- [x] **Database Dependencies:** Dropping all transcription tables - no other features depend on them
- [x] **Component Dependencies:** Deleting entire components/transcripts directory - no external imports
- [x] **API Routes:** Removing download endpoint - no external consumers

#### 2. Ripple Effects Assessment
- [x] **Navigation:** Sidebar route change from /transcripts to /app
- [x] **Trigger.dev:** Most tasks removed - dashboard in Trigger.dev will show fewer tasks

#### 3. Performance Implications
- [x] **Bundle Size:** Significantly smaller - removing 20+ components and 5 tasks
- [x] **Database:** Simpler schema with fewer tables

### Mitigation Strategies
- No production users affected - development mode
- No data migration needed - fresh start acceptable

---

*Template Version: 1.0*
*Created: December 2025*
*Phase: 2 of Site Engine Roadmap*
