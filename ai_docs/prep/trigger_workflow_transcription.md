# 🎬 Transcription Workflow: Trigger.dev Quick Reference

> **Purpose**: Quick-reference "digital twin" of the transcription workflow to help AI understand the system without re-reading all code files.

---

## 📋 Workflow Overview

This is a Trigger.dev v4 background job workflow that transcribes audio/video files using OpenAI Whisper. The workflow uses **conditional branching** based on file size.

**Core Flow**: Upload → Extract Audio → [Chunk if >20MB] → Transcribe → Complete

**Key Decisions**:
- **File Size**: Files >20MB are chunked into 10-min segments for parallel processing

**Note**: AI summaries are now generated on-demand via a separate workflow (see `trigger_workflow_ai_summaries.md`) when users click the "Generate Summary" button after transcription completes.

**Database as Source of Truth**: All state lives in PostgreSQL via Drizzle ORM. Tasks pass data via typed payloads, not session state.

**Progress Tracking**: Tasks update `transcription_jobs.progress_percentage` (0-100%) and use `metadata.set()` for real-time UI updates.

**Tech Stack**:
- Trigger.dev v4 (background jobs)
- OpenAI Whisper API (transcription)
- GPT-4o (summaries)
- FFmpeg (audio extraction/chunking)
- Supabase Storage (file storage)
- PostgreSQL + Drizzle ORM (state)

---

## 🔗 Task Chain Diagram

```
[USER UPLOADS FILE]
        ↓
[createTranscriptionJob() + triggerBackgroundJob()]
        ↓
┌───────────────────────────────────────────────────────────┐
│ extract-audio                                             │
│ • Downloads file from storage                             │
│ • Extracts audio with FFmpeg                              │
│ • Gets duration metadata                                  │
│ • Progress: 10% → 30%                                     │
└─────────────────────┬─────────────────────────────────────┘
                      │
                      ├─────────── File > 20MB? ──────────┐
                      │                                    │
                     YES                                  NO
                      │                                    │
                      ↓                                    ↓
        ┌─────────────────────────────┐    ┌────────────────────────────────┐
        │ chunk-audio                 │    │ transcribe-audio               │
        │ • Splits into 10-min chunks │    │ • Single chunk processing      │
        │ • Uploads chunks to storage │    │ • Whisper transcription        │
        │ • Progress: 35% → 40%       │    │ • Format conversion (5 types)  │
        └──────────┬──────────────────┘    │ • Save to database             │
                   │                        │ • Progress: 35% → 90%/100%    │
                   └──────────────────┐     └────────────┬───────────────────┘
                                      │                  │
                                      ↓                  ↓
                            ┌─────────────────────────────┐
                            │ transcribe-audio            │
                            │ • PARALLEL processing       │
                            │   (Promise.all)             │
                            │ • All chunks transcribe     │
                            │   simultaneously            │
                            │ • Merge with time offsets   │
                            │ • Progress: 40% → 100%      │
                            └──────────┬──────────────────┘
                                       │
                                       ↓
                               [Job completed]
                               [Progress: 100%]

Note: AI summaries are now generated separately via user-initiated workflow
```

---

## 🌳 Critical Decision Points

### Decision 1: File Size Routing (extract-audio task)

```typescript
// In extract-audio task after FFmpeg extraction
const fileSizeMB = audioBuffer.length / (1024 * 1024);

if (fileSizeMB > 20) {
  // CHUNK PATH: Large files
  await tasks.trigger<typeof chunkAudioTask>("chunk-audio", {
    jobId,
    userId,
    audioPath,
    duration
  });
} else {
  // DIRECT PATH: Small files
  await tasks.trigger<typeof transcribeAudioTask>("transcribe-audio", {
    jobId,
    userId,
    chunks: [{ path: audioPath, chunkIndex: 0, startTime: 0, endTime: duration }]
  });
}
```

