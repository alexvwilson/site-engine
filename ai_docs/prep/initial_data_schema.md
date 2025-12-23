## Strategic Database Planning Document

### App Summary

**End Goal:** Help solo creators and podcasters convert their audio and video content into accurate, searchable transcripts using AI-powered transcription workflows built with Whisper, FFmpeg, and Trigger.dev

**Template Used:** worker-simple (background job processing with Trigger.dev)

**Core Workflows:**
- Transcription workflow (audio/video → Whisper → multi-format exports)
- AI summary generation workflow (transcript → Gemini classification → markdown summary)

**Background Job Types:** File processing (audio/video transcription with FFmpeg + Whisper)

---

## 🗄️ Current Database State

### Existing Tables (Worker-Simple Template)

The worker-simple template provides a complete transcription-focused schema:

- **`users`** - User profiles (synced with Supabase auth), Stripe customer IDs, roles (member/admin)
- **`transcription_jobs`** - Job tracking with Trigger.dev integration, file metadata, status, progress
- **`transcripts`** - Completed transcripts in multiple formats (TXT, SRT, VTT, JSON, verbose_json)
- **`ai_summaries`** - AI-generated markdown summaries with classification (meeting_notes, youtube_video, general)
- **`usage_events`** - Event-based usage tracking for quota enforcement
- **`transcript_conversations`** - Chat sessions tied to transcripts (Pro tier - Ask Scribo feature)
- **`transcript_messages`** - User/assistant messages in transcript conversations

### Template Assessment

**✅ 100% Fit:** Worker-simple template schema perfectly matches transcription workflow needs
**🔧 Ready to Build:** All core workflows are already supported by existing tables
**📈 Future-Proof:** Event-based usage tracking allows flexible quota patterns

---

## ⚡ Workflow-to-Schema Mapping

### Core Workflows (From Trigger.dev Documentation)

**Workflow: Transcription** (`trigger_workflow_transcription.md`)
- **Purpose**: Audio/video file upload → FFmpeg extraction → Whisper transcription → Multi-format export
- **Job Tracking**: Uses `transcription_jobs` with fields:
  - `trigger_job_id` - Trigger.dev run ID (REQUIRED)
  - `status` - Job status enum: pending, processing, completed, failed, cancelled (REQUIRED)
  - `progress_percentage` - 0-100 tracking (REQUIRED)
  - `file_name`, `original_file_url`, `file_size_bytes` - Input metadata
  - `file_type` (audio/video), `file_extension` (mp3, mp4, wav, mov, m4a)
  - `duration_seconds`, `language`, `detected_language` - Processing metadata
  - `timestamp_granularity` (segment/word) - User-selected precision
  - `error_message` - User-friendly error (nullable)
- **Results Storage**: Uses `transcripts` with fields:
  - `transcript_text_plain`, `transcript_srt`, `transcript_vtt` - Export formats
  - `transcript_json`, `transcript_verbose_json` - Structured data
  - `word_timestamps` (JSONB) - Word-level timing data (Creator/Pro tiers)
  - `detected_language`, `duration_seconds` - Metadata
- **Enhancements**: None (AI summaries are separate workflow)
- **Current State**: ✅ Already implemented

**Workflow: AI Summary Generation** (`trigger_workflow_ai_summaries.md`)
- **Purpose**: On-demand AI summary generation with intelligent classification and real-time streaming
- **Job Tracking**: No separate jobs table (on-demand trigger, completes quickly)
- **Results Storage**: Uses `ai_summaries` with fields:
  - `summary_type` - Classification: meeting_notes, youtube_video, general
  - `summary_content` - Full markdown summary (classification-based format)
  - `transcript_id` - Links to source transcript
- **Enhancements**: None (this IS an enhancement to transcripts)
- **Current State**: ✅ Already implemented
- **Note**: Classification-based approach with full markdown is more flexible than fixed fields

### Universal Patterns Across All Workflows

