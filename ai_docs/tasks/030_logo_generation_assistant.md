# Task 030: Logo Generation Assistant

> **AI-powered logo prompt generator that creates ChatGPT-ready prompts based on site context**

---

## 1. Task Overview

### Task Title
**Title:** Logo Generation Assistant - AI-Powered Logo Prompt Generator

### Goal Statement
**Goal:** Create an AI-powered logo generation assistant that analyzes site context (name, description, brand personality, theme colors) and generates 10 unique ChatGPT-ready logo prompts across three categories (Decomposed, Monogram, SnapAI Pattern). This enables site owners without design skills to create professional logos by copying generated prompts into ChatGPT.

---

## 2. Strategic Analysis & Solution Options

### Problem Context
Site owners need logos/favicons but lack design skills. Currently they must manually create or hire designers. This feature provides an AI-assisted path to professional logos without leaving the Site Engine ecosystem.

### Solution Options Analysis

#### Option 1: Full In-App Logo Generation (DALL-E/Midjourney API)
**Approach:** Generate actual logo images directly within the app using AI image generation APIs.

**Pros:**
- Users get logos without leaving the app
- Seamless upload to site image library
- More polished user experience

**Cons:**
- High API costs (DALL-E/Midjourney per image)
- Quality control challenges
- More complex implementation
- Rate limiting concerns

**Implementation Complexity:** High
**Risk Level:** Medium-High (cost, quality)

#### Option 2: ChatGPT Prompt Generator (Recommended)
**Approach:** Generate optimized prompts that users copy into ChatGPT for image generation, then upload results.

**Pros:**
- Zero image generation costs
- Leverages ChatGPT's image capabilities users may already have
- Proven methodology from SnapAI patterns
- Users can iterate in ChatGPT conversation
- Lower implementation complexity

**Cons:**
- Users must leave app temporarily
- Extra steps (copy prompt, paste in ChatGPT, download, upload)
- Requires ChatGPT Plus subscription for image generation

**Implementation Complexity:** Medium
**Risk Level:** Low

#### Option 3: Hybrid (Generate Prompt + Optional Direct Generation)
**Approach:** Default to prompt generation, with premium option for direct generation.

**Pros:**
- Flexibility for different user needs
- Revenue opportunity for direct generation

**Cons:**
- More complex to implement and maintain
- Confusing UX with two paths

**Implementation Complexity:** High
**Risk Level:** Medium

### Recommendation & Rationale

**RECOMMENDED SOLUTION:** Option 2 - ChatGPT Prompt Generator

**Why this is the best choice:**
1. **Cost-effective** - No per-generation API costs
2. **Proven methodology** - Based on SnapAI patterns that produce quality results
3. **User control** - Users can iterate and refine in ChatGPT
4. **Faster to implement** - Focus on prompt engineering, not image API integration

**Key Decision Factors:**
- **Performance Impact:** Minimal - single OpenAI text completion call
- **User Experience:** Good - clear multi-step wizard flow
- **Maintainability:** Simple - text generation only
- **Scalability:** Excellent - no image storage/processing overhead

---

## 3. Project Analysis & Current State

### Technology & Architecture
- **Frameworks & Versions:** Next.js 15.3, React 19
- **Language:** TypeScript 5.4 with strict mode
- **Database & ORM:** Supabase (Postgres) via Drizzle ORM
- **UI & Styling:** shadcn/ui components with Tailwind CSS
- **AI Integration:** OpenAI GPT-4o
- **Key Architectural Patterns:** Server Actions for mutations, modal wizards for multi-step flows

### Current State
- `description` field already exists on sites table (can be reused)
- No `brand_personality` field exists yet (needs migration)
- ThemeTab exists with ThemeGeneratorModal pattern we can follow
- ImageUpload component exists for uploading logo images
- Header configuration already supports logo image URL
- Logo generation prompt template exists in `.claude/commands/04_chatgpt_logo_generation.md`

### Existing Codebase Analysis

