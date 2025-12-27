# Strategic Database Planning Document

## App Summary

**End Goal:** Full control over site's look, feel, and content with fast, easy updates using AI-powered theme generation and design assistance
**Template Used:** worker-simple (requires significant modification - content management app, not transcription)
**Core Workflows:** Theme Generation (Trigger.dev), Layout Suggestions (Trigger.dev)
**Background Job Types:** AI content generation (themes, layout recommendations)

---

## Current Database State

### Existing Tables (Worker-Simple Template) - TO BE REMOVED

The worker-simple template came with transcription-focused tables that are **not relevant** to Site Engine:

- `transcription_jobs` - Audio/video job tracking (REMOVE)
- `transcripts` - Transcription results in multiple formats (REMOVE)
- `ai_summaries` - AI-generated transcript summaries (REMOVE)
- `transcript_conversations` - Chat threads about transcripts (REMOVE)
- `transcript_messages` - Individual chat messages (REMOVE)

### Table to Keep

- `users` - User profiles with roles (keep as-is, works for single-user MVP)

### Template Assessment

- **Fit Level:** 10% - Only `users` table is relevant
- **Issues:** Template designed for file processing workflow, but Site Engine is a content management system
- **Action Required:** Remove 5 tables, create 6 new tables

---

## Workflow-to-Schema Mapping

### Workflow 1: Theme Generation (`trigger_workflow_theme_generation.md`)

**Purpose:** Generate Tailwind CSS themes with shadcn/ui compatible styles using AI

**Two Modes:**
- **Quick Generate:** Single AI call, real-time progress (30s-2min)
- **Guided Generate:** Multi-stage with human checkpoints (2-5min)

**Job Tracking Table:** `theme_generation_jobs`
```typescript
{
  id: uuid (PK)
  site_id: uuid (FK → sites.id, cascade delete)
  user_id: uuid (FK → users.id, cascade delete)

  // Generation mode
  mode: enum ("quick", "guided")

  // Job status and progress
  status: enum (pending, generating_colors, awaiting_color_approval,
                generating_typography, awaiting_typography_approval,
                generating_components, awaiting_styles_approval,
                finalizing, completed, failed)
  progress_percentage: integer (0-100)
  error_message: text (nullable)

  // Trigger.dev integration
  trigger_job_id: text (Trigger.dev run ID)

  // Input requirements
  requirements: jsonb {
    brandName: string
    industry: string
    styleKeywords: string[]
    colorPreferences?: { preferredColors?, avoidColors? }
    targetAudience?: string
    additionalNotes?: string
  }

  // Stage data (Guided mode - populated as stages complete)
  color_data: jsonb (nullable) - ColorPalette from Stage 1
  typography_data: jsonb (nullable) - TypographySettings from Stage 2
  component_data: jsonb (nullable) - ComponentStyles from Stage 3
  final_theme_data: jsonb (nullable) - Complete ThemeData

  // AI provider tracking
  ai_provider: text ("openai", "anthropic", "google")
  ai_model: text (e.g., "gpt-4.1", "claude-3-opus")

  // Timestamps
  created_at: timestamp
  updated_at: timestamp
}

// Indexes
- site_id (for site's job history)
- user_id (for user's job list)
- status (for active job queries)
```

**Results Table:** `themes`
```typescript
{
  id: uuid (PK)
  site_id: uuid (FK → sites.id, cascade delete)
  user_id: uuid (FK → users.id, cascade delete)
  generation_job_id: uuid (FK → theme_generation_jobs.id, nullable, set null on delete)

  // Theme identification
  name: text (user-editable, e.g., "Modern Blue", "Generated Theme 1")
  is_active: boolean (only one active per site)

  // Theme data
  data: jsonb {
    colors: ColorPalette
    typography: TypographySettings
    components: ComponentStyles
    tailwindExtends: Record<string, unknown>
    cssVariables: string
    generatedAt: string
    aiProvider?: string
    aiModel?: string
  }

  // Timestamps
  created_at: timestamp
  updated_at: timestamp
}

// Constraints
- Only one theme with is_active=true per site_id (enforced in application logic)

// Indexes
- site_id (for site's themes list)
- user_id (for user queries)
- is_active (for finding active theme quickly)
```