**Job Tracking Pattern** (applied to transcription workflow):
- Every workflow needs a job tracking table
- Must include Trigger.dev integration fields (`trigger_job_id`, `status`, `progress_percentage`)
- Status enum values: `pending`, `processing`, `completed`, `failed`, `cancelled`

**Results Storage Pattern** (transcripts table):
- One-to-one relationship with job table (UNIQUE constraint on `job_id`)
- Multiple format exports stored directly in table (pre-generated for instant downloads)
- Format-specific output fields

**Enhancement Pattern** (AI summaries):
- One-to-one relationship with results table (UNIQUE constraint on `transcript_id`)
- Tier-based feature gating (Pro users only)
- Generated on-demand (user clicks button)

---

## 📋 Feature-to-Schema Mapping

### Phase 1: Core Transcription Features (MVP)

**Feature: Upload & Track Transcription Jobs** (`/app/transcripts` upload area + active jobs)

- **Uses:** `transcription_jobs` table
- **Why:** Track file uploads through Trigger.dev pipeline (pending → processing → completed/failed)
- **Key Fields:**
  - Input: `file_name`, `original_file_url`, `file_size_bytes`, `file_type`, `file_extension`
  - Processing: `status`, `progress_percentage`, `trigger_job_id`, `error_message`
  - Metadata: `duration_seconds`, `language`, `detected_language`, `timestamp_granularity`
  - Timestamps: `created_at`, `completed_at`
- **Trigger.dev Integration:** `trigger_job_id` enables real-time progress via `useRealtimeRun()` hook

**Feature: View & Download Transcripts** (`/app/transcripts/[id]` viewer)

- **Uses:** `transcripts` table
- **Why:** Store completed transcription content with all pre-generated export formats
- **Key Fields:**
  - Formats: `transcript_text_plain`, `transcript_srt`, `transcript_vtt`, `transcript_json`
  - Pro formats: `transcript_verbose_json`, `word_timestamps` (JSONB)
  - Metadata: `detected_language`, `duration_seconds`
- **Decision:** Pre-generate all export formats during transcription for instant downloads

**Feature: AI Summary Generation** (`/app/transcripts/[id]` AI summary panel - Pro tier)

- **Uses:** `ai_summaries` table
- **Why:** Store AI-generated summaries separately from transcripts (on-demand Trigger.dev task)
- **Key Fields:**
  - `summary_type` - Classification: meeting_notes, youtube_video, general
  - `summary_content` - Full markdown summary (classification determines structure)
  - `transcript_id` - One-to-one with transcripts (UNIQUE constraint)
- **Flow:** User clicks "Generate Summary" → AI classifies transcript type → Streams summary → Saves to DB
- **Note:** Classification-based approach with streaming UX (see `trigger_workflow_ai_summaries.md`)

**Feature: Quota Enforcement** (Profile usage stats + upload blocking)

- **Uses:** `usage_events` table (event-based tracking)
- **Why:** Track individual usage events, query on-demand for monthly aggregates
- **Event Types:**
  - `upload` - File upload initiated
  - `transcription_completed` - Transcription finished
  - `ai_summary_generated` - Summary created
  - `storage_added` / `storage_removed` - Storage changes
- **Key Fields:**
  - `user_id`, `event_type`, `metadata` (JSONB), `created_at`
- **Quota Calculation:**
  ```sql
  -- Get monthly uploads
  SELECT COUNT(*) FROM usage_events
  WHERE user_id = X
    AND event_type = 'upload'
    AND created_at >= '2025-01-01'
    AND created_at < '2025-02-01'

  -- Get minutes transcribed this month
  SELECT SUM((metadata->>'duration')::int) FROM usage_events
  WHERE user_id = X
    AND event_type = 'transcription_completed'
    AND created_at >= first_day_of_month
  ```
- **Enforcement:** Free (3 uploads), Creator (50 uploads), Pro (unlimited)
- **Advantage:** Event-based pattern is more flexible than aggregate tables - can retroactively add new metrics

**Feature: Subscription Management** (Stripe integration, tier checking)

