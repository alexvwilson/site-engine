# App Pages & Functionality Blueprint

### App Summary

**End Goal:** Full control over site's look, feel, and content with fast, easy updates using AI-powered theme generation and design assistance
**Core Value Proposition:** Content managers can create and manage professional websites without coding knowledge, using AI to generate themes and suggest layouts
**Target Users:** Content managers, website administrators (MVP: sole developer/user)
**Template Type:** Content-management-first with AI enhancements (adapted from worker-simple)

---

## Content & Workflow Overview

### Content Structure

**Hierarchy:** Sites → Pages → Sections → Blocks

- **Sites**: Top-level container with name, description, theme, custom domain
- **Pages**: Individual pages within a site with title, slug, sections
- **Sections**: Content containers on a page (ordered, draggable)
- **Blocks**: Content types that define section behavior (Hero, Text, Image, etc.)

### AI Enhancement Flows

**Theme Generation** (Background Job)
- **Trigger**: User clicks "Generate New Theme" in site theme settings
- **Input**: Text description of desired look/feel
- **Processing**: OpenAI generates Tailwind CSS config + shadcn/ui compatible styles
- **Output**: Theme configuration (colors, typography, component styles)
- **Duration**: Medium (30s-2min) - uses real-time progress tracking

**Layout Suggestions** (Background Job)
- **Trigger**: User clicks "Suggest Layout" in page editor
- **Input**: Description of page purpose/content
- **Processing**: OpenAI recommends page structure with sections
- **Output**: List of suggested sections user can accept/modify/reject
- **Duration**: Quick (10-30s) - simple loading state

### Real-Time Requirements

**Theme Generation** - Trigger.dev Real-Time Streaming
- Progress stages:
  1. Analyzing description (0-15%)
  2. Generating color palette (15-40%)
  3. Creating typography settings (40-60%)
  4. Building component styles (60-85%)
  5. Finalizing theme files (85-100%)
- Uses `useRealtimeRun()` hook + `metadata.set()` in task
- Modal shows progress bar and current step text

**Layout Suggestions** - Simple Loading State
- Button shows loading spinner
- Brief "Generating layout suggestions..." message
- Results displayed immediately for user to accept/dismiss

---

## Authentication

### Login Page - `/auth/login`

- Email/password login (Frontend + Server Action)
- OAuth options: Google, GitHub (Frontend + Supabase Auth)
- Redirect to Dashboard on success
- No sign-up page (single user, account created via seed script or Supabase dashboard)

---

## Core Application Pages

### Dashboard - `/app`

**Sites Grid/List** (Frontend)
- Fetch all sites on page load (Server Component query)
- Display per site card:
  - Site name
  - Status badge (Draft / Published)
  - Page count
  - Last updated timestamp
- Sort by: Last updated (default)

**Site Card Actions** (Frontend + Server Actions)
- Click card → Navigate to site detail
- Publish/Unpublish toggle (Server Action)
- Delete button with confirmation modal (Server Action)

**Create Site** (Frontend + Server Action)
- "New Site" button opens modal
- Form fields:
  - Site name (required)
  - Description (optional)
- Submit creates site and navigates to site detail (Server Action)

**Empty State** (Frontend)
- "Create your first site" with prominent CTA
- Brief explanation of what you can do

---

### Site Detail - `/app/sites/[siteId]`

**Site Header** (Frontend + Server Actions)
- Site name (editable inline, Server Action to save)
- Status badge: Draft / Published
- Publish/Unpublish toggle (Server Action)
- Delete site button with confirmation (Server Action, redirects to Dashboard)

**Tab Navigation**
- Pages (default)
- Theme
- Settings

#### Pages Tab

**Pages List** (Frontend)
- Fetch pages for this site (Server Component query)
- Display per page row:
  - Page title
  - Status badge (Draft / Published)
  - Last updated timestamp
- Click row → Navigate to page editor

**Page Actions** (Frontend + Server Actions)
- Publish/Unpublish toggle (Server Action)
- Duplicate page (Server Action)
- Delete with confirmation (Server Action)

**Create Page** (Frontend + Server Action)
- "Add Page" button opens modal
- Form fields:
  - Page title (required)
  - Slug (auto-generated from title, editable)