---

### Workflow 2: Layout Suggestions (`trigger_workflow_layout_suggestion.md`)

**Purpose:** AI recommends page section structure based on description
**Duration:** 10-30s (quick operation)
**Decision:** Use Trigger.dev task for job history tracking

**Job Tracking Table:** `layout_suggestion_jobs`
```typescript
{
  id: uuid (PK)
  page_id: uuid (FK → pages.id, cascade delete)
  user_id: uuid (FK → users.id, cascade delete)

  // Job status
  status: enum (pending, processing, completed, failed)
  progress_percentage: integer (0-100)
  error_message: text (nullable)

  // Trigger.dev integration
  trigger_job_id: text (Trigger.dev run ID)

  // Input
  description: text (user's description of page purpose)

  // Output
  suggestions: jsonb (nullable) - Array of suggested sections
  /*
  [
    {
      blockType: "hero" | "text" | "features" | etc.
      title: string
      description: string
      defaultContent: object (block-type-specific defaults)
    }
  ]
  */

  // Timestamps
  created_at: timestamp
  completed_at: timestamp (nullable)
}

// Indexes
- page_id (for page's suggestion history)
- user_id (for user queries)
- status (for active job queries)
```

**Note:** No separate results table needed - suggestions stored directly in job record since they're ephemeral (user applies them to page or dismisses).

---

## Content Management Tables (Core Application)

### `sites` - Top-Level Container

```typescript
{
  id: uuid (PK)
  user_id: uuid (FK → users.id, cascade delete)

  // Site identification
  name: text (required)
  description: text (nullable)
  slug: text (unique, for URL: mysite.siteengine.app/sites/[slug])

  // Publishing
  status: enum ("draft", "published")
  custom_domain: text (nullable, for Vercel domain setup)

  // Timestamps
  created_at: timestamp
  updated_at: timestamp
  published_at: timestamp (nullable, set when first published)
}

// Constraints
- UNIQUE on slug

// Indexes
- user_id (for user's sites list)
- slug (for domain-based routing lookups)
- status (for filtering published sites)
```

---

### `pages` - Pages Within Sites

```typescript
{
  id: uuid (PK)
  site_id: uuid (FK → sites.id, cascade delete)
  user_id: uuid (FK → users.id, cascade delete)

  // Page identification
  title: text (required)
  slug: text (required, unique within site)

  // Publishing
  status: enum ("draft", "published")

  // Metadata
  meta_title: text (nullable, for SEO)
  meta_description: text (nullable, for SEO)

  // Timestamps
  created_at: timestamp
  updated_at: timestamp
  published_at: timestamp (nullable)
}

// Constraints
- UNIQUE on (site_id, slug) - slug unique within each site

// Indexes
- site_id (for site's pages list)
- user_id (for user queries)
- (site_id, slug) (for page routing lookups)
```

---

### `sections` - Content Blocks Within Pages

```typescript
{
  id: uuid (PK)
  page_id: uuid (FK → pages.id, cascade delete)
  user_id: uuid (FK → users.id, cascade delete)

  // Section type (block type)
  block_type: enum ("hero", "text", "image", "gallery", "features",
                    "cta", "testimonials", "contact", "footer")

  // Content (flexible JSONB based on block_type)
  content: jsonb (required)
  /*
  Examples by block_type:

  hero: {
    heading: string
    subheading: string
    ctaText: string
    ctaUrl: string
    backgroundImageUrl: string (nullable)
  }

  text: {
    content: string (rich text / markdown)
  }

  image: {
    imageUrl: string
    caption: string (nullable)
    alt: string
  }

  features: {
    heading: string
    items: [
      { icon: string, title: string, description: string }
    ]
  }

  testimonials: {
    items: [
      { quote: string, author: string, role: string (nullable) }
    ]
  }
  */

  // Ordering
  position: integer (for drag-and-drop ordering, 0-indexed)

  // Timestamps
  created_at: timestamp
  updated_at: timestamp
}

// Indexes
- page_id (for page's sections list)
- user_id (for user queries)
- (page_id, position) (for ordered section retrieval)
```

