# Headstring Web (Site Engine)

A personal AI-powered website builder built with Next.js 15. Create, customize, and publish complete websites with AI-generated themes, visual section editing, and a full-featured blog system - all without writing code.

**Live Demo**: [https://headstringweb.com](https://headstringweb.com)

## What It Does

Headstring Web is a no-code website builder that lets you:

- **Build visually** with 18 drag-and-drop section types, pre-designed templates, and real-time preview
- **Generate AI themes** - describe your brand and get complete color palettes, typography, and component styles
- **Publish blogs** with categories, RSS feeds, scheduling, and SEO optimization
- **Preview responsively** across desktop, tablet, and mobile with light/dark mode testing
- **Go live instantly** at `/sites/[your-slug]` or connect your own custom domain with automatic SSL

## Features at a Glance

| Category | Highlights |
|----------|------------|
| **Building** | 18 block types, 60+ templates, drag-and-drop, undo/redo, auto-save |
| **AI** | Theme generation, layout suggestions, logo prompts, SEO analysis, legal pages |
| **Blog** | Categories, RSS, scheduling, page assignments, 4 display layouts |
| **Publishing** | Custom domains, sitemap/robots.txt, SEO meta, under construction mode |
| **Media** | Image upload, albums, PDF documents, inline article images |

---

## Block Types (18)

### Hero Section
The hero block is packed with features for creating impactful landing sections:
- **Rotating text animation** with clip (width reveal) or typing (typewriter) effects
- **Multiple CTA buttons** (up to 4) with primary/secondary variants
- **Profile/feature image** with position control (left, right, top, bottom, after-title)
- **Image styling**: size slider (80-400px), rounding options (none to full circle), border width/color, drop shadow
- **Mobile responsive** stacking options for horizontal layouts
- **Background images** with color overlays

### Header & Footer
- **Header layouts**: Left-aligned, right-aligned, or centered (logo with nav below)
- **Footer layouts**: Simple, columns, or minimal variants
- **Sticky header** toggle
- **Social icons** with 16 platform options and brand colors
- **Logo sizing** (24-80px) with dynamic header height
- **Background styling**: colors, images, overlays
- **Border controls**: bottom/top borders with width, color, and radius options
- **Per-page overrides**: customize header/footer on specific pages while inheriting site defaults

### Content Blocks

| Block | Key Features |
|-------|--------------|
| **Text** | Rich text (Tiptap), borders, backgrounds, overlays, content width control |
| **Image** | 5 layouts (image only, left/right with text, top/bottom), percentage widths |
| **Markdown** | Full GitHub-flavored markdown with live preview toggle |
| **Heading** | SEO-friendly H1/H2/H3 with subtitle and alignment options |
| **Article** | Rich text with inline floating images (left/right/center/full-width) |

### Gallery
- **3 layout modes**: Grid, Masonry (Pinterest-style), Carousel (with arrows/dots)
- **Aspect ratios**: Square, 16:9, 4:3, 3:4, or original
- **Lightbox**: Click to view fullscreen with keyboard/swipe navigation
- **Columns**: 2, 3, 4, or auto-fit responsive
- **Styling**: border width/radius, gap control (none to large)

### Features Block
- **Section header**: optional title and subtitle above feature cards
- **Icon picker**: 65+ Lucide icons in 10 categories (Business, Tech, Contact, etc.)
- **Per-feature subtitles**: short tagline between title and description
- **Optional buttons**: add CTA buttons to individual features
- **Styling**: card backgrounds, borders, typography scaling

### CTA & Testimonials
- **CTA**: Heading, description, buttons with border/background/overlay styling
- **Testimonials**: Customer quotes with avatars, styled cards

### Contact Form
- **Two variants**: Simple (name, email, message) or Detailed (adds company, phone)
- **Spam protection**: Honeypot fields + rate limiting
- **Email notifications**: via Resend with reply-to headers
- **Database storage**: Submissions tracked per-site
- **Styling**: form card backgrounds, borders

**Requirements for email notifications:**
1. `RESEND_API_KEY` must be set in Vercel environment variables
2. Set notification email per-site in **Settings → Contact Form Notifications**
3. **Must test from custom domain** (e.g., `alexvwilson.com`), NOT the internal `/sites/[slug]` route

### Blog Blocks
- **Blog Featured**: Display a single post with 4 layouts (split, stacked, hero, minimal)
- **Blog Grid**: Filterable post grid with page assignment support
- **Per-block controls**: show/hide author, image fit (cover/contain/fill)

### Embed Block
Securely embed third-party content:
- YouTube, Vimeo (video)
- Google Maps (location)
- Spotify, SoundCloud (audio)
- Aspect ratio options (16:9, 4:3, 1:1, custom height)

### Product Grid
Display products, albums, or portfolio items:
- **Image with title/description**
- **Action links** with platform icons (Amazon, Spotify, iTunes, YouTube, Bandcamp, etc.)
- **Icon styles**: Brand colors, monochrome, or theme primary
- **Featured link**: Make image clickable to primary destination

### Social Links Block
- **16 platforms**: Facebook, Instagram, X/Twitter, LinkedIn, YouTube, TikTok, Threads, Pinterest, GitHub, Discord, Snapchat, WhatsApp, Telegram, Twitch, Website, Email
- **Icon styles**: Brand colors, monochrome, or theme-matched
- **Section title/subtitle** support
- **Standalone block** or integrated in header/footer

---

## AI-Powered Features

### Theme Generation
Describe your brand personality and requirements - the AI generates:
- Complete color palette (8 colors) for light and dark modes
- Typography selection from curated Google Fonts
- Border radius and component styling
- Automatic dark mode palette generation

### Layout Suggestions
Describe your page's purpose and get AI-recommended section structures with content suggestions.

### Logo Prompt Generator
Multi-step wizard that generates ChatGPT-ready prompts for logo creation:
- Analyzes your site name and primary color
- Generates 10 concepts across 3 categories (decomposed, monogram, pattern)
- Expert recommendations highlighted (top, alternative, safe picks)
- Copy-ready prompts for external AI image generators

### SEO Analysis
AI-powered site audit with:
- Overall score (0-100) with color coding
- Categorized recommendations (content, technical, keywords, meta)
- Priority ranking (high/medium/low)
- Current state vs. suggested fix for each issue

### Legal Page Generator
AI-generated legal documents:
- Privacy Policy, Terms of Service, Cookie Policy
- Business type selection for industry-specific content
- Data collection practices configuration
- Jurisdiction-aware (GDPR, CCPA references)

---

## Theme System

- **AI Generation**: Describe requirements → get complete theme
- **Manual Editing**: Color pickers, font dropdowns, radius sliders
- **Light/Dark Mode**: Four options (always light, always dark, system default, user choice)
- **Live Preview**: See changes in real-time before saving
- **Multiple Themes**: Save variations and switch between them
- **Preview Toggle**: Test both light and dark modes in the editor

---

## Blog System

- **Post Management**: Create, edit, schedule, and publish
- **Rich Editor**: Tiptap with markdown auto-detection and conversion
- **Categories**: Site-level categories with dedicated listing pages
- **Page Assignment**: Filter blog grids by page for topic-specific feeds
- **RSS Feed**: Auto-generated at `/sites/[slug]/blog/rss.xml`
- **Image Fit**: Site-level setting (cover/contain/fill) to prevent cropping
- **Reading Time**: Automatic estimation
- **Social Sharing**: Twitter, Facebook, LinkedIn share buttons
- **Navigation**: Previous/next post links
- **Sorting**: By date, update time, alphabetical, or status

---

## Publishing & SEO

- **Visibility Control**: Draft/published states at site, page, and section levels
- **Under Construction**: Customizable coming soon page while building
- **Custom Domains**: Connect via Vercel with automatic SSL provisioning
- **SEO Meta**: Per-page titles, descriptions, Open Graph, Twitter cards
- **SEO Health Check**: Automated checklist with progress scoring
- **Dynamic Sitemap**: `/sites/[slug]/sitemap.xml` with all pages, posts, categories
- **Robots.txt**: `/sites/[slug]/robots.txt` auto-generated

---

## Content Management

### Media
- **Image Upload**: Drag-and-drop with progress indicators
- **Image Library**: Browse and reuse uploaded images
- **Albums**: Organize images into folders with filtering
- **PDF Documents**: Upload and get shareable URLs (10MB max)

### Editing
- **Rich Text**: Bold, italic, headings (H2/H3), lists, links, blockquotes
- **Markdown Detection**: Auto-converts pasted markdown to formatted text
- **Article Images**: Insert and position images inline with text (float left/right/center/full)
- **Undo/Redo**: 50-step history with Cmd/Ctrl+Z shortcuts
- **Auto-Save**: Debounced saving on all changes

### Organization
- **Drag-and-Drop**: Reorder sections and pages visually
- **Section Templates**: 2-6 pre-designed templates per block type
- **Anchor Links**: Same-page navigation with smooth scrolling
- **Global Header/Footer**: Site-wide with per-page overrides

---

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

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (Supabase recommended)
- OpenAI API key
- Trigger.dev account

### Quick Start

```bash
git clone [repository]
cp .env.local.example .env.local  # Fill in credentials
npm install
npm run db:migrate
npm run dev
```

For detailed setup, see [SETUP.md](SETUP.md).

---

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

---

## Custom Domain Setup

1. **Configure Vercel API**: Add `VERCEL_API_TOKEN`, `VERCEL_PROJECT_ID` to environment
2. **Add Domain**: Enter domain in site Settings → Connect Domain
3. **Configure DNS**:
   - Apex domain: `A` record → `76.76.21.21`
   - Subdomain: `CNAME` record → `cname.vercel-dns.com`
4. **Wait for Verification**: SSL automatically provisioned

See full instructions in [Custom Domain Setup](#custom-domain-setup-1) below.

---

## Project Structure

```
app/
├── (auth)/              # Login, signup, password reset
├── (protected)/         # Dashboard, site editor, page editor
│   └── app/sites/[siteId]/
│       ├── blog/        # Blog post editor
│       └── pages/       # Page editor and preview
├── (public)/            # Landing page, terms, privacy
├── (sites)/             # Published site routes
│   └── sites/[siteSlug]/
│       ├── blog/        # Blog listing and posts
│       └── [pageSlug]/  # Published pages
└── api/                 # API routes

components/
├── editor/              # 18 block editors
├── render/              # 18 block renderers
├── blog/                # Blog management
├── sites/               # Site management
├── pages/               # Page management
├── theme/               # Theme generation and editing
└── preview/             # Device preview

lib/
├── drizzle/schema/      # 15+ database tables
├── queries/             # Query functions
├── section-types.ts     # Block type interfaces
├── section-defaults.ts  # Default block content
└── section-templates.ts # 60+ block templates

trigger/
├── tasks/               # 5 background jobs
└── utils/               # AI prompts and parsers
```

---

## Architecture Highlights

**Content Hierarchy**: Sites → Pages → Sections → Blocks

**Theme System**: CSS variables enable runtime switching without rebuilds. Themes include light and dark palettes with automatic dark mode generation when not provided.

**Blog Integration**: Blog posts are separate entities from pages. Dedicated blocks (Blog Featured, Blog Grid) embed posts anywhere. Page assignments enable filtered displays.

**Background Jobs**: All AI operations run as Trigger.dev tasks with real-time progress tracking:
- Theme generation
- Layout suggestions
- Logo prompt generation
- SEO analysis
- Legal page generation
- Domain verification polling

**SEO**: Auto-generated sitemap.xml and robots.txt per site. AI-powered analysis with actionable recommendations. Per-page and per-block meta controls.

---

## Custom Domain Setup (Detailed)

### 1. Configure Vercel API Access

```bash
VERCEL_API_TOKEN=your_token_here      # Vercel Dashboard → Settings → Tokens
VERCEL_PROJECT_ID=prj_xxxxxxxxxxxxx   # Project Settings → General
VERCEL_TEAM_ID=team_xxxxxxxxxxxxx     # Team Settings (if using team)
```

### 2. Add Domain in Settings

1. Go to site **Settings** tab
2. Enter domain (e.g., `example.com`)
3. Click **Connect Domain**
4. Note DNS records shown

### 3. Configure DNS

| Type | Host | Value |
|------|------|-------|
| A | `@` | `76.76.21.21` |
| CNAME | `www` | `cname.vercel-dns.com` |
| TXT | `_vercel` | (if verification required) |

### 4. Verification

- DNS propagation: 5-30 minutes (up to 48 hours)
- Check at [dnschecker.org](https://dnschecker.org)
- SSL auto-provisioned on verification

---

## Documentation

- [SETUP.md](SETUP.md) - Complete setup guide
- [DEPLOY.md](DEPLOY.md) - Deployment instructions
- [CLAUDE.md](CLAUDE.md) - AI assistant context

---

Built for personal use. Not accepting external contributions.