**Why?** Whisper API has 25MB file size limit. Chunking ensures large files (>20MB ≈ >20min) process successfully.

---

## 📊 Core Data Flow

### Task Payloads (Simplified)

```typescript
// Task 1: extract-audio
interface ExtractAudioPayload {
  jobId: string;
  userId: string;
  fileUrl: string;      // Supabase Storage URL
  fileName: string;
  fileType: "audio" | "video";
}

// Task 2: chunk-audio (conditional)
interface ChunkAudioPayload {
  jobId: string;
  userId: string;
  audioPath: string;    // Extracted audio file path
  duration: number;     // Total duration in seconds
}

// Task 3: transcribe-audio
interface TranscribeAudioPayload {
  jobId: string;
  userId: string;
  chunks: AudioChunk[]; // Array of chunk metadata
}

interface AudioChunk {
  path: string;         // File path or URL
  chunkIndex: number;   // 0-based index for ordering
  startTime: number;    // Offset in seconds
  endTime: number;      // End time in seconds
}
```

**Note**: AI summary generation is now a separate on-demand workflow (see `trigger_workflow_ai_summaries.md`).

### Database Tables

**transcription_jobs** - Main job tracking
- Key fields: `id`, `user_id`, `status`, `progress_percentage`, `file_name`, `original_file_url`
- Status values: `pending`, `processing`, `completed`, `failed`, `cancelled`

**transcripts** - Completed transcriptions
- Key fields: `id`, `job_id`, `user_id`, `transcript_text_plain`, `transcript_srt`, `transcript_vtt`, `transcript_json`, `transcript_verbose_json`
- One-to-one relationship with `transcription_jobs`

**ai_summaries** - AI-generated summaries
- Key fields: `id`, `transcript_id`, `user_id`, `key_highlights`, `topics`, `show_notes`, `social_captions` (JSONB), `tier`
- One-to-one relationship with `transcripts`

---

## 📁 File Locations

### Task Definitions
```
trigger/tasks/extract-audio.ts    - Task 1: Audio extraction with FFmpeg
trigger/tasks/chunk-audio.ts      - Task 2: Split large files into chunks
trigger/tasks/transcribe-audio.ts - Task 3: Whisper API transcription
```

**Note**: Summary generation task moved to separate workflow (see `trigger_workflow_ai_summaries.md`)

### Utility Functions
```
trigger/utils/ffmpeg.ts           - FFmpeg operations (extract, chunk, duration)
trigger/utils/whisper.ts          - OpenAI Whisper API integration
trigger/utils/exports.ts          - Format conversion (TXT, SRT, VTT, JSON)
```

### Server-Side Libraries
```
lib/jobs.ts                       - Job creation, status updates, metadata
lib/transcripts.ts                - Transcript queries with JOINs
lib/upload.ts                     - File validation and Supabase Storage
lib/storage.ts                    - Supabase Storage utilities
```

### Database Schema
```
lib/drizzle/schema/transcription-jobs.ts  - Job tracking table
lib/drizzle/schema/transcripts.ts         - Transcript data table
lib/drizzle/schema/ai-summaries.ts        - AI summary table
lib/drizzle/db.ts                         - Drizzle database client
```

### Trigger.dev Configuration
```
trigger.config.ts                 - Trigger.dev project configuration
trigger/index.ts                  - Task exports (required by Trigger.dev)
```

---

## 🔧 Key Utility Functions

### FFmpeg Operations (trigger/utils/ffmpeg.ts)
- `extractAudio(fileUrl)` - Extract audio from video files (MP4, MOV)
- `getAudioDuration(fileUrl)` - Get duration in seconds
- `splitAudioIntoChunks(audioPath, chunkDuration)` - Split into 10-min segments
- `convertAudioFormat(inputPath, outputFormat)` - Convert to WAV/M4A

