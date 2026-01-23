# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Site Engine is a Next.js 15 AI-powered website builder that allows users to create, customize, and publish websites with AI-generated themes, visual section editing, blog management, and custom domain support.

**Tech Stack:**

- Next.js 15 (App Router) with React 19
- Supabase (Authentication + Database + Storage)
- Drizzle ORM with PostgreSQL
- OpenAI GPT-4o (Theme generation, Layout suggestions, SEO analysis, Legal docs)
- Trigger.dev v4 (Background Jobs)
- TipTap 3 (Rich text editing)
- shadcn/ui + Tailwind CSS 4
- Resend (Email notifications)
- Vercel (Hosting + Custom domains API)

## Development Commands

### Local Development

```bash
npm run dev              # Start dev server with Turbopack
npm run dev:full         # Start dev server + Trigger.dev dev server (for background jobs)
```

### Building and Type Checking

```bash
npm run build            # Production build
npm run type-check       # TypeScript type checking (tsc --noEmit)
npm run lint             # ESLint
npm run format           # Prettier formatting
```

### Database Operations (Drizzle ORM)

**IMPORTANT:** Always use these npm scripts, never run `npx drizzle-kit` directly. The scripts properly load environment variables via `dotenv-cli`.

**CRITICAL WORKFLOW:** Every migration MUST have a down migration created BEFORE running `db:migrate`. See "Database Migration Workflows" section below for detailed instructions.

```bash
# Development (uses .env.local)
npm run db:generate        # Generate migrations from schema changes
npm run db:generate:custom # Generate custom SQL migrations (RLS, functions, triggers)
npm run db:migrate         # Run pending migrations (ONLY after creating down migration!)
npm run db:rollback        # Rollback last migration (requires down.sql)
npm run db:status          # Check migration status

# Production (uses .env.prod)
npm run db:generate:prod
npm run db:generate:custom:prod
npm run db:migrate:prod
npm run db:rollback:prod
npm run db:status:prod
```

### Trigger.dev Deployment

```bash
npm run trigger:deploy:prod   # Deploy Trigger.dev tasks to production
```

## Architecture Overview

### Route Structure

- `app/(public)/` - Public pages (landing, terms, privacy, cookies, contact)
- `app/(auth)/` - Authentication pages
  - `/auth/login` - Login
  - `/auth/sign-up` - Registration
  - `/auth/sign-up-success` - Signup confirmation
  - `/auth/forgot-password` - Password reset request
  - `/auth/update-password` - Set new password
  - `/auth/error` - Auth error page
  - `/auth/confirm` - Email confirmation (route handler)
- `app/(protected)/` - Protected routes requiring authentication
  - `/app` - Sites dashboard
  - `/app/sites/[siteId]` - Site detail with tabs (Pages, Blog, Theme, Settings)
  - `/app/sites/[siteId]/pages/[pageId]` - Page editor
  - `/app/sites/[siteId]/pages/[pageId]/preview` - Page preview
  - `/app/sites/[siteId]/blog/[postId]` - Blog post editor
  - `/profile` - User profile
  - `/admin/dashboard` - Admin dashboard (metrics, user management)
  - `/unauthorized` - Unauthorized access page
- `app/(sites)/` - Published site routes
  - `/sites/[siteSlug]` - Published site homepage
  - `/sites/[siteSlug]/[pageSlug]` - Published site pages
  - `/sites/[siteSlug]/blog` - Blog listing page
  - `/sites/[siteSlug]/blog/[postSlug]` - Published blog posts
  - `/sites/[siteSlug]/blog/category/[categorySlug]` - Blog category pages
  - `/sites/[siteSlug]/blog/rss.xml` - RSS feed (route handler)
  - `/sites/[siteSlug]/docs/[documentSlug]` - Document download (route handler)
  - `/sites/[siteSlug]/robots.txt` - Robots.txt generation (route handler)
  - `/sites/[siteSlug]/sitemap.xml` - Sitemap generation (route handler)

