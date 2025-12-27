# AI Task Template

## 1. Task Overview

### Task Title
**Title:** Phase 5.1 - Database Schema for AI Theme Generation

### Goal Statement
**Goal:** Create the database schema foundation for AI-powered theme generation, including tables for tracking theme generation jobs (with multi-stage progress) and storing saved themes per site. This schema supports both Quick Generate (single AI call) and Guided Generate (multi-stage with human checkpoints) modes.

---

## 2. Strategic Analysis & Solution Options

### When to Use Strategic Analysis
**Decision:** Strategic analysis is needed here because there are architectural decisions around:
1. Where to store TypeScript interfaces for theme data structures
2. How to enforce "one active theme per site" constraint
3. Whether to store AI provider preferences at job level only or also at site/user level

### Problem Context
The theme generation system requires two interconnected tables:
- **theme_generation_jobs**: Tracks multi-stage AI generation progress, stores intermediate results, and manages job status
- **themes**: Stores finalized theme versions that users can activate/switch between

The key decisions involve how tightly to couple the TypeScript type definitions with the database schema, and whether to enforce business rules at the database level or application level.

### Solution Options Analysis

#### Option 1: TypeScript Interfaces in Schema Files (Co-located)
**Approach:** Define TypeScript interfaces (ColorPalette, TypographySettings, etc.) directly in the schema files alongside the Drizzle table definitions.

**Pros:**
- All theme-related types in one place per domain (jobs vs saved themes)
- Easy to find and update when schema changes
- Follows pattern used elsewhere in codebase

**Cons:**
- Schema files become longer
- Types may be needed in places that shouldn't import from schema

**Implementation Complexity:** Low
**Risk Level:** Low

#### Option 2: Separate Types File (Recommended)
**Approach:** Create `lib/drizzle/schema/theme-types.ts` for shared TypeScript interfaces, import into schema files for JSONB column typing.

**Pros:**
- Clean separation of concerns
- Types can be imported by frontend/backend without pulling in Drizzle dependencies
- Easier to share types with Trigger.dev tasks
- Schema files stay focused on table definitions

**Cons:**
- One additional file to maintain
- Need to keep imports synchronized

**Implementation Complexity:** Low
**Risk Level:** Low

### Recommendation & Rationale

**RECOMMENDED SOLUTION:** Option 2 - Separate Types File

**Why this is the best choice:**
1. **Reusability** - Theme types will be used in Trigger.dev tasks, server actions, and frontend components
2. **Clarity** - Schema files stay focused on table definitions, not type gymnastics
3. **Pattern consistency** - Similar to how `lib/section-types.ts` handles section content types

### Questions for User

Before proceeding, I'd like to confirm a few things:

**Q1: Active Theme Enforcement**
The `themes` table needs "only one active theme per site" constraint. Options:
- **A) Application level only** - Handle in server action (unset others when activating)
- **B) Database partial unique index** - `CREATE UNIQUE INDEX ... WHERE is_active = true`

Recommendation: **A** is simpler and follows existing patterns (like `is_home` for pages). Database indexes for this are tricky with updates.

**Q2: AI Provider Default Storage**
Should we store default AI provider preferences beyond the job level?
- **A) Job level only** - Each job stores which provider/model was used (current plan)
- **B) Site level** - Add `default_ai_provider` column to sites table
- **C) User level** - Add user preferences for AI provider

Recommendation: **A** for now - we can add site/user defaults later if needed.

**Q3: Type Location Confirmation**
Confirm you want theme TypeScript interfaces in `lib/drizzle/schema/theme-types.ts` as recommended?

---

## 3. Project Analysis & Current State

### Technology & Architecture
- **Frameworks & Versions:** Next.js 15.3, React 19
- **Language:** TypeScript 5.4 with strict mode
- **Database & ORM:** Supabase (Postgres) via Drizzle ORM
- **UI & Styling:** shadcn/ui components with Tailwind CSS v4
- **Background Jobs:** Trigger.dev v4

### Current State
- Phase 4 (Section Builder) is complete
- Database has: `users`, `sites`, `pages`, `sections` tables
- Sites table exists with standard fields (id, user_id, name, slug, status, timestamps)
- No theme-related tables exist yet
- Trigger.dev is configured with OpenAI integration already present

### Existing Codebase Analysis

