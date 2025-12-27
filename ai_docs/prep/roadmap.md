# Site Engine Development Roadmap

> **App Name:** Site Engine (engine.headstring.com)
> **Template:** worker-simple (Next.js 15, Supabase, Drizzle ORM, Trigger.dev)
> **Target:** AI-powered website builder for content managers
> **Solo Developer:** Sequential phase completion

---

## 📐 Design Principles (Reference Throughout)

### Draft vs Published Behavior

**Editor & Preview Routes** (`/app/*`):
- Always show ALL pages and sections regardless of status
- Draft content is editable, published content is also editable

**Public Routes** (`/sites/*`):
- Only show published sites with published pages
- Published site + unpublished page = 404
- Unpublished site = 404 for entire site

### Homepage Selection

- Each site has exactly one homepage (`pages.is_home = true`)
- Enforce at app level: setting a new homepage unsets the previous one
- Public route `/sites/[siteSlug]` renders the `is_home` page

### Theme System Discipline

- **Tailwind = structure** (spacing, layout, responsive)
- **CSS variables = theme values** (colors, fonts, shadows)
- Never generate Tailwind configs at runtime
- Theme switching = CSS variable swap, no rebuild required

---

## 🚨 Phase 0: Project Setup (MANDATORY FIRST STEP) ✅ COMPLETE

**Goal**: Prepare development environment and understand current codebase

**⚠️ CRITICAL**: This phase must be completed before any other development work begins

### Run Setup Analysis

[Background: Essential first step to understand current template state and requirements]

- [x] **REQUIRED**: Run `setup.md` using **claude-4-sonnet-1m** on **max mode** for maximum context ✓
- [x] Review generated setup analysis and recommendations ✓
- [x] Verify development environment is properly configured ✓
- [x] Confirm all dependencies and environment variables are set ✓ 2025-12-25
  - [x] Verify `DATABASE_URL` is configured ✓
  - [x] Verify `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` are set ✓
  - [x] Verify `OPENAI_API_KEY` is set (for AI features) ✓
  - [x] Verify `TRIGGER_SECRET_KEY` is set ✓
- [x] Run `npm run dev` to confirm template runs without errors ✓ 2025-12-25
- [x] Document any critical findings before proceeding to Phase 1 ✓

---

## Phase 1: Landing Page & Branding Update ✅ COMPLETE

**Goal**: Update branding and value proposition from transcription app to Site Engine

### Update Application Branding

[Goal: Establish Site Engine brand identity throughout the application]

- [x] Update `lib/metadata.ts` metadata ✓ 2025-12-25
  - [x] Change title to "Site Engine - AI-Powered Website Builder" ✓
  - [x] Update description to reflect content management value prop ✓
  - [x] Update Open Graph metadata ✓
- [x] Update `components/Logo.tsx` with "Site Engine" text ✓ 2025-12-25
- [x] Update `components/landing/HeroSection.tsx` ✓ 2025-12-25
  - [x] New headline: "Build Beautiful Websites Without Code" ✓
  - [x] New subheadline: "AI-powered theme generation and intuitive content management" ✓
  - [x] Update CTA button to "Get Started" -> `/auth/sign-up` ✓
  - [x] Redesigned demo animation: Design → Build → Preview → Publish ✓
- [x] Update `components/landing/ProblemSection.tsx` ✓ 2025-12-25
  - [x] Update pain points for content managers (slow updates, developer dependency, rigid templates) ✓
- [x] Update `components/landing/FeaturesSection.tsx` ✓ 2025-12-25
  - [x] Feature 1: AI Theme Generation ✓
  - [x] Feature 2: Visual Page Editor ✓
  - [x] Feature 3: Instant Preview ✓
  - [x] Feature 4: One-Click Publishing ✓
- [x] Update `components/landing/FAQSection.tsx` ✓ 2025-12-25
  - [x] Update questions for Site Engine context ✓
- [x] Update `components/landing/CTASection.tsx` ✓ 2025-12-25
  - [x] Update final CTA messaging ✓
- [x] Update `components/landing/Footer.tsx` ✓ 2025-12-25
  - [x] Remove social icons ✓
  - [x] Update branding to Site Engine / Headstring ✓

### Update Static Assets

[Goal: Replace template branding with Site Engine assets]

- [x] Update `public/logo.png` with Site Engine logo ✓ (pre-existing)
- [x] Update `app/favicon.ico` with Site Engine favicon ✓ (pre-existing)
- [x] Update `app/apple-icon.png` with Site Engine icon ✓ (pre-existing)
- [x] Update any other brand assets in `public/` ✓ (pre-existing)

### Update Legal Pages

[Goal: Update legal pages for Site Engine]

- [x] Update `app/(public)/terms/page.tsx` - Terms of Service for Site Engine ✓ 2025-12-25
- [x] Update `app/(public)/privacy/page.tsx` - Privacy Policy for Site Engine ✓ 2025-12-25
- [x] Update `app/(public)/cookies/page.tsx` - Cookie Policy for Site Engine ✓ 2025-12-25
- [x] Update company name references to "Headstring" / contact@headstring.com ✓ 2025-12-25

---

## Phase 2: Dashboard & Site Management ✅ COMPLETE

**Goal**: Replace transcription features with sites dashboard - users can create, view, and manage their websites

**Completed:** 2025-12-25 - All 5 sections complete

### Database Schema Replacement ✅ COMPLETE

[Goal: Remove transcription tables and create sites table for content management foundation]

- [x] Create down migration for existing transcription tables (for rollback capability) ✓ 2025-12-25
  - [x] Skipped formal down migrations (dev mode - data loss acceptable) ✓
- [x] Create migration to drop transcription tables ✓ 2025-12-25
  - [x] Drop `transcript_messages` table ✓
  - [x] Drop `transcript_conversations` table ✓
  - [x] Drop `ai_summaries` table ✓
  - [x] Drop `transcripts` table ✓
  - [x] Drop `transcription_jobs` table ✓
  - [x] Drop related enums (`job_status`, `file_type`, `timestamp_granularity`, `summary_type`, `transcript_message_sender`, `transcript_message_status`) ✓
- [x] Create `lib/drizzle/schema/sites.ts` ✓ 2025-12-25
  ```typescript
  // Key fields:
  // id: uuid (PK)
  // user_id: uuid (FK -> users.id, cascade delete)
  // name: text (required)
  // description: text (nullable)
  // slug: text (unique, for URL)
  // status: enum ("draft", "published")
  // custom_domain: text (nullable) - DEFERRED TO PHASE 8
  // created_at, updated_at, published_at timestamps
  ```
- [x] Create down migration for sites table ✓ 2025-12-25
  - [x] Created `drizzle/migrations/0003_serious_tag/down.sql` ✓
- [x] Run `npm run db:generate` to generate migration ✓ 2025-12-25
  - [x] Generated `drizzle/migrations/0003_serious_tag.sql` ✓
- [x] Run `npm run db:migrate` to apply migration ✓ 2025-12-25
- [x] Update `lib/drizzle/schema/index.ts` ✓ 2025-12-25
  - [x] Remove transcription schema exports ✓
  - [x] Add `export * from "./sites"` ✓

### Remove Transcription Code ✅ COMPLETE

