# 🤖 AI Summary Generation Workflow: Trigger.dev Quick Reference

> **Purpose**: Quick-reference "digital twin" of the AI summary generation workflow to help AI understand the system without re-reading all code files.

---

## 📋 Workflow Overview

This is a Trigger.dev v4 background job workflow that generates AI-powered summaries of transcripts using Google Gemini 2.5 Flash with real-time streaming. The workflow uses **intelligent classification** to determine transcript type and generate type-specific summaries with unique structures.

**Core Flow**: User clicks button → Classify transcript type → Stream AI summary → Save to database

**Key Decisions**:
- **Transcript Classification**: AI analyzes content to determine if it's a Meeting, YouTube Video, or General content
- **Type-Specific Prompts**: Each classification gets a uniquely structured summary format

**Database as Source of Truth**: All state lives in PostgreSQL via Drizzle ORM. The task streams data to frontend while updating database progressively.

**Real-Time Streaming**: Uses Trigger.dev `metadata.stream()` to stream Gemini responses to frontend in real-time. Users see markdown sections generate live.

**Tech Stack**:
- Trigger.dev v4 (background jobs + streaming)
- Google Gemini 2.5 Flash (classification + summary generation)
- `@trigger.dev/react-hooks` (frontend streaming)
- PostgreSQL + Drizzle ORM (state)

---

## 🔗 Task Chain Diagram

```
[USER CLICKS "GENERATE SUMMARY" BUTTON]
        ↓
[Server Action: validateSummaryEligibility()]
[Check: Pro tier? Summary exists? Transcript complete?]
        ↓
[Trigger generate-ai-summary task via tasks.trigger()]
        ↓
┌──────────────────────────────────────────────────────┐
│ generate-ai-summary                                  │
│ • Load transcript text from database                 │
│ • Progress: 0% → 10%                                │
└─────────────────────┬────────────────────────────────┘
                      │
                      ↓
┌─────────────────────────────────────────────────────┐
│ STEP 1: Classify Transcript Type                    │
│ • Call Gemini with classification prompt            │
│ • Analyze content patterns (keywords, structure)    │
│ • Return: "meeting_notes" | "youtube_video" |       │
│           "general"                                  │
│ • Progress: 10% (metadata.set())                    │
└─────────────────────┬───────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
    MEETING       YOUTUBE        GENERAL
     NOTES         VIDEO         CONTENT
        │             │             │
        ↓             ↓             ↓
┌──────────────────────────────────────────────────────┐
│ STEP 2: Generate Type-Specific Summary              │
│ • Build prompt based on classification               │
│ • Stream Gemini 2.5 Flash response                  │
│ • metadata.stream("gemini", response)                │
│ • Frontend: useRealtimeRunWithStreams()             │
│ • Progress: 10% → 90% (streaming)                   │
└─────────────────────┬────────────────────────────────┘
                      │
                      ↓
┌─────────────────────────────────────────────────────┐
│ STEP 3: Save Complete Summary                       │
│ • Extract full markdown text from stream            │
│ • Insert into ai_summaries table:                   │
│   - summary_type (classification)                   │
│   - summary_content (full markdown)                 │
│   - transcript_id, user_id                          │
│ • Progress: 90% → 100%                              │
└─────────────────────────────────────────────────────┘
                      │
                      ↓
              [WORKFLOW COMPLETE]
        [Frontend displays saved summary]
```

---

## 🌳 Critical Decision Points

### Decision 1: Transcript Type Classification

**Location**: `generate-ai-summary` task, Step 1

```typescript
// In generate-ai-summary task
const classification = await classifyTranscript(transcriptText);
// Returns: "meeting_notes" | "youtube_video" | "general"

// Classification logic (in lib/ai/gemini.ts)
const classificationPrompt = `
Analyze this transcript and classify it into ONE of these categories:
- meeting_notes: Business meetings, standups, team calls, interviews
- youtube_video: Video content, tutorials, presentations, talks
- general: Podcasts, conversations, lectures, other content

