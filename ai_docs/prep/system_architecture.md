# System Architecture Blueprint

## App Summary

**End Goal:** Full control over site's look, feel, and content with fast, easy updates using AI-powered theme generation and design assistance
**Template Foundation:** worker-simple (Next.js 15, Supabase, Drizzle ORM, Trigger.dev, shadcn/ui)
**Required Extensions:** Content management data model, AI theme generation workflow, AI layout suggestion workflow, domain-based routing

---

## System Architecture

### Template Foundation

**Your Chosen Template:** worker-simple
**Built-in Capabilities:**

- Next.js 15 (App Router) with React 19 and Turbopack
- Supabase Authentication (email/password + OAuth)
- Supabase Storage for file uploads
- PostgreSQL database with Drizzle ORM
- Trigger.dev v4 for background job orchestration
- Real-time progress tracking patterns (`useRealtimeRun`, `metadata.set`)
- shadcn/ui + Tailwind CSS styling system

### Architecture Diagram

```mermaid
flowchart TB
    subgraph "User Interface Layer"
        Login[Login Page]
        Dashboard[Dashboard - Sites Grid]
        SiteDetail[Site Detail - Tabbed<br/>Pages | Theme | Settings]
        PageEditor[Page Editor<br/>Section Builder + Inline Editing]
        PagePreview[Page Preview<br/>Device Toggle]
        PublishedSite[Published Site<br/>Custom Domain Routing]
    end

    subgraph "Application Layer - Template Foundation"
        SupabaseAuth[Supabase Auth<br/>Email + OAuth]
        ServerActions[Next.js Server Actions<br/>CRUD Operations]
        Middleware[Next.js Middleware<br/>Domain-Based Routing]
    end

    subgraph "Application Layer - Site Engine Extensions"
        SiteActions[Sites Server Actions<br/>create, publish, delete]
        PageActions[Pages Server Actions<br/>create, update, reorder]
        SectionActions[Sections Server Actions<br/>add, edit, reorder, auto-save]
        ThemeActions[Theme Server Actions<br/>trigger generation, apply theme]
        LayoutActions[Layout Server Actions<br/>trigger suggestions, apply sections]
    end

    subgraph "Background Job Layer - Trigger.dev Workers"
        subgraph "Theme Generation Workflow"
            QuickGen[generate-theme-quick Task<br/>Single AI call → Complete theme]

            subgraph "Guided Generate Pipeline"
                ColorGen[generate-color-palette Task<br/>Stage 1: 0-25% progress]
                TypoGen[generate-typography Task<br/>Stage 2: 25-50% progress]
                CompGen[generate-component-styles Task<br/>Stage 3: 50-75% progress]
                FinalGen[finalize-theme Task<br/>Stage 4: 75-100% progress]
            end

            ModeDecision{Generation Mode?}
            ApprovalCheck{Awaiting<br/>Approval?}
        end

        subgraph "Layout Suggestion Workflow"
            LayoutSuggest[suggest-layout Task<br/>Single call: 10-30s]
        end

        subgraph "Progress Tracking"
            MetadataSet[metadata.set - progress, currentStep<br/>Real-time UI updates]
            DBProgress[Database Updates<br/>status, progress_percentage]
        end
    end

    subgraph "External AI Services"
        OpenAI[OpenAI API<br/>GPT-4.1]
        Claude[Anthropic API<br/>Claude 3 Opus]
        Gemini[Google Gemini API<br/>gemini-pro]
    end

    subgraph "Data Layer - Template Foundation"
        Users[(users table<br/>id, email, role)]
    end

    subgraph "Data Layer - Site Engine Extensions"
        Sites[(sites table<br/>name, slug, status, custom_domain)]
        Pages[(pages table<br/>title, slug, status, site_id)]
        Sections[(sections table<br/>block_type, content JSONB, position)]
        Themes[(themes table<br/>name, data JSONB, is_active)]
        ThemeJobs[(theme_generation_jobs<br/>mode, status, stage data)]
        LayoutJobs[(layout_suggestion_jobs<br/>status, suggestions JSONB)]
    end

    subgraph "Storage Layer"
        SupabaseStorage[Supabase Storage<br/>site-assets bucket]
    end

    %% User Interface connections
    Login --> SupabaseAuth
    Dashboard --> SiteActions
    SiteDetail --> PageActions
    SiteDetail --> ThemeActions
    PageEditor --> SectionActions
    PageEditor --> LayoutActions
    PublishedSite --> Middleware

    %% Application Layer connections
    SupabaseAuth --> Users
    Middleware --> Sites
    SiteActions --> Sites
    PageActions --> Pages
    SectionActions --> Sections
    ThemeActions --> ThemeJobs
    LayoutActions --> LayoutJobs

    %% Trigger.dev workflow
    ThemeActions -->|trigger| ModeDecision
    ModeDecision -->|Quick| QuickGen
    ModeDecision -->|Guided| ColorGen

    ColorGen --> ApprovalCheck
    ApprovalCheck -->|User Approves| TypoGen
    ApprovalCheck -->|User Regenerates| ColorGen
    TypoGen --> ApprovalCheck
    ApprovalCheck -->|User Approves| CompGen
    CompGen --> ApprovalCheck
    ApprovalCheck -->|User Approves| FinalGen

    QuickGen --> MetadataSet
    ColorGen --> MetadataSet
    TypoGen --> MetadataSet
    CompGen --> MetadataSet
    FinalGen --> MetadataSet
    MetadataSet --> DBProgress

    QuickGen --> Themes
    FinalGen --> Themes

    LayoutActions -->|trigger| LayoutSuggest
    LayoutSuggest --> LayoutJobs

    %% AI Service connections
    QuickGen --> OpenAI
    QuickGen --> Claude
    QuickGen --> Gemini
    ColorGen --> OpenAI
    TypoGen --> OpenAI
    CompGen --> OpenAI
    LayoutSuggest --> OpenAI

    %% Database relationships
    Sites --> Users
    Pages --> Sites
    Sections --> Pages
    Themes --> Sites
    ThemeJobs --> Sites
    LayoutJobs --> Pages

    %% Storage connections
    SectionActions --> SupabaseStorage

    %% Styling
    classDef userInterface fill:#1E88E5,stroke:#1565C0,stroke-width:2px,color:#fff
    classDef frontend fill:#42A5F5,stroke:#1976D2,stroke-width:2px,color:#fff
    classDef backend fill:#66BB6A,stroke:#388E3C,stroke-width:2px,color:#fff
    classDef database fill:#4CAF50,stroke:#2E7D32,stroke-width:2px,color:#fff
    classDef triggerTask fill:#7E57C2,stroke:#5E35B1,stroke-width:3px,color:#fff
    classDef triggerInfra fill:#9575CD,stroke:#7E57C2,stroke-width:2px,color:#fff
    classDef aiServices fill:#AB47BC,stroke:#7B1FA2,stroke-width:2px,color:#fff
    classDef storage fill:#26A69A,stroke:#00695C,stroke-width:2px,color:#fff
    classDef external fill:#FF7043,stroke:#D84315,stroke-width:2px,color:#fff
    classDef decision fill:#FFA726,stroke:#F57C00,stroke-width:2px,color:#000

    class Login,Dashboard,SiteDetail,PageEditor,PagePreview,PublishedSite userInterface
    class SupabaseAuth,ServerActions,Middleware backend
    class SiteActions,PageActions,SectionActions,ThemeActions,LayoutActions backend
    class QuickGen,ColorGen,TypoGen,CompGen,FinalGen,LayoutSuggest triggerTask
    class MetadataSet,DBProgress triggerInfra
    class Users,Sites,Pages,Sections,Themes,ThemeJobs,LayoutJobs database
    class OpenAI,Claude,Gemini aiServices
    class SupabaseStorage storage
    class ModeDecision,ApprovalCheck decision
```