- Submit creates page and navigates to editor (Server Action)

**Empty State** (Frontend)
- "Add your first page" CTA

#### Theme Tab

**Current Theme Preview** (Frontend)
- Color palette swatches (primary, secondary, accent, background, text)
- Typography samples (headings, body text)
- Component preview (buttons, cards)

**AI Theme Generation** (Frontend + Background Job)
- "Generate New Theme" button opens modal
- Form: Text description of desired look/feel (textarea)
- Submit triggers Trigger.dev task (Server Action)
- Modal shows real-time progress:
  - Progress bar (0-100%)
  - Current step text
  - Uses `useRealtimeRun()` hook
- On complete:
  - Preview generated theme
  - "Apply Theme" button saves to site (Server Action)
  - "Try Again" button resets modal
- On error:
  - Friendly error message
  - "Retry" button

**Manual Theme Adjustments** (Frontend + Server Action)
- Color pickers for: primary, secondary, accent, background, text
- Font family dropdowns (system fonts or Google Fonts)
- Save changes button (Server Action)

#### Settings Tab

**Site Information** (Frontend + Server Action)
- Site name (text input)
- Description (textarea)
- Slug/subdomain (text input, validated)
- Custom domain (text input, for Vercel configuration)
- Save changes button (Server Action)

**Danger Zone** (Frontend + Server Action)
- Delete site button with confirmation modal
- Warning: Deletes all pages and content
- Server Action performs cascading delete

---

### Page Editor - `/app/sites/[siteId]/pages/[pageId]`

**Editor Header** (Frontend + Server Actions)
- Page title (editable inline, auto-saves)
- Status: Draft / Published
- Auto-save indicator: "Saved" / "Saving..." / "Unsaved changes"
- Actions:
  - Preview button → Opens preview page
  - Publish/Unpublish toggle (Server Action)
  - Back to site link

**AI Layout Assistant** (Frontend + Background Job)
- "Suggest Layout" button in toolbar
- Opens modal:
  - Form: Describe what this page is for (textarea)
  - Submit triggers layout suggestion job (Server Action)
  - Loading spinner while processing
- On complete:
  - Display suggested sections list
  - Each suggestion shows: Section type icon, brief description
  - "Add All" button inserts all sections
  - Individual "Add" buttons per section
  - "Dismiss" closes modal

**Section Builder** (Frontend + Server Actions)

**Sections List** (Frontend)
- Visual list of sections on the page
- Drag handles for reordering
- Each section shows:
  - Block type icon
  - Preview/summary of content
- Reorder saves via Server Action on drop

**Section Actions** (Frontend + Server Actions)
- Click section → Expand inline editor
- Delete button with confirmation (Server Action)
- Duplicate section (Server Action)

**Add Section** (Frontend)
- "Add Section" button opens block picker
- Block picker shows available block types in grid
- Click block type → Inserts new section with defaults (Server Action)

**Block Picker** (Frontend)
Available block types:
- **Hero**: Heading, subheading, CTA button, background image
- **Text**: Rich text content
- **Image**: Single image with optional caption
- **Gallery**: Multiple images in grid layout
- **Features**: Icon + title + description (multiple items)
- **CTA**: Heading, description, button
- **Testimonials**: Quote, author (multiple items)
- **Contact**: Form fields configuration
- **Footer**: Links, copyright text

**Inline Section Editor** (Frontend + Server Actions)
- Expands in place when section clicked
- Fields vary by block type:
  - Text inputs, textareas
  - Image uploaders (Supabase Storage)
  - Rich text editor for content blocks
  - Repeater fields for multi-item blocks (features, testimonials)
- Auto-save on field change:
  - Debounced (500ms delay)
  - "Saving..." indicator during save
  - Optimistic UI update
- Collapse when clicking outside or pressing Escape

---

### Page Preview - `/app/sites/[siteId]/pages/[pageId]/preview`

**Preview Header** (Frontend)
- Device toggle: Desktop / Tablet / Mobile (changes viewport width)
- "Back to Editor" button
- "Publish" button (Server Action)

**Preview Frame** (Frontend)
- Rendered page with current theme applied
- Shows current draft state (not published version)
- Read-only, no editing capability
- Responsive based on device toggle

---