Transcript: ${transcriptText.substring(0, 2000)}

Return ONLY the category name, nothing else.
`;

const result = await gemini.generateContent(classificationPrompt);
const type = result.text().trim().toLowerCase();

// Validate and default to "general" if invalid
if (!["meeting_notes", "youtube_video", "general"].includes(type)) {
  logger.warn("Invalid classification, defaulting to general", { type });
  return "general";
}

return type as SummaryType;
```

**Why?** Different content types need different summary structures. Meetings need action items, YouTube videos need chapter timestamps, general content needs chronological flow.

---

### Decision 2: Type-Specific Prompt Engineering

**Location**: `generate-ai-summary` task, Step 2

```typescript
// Build prompt based on classification
const summaryPrompt = buildSummaryPrompt(classification, transcriptText);

// Example prompts (in lib/ai/prompts/summary-prompts.ts)

// MEETING NOTES FORMAT
const meetingNotesPrompt = `
Generate comprehensive meeting notes in markdown format with:

# [Meeting Title]

## Meeting Purpose
Brief 1-2 sentence overview

## Key Takeaways
- 3-5 most important bullet points
- Focus on decisions made and insights gained

## Topics
### [Topic Name 1]
- Discussion points
- Relevant details

### [Topic Name 2]
...

## Next Steps
- Actionable items with implied owners

## Action Items
- Specific tasks mentioned
- Format: "Task description"

Transcript: ${transcriptText}
`;

// YOUTUBE VIDEO FORMAT
const youtubeVideoPrompt = `
Generate a YouTube video summary in markdown format with:

# [Video Title/Topic]

## Video Overview
1-2 sentence description of video content and purpose

## Key Topics
### [Topic 1]
- Main points covered
- Important details

### [Topic 2]
...

## Main Takeaways
- 3-5 most valuable insights
- Actionable learnings

## Target Audience
Who would benefit from this video

## Notable Quotes
> "[Memorable quote from video]"

Transcript: ${transcriptText}
`;

// GENERAL/CHRONOLOGICAL FORMAT
const generalPrompt = `
Generate a comprehensive summary in markdown format with:

# [Content Title]

## Summary
2-3 sentence overview of the content

## Key Points
- Main idea 1 (chronological order)
- Main idea 2
- Main idea 3
...

## Important Moments
- Highlight 1: [Description]
- Highlight 2: [Description]

## Conclusion
Final thoughts or wrap-up

Transcript: ${transcriptText}
`;
```

**Why?** Each format serves different use cases. Meeting notes help teams track decisions, YouTube summaries help viewers decide if they should watch, general summaries provide quick content overview.

---

## 📊 Core Data Flow

### Task Payload

```typescript
// generate-ai-summary task payload
interface GenerateAISummaryPayload {
  transcriptId: string;  // FK to transcripts table
  userId: string;        // For authorization and ownership
}
```

**Note**: Payload is minimal because all data lives in database. Task loads full transcript text from DB at runtime.

### Database Tables

**ai_summaries** - AI-generated summaries
```typescript
{
  id: uuid (PK)
  transcript_id: uuid (FK → transcripts.id, cascade delete, UNIQUE)
  user_id: uuid (FK → users.id, cascade delete)

  // NEW FIELDS (v2)
  summary_type: "meeting_notes" | "youtube_video" | "general"
  summary_content: text (full markdown)

  // LEGACY FIELDS (v1 - kept for compatibility)
  key_highlights: text
  topics: text[]
  show_notes: text
  social_captions: jsonb
  tier: "creator" | "pro"

  created_at: timestamp
}
```

**transcripts** - Completed transcriptions
```typescript
{
  id: uuid (PK)
  job_id: uuid (FK → transcription_jobs.id)
  user_id: uuid
  transcript_text_plain: text  // ← Used as input for summary
  ...
}
```

