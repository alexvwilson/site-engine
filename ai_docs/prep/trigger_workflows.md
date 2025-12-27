# Trigger.dev Workflows Index

> **Purpose**: Directory of all Trigger.dev background job workflows in the Site Engine application. Each workflow is a "digital twin" quick reference to understand the system without re-reading all code files.

---

## 📋 Available Workflows

### 🎨 AI Theme Generation Workflow
**File**: `trigger_workflow_theme_generation.md`
**Purpose**: Generate Tailwind CSS themes with shadcn/ui compatible styles using AI
**Trigger**: User clicks "Generate New Theme" in site Theme tab
**Duration**: 30s-2min (Quick mode), 2-5min with human review (Guided mode)

**Two Generation Modes**:
- **Quick Generate** ("Feeling Lucky"): Single AI call generates complete theme
- **Guided Generate**: Multi-stage with human checkpoints (colors → typography → components)

**Key Tasks**:
- `generate-theme-quick` - Single call complete theme generation
- `generate-color-palette` - Guided Stage 1: AI color palette
- `generate-typography` - Guided Stage 2: Font families and sizing
- `generate-component-styles` - Guided Stage 3: Button, card, input styles
- `finalize-theme` - Guided Stage 4: Compile to Tailwind/CSS

**Key Decision Points**:
- Generation mode selection (Quick vs Guided)
- Human approval checkpoints in Guided mode
- Regenerate vs manual adjustment at each stage

**Special Features**:
- Multi-vendor AI support (OpenAI, Claude, Gemini)
- Theme versioning (save multiple, switch, delete)
- Real-time progress tracking (Quick mode)
- Stage-based status updates (Guided mode)

---

### 📄 AI Layout Suggestion Workflow
**File**: `trigger_workflow_layout_suggestion.md` _(pending creation)_
**Purpose**: AI recommends page section structure based on description
**Trigger**: User clicks "Suggest Layout" in page editor
**Duration**: 10-30s (quick loading state)

**Key Tasks**:
- `suggest-layout` - Single task generating section recommendations

**Key Decision Points**:
- AI classification of page type (landing, about, contact, etc.)
- Section recommendations based on page purpose

**Status**: Design pending

---

## 🔧 Common Patterns Across All Workflows

All workflows in this application follow these architectural principles:

### 1. Database as Source of Truth
- All state stored in PostgreSQL via Drizzle ORM
- Never rely on task memory or session state
- Always query DB for latest job state

### 2. Payload-Based Task Chaining
- Tasks pass data via typed TypeScript interfaces
- Each task is stateless and independently retryable
- No shared memory between tasks

### 3. Progress Tracking
- **Database**: Update job status/progress in job tracking table
- **Metadata**: Use `metadata.set()` for real-time UI updates
- **Frontend**: Uses `useRealtimeRun()` for real-time or polling for stage-based

### 4. Human-in-the-Loop (Theme Generation)
- Guided mode pauses for user approval at each stage
- User can approve, adjust manually, or regenerate
- Stage data persisted to database for resume capability

### 5. AI Provider Abstraction
- Unified interface for OpenAI, Anthropic (Claude), Google (Gemini)
- Configurable model selection
- Structured JSON output for type safety

### 6. Error Isolation
- Each task handles its own errors
- User-friendly error messages stored in database
- Retry logic with exponential backoff

### 7. Theme Versioning
- Multiple themes can be saved per site
- One active theme at a time
- Switch between or delete saved themes

---

## 🌊 Progress Patterns

### Real-Time Progress (Theme Quick Mode)
- Uses `metadata.set()` for continuous 0-100% progress
- Frontend uses `useRealtimeRun()` hook
- Smooth progress bar with current step text

### Stage-Based Status (Theme Guided Mode)
- Job status indicates current stage
- Frontend polls or listens for status changes
- UI shows stage completion checkmarks

### Simple Loading State (Layout Suggestion)
- Quick operation (10-30s)
- Button shows loading spinner
- Results appear immediately when complete

---

## 🔀 Architecture Decision: Task vs Server Action

Before creating a new workflow, decide if it should be a **Trigger.dev task** or **Server Action**:

### Use Trigger.dev Task:
- Operation takes >10 seconds
- Need automatic retry logic with exponential backoff
- Should continue if user closes browser
- Need progress tracking across multiple steps
- Want job history and monitoring
- Need real-time streaming to frontend

**Examples**: Theme generation, layout suggestions, batch operations

### Use Server Action:
- Synchronous operation (<10 seconds)
- Simple database query or CRUD operation
- User expects immediate response
- No retry logic needed

**Examples**: Save section content, update site settings, publish/unpublish

---

## 📁 Workflow File Structure Template

Each workflow file follows this structure for consistency:

1. **Workflow Overview** - What it does, core flow, key decisions
2. **Task Chain Diagram** - ASCII visual of the flow
3. **Critical Decision Points** - Branching logic with code snippets
4. **Core Data Flow** - Payload interfaces and database tables
5. **File Locations** - Where to find task code, utilities, schemas
6. **Key Utility Functions** - Function names and purposes (no implementation)
7. **Progress Tracking Pattern** - How progress is reported
8. **Common Failure Points** - What typically goes wrong
9. **Key Architecture Principles** - Workflow-specific patterns
10. **Quick Implementation Checklist** - Steps for modifications

---

## 🆕 When to Create a New Workflow File

Create a new workflow file in `ai_docs/prep/` when:

- New background process has **2+ Trigger.dev tasks**
- Different **trigger mechanism** (button click, scheduled, webhook)
- Different **data model** (new job tracking table)
- Workflow takes **>30 seconds** (too slow for Server Action)
- Complex **multi-step processing** with conditional branching

Don't create a workflow file for:

- Single-task operations (document in code comments)
- Synchronous Server Actions (< 10 seconds)
- Simple database CRUD operations
- One-off admin scripts

---

## 🔗 Related Documentation

- **App Blueprint**: `ai_docs/prep/app_pages_and_functionality.md` - App structure and features
- **Master Idea**: `ai_docs/prep/master_idea.md` - Core concept and user goals
- **Trigger.dev Config**: `trigger.config.ts` - Project configuration
- **Database Schema**: `lib/drizzle/schema/` - Data models
- **Trigger.dev Docs**: https://trigger.dev/docs

---

## 📝 Maintenance Notes

**When adding a new workflow**:
1. Create `trigger_workflow_<name>.md` in `ai_docs/prep/`
2. Follow the workflow file structure template above
3. Add entry to this index file with purpose, triggers, and key tasks
4. Update common patterns if introducing new architecture patterns

**When modifying existing workflows**:
1. Update the workflow file with changes
2. Update decision points if branching logic changes
3. Update task chain diagram if flow changes
4. Update "Last Updated" date at bottom of file

---

**Last Updated**: December 2025
**Total Workflows**: 2 (Theme Generation ready, Layout Suggestion pending)
**Application**: Site Engine - AI-powered website builder