## Published Sites

### Domain-Based Routing

**Architecture**
- Main app domain → Site Engine admin routes
- Custom domains → Published site content

**Middleware Logic** (`middleware.ts`)
1. Check incoming request hostname
2. If hostname matches main app domain → Continue to admin routes
3. If hostname matches a site's custom domain:
   - Look up site by domain
   - Rewrite to published site routes
4. If no match → 404

**Published Site Routes** (Phase 2)
- `/sites/[siteSlug]` → Published site homepage
- `/sites/[siteSlug]/[pageSlug]` → Published page

**Vercel Domain Setup** (Manual for MVP)
- Add custom domain in Vercel dashboard per site
- Point DNS to Vercel
- SSL handled automatically by Vercel

---

## Navigation Structure

### Adaptive Sidebar

**When on Dashboard** (`/app`)
- Logo / App name
- Dashboard (active)

**When inside a Site** (`/app/sites/[siteId]/*`)
- Logo / App name
- Dashboard (link back)
- [Site Name] section:
  - Pages
  - Theme
  - Settings

**When editing a Page** (`/app/sites/[siteId]/pages/[pageId]`)
- Sidebar collapses or hides
- Top bar navigation:
  - Back to [Site Name] link
  - Page title (editable)
  - Preview | Publish buttons

### Breadcrumb Navigation

Always visible in header:
- Dashboard → [Site Name] → [Page Name]
- Each segment is clickable

### Header Bar

- Left: Logo / App name
- Center: Breadcrumbs
- Right: User avatar with dropdown (Logout)

### Mobile Navigation

- Hamburger menu for sidebar
- Bottom action bar in page editor (Save, Preview, Publish)
- Touch-optimized section reordering

---

## Next.js App Router Structure

### Layout Groups

```
app/
├── (auth)/                     # Authentication flow
│   └── auth/
│       └── login/
│           └── page.tsx
├── (protected)/                # Authenticated app (auth check in layout)
│   ├── layout.tsx
│   └── app/
│       ├── page.tsx            # Dashboard
│       └── sites/
│           └── [siteId]/
│               ├── page.tsx    # Site detail (tabbed)
│               └── pages/
│                   └── [pageId]/
│                       ├── page.tsx      # Page editor
│                       └── preview/
│                           └── page.tsx  # Page preview
└── (public)/                   # Published sites (Phase 2)
    └── sites/
        └── [siteSlug]/
            ├── page.tsx
            └── [pageSlug]/
                └── page.tsx
```

### Complete Route Mapping

**Auth Routes**
- `/auth/login` → Login page

**Protected Routes (Auth Required)**
- `/app` → Dashboard (sites list)
- `/app/sites/[siteId]` → Site detail (pages, theme, settings tabs)
- `/app/sites/[siteId]/pages/[pageId]` → Page editor
- `/app/sites/[siteId]/pages/[pageId]/preview` → Page preview

**Public Routes (Phase 2)**
- `/sites/[siteSlug]` → Published site homepage
- `/sites/[siteSlug]/[pageSlug]` → Published page

---

## Backend Architecture

### Server Actions (`app/actions/`)

**sites.ts**
- `createSite(data)` → Create new site, return siteId
- `updateSite(siteId, data)` → Update site name/description/slug/domain
- `deleteSite(siteId)` → Delete site and all pages (cascading)
- `publishSite(siteId)` → Set site as published
- `unpublishSite(siteId)` → Set site as draft

**pages.ts**
- `createPage(siteId, data)` → Create new page, return pageId
- `updatePage(pageId, data)` → Update page title/slug
- `deletePage(pageId)` → Delete page and sections
- `publishPage(pageId)` → Set page as published
- `unpublishPage(pageId)` → Set page as draft
- `duplicatePage(pageId)` → Copy page with new slug

**sections.ts**
- `addSection(pageId, blockType, position)` → Add new section with defaults
- `updateSection(sectionId, content)` → Update section content (auto-save target)
- `deleteSection(sectionId)` → Remove section
- `reorderSections(pageId, sectionIds)` → Update section order
- `duplicateSection(sectionId)` → Copy section