---

## 📁 File Locations

### Task Definition
```
trigger/tasks/generate-ai-summary.ts  - Main task: classify → stream → save
```

### Utility Functions
```
lib/ai/gemini.ts                      - Gemini client, classification, streaming
lib/ai/prompts/summary-prompts.ts     - Type-specific prompt templates
```

### Server-Side Actions
```
app/actions/summaries.ts              - validateSummaryEligibility(), triggerSummaryGeneration()
```

### Frontend Components
```
components/transcripts/AISummaryPanel.tsx  - "Generate Summary" button + streaming display
```

### Database Schema
```
lib/drizzle/schema/ai-summaries.ts    - ai_summaries table definition
drizzle/migrations/XXXX_add_summary_type_and_content.sql  - Schema migration
```

### Trigger.dev Configuration
```
trigger.config.ts                     - Project configuration
trigger/index.ts                      - Task exports
```

---

## 🔧 Key Utility Functions

### Gemini Client (lib/ai/gemini.ts)
- `getGeminiClient()` - Singleton client for Gemini API
- `classifyTranscript(text: string)` - Determine transcript type (short, fast call)
- `streamSummaryGeneration(type: SummaryType, text: string)` - Stream summary with Gemini 2.5 Flash

### Prompt Engineering (lib/ai/prompts/summary-prompts.ts)
- `buildSummaryPrompt(type: SummaryType, text: string)` - Return type-specific prompt
- `MEETING_NOTES_PROMPT` - Prompt template for meetings
- `YOUTUBE_VIDEO_PROMPT` - Prompt template for videos
- `GENERAL_PROMPT` - Prompt template for general content

### Server Actions (app/actions/summaries.ts)
- `validateSummaryEligibility(transcriptId: string)` - Check: Pro tier, no existing summary, transcript complete
- `triggerSummaryGeneration(transcriptId: string)` - Call tasks.trigger() with handle tracking

### Frontend Hooks
- `useRealtimeRunWithStreams<typeof generateAISummaryTask, { gemini: string }>` - Stream AI response to UI
- `createRealtimeToken()` - Generate public token for frontend access

---

## 🎯 Progress Tracking Pattern

The task updates progress using both `metadata.set()` (discrete checkpoints) and `metadata.stream()` (continuous streaming):

```typescript
import { task, metadata, logger } from "@trigger.dev/sdk";

export const generateAISummaryTask = task({
  id: "generate-ai-summary",
  run: async (payload: GenerateAISummaryPayload) => {
    // Step 1: Load transcript (0% → 10%)
    metadata.set("progress", 0);
    metadata.set("currentStep", "Loading transcript");

    const transcript = await loadTranscript(payload.transcriptId);

    metadata.set("progress", 5);

    // Step 2: Classify (10%)
    metadata.set("currentStep", "Analyzing transcript type");
    const classification = await classifyTranscript(transcript.text);

    metadata.set("progress", 10);
    metadata.set("classification", classification);

    // Step 3: Generate summary with streaming (10% → 90%)
    metadata.set("currentStep", "Generating AI summary");

    const geminiStream = await streamSummaryGeneration(
      classification,
      transcript.text
    );

    // Stream to frontend in real-time
    const stream = await metadata.stream("gemini", geminiStream);

    let summaryContent = "";
    try {
      for await (const chunk of stream) {
        summaryContent += chunk;
        // Progress updates automatically during streaming
      }
    } catch (streamError) {
      // Client disconnects are OK - task continues in background
      logger.warn("Stream interrupted, continuing with partial content", {
        transcriptId: payload.transcriptId,
        partialLength: summaryContent.length
      });
      // Partial content will be completed and saved
      // Frontend can reconnect or view saved result later
    }

    metadata.set("progress", 90);

    // Step 4: Save to database (90% → 100%)
    metadata.set("currentStep", "Saving summary");

    await saveSummary({
      transcriptId: payload.transcriptId,
      userId: payload.userId,
      summaryType: classification,
      summaryContent,
    });

    metadata.set("progress", 100);
    metadata.set("currentStep", "Complete");

    return { success: true, summaryType: classification };
  },
});
```