### Database Schema (`lib/drizzle/schema/`)

**Core Tables:**

- **users** - User profiles (synced with Supabase auth), roles (member/admin)
- **sites** - User-created websites with name, slug, status (draft/published), custom domain settings
- **pages** - Pages within sites, with slug, SEO metadata, is_home flag
- **sections** - Content sections on pages with block_type and JSONB content

**Blog System:**

- **blog_posts** - Blog entries with title, content, excerpt, featured image, publish date
- **blog_categories** - Categories for organizing blog posts (many-to-one with sites)

**Media & Documents:**

- **images** - Tracks uploaded images (syncs with Supabase Storage)
- **image_albums** - Folders for organizing images per-site
- **documents** - Tracks uploaded documents like PDFs (syncs with Supabase Storage)

**Theme System:**

- **themes** - Saved themes with colors, typography, component styles
- **theme_generation_jobs** - Track AI theme generation progress

**AI Job Tracking:**

- **layout_suggestion_jobs** - Track AI layout suggestion progress
- **logo_generation_jobs** - Track AI logo prompt generation
- **legal_generation_jobs** - Track AI legal page generation (Privacy/Terms/Cookie)
- **seo_analysis_jobs** - Track AI-powered SEO analysis requests
- **domain_verification_jobs** - Track custom domain verification polling

**Contact & Leads:**

- **contact_submissions** - Form submissions from published sites
- **landing_contacts** - Interest submissions from landing page (lead generation)

### Block Types (Unified Primitives System)

The editor uses a **unified primitives** approach where flexible blocks replace multiple specialized ones.

**Layout Blocks:**

- **header** - Site navigation with logo and links
- **hero_primitive** - Unified hero with 4 layouts (full, compact, cta, title-only)
- **footer** - Site footer with links

**Content Blocks:**

- **heading** - Simple heading with level selection (H1/H2/H3)
- **richtext** - Unified rich text with 3 modes (visual/markdown/article)

**Media Blocks:**

- **media** - Unified primitive (single image, gallery grid/masonry/carousel, embed)

**Cards Blocks:**

- **cards** - Unified primitive (features, testimonials, products)

**Blog Blocks:**

- **blog** - Unified blog with 2 modes (featured/grid)

**Utility Blocks:**

- **contact** - Contact form (simple/detailed variants)
- **social_links** - Social media links with icons

**Legacy Blocks (hidden from Add Section panel):**

- hero, text, markdown, image, gallery, features, cta, testimonials, blog_featured, blog_grid, embed, article, product_grid

**Block Categories for UI:**

- layout (header, hero_primitive, footer)
- content (richtext)
- media (media)
- cards (cards)
- blog (blog)
- utility (contact, social_links)

### Authentication & Authorization

**Server-side only utilities** (`lib/auth.ts`):

- `getCurrentUserId()` - Get authenticated user ID (most common use case)
- `requireUserId()` - Require authentication, redirects to /auth/login if not authenticated
- `getCurrentUserWithRole()` - Get user with role information
- `requireAdminAccess()` - Enforce admin-only access, redirects to /unauthorized

### Custom Domain Routing

Custom domains are handled via middleware (`middleware.ts`):

- Domain-to-slug caching with 60-second TTL for performance
- Rewrites custom domains to internal `/sites/[slug]` paths
- Vercel preview URL detection
- Supabase auth session updates

### Site Building Flow

1. User creates a site on the dashboard
2. User adds pages to the site
3. User adds sections to pages using the section builder
4. User generates an AI theme (Quick mode) or uses default
5. User previews pages with device toggle
6. User optionally adds blog posts and categories
7. User optionally configures custom domain
8. User publishes site - accessible at `/sites/[slug]` or custom domain

### Theme System

- **Theme data** stored as JSONB with colors, typography, component styles
- **CSS variables** generated from theme for runtime switching
- **Inline styles** applied in renderers (CSS variable approach deferred)
- **Default theme** used when no active theme exists