### Extension Strategy

**Why These Extensions:**

- **Content Management Tables** - Template has transcription-focused tables; Site Engine needs Sites → Pages → Sections hierarchy
- **Theme Generation Workflow** - Core differentiator: AI generates Tailwind themes from natural language descriptions
- **Layout Suggestion Workflow** - Reduces friction: AI recommends page structure based on purpose description
- **Multi-Vendor AI** - Flexibility to use best model for task, avoid vendor lock-in

**Integration Points:**

- Trigger.dev tasks follow existing template patterns (same config, same real-time hooks)
- Server Actions use established Drizzle ORM patterns from template
- Authentication reuses Supabase Auth without modification
- Storage uses existing Supabase Storage bucket pattern

**Avoided Complexity:**

- No Redis cache - PostgreSQL handles all state, Trigger.dev handles job state
- No separate microservices - Next.js + Trigger.dev handles everything
- No billing system - Personal-use MVP, add later if needed
- No complex queue system - Trigger.dev orchestrates all background work

### System Flow Explanation

**Template Foundation Flow:**

1. User authenticates via Supabase Auth (email/OAuth)
2. Protected routes check session via middleware
3. Server Actions perform CRUD operations via Drizzle ORM
4. Trigger.dev handles long-running background jobs

**Extension Integration:**