**Progress Ranges**:
- 0-10%: Load transcript + classify type
- 10-90%: Stream AI summary generation
- 90-100%: Save to database

**Frontend Usage**:
```typescript
const { run, streams } = useRealtimeRunWithStreams<
  typeof generateAISummaryTask,
  { gemini: string }
>(runId, { accessToken: token });

const summaryText = streams.gemini?.join("") || "";
const progress = run?.metadata?.progress ?? 0;
const currentStep = run?.metadata?.currentStep ?? "Initializing";
```

---

## 🚨 Common Failure Points

1. **Gemini API rate limit**: 60 requests per minute limit → Exponential backoff with max 3 retries (Trigger.dev handles automatically)

2. **Classification returns invalid type**: AI outputs unexpected value → Default to "general" type with warning log

3. **Stream interruption (client disconnect)**: User closes browser mid-stream → Task continues in background, saves complete summary to database. Frontend can view saved result later. This is expected behavior, not an error.

4. **Transcript too long for context window**: Gemini 2.5 Flash has 1M token context → Truncate transcript to ~100k tokens if needed

5. **Duplicate summary generation**: User clicks button twice → Check `ai_summaries` for existing record before triggering task

6. **Summary already exists**: Return error if `transcript_id` already has summary (UNIQUE constraint)

7. **User not Pro tier**: Frontend blocks button, but validate in Server Action for security

---

## 💡 Key Architecture Principles

1. **On-Demand Generation**: Summaries are user-initiated, not automatic. User explicitly clicks button after reviewing transcript.

2. **Real-Time Streaming UX**: Uses Trigger.dev streaming instead of polling. Users see markdown sections appear live like ChatGPT.

3. **Intelligent Classification**: AI determines content type automatically, no manual user selection needed.

4. **Type-Specific Prompts**: Each classification gets optimized prompts for best summary structure.

5. **Database as Source of Truth**: Task loads transcript from DB, streams to frontend, saves final result. No session state.

6. **One Summary Per Transcript**: UNIQUE constraint on `transcript_id`. No regeneration allowed (keeps costs predictable).

7. **Pro-Tier Feature**: UI blocks Free/Creator users. Server Action validates tier via Stripe API for security.

8. **Graceful Degradation**: If classification fails, default to "general" type. Summary generation still completes.

9. **Error Isolation**: Summary failures don't affect transcripts. Transcript remains viewable even if summary fails.

---

## 📝 Quick Implementation Checklist

### Prerequisites
- [ ] Gemini API key in environment variables (`GEMINI_API_KEY`)
- [ ] `@trigger.dev/react-hooks` package installed
- [ ] `@google/generative-ai` SDK installed

### Database Setup
- [ ] Run migration to add `summary_type` and `summary_content` columns
- [ ] Test migration up/down/up cycle locally
- [ ] Verify UNIQUE constraint on `transcript_id`

### Backend Implementation
- [ ] Create `lib/ai/gemini.ts` with client and classification logic
- [ ] Create `lib/ai/prompts/summary-prompts.ts` with 3 prompt templates
- [ ] Create `trigger/tasks/generate-ai-summary.ts` with streaming task
- [ ] Export task in `trigger/index.ts`
- [ ] Create Server Actions in `app/actions/summaries.ts`

### Frontend Implementation
- [ ] Update `AISummaryPanel.tsx` with "Generate Summary" button
- [ ] Add `useRealtimeRunWithStreams` hook for streaming display
- [ ] Add loading states for classification and generation
- [ ] Add error handling with retry button

