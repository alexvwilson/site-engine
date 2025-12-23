# Trigger.dev Workflows Index

> **Purpose**: Directory of all Trigger.dev background job workflows in this application. Each workflow is a "digital twin" quick reference to understand the system without re-reading all code files.

---

## 📋 Available Workflows

### 📝 Transcription Workflow
**File**: `trigger_workflow_transcription.md`
**Purpose**: Audio/video file upload → FFmpeg extraction → Whisper transcription → Multi-format export
**Trigger**: User uploads media file via web UI
**Duration**: 5-15 minutes (large files ~6x faster with parallel processing)
**Key Tasks**:
- `extract-audio` - Download and extract audio with FFmpeg
- `chunk-audio` - Split large files into 10-min segments (conditional: >20MB)
- `transcribe-audio` - **Parallel** OpenAI Whisper API transcription with multi-format export

**Key Decision Points**:
- File size >20MB → Chunking path → **Parallel transcription** (6x speed improvement)

**Performance Optimization**:
- ⚡ **Parallel Processing**: Large files split into chunks that transcribe simultaneously using Promise.all()
- 60-minute file: ~2 minutes total (vs 12 minutes sequential)

---

### 🤖 AI Summary Generation Workflow
**File**: `trigger_workflow_ai_summaries.md`
**Purpose**: On-demand AI summary generation with intelligent classification and real-time streaming
**Trigger**: User clicks "Generate Summary" button on transcript page (Pro tier only)
**Duration**: 30 seconds - 2 minutes (depends on transcript length)
**Key Tasks**:
- `generate-ai-summary` - Classify transcript type → Stream Gemini summary → Save to database

**Key Decision Points**:
- AI classification determines format: Meeting Notes | YouTube Video | General
- Type-specific prompts generate unique summary structures
- Real-time streaming via `metadata.stream()` for live UX

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
- **Database**: Update job status/progress in main table
- **Metadata**: Use `metadata.set()` for real-time UI updates
- **UI Polling**: Frontend polls database every 3 seconds for active jobs

### 4. Conditional Routing
- Use `tasks.trigger()` with if/else logic
- Keep branching simple and explicit
- Avoid complex workflow engines

### 5. Error Isolation
- Each task handles its own errors
- Non-critical failures don't block core workflow
- User-friendly error messages stored in database

### 6. Fire-and-Forget for Non-Blocking
- Secondary tasks (like AI summaries) don't block primary workflow
- Trigger and continue, don't await
- Primary result available immediately

---

## 🌊 Streaming Patterns

Some workflows use **real-time streaming** instead of database polling for live UX:

### Streaming Workflows
- **AI Summary Generation**: Uses `metadata.stream()` to stream Gemini responses to frontend in real-time
- **Future**: Video processing with live previews, batch operation logs

### Polling Workflows
- **Transcription**: Uses database polling (3-second intervals) for discrete progress checkpoints

### When to Use Each:

**Use Streaming** (`metadata.stream()` + `useRealtimeRunWithStreams`):
- ✅ Continuous data generation (AI responses, logs, live previews)
- ✅ Users benefit from seeing incremental results
- ✅ Data is human-readable text or JSON
- ✅ High UX value from real-time updates

**Use Polling** (database queries every 3s):
- ✅ Discrete progress checkpoints (10%, 30%, 50%)
- ✅ Status-only updates (pending → processing → completed)
- ✅ Simple implementation without WebSocket management
- ✅ No continuous data stream to display

**Reference**: See `ai_docs/planning/trigger_dev_research.md` section 8 for full streaming API documentation.

---

## 🔀 Architecture Decision: Task vs API Route

Before creating a new workflow, decide if it should be a **Trigger.dev task** or **API route**:

### Use Trigger.dev Task:
✅ Operation takes >10 seconds
✅ Need automatic retry logic
✅ Should continue if user closes browser
✅ Need progress tracking across multiple steps
✅ Want job history and monitoring
✅ Need real-time streaming to frontend

**Examples**: Video transcription, AI summary generation, batch email sending

### Use API Route:
✅ Synchronous operation (<10 seconds)
✅ Simple database query or CRUD operation
✅ User expects immediate response
✅ No retry logic needed

**Examples**: Fetching user profile, saving a form, simple validation

**Common Mistake**: Using API routes for streaming long-running operations (>30s). Use Trigger.dev tasks with `metadata.stream()` instead.

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

- ✅ New background process has **2+ Trigger.dev tasks**
- ✅ Different **trigger mechanism** (cron vs event vs manual)
- ✅ Different **data model** (new job tracking table)
- ✅ Workflow takes **>30 seconds** (too slow for API route)
- ✅ Complex **multi-step processing** with conditional branching

Don't create a workflow file for:
- ❌ Single-task operations (use simple server action)
- ❌ Synchronous API routes (< 10 seconds)
- ❌ Simple database CRUD operations
- ❌ One-off admin scripts

---

## 🔗 Related Documentation

- **Task Templates**: `ai_docs/dev_templates/task_template.md` - How to write Trigger.dev tasks
- **Trigger.dev Config**: `trigger.config.ts` - Project configuration
- **Database Schema**: `lib/drizzle/schema/` - Data models
- **Trigger.dev Docs**: https://trigger.dev/docs

---

## 📝 Maintenance Notes

**When adding a new workflow**:
1. Create `trigger_workflow_<name>.md` in `ai_docs/prep/`
2. Follow the workflow file structure template above
3. Add entry to this index file with purpose, triggers, and key tasks
4. Update `task_template.md` if introducing new patterns

**When modifying existing workflows**:
1. Update the workflow file with changes
2. Update decision points if branching logic changes
3. Update task chain diagram if flow changes
4. Update "Last Updated" date at bottom of file

---

**Last Updated**: January 2025
**Total Workflows**: 2 (Transcription, AI Summaries)