**Checked Areas:**
- [x] **Database Schema** - `lib/drizzle/schema/sites.ts` - has description, needs brand_personality
- [x] **Server Actions** - `app/actions/sites.ts` - updateSiteSettings pattern
- [x] **Component Patterns** - `components/theme/ThemeGeneratorModal.tsx` - multi-step wizard pattern
- [x] **Theme Tab** - `components/theme/ThemeTab.tsx` - where LogoBrandingCard will be added

---

## 4. Context & Problem Definition

### Problem Statement
Site owners need logos but lack design skills. The current workflow requires them to:
1. Find a designer or use external tools
2. Manually upload images
3. Configure header with logo

This creates friction and delays site completion. By providing AI-powered prompt generation, users get professional logo concepts with minimal effort.

### Success Criteria
- [ ] User can access Logo Generator from Theme Tab
- [ ] Modal collects site context (auto-populates where possible)
- [ ] AI generates 10 unique logo concepts across 3 categories
- [ ] User can select favorites and get ChatGPT-ready prompts
- [ ] Clear instructions for using prompts in ChatGPT
- [ ] User can upload completed logo via existing ImageUpload
- [ ] Brand personality persists in database for reuse

---

## 5. Development Mode Context

- **New application in active development**
- **No backwards compatibility concerns**
- **Data loss acceptable** - can migrate aggressively
- **Priority: Speed and simplicity**

---

## 6. Technical Requirements

### Functional Requirements
- User can open Logo Generator modal from Theme Tab
- Modal displays context collection form (Step 1):
  - Auto-populated: Site name, primary color from active theme
  - User inputs: Site description (prefilled if exists), brand personality dropdown
- AI generates 10 logo concepts (Step 2):
  - 4 Decomposed (functional visual metaphors)
  - 3 Monogram (letter-based designs)
  - 3 SnapAI Pattern (proven aesthetic patterns)
  - 3 Expert recommendations (Top, Alternative, Safe)
- User selects 1-3 favorites (Step 3)
- Output shows ChatGPT-ready prompt with copy button (Step 4)
- Collapsible instructions for ChatGPT usage
- "Upload Completed Logo" button opens ImageUpload

### Non-Functional Requirements
- **Performance:** AI generation should complete within 30 seconds
- **Security:** Server-side AI calls only, no API key exposure
- **Usability:** Clear step progression, easy copy functionality
- **Responsive Design:** Works on mobile (320px+), tablet, desktop
- **Theme Support:** Uses existing theme system

### Technical Constraints
- Must use existing OpenAI integration
- Must integrate with existing ImageUpload component
- Must follow existing modal wizard patterns

---

## 7. Data & Database Changes

### Database Schema Changes

```sql
-- 1. Add brand_personality to sites table
ALTER TABLE sites ADD COLUMN brand_personality TEXT;

-- 2. Create logo_generation_jobs table
CREATE TABLE logo_generation_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',

  -- Input context
  site_name TEXT NOT NULL,
  site_description TEXT,
  brand_personality TEXT,
  primary_color TEXT,

  -- Output
  generated_concepts JSONB,

  -- Progress tracking
  progress_percentage INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,

  -- Trigger.dev integration
  trigger_run_id TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX logo_generation_jobs_site_id_idx ON logo_generation_jobs(site_id);
CREATE INDEX logo_generation_jobs_user_id_idx ON logo_generation_jobs(user_id);
CREATE INDEX logo_generation_jobs_status_idx ON logo_generation_jobs(status);
```

### Data Model Updates