1. **Content Management**: Server Actions for sites/pages/sections use same Drizzle patterns
2. **Theme Generation**: Server Action triggers Trigger.dev task, frontend uses `useRealtimeRun` for progress
3. **Layout Suggestions**: Server Action triggers task, simple polling for completion
4. **Domain Routing**: Middleware checks hostname, rewrites to published site routes

**Data Flow:**

```
Content Editing:
  UI → Server Action → Drizzle ORM → PostgreSQL → Response → UI Update

Theme Generation (Quick):
  UI → Server Action → Create Job → Trigger Task → AI API → Save Theme → UI Progress Updates

Theme Generation (Guided):
  UI → Server Action → Create Job → Stage 1 Task → Await Approval →
  User Approves → Stage 2 Task → ... → Stage 4 Task → Save Theme
```

---

## Technical Risk Assessment

### Template Foundation Strengths (Low Risk)

- **Authentication** - Supabase Auth is battle-tested, OAuth flows work out of the box
- **Database infrastructure** - Drizzle ORM + PostgreSQL gives type-safe queries with excellent tooling
- **Background job orchestration** - Trigger.dev v4 patterns already configured with real-time progress hooks
- **File storage** - Supabase Storage handles image uploads without custom infrastructure
- **Styling system** - shadcn/ui + Tailwind CSS provides consistent component patterns

### Extension Integration Points (Monitor These)

**Multi-Vendor AI Abstraction**

- Risk: Each AI provider has different response formats, rate limits, and error behaviors
- Mitigation: Build unified interface early with consistent error handling. Start with OpenAI only, add others incrementally

**JSONB Content Flexibility vs Type Safety**

- Risk: Sections table uses JSONB for block content - easy to store invalid data shapes
- Mitigation: Define TypeScript interfaces for each block type, validate on write with Zod schemas

**Human-in-the-Loop State Management (Guided Mode)**

- Risk: Job stuck in "awaiting_approval" if user abandons modal
- Mitigation: Auto-cleanup jobs older than 24 hours in awaiting state. Store all stage data for resume capability

**Domain-Based Routing Complexity**

- Risk: Middleware hostname checking tricky across local/preview/production environments
- Mitigation: Clear environment-based configuration, thorough testing before custom domain setup

### Smart Architecture Decisions

- **Repurposing Trigger.dev infrastructure** - New tasks fit existing patterns, no infrastructure rebuild
- **JSONB for sections** - Avoids schema changes for new block types
- **Two theme generation modes** - Quick for speed, Guided for control, same output format
- **Single-user MVP** - No billing/multi-tenancy complexity, add later if needed

---

## Implementation Strategy

### Phase 1 (Foundation - Content Management)

**Database Migration:**

1. Remove transcription tables (transcription_jobs, transcripts, ai_summaries, transcript_conversations, transcript_messages)
2. Create sites table with status enum
3. Create pages table with site relationship
4. Create sections table with block_type enum and JSONB content

**Core Features:**

- Dashboard with sites grid
- Site detail page with tabbed interface
- Page editor with section builder
- Inline section editing with auto-save
- Page preview with device toggle

### Phase 2 (AI Features - Theme Generation)

**Database:**

1. Create theme_generation_jobs table with status enum and stage data columns
2. Create themes table with JSONB data and is_active flag

**Trigger.dev Tasks:**

1. generate-theme-quick (single AI call)
2. generate-color-palette (Guided Stage 1)
3. generate-typography (Guided Stage 2)
4. generate-component-styles (Guided Stage 3)
5. finalize-theme (Guided Stage 4)

**Frontend:**

- Theme generator modal with mode selector
- Requirements form
- Stage review components (colors, typography, components)
- Real-time progress display
- Saved themes list

### Phase 3 (AI Features - Layout Suggestions)

**Database:**

1. Create layout_suggestion_jobs table

**Trigger.dev Tasks:**

1. suggest-layout (single task)

**Frontend:**

- Layout suggestion modal in page editor
- Section recommendations display
- Accept/dismiss workflow

### Integration Guidelines

**Connecting Extensions to Template:**