## Critical Next.js 15 Requirements

### Async Params and SearchParams

In Next.js 15, both `params` and `searchParams` are Promises that MUST be awaited:

```tsx
// Correct
interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ query: string }>;
}

export default async function Page({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { query } = await searchParams;
}

// For client components, use React's use() hook
("use client");
import { use } from "react";
export default function ClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
}
```

### revalidatePath with Dynamic Routes

Always include the `type` parameter:

```tsx
revalidatePath("/app/sites/[siteId]", "page");
```

## Database Best Practices

### Use Drizzle Type-Safe Operators

**NEVER** use raw SQL for basic operations. Always use Drizzle operators:

```tsx
// BAD - SQL injection risk
sql`${column} = ANY(${array})`;

// GOOD - Type-safe
import { inArray } from "drizzle-orm";
inArray(column, array);
```

Common operators: `eq`, `ne`, `gt`, `gte`, `lt`, `lte`, `inArray`, `notInArray`, `and`, `or`, `isNull`, `like`, `between`

### Schema Definition

Use `pgTable` syntax from `drizzle-orm/pg-core`. See `lib/drizzle/schema/*` for examples.

## Server/Client Separation

### CRITICAL: Separate Server and Client Utilities

**NEVER** mix server-side imports with client-safe utilities in the same file.

```tsx
// BAD - Mixing concerns causes build errors
// lib/storage.ts
import { createClient } from "@/lib/supabase/server"; // Server-only
export const IMAGE_CONSTRAINTS = { MAX_SIZE: 10 * 1024 * 1024 }; // Client-safe

// GOOD - Separate files
// lib/storage-client.ts (client-safe)
export const IMAGE_CONSTRAINTS = { MAX_SIZE: 10 * 1024 * 1024 };

// lib/storage.ts (server-only)
import { createClient } from "@/lib/supabase/server";
export { IMAGE_CONSTRAINTS } from "./storage-client"; // Re-export for convenience
```

**File naming conventions:**

- `*-client.ts` - Client-safe constants, types, pure functions
- `*.ts` - Server-side functions (may re-export from client files)

**Server-only imports to watch for:**

- `next/headers` (cookies, headers)
- `@/lib/supabase/server`
- `@/lib/auth`
- Node.js APIs

## Code Quality Standards

### No Client Components as Async

Client components cannot be async. Use Server Components for async operations or load data via Server Actions.

### No Inline Styles

Use `cn()` utility with Tailwind classes instead of inline styles:

```tsx
// Good
<div className={cn("text-lg", isActive && "font-bold")} />
```

Exception: Theme-based styles in render components use inline styles for dynamic theming.

### Prefer shadcn/ui Components

Use shadcn/ui components from `components/ui/` for consistency. Install new components via:

```bash
npx shadcn@latest add [component-name]
```

### TypeScript Strict Mode

- Explicit return types required for functions
- No `any` types
- No `@ts-expect-error` or `eslint-disable` comments
- Use `RefObject` not `MutableRefObject` for refs

### Next.js Best Practices

- Use `next/image` for images
- No toast notifications in Server Actions (only in client components)
- Redirect calls must be outside try-catch blocks
- `useSearchParams()` requires `<Suspense>` boundary

## Environment Variables

Validated via `@t3-oss/env-nextjs` in `lib/env.ts`:

**Server-only:**