```typescript
// lib/drizzle/schema/sites.ts - Add brand personality enum
export const BRAND_PERSONALITIES = ["professional", "consumer", "tech", "creative"] as const;
export type BrandPersonality = (typeof BRAND_PERSONALITIES)[number];

// Add to sites table definition:
brand_personality: text("brand_personality", { enum: BRAND_PERSONALITIES }),

// lib/drizzle/schema/logo-generation-jobs.ts - New file
export const LOGO_JOB_STATUSES = ["pending", "generating", "completed", "failed"] as const;
export type LogoJobStatus = (typeof LOGO_JOB_STATUSES)[number];

export const logoGenerationJobs = pgTable("logo_generation_jobs", {
  id: uuid("id").primaryKey().defaultRandom(),
  site_id: uuid("site_id").notNull().references(() => sites.id, { onDelete: "cascade" }),
  user_id: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  status: text("status", { enum: LOGO_JOB_STATUSES }).notNull().default("pending"),

  // Input context
  site_name: text("site_name").notNull(),
  site_description: text("site_description"),
  brand_personality: text("brand_personality"),
  primary_color: text("primary_color"),

  // Output - array of 10 concepts with recommendations
  generated_concepts: jsonb("generated_concepts").$type<LogoGenerationOutput>(),

  // Progress tracking
  progress_percentage: integer("progress_percentage").notNull().default(0),
  error_message: text("error_message"),

  // Trigger.dev integration
  trigger_run_id: text("trigger_run_id"),

  // Timestamps
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index("logo_generation_jobs_site_id_idx").on(t.site_id),
  index("logo_generation_jobs_user_id_idx").on(t.user_id),
  index("logo_generation_jobs_status_idx").on(t.status),
]);

// Output type for generated concepts
export interface LogoConcept {
  id: number;
  category: "decomposed" | "monogram" | "snapai";
  prompt: string;
  description: string;
  recommendation?: "top" | "alternative" | "safe";
}

export interface LogoGenerationOutput {
  concepts: LogoConcept[];
  appContext: string;
}
```

### Down Migration Safety Protocol
- [ ] Generate migration with `npm run db:generate`
- [ ] Create down migration file before applying
- [ ] Down migration:
  ```sql
  DROP TABLE IF EXISTS logo_generation_jobs;
  ALTER TABLE sites DROP COLUMN IF EXISTS brand_personality;
  ```

---

## 8. Backend Changes

### Server Actions

**`app/actions/logo-generation.ts`** (New file)
- [ ] **`triggerLogoGeneration`** - Creates job record, triggers Trigger.dev task, returns jobId
- [ ] **`getLogoJobStatus`** - Polls job status, progress, and results
- [ ] **`retryLogoGeneration`** - Retry a failed job with same inputs

**`app/actions/sites.ts`** (Modify)
- [ ] Add `brandPersonality` to `UpdateSiteSettingsData` interface

### Trigger.dev Task

**`trigger/tasks/generate-logo-prompts.ts`** (New file)
```typescript
export const generateLogoPrompts = schemaTask({
  id: "generate-logo-prompts",
  schema: z.object({ jobId: z.string().uuid() }),
  run: async ({ jobId }) => {
    // 1. Fetch job from DB (0%)
    // 2. Build prompt from context (10%)
    // 3. Call OpenAI GPT-4o for 10 concepts (20% -> 80%)
    // 4. Parse and structure response (90%)
    // 5. Save to job.generated_concepts (100%)
  },
});
```

### Prompt Engineering

**`trigger/utils/logo-prompts.ts`** (New file)
- System prompt based on `.claude/commands/04_chatgpt_logo_generation.md`
- Structured output schema for 10 concepts across 3 categories
- Expert recommendations (Top, Alternative, Safe)

### Data Access Patterns
- Server Action creates job record → triggers Trigger.dev task
- Task updates job progress via DB + metadata
- Modal polls `getLogoJobStatus` every 2 seconds
- On completion, modal displays concepts from job record
- Brand personality saved to sites table via existing `updateSiteSettings`

---

## 9. Frontend Changes

### New Components

**`components/theme/LogoBrandingCard.tsx`**
- Card displayed in ThemeTab
- Shows current logo status (if exists in header)
- "Generate Logo Prompts" button opens modal
- Quick access to upload existing logo