**Checked:**
- [x] **Database Schema** (`lib/drizzle/schema/*.ts`)
  - Pattern: pgTable with uuid PKs, timestamps, indexes
  - FK pattern: `.references(() => table.id, { onDelete: "cascade" })`
  - Type exports: `type X = InferSelectModel<typeof x>`

- [x] **Existing Type Patterns** (`lib/section-types.ts`)
  - Separate file for content type interfaces
  - Used by both schema and components

---

## 4. Context & Problem Definition

### Problem Statement
The AI theme generation system needs database tables to:
1. Track generation job progress (especially for guided multi-stage mode)
2. Store intermediate AI-generated results at each stage
3. Save finalized themes that users can switch between
4. Support real-time progress tracking via Trigger.dev metadata

### Success Criteria
- [ ] `theme_generation_jobs` table created with all required columns
- [ ] `themes` table created with all required columns
- [ ] TypeScript interfaces for theme data structures defined
- [ ] Down migrations created for both tables
- [ ] Migrations applied successfully
- [ ] Schema exports updated in index.ts

---

## 5. Development Mode Context

- **This is a new application in active development**
- **No backwards compatibility concerns** - feel free to make breaking changes
- **Data loss acceptable** - no existing theme data to preserve
- **Priority: Speed and simplicity** over data preservation

---

## 6. Technical Requirements

### Functional Requirements
- Theme generation jobs track status across 10+ possible states
- Jobs store JSONB data for: requirements, color_data, typography_data, component_data, final_theme_data
- Themes reference their generation job (nullable - for manual themes)
- Each site can have one active theme
- Jobs store Trigger.dev run ID for real-time tracking

### Non-Functional Requirements
- **Performance:** Index on site_id for both tables, status index on jobs
- **Data Integrity:** Cascade delete when site is deleted

### Technical Constraints
- Must use Drizzle ORM patterns matching existing schema
- JSONB columns for flexible AI response storage
- Enum for job status to ensure type safety

---

## 7. Data & Database Changes

### Database Schema Changes

**Table 1: theme_generation_jobs**
```typescript
// lib/drizzle/schema/theme-generation-jobs.ts
export const THEME_JOB_MODES = ["quick", "guided"] as const;
export type ThemeJobMode = (typeof THEME_JOB_MODES)[number];

export const THEME_JOB_STATUSES = [
  "pending",
  "generating_colors",
  "awaiting_color_approval",
  "generating_typography",
  "awaiting_typography_approval",
  "generating_components",
  "awaiting_styles_approval",
  "finalizing",
  "completed",
  "failed",
] as const;
export type ThemeJobStatus = (typeof THEME_JOB_STATUSES)[number];

export const THEME_STAGES = ["colors", "typography", "components", "finalizing"] as const;
export type ThemeStage = (typeof THEME_STAGES)[number];

// Columns:
// id: uuid (PK)
// site_id: uuid (FK -> sites.id, cascade delete)
// user_id: uuid (FK -> users.id, cascade delete)
// mode: text enum ("quick" | "guided")
// status: text enum (ThemeJobStatus)
// stage: text enum nullable (ThemeStage) - for guided mode
// requirements: jsonb (ThemeRequirements)
// color_data: jsonb nullable (ColorPalette)
// typography_data: jsonb nullable (TypographySettings)
// component_data: jsonb nullable (ComponentStyles)
// final_theme_data: jsonb nullable (ThemeData)
// ai_provider: text (e.g., "openai")
// ai_model: text (e.g., "gpt-4o")
// progress_percentage: integer default 0
// error_message: text nullable
// trigger_run_id: text nullable (Trigger.dev run ID)
// created_at, updated_at timestamps
```

**Table 2: themes**
```typescript
// lib/drizzle/schema/themes.ts
// Columns:
// id: uuid (PK)
// site_id: uuid (FK -> sites.id, cascade delete)
// user_id: uuid (FK -> users.id, cascade delete)
// generation_job_id: uuid nullable (FK -> theme_generation_jobs.id, set null on delete)
// name: text (user-editable)
// is_active: boolean default false
// data: jsonb (ThemeData)
// created_at, updated_at timestamps
```

### Data Model Updates