### Testing
- [ ] Test classification with meeting transcript (should return "meeting_notes")
- [ ] Test classification with YouTube transcript (should return "youtube_video")
- [ ] Test classification with podcast transcript (should return "general")
- [ ] Test streaming UX: watch sections appear in real-time
- [ ] Test browser close mid-stream: verify summary saves to DB
- [ ] Test error handling: simulate Gemini API failure, verify 3 retries
- [ ] Test Pro tier gating: verify Free users see upgrade CTA
- [ ] Test duplicate prevention: verify error if summary already exists

### Cleanup
- [ ] Remove automatic summary generation from `transcribe-audio.ts`
- [ ] Mark `trigger/tasks/generate-summary.ts` (old task) as deprecated
- [ ] Update UI to remove polling logic (replaced by streaming)

---

## 🔄 Relationship to Transcription Workflow

**Previous Behavior (v1)**:
- Transcription workflow automatically triggered summary generation
- Tier checking happened in `transcribe-audio` task
- Summaries generated for Creator/Pro users without user action

**New Behavior (v2)**:
- Transcription workflow completes without summary generation
- User manually clicks "Generate Summary" button
- Classification determines summary format automatically
- Real-time streaming shows progress (no polling)

**Migration Path**:
1. Deploy new `generate-ai-summary` task
2. Remove automatic triggering from `transcribe-audio`
3. Update UI to show "Generate Summary" button
4. Old summaries (v1) remain in database with legacy fields
5. New summaries (v2) use `summary_type` and `summary_content` fields

---

## 📚 Reference Examples

### Meeting Notes Example
```markdown
# AI Developer Accelerator Weekly Support Call - November 04

## Meeting Purpose
A weekly support call for AI developers to share progress, ask questions, and collaborate.

## Key Takeaways
- **Agent Engine is unreliable; use Cloud Run.** Google's own docs now recommend Cloud Run
- **Partner with sales trainers for project funnel.** Direct access to funded clients
- **Build public portfolio to get clients.** Most effective freelance strategy
- **ShipKit roadmap prioritizes core templates.** Nov 16 delivery target

## Topics
### ShipKit Roadmap & Community Initiatives
- Nov 16: Deliver `worker-sass` and `base-template`
- Post-Nov 16: Walkthroughs for new templates
- GitHub Management Module: 2026 priority
...
```

### YouTube Video Example
```markdown
# How to Build AI Agents with Google ADK

## Video Overview
Comprehensive tutorial on using Google's Agent Development Kit to build multi-agent systems with tool calling and orchestration.

## Key Topics
### Setting Up ADK Environment
- Installation and configuration
- API key management

### Creating Your First Agent
- Agent definition patterns
- Tool integration
...

## Main Takeaways
- ADK simplifies complex agent orchestration
- Built-in streaming and function calling
- Production-ready with Cloud Run deployment

## Target Audience
Developers with Python experience wanting to build AI agent systems

## Notable Quotes
> "The beauty of ADK is you don't need to manage state yourself - it's all handled by the framework"
```

### General Example
```markdown
# The Future of AI Development: Interview with Brandon Hancock

## Summary
Discussion covering AI development trends, tools, and strategies for building production-ready AI applications in 2025.

## Key Points
- AI coding assistants have fundamentally changed how developers work
- Cursor and Claude Code are leading the "AI-first IDE" movement
- Background job processing with Trigger.dev enables complex AI workflows
- Real-time streaming improves user experience for long-running AI tasks

## Important Moments
- Moment 1: Discussion of Vercel AI SDK streaming patterns
- Moment 2: Comparison of different AI models for specific use cases
- Moment 3: Best practices for prompt engineering in production

## Conclusion
The developer experience for building AI apps is rapidly improving, with tools like Claude Code and frameworks like Trigger.dev making it accessible to more developers.
```

---

**Last Updated**: January 2025
**Current State**: Design Phase - Documentation Complete, Implementation Pending
**Version**: 2.0 (Streaming + Classification)