**`components/theme/LogoGeneratorModal.tsx`**
- Multi-step wizard modal (4 steps)
- Step 1: Context collection form
- Step 2: Generating state with progress
- Step 3: Concept selection (cards with category badges)
- Step 4: Output with copy button and instructions

**`components/theme/LogoConceptCard.tsx`**
- Individual concept display card
- Category badge (Decomposed/Monogram/SnapAI)
- Recommendation badge if applicable
- Selectable state

### Page Updates
- [ ] **ThemeTab** - Add LogoBrandingCard component

### State Management
- Local state in modal for step progression
- Form state for context inputs
- Selection state for chosen concepts
- Server action for AI generation (not background job - fast enough)

---

## 10. Code Changes Overview

### Current Implementation (Before)

```typescript
// components/theme/ThemeTab.tsx - Current structure
export function ThemeTab({ site, themes, activeTheme }: ThemeTabProps) {
  return (
    <div className="space-y-6">
      {/* Active Theme Section */}
      <Card>...</Card>

      {/* Saved Themes Section */}
      <div>...</div>

      {/* Theme Generator Modal */}
      <ThemeGeneratorModal ... />

      {/* Theme Preview/Edit Sheet */}
      <Sheet>...</Sheet>
    </div>
  );
}
```

### After Refactor

```typescript
// components/theme/ThemeTab.tsx - With Logo Branding Card
export function ThemeTab({ site, themes, activeTheme }: ThemeTabProps) {
  const [isLogoGeneratorOpen, setIsLogoGeneratorOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Active Theme Section */}
      <Card>...</Card>

      {/* NEW: Logo & Branding Section */}
      <LogoBrandingCard
        site={site}
        activeTheme={activeTheme}
        onGenerateClick={() => setIsLogoGeneratorOpen(true)}
      />

      {/* Saved Themes Section */}
      <div>...</div>

      {/* Theme Generator Modal */}
      <ThemeGeneratorModal ... />

      {/* NEW: Logo Generator Modal */}
      <LogoGeneratorModal
        open={isLogoGeneratorOpen}
        onOpenChange={setIsLogoGeneratorOpen}
        site={site}
        primaryColor={activeTheme?.data.colors.primary}
      />

      {/* Theme Preview/Edit Sheet */}
      <Sheet>...</Sheet>
    </div>
  );
}
```

### Key Changes Summary
- [ ] **Database:** Add `brand_personality` to sites, create `logo_generation_jobs` table
- [ ] **Trigger.dev Task:** Create `generate-logo-prompts` task with OpenAI integration
- [ ] **Server Actions:** Create `app/actions/logo-generation.ts` (trigger, poll, retry)
- [ ] **Prompt Engineering:** Create `trigger/utils/logo-prompts.ts` based on SnapAI methodology
- [ ] **Components:** Create LogoBrandingCard, LogoGeneratorModal, LogoConceptCard
- [ ] **ThemeTab:** Integrate Logo & Branding card with modal
- [ ] **SettingsTab:** Add brand personality dropdown
- [ ] **Files Created:** 7 new files (schema, task, utils, actions, 3 components)
- [ ] **Files Modified:** 4 files (sites schema, schema index, sites action, ThemeTab, SettingsTab)

---

## 11. Implementation Plan

### Phase 1: Database Changes
**Goal:** Add brand_personality to sites + create logo_generation_jobs table

- [ ] **Task 1.1:** Update sites schema
  - Files: `lib/drizzle/schema/sites.ts`
  - Details: Add BRAND_PERSONALITIES const, BrandPersonality type, and column
- [ ] **Task 1.2:** Create logo generation jobs schema
  - Files: `lib/drizzle/schema/logo-generation-jobs.ts` (new)
  - Details: New table with status, inputs, outputs, trigger_run_id
- [ ] **Task 1.3:** Export from schema index
  - Files: `lib/drizzle/schema/index.ts`
  - Details: Export new table and types
- [ ] **Task 1.4:** Generate migration
  - Command: `npm run db:generate`
