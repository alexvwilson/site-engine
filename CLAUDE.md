# CLAUDE.md

## Project Overview

This is a Next.js 15 transcription application that allows users to upload audio/video files and get AI-powered transcriptions using OpenAI's Whisper API.

**Tech Stack:**

- Next.js 15 (App Router) with React 19
- Supabase (Authentication + Storage)
- Drizzle ORM with PostgreSQL
- OpenAI Whisper API (Transcription)
- Trigger.dev (Background Jobs)
- shadcn/ui + Tailwind CSS

## Development Commands

### Local Development

```bash
npm run dev              # Start dev server with Turbopack
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

**🚨 CRITICAL WORKFLOW:** Every migration MUST have a down migration created BEFORE running `db:migrate`. See "Database Migration Workflows" section below for detailed instructions.

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

### Supabase Storage Setup

```bash
npm run storage:setup         # Setup storage buckets (local)
npm run storage:setup:prod    # Setup storage buckets (prod)
```

## Architecture Overview

### Route Structure

- `app/(public)/` - Public pages (landing, terms, privacy)
- `app/(auth)/` - Authentication pages (login, signup, password reset)
- `app/(protected)/` - Protected routes requiring authentication
  - `/transcripts` - Main transcription interface
  - `/profile` - User profile
  - `/admin/` - Admin-only pages (dashboard)
- `app/api/` - API routes
  - `/api/download/[jobId]/[format]` - Transcript download handler

### Database Schema (`lib/drizzle/schema/`)

- **users** - User profiles (synced with Supabase auth), roles (member/admin)
- **transcription_jobs** - Transcription job metadata and status
- **transcripts** - Completed transcripts with multiple formats
- **ai_summaries** - AI-generated summaries for transcripts

### Authentication & Authorization

**Server-side only utilities** (`lib/auth.ts`):

- `getCurrentUserId()` - Get authenticated user ID (most common use case)
- `requireUserId()` - Require authentication, redirects to /auth/login if not authenticated
- `getCurrentUserWithRole()` - Get user with role information
- `requireAdminAccess()` - Enforce admin-only access, redirects to /unauthorized

### Transcription Flow

1. User uploads audio/video file via drag-and-drop
2. File is uploaded to Supabase Storage with signed URL
3. Transcription job is created in database
4. Trigger.dev background task processes the file:
   - Chunks audio if needed
   - Transcribes via OpenAI Whisper API
   - Generates multiple formats (TXT, SRT, VTT, JSON)
5. User can download transcripts in various formats

### File Organization

- `lib/` - Server-side utilities and database logic
  - `*-client.ts` - Client-safe constants and utilities (can be imported by client components)
  - `*.ts` - Server-only functions (uses `next/headers`, Supabase server client, etc.)
- `components/` - React components organized by feature
- `app/actions/` - Next.js Server Actions
- `trigger/` - Trigger.dev background tasks
- `scripts/` - Database migration and setup scripts

## Critical Next.js 15 Requirements

### Async Params and SearchParams

In Next.js 15, both `params` and `searchParams` are Promises that MUST be awaited:

```tsx
// ✅ Correct
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
revalidatePath("/transcripts/[id]", "page");
```

## Database Best Practices

### Use Drizzle Type-Safe Operators

**NEVER** use raw SQL for basic operations. Always use Drizzle operators:

```tsx
// ❌ BAD - SQL injection risk
sql`${column} = ANY(${array})`;

// ✅ GOOD - Type-safe
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
// ❌ BAD - Mixing concerns causes build errors
// lib/storage.ts
import { createClient } from "@/lib/supabase/server"; // Server-only
export const IMAGE_CONSTRAINTS = { MAX_SIZE: 10 * 1024 * 1024 }; // Client-safe

// ✅ GOOD - Separate files
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
// ✅ Good
<div className={cn("text-lg", isActive && "font-bold")} />
```

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
- `OPENAI_API_KEY` - OpenAI API key for Whisper transcription
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

## Testing & Debugging

### TypeScript Errors

Run `npm run type-check` to see all TypeScript errors without building.

### Database Migrations

Check migration status before deploying: `npm run db:status`