- Use existing `lib/auth.ts` patterns for user authentication checks
- Follow established Server Action patterns in `app/actions/`
- Export new Trigger.dev tasks from `trigger/index.ts`
- Use `useRealtimeRun` hook for theme generation progress (same as transcription pattern)
- Store all state in PostgreSQL via Drizzle - never rely on task memory

---

## Development Approach

### Template-First Development

1. **Leverage existing patterns** - Copy Server Action structure from template examples
2. **Reuse Trigger.dev configuration** - Tasks follow same pattern as transcription tasks
3. **Keep authentication unchanged** - Supabase Auth works as-is for single-user MVP
4. **Use existing UI components** - shadcn/ui components from `components/ui/`

### Minimal Viable Extensions

1. **Start with content management** - Sites/Pages/Sections working before AI features
2. **Add Quick theme generation first** - Simpler than Guided mode, delivers value faster
3. **Guided mode second** - Build on Quick mode foundation
4. **Layout suggestions last** - Nice-to-have after core theme workflow works

### Extension Integration Patterns

**Server Actions:**

```typescript
// Follow existing pattern from template
"use server";
export async function createSite(data: CreateSiteInput): Promise<ActionResult> {
  const userId = await requireUserId();
  // ... Drizzle operations
  return { success: true };
}
```

**Trigger.dev Tasks:**

```typescript
// Follow existing task pattern
export const generateThemeQuickTask = task({
  id: "generate-theme-quick",
  run: async (payload: GenerateThemeQuickPayload) => {
    metadata.set("progress", 10);
    // ... AI generation
    metadata.set("progress", 100);
    return { success: true };
  },
});
```

---

## Background Job Workflows

### Theme Generation Workflow

**File:** `ai_docs/prep/trigger_workflow_theme_generation.md`
**Purpose:** Generate Tailwind CSS themes with shadcn/ui compatible styles using AI
**Trigger:** User clicks "Generate New Theme" in site Theme tab
**Duration:** 30s-2min (Quick), 2-5min with human review (Guided)

**Task Chain (Quick Mode):**

```
User submits requirements → generate-theme-quick Task → Complete theme saved
Progress: 0% → 30% (colors) → 50% (typography) → 70% (components) → 100% (complete)
```

**Task Chain (Guided Mode):**

```
User submits requirements
  → generate-color-palette Task (0-25%)
  → [Awaiting User Approval]
  → generate-typography Task (25-50%)
  → [Awaiting User Approval]
  → generate-component-styles Task (50-75%)
  → [Awaiting User Approval]
  → finalize-theme Task (75-100%)
  → Complete theme saved
```

**Key Architecture Patterns:**

- **Progress Tracking:** `metadata.set("progress", X)` for real-time UI, database updates for persistence
- **Database State:** theme_generation_jobs tracks status, stage data columns store intermediate results
- **Human Checkpoints:** Guided mode pauses with "awaiting_X_approval" status, resumes on user action
- **Error Handling:** Retry with exponential backoff, user-friendly error messages stored in database

### Layout Suggestion Workflow

**File:** `ai_docs/prep/trigger_workflow_layout_suggestion.md` (pending detailed design)
**Purpose:** AI recommends page section structure based on description
**Trigger:** User clicks "Suggest Layout" in page editor
**Duration:** 10-30s

**Task Chain:**

```
User describes page purpose → suggest-layout Task → Suggestions displayed
Simple loading state (no real-time progress needed)
```

**Key Architecture Patterns:**

- **Progress Tracking:** Simple loading spinner, no percentage needed
- **Database State:** layout_suggestion_jobs stores input description and output suggestions
- **Output:** Array of suggested sections with block types and default content

---

## Success Metrics

This system architecture supports your core value proposition: **Full control over site's look, feel, and content with fast, easy updates using AI-powered theme generation and design assistance**

**Template Optimization:** Leverages Trigger.dev infrastructure, Supabase Auth, Drizzle ORM patterns while adding focused CMS + AI extensions

**Focused Extensions:** Adds only content management tables, theme generation workflow, and layout suggestions - no unnecessary infrastructure

**Reduced Complexity:** Avoids over-engineering by using template foundation effectively - no Redis, no microservices, no billing system for MVP

> **Next Steps:** Database migration - start with dropping transcription tables, then add CMS tables following the phased implementation strategy

---

**Last Updated:** December 2025
**Current State:** Architecture Design Complete - Ready for Implementation
**Total Database Tables:** 7 (1 existing + 6 new)
**Total Trigger.dev Tasks:** 6 (5 theme generation + 1 layout suggestion)