- [ ] **Task 1.5:** Create down migration
  - Files: `drizzle/migrations/[timestamp]/down.sql`
- [ ] **Task 1.6:** Apply migration
  - Command: `npm run db:migrate`

### Phase 2: Trigger.dev Task & Prompt Engineering
**Goal:** Create background task for AI logo concept generation

- [ ] **Task 2.1:** Create logo prompts utility
  - Files: `trigger/utils/logo-prompts.ts`
  - Details: System prompt, structured output schema based on SnapAI methodology
- [ ] **Task 2.2:** Create Trigger.dev task
  - Files: `trigger/tasks/generate-logo-prompts.ts`
  - Details: schemaTask with progress tracking, DB updates, OpenAI call
- [ ] **Task 2.3:** Register task in trigger config
  - Files: `trigger.config.ts` (if needed)

### Phase 3: Server Actions
**Goal:** Create server actions for triggering and polling

- [ ] **Task 3.1:** Create logo generation server action
  - Files: `app/actions/logo-generation.ts`
  - Details: triggerLogoGeneration, getLogoJobStatus, retryLogoGeneration
- [ ] **Task 3.2:** Create job helper functions
  - Files: `lib/logo-jobs.ts`
  - Details: createLogoGenerationJob, setJobTriggerRunId (similar to theme-jobs.ts)
- [ ] **Task 3.3:** Update site settings action
  - Files: `app/actions/sites.ts`
  - Details: Add brandPersonality to UpdateSiteSettingsData

### Phase 4: UI Components
**Goal:** Build the logo generation modal and card

- [ ] **Task 4.1:** Create LogoBrandingCard
  - Files: `components/theme/LogoBrandingCard.tsx`
  - Details: Card with logo preview, generate button, brand personality display
- [ ] **Task 4.2:** Create LogoConceptCard
  - Files: `components/theme/LogoConceptCard.tsx`
  - Details: Selectable card with category badge, recommendation badge
- [ ] **Task 4.3:** Create LogoGeneratorModal
  - Files: `components/theme/LogoGeneratorModal.tsx`
  - Details: 4-step wizard with polling (context → generating → selection → output)
- [ ] **Task 4.4:** Integrate into ThemeTab
  - Files: `components/theme/ThemeTab.tsx`
  - Details: Add LogoBrandingCard and LogoGeneratorModal

### Phase 5: Settings Integration
**Goal:** Allow editing brand personality in Settings tab

- [ ] **Task 5.1:** Add brand personality to SettingsTab
  - Files: `components/sites/SettingsTab.tsx`
  - Details: Add dropdown in Appearance card or new Brand Identity card

### Phase 6: Task Testing & Validation
**Goal:** Test Trigger.dev task execution

- [ ] **Task 6.1:** Start Trigger.dev dev server
  - Command: `npx trigger.dev@latest dev`
- [ ] **Task 6.2:** Trigger task with sample payload
  - Verify task runs without errors
- [ ] **Task 6.3:** Verify 10 concepts generated
  - Check job record has proper generated_concepts
- [ ] **Task 6.4:** Test progress tracking
  - Verify metadata updates during execution

### Phase 7: Comprehensive Code Review (Mandatory)
- [ ] **Task 7.1:** Present "Implementation Complete!" message
- [ ] **Task 7.2:** Execute comprehensive code review if approved

### Phase 8: User Browser Testing
- [ ] **Task 8.1:** Present AI testing results
- [ ] **Task 8.2:** Request user UI testing
- [ ] **Task 8.3:** Wait for user confirmation

---

## 12. Task Completion Tracking

### Phase 1: Database Changes - COMPLETED 2025-12-29

- [x] **Task 1.1:** Update sites schema ✓ 2025-12-29
  - Files: `lib/drizzle/schema/sites.ts`
  - Added BRAND_PERSONALITIES enum and brand_personality column
