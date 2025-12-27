# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Site Engine is a Next.js 15 AI-powered website builder that allows users to create, customize, and publish websites with AI-generated themes and visual section editing.

**Tech Stack:**

- Next.js 15 (App Router) with React 19
- Supabase (Authentication + Database)
- Drizzle ORM with PostgreSQL
- OpenAI GPT-4o (Theme generation, Layout suggestions)
- Trigger.dev (Background Jobs)
- shadcn/ui + Tailwind CSS

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

- `app/(public)/` - Public pages (landing, terms, privacy)
- `app/(auth)/` - Authentication pages (login, signup, password reset)
- `app/(protected)/` - Protected routes requiring authentication
  - `/app` - Sites dashboard
  - `/app/sites/[siteId]` - Site detail with tabs (Pages, Theme, Settings)
  - `/app/sites/[siteId]/pages/[pageId]` - Page editor
  - `/app/sites/[siteId]/pages/[pageId]/preview` - Page preview
  - `/profile` - User profile
  - `/admin/` - Admin-only pages
- `app/(sites)/` - Published site routes
  - `/sites/[siteSlug]` - Published site homepage
  - `/sites/[siteSlug]/[pageSlug]` - Published site pages

### Database Schema (`lib/drizzle/schema/`)

- **users** - User profiles (synced with Supabase auth), roles (member/admin)
- **sites** - User-created websites with name, slug, status (draft/published)
- **pages** - Pages within sites, with slug, SEO metadata, is_home flag
- **sections** - Content sections on pages with block_type and JSONB content
- **themes** - Saved themes with colors, typography, component styles
- **theme_generation_jobs** - Track AI theme generation progress
- **layout_suggestion_jobs** - Track AI layout suggestion progress

### Block Types (10 total)

1. **header** - Site navigation with logo and links
2. **hero** - Hero section with heading, CTA, background
3. **text** - Rich text content
4. **image** - Single image with caption
5. **gallery** - Image grid
6. **features** - Feature cards with icons
7. **cta** - Call-to-action section
8. **testimonials** - Customer testimonials
9. **contact** - Contact form
10. **footer** - Site footer with links

### Authentication & Authorization

**Server-side only utilities** (`lib/auth.ts`):

- `getCurrentUserId()` - Get authenticated user ID (most common use case)
- `requireUserId()` - Require authentication, redirects to /auth/login if not authenticated
- `getCurrentUserWithRole()` - Get user with role information
- `requireAdminAccess()` - Enforce admin-only access, redirects to /unauthorized

### Site Building Flow

1. User creates a site on the dashboard
2. User adds pages to the site
3. User adds sections to pages using the section builder
4. User generates an AI theme (Quick mode) or uses default
5. User previews pages with device toggle
6. User publishes site - accessible at `/sites/[slug]`

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
- `OPENAI_API_KEY` - OpenAI API key for GPT-4o theme/layout generation
- `TRIGGER_SECRET_KEY` - Trigger.dev secret key

**Client:**

- `NEXT_PUBLIC_APP_URL`

See `.env.local.example` for template.

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

- `generate-theme-quick` - Single-call AI theme generation
- `suggest-layout` - AI-powered layout suggestions for pages

### Triggering Tasks

From backend code (Server Actions, API routes):

```tsx
import { tasks } from "@trigger.dev/sdk";
import type { myTask } from "@/trigger/tasks/my-task";

const handle = await tasks.trigger<typeof myTask>("my-task", { jobId: "123" });
```

## Key Directories

```
components/
  editor/          # Section editors (HeroEditor, TextEditor, etc.)
  render/          # Section renderers (HeroBlock, TextBlock, etc.)
  sites/           # Site management (SiteCard, SiteTabs, SettingsTab)
  pages/           # Page management (PagesList, CreatePageModal)
  theme/           # Theme UI (ThemeTab, ThemePreview, RequirementsForm)
  preview/         # Preview components (DeviceToggle, PreviewFrame)

lib/
  drizzle/schema/  # Database schemas
  queries/         # Database query functions
  section-types.ts # Block type interfaces
  section-defaults.ts # Default content for each block type
  default-theme.ts # Fallback theme when none active

trigger/
  tasks/           # Background task definitions
  utils/           # AI providers, prompts, parsers
```