- **Uses:** `users.stripe_customer_id` field only
- **Why:** Stripe is single source of truth - always query Stripe API for current tier/status
- **Decision:** No local subscription_tier caching to avoid sync issues

**Feature: Admin System Monitoring** (`/admin/dashboard` single page)

- **Uses:** Aggregate queries across `transcription_jobs`, `usage_events`, `users`
- **Why:** No separate admin tables needed - admin focuses on system-wide metrics
- **Key Metrics:**
  - Total users, jobs today, minutes this month
  - Success/failure rates (24h, last hour)
  - Job statistics chart (30 days)
  - Usage trends chart (30 days)

### Phase 2: Advanced Features (Post-MVP)

**Feature: Ask Scribo - Chat with Transcript** (`/app/transcripts/[id]` Ask Scribo tab - Pro tier)

- **Uses:** `transcript_conversations` + `transcript_messages` tables
- **Why:** Enable users to ask questions about transcript content using AI chat
- **Tables:**
  - `transcript_conversations`: Chat session metadata (title, transcript_id, timestamps)
  - `transcript_messages`: Individual messages (sender: user/assistant, content, status)
- **Flow:** User opens Ask Scribo tab → Creates conversation → Sends messages → AI responds with context from transcript
- **Note:** This is NOT a background job workflow - it's a synchronous API route with streaming responses

---

## 📋 Database Schema Implementation

### Phase 1 (MVP - Essential Tables)

**1. `users` table** (Already exists)
```typescript
id (uuid, PK) - References Supabase auth.users.id
email (text, unique) - Synced from Supabase auth
full_name (text, nullable)
stripe_customer_id (text, nullable) - Links to Stripe customer
role (enum: member, admin) - Role-based access control
created_at, updated_at (timestamps)

Indexes:
- role (for admin queries)
```

**2. `transcription_jobs` table** (Core workflow tracking)
```typescript
id (uuid, PK)
user_id (uuid, FK → users.id, cascade delete)

// File information
file_name (text)
original_file_url (text) - Supabase Storage path
file_size_bytes (bigint)
file_type (enum: audio, video)
file_extension (text) - mp3, mp4, wav, mov, m4a

// Job status and progress
status (enum: pending, processing, completed, failed, cancelled)
progress_percentage (integer, 0-100)
error_message (text, nullable)

// Audio/transcription metadata
duration_seconds (integer, nullable) - Set after FFmpeg extraction
language (text, nullable) - User-selected or 'auto'
detected_language (text, nullable) - Whisper detection result
timestamp_granularity (enum: segment, word)

// Trigger.dev integration (CRITICAL)
trigger_job_id (text, nullable) - Trigger.dev run ID

// Timestamps
created_at (timestamp)
completed_at (timestamp, nullable)

Indexes:
- user_id (for user's job list queries)
- status (for polling active jobs)
- created_at (for sorting/pagination)
```

**3. `transcripts` table** (Results storage)
```typescript
id (uuid, PK)
job_id (uuid, FK → transcription_jobs.id, cascade delete, UNIQUE)
user_id (uuid, FK → users.id, cascade delete)

// Transcript formats (pre-generated)
transcript_text_plain (text) - Plain text format
transcript_srt (text) - SRT subtitle format
transcript_vtt (text) - WebVTT format
transcript_json (jsonb) - JSON format with segments
transcript_verbose_json (jsonb, nullable) - Verbose JSON (Pro tier only)
word_timestamps (jsonb, nullable) - Word-level timestamps (Creator/Pro)

// Metadata
detected_language (text)
duration_seconds (integer)

// Timestamp
created_at (timestamp)

Constraints:
- UNIQUE on job_id (one transcript per job)

Indexes:
- user_id (for user's transcript queries)
- created_at (for sorting)
```

