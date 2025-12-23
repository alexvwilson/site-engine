# Worker Simple - AI Transcription Template

A production-ready Next.js 15 application template for AI-powered audio and video transcription using Trigger.dev and OpenAI's Whisper API.

## Features

- **AI Transcription** - Accurate speech-to-text powered by OpenAI Whisper API
- **Multiple Export Formats** - Download transcripts in TXT, SRT, VTT, and JSON
- **AI Summaries** - Automatic summary generation for transcribed content
- **Transcript Q&A** - Ask questions about your transcripts with AI
- **Background Processing** - Reliable job execution with Trigger.dev
- **Secure Storage** - Enterprise-grade file storage with Supabase
- **Modern Stack** - Next.js 15, React 19, TypeScript, Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Background Jobs**: Trigger.dev
- **AI**: OpenAI Whisper API
- **Styling**: Tailwind CSS, shadcn/ui

## Getting Started

### Prerequisites

- Node.js 18+
- FFmpeg (for audio processing)
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
  (protected)/     # Protected routes (transcripts, profile, admin)
  (public)/        # Public pages (landing, terms, privacy)
  api/             # API routes
components/        # React components
lib/               # Utilities and configurations
  drizzle/         # Database schema and migrations
trigger/           # Trigger.dev background tasks
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
npm run storage:setup         # Setup storage buckets
npm run trigger:deploy:prod   # Deploy Trigger.dev tasks
```

## Documentation

- **SETUP.md** - Complete setup guide for local development
- **DEPLOY.md** - Deployment guide for production
- **CLAUDE.md** - AI assistant instructions
