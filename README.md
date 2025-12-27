# Site Engine - AI-Powered Website Builder

A production-ready Next.js 15 application for building and publishing websites with AI-powered theme generation and visual content editing.

## Features

- **AI Theme Generation** - Generate complete CSS themes using GPT-4o based on brand requirements
- **Visual Section Builder** - 10 block types: Hero, Header, Text, Image, Gallery, Features, CTA, Testimonials, Contact, Footer
- **AI Layout Suggestions** - Get intelligent section recommendations based on page purpose
- **Drag & Drop Editing** - Reorder sections with intuitive drag-and-drop
- **Live Preview** - Preview pages with responsive device toggle (Desktop/Tablet/Mobile)
- **One-Click Publishing** - Publish sites to `/sites/[slug]` subdirectory routing
- **Modern Stack** - Next.js 15, React 19, TypeScript, Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Supabase Auth
- **Background Jobs**: Trigger.dev
- **AI**: OpenAI GPT-4o for theme and layout generation
- **Styling**: Tailwind CSS, shadcn/ui

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account
- OpenAI API key
- Trigger.dev account

### Setup

1. Clone the repository
2. Follow the setup guide: Run `SETUP.md` with your AI assistant

## Project Structure

```
app/
  (auth)/          # Authentication pages
  (protected)/     # Protected routes (dashboard, site editor)
  (public)/        # Public pages (landing, terms, privacy)
  (sites)/         # Published site routes
  api/             # API routes
components/        # React components
  editor/          # Section editor components
  render/          # Section renderer components
  sites/           # Site management components
  theme/           # Theme generation components
lib/               # Utilities and configurations
  drizzle/         # Database schema and migrations
trigger/           # Trigger.dev background tasks
  tasks/           # Theme generation, layout suggestions
```

## Commands

```bash
npm run dev                   # Start development server
npm run dev:full              # Start development + Trigger.dev servers
npm run build                 # Production build
npm run type-check            # TypeScript checking
npm run lint                  # ESLint
npm run db:migrate            # Run database migrations
npm run db:generate           # Generate migrations
npm run trigger:deploy:prod   # Deploy Trigger.dev tasks
```

## Documentation

- **SETUP.md** - Complete setup guide for local development
- **DEPLOY.md** - Deployment guide for production
- **CLAUDE.md** - AI assistant instructions