**TypeScript Interfaces (lib/drizzle/schema/theme-types.ts):**
```typescript
// Theme Requirements (user input)
export interface ThemeRequirements {
  brandName: string;
  industry: string;
  styleKeywords: string[];
  colorPreferences?: {
    preferredColors?: string[];
    avoidColors?: string[];
  };
  targetAudience?: string;
  additionalNotes?: string;
}

// Color Palette (Stage 1 output)
export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  muted: string;
  mutedForeground: string;
  border: string;
  rationale: string;
}

// Typography Settings (Stage 2 output)
export interface TypographySettings {
  headingFont: {
    family: string;
    weights: number[];
  };
  bodyFont: {
    family: string;
    weights: number[];
  };
  scale: {
    h1: string;
    h2: string;
    h3: string;
    h4: string;
    body: string;
    small: string;
  };
  lineHeights: {
    tight: string;
    normal: string;
    relaxed: string;
  };
  rationale: string;
}

// Component Styles (Stage 3 output)
export interface ComponentStyles {
  button: {
    borderRadius: string;
    paddingX: string;
    paddingY: string;
    variants: Record<string, { bg: string; text: string; border?: string }>;
  };
  card: {
    borderRadius: string;
    padding: string;
    shadow: string;
    border: string;
  };
  input: {
    borderRadius: string;
    borderColor: string;
    focusRing: string;
    padding: string;
  };
  badge: {
    borderRadius: string;
    padding: string;
  };
  rationale: string;
}

// Final Theme Data
export interface ThemeData {
  colors: ColorPalette;
  typography: TypographySettings;
  components: ComponentStyles;
  tailwindExtends: Record<string, unknown>;
  cssVariables: string;
  generatedAt: string;
  aiProvider: string;
  aiModel: string;
}
```

### MANDATORY: Down Migration Safety Protocol
- [ ] **Step 1: Generate Migration** - Run `npm run db:generate`
- [ ] **Step 2: Create Down Migration** - Create rollback SQL
- [ ] **Step 3: Create Subdirectory** - Create migration subdirectory
- [ ] **Step 4: Generate down.sql** - Create safe rollback operations
- [ ] **Step 5: Verify Safety** - Use `IF EXISTS` clauses
- [ ] **Step 6: Apply Migration** - Only after down migration created

---

## 8. Backend Changes & Background Jobs

### Server Actions (Future phases)
Server actions for theme management will be created in Phase 5.6 (Build Theme Server Actions).

### Database Queries (Future phases)
Query functions will be created in Phase 5.6.

**This task focuses only on database schema creation.**

---

## 9. Frontend Changes

**No frontend changes in this task.** Frontend components will be created in Phase 5.5 (Build Theme Tab UI).

---

## 10. Code Changes Overview

### Files to Create

1. **`lib/drizzle/schema/theme-types.ts`** (NEW)
   - TypeScript interfaces for theme data structures
   - ~100 lines

2. **`lib/drizzle/schema/theme-generation-jobs.ts`** (NEW)
   - Drizzle table definition for job tracking
   - ~60 lines

3. **`lib/drizzle/schema/themes.ts`** (NEW - note: different from sites.ts)
   - Drizzle table definition for saved themes
   - ~40 lines

4. **`drizzle/migrations/XXXX_*/down.sql`** (NEW)
   - Down migration for rollback capability

### Files to Modify

1. **`lib/drizzle/schema/index.ts`**
   - Add exports for new schema files

---

## 11. Implementation Plan

### Phase 1: Create TypeScript Interfaces
**Goal:** Define all theme-related TypeScript types

- [x] **Task 1.1:** Create `lib/drizzle/schema/theme-types.ts` ✓ 2025-12-26
  - Files: `lib/drizzle/schema/theme-types.ts` ✓
  - Details: Defined ThemeRequirements, ColorPalette, TypographySettings, ComponentStyles, ThemeData, AIProviderConfig interfaces (~180 lines)

### Phase 2: Create Theme Generation Jobs Schema
**Goal:** Create the jobs tracking table

- [x] **Task 2.1:** Create `lib/drizzle/schema/theme-generation-jobs.ts` ✓ 2025-12-26
  - Files: `lib/drizzle/schema/theme-generation-jobs.ts` ✓
  - Details: Defined table with 18 columns, 4 indexes, mode/status/stage enums, JSONB typed columns

### Phase 3: Create Themes Schema
**Goal:** Create the saved themes table

- [x] **Task 3.1:** Create `lib/drizzle/schema/themes.ts` ✓ 2025-12-26
  - Files: `lib/drizzle/schema/themes.ts` ✓
  - Details: Defined table with 9 columns, 4 indexes, FK to theme_generation_jobs with SET NULL

### Phase 4: Update Schema Index
**Goal:** Export new schemas