**4. `ai_summaries` table** (Enhancement - Pro tier)
```typescript
id (uuid, PK)
transcript_id (uuid, FK → transcripts.id, cascade delete, UNIQUE)
user_id (uuid, FK → users.id, cascade delete)

// Summary classification and content
summary_type (enum: meeting_notes, youtube_video, general)
summary_content (text) - Full markdown summary

// Timestamp
created_at (timestamp)

Constraints:
- UNIQUE on transcript_id (one summary per transcript)

Indexes:
- user_id (for user's summaries)
- summary_type (for analytics)
```

**5. `usage_events` table** (Event-based quota tracking)
```typescript
id (uuid, PK)
user_id (uuid, FK → users.id, cascade delete)
event_type (text) - 'upload', 'transcription_completed', 'ai_summary_generated', etc.
metadata (jsonb, nullable) - Event-specific data (file_size, duration, job_id, etc.)
created_at (timestamp)

Indexes:
- (user_id, event_type, created_at) - Composite index for time-window queries
- created_at (for general time-based queries)
- user_id (for user-specific queries)

Event Types:
- 'upload' - File upload initiated (metadata: {fileSize, fileName, mimeType})
- 'transcription_completed' - Transcription finished (metadata: {duration, jobId})
- 'ai_summary_generated' - Summary created (metadata: {transcriptId, summaryType})
- 'storage_added' - Storage consumed (metadata: {bytes, jobId})
- 'storage_removed' - Storage freed (metadata: {bytes, jobId})
```

### Phase 2 (Post-MVP - Advanced Features)

**6. `transcript_conversations` table** (Ask Scribo - Pro tier)
```typescript
id (uuid, PK)
transcript_id (uuid, FK → transcripts.id, cascade delete)
user_id (uuid, FK → users.id, cascade delete)
title (text, nullable) - Auto-generated or user-set
created_at, updated_at (timestamps)

Indexes:
- transcript_id (for conversation lookup)
- user_id (for user's conversations)
```

**7. `transcript_messages` table** (Ask Scribo - Pro tier)
```typescript
id (uuid, PK)
transcript_conversation_id (uuid, FK → transcript_conversations.id, cascade delete)
sender (enum: user, assistant)
content (text)
status (enum: success, error) - Message status
created_at (timestamp)

Indexes:
- transcript_conversation_id (for message list)
- status (for error tracking)
```

---

## 🎯 Strategic Advantage

### Why This Schema Design Works

**1. Trigger.dev Integration Pattern**
- ✅ `trigger_job_id` in jobs table enables real-time progress tracking
- ✅ `status` enum matches Trigger.dev job lifecycle
- ✅ `progress_percentage` synced with `metadata.set("progress", X)` in tasks
- ✅ Frontend uses `useRealtimeRun(trigger_job_id)` for live updates

**2. Event-Based Usage Tracking**
- ✅ More flexible than aggregate tables (usage_tracking with monthly columns)
- ✅ Query on-demand for any time window: `WHERE created_at >= X AND created_at < Y`
- ✅ Can retroactively add new metrics without schema changes
- ✅ Metadata JSONB allows event-specific data without new columns
- ✅ Natural audit log for debugging quota issues

**3. Classification-Based AI Summaries**
- ✅ `summary_type` enum allows different markdown formats per classification
- ✅ `summary_content` as full markdown is more flexible than fixed fields (key_highlights, topics, show_notes)
- ✅ Aligns with streaming workflow design (see `trigger_workflow_ai_summaries.md`)
- ✅ Enables future classification types without schema changes

**4. Separation of Concerns**
- ✅ `transcription_jobs` tracks Trigger.dev pipeline status (pending → processing → completed)
- ✅ `transcripts` stores completed output with all export formats pre-generated
- ✅ `ai_summaries` runs as separate on-demand job (user can view transcript while summary generates)
- ✅ `usage_events` tracks quota consumption without hitting Stripe API

**5. Stripe Integration Strategy**
- ✅ No local subscription tier caching avoids webhook sync complexity
- ✅ Query Stripe API directly for tier checks (acceptable latency for tier-gated features)
- ✅ Stripe webhooks only needed for critical events (payment success/failure)
- ✅ Single source of truth for subscription status