- [x] **Task 1.2:** Create logo generation jobs schema ✓ 2025-12-29
  - Files: `lib/drizzle/schema/logo-generation-jobs.ts` (new - 98 lines)
  - Created table with status, inputs, outputs, trigger_run_id
- [x] **Task 1.3:** Export from schema index ✓ 2025-12-29
  - Files: `lib/drizzle/schema/index.ts`
  - Added export for logo-generation-jobs
- [x] **Task 1.4:** Generate migration ✓ 2025-12-29
  - Migration: `0015_keen_sheva_callister.sql`
- [x] **Task 1.5:** Create down migration ✓ 2025-12-29
  - Files: `drizzle/migrations/0015_keen_sheva_callister/down.sql`
- [x] **Task 1.6:** Apply migration ✓ 2025-12-29
  - Command: `npm run db:migrate` - successful

### Phase 2: Trigger.dev Task & Prompt Engineering - COMPLETED 2025-12-29

- [x] **Task 2.1:** Create logo prompts utility ✓ 2025-12-29
  - Files: `trigger/utils/logo-prompts.ts` (new - 165 lines)
  - Includes: buildLogoPrompt, logoConceptsSchema, wrapForChatGPT, getLogoUsageInstructions
- [x] **Task 2.2:** Create Trigger.dev task ✓ 2025-12-29
  - Files: `trigger/tasks/generate-logo-prompts.ts` (new - 156 lines)
  - Task ID: "generate-logo-prompts"
  - Progress tracking at 0%, 5%, 15%, 85%, 95%, 100%
- [x] **Task 2.3:** Verify task registration ✓ 2025-12-29
  - Auto-discovered via `dirs: ["trigger"]` in trigger.config.ts
  - TypeScript compilation: No errors

### Phase 3: Server Actions - COMPLETED 2025-12-29

- [x] **Task 3.1:** Create job helper functions ✓ 2025-12-29
  - Files: `lib/logo-jobs.ts` (new - 90 lines)
  - Functions: createLogoGenerationJob, setLogoJobTriggerRunId, getLogoJobByIdWithAuth
- [x] **Task 3.2:** Create logo generation server action ✓ 2025-12-29
  - Files: `app/actions/logo-generation.ts` (new - 120 lines)
  - Functions: triggerLogoGeneration, getLogoJobStatus, retryLogoGeneration
- [x] **Task 3.3:** Update site settings action ✓ 2025-12-29
  - Files: `app/actions/sites.ts` (+8 lines)
  - Added brandPersonality to UpdateSiteSettingsData and update handler
  - TypeScript compilation: No errors

### Phase 4: UI Components - COMPLETED 2025-12-29

- [x] **Task 4.1:** Create LogoBrandingCard ✓ 2025-12-29
  - Files: `components/theme/LogoBrandingCard.tsx` (new - 100 lines)
  - Shows current logo status and brand personality
- [x] **Task 4.2:** Create LogoConceptCard ✓ 2025-12-29
  - Files: `components/theme/LogoConceptCard.tsx` (new - 93 lines)
  - Selectable card with category and recommendation badges
- [x] **Task 4.3:** Create LogoGeneratorModal ✓ 2025-12-29
  - Files: `components/theme/LogoGeneratorModal.tsx` (new - 436 lines)
  - 4-step wizard: context → generating → selection → output
  - Polling mechanism for job status
  - Copy-to-clipboard for ChatGPT prompts
  - Collapsible usage instructions
- [x] **Task 4.4:** Integrate into ThemeTab ✓ 2025-12-29
  - Files: `components/theme/ThemeTab.tsx` (+15 lines)
  - Added LogoBrandingCard and LogoGeneratorModal
  - TypeScript compilation: No errors

### Phase 5: Settings Integration - COMPLETED 2025-12-29

- [x] **Task 5.1:** Add brand personality to SettingsTab ✓ 2025-12-29
  - Files: `components/sites/SettingsTab.tsx` (+30 lines)
  - Added brand personality dropdown in Appearance section
  - Includes state management, change detection, and form submission
  - TypeScript compilation: No errors