### Whisper API (trigger/utils/whisper.ts)
- `transcribeAudioChunk(audioUrl, language, granularity)` - Call Whisper API
- `mergeChunkTranscripts(chunkResults)` - Combine chunks with time offset adjustment

### Export Formats (trigger/utils/exports.ts)
- `generatePlainText(segments)` - TXT format
- `generateSRT(segments)` - SRT subtitle format
- `generateVTT(segments)` - WebVTT format
- `generateJSON(transcriptData)` - JSON format
- `generateVerboseJSON(transcriptData)` - Verbose JSON (Pro tier)

### GPT Summaries (trigger/utils/gpt-summaries.ts)
- `generateSummary(transcriptText, tier)` - Generate tier-specific summary
- Returns: `{ key_highlights, topics, show_notes, social_captions }`

### Job Management (lib/jobs.ts)
- `createTranscriptionJob(userId, jobData)` - Create job record
- `triggerBackgroundJob(jobId)` - Start Trigger.dev workflow
- `updateJobStatus(jobId, status, progress)` - Update job state
- `updateJobMetadata(jobId, duration, language)` - Add metadata after FFmpeg
- `getActiveJobs(userId)` - Get pending/processing jobs for polling

### Transcript Queries (lib/transcripts.ts)
- `getTranscriptByJobId(jobId, userId)` - JOIN query: transcript + job + summary
- `getAISummary(transcriptId, userId)` - Check if summary exists (for polling)

---

## 🎯 Progress Tracking Pattern

Tasks update progress in two places:

1. **Database**: `updateJobStatus(jobId, status, progress)` updates `transcription_jobs` table
2. **Metadata**: `metadata.root.set()` for real-time UI updates (child tasks update root)

**Progress Ranges by Task**:
- extract-audio: 10% → 30%
- chunk-audio: 32% → 35% (updates root via `metadata.root.set()`)
- transcribe-audio: 35% → 100% (updates root via `metadata.root.set()`)

### **Root Metadata Pattern (Critical Architecture)**

This workflow uses **root metadata updates** to solve the "progress gap" problem in nested task chains:

**Problem**: When `extract-audio` uses `triggerAndWait()` to call child tasks (`chunk-audio` and `transcribe-audio`), the UI subscribes to the root task's run ID. If child tasks use `metadata.set()` to update their own metadata, these updates are invisible to the UI. Using `metadata.parent.set()` only updates the immediate parent, not the root task.

**Solution**: Child tasks use `metadata.root.set()` to update the **root task's metadata** (propagates through all nesting levels):

```typescript
// In chunk-audio.ts
metadata.root.set("progress", 32);
metadata.root.set("currentStep", "Downloading large audio file");

// In transcribe-audio.ts
metadata.root.set("progress", 50);
metadata.root.set("currentStep", "Transcribed 3/6 chunks");
```

**Result**: Users see continuous progress from 30% → 100% instead of the UI appearing stuck at 30% while child tasks execute, even through multiple levels of task nesting.

**Frontend Integration**:
```typescript
// UI subscribes to ROOT task run ID only
const { run } = useRealtimeRun(rootRunId, { accessToken });
const progress = run?.metadata?.progress; // Gets updates from nested children

// CRITICAL: Add 500ms delay before router.refresh() to prevent race condition
onComplete: () => {
  setTimeout(() => {
    router.refresh(); // Ensures database update completes first
  }, 500);
  if (onComplete) onComplete();
}
```

**Reference Implementation**: See task 044 for complete implementation details and rationale.

**UI Polling**: Frontend also polls database every 3 seconds for jobs with `status IN ('pending', 'processing')` as a fallback.

**Streaming vs Polling**:
- This workflow uses **parent metadata updates** for real-time progress (via `useRealtimeRun()`)
- Database polling serves as backup for connection failures
- **Alternative**: `metadata.stream()` could be used for continuous data streaming (see AI Summary workflow)
- **Decision**: Parent metadata pattern chosen for transcription because it provides seamless progress updates across task chains