**6. Performance Optimizations**
- ✅ Pre-generate all export formats during transcription (faster downloads)
- ✅ JSONB for word_timestamps allows flexible querying without separate table
- ✅ JSONB for usage_events.metadata keeps event data together
- ✅ Composite index on (user_id, event_type, created_at) makes quota checks instant

---

## 🔧 Trigger.dev Integration Requirements

### Required Fields (Every Job Table)

```typescript
// These fields MUST exist in every [workflow]_jobs table
{
  trigger_job_id: text        // Trigger.dev run ID for useRealtimeRun()
  status: enum               // pending | processing | completed | failed | cancelled
  progress_percentage: int   // 0-100, synced with metadata.set("progress")
  error_message: text        // User-friendly error message (nullable)
}
```

### Frontend Integration Pattern

```typescript
// How to use these fields in your UI
const { run } = useRealtimeRun(job.trigger_job_id, { accessToken });
const progress = run?.metadata?.progress ?? job.progress_percentage;
const status = job.status;
```

### Database Update Pattern

```typescript
// How tasks update these fields
await updateJobProgress(jobId, 50);           // Updates progress_percentage
metadata.set("progress", 50);                 // Updates real-time UI
await updateJobStatus(jobId, "completed");    // Updates status enum
```

---

## 📊 Usage Tracking Pattern

### Event-Based Quota Enforcement

**Why Event-Based > Aggregate Tables:**

❌ **Aggregate approach (discouraged):**
```typescript
usage_tracking {
  user_id, month, uploads_count, minutes_transcribed, storage_bytes
  // Problems:
  // - Need to UPDATE every event (race conditions, locks)
  // - Hard to add new metrics without schema changes
  // - Can't query arbitrary time windows
  // - No audit trail
}
```

✅ **Event-based approach (recommended):**
```typescript
usage_events {
  user_id, event_type, metadata, created_at
  // Benefits:
  // - INSERT only (no race conditions)
  // - Add new event types without schema changes
  // - Query any time window on-demand
  // - Natural audit log
  // - Metadata JSONB allows flexible event data
}
```

### Query Patterns

```sql
-- Get monthly uploads (Free: 3, Creator: 50, Pro: unlimited)
SELECT COUNT(*) FROM usage_events
WHERE user_id = $1
  AND event_type = 'upload'
  AND created_at >= date_trunc('month', CURRENT_DATE)
  AND created_at < date_trunc('month', CURRENT_DATE) + interval '1 month';

-- Get minutes transcribed this month
SELECT COALESCE(SUM((metadata->>'duration')::int), 0) / 60 AS minutes
FROM usage_events
WHERE user_id = $1
  AND event_type = 'transcription_completed'
  AND created_at >= date_trunc('month', CURRENT_DATE);

-- Get storage used (current balance)
SELECT
  COALESCE(SUM(CASE WHEN event_type = 'storage_added'
    THEN (metadata->>'bytes')::bigint
    ELSE 0 END), 0) -
  COALESCE(SUM(CASE WHEN event_type = 'storage_removed'
    THEN (metadata->>'bytes')::bigint
    ELSE 0 END), 0) AS storage_bytes
FROM usage_events
WHERE user_id = $1;
```

### Event Metadata Examples

```typescript
// Upload event
{
  event_type: 'upload',
  metadata: {
    fileSize: 15728640,
    fileName: 'episode_42.mp3',
    mimeType: 'audio/mpeg',
    jobId: 'uuid'
  }
}

// Transcription completed event
{
  event_type: 'transcription_completed',
  metadata: {
    duration: 3600, // seconds
    jobId: 'uuid',
    fileSize: 15728640
  }
}

// AI summary generated event
{
  event_type: 'ai_summary_generated',
  metadata: {
    transcriptId: 'uuid',
    summaryType: 'meeting_notes'
  }
}
```

### Tier-Based Restrictions

**Free Tier:**
- 3 uploads per month (check `event_type = 'upload'` count)
- 15 min max per file (validate before upload)
- Segment-level timestamps only
- TXT, SRT exports only