- [x] **Task 4.1:** Update `lib/drizzle/schema/index.ts` ✓ 2025-12-26
  - Files: `lib/drizzle/schema/index.ts` ✓
  - Details: Added exports for theme-types, theme-generation-jobs, themes with Theme Management section

### Phase 5: Generate and Apply Migration
**Goal:** Create database migration with down migration

- [x] **Task 5.1:** Run `npm run db:generate` ✓ 2025-12-26
  - Details: Generated `drizzle/migrations/0006_luxuriant_red_skull.sql`
- [x] **Task 5.2:** Create down migration ✓ 2025-12-26
  - Files: `drizzle/migrations/0006_luxuriant_red_skull/down.sql` ✓
  - Details: Created rollback SQL with DROP TABLE IF EXISTS for both tables
- [x] **Task 5.3:** Run `npm run db:migrate` ✓ 2025-12-26
  - Details: Migration applied successfully

### Phase 6: Verification
**Goal:** Verify schema is correct

- [x] **Task 6.1:** Verify tables exist in database ✓ 2025-12-26
  - Details: Migration completed with 6 tables total (users, sites, pages, sections, theme_generation_jobs, themes)
- [x] **Task 6.2:** Run type-check to ensure no TypeScript errors ✓ 2025-12-26
  - Details: `npm run type-check` passed, `npm run lint` passed (0 errors, 2 pre-existing warnings)

---

## 12. Task Completion Tracking - MANDATORY WORKFLOW

- [ ] Update task document immediately after each completed subtask
- [ ] Mark checkboxes as [x] with completion timestamp
- [ ] Add brief completion notes (file paths, key changes, etc.)

---

## 13. File Structure & Organization

### New Files to Create
```
lib/drizzle/schema/
├── theme-types.ts              # TypeScript interfaces for theme data
├── theme-generation-jobs.ts    # Job tracking table
├── themes.ts                   # Saved themes table (NOTE: not site themes!)
└── index.ts                    # Updated with new exports

drizzle/migrations/
└── XXXX_theme_tables/
    └── down.sql                # Rollback migration
```

---

## 14. Potential Issues & Security Review

### Error Scenarios
- [ ] **JSONB validation**: Invalid JSON in theme data columns
  - **Code Review Focus:** Validate at application layer before insert
  - **Potential Fix:** Add Zod validation in server actions (future phase)

### Edge Cases
- [ ] **Orphaned jobs**: User deletes site while job is running
  - **Analysis Approach:** CASCADE delete handles this
- [ ] **Multiple active themes**: Race condition in activation
  - **Analysis Approach:** Handle in transaction in server action (future phase)

### Security & Access Control Review
- [ ] **Authorization:** user_id FK ensures users only see their own data
- [ ] **Cascade deletes:** Proper cleanup when site/user deleted

---

## 15. Deployment & Configuration

### Environment Variables
No new environment variables needed for this task. AI provider keys (OPENAI_API_KEY) already configured.

---

## 16. AI Agent Instructions

### Implementation Approach
Follow the standard workflow:
1. Wait for user answers to questions Q1, Q2, Q3
2. Create files in order per implementation plan
3. Generate migration, create down migration, then apply

### Code Quality Standards
- Follow existing Drizzle schema patterns
- Use proper TypeScript types
- Add JSDoc comments for complex types

---

## 17. Notes & Additional Context

### Reference Documents
- `ai_docs/prep/trigger_workflow_theme_generation.md` - Detailed workflow spec
- `ai_docs/prep/roadmap.md` - Phase 5 requirements
- `lib/drizzle/schema/sites.ts` - Pattern reference for table definition

### Naming Note
The new `themes.ts` schema file will contain the `themes` table (for saved themes), which is different from the existing `sites.ts`. Be careful not to confuse them.

---

## 18. Second-Order Consequences & Impact Analysis

### Breaking Changes Analysis
- [ ] **No breaking changes** - Adding new tables only

### Ripple Effects Assessment
- [ ] **Future phases depend on this schema** - Tasks, UI, and server actions will reference these tables
- [ ] **Type exports used widely** - Theme interfaces will be imported by Trigger.dev tasks and frontend

### AI Agent Checklist
- [x] Complete Impact Analysis
- [x] No critical issues identified
- [x] Low-risk schema addition

---

*Template Version: 1.0*
*Task Created: December 2025*
*Phase: 5.1 - Database Schema for Themes*