- `DATABASE_URL` - PostgreSQL connection string
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY` - OpenAI API key for GPT-4o AI features
- `TRIGGER_SECRET_KEY` - Trigger.dev secret key
- `RESEND_API_KEY` - Resend API key for email notifications (optional)
- `VERCEL_TEAM_ID`, `VERCEL_PROJECT_ID`, `VERCEL_AUTH_TOKEN` - Custom domain verification (optional)

**Client:**

- `NEXT_PUBLIC_APP_URL`

See `.env.local.example` for template.

## Server Actions

Located in `app/actions/`:

| Action File | Purpose |
|-------------|---------|
| `admin.ts` | Admin operations (user management, metrics) |
| `albums.ts` | Image album CRUD |
| `auth.ts` | Authentication (login, signup, logout) |
| `blog.ts` | Blog post and category CRUD |
| `contact.ts` | Contact form submissions |
| `domains.ts` | Custom domain management and verification |
| `landing-contact.ts` | Landing page contact submissions |
| `layout-suggestions.ts` | AI layout suggestion requests |
| `legal-pages.ts` | AI legal page generation |
| `logo-generation.ts` | AI logo prompt generation |
| `pages.ts` | Page CRUD operations |
| `profile.ts` | User profile updates |
| `sections.ts` | Section CRUD and editing |
| `seo.ts` | AI SEO analysis requests |
| `sites.ts` | Site CRUD operations |
| `storage.ts` | File uploads (images, documents) |
| `theme.ts` | Theme management operations |

## Contact Form Email Notifications

Contact forms on published sites can send email notifications via Resend.

### Requirements for Email Notifications to Work

1. **RESEND_API_KEY** must be set in environment variables (Vercel)
2. **Notification Email** must be configured per-site in Settings → Contact Form Notifications
3. **Custom Domain Required** - Contact form submissions only send emails when accessed via the site's custom domain (e.g., `alexvwilson.com`), NOT via the internal `/sites/[slug]` route

### How It Works

- Form submissions are always saved to the `contact_submissions` table
- Email notifications only sent if:
  - `RESEND_API_KEY` is configured
  - Site has `contact_notification_email` set
  - Form is submitted from the custom domain
- Message content is included in the email but NOT stored in the database
- Spam protection via honeypot field and rate limiting (5 submissions per IP per 15 minutes)

### Troubleshooting

- **Submissions saving but no emails**: Check `RESEND_API_KEY` in Vercel env vars, may need redeploy
- **Check Resend dashboard**: [resend.com/emails](https://resend.com/emails) to see sent/failed emails
- **Testing "under construction" sites**: Must test from the actual custom domain, not `/sites/[slug]`

## Common Patterns

### Server Actions

Located in `app/actions/`. Always validate authentication and return result objects:

```tsx
"use server";
export async function myAction(): Promise<{
  success: boolean;
  error?: string;
}> {
  const userId = await requireUserId(); // Redirects if not authenticated
  // ... logic
  return { success: true };
}
```

### Protected Pages

```tsx
export default async function ProtectedPage() {
  const userId = await requireUserId(); // Auto-redirects if not authenticated
  // ... render page
}
```

### Admin Pages

```tsx
export default async function AdminPage() {
  await requireAdminAccess(); // Auto-redirects if not admin
  // ... render admin content
}
```

## Trigger.dev Tasks

### Task Structure

Tasks use `@trigger.dev/sdk` v4 with the `task()` function. Use `schemaTask()` for payload validation with Zod.

```tsx
import { task, logger, metadata } from "@trigger.dev/sdk";

export const myTask = task({
  id: "my-task",
  run: async (payload: { jobId: string }) => {
    metadata.set("progress", 50);
    logger.info("Processing", { jobId: payload.jobId });
    return { success: true };
  },
});
```

### Existing Tasks

| Task ID | File | Purpose |
|---------|------|---------|
| `generate-theme-quick` | `generate-theme-quick.ts` | Single-call AI theme generation |
| `suggest-layout` | `suggest-layout.ts` | AI-powered layout suggestions for pages |
| `verify-domain` | `verify-domain.ts` | Custom domain verification polling with Vercel API |
| `analyze-seo` | `analyze-seo.ts` | AI-powered SEO analysis and recommendations |
| `generate-legal-pages` | `generate-legal-pages.ts` | AI legal document generation (Privacy/Terms/Cookie) |
| `generate-logo-prompts` | `generate-logo-prompts.ts` | ChatGPT-ready logo concept prompts |

### Trigger Utilities (`trigger/utils/`)

- `ai-providers.ts` - OpenAI client configuration
- `openai.ts` - OpenAI helper functions
- `theme-prompts.ts` - Theme generation prompts
- `theme-parser.ts` - Parse AI theme responses
- `layout-prompts.ts` - Layout suggestion prompts
- `seo-prompts.ts` - SEO analysis prompts
- `legal-prompts.ts` - Legal document prompts
- `logo-prompts.ts` - Logo concept prompts
- `font-list.ts` - Available fonts for themes
- `tailwind-generator.ts` - Generate Tailwind classes from theme

### Triggering Tasks

From backend code (Server Actions, API routes):

```tsx
import { tasks } from "@trigger.dev/sdk";
import type { myTask } from "@/trigger/tasks/my-task";

