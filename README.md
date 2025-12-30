# Site Engine

A personal AI-powered website builder built with Next.js 15. Create, customize, and publish websites with AI-generated themes, visual section editing, and a full-featured blog system.

## What It Does

Site Engine lets you build complete websites without writing code:

- **Create sites** with a visual page builder using 12 different section types
- **Generate themes** using AI that understands your brand requirements
- **Write content** with a rich text editor and drag-and-drop section management
- **Publish blogs** with categories, RSS feeds, and SEO optimization
- **Preview changes** across desktop, tablet, and mobile before publishing
- **Publish instantly** to `/sites/[your-slug]` with one click

## Features

### Site Building

- **12 Block Types**: Hero, Header, Footer, Text, Image, Gallery, Features, CTA, Testimonials, Contact, Blog Featured, Blog Grid
- **Drag-and-Drop**: Reorder sections visually with automatic saving
- **Section Templates**: Pre-designed starting points for each block type
- **Undo/Redo**: 50-step history with keyboard shortcuts (Cmd/Ctrl+Z)
- **Auto-Save**: Changes save automatically with debouncing
- **Global Header/Footer**: Configure once, apply to all pages

### AI Features

- **Theme Generation**: Describe your brand and get a complete color palette, typography, and component styles
- **Layout Suggestions**: Describe your page purpose and get AI-recommended section structures
- **Logo Prompt Generator**: Get ChatGPT-ready prompts for logo creation based on your brand

### Theme System

- **Manual Editing**: Fine-tune colors, fonts, and border radius after generation
- **Light/Dark Mode**: Site-level control with system preference support
- **Live Preview**: See theme changes in real-time before saving
- **Multiple Themes**: Save and switch between different theme variations

### Blog System

- **Full Blog**: Create, edit, schedule, and publish posts
- **Categories**: Organize posts with site-level categories
- **RSS Feed**: Auto-generated at `/sites/[slug]/blog/rss.xml`
- **SEO**: Custom meta tags, JSON-LD structured data, auto-generated sitemaps
- **Blog Blocks**: Embed featured posts or post grids on any page
- **Reading Time**: Automatic estimation displayed on posts
- **Social Sharing**: Built-in share buttons for Twitter, Facebook, LinkedIn

### Publishing

- **Draft/Published States**: Control visibility at site, page, and section levels
- **Under Construction Mode**: Show a coming soon page while you build
- **Custom Domains**: Connect your own domain via Vercel
- **SEO Settings**: Meta titles, descriptions, and Open Graph support
- **Contact Forms**: Functional forms with spam protection and email notifications

### Content Management

- **Image Upload**: Drag-and-drop with Supabase Storage
- **Image Library**: Browse and reuse previously uploaded images
- **Rich Text Editor**: Bold, italic, headings, lists, links, blockquotes
- **Device Preview**: Test layouts on desktop, tablet, and mobile

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router), React 19 |
| Database | PostgreSQL with Drizzle ORM |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| Background Jobs | Trigger.dev |
| AI | OpenAI GPT-4o |
| Styling | Tailwind CSS, shadcn/ui |
| Rich Text | Tiptap |

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (Supabase recommended)
- OpenAI API key
- Trigger.dev account

### Setup

1. Clone the repository
2. Copy `.env.local.example` to `.env.local` and fill in your credentials
3. Install dependencies: `npm install`
4. Run migrations: `npm run db:migrate`
5. Start development: `npm run dev`

For detailed setup instructions, see [SETUP.md](SETUP.md).

## Development Commands

```bash
# Development
npm run dev              # Start Next.js dev server
npm run dev:full         # Start dev server + Trigger.dev

# Building
npm run build            # Production build
npm run type-check       # TypeScript checking
npm run lint             # ESLint
npm run format           # Prettier formatting

# Database
npm run db:generate      # Generate migrations from schema
npm run db:migrate       # Run pending migrations
npm run db:rollback      # Rollback last migration
npm run db:status        # Check migration status

# Trigger.dev
npm run trigger:deploy:prod   # Deploy background tasks
```

## Project Structure

```
app/
├── (auth)/              # Login, signup, password reset
├── (protected)/         # Dashboard, site editor, page editor
│   └── app/
│       ├── sites/[siteId]/
│       │   ├── blog/    # Blog post editor
│       │   └── pages/   # Page editor and preview
│       └── profile/     # User profile
├── (public)/            # Landing page, terms, privacy
├── (sites)/             # Published site routes
│   └── sites/[siteSlug]/
│       ├── blog/        # Blog listing and posts
│       └── [pageSlug]/  # Published pages
└── api/                 # API routes

components/
├── editor/              # Section editors for each block type
├── render/              # Section renderers for published sites
├── blog/                # Blog management UI
├── sites/               # Site management (cards, tabs, settings)
├── pages/               # Page management
├── theme/               # Theme generation and editing
└── preview/             # Preview frame and device toggle

lib/
├── drizzle/schema/      # Database schemas
├── queries/             # Database query functions
└── ...                  # Utilities, types, defaults

trigger/
├── tasks/               # Background job definitions
└── utils/               # AI prompts and parsers
```

## Documentation

- [SETUP.md](SETUP.md) - Complete setup guide
- [DEPLOY.md](DEPLOY.md) - Deployment instructions
- [CLAUDE.md](CLAUDE.md) - AI assistant context

## Architecture Highlights

**Content Hierarchy**: Sites → Pages → Sections → Blocks

**Theme System**: CSS variables enable runtime theme switching without rebuilds. Themes include light and dark color palettes with automatic dark mode generation.

**Blog Integration**: Blog posts exist as a separate entity from pages, with dedicated section blocks for embedding posts anywhere in your site.

**Background Jobs**: AI operations (theme generation, layout suggestions, logo prompts) run as Trigger.dev tasks with real-time progress tracking.

---

Built for personal use. Not accepting external contributions.