---

## Complete Schema Overview

### Users & Auth
- `users` - Core user data with roles (KEEP from template)

### Content Management (NEW)
- `sites` - Top-level site containers
- `pages` - Pages within sites
- `sections` - Content blocks within pages (JSONB for flexibility)

### Theme Generation Workflow (NEW)
- `theme_generation_jobs` - Job tracking with Trigger.dev integration
- `themes` - Saved theme versions with activation

### Layout Suggestion Workflow (NEW)
- `layout_suggestion_jobs` - Quick job tracking with suggestions stored inline

### Tables to Remove
- `transcription_jobs` (not needed)
- `transcripts` (not needed)
- `ai_summaries` (not needed)
- `transcript_conversations` (not needed)
- `transcript_messages` (not needed)

**Total Tables After Migration:** 7
- Keep: 1 (`users`)
- New: 6 (`sites`, `pages`, `sections`, `themes`, `theme_generation_jobs`, `layout_suggestion_jobs`)
- Remove: 5 (all transcription-related)

---

## Trigger.dev Integration Requirements

### Required Fields (Every Job Table)

```typescript
// These fields MUST exist in theme_generation_jobs and layout_suggestion_jobs
{
  trigger_job_id: text        // Trigger.dev run ID for useRealtimeRun()
  status: enum               // Job lifecycle status
  progress_percentage: int   // 0-100, synced with metadata.set("progress")
  error_message: text        // User-friendly error message (nullable)
}
```

### Frontend Integration Pattern

```typescript
// How to use these fields in your UI (Theme Generation)
const { run } = useRealtimeRun(job.trigger_job_id, { accessToken });
const progress = run?.metadata?.progress ?? job.progress_percentage;
const currentStep = run?.metadata?.currentStep;
const status = job.status;

// For Guided mode - poll for stage changes
const isAwaitingApproval = job.status.includes("awaiting");
```

### Database Update Pattern

```typescript
// How tasks update these fields
await updateJobProgress(jobId, 50);           // Updates progress_percentage
metadata.set("progress", 50);                 // Updates real-time UI
await updateJobStatus(jobId, "completed");    // Updates status enum
```

---

## Block Type Content Schemas

### Hero Block
```typescript
interface HeroContent {
  heading: string;
  subheading?: string;
  ctaText?: string;
  ctaUrl?: string;
  backgroundImageUrl?: string;
}
```

### Text Block
```typescript
interface TextContent {
  content: string; // Rich text or markdown
}
```

### Image Block
```typescript
interface ImageContent {
  imageUrl: string;
  caption?: string;
  alt: string;
}
```

### Gallery Block
```typescript
interface GalleryContent {
  images: Array<{
    imageUrl: string;
    caption?: string;
    alt: string;
  }>;
}
```

### Features Block
```typescript
interface FeaturesContent {
  heading?: string;
  items: Array<{
    icon: string;
    title: string;
    description: string;
  }>;
}
```

### CTA Block
```typescript
interface CTAContent {
  heading: string;
  description?: string;
  buttonText: string;
  buttonUrl: string;
}
```

### Testimonials Block
```typescript
interface TestimonialsContent {
  items: Array<{
    quote: string;
    author: string;
    role?: string;
    avatarUrl?: string;
  }>;
}
```

### Contact Block
```typescript
interface ContactContent {
  heading?: string;
  fields: Array<{
    type: "text" | "email" | "textarea";
    label: string;
    required: boolean;
  }>;
  submitButtonText: string;
}
```

