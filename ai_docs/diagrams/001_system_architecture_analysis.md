# Headstring Web System Architecture - Flow Analysis

## Flow Summary

Headstring Web follows a modern Next.js 15 App Router architecture with clear separation between:

1. **User-facing routes** - Organized into route groups by access level
2. **Server Actions** - Centralized mutation layer with auth validation
3. **React Components** - Split between editing (dashboard) and rendering (published sites)
4. **Database** - PostgreSQL with Drizzle ORM for type-safe queries
5. **Background Jobs** - Trigger.dev for async AI operations
6. **External Services** - Supabase (auth/storage), OpenAI, Vercel, Resend

## Step-by-Step Walkthrough

### 1. User Authentication Flow

```
User → (auth) routes → Supabase Auth → middleware.ts → Protected routes
```

- Users authenticate via Supabase Auth (email/password)
- `middleware.ts` validates sessions and routes users appropriately
- Protected routes require active session, redirecting to login if missing
- Custom domain routing also handled in middleware

### 2. Site Building Flow

```
Dashboard → Site Actions → Database (sites table)
         → Page Actions → Database (pages table)
         → Section Actions → Database (sections table)
         → Theme Actions → Trigger.dev → OpenAI → Database (themes table)
```

- Site owner creates sites from dashboard
- Pages are added to sites with SEO metadata
- Sections (blocks) are added to pages with drag-and-drop
- Themes can be AI-generated or manually edited

### 3. Content Editing Flow

```
Page Editor → Block Editors (18 types) → Section Actions → Database
           → TiptapEditor (rich text)
           → ImageUpload → Storage Actions → Supabase Storage
```

- Each block type has a dedicated editor component
- Rich text editing via Tiptap with markdown detection
- Images uploaded to Supabase Storage with album organization

### 4. Published Site Rendering Flow

```
Visitor → (sites) routes → middleware.ts (domain check)
       → Page data query → BlockRenderer → ThemeStyles → HTML output
```

- Middleware checks for custom domain mapping
- Page data fetched from database including all sections
- BlockRenderer routes to appropriate block component
- ThemeStyles injects CSS variables for theming

### 5. AI Operations Flow

```
User triggers AI feature → Server Action → Trigger.dev task
                        → Job tracking table (status: pending)
                        → OpenAI API call
                        → Job tracking table (status: completed)
                        → UI polls for result
```

All AI operations follow this async pattern with job tracking for progress display.

## Decision Logic

### Middleware Routing Decisions

| Condition | Action |
|-----------|--------|
| Custom domain match | Route to child site |
| Auth required route + no session | Redirect to login |
| Admin route + non-admin user | Redirect to unauthorized |
| Public route | Allow access |

### Block Type Routing

The `BlockRenderer` component uses a switch statement to route each `block_type` to its corresponding render component. This pattern enables:
- Type-safe content handling via `ContentTypeMap`
- Easy addition of new block types
- Consistent styling via theme CSS variables

### Theme Application

1. Check if site has active theme
2. If yes, generate CSS variables from theme data
3. If no, use default theme from `lib/default-theme.ts`
4. Apply via `ThemeStyles` component in layout

## Error Handling

### Server Actions
- All actions return `{ success: boolean, error?: string }` pattern
- Auth validation at start of each action
- Database errors caught and logged
- User-friendly error messages returned

### Background Jobs
- Job status tracked in dedicated tables
- Failed jobs marked with error message
- UI displays failure state with retry option
- Automatic cleanup of old failed jobs

### Published Sites
- 404 handling for missing sites/pages
- Error boundaries in route segments
- Graceful fallbacks for missing theme/content

## Database Schema Organization

### Core Tables
- `users` - Synced with Supabase Auth
- `sites` - User's websites with settings
- `pages` - Pages within sites
- `sections` - Content blocks on pages
- `themes` - Saved theme configurations

### Blog System
- `blog_posts` - Posts with rich content
- `blog_categories` - Post categorization

### Media Management
- `images` - Tracked uploaded images
- `image_albums` - Album organization
- `documents` - PDF uploads

### Job Tracking (6 tables)
Each AI feature has a dedicated job tracking table for:
- Progress monitoring
- Result storage
- Error handling
- History retention

## Recommendations & Ideas

### Current Strengths

1. **Clean Architecture**: Clear separation of concerns with route groups, server actions, and components
2. **Type Safety**: Full TypeScript with Drizzle ORM providing end-to-end type safety
3. **Async AI**: Background jobs prevent UI blocking during AI operations
4. **Modular Blocks**: 18 block types with consistent editor/renderer pattern

### Potential Improvements

1. **Caching Layer**: Consider adding Redis for frequently accessed site data
2. **CDN Integration**: Implement image optimization and CDN for media assets
3. **Real-time Updates**: WebSocket support for collaborative editing
4. **API Layer**: REST/GraphQL API for potential mobile app or integrations
5. **Analytics Pipeline**: Dedicated analytics service for site traffic metrics
6. **Template Marketplace**: User-shareable site templates

### Performance Considerations

1. **Database Queries**: Most queries are already optimized with proper indexes
2. **Image Loading**: Consider next/image with placeholder blur
3. **Bundle Size**: Code splitting by route group is effective
4. **Background Jobs**: Current Trigger.dev setup handles load well

### Security Checklist

- [x] Auth validation in all server actions
- [x] Middleware protection for routes
- [x] Input validation with Zod schemas
- [x] SQL injection prevention via Drizzle ORM
- [x] XSS prevention in rich text rendering
- [x] Rate limiting on contact forms
- [x] Honeypot spam protection

## Data Flow Summary

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Browser   │────▶│  Next.js    │────▶│  Database   │
│  (React)    │◀────│  Actions    │◀────│  (Postgres) │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │ Trigger.dev │
                    │   (Async)   │
                    └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │   OpenAI    │
                    │   GPT-4o    │
                    └─────────────┘
```

This architecture enables:
- Fast UI responses (async AI operations)
- Consistent data handling (server actions)
- Type-safe database access (Drizzle ORM)
- Scalable background processing (Trigger.dev)