**Creator Tier ($19/mo):**
- 50 uploads per month
- 60 min max per file
- Word-level timestamps
- TXT, SRT, VTT, JSON exports
- AI summaries (basic)

**Pro Tier ($49/mo):**
- Unlimited uploads
- 120 min max per file
- Word-level timestamps
- All export formats (+ verbose_json)
- AI summaries (full)
- Ask Scribo chat feature

---

## 🗺️ Complete Schema Overview

### Users & Auth
- `users` - Core user data + `stripe_customer_id` only

### Transcription Workflow
- `transcription_jobs` - Job tracking with Trigger.dev integration
- `transcripts` - Completed transcripts (multi-format exports)

### AI Enhancements
- `ai_summaries` - Classification-based markdown summaries (Pro tier)
- `transcript_conversations` - Chat sessions tied to transcripts (Pro tier - Ask Scribo)
- `transcript_messages` - User/assistant messages (Pro tier - Ask Scribo)

### Usage & Billing
- `usage_events` - Event-based usage tracking (flexible quota enforcement)

**Total Tables:** 7
**Background Job Tables:** 1 (`transcription_jobs`)
**Results Tables:** 1 (`transcripts`)
**Enhancement Tables:** 3 (`ai_summaries`, `transcript_conversations`, `transcript_messages`)
**Usage Tables:** 1 (`usage_events`)

---

## 💡 Key Architecture Decisions

### 1. Event-Based vs Aggregate Usage Tracking

**Decision:** Use event-based tracking (`usage_events` table)

**Reasoning:**
- More flexible - query any time window on-demand
- No UPDATE race conditions (INSERT only)
- Natural audit log for debugging
- Can add new metrics without schema changes
- Metadata JSONB allows event-specific data

**Trade-off:** Quota checks require aggregation query vs simple column read
**Mitigation:** Composite index makes queries fast, acceptable for tier-gated features

### 2. Classification-Based vs Fixed-Field Summaries

**Decision:** Use classification-based approach (`summary_type` + `summary_content`)

**Reasoning:**
- AI classifies transcript type (meeting, video, general) → applies type-specific prompt
- Full markdown content is more flexible than fixed fields
- Aligns with streaming workflow design
- Enables future classification types without schema changes

**Trade-off:** No structured fields for direct querying (key_highlights, topics)
**Mitigation:** Can extract structured data from markdown if needed later

### 3. Pre-Generated vs On-Demand Export Formats

**Decision:** Pre-generate all formats during transcription

**Reasoning:**
- Instant downloads - no waiting for format conversion
- Simpler architecture - no separate export job queue
- Storage cost is low compared to compute cost

**Trade-off:** Larger database size (storing 5 formats per transcript)
**Mitigation:** JSONB fields are efficient, Pro-only formats reduce free tier storage

### 4. Ask Scribo as Post-MVP Feature

**Decision:** Separate tables for chat functionality

**Reasoning:**
- Not a background job workflow (synchronous API route)
- Pro tier only - not critical for MVP
- Conversation history enables multi-turn context
- Can add later without affecting core transcription workflow

**Trade-off:** Additional complexity for Pro features
**Mitigation:** Feature toggle based on tier check, separate from main workflow

---

## 🚀 Next Steps

**Development Approach:** Schema is complete and ready for implementation. All tables follow Trigger.dev integration patterns and event-based tracking principles.

**Critical Reminder:**
- Store ONLY `stripe_customer_id` in users table
- Query Stripe API for subscription status (never cache tier locally)
- Track usage in `usage_events` table with event-based pattern
- Include Trigger.dev integration fields in all job tracking tables

**Implementation Order:**
1. Core workflow: `transcription_jobs` → `transcripts` (MVP)
2. Usage tracking: `usage_events` (quota enforcement)
3. Enhancements: `ai_summaries` (Pro tier)
4. Advanced features: `transcript_conversations` + `transcript_messages` (Post-MVP)