### Footer Block
```typescript
interface FooterContent {
  copyrightText: string;
  links: Array<{
    label: string;
    url: string;
  }>;
}
```

---

## Implementation Priority

### Phase 1: Foundation (Core Content Management)

**Migration 1:** Remove transcription tables
- Drop `transcript_messages`
- Drop `transcript_conversations`
- Drop `ai_summaries`
- Drop `transcripts`
- Drop `transcription_jobs`
- Drop related enums

**Migration 2:** Create content management tables
- Create `sites` table with enums
- Create `pages` table
- Create `sections` table with block_type enum

### Phase 2: Theme System

**Migration 3:** Create theme tables
- Create `theme_generation_jobs` table with status enum
- Create `themes` table

### Phase 3: Layout Suggestions

**Migration 4:** Create layout suggestion table
- Create `layout_suggestion_jobs` table

---

## Strategic Advantage

Your worker-simple template provides the **Trigger.dev infrastructure** you need, even though the data model is completely different. Key advantages preserved:

- Trigger.dev configuration (`trigger.config.ts`)
- Real-time progress tracking pattern (`useRealtimeRun`)
- Job status management patterns
- Supabase Storage integration (for images)

**Gaps Addressed:**
- Content hierarchy (Sites → Pages → Sections) now properly modeled
- Theme versioning supports save/switch/delete workflow
- JSONB sections enable flexible block types without schema changes
- Layout suggestions tracked for history/debugging

---

## Migration Checklist

### Before You Start
- [ ] Backup current database (even if empty)
- [ ] Review existing migrations in `drizzle/migrations/`

### Database Migrations
- [ ] Create migration to drop transcription tables
- [ ] Create down migration for rollback capability
- [ ] Create migration for `sites` table
- [ ] Create migration for `pages` table
- [ ] Create migration for `sections` table with block_type enum
- [ ] Create migration for `theme_generation_jobs` table
- [ ] Create migration for `themes` table
- [ ] Create migration for `layout_suggestion_jobs` table
- [ ] Run `npm run db:migrate` locally
- [ ] Test rollback with `npm run db:rollback`

### Schema Files
- [ ] Create `lib/drizzle/schema/sites.ts`
- [ ] Create `lib/drizzle/schema/pages.ts`
- [ ] Create `lib/drizzle/schema/sections.ts`
- [ ] Create `lib/drizzle/schema/themes.ts`
- [ ] Create `lib/drizzle/schema/theme-generation-jobs.ts`
- [ ] Create `lib/drizzle/schema/layout-suggestion-jobs.ts`
- [ ] Update `lib/drizzle/schema/index.ts` exports
- [ ] Remove transcription schema files

### Cleanup
- [ ] Remove `lib/drizzle/schema/transcription-jobs.ts`
- [ ] Remove `lib/drizzle/schema/transcripts.ts`
- [ ] Remove `lib/drizzle/schema/ai-summaries.ts`
- [ ] Remove `lib/drizzle/schema/transcript-conversations.ts`
- [ ] Remove `lib/drizzle/schema/transcript-messages.ts`
- [ ] Remove transcription task files from `trigger/tasks/`
- [ ] Update `trigger/index.ts` to remove transcription task exports

---

## Next Steps

1. **Create database migrations** - Start with dropping transcription tables, then add new tables
2. **Create schema files** - Define Drizzle schemas for new tables
3. **Implement Theme Generation workflow** - Tasks, server actions, UI
4. **Implement Layout Suggestion workflow** - Task, server action, UI
5. **Build content management features** - Sites, pages, sections CRUD

> **Development Approach:** Build incrementally - get Sites/Pages/Sections working first, then add Theme Generation, then Layout Suggestions. Each feature builds on the foundation.

---

**Last Updated:** December 2025
**Current State:** Strategic Planning Complete - Ready for Migration
**Total Tables (Target):** 7