---

## ⚡ Parallel Chunk Processing

**Implementation**: Large files (>20MB) are split into 10-minute chunks that are transcribed **simultaneously** using `Promise.all()`.

### Performance Benefits

**Before (Sequential Processing)**:
- 60-minute file = 6 chunks × ~2 min each = **~12 minutes total**
- Chunks processed one at a time
- Each chunk waits for previous chunk to complete

**After (Parallel Processing)**:
- 60-minute file = 6 chunks processed simultaneously = **~2 minutes total**
- All chunks start immediately
- Total time = slowest chunk duration

**Speed Improvement**: ~6x faster for large files (depends on chunk count)

### Code Implementation

```typescript
// transcribe-audio.ts - Parallel processing with Promise.all()
const processChunk = async (chunk: AudioChunkRef, index: number) => {
  // Download → Transcribe → Adjust timestamps
  const transcription = await openai.audio.transcriptions.create({...});
  return adjustTimestamps(transcription, chunk.offset);
};

// Process all chunks in parallel
const transcripts = await Promise.all(
  chunks.map((chunk, index) => processChunk(chunk, index))
);
```

### Progress Tracking

Progress updates as each chunk completes (not sequential):
- Chunk 3 might finish before Chunk 1
- Progress increments based on completed count
- UI shows: "Transcribed 3/6 chunks" (dynamic)

### Error Handling

- If **any** chunk fails, entire task fails (Promise.all behavior)
- All chunks are retried together if task is retried
- No partial transcripts saved

---

## 🚨 Common Failure Points

1. **FFmpeg extraction fails**: Invalid file format or corrupted file → Job fails at 10% with error message
2. **Whisper API rate limit**: Exponential backoff with max 3 retries → Job eventually succeeds or fails after retries
3. **Chunk merge fails**: Time offset calculation error → Results in incorrect timestamps (rare)
4. **GPT summary fails**: Doesn't block transcript viewing → Summary shows "Failed to generate" message
5. **File too large for tier**: Blocked at upload stage by quota checking (before job creation)

---

## 💡 Key Architecture Principles

1. **Database as Source of Truth**: Never rely on task memory or session state. Always query DB for latest job state.

2. **Payload-Based Chaining**: Tasks pass data via typed payloads. Each task is stateless and can be retried independently.

3. **Conditional Routing**: Use `tasks.trigger()` calls with if/else logic, not complex workflow engines.

4. **Fire-and-Forget for Non-Blocking**: Summary generation doesn't block transcript viewing. Trigger and continue.

5. **Progress Granularity**: Update progress at logical checkpoints, not continuously. Too many updates slow down DB.

6. **Error Isolation**: Summary failures don't fail transcription. Each task handles its own errors.

---

## 📝 Quick Implementation Checklist

When adding a new task to the workflow:
- [ ] Create task file in `trigger/tasks/`
- [ ] Define typed payload interface
- [ ] Export task from `trigger/index.ts`
- [ ] Add progress tracking (`metadata.set()` + DB update)
- [ ] Handle errors with user-friendly messages
- [ ] Update database state before triggering next task
- [ ] Test with small file, large file, and error scenarios

When modifying the workflow:
- [ ] Check `ai_docs/prep/trigger_workflow_transcription.md` (this file) for current state
- [ ] Update task payload interfaces if data structure changes
- [ ] Update decision tree logic if branching changes
- [ ] Update progress ranges if new steps added
- [ ] Test end-to-end transcription flow
- [ ] For summary generation changes, see `trigger_workflow_ai_summaries.md`

---

**Last Updated**: January 2025
**Current State**: Production v2.1 - 3 tasks with parallel chunk processing (summary generation moved to separate workflow)
**Key Features**: Parallel transcription using Promise.all() for 6x faster processing of large files
**Related Workflows**: See `trigger_workflow_ai_summaries.md` for on-demand summary generation