const handle = await tasks.trigger<typeof myTask>("my-task", { jobId: "123" });
```

## Context Providers

Located in `contexts/`:

- **UserContext.tsx** - User authentication and profile state
- **EditorSelectionContext.tsx** - Editor selection state with scroll synchronization between preview and editor

## Query Functions

Located in `lib/queries/`:

| File | Purpose |
|------|---------|
| `blog.ts` | Blog post and category queries |
| `documents.ts` | Document queries |
| `pages.ts` | Page queries |
| `sections.ts` | Section queries |
| `seo.ts` | SEO job queries |
| `showcase.ts` | Showcase/example site queries |
| `sitemap.ts` | Sitemap generation queries |
| `sites.ts` | Site queries |
| `themes.ts` | Theme queries |

## Key Directories

```
app/
  (auth)/            # Authentication pages
  (protected)/       # Authenticated routes
  (public)/          # Public pages
  (sites)/           # Published site routes
  actions/           # Server Actions (17 files)
  api/               # API routes

components/
  admin/             # Admin dashboard components
  auth/              # Authentication forms
  blog/              # Blog management components
  editor/            # Page editor components
    blocks/          # Block-specific editors (Cards, Blog, Hero, Media, RichText)
    inspector/       # Property inspector panels
  landing/           # Landing page components
  layout/            # App layout (sidebar, header)
  legal/             # Legal page components
  navigation/        # Navigation components
  pages/             # Page management (PagesList, CreatePageModal)
  preview/           # Preview components (DeviceToggle, PreviewFrame)
  profile/           # User profile components
  render/            # Published site block renderers
    gallery/         # Gallery sub-components (carousel, grid, masonry, lightbox)
  sites/             # Site management (SiteCard, SiteTabs, SettingsTab)
  theme/             # Theme UI (ThemeTab, ThemePreview, RequirementsForm)
  ui/                # shadcn/ui components

contexts/            # React context providers

lib/
  drizzle/
    schema/          # Database schemas (19 tables)
    migrations/      # SQL migrations
  queries/           # Database query functions
  supabase/          # Supabase client helpers
  section-types.ts   # Block type interfaces (900+ lines)
  section-defaults.ts # Default content for each block type
  section-templates.ts # Section templates
  default-theme.ts   # Fallback theme when none active
  block-migration.ts # Convert legacy blocks to primitives
  primitive-utils.ts # Primitive block utilities
  auth.ts            # Authentication utilities (server-only)
  email.ts           # Email sending via Resend
  rate-limit.ts      # Rate limiting utilities
  vercel.ts          # Vercel API integration (custom domains)
  env.ts             # Environment variable validation

scripts/
  migrate.ts         # Database migration runner
  migration-status.ts # Check migration status
  rollback.ts        # Rollback migrations
  seed.ts            # Database seeding
  setup-storage.ts   # Storage initialization

trigger/
  tasks/             # Background task definitions (6 tasks)
  utils/             # AI providers, prompts, parsers

ai_docs/             # AI documentation and references
  refs/              # Reference documents
  skills/            # AI skill templates
  tasks/             # Task templates
```