[Goal: Clean up template code that's no longer needed]

- [x] Delete `lib/drizzle/schema/transcription-jobs.ts` ✓ 2025-12-25
- [x] Delete `lib/drizzle/schema/transcripts.ts` ✓ 2025-12-25
- [x] Delete `lib/drizzle/schema/ai-summaries.ts` ✓ 2025-12-25
- [x] Delete `lib/drizzle/schema/transcript-conversations.ts` ✓ 2025-12-25
- [x] Delete `lib/drizzle/schema/transcript-messages.ts` ✓ 2025-12-25
- [x] Delete `trigger/tasks/transcribe-audio.ts` ✓ 2025-12-25
- [x] Delete `trigger/tasks/extract-audio.ts` ✓ 2025-12-25
- [x] Delete `trigger/tasks/chunk-audio.ts` ✓ 2025-12-25
- [x] Delete `trigger/tasks/generate-ai-summary.ts` ✓ 2025-12-25
- [x] Delete `trigger/tasks/answer-transcript-question.ts` ✓ 2025-12-25
- [x] Delete `trigger/utils/transcript-context.ts` ✓ 2025-12-25
- [x] Delete `trigger/utils/prompts.ts` (transcription prompts) ✓ 2025-12-25
- [x] Delete `trigger/utils/formats.ts` (transcription formats) ✓ 2025-12-25
- [x] Delete `trigger/utils/ffmpeg.ts` (audio processing) ✓ 2025-12-25
- [x] Update `trigger/index.ts` to remove transcription task exports ✓ 2025-12-25
  - [x] Kept only `openai.ts` export for Phase 5 theme generation ✓
- [x] Delete `app/(protected)/transcripts/` directory ✓ 2025-12-25
- [x] Delete `app/actions/` transcription-related actions ✓ 2025-12-25
  - [x] Deleted `transcriptions.ts` and `transcript-qa.ts` ✓
- [x] Delete `lib/` transcription-related utilities ✓ 2025-12-25
  - [x] Deleted `jobs.ts`, `transcripts.ts`, `transcription-constants.ts`, `transcript-conversations.ts`, `upload.ts`, `media-storage.ts` ✓
- [x] Delete `components/transcripts/` directory (20 components) ✓ 2025-12-25
- [x] Delete `app/api/download/` API route ✓ 2025-12-25

### Build Dashboard Page ✅ COMPLETE

[Goal: Create sites grid dashboard where users see all their websites]

- [x] Create `app/(protected)/app/page.tsx` - Main dashboard ✓ 2025-12-25
  - [x] Server Component to fetch user's sites ✓
  - [x] Display sites in responsive grid layout (1/2/3 cols) ✓
  - [x] Each site card shows: name, status badge (Draft/Published), page count, last updated ✓
  - [x] Sort by last updated (default), name, or date created ✓
  - [x] Empty state: "Create your first site" with prominent CTA ✓
- [x] Create `app/(protected)/app/loading.tsx` - Loading skeleton ✓ 2025-12-25
- [x] Create `app/(protected)/app/error.tsx` - Error boundary ✓ 2025-12-25
- [x] Create `components/sites/SiteCard.tsx` ✓ 2025-12-25
  - [x] Site name and description preview ✓
  - [x] Status badge component ✓
  - [x] Page count display (hardcoded 0 for now) ✓
  - [x] Last updated timestamp (relative time via date-fns) ✓
  - [x] Click card -> navigate to site detail ✓
- [x] Create `components/sites/SiteStatusBadge.tsx` ✓ 2025-12-25
- [x] Create `components/sites/SiteSortDropdown.tsx` ✓ 2025-12-25
- [x] Create `components/sites/CreateSiteModal.tsx` ✓ 2025-12-25
  - [x] Modal with form: Site name (required), Description (optional) ✓
  - [x] Auto-generate slug from name (handled by server action) ✓
  - [x] Submit creates site and navigates to site detail ✓
- [x] Create `components/sites/EmptyState.tsx` ✓ 2025-12-25
  - [x] Friendly empty state with Globe icon ✓
  - [x] "Create Your First Site" button ✓
- [x] Create `components/sites/index.ts` - Barrel export ✓ 2025-12-25

### Build Site Server Actions ✅ COMPLETE

[Goal: Enable site CRUD operations from the dashboard]

- [x] Create `app/actions/sites.ts` ✓ 2025-12-25
  - [x] `createSite(data: { name, description? })` -> Create site, return siteId ✓
  - [x] `updateSite(siteId, data)` -> Update site name/description/slug ✓
  - [x] `deleteSite(siteId)` -> Delete site (cascades to pages) ✓
  - [x] `publishSite(siteId)` -> Set status to published, set published_at ✓
  - [x] `unpublishSite(siteId)` -> Set status to draft ✓
- [x] Create `lib/queries/sites.ts` ✓ 2025-12-25
  - [x] `getSites(userId, options?)` -> All sites for user with sorting ✓
  - [x] `getSiteById(siteId, userId)` -> Single site with ownership check ✓
  - [x] `getSiteBySlug(slug)` -> For URL routing ✓

### Update Navigation ✅ COMPLETE

[Goal: Update sidebar navigation for Site Engine context]

- [x] Update `components/layout/AppSidebar.tsx` ✓ 2025-12-25
  - [x] Replace "Transcripts" with "Dashboard" ✓
  - [x] Update navigation links from `/transcripts` to `/app` ✓
  - [x] Change icon from `FileAudio` to `LayoutDashboard` ✓
  - [x] Update route matching in `getLinkClasses` ✓
- [x] Protected layout already configured correctly ✓
  - [x] Sidebar renders via `AppSidebar` component ✓

---

## Phase 3: Page Management ✅ COMPLETE

**Goal**: Users can create, edit, and manage pages within their sites

**Completed:** 2025-12-25 - All 5 sections complete

### Database Schema for Pages ✅ COMPLETE

[Goal: Create pages table to store individual pages within sites]

- [x] Create `lib/drizzle/schema/pages.ts` ✓ 2025-12-25
  ```typescript
  // Key fields:
  // id: uuid (PK)
  // site_id: uuid (FK -> sites.id, cascade delete)
  // user_id: uuid (FK -> users.id, cascade delete)
  // title: text (required)
  // slug: text (required, unique within site)
  // status: enum ("draft", "published")
  // is_home: boolean (default false, only one true per site)
  // meta_title: text (nullable, SEO)
  // meta_description: text (nullable, SEO)
  // created_at, updated_at, published_at timestamps
  // Constraint: UNIQUE on (site_id, slug)
  ```
- [x] Enforce homepage rule in app logic: only one `is_home=true` per site ✓ 2025-12-25
  - [x] Implemented via transaction in `setAsHomePage` action ✓
- [x] Create down migration for pages table ✓ 2025-12-25
  - [x] Created `drizzle/migrations/0004_clever_mandroid/down.sql` ✓
- [x] Run `npm run db:generate` and `npm run db:migrate` ✓ 2025-12-25
- [x] Update `lib/drizzle/schema/index.ts` - Add `export * from "./pages"` ✓ 2025-12-25

### Build Site Detail Page ✅ COMPLETE

[Goal: Create tabbed site detail view showing pages list, theme settings, and site settings]

- [x] Create `app/(protected)/app/sites/[siteId]/page.tsx` ✓ 2025-12-25
  - [x] Server Component fetching site data and pages ✓
  - [x] Site header with name (editable inline), status badge, publish/unpublish toggle ✓
  - [x] Tab navigation: Pages (default) | Theme | Settings ✓
  - [x] Delete site button with confirmation modal ✓
- [x] Create `components/sites/SiteHeader.tsx` ✓ 2025-12-25
  - [x] Inline editable site name (click-to-edit with Enter/Escape) ✓
  - [x] Status badge (Draft/Published) ✓
  - [x] Publish/Unpublish toggle button ✓
  - [x] Delete site button with AlertDialog confirmation ✓
- [x] Create `components/sites/SiteTabs.tsx` ✓ 2025-12-25
  - [x] Tab component using shadcn/ui Tabs ✓
  - [x] Pages, Theme, Settings tabs ✓
- [x] Create loading and error states ✓ 2025-12-25
  - [x] `loading.tsx` with skeleton UI ✓
  - [x] `error.tsx` with retry button ✓

### Build Pages Tab Content ✅ COMPLETE

[Goal: Display list of pages within a site with management actions]

- [x] Create `components/pages/PagesList.tsx` ✓ 2025-12-25
  - [x] Table of pages with title, slug, status, last updated ✓
  - [x] "Add Page" button with page count display ✓
  - [x] Actions per row: Edit, Duplicate, Set as Home, Publish/Unpublish, Delete ✓
- [x] Create `components/pages/CreatePageModal.tsx` ✓ 2025-12-25
  - [x] Form: Page title (required), Slug (auto-generated if not provided) ✓
  - [x] Submit creates page ✓
- [x] Create `components/pages/EditPageModal.tsx` ✓ 2025-12-25
  - [x] Edit title, slug, meta_title, meta_description ✓
- [x] Create `components/pages/PageRow.tsx` ✓ 2025-12-25
  - [x] Page title and slug display ✓
  - [x] Home badge (if `is_home=true`) ✓
  - [x] Status badge ✓
  - [x] Action dropdown (publish/unpublish, duplicate, delete, set as home) ✓
- [x] Create `components/pages/PageStatusBadge.tsx` ✓ 2025-12-25
- [x] Create `components/pages/HomeBadge.tsx` ✓ 2025-12-25
- [x] Create `components/pages/PageActions.tsx` ✓ 2025-12-25
- [x] Create `components/pages/EmptyPagesState.tsx` ✓ 2025-12-25
- [x] Click row -> navigate to page editor ✓ 2025-12-25 (implemented in Phase 4)

### Build Page Server Actions ✅ COMPLETE

[Goal: Enable page CRUD operations]

- [x] Create `app/actions/pages.ts` ✓ 2025-12-25
  - [x] `createPage(siteId, data: { title, slug? })` -> Create page, return pageId ✓
    - [x] If first page in site, automatically set `is_home=true` ✓
  - [x] `updatePage(pageId, data)` -> Update page title/slug/meta ✓
  - [x] `deletePage(pageId)` -> Delete page ✓
  - [x] `publishPage(pageId)` -> Set status to published ✓
  - [x] `unpublishPage(pageId)` -> Set status to draft ✓
  - [x] `duplicatePage(pageId)` -> Copy page with "-copy" suffix ✓
  - [x] `setAsHomePage(pageId)` -> Set `is_home=true`, unset others via transaction ✓
- [x] Create `lib/queries/pages.ts` ✓ 2025-12-25
  - [x] `getPagesBySite(siteId)` -> All pages for site ✓
  - [x] `getPageById(pageId)` -> Single page with ownership check ✓
  - [x] `getPageBySlug(siteId, slug)` -> For URL routing ✓
  - [x] `getPageCount(siteId)` -> Count for dashboard display ✓
  - [x] `getHomePage(siteId)` -> Get homepage for site ✓

### Update Navigation for Site Context ✅ COMPLETE

[Goal: Adaptive sidebar shows site-specific navigation when inside a site]

- [x] Update sidebar to show site context when on `/app/sites/[siteId]/*` ✓ 2025-12-25
  - [x] Show "Back to Sites" link ✓
  - [x] Show site name in "Current Site" section ✓
  - [x] Pages link ✓
  - [x] Theme link ✓
  - [x] Settings link ✓
- [x] Create `components/layout/SiteContextSidebar.tsx` ✓ 2025-12-25
- [x] Update `components/layout/AppSidebar.tsx` with context detection ✓ 2025-12-25
- [x] Add breadcrumb navigation: Dashboard -> [Site Name] -> [Page Name] ✓ 2025-12-25 (implemented in Phase 4)
- [x] Create `components/navigation/Breadcrumbs.tsx` ✓ 2025-12-25 (implemented in Phase 4)

---

## Phase 4: Section Builder & Content Editing ✅ COMPLETE

**Goal**: Users can add, edit, reorder, and delete content sections on pages with 9 block types

**Started:** 2025-12-25
**Completed:** 2025-12-26

### Database Schema for Sections ✅ COMPLETE

[Goal: Create sections table with JSONB content for flexible block types]

- [x] Create `lib/drizzle/schema/sections.ts` ✓ 2025-12-25
  ```typescript
  // Key fields:
  // id: uuid (PK)
  // page_id: uuid (FK -> pages.id, cascade delete)
  // user_id: uuid (FK -> users.id, cascade delete)
  // block_type: enum ("hero", "text", "image", "gallery", "features", "cta", "testimonials", "contact", "footer")
  // content: jsonb (required, structure varies by block_type)
  // position: integer (for ordering, 0-indexed)
  // created_at, updated_at timestamps
  ```
- [x] Create down migration for sections table ✓ 2025-12-25
  - Created `drizzle/migrations/0005_sharp_patriot/down.sql`
- [x] Run `npm run db:generate` and `npm run db:migrate` ✓ 2025-12-25
  - Generated `drizzle/migrations/0005_sharp_patriot.sql`
- [x] Update `lib/drizzle/schema/index.ts` - Add `export * from "./sections"` ✓ 2025-12-25
- [x] Create `lib/section-types.ts` with TypeScript content interfaces ✓ 2025-12-25
- [x] Create `lib/section-defaults.ts` with default content per block type ✓ 2025-12-25

### Build Page Editor ✅ COMPLETE

[Goal: Create visual page editor with section list and inline editing]

- [x] Create `app/(protected)/app/sites/[siteId]/pages/[pageId]/page.tsx` ✓ 2025-12-26
  - [x] Server Component fetching page and sections ✓
  - [x] Editor header: Back link, page title (editable), auto-save indicator, Preview button, Publish toggle ✓
  - [x] Sections list with drag-and-drop reordering ✓
  - [x] "Add Section" button at bottom ✓
- [x] Create `components/editor/EditorHeader.tsx` ✓ 2025-12-26
  - [x] Back to site link ✓
  - [x] Inline editable page title ✓
  - [x] Auto-save indicator: "Saved" / "Saving..." / "Unsaved changes" ✓
  - [x] Preview button -> opens preview page ✓
  - [x] Publish/Unpublish toggle ✓
- [x] Create `components/editor/SectionsList.tsx` ✓ 2025-12-26
  - [x] Drag-and-drop sortable list (use @dnd-kit/sortable) ✓
  - [x] Each section shows block type icon, content preview ✓
  - [x] Click section -> expand inline editor ✓
  - [x] Reorder saves via server action ✓

### Build Block Picker ✅ COMPLETE

[Goal: Allow users to add new sections by selecting from 9 block types]

- [x] Create `components/editor/BlockPicker.tsx` ✓ 2025-12-26
  - [x] Modal showing block type grid ✓
  - [x] 9 block types: Hero, Text, Image, Gallery, Features, CTA, Testimonials, Contact, Footer ✓
  - [x] Each shows icon, name, brief description ✓
  - [x] Click -> inserts new section with default content ✓
- [x] Create `components/editor/BlockIcon.tsx` ✓ 2025-12-26
  - [x] Icon component for each block type ✓

### Build Section Card & Inline Editor ✅ COMPLETE

[Goal: Display sections with expandable inline editing for each block type]

- [x] Create `components/editor/SectionCard.tsx` ✓ 2025-12-26
  - [x] Collapsed state: drag handle, block icon, content preview, delete button ✓
  - [x] Expanded state: inline editor for that block type ✓
  - [x] Click to expand/collapse ✓
- [x] Create `components/editor/SectionEditor.tsx` ✓ 2025-12-26
  - [x] Router component that renders correct editor based on block_type ✓
  - [x] Auto-save on field change (debounced 500ms) ✓
- [x] Create block-specific editors in `components/editor/blocks/` ✓ 2025-12-26:
  - [x] `HeroEditor.tsx` - Heading, subheading, CTA text/URL, background image URL ✓
  - [x] `TextEditor.tsx` - Simple text editor (rich text deferred) ✓
  - [x] `ImageEditor.tsx` - Image URL, caption, alt text ✓
  - [x] `GalleryEditor.tsx` - Multiple images with captions ✓
  - [x] `FeaturesEditor.tsx` - Repeater: icon name, title, description ✓
  - [x] `CTAEditor.tsx` - Heading, description, button text/URL ✓
  - [x] `TestimonialsEditor.tsx` - Repeater: quote, author, role, avatar ✓
  - [x] `ContactEditor.tsx` - Form field configuration ✓
  - [x] `FooterEditor.tsx` - Copyright text, links repeater ✓

### Build Section Server Actions ✅ COMPLETE

[Goal: Enable section CRUD with auto-save support]

- [x] Create `app/actions/sections.ts` ✓ 2025-12-26
  - [x] `addSection(pageId, blockType, position)` -> Add section with default content ✓
  - [x] `updateSection(sectionId, content)` -> Update section content (auto-save target) ✓
  - [x] `deleteSection(sectionId)` -> Remove section, reorder remaining ✓
  - [x] `reorderSections(pageId, sectionIds[])` -> Update positions ✓
  - [x] `duplicateSection(sectionId)` -> Copy section below original ✓
- [x] Create `lib/queries/sections.ts` ✓ 2025-12-26
  - [x] `getSectionsByPage(pageId)` -> All sections ordered by position ✓
  - [x] `getSectionById(sectionId)` -> Single section with content ✓
- [x] Create `lib/section-defaults.ts` ✓ 2025-12-25 (created with database schema)
  - [x] Default content for each block type when first created ✓

### Implement Auto-Save ✅ COMPLETE

[Goal: Content changes save automatically with debouncing and honest error handling]

- [x] Create `hooks/useAutoSave.ts` ✓ 2025-12-26
  - [x] Debounced save (500ms delay after last change) ✓
  - [x] Track save state: `saved` / `saving` / `error` ✓
  - [x] On error: show visible error banner, do NOT overwrite local state ✓
  - [x] Retry button on error state ✓
- [x] Create `components/editor/SaveIndicator.tsx` ✓ 2025-12-26
  - [x] "Saved ✓" (green) / "Saving..." (gray) / "Save failed" (red with retry) ✓
- [x] Integrate auto-save into section editors ✓ 2025-12-26
- [x] Show save indicator in editor header ✓ 2025-12-26

### Configure Supabase Storage (DEFERRED)

**Note:** Storage configuration for image uploads is deferred until needed. Currently using URL-based image inputs.

---

## Phase 5: AI Theme Generation (Quick Mode ✅ COMPLETE)

**Goal**: Users can generate Tailwind CSS themes using AI (Quick mode first, then Guided mode)

**Started:** 2025-12-26
**Quick Mode Completed:** 2025-12-26
**Guided Mode:** Not started (deferred)

### Database Schema for Themes ✅ COMPLETE

[Goal: Create tables to track theme generation jobs and saved themes]

- [x] Create `lib/drizzle/schema/theme-types.ts` ✓ 2025-12-26
  - TypeScript interfaces: ThemeRequirements, ColorPalette, TypographySettings, ComponentStyles, ThemeData
- [x] Create `lib/drizzle/schema/theme-generation-jobs.ts` ✓ 2025-12-26
  - 18 columns including JSONB for requirements and stage outputs
  - Mode enum (quick, guided), Status enum (10 states), Stage enum
  - Progress tracking, Trigger.dev run ID, error handling
- [x] Create `lib/drizzle/schema/themes.ts` ✓ 2025-12-26
  - Saved themes with is_active flag (application-level enforcement)
  - FK to generation_job_id with SET NULL on delete
- [x] Create down migrations for both tables ✓ 2025-12-26
  - `drizzle/migrations/0006_luxuriant_red_skull/down.sql`
- [x] Run `npm run db:generate` and `npm run db:migrate` ✓ 2025-12-26
- [x] Update `lib/drizzle/schema/index.ts` - Add exports ✓ 2025-12-26

### Build AI Provider Abstraction ✅ COMPLETE

[Goal: Create unified interface for OpenAI with extensible design for future multi-vendor AI]

- [x] Create `trigger/utils/ai-providers.ts` ✓ 2025-12-26
  - [x] `generateStructuredOutput<T>(system, user, schema)` - OpenAI JSON mode with Zod validation ✓
  - [x] `generateTextOutput()` - Plain text responses ✓
  - [x] Designed for future multi-provider expansion (OpenAI only for MVP) ✓
- [x] Create `trigger/utils/font-list.ts` ✓ 2025-12-26
  - [x] Curated Google Fonts: sans-serif, serif, display, monospace categories ✓
  - [x] Validation functions: `isValidFont()`, `isHeadingFont()`, `isBodyFont()` ✓
  - [x] Font pairings: FONT_PAIRINGS object with 8 style presets ✓
- [x] Create `trigger/utils/theme-prompts.ts` ✓ 2025-12-26
  - [x] `buildQuickGeneratePrompt(requirements)` - Full theme in one prompt ✓
  - [x] `buildColorPalettePrompt(requirements)` - Colors only ✓
  - [x] `buildTypographyPrompt(requirements, colors)` - Typography with color context ✓
  - [x] `buildComponentStylesPrompt(requirements, colors, typography)` - Component styles ✓
- [x] Create `trigger/utils/theme-parser.ts` ✓ 2025-12-26
  - [x] Zod schemas for ColorPalette, TypographySettings, ComponentStyles, ThemeData ✓
  - [x] Parse functions with validation and safe parse variants ✓
  - [x] Hex color normalization and font fallback transforms ✓
- [x] Create `trigger/utils/tailwind-generator.ts` ✓ 2025-12-26
  - [x] `generateTailwindExtends(theme)` - Tailwind config extends object ✓
  - [x] `generateCSSVariables(theme)` - CSS custom properties ✓
  - [x] `generateGoogleFontsUrl/Link/Import()` - Font loading helpers ✓

### Build Quick Generate Mode (Task) ✅ COMPLETE

[Goal: Single AI call generates complete theme with real-time progress]

- [x] Create `trigger/tasks/generate-theme-quick.ts` ✓ 2025-12-26
  - Single AI call with full prompt via `buildQuickGeneratePrompt()`
  - Progress updates: 0% -> 5% -> 10% -> 80% -> 90% -> 100%
  - Uses `metadata.set("progress", X)` for real-time Trigger.dev tracking
  - Saves complete theme to database, auto-activates first theme per site
- [x] Update `trigger/index.ts` - Export new task ✓ 2025-12-26
- [x] Create `lib/theme-jobs.ts` ✓ 2025-12-26
  - [x] `createThemeGenerationJob(siteId, options)` - Create job record ✓
  - [x] `updateJobProgress(jobId, progress, status)` - Update progress ✓
  - [x] `markJobFailed(jobId, errorMessage)` - Mark job as failed ✓
  - [x] `setJobTriggerRunId(jobId, triggerRunId)` - Link to Trigger.dev run ✓
  - [x] `getThemeJobById()`, `getLatestThemeJob()`, `getActiveThemeJobs()` - Queries ✓
  - [x] `cleanupOldFailedJobs()` - Maintenance utility ✓

### AI Failure Handling ✅ COMPLETE

[Goal: Simple, honest error handling - show error, offer retry, log for debugging]

- [x] On AI job failure (backend): ✓ 2025-12-26
  - [x] Save error message to `theme_generation_jobs.error_message` ✓
  - [x] Set status to `failed` ✓
  - [x] UI shows error message with "Retry" button ✓ 2025-12-26
- [x] Log failures to database for pattern debugging ✓ 2025-12-26
- [x] Retry = `retryThemeGeneration(jobId)` creates new job with same requirements ✓ 2025-12-26

### Build Theme Tab UI ✅ COMPLETE

[Goal: Create theme management interface in site detail]

- [x] Create `components/theme/ThemeTab.tsx` ✓ 2025-12-26
  - [x] Current theme preview (colors, fonts info) ✓
  - [x] "Generate New Theme" button -> opens modal ✓
  - [x] Saved themes list with activate/delete ✓
  - [ ] Manual adjustment controls (color pickers, font dropdowns) - deferred to future phase
- [x] Create `components/theme/ThemePreview.tsx` ✓ 2025-12-26
  - [x] Color palette swatches (all 8 theme colors) ✓
  - [x] Typography samples (headings, body, small) ✓
  - [x] Component preview (buttons, inputs, badges, cards) ✓
  - [x] Optional rationale display ✓
- [x] Create `components/theme/ThemeGeneratorModal.tsx` ✓ 2025-12-26
  - [x] Requirements form step ✓
  - [x] Progress display with polling ✓
  - [x] Preview on complete with Done/Generate Another buttons ✓
  - [ ] Mode selector (Quick/Guided) - only Quick mode for now
- [x] Create `components/theme/RequirementsForm.tsx` ✓ 2025-12-26
  - [x] Brand/site name input ✓
  - [x] Industry dropdown (13 options) ✓
  - [x] Style keywords multi-select (15 options, max 5) ✓
  - [x] Color preferences with visual mood-based presets ✓ 2025-12-26
    - [x] 6 color mood categories (Trust, Energy, Growth, Luxury, Calm, Neutral) ✓
    - [x] 18 clickable preset colors with visual swatches ✓
    - [x] Custom color input for additional hex codes ✓
    - [x] Colors to avoid input ✓
  - [x] Target audience (optional) ✓
  - [x] Additional notes (optional) ✓
- [x] Create `components/theme/ProgressDisplay.tsx` ✓ 2025-12-26
  - [x] Progress bar (0-100%) ✓
  - [x] Current step text ✓
  - [x] Step checklist with icons (completed, in-progress, pending, failed) ✓
  - [x] Error message display ✓
- [x] Create `components/theme/SavedThemesList.tsx` ✓ 2025-12-26
  - [x] List of saved themes with color preview ✓
  - [x] Activate button (deactivates others) ✓
  - [x] Delete button (prevents deleting active) ✓
  - [x] Duplicate button ✓
  - [x] Delete confirmation dialog ✓
- [x] Integrate into site detail page ✓ 2025-12-26
  - [x] Updated SiteTabs to use ThemeTab ✓
  - [x] Fetch themes and activeTheme in page.tsx ✓
  - [x] Added barrel export index.ts ✓
  - [x] SiteTabs syncs with URL query params (?tab=theme, ?tab=settings) ✓ 2025-12-26
  - [x] Sidebar navigation uses query params for tab switching ✓ 2025-12-26
  - [x] Theme list auto-refreshes after generation complete ✓ 2025-12-26

### Build Theme Server Actions ✅ COMPLETE

[Goal: Enable theme generation and management]

- [x] Create `app/actions/theme.ts` ✓ 2025-12-26
  - [x] `triggerThemeGeneration(siteId, mode, requirements)` - Start job, trigger Trigger.dev task ✓
  - [x] `retryThemeGeneration(jobId)` - Retry failed job with same requirements ✓
  - [x] `saveGeneratedTheme(siteId, themeData, name, activate)` - Save theme, optionally activate ✓
  - [x] `activateTheme(themeId)` - Set as active, deactivate others ✓
  - [x] `deleteTheme(themeId)` - Remove (prevent deleting active) ✓
  - [x] `updateThemeName(themeId, name)` - Rename theme ✓
  - [x] `updateThemeData(themeId, themeData)` - Manual adjustments ✓
  - [x] `duplicateTheme(themeId, newName)` - Copy theme ✓
  - [x] `getThemeJobStatus(jobId)` - Check job progress and status ✓
  - [x] `getThemeDataById(themeId)` - Get theme data for client components ✓ 2025-12-26
- [x] Create `lib/queries/themes.ts` ✓ 2025-12-26
  - [x] `getThemesBySite(siteId)` - All themes for site ✓
  - [x] `getActiveTheme(siteId)` - Currently active theme ✓
  - [x] `getThemeById(themeId)` - Single theme ✓
  - [x] `getThemeByIdWithAuth(themeId, userId)` - With ownership check ✓
  - [x] `getThemeCount(siteId)` - Theme count for site ✓

### Build Guided Generate Mode (Tasks)

[Goal: Multi-stage theme generation with human checkpoints]

- [ ] Create `trigger/tasks/generate-color-palette.ts`
  - [ ] Stage 1: Generate 5-color palette
  - [ ] Progress: 0% -> 25%
  - [ ] Status: awaiting_color_approval
- [ ] Create `trigger/tasks/generate-typography.ts`
  - [ ] Stage 2: Generate fonts and sizing
  - [ ] Uses approved colors as context
  - [ ] Progress: 25% -> 50%
  - [ ] Status: awaiting_typography_approval
- [ ] Create `trigger/tasks/generate-component-styles.ts`
  - [ ] Stage 3: Generate shadcn/ui component styles
  - [ ] Uses colors + typography as context
  - [ ] Progress: 50% -> 75%
  - [ ] Status: awaiting_styles_approval
- [ ] Create `trigger/tasks/finalize-theme.ts`
  - [ ] Stage 4: Compile all pieces
  - [ ] Generate Tailwind extends + CSS variables
  - [ ] Progress: 75% -> 100%
  - [ ] Status: completed
- [ ] Update `trigger/index.ts` - Export all guided tasks
- [ ] Add to `app/actions/theme.ts`:
  - [ ] `approveStageAndContinue(jobId, stage, adjustments?)` - Approve and trigger next
  - [ ] `regenerateStage(jobId, stage, modifiedRequirements?)` - Re-run current stage

### Build Guided Mode UI Components

[Goal: Stage-based review and approval interface]

- [ ] Create `components/theme/ColorReview.tsx`
  - [ ] Display generated color palette
  - [ ] Color picker for manual adjustments
  - [ ] Approve / Adjust / Regenerate buttons
- [ ] Create `components/theme/TypographyReview.tsx`
  - [ ] Display font families with samples
  - [ ] Font size scale preview
  - [ ] Font family dropdown for manual selection
  - [ ] Approve / Adjust / Regenerate buttons
- [ ] Create `components/theme/ComponentPreview.tsx`
  - [ ] Live preview of styled components
  - [ ] Button variants, cards, inputs
  - [ ] Approve / Adjust / Regenerate buttons

---

## 🔒 Rendering Contract Checkpoint (Before Phase 6) ✅ COMPLETE

**Goal**: Sanity check that rendering architecture is sound before building preview infrastructure

**Half-day checkpoint - do NOT skip:**

- [x] Create one test site with one page ✓ 2025-12-26 (MonkeyNutz site with Home/About pages)
- [x] Add one of each section type (Hero, Text, Features, etc.) ✓ 2025-12-26
- [x] Generate one theme (Quick mode) ✓ 2025-12-26 (2 themes generated, 1 active)
- [x] Verify rendering matches in:
  - [x] Section editor inline preview ✓ 2025-12-26
  - [x] Page preview route ✓ 2025-12-26
- [x] If outputs don't match visually → fix architecture before proceeding ✓ Rendering verified
- [x] Document any rendering quirks discovered ✓ None found - rendering working correctly

**Status:** ✅ Checkpoint passed. Hero, Text, and Features sections rendered correctly with theme applied.

**This is a confidence lock, not a phase. If it works, move on. If not, fix it now.**

---

## Phase 6: Page Preview ✅ COMPLETE

**Goal**: Users can preview pages with themes applied across different device sizes

**Completed:** 2025-12-26 - All sections complete

### Build Preview Page ✅ COMPLETE

[Goal: Create device-responsive preview with publish action]

- [x] Create `app/(protected)/app/sites/[siteId]/pages/[pageId]/preview/page.tsx` ✓ 2025-12-26
  - [x] Server Component fetching page, sections, and active theme ✓
  - [x] Preview header with device toggle and edit button ✓
  - [x] Responsive preview frame ✓
- [x] Create `components/preview/PreviewHeader.tsx` ✓ 2025-12-26
  - [x] Back to editor link ✓
  - [x] Device toggle: Desktop / Tablet / Mobile ✓
  - [x] Edit Page button (links back to editor) ✓
- [x] Create `components/preview/PreviewFrame.tsx` ✓ 2025-12-26
  - [x] Renders page with theme applied ✓
  - [x] Responsive width based on device selection ✓
  - [x] Desktop: 100%, Tablet: 768px, Mobile: 375px ✓
- [x] Create `components/preview/DeviceToggle.tsx` ✓ 2025-12-26
  - [x] Desktop / Tablet / Mobile buttons ✓
  - [x] Active state styling ✓
- [x] Create `loading.tsx` and `error.tsx` for preview route ✓ 2025-12-26

### Build Section Renderers ✅ COMPLETE

[Goal: Render each block type with theme styles applied]

- [x] Create `components/render/` directory for production renderers ✓ 2025-12-26
- [x] Create renderers for each block type ✓ 2025-12-26:
  - [x] `HeroBlock.tsx` - Hero section with theme colors ✓
  - [x] `TextBlock.tsx` - Rich text with theme typography ✓
  - [x] `ImageBlock.tsx` - Image with theme card styles ✓
  - [x] `GalleryBlock.tsx` - Image grid with theme spacing ✓
  - [x] `FeaturesBlock.tsx` - Feature cards with theme styles ✓
  - [x] `CTABlock.tsx` - CTA with theme button styles ✓
  - [x] `TestimonialsBlock.tsx` - Testimonial cards ✓
  - [x] `ContactBlock.tsx` - Contact form with theme inputs ✓
  - [x] `FooterBlock.tsx` - Footer with theme colors ✓
- [x] Create `components/render/PageRenderer.tsx` ✓ 2025-12-26
  - [x] Maps sections to renderers via BlockRenderer ✓
  - [x] Applies theme inline styles (CSS variables deferred to Phase 8) ✓
- [x] Create `components/render/BlockRenderer.tsx` ✓ 2025-12-26
  - [x] Routes section to correct block renderer based on block_type ✓
- [x] Create `components/render/utilities/theme-styles.ts` ✓ 2025-12-26
  - [x] `getButtonStyles(theme)` - Button inline styles ✓
  - [x] `getHeadingStyles(theme, level)` - H1-H4 inline styles ✓
  - [x] `getBodyStyles(theme)` - Body text inline styles ✓
  - [x] `getCardStyles(theme)` - Card container inline styles ✓
  - [x] Plus: `getInputStyles`, `getBadgeStyles`, `getPageStyles`, `getLinkStyles` ✓
- [x] Create `components/render/utilities/icon-resolver.tsx` ✓ 2025-12-26
  - [x] Maps 60+ icon names to Lucide components ✓
  - [x] Fallback to Star icon for unknown names ✓
- [x] Create `components/render/index.ts` barrel export ✓ 2025-12-26

### Files Created (21 total)
```
components/render/
├── BlockRenderer.tsx
├── PageRenderer.tsx
├── index.ts
├── blocks/
│   ├── HeroBlock.tsx
│   ├── TextBlock.tsx
│   ├── ImageBlock.tsx
│   ├── GalleryBlock.tsx
│   ├── FeaturesBlock.tsx
│   ├── CTABlock.tsx
│   ├── TestimonialsBlock.tsx
│   ├── ContactBlock.tsx
│   └── FooterBlock.tsx
└── utilities/
    ├── theme-styles.ts
    └── icon-resolver.tsx

components/preview/
├── DeviceToggle.tsx
├── PreviewFrame.tsx
├── PreviewHeader.tsx
└── index.ts

app/(protected)/app/sites/[siteId]/pages/[pageId]/preview/
├── page.tsx
├── loading.tsx
└── error.tsx
```

---

## Phase 7: AI Layout Suggestions ✅ COMPLETE

**Goal**: AI recommends page section structure based on description

**Completed:** 2025-12-26 - All sections complete

### Database Schema for Layout Suggestions ✅ COMPLETE

[Goal: Track layout suggestion jobs]

- [x] Create `lib/drizzle/schema/layout-suggestion-jobs.ts` ✓ 2025-12-26
  - Status enum: pending, processing, completed, failed
  - LayoutSuggestion interface with blockType, rationale, suggestedContent
  - Indexes on page_id and user_id
- [x] Create down migration ✓ 2025-12-26
  - Created `drizzle/migrations/0007_thankful_pyro/down.sql`
- [x] Run `npm run db:generate` and `npm run db:migrate` ✓ 2025-12-26
  - Generated `drizzle/migrations/0007_thankful_pyro.sql`
- [x] Update `lib/drizzle/schema/index.ts` - Add export ✓ 2025-12-26

### Build Layout Suggestion Task ✅ COMPLETE

[Goal: AI generates section recommendations based on page purpose]

- [x] Create `trigger/tasks/suggest-layout.ts` ✓ 2025-12-26
  - [x] Input: jobId (fetches pageId, description from job record) ✓
  - [x] Call OpenAI gpt-4o with structured output ✓
  - [x] Parse response with Zod validation ✓
  - [x] Output: Array of LayoutSuggestion objects ✓
  - [x] Progress tracking: 0% -> 5% -> 10% -> 80% -> 90% -> 100% ✓
- [x] Create `trigger/utils/layout-prompts.ts` ✓ 2025-12-26
  - [x] `buildLayoutSuggestionPrompt(description)` - System/user prompts ✓
  - [x] Block type examples with purposes ✓
  - [x] Available Lucide icons list ✓
- [x] Update `trigger/index.ts` - Export suggest-layout task ✓ 2025-12-26

### Build Layout Suggestion UI ✅ COMPLETE

[Goal: Modal for requesting and applying layout suggestions]

- [x] Create `components/editor/LayoutSuggestionModal.tsx` ✓ 2025-12-26
  - [x] Three-step flow: input -> generating -> results ✓
  - [x] Textarea with 500 char limit ✓
  - [x] Progress bar with polling ✓
  - [x] Checkbox selection with Select All/Clear ✓
  - [x] "Add X Sections" / "Back" buttons ✓
- [x] Create `components/editor/SuggestionCard.tsx` ✓ 2025-12-26
  - [x] Checkbox for selection ✓
  - [x] Block type icon and label ✓
  - [x] AI rationale text ✓
- [x] Add "Suggest Layout" button to page editor toolbar ✓ 2025-12-26

### Build Layout Suggestion Server Actions ✅ COMPLETE

[Goal: Trigger suggestions and apply selected sections]

- [x] Create `app/actions/layout-suggestions.ts` ✓ 2025-12-26
  - [x] `triggerLayoutSuggestion(pageId, description)` - Create job, trigger task ✓
  - [x] `getLayoutJobStatus(jobId)` - Get job progress and suggestions ✓
  - [x] `applyLayoutSuggestions(pageId, siteId, suggestions)` - Add sections to page ✓
- [x] Create `lib/layout-jobs.ts` ✓ 2025-12-26
  - [x] `createLayoutSuggestionJob(pageId, userId, description)` - Create job ✓
  - [x] `updateLayoutJobProgress(jobId, progress, status?)` - Update progress ✓
  - [x] `markLayoutJobFailed(jobId, errorMessage)` - Mark as failed ✓
  - [x] `setLayoutJobTriggerRunId(jobId, runId)` - Store Trigger.dev run ID ✓
  - [x] `saveLayoutSuggestions(jobId, suggestions)` - Save results ✓
  - [x] `getLayoutJobById(jobId)` - Get job by ID ✓
  - [x] `getLayoutJobByIdWithAuth(jobId, userId)` - Get with ownership check ✓

### Files Created (8 new, 4 modified)
```
lib/drizzle/schema/layout-suggestion-jobs.ts  # Database schema (91 lines)
lib/layout-jobs.ts                            # Job management (161 lines)
trigger/utils/layout-prompts.ts               # AI prompts (173 lines)
trigger/tasks/suggest-layout.ts               # Trigger.dev task (170 lines)
app/actions/layout-suggestions.ts             # Server actions (221 lines)
components/editor/SuggestionCard.tsx          # Suggestion card (49 lines)
components/editor/LayoutSuggestionModal.tsx   # Modal component (286 lines)
drizzle/migrations/0007_thankful_pyro.sql     # Migration
drizzle/migrations/0007_thankful_pyro/down.sql # Down migration
```

---

## Phase 8: Published Sites ✅ COMPLETE

**Goal**: Subdirectory-based routing serves published sites to visitors

**Completed:** 2025-12-26 - All sections complete

### Database Schema Updates ✅ COMPLETE

[Goal: Add fields for site settings and section-level draft control]

- [x] Update `lib/drizzle/schema/sites.ts` ✓ 2025-12-26
  - [x] Add `custom_domain` text field (for future use) ✓
  - [x] Add `meta_title` text field (SEO) ✓
  - [x] Add `meta_description` text field (SEO) ✓
  - [x] Add index on custom_domain ✓
- [x] Update `lib/drizzle/schema/sections.ts` ✓ 2025-12-26
  - [x] Add `status` enum field (draft/published) with default 'published' ✓
  - [x] Add index on status ✓
- [x] Create migration `0008_public_chamber.sql` ✓ 2025-12-26
- [x] Create down migration `0008_public_chamber/down.sql` ✓ 2025-12-26

### Build Query Functions ✅ COMPLETE

[Goal: Add queries for public site access]

- [x] Create `lib/default-theme.ts` ✓ 2025-12-26
  - [x] DEFAULT_THEME constant matching ThemeData interface ✓
  - [x] Fallback theme for sites without active themes ✓
- [x] Update `lib/queries/sites.ts` ✓ 2025-12-26
  - [x] `getPublishedSiteBySlug(slug)` - Fetch published site only ✓
- [x] Update `lib/queries/pages.ts` ✓ 2025-12-26
  - [x] `getPublishedHomePage(siteId)` - Get published homepage ✓
  - [x] `getPublishedPageBySlug(siteId, slug)` - Get published page by slug ✓
- [x] Update `lib/queries/sections.ts` ✓ 2025-12-26
  - [x] `getPublishedSectionsByPage(pageId)` - Filter sections by published status ✓

### Build Published Site Routes ✅ COMPLETE

[Goal: Public routes for rendered published pages]

- [x] Update `lib/supabase/middleware.ts` ✓ 2025-12-26
  - [x] Add `/sites` to publicPatterns (bypass auth for public routes) ✓
- [x] Create `app/(sites)/` route group ✓ 2025-12-26
  - [x] Separate from `(public)` to avoid app navbar/footer ✓
  - [x] Minimal layout wrapper ✓
- [x] Create `app/(sites)/sites/[siteSlug]/layout.tsx` ✓ 2025-12-26
  - [x] Google Fonts preconnect ✓
  - [x] SEO robots meta ✓
- [x] Create `app/(sites)/sites/[siteSlug]/page.tsx` ✓ 2025-12-26
  - [x] Fetch published site by slug ✓
  - [x] Render homepage (is_home page) ✓
  - [x] Apply active theme or DEFAULT_THEME ✓
  - [x] `generateMetadata()` for SEO (title, description, Open Graph) ✓
  - [x] 404 if site not published ✓
- [x] Create `app/(sites)/sites/[siteSlug]/[pageSlug]/page.tsx` ✓ 2025-12-26
  - [x] Fetch published page by slug ✓
  - [x] Render page with sections ✓
  - [x] Apply active theme ✓
  - [x] `generateMetadata()` for SEO ✓
  - [x] 404 if page not published ✓
- [x] Create `app/(sites)/sites/[siteSlug]/not-found.tsx` ✓ 2025-12-26
  - [x] Custom 404 page for published sites ✓

### Build Section Status Toggle ✅ COMPLETE

[Goal: Allow users to control section visibility on published pages]

- [x] Update `app/actions/sections.ts` ✓ 2025-12-26
  - [x] `updateSectionStatus(sectionId, status)` - Toggle draft/published ✓
- [x] Create `components/editor/SectionStatusToggle.tsx` ✓ 2025-12-26
  - [x] Eye icon with Published/Draft badge ✓
  - [x] Click to toggle status ✓
  - [x] Optimistic updates with rollback on error ✓
  - [x] Tooltip explaining action ✓
- [x] Update `components/editor/SectionCard.tsx` ✓ 2025-12-26
  - [x] Add SectionStatusToggle to section header ✓

### Build Settings Tab ✅ COMPLETE

[Goal: Site settings for slug, custom domain, and SEO]

- [x] Update `app/actions/sites.ts` ✓ 2025-12-26
  - [x] `updateSiteSettings(siteId, data)` - Update slug, domain, SEO fields ✓
  - [x] Slug validation (lowercase, numbers, hyphens only) ✓
  - [x] Slug uniqueness check ✓
- [x] Create `components/sites/SettingsTab.tsx` ✓ 2025-12-26
  - [x] Slug editing with real-time validation ✓
  - [x] Custom domain field (disabled - future feature) ✓
  - [x] Meta title with 60 char limit ✓
  - [x] Meta description with 160 char limit ✓
  - [x] Live SEO preview ✓
  - [x] Public URL display when site is published ✓
  - [x] Save button with loading state ✓
- [x] Update `components/sites/SiteTabs.tsx` ✓ 2025-12-26
  - [x] Replace SettingsTabPlaceholder with SettingsTab ✓
- [x] Delete `components/sites/SettingsTabPlaceholder.tsx` ✓ 2025-12-26

### Add Header/Navigation Block Type ✅ COMPLETE

[Goal: Allow users to add site navigation to published pages]

- [x] Update `lib/drizzle/schema/sections.ts` ✓ 2025-12-26
  - [x] Add "header" to BLOCK_TYPES enum ✓
- [x] Update `lib/section-types.ts` ✓ 2025-12-26
  - [x] Add NavLink interface ✓
  - [x] Add HeaderContent interface (siteName, logoUrl, links, ctaText, ctaUrl) ✓
  - [x] Add header to ContentTypeMap ✓
  - [x] Add header to BLOCK_TYPE_INFO ✓
- [x] Update `lib/section-defaults.ts` ✓ 2025-12-26
  - [x] Add default content for header block ✓
- [x] Create `components/render/blocks/HeaderBlock.tsx` ✓ 2025-12-26
  - [x] Sticky header with theme colors ✓
  - [x] Logo/site name on left ✓
  - [x] Navigation links in center (hidden on mobile) ✓
  - [x] CTA button on right ✓
  - [x] Mobile menu button ✓
- [x] Update `components/render/BlockRenderer.tsx` ✓ 2025-12-26
  - [x] Add header case to switch statement ✓
- [x] Create `components/editor/blocks/HeaderEditor.tsx` ✓ 2025-12-26
  - [x] Site name input ✓
  - [x] Logo URL input ✓
  - [x] Navigation links repeater (add/remove) ✓
  - [x] CTA text and URL inputs ✓
- [x] Update `components/editor/SectionEditor.tsx` ✓ 2025-12-26
  - [x] Add header case for HeaderEditor ✓
- [x] Update `components/editor/BlockIcon.tsx` ✓ 2025-12-26
  - [x] Add PanelTop icon for header block ✓

### Testing & Validation ✅ COMPLETE

- [x] Verify published sites render at `/sites/[slug]` ✓ 2025-12-26
- [x] Test draft pages show 404 on public route ✓ 2025-12-26
- [x] Test draft sections hidden from public view ✓ 2025-12-26
- [x] Test SEO metadata appears in page source ✓ 2025-12-26
- [x] Test Settings tab slug editing and validation ✓ 2025-12-26
- [x] Test Header block renders with navigation ✓ 2025-12-26

### Files Created/Modified

```
lib/drizzle/schema/sites.ts         # Added custom_domain, meta_title, meta_description
lib/drizzle/schema/sections.ts      # Added status field and SECTION_STATUSES
lib/default-theme.ts                # NEW - Default fallback theme
lib/queries/sites.ts                # Added getPublishedSiteBySlug
lib/queries/pages.ts                # Added getPublishedHomePage, getPublishedPageBySlug
lib/queries/sections.ts             # Added getPublishedSectionsByPage
lib/section-types.ts                # Added NavLink, HeaderContent interfaces
lib/section-defaults.ts             # Added header default content

app/(sites)/layout.tsx              # NEW - Minimal layout for published sites
app/(sites)/sites/[siteSlug]/layout.tsx       # NEW - Site layout with fonts
app/(sites)/sites/[siteSlug]/page.tsx         # NEW - Homepage route
app/(sites)/sites/[siteSlug]/[pageSlug]/page.tsx  # NEW - Page route
app/(sites)/sites/[siteSlug]/not-found.tsx    # NEW - Custom 404

app/actions/sites.ts                # Added updateSiteSettings
app/actions/sections.ts             # Added updateSectionStatus

components/sites/SettingsTab.tsx    # NEW - Full settings form
components/sites/SiteTabs.tsx       # Updated to use SettingsTab
components/editor/SectionStatusToggle.tsx  # NEW - Draft/published toggle
components/editor/SectionCard.tsx   # Added status toggle
components/editor/blocks/HeaderEditor.tsx  # NEW - Header content editor
components/editor/SectionEditor.tsx # Added header case
components/editor/BlockIcon.tsx     # Added PanelTop for header
components/render/blocks/HeaderBlock.tsx  # NEW - Header renderer
components/render/BlockRenderer.tsx # Added header case

drizzle/migrations/0008_public_chamber.sql       # Migration
drizzle/migrations/0008_public_chamber/down.sql  # Down migration
```

---

## Phase 9: Final Polish & Cleanup ✅ COMPLETE

**Goal**: Ensure all features work together and clean up any remaining template artifacts

**Completed:** 2025-12-27

### Integration Testing ✅ COMPLETE

[Goal: Verify complete user flows work end-to-end]

- [x] Test complete flow: Create site -> Add pages -> Add sections -> Generate theme -> Preview -> Publish ✓
- [x] Test AI theme generation (Quick mode) ✓
- [x] Test AI layout suggestions ✓
- [x] Test auto-save functionality ✓
- [x] Test section drag-and-drop reordering ✓
- [x] Test theme switching ✓
- [x] Test published site rendering ✓

### Remove Remaining Template Artifacts ✅ COMPLETE

[Goal: Clean up any missed transcription-related code]

- [x] Search codebase for "transcript" references ✓ 2025-12-27
- [x] Search codebase for "transcription" references ✓ 2025-12-27
- [x] Remove any remaining unused components ✓ 2025-12-27
  - Deleted `lib/app-utils.ts` (media upload constants)
  - Deleted `scripts/setup-storage.ts` (storage setup script)
  - Removed ffmpeg extension from `trigger.config.ts`
  - Removed fluent-ffmpeg dependencies from `package.json`
- [x] Remove any unused API routes ✓ (none found)
- [x] Update any remaining template-specific comments ✓ 2025-12-27
  - Updated `lib/format-utils-client.ts`
  - Updated `trigger/utils/openai.ts`
  - Updated `scripts/seed.ts`
  - Updated `.env.local.example`
  - Updated `lib/admin.ts` (minutesTranscribed → siteViews)
  - Updated `components/admin/UsageTrendsChart.tsx`

### Documentation ✅ COMPLETE

[Goal: Document the application for future development]

- [x] Update CLAUDE.md with Site Engine-specific instructions ✓ 2025-12-27
- [x] Rewrite README.md for Site Engine ✓ 2025-12-27

---

## Summary

**Total Phases:** 10 (including Phase 0)
**Total Database Tables:** 7 (1 existing + 6 new)
**Total Trigger.dev Tasks:** 6 (5 theme + 1 layout)
**Total Pages:** 6 (1 auth + 4 protected + 1 public structure)

**Build Order Rationale:**
1. Setup -> Landing -> Dashboard builds foundation
2. Site Management -> Page Management -> Sections follows content hierarchy
3. Theme Generation depends on sites existing
4. Preview depends on sections + themes
5. Layout Suggestions depends on section builder
6. Published Sites comes last (needs everything working)

**Key Technical Decisions:**
- Schema replacement in Phase 2 (first feature needing new schema)
- Storage setup in Phase 4 (when sections need images)
- Quick theme mode before Guided (simpler, delivers value faster)
- Layout suggestions last (depends on section builder)
- Published sites deferred to Phase 8 (Phase 2 of MVP)

---

**Last Updated:** 2025-12-27
**Current State:** MVP COMPLETE
**Template:** worker-simple -> Site Engine transformation

**All Phases Completed:**
- ✅ Phase 0: Project Setup
- ✅ Phase 1: Landing Page & Branding
- ✅ Phase 2: Dashboard & Site Management
- ✅ Phase 3: Page Management
- ✅ Phase 4: Section Builder & Content Editing
- ✅ Phase 5: AI Theme Generation (Quick Mode)
- ✅ Phase 6: Page Preview
- ✅ Phase 7: AI Layout Suggestions
- ✅ Phase 8: Published Sites
- ✅ Phase 9: Final Polish & Cleanup

**MVP Status:** Ready for deployment