---

## 13. File Structure & Organization

### New Files to Create
```
lib/drizzle/schema/
└── logo-generation-jobs.ts    # New job table schema

lib/
└── logo-jobs.ts               # Job creation helpers

trigger/tasks/
└── generate-logo-prompts.ts   # Trigger.dev task

trigger/utils/
└── logo-prompts.ts            # Prompt engineering for logo concepts

app/actions/
└── logo-generation.ts         # Server actions (trigger, poll, retry)

components/theme/
├── LogoBrandingCard.tsx       # Card in ThemeTab
├── LogoGeneratorModal.tsx     # Multi-step wizard with polling
└── LogoConceptCard.tsx        # Selectable concept card
```

### Files to Modify
- [ ] `lib/drizzle/schema/sites.ts` - Add brand_personality column
- [ ] `lib/drizzle/schema/index.ts` - Export new table
- [ ] `app/actions/sites.ts` - Add brandPersonality to UpdateSiteSettingsData
- [ ] `components/theme/ThemeTab.tsx` - Add LogoBrandingCard and modal
- [ ] `components/sites/SettingsTab.tsx` - Add brand personality dropdown

### Dependencies to Add
None - uses existing OpenAI integration and Trigger.dev

---

## 14. Potential Issues & Security Review

### Error Scenarios
- [ ] **OpenAI API failure** - Show error state with retry option
- [ ] **Empty site description** - Allow but warn user better results with description
- [ ] **No active theme** - Use default primary color

### Edge Cases
- [ ] **Long site descriptions** - Truncate for prompt context
- [ ] **Special characters in site name** - Sanitize for prompt

### Security & Access Control
- [ ] **Authentication** - Require authenticated user
- [ ] **Site ownership** - Verify user owns the site
- [ ] **API key protection** - Server-side only calls

---

## 15. Deployment & Configuration

### Environment Variables
No new environment variables needed - uses existing `OPENAI_API_KEY`

---

## 16. AI Agent Instructions

### Implementation Approach
1. Start with database migration (Phase 1)
2. Build server action (Phase 2)
3. Create UI components (Phase 3)
4. Test thoroughly (Phase 4)
5. Comprehensive code review (Phase 5)
6. User testing (Phase 6)

### Code Quality Standards
- Follow existing modal wizard patterns from ThemeGeneratorModal
- Use existing shadcn/ui components
- Proper TypeScript types throughout
- Error handling with user-friendly messages

---

## 17. Notes & Additional Context

### Reference Documents
- `.claude/commands/04_chatgpt_logo_generation.md` - Prompt methodology
- `components/theme/ThemeGeneratorModal.tsx` - Modal wizard pattern
- SnapAI GitHub: https://github.com/betomoedano/snapai

### Logo Prompt Categories
1. **Decomposed (4):** Functional visual metaphors based on core app action
2. **Monogram (3):** Letter-based designs inspired by major brands
3. **SnapAI Pattern (3):** Proven aesthetic patterns with gradients/effects

### Brand Personality Options
- **Professional/Enterprise:** Clean geometry, professional gradients
- **Consumer/Friendly:** Soft gradients, organic shapes
- **Tech/AI:** Sparkles, nodes, connections, modern effects
- **Creative:** Abstract shapes, artistic elements

---

## 18. Second-Order Consequences & Impact Analysis

### Breaking Changes Identified
- None - new additive feature only

### Performance Implications
- Single OpenAI API call per generation (fast text completion)
- No impact on existing site rendering

### Security Considerations
- API key remains server-side only
- No new attack vectors

### User Experience Impacts
- Positive - new capability without disrupting existing flows
- Clear wizard flow with familiar patterns

### Mitigation Strategies
- Follow existing patterns to minimize learning curve
- Provide clear instructions for ChatGPT step

---

*Task Document Version: 1.0*
*Created: 2025-12-29*