**theme.ts**
- `triggerThemeGeneration(siteId, description)` → Start AI theme job, return runId
- `applyGeneratedTheme(siteId, themeData)` → Save generated theme to site
- `updateThemeManually(siteId, themeData)` → Save manual theme changes

**ai.ts**
- `triggerLayoutSuggestion(pageId, description)` → Start layout suggestion job
- `applyLayoutSuggestions(pageId, sections)` → Add suggested sections to page

### Lib Queries (`lib/queries/`)

**sites.ts**
- `getSites()` → All sites for dashboard
- `getSiteById(siteId)` → Single site with metadata
- `getSiteByDomain(domain)` → For published site routing

**pages.ts**
- `getPagesBySite(siteId)` → All pages for a site
- `getPageById(pageId)` → Single page with sections
- `getPageBySlug(siteId, slug)` → For published page routing

**sections.ts**
- `getSectionsByPage(pageId)` → All sections for a page (ordered)
- `getSectionById(sectionId)` → Single section with content

**themes.ts**
- `getThemeBySite(siteId)` → Current theme configuration

### Trigger.dev Tasks (`trigger/tasks/`)

**generate-theme.ts**
- Input: `{ siteId, description }`
- Processing:
  1. Call OpenAI with theme generation prompt
  2. Parse response into Tailwind config structure
  3. Generate shadcn/ui compatible component styles
- Output: Theme configuration object
- Progress: Uses `metadata.set()` for real-time updates
  - `metadata.set("progress", percentage)`
  - `metadata.set("currentStep", stepName)`

**suggest-layout.ts**
- Input: `{ pageId, description }`
- Processing:
  1. Call OpenAI with layout suggestion prompt
  2. Parse response into section recommendations
- Output: Array of suggested sections with types and default content

### Architecture Flow

- **CRUD operations**: Frontend → Server Action → Lib Query → Database
- **AI jobs**: Frontend → Server Action → Trigger.dev Task → (OpenAI) → Database
- **Real-time updates**: Frontend uses `useRealtimeRun()` for theme generation progress
- **Auto-save**: Frontend (debounced) → Server Action → Database

---

## Storage

### Supabase Storage Buckets

- `site-assets` → Images uploaded for site content (section images, gallery photos)
- `theme-assets` → Generated theme files if needed (optional)

### No Limits for MVP

- No file size restrictions
- No storage quotas
- No upload limits

---

## MVP Functionality Summary

This blueprint delivers: **A personal Site Engine for creating and managing multiple websites with AI-assisted design**

**Phase 1 (Launch Ready):**

- Authentication (login only, single user)
- Dashboard with sites overview
- Site management (create, edit, publish, delete)
- Page management within sites
- Section-based page builder with 9 block types
- Inline section editing with auto-save
- AI theme generation with real-time progress
- AI layout suggestions
- Page preview with device toggle
- Domain-based routing for published sites
- Supabase Storage for images

**Phase 2 (Growth Features):**

- Automated Vercel domain setup via API
- Version history for content rollback
- Content templates (save/reuse page structures)
- Component library browser
- Export/backup sites
- Multi-user support with billing (if opened to others)

**Technology Stack:**

- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS, shadcn/ui
- **Backend**: Next.js Server Actions
- **Database**: Drizzle ORM with PostgreSQL (Supabase)
- **Auth**: Supabase Auth (email/password + OAuth)
- **Storage**: Supabase Storage
- **Background Jobs**: Trigger.dev (theme generation, layout suggestions)
- **AI**: OpenAI API (GPT-4 for theme/layout generation)

**Key Design Decisions:**

- Content-management-first approach (not pure worker-simple)
- Sites → Pages → Sections → Blocks hierarchy
- AI as enhancement, not core workflow
- Inline section editing (expand in place)
- Real-time progress for theme generation only
- Simple loading state for layout suggestions
- Adaptive sidebar navigation based on context
- No billing/subscription for personal-use MVP
- No admin dashboard (single user)
- Domain-based routing via middleware for published sites
- Auto-save with debouncing for content changes

> **Next Step:** Database Schema Design - Define tables for sites, pages, sections, themes

---

**Total Pages: 6 pages**

- Auth: 1 page (login)
- Protected: 4 pages (dashboard, site detail, page editor, page preview)
- Public: 1 page structure for published sites (Phase 2)
