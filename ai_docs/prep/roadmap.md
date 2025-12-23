# Skribo.ai Development Roadmap

**Audio Transcription SaaS with Whisper, FFmpeg, and Trigger.dev Background Jobs**

**Status**: Production-ready template with core transcription workflow, AI summaries, and usage tracking

## 📊 Overall Progress

| Phase | Status | Description |
|-------|--------|-------------|
| Phase 0 | ✅ Complete | Project setup and environment configuration |
| Phase 1 | ✅ Complete | Landing page with transcription branding |
| Phase 2 | ✅ Complete | Supabase Auth (email + OAuth) |
| Phase 3 | ✅ Complete | Database schema (transcription jobs, transcripts, AI summaries) |
| Phase 4 | ✅ Complete | Supabase Storage buckets with RLS |
| Phase 5 | ✅ Complete | Profile page with usage stats and Stripe |
| Phase 6 | ✅ Complete | File upload with quota checking |
| Phase 7 | ✅ Complete | Trigger.dev background jobs (FFmpeg + Whisper) |
| Phase 8 | ✅ Complete | Real-time progress tracking |
| Phase 9 | ✅ Complete | Transcript viewer with tabs (Transcript/AI Summary/Q&A) |
| Phase 10 | ✅ Complete | AI summaries with classification (meeting/video/general) |
| Phase 11 | ✅ Complete | Usage quota enforcement (event-based) |
| Phase 12 | ⚠️ Partial | Admin dashboard (basic structure, features pending) |
| Phase 13 | ⚠️ In Progress | Final polish and edge cases |

**Core Features Implemented:**
- ✅ File upload (MP3, MP4, WAV, MOV, M4A)
- ✅ Background transcription with FFmpeg + Whisper API
- ✅ Multiple export formats (TXT, SRT, VTT, JSON)
- ✅ AI summaries with intelligent classification (Pro tier)
- ✅ Transcript Q&A with GPT-4.1 (Pro tier)
- ✅ Real-time progress tracking
- ✅ Usage quota enforcement (Free: 3 uploads, Creator: 50, Pro: unlimited)
- ✅ Stripe subscription management
- ✅ Event-based usage tracking

**Pending Features:**
- ⚠️ Full admin analytics and monitoring
- ⚠️ User management in admin panel
- ⚠️ Production deployment checklist

**Bonus Features Implemented (Not in Original Roadmap):**
- ✅ Transcript Q&A with GPT-4.1 (conversational interface for asking questions about transcripts)
- ✅ Tab-based transcript viewer UI (Transcript, AI Summary, Q&A tabs)
- ✅ Event-based usage tracking (better than simple counters)
- ✅ Admin role with unlimited access (for testing and demos)
- ✅ Real-time streaming for AI summaries (better UX than polling)

---

## 🚨 Phase 0: Project Setup ✅ COMPLETED

**Goal**: Prepare development environment and understand current codebase before making any changes

**⚠️ CRITICAL**: This phase must be completed before any other development work begins

**Status**: ✅ Template initialized and configured

### Run Setup Analysis

[Background: Essential first step to understand current template state and requirements]

- [✅] **REQUIRED**: Run `setup.md` using **claude-4.5-sonnet** thinking
- [✅] Review generated setup analysis and recommendations
- [✅] Verify development environment is properly configured
- [✅] Confirm all dependencies and environment variables are set
- [✅] Document any critical findings before proceeding to Phase 1

---

## Phase 1: Landing Page Updates ✅ COMPLETED

**Goal**: Update branding and value proposition for Skribo.ai transcription service

**Status**: ✅ Landing page updated with transcription focus and pricing

### Update Application Branding

[Background: Establish brand identity and communicate value proposition to potential users]

- [✅] Analyze current landing page at `app/(public)/page.tsx`
- [✅] Review `ai_docs/prep/app_pages_and_functionality.md` for landing page requirements
- [✅] Review `ai_docs/prep/wireframe.md` for layout structure
- [✅] Review `ai_docs/prep/app_name.md` for Skribo.ai branding
- [✅] Update hero section: "Fast, Affordable Transcriptions and Summaries"
- [✅] Update feature highlights: AI-powered, multiple formats, fast processing
- [✅] Add embedded pricing section with 3-tier cards (Free, Creator $19/mo, Pro $49/mo)
- [✅] Update FAQ section for transcription use case
- [✅] Update CTA buttons to "Start Transcribing Free"
- [✅] Update legal pages (`/privacy`, `/terms`) with transcription branding
- [✅] **Use Task Template**: Run `ai_docs/templates/landing_page_generator.md` for implementation guidance

---

## Phase 2: Authentication Setup ✅ COMPLETED

**Goal**: Configure authentication for Skribo.ai user access

**Status**: ✅ Supabase Auth configured with email/password and OAuth

### Configure Authentication

[Background: Ensure users can sign up and access transcription features]

- [✅] Review `ai_docs/prep/app_pages_and_functionality.md` for auth requirements
- [✅] Review `ai_docs/prep/system_architecture.md` for auth provider specifications (Email/OAuth with Google and GitHub)
- [✅] Verify existing Supabase Auth configuration is working
- [✅] Test email/password authentication flow
- [✅] Test OAuth with Google provider
- [✅] Test OAuth with GitHub provider
- [✅] Verify email verification flow works
- [✅] Verify password reset flow works
- [✅] Update auth pages branding for transcription service
- [✅] Test role-based access (member vs admin roles)

---

## Phase 3: Database Schema Replacement ✅ COMPLETED

**Goal**: Replace incompatible chat-saas schema with transcription-specific schema to enable all core features

**Status**: ✅ Complete transcription schema implemented with all tables

### Schema Replacement Strategy

[Background: Template has chat-saas schema (conversations, messages, ai_models) that is 100% incompatible with transcription workflow. Need complete replacement with job tracking, transcripts, summaries, and usage tables. Database is empty (brand new app), so dropping tables is safe.]

**Database Foundation (Complete Schema Replacement):**

[Goal: Remove all chat-saas tables and create all transcription tables in single atomic migration to establish proper data foundation]

- [ ] **Planning**: Review current schema in `lib/drizzle/schema/` folder
  - [ ] Document existing tables to remove: `ai_models`, `conversations`, `messages`, `usage_events`
  - [ ] Keep `users` table (only modify if needed, don't drop)
  - [ ] Plan new tables: `transcription_jobs`, `transcripts`, `ai_summaries`, `usage_tracking`

- [ ] **Create Migration**: Generate new Drizzle migration
  - [ ] Create `lib/drizzle/schema/transcription-jobs.ts`:
    - Fields: id (uuid), user_id (fk to users), file_name (text), original_file_url (text), status (enum: queued/processing/completed/failed), progress_percentage (integer 0-100), duration_seconds (integer), language (text), detected_language (text), timestamp_granularity (enum: segment/word), error_message (text nullable), trigger_job_id (text), created_at (timestamp), completed_at (timestamp nullable)
    - Indexes: user_id, status, created_at
  - [ ] Create `lib/drizzle/schema/transcripts.ts`:
    - Fields: id (uuid), job_id (fk to transcription_jobs, unique), user_id (fk to users), transcript_text_plain (text), transcript_srt (text), transcript_vtt (text), transcript_json (jsonb), transcript_verbose_json (jsonb), word_timestamps (jsonb), detected_language (text), duration_seconds (integer), created_at (timestamp)
    - Indexes: job_id (unique), user_id, created_at
  - [ ] Create `lib/drizzle/schema/ai-summaries.ts`:
    - Fields: id (uuid), transcript_id (fk to transcripts, unique), user_id (fk to users), key_highlights (text), topics (text array), show_notes (text), social_captions (jsonb: {twitter, linkedin, instagram}), tier (enum: creator/pro), created_at (timestamp)
    - Indexes: transcript_id (unique), user_id
  - [ ] Create `lib/drizzle/schema/usage-tracking.ts`:
    - Fields: id (uuid), user_id (fk to users), month (date), uploads_count (integer default 0), minutes_transcribed (integer default 0), storage_bytes (bigint default 0), created_at (timestamp), updated_at (timestamp)
    - Indexes: Composite unique (user_id, month)

- [ ] **Update Schema Exports**: Modify `lib/drizzle/schema/index.ts`
  - [ ] Remove exports for chat-saas tables: conversations, messages, ai_models, usage_events
  - [ ] Add exports for new tables: transcription-jobs, transcripts, ai-summaries, usage-tracking
  - [ ] Keep users table export

- [ ] **Generate Migration**: Run `npm run db:generate` to create migration file
  - [ ] Review generated SQL to confirm it drops old tables and creates new tables
  - [ ] Verify migration includes all indexes and foreign keys

- [ ] **Test Migration**: Run migration on local database
  - [ ] Check migration status: `npm run db:status`
  - [ ] Run migration: `npm run db:migrate`
  - [ ] Verify all new tables exist with correct schema
  - [ ] Test rollback: `npm run db:rollback`
  - [ ] Re-run migration to confirm it's repeatable

- [ ] **Seed Test Data**: Create seed script for development
  - [ ] Add sample user with admin role
  - [ ] Add sample transcription job (completed status)
  - [ ] Add sample transcript with all export formats
  - [ ] Add sample AI summary
  - [ ] Add sample usage tracking record

---

## Phase 4: Supabase Storage Setup ✅ COMPLETED

**Goal**: Configure storage buckets for file uploads and transcript exports

**Status**: ✅ Storage buckets configured with RLS policies

### Storage Infrastructure

[Background: Need separate buckets for large media uploads vs smaller transcript exports, with proper access policies]

- [ ] **Storage Bucket Configuration**:
  - [ ] Review `scripts/setup-storage.ts` for storage setup patterns
  - [ ] Create `media-uploads` bucket:
    - Public: false (users access via signed URLs)
    - File size limits by tier: Free (15min≈150MB), Creator (60min≈600MB), Pro (120min≈1.2GB)
    - Allowed file types: MP3, MP4, WAV, MOV, M4A
    - Path structure: `uploads/{user_id}/{job_id}/original.{ext}`
  - [ ] Create `transcripts` bucket:
    - Public: false (users access via signed URLs)
    - Path structure: `transcripts/{job_id}/transcript.{format}`
  - [ ] Set up bucket lifecycle policies:
    - Delete failed uploads after 7 days (cleanup orphaned files)
  - [ ] Create storage access policies:
    - Users can upload to their own user_id folder in media-uploads
    - Users can read their own transcripts in transcripts bucket
    - Admins can access all buckets

- [ ] **Storage Utilities**: Create `lib/storage.ts`
  - [ ] Function: `uploadMediaFile(userId, jobId, file)` - Upload to media-uploads bucket with validation
  - [ ] Function: `getSignedUploadUrl(userId, jobId, filename)` - Generate signed upload URL (1 hour expiry)
  - [ ] Function: `getSignedDownloadUrl(jobId, format)` - Generate signed download URL for transcript exports
  - [ ] Function: `deleteJobFiles(jobId)` - Delete all files associated with job (media + transcripts)
  - [ ] Validation: File type checking (MP3, MP4, WAV, MOV, M4A)
  - [ ] Validation: File size checking based on user tier

- [ ] **Run Storage Setup**: Execute storage configuration script
  - [ ] Local: `npm run storage:setup`
  - [ ] Verify buckets created in Supabase dashboard
  - [ ] Test file upload with signed URL
  - [ ] Test file download with signed URL
  - [ ] Test access policies (users can only access own files)

---

## Phase 5: Profile & Subscription Management ✅ COMPLETED

**Goal**: Enable users to manage account settings, view usage stats, and upgrade subscription tiers

**Status**: ✅ Profile page with usage stats and Stripe integration

### Profile Page Implementation

[Background: Users need self-service profile management and subscription upgrades before they start uploading]

**Navigation Update:**

[Goal: Add Profile link to main navigation so users can access account settings]

- [ ] Update sidebar navigation in `components/navigation/` to include "Profile" link
- [ ] Add icon for Profile (user icon)
- [ ] Verify navigation highlights active route

**Profile Page Structure:**

[Goal: Build card-based profile layout showing account info, billing, usage, and subscription plans]

- [ ] Create `app/(protected)/profile/page.tsx` with 4-card layout (2x2 grid on desktop, 1 column on mobile)

**Account Information Card:**

[Goal: Allow users to update profile details and manage account security]

- [ ] Build Account Information card:
  - [ ] Avatar upload component (Supabase Storage integration)
  - [ ] Display name input field
  - [ ] Email display (read-only with verification status badge)
  - [ ] "Change Password" button (opens modal with password update form)
  - [ ] "Delete Account" button (opens confirmation modal with warning)

**Billing Management Card:**

[Goal: Show subscription status and provide access to Stripe Customer Portal]

- [ ] Build Billing Management card:
  - [ ] Display current plan: Plan name (Free/Creator/Pro), monthly cost, renewal date
  - [ ] Query Stripe API to get subscription status (use existing Stripe integration patterns)
  - [ ] Display payment method: Card brand and last 4 digits
  - [ ] "Manage Billing" button → Opens Stripe Customer Portal (external)
  - [ ] Handle Free tier display (no payment method shown)

**Usage Statistics Card:**

[Goal: Display real-time usage metrics so users understand quota consumption]

- [ ] Build Usage Statistics card:
  - [ ] Query `usage_tracking` table for current month
  - [ ] Display uploads used with progress bar: "12/50 uploads" with percentage filled
  - [ ] Display minutes transcribed: Total count for current month
  - [ ] Display storage used with progress bar: "1.2/5 GB" with percentage
  - [ ] Add upgrade prompt if approaching limits (80%+ usage)

**Subscription Plans Card:**

[Goal: Show all available tiers and enable self-service upgrades]

- [ ] Build Subscription Plans card with 3 tier cards:
  - [ ] **Free Tier Card**:
    - Features: 3 uploads/mo, 15 min max, segment timestamps, TXT/SRT exports
    - Button: "Current Plan ✓" if active, "Start Free" if not active
  - [ ] **Creator Tier Card ($19/mo)**:
    - Badge: "Most Popular"
    - Features: 50 uploads/mo, 60 min max, word-level timestamps, GPT-5 summaries, VTT/JSON exports
    - Button: "Current Plan ✓" if active, "Upgrade" → Stripe Checkout if not active
  - [ ] **Pro Tier Card ($49/mo)**:
    - Features: Unlimited uploads, 120 min max, full AI summaries, all export formats
    - Button: "Current Plan ✓" if active, "Upgrade" → Stripe Checkout if not active

**Data Layer:**

[Goal: Create server-side functions to fetch profile data and handle updates]

- [ ] Create `lib/profile.ts`:
  - [ ] Function: `getUserProfile(userId)` - Get user data from users table
  - [ ] Function: `getUserUsageStats(userId)` - Get current month usage from usage_tracking table
  - [ ] Function: `getSubscriptionStatus(userId)` - Query Stripe API for subscription details

**Mutations:**

[Goal: Enable profile updates and account deletion through server actions]

- [ ] Create `app/actions/profile.ts`:
  - [ ] Action: `updateProfile(userId, data)` - Update full_name, avatar in users table
  - [ ] Action: `changePassword(userId, oldPassword, newPassword)` - Use Supabase Auth API
  - [ ] Action: `deleteAccount(userId)` - Soft delete or hard delete with confirmation
  - [ ] Action: `createCheckoutSession(userId, priceId)` - Create Stripe Checkout session for upgrades
  - [ ] Validation: Require authentication for all actions
  - [ ] Error handling: User-friendly error messages

**Integration & Testing:**

[Goal: Ensure profile page works end-to-end with all data sources]

- [ ] Connect UI components to server actions
- [ ] Test profile updates (name, avatar, password)
- [ ] Test subscription status display for each tier (Free, Creator, Pro)
- [ ] Test usage stats display with different quota levels
- [ ] Test Stripe Checkout flow (upgrade from Free → Creator → Pro)
- [ ] Test Stripe Customer Portal access
- [ ] Test invoice history display
- [ ] Test account deletion flow with confirmation
- [ ] Verify mobile responsive design

---

## Phase 6: File Upload & Job Creation ✅ COMPLETED

**Goal**: Enable users to upload media files and create background transcription jobs

**Status**: ✅ Upload workflow with quota checking and job creation

### Upload Infrastructure

[Background: This is the entry point for the core workflow - users upload files which trigger background processing]

**Upload UI Component:**

[Goal: Build intuitive drag-and-drop upload interface with real-time validation]

- [ ] Create `components/transcripts/UploadZone.tsx`:
  - [ ] Drag-and-drop file upload area (large dropzone at top of transcripts page)
  - [ ] Click to browse file picker as alternative to drag-and-drop
  - [ ] Display supported formats: "MP3, MP4, WAV, MOV, M4A"
  - [ ] Display max duration based on user tier (query Stripe API): Free (15 min), Creator (60 min), Pro (120 min)
  - [ ] Show quota display: "You have X uploads remaining this month" with progress bar
  - [ ] Language selection dropdown: Auto-detect (default) or manual (English, Spanish, French, German, etc.)
  - [ ] Timestamp precision checkbox: Segment-level (Free) vs Word-level (Creator/Pro) - disabled if not available for tier
  - [ ] File preview before upload: Show filename, size, estimated duration
  - [ ] Upload progress bar during file transfer to Supabase Storage
  - [ ] Error states: File too large, invalid format, quota exceeded, upload failed

**Quota Checking:**

[Goal: Enforce tier limits before allowing uploads to prevent wasted processing]

- [ ] Create `lib/quota.ts`:
  - [ ] Function: `getUserQuotaStatus(userId)` - Get current month usage and tier limits
  - [ ] Function: `checkUploadAllowed(userId, fileDuration)` - Validate quota and file duration against tier
  - [ ] Function: `incrementUploadCount(userId)` - Increment uploads_count in usage_tracking table
  - [ ] Logic: Free tier = 3 uploads/month, Creator = 50, Pro = unlimited
  - [ ] Logic: File duration limits: Free = 15 min max, Creator = 60 min, Pro = 120 min
  - [ ] Return user-friendly error messages if quota exceeded or file too long

**File Upload & Validation:**

[Goal: Securely upload files to Supabase Storage with proper validation]

- [ ] Create `lib/upload.ts`:
  - [ ] Function: `validateFile(file)` - Check file type (MP3, MP4, WAV, MOV, M4A) and size
  - [ ] Function: `estimateFileDuration(file)` - Estimate duration based on file size and type (1 min ≈ 10MB for MP3)
  - [ ] Function: `uploadToStorage(userId, jobId, file)` - Upload to Supabase Storage media-uploads bucket
  - [ ] Generate unique job ID before upload
  - [ ] Use file path: `uploads/{user_id}/{job_id}/original.{ext}`
  - [ ] Show upload progress to user
  - [ ] Handle upload errors: Network failures, storage quota exceeded, invalid credentials

**Job Creation:**

[Goal: Create database record and trigger Trigger.dev background job after successful upload]

- [ ] Create `lib/jobs.ts`:
  - [ ] Function: `createTranscriptionJob(userId, jobData)` - Create record in transcription_jobs table
  - [ ] Fields: user_id, file_name, original_file_url (Supabase Storage path), status='queued', progress_percentage=0, language, timestamp_granularity
  - [ ] Function: `triggerBackgroundJob(jobId)` - Call Trigger.dev API to start processing (placeholder for now, will implement in Phase 7)
  - [ ] Return job ID to frontend

**Transcripts List Page:**

[Goal: Create main page with upload area and job list in single view]

- [ ] Create `app/(protected)/transcripts/page.tsx` (or `app/(protected)/app/page.tsx` as main route):
  - [ ] Top section: UploadZone component
  - [ ] Middle section: Active/Processing jobs with real-time status (will add polling in Phase 8)
  - [ ] Bottom section: Completed transcriptions list with filters
  - [ ] Empty state: "Upload your first file to get started" with prominent upload area
  - [ ] Filters bar: Status (All/Completed/Failed), Sort (Newest/Oldest), Date range picker
  - [ ] Pagination: Show 20 transcriptions per page with "Load More" button

**Job List Display:**

[Goal: Show all user's transcription jobs with status and actions]

- [ ] Query `transcription_jobs` table for user's jobs (most recent first)
- [ ] Display job cards with:
  - [ ] File name, upload date/time, status badge (queued/processing/completed/failed)
  - [ ] For active jobs: Progress percentage, current step (will add in Phase 8)
  - [ ] For completed jobs: Duration, detected language, "View Transcript" button
  - [ ] For failed jobs: Error message, "Retry" button
  - [ ] Actions: "Download" dropdown (TXT/SRT/VTT/JSON), "Delete" button

**Server Actions:**

[Goal: Create server-side operations for upload workflow]

- [ ] Create `app/actions/transcriptions.ts`:
  - [ ] Action: `initiateUpload(userId, fileData, config)` - Check quota, validate file, create job record
  - [ ] Action: `getUploadUrl(userId, jobId, filename)` - Generate signed Supabase Storage upload URL
  - [ ] Action: `completeUpload(jobId, fileUrl)` - Update job with file URL, trigger background job
  - [ ] Action: `getUserJobs(userId, filters)` - Get user's transcription jobs with filtering/pagination
  - [ ] Action: `deleteJob(userId, jobId)` - Delete job record and associated files from storage
  - [ ] Action: `retryJob(userId, jobId)` - Create new job with same file (for failed jobs)

**Integration & Testing:**

[Goal: Ensure complete upload workflow works end-to-end]

- [ ] Connect UploadZone to server actions
- [ ] Test file upload flow: Select file → Validate → Upload → Create job
- [ ] Test quota enforcement: Block uploads when limit reached
- [ ] Test file validation: Reject invalid formats, files too large/long
- [ ] Test tier-based limits: Free (15 min), Creator (60 min), Pro (120 min)
- [ ] Test job list display with multiple jobs in different states
- [ ] Test delete job functionality (removes from database and storage)
- [ ] Test retry job functionality for failed jobs
- [ ] Test upgrade prompt when approaching quota limits
- [ ] Verify mobile responsive design

---

## Phase 7: Trigger.dev Background Job Integration ✅ COMPLETED

**Goal**: Set up Trigger.dev infrastructure for async transcription processing with FFmpeg and Whisper API

**Status**: ✅ Complete transcription pipeline with FFmpeg, chunking, and Whisper API

### Trigger.dev Setup

[Background: Next.js serverless functions timeout at 10 seconds, but transcription takes 5-15 minutes for long files. Trigger.dev provides long-running job execution environment.]

**Trigger.dev Installation & Configuration:**

[Goal: Install Trigger.dev SDK and configure project for background job execution]

- [ ] Install Trigger.dev packages: `npm install @trigger.dev/sdk @trigger.dev/nextjs`
- [ ] Create Trigger.dev account at https://trigger.dev (if not already created)
- [ ] Create new project in Trigger.dev dashboard
- [ ] Add environment variables to `.env.local`:
  - [ ] `TRIGGER_API_KEY` - API key from Trigger.dev dashboard
  - [ ] `TRIGGER_API_URL` - Trigger.dev API endpoint
  - [ ] `NEXT_PUBLIC_TRIGGER_PUBLIC_KEY` - Public API key for frontend
- [ ] Create `trigger/client.ts` - Initialize Trigger.dev client
- [ ] Add Trigger.dev API route: `app/api/trigger/route.ts` (for webhooks)

**FFmpeg Setup:**

[Goal: Configure FFmpeg for audio extraction and chunking in Trigger.dev environment]

- [ ] Research FFmpeg availability in Trigger.dev Cloud Run environment
- [ ] Install FFmpeg binary if needed (or use pre-installed version)
- [ ] Create `trigger/utils/ffmpeg.ts`:
  - [ ] Function: `extractAudioFromVideo(fileUrl)` - Extract audio track from video files (MP4, MOV)
  - [ ] Function: `getAudioDuration(fileUrl)` - Get exact audio duration in seconds
  - [ ] Function: `splitAudioIntoChunks(fileUrl, chunkDurationSeconds)` - Split audio into segments for Whisper API (25MB limit ≈ 25 minutes of audio)
  - [ ] Handle various audio codecs and formats
  - [ ] Output format: WAV or M4A for Whisper compatibility
  - [ ] Memory-efficient processing (stream instead of loading entire file)

**Whisper API Integration:**

[Goal: Integrate OpenAI Whisper API for transcription with word-level timestamps]

- [ ] Install OpenAI SDK: `npm install openai`
- [ ] Add environment variable: `OPENAI_API_KEY`
- [ ] Create `trigger/utils/whisper.ts`:
  - [ ] Function: `transcribeAudioChunk(audioUrl, language, timestampGranularity)` - Call Whisper API for single chunk
  - [ ] Request word-level timestamps if user tier is Creator/Pro
  - [ ] Request segment-level timestamps for Free tier
  - [ ] Handle language parameter: 'auto' for auto-detect or specific language code
  - [ ] Handle API rate limits: Implement exponential backoff retry logic
  - [ ] Parse Whisper API response: Extract text, timestamps, detected language
  - [ ] Return structured data: { text, segments, words, language }

**Export Format Generation:**

[Goal: Pre-generate all export formats during transcription for instant downloads]

- [ ] Create `trigger/utils/exports.ts`:
  - [ ] Function: `generatePlainText(segments)` - Concatenate all transcript text with newlines
  - [ ] Function: `generateSRT(segments)` - SRT subtitle format with timestamps
  - [ ] Function: `generateVTT(segments)` - VTT subtitle format (WebVTT standard)
  - [ ] Function: `generateJSON(transcriptData)` - JSON format with segments and words
  - [ ] Function: `generateVerboseJSON(transcriptData)` - Verbose JSON with full metadata (Pro tier only)
  - [ ] SRT format: Sequential numbering, timestamp format: `00:00:01,000 --> 00:00:05,000`
  - [ ] VTT format: WEBVTT header, timestamp format: `00:00:01.000 --> 00:00:05.000`

**Main Transcription Job:**

[Goal: Create Trigger.dev job workflow that orchestrates entire transcription pipeline]

- [ ] Create `trigger/transcription.ts`:
  - [ ] Job name: `transcription-job`
  - [ ] Trigger: Manual (called from Next.js server action)
  - [ ] Input: { jobId, userId, fileUrl, language, timestampGranularity }

  - [ ] **Step 1: File Validation (0-10% progress)**:
    - [ ] Download file from Supabase Storage
    - [ ] Verify file format is valid (MP3, MP4, WAV, MOV, M4A)
    - [ ] Check file integrity (not corrupted)
    - [ ] Get exact audio duration using FFmpeg
    - [ ] Update job progress: 10%, status: 'processing'
    - [ ] If validation fails: Set status='failed', error_message, return early

  - [ ] **Step 2: Audio Extraction (10-30% progress)**:
    - [ ] If video file (MP4, MOV): Extract audio track using FFmpeg
    - [ ] If audio file (MP3, WAV, M4A): Use directly
    - [ ] Convert to Whisper-compatible format (WAV/M4A)
    - [ ] Update job progress: 30%
    - [ ] If extraction fails: Set status='failed', error_message, return early

  - [ ] **Step 3: Audio Chunking (30-40% progress)**:
    - [ ] Check if file is under Whisper API 25MB limit (≈ 25 minutes)
    - [ ] If over limit: Split into chunks using FFmpeg (10-minute chunks recommended)
    - [ ] If under limit: Use single chunk
    - [ ] Upload chunks to temporary storage or keep in memory
    - [ ] Update job progress: 40%

  - [ ] **Step 4: Whisper Transcription (40-90% progress)**:
    - [ ] Process all chunks in parallel (regardless of tier for consistent speed)
    - [ ] For each chunk: Call Whisper API with language and timestamp_granularity settings
    - [ ] Handle rate limiting: Max 50 requests/minute, implement backoff
    - [ ] Update progress incrementally: 40% → 90% as chunks complete
    - [ ] Collect all chunk results: { text, segments, words, detected_language }
    - [ ] If transcription fails: Retry with exponential backoff (max 3 retries), then fail job

  - [ ] **Step 5: Result Merging & Export Generation (90-95% progress)**:
    - [ ] Merge all chunk transcripts in order
    - [ ] Adjust timestamps to account for chunk positions
    - [ ] Combine word-level timestamps (if requested)
    - [ ] Generate all export formats: TXT, SRT, VTT, JSON, verbose_json
    - [ ] Save transcript to `transcripts` table with all formats
    - [ ] Update job progress: 95%, mark as completed_at
    - [ ] Update job status: 'completed'

  - [ ] **Step 6: Trigger GPT-5 Summary Job (95-100% progress)**:
    - [ ] If user tier is Creator or Pro: Trigger separate GPT-5 summary job (async, don't wait)
    - [ ] If user tier is Free: Skip this step
    - [ ] Update job progress: 100%
    - [ ] Transcript is now viewable by user (summary will load separately)

  - [ ] **Error Handling**:
    - [ ] Catch all errors at each step
    - [ ] Update job with status='failed' and user-friendly error_message
    - [ ] Log detailed error for debugging in Trigger.dev dashboard
    - [ ] Clean up temporary files/chunks on error
    - [ ] Don't retry non-retryable errors (invalid file, quota exceeded)

**Job Status Webhook:**

[Goal: Allow Trigger.dev to update job progress in database via webhook callbacks]

- [ ] Create `app/api/webhooks/trigger/route.ts`:
  - [ ] Accept POST requests from Trigger.dev with job status updates
  - [ ] Verify webhook signature for security
  - [ ] Parse payload: { jobId, status, progress_percentage, error_message }
  - [ ] Update `transcription_jobs` table with new status/progress
  - [ ] Return 200 OK to acknowledge webhook
  - [ ] Handle duplicate webhooks (idempotent updates)

**Job Orchestration from Next.js:**

[Goal: Trigger background jobs from Next.js server actions after file upload]

- [ ] Update `lib/jobs.ts`:
  - [ ] Function: `triggerBackgroundJob(jobId)` - Actually call Trigger.dev API now (was placeholder in Phase 6)
  - [ ] Use Trigger.dev client to start `transcription-job`
  - [ ] Pass job parameters: jobId, userId, fileUrl, language, timestampGranularity
  - [ ] Store Trigger.dev job ID in `transcription_jobs.trigger_job_id` field
  - [ ] Handle Trigger.dev API errors: Network failures, invalid parameters
  - [ ] Return success/failure status to frontend

**Testing & Integration:**

[Goal: Ensure background job pipeline works end-to-end with all steps]

- [ ] Test with small audio file (2-3 min MP3):
  - [ ] Upload file via UI
  - [ ] Verify Trigger.dev job starts
  - [ ] Monitor job progress in Trigger.dev dashboard
  - [ ] Verify all 6 steps execute successfully
  - [ ] Verify transcript saved to database with all formats
  - [ ] Verify job status updates to 'completed'
- [ ] Test with video file (5 min MP4):
  - [ ] Verify FFmpeg extracts audio correctly
  - [ ] Verify transcription completes
- [ ] Test with long audio file (30 min MP3):
  - [ ] Verify chunking works (splits into segments)
  - [ ] Verify parallel Whisper API calls
  - [ ] Verify chunks merge correctly with adjusted timestamps
- [ ] Test error scenarios:
  - [ ] Invalid file format → Job fails at step 1 with clear error
  - [ ] Corrupted file → Job fails at step 1
  - [ ] Whisper API rate limit → Job retries and succeeds
  - [ ] Whisper API failure → Job fails after 3 retries with error message
- [ ] Test tier-based features:
  - [ ] Free tier: Segment-level timestamps only
  - [ ] Creator tier: Word-level timestamps, GPT-5 job triggers
  - [ ] Pro tier: Word-level timestamps, verbose JSON, GPT-5 job triggers
- [ ] Monitor costs:
  - [ ] Track Whisper API usage in Trigger.dev logs
  - [ ] Estimate cost per minute transcribed (~$0.006/min)
  - [ ] Verify chunking strategy is cost-efficient

---

## Phase 8: Real-Time Progress Tracking ✅ COMPLETED

**Goal**: Display live job progress updates to users while transcription is processing

**Status**: ✅ Real-time progress with database polling and status updates

### Progress Tracking UI

[Background: Jobs take 5-15 minutes to complete. Users need to see real-time progress so they know the system is working and can estimate completion time.]

**Active Jobs Section:**

[Goal: Show processing jobs with real-time progress bars and status updates]

- [ ] Update `app/(protected)/transcripts/page.tsx`:
  - [ ] Add "Active/Processing Jobs" section above completed transcriptions list
  - [ ] Display separate section for jobs with status 'queued' or 'processing'
  - [ ] Job cards show:
    - [ ] File name and upload timestamp
    - [ ] Overall progress bar: 0-100% based on progress_percentage field
    - [ ] Current processing step with icon/indicator:
      - 0-10%: "File validation" with spinner
      - 10-30%: "Audio extraction" with spinner
      - 30-40%: "Audio chunking" with spinner
      - 40-90%: "Whisper transcription" with spinner
      - 90-95%: "Generating exports" with spinner
      - 95-100%: "Creating AI summary" with spinner (if Creator/Pro tier)
    - [ ] Estimated time remaining (calculate based on file duration and current progress)
    - [ ] "View Transcript" button (disabled until step 5 completes, enabled after for immediate access)
  - [ ] Empty state for active jobs: "No jobs currently processing"

**Database Polling:**

[Goal: Fetch latest job status from database every 3 seconds for real-time updates]

- [ ] Implement client-side polling in `app/(protected)/transcripts/page.tsx`:
  - [ ] Use `useEffect` hook to set up polling interval: 3 seconds
  - [ ] Query `transcription_jobs` table for user's active jobs (status='queued' or 'processing')
  - [ ] Update UI state with latest progress_percentage and status
  - [ ] Stop polling when all jobs complete (status='completed' or 'failed')
  - [ ] Resume polling if user navigates back to page with active jobs
  - [ ] Clean up interval on component unmount

**Progress Updates from Trigger.dev:**

[Goal: Ensure Trigger.dev job updates database with progress at each step]

- [ ] Update `trigger/transcription.ts` job to update progress:
  - [ ] After each step completes: Call webhook or update database directly
  - [ ] Use `transcription_jobs` table update: `progress_percentage` field
  - [ ] Ensure updates are atomic (don't skip progress values)
  - [ ] Include current step context in updates (for displaying "Current step: ...")

**Estimated Time Remaining:**

[Goal: Show users approximately how long until transcription completes]

- [ ] Create `lib/progress.ts`:
  - [ ] Function: `estimateTimeRemaining(fileDuration, currentProgress)` - Calculate estimated time
  - [ ] Logic: Average processing time is ~0.3x file duration (10 min file = 3 min processing)
  - [ ] Adjust estimate based on current progress: If 50% complete, remaining time = (100-50)% \* total estimated time
  - [ ] Return user-friendly format: "~3 minutes remaining", "~45 seconds remaining"
  - [ ] Handle edge cases: Nearly complete (show "Almost done"), just started (show "Estimating...")

**Queued Jobs Display:**

[Goal: Show users their position in queue for jobs not yet started]

- [ ] For jobs with status='queued':
  - [ ] Display "Queued" badge instead of progress bar
  - [ ] Show position in queue: "Position #2 in queue" (count jobs with earlier created_at)
  - [ ] Show estimated wait time before processing starts
  - [ ] Update position as other jobs complete

**Progress Persistence:**

[Goal: Ensure progress persists when user navigates away from page]

- [ ] Verify progress is stored in database (transcription_jobs.progress_percentage)
- [ ] When user returns to transcripts page: Resume polling and display current progress
- [ ] Progress bar shows accurate position based on database state
- [ ] No progress is lost due to page navigation or browser refresh

**Error State Display:**

[Goal: Show clear error messages for failed jobs with actionable next steps]

- [ ] For jobs with status='failed':
  - [ ] Display "Failed" badge with error icon
  - [ ] Show user-friendly error_message from database: "File format unsupported", "Transcription service unavailable", "File too large"
  - [ ] Provide "Retry" button to create new job with same file
  - [ ] Provide "Delete" button to remove failed job from list
  - [ ] Suggest solutions: "Try a different format (MP3)" or "Contact support if issue persists"

**Completed Jobs Transition:**

[Goal: Smoothly transition jobs from active to completed when processing finishes]

- [ ] When polling detects status change to 'completed':
  - [ ] Show completion animation or toast notification
  - [ ] Move job from "Active" section to "Completed" section
  - [ ] Enable "View Transcript" button immediately
  - [ ] Show "Download" dropdown for export formats
  - [ ] Continue polling for GPT-5 summary completion (if applicable, Creator/Pro tiers)

**Testing & Integration:**

[Goal: Ensure progress tracking works reliably in all scenarios]

- [ ] Test progress updates with various file lengths:
  - [ ] Short file (2 min): Progress updates every few seconds
  - [ ] Medium file (15 min): Progress updates throughout processing
  - [ ] Long file (60 min): Progress updates consistently
- [ ] Test polling behavior:
  - [ ] Verify polling starts when active jobs exist
  - [ ] Verify polling stops when no active jobs
  - [ ] Verify polling resumes when returning to page
  - [ ] Verify no memory leaks from polling intervals
- [ ] Test queue display:
  - [ ] Upload multiple files, verify queue positions update correctly
  - [ ] Verify estimated wait time is reasonable
- [ ] Test navigation persistence:
  - [ ] Start upload, navigate to profile, return to transcripts
  - [ ] Verify progress bar shows correct position
  - [ ] Verify job didn't restart or lose progress
- [ ] Test error states:
  - [ ] Trigger failed job (upload invalid file)
  - [ ] Verify error message displays clearly
  - [ ] Test retry functionality
- [ ] Test completion transition:
  - [ ] Verify job moves to completed section smoothly
  - [ ] Verify "View Transcript" button becomes active
  - [ ] Verify download options appear

---

## Phase 9: Transcript Viewing & Export ✅ COMPLETED

**Goal**: Enable users to view completed transcriptions and download in multiple formats

**Status**: ✅ Transcript viewer with tab-based UI (Transcript, AI Summary, Q&A) and export downloads

### Transcript Viewer Page

[Background: Users need to read transcripts, copy text, and export in various formats for their content repurposing workflow]

**Transcript Viewer Route:**

[Goal: Create detail page for individual transcript viewing]

- [ ] Create `app/(protected)/transcripts/[transcriptId]/page.tsx`:
  - [ ] Get transcriptId from URL params
  - [ ] Fetch transcript data from `transcripts` table
  - [ ] Fetch AI summary from `ai_summaries` table (if exists)
  - [ ] Verify user owns this transcript (security check)
  - [ ] Redirect to /unauthorized if user doesn't own transcript

**Transcript Header:**

[Goal: Display metadata and provide quick actions for transcript]

- [ ] Build header section:
  - [ ] File name display (from original transcription_jobs.file_name)
  - [ ] Transcription metadata: Date, duration, detected language
  - [ ] "← Back to Transcripts" link to return to main page
  - [ ] Action buttons: "Download ▼" dropdown, "Copy All" button, "Delete" button

**Transcript Content (Left Column 70%):**

[Goal: Display timestamped transcript text with copy functionality]

- [ ] Build transcript content area:
  - [ ] Display transcript with timestamps based on granularity:
    - [ ] Segment-level: `[00:00:00] Welcome to episode 42...` (paragraph blocks)
    - [ ] Word-level: Individual words with timestamps in hover tooltip
  - [ ] Format text in readable blocks/paragraphs
  - [ ] Add vertical scrolling for long transcripts
  - [ ] "Copy All to Clipboard" button at top:
    - [ ] Copies entire plain text transcript
    - [ ] Shows success toast: "Transcript copied to clipboard"
  - [ ] Monospace or readable font for transcript text
  - [ ] Highlight timestamps in subtle color

**Export Download Functionality:**

[Goal: Allow users to download transcripts in all supported formats]

- [ ] Build download dropdown menu:
  - [ ] TXT - Plain text format (all tiers)
  - [ ] SRT - Subtitle format (all tiers)
  - [ ] VTT - WebVTT subtitle format (Creator/Pro tiers)
  - [ ] JSON - Structured JSON (Creator/Pro tiers)
  - [ ] verbose_json - Verbose JSON with metadata (Pro tier only)
  - [ ] "Download All Formats" - ZIP file with all available formats
  - [ ] Disable unavailable formats for current tier with upgrade tooltip

- [ ] Create download API route `app/api/download/[transcriptId]/[format]/route.ts`:
  - [ ] Verify user owns transcript
  - [ ] Fetch transcript from database
  - [ ] Retrieve requested format from database (pre-generated in Phase 7)
  - [ ] Set proper content-type headers:
    - TXT: `text/plain`
    - SRT: `text/srt`
    - VTT: `text/vtt`
    - JSON: `application/json`
  - [ ] Set content-disposition header: `attachment; filename="transcript.{ext}"`
  - [ ] Return file content for download
  - [ ] Handle "Download All" by creating ZIP file on-the-fly

**AI Summary Panel (Right Column 30%):**

[Goal: Display GPT-5 generated summary for Creator/Pro users]

- [ ] Build AI summary section:
  - [ ] **Loading State** (if summary still generating):
    - [ ] Spinner icon with "Generating summary..."
    - [ ] Message: "Your summary will appear here in about 30 seconds"
    - [ ] Poll database every 3 seconds for summary completion

  - [ ] **Completed State** (when ai_summaries record exists):
    - [ ] **Key Highlights Section**:
      - [ ] Display key_highlights as bullet list
      - [ ] "Copy" button to copy highlights to clipboard
    - [ ] **Topics Section**:
      - [ ] Display topics as hashtags: #AI #Podcasting #Content
      - [ ] "Copy" button to copy topics
    - [ ] **Show Notes Section**:
      - [ ] Display show_notes as formatted text
      - [ ] "Copy" button to copy show notes
    - [ ] **Social Captions Section**:
      - [ ] Twitter caption with "Copy" button
      - [ ] LinkedIn caption with "Copy" button
      - [ ] Instagram caption with "Copy" button
      - [ ] Character count indicator for each platform

  - [ ] **Free Tier Upgrade Prompt**:
    - [ ] If user is on Free tier: Show upgrade prompt instead of summary
    - [ ] Message: "Upgrade to Creator for AI-generated summaries!"
    - [ ] "Upgrade Now" button → Stripe Checkout

**Delete Transcript Functionality:**

[Goal: Allow users to delete transcripts they no longer need]

- [ ] Add delete confirmation modal:
  - [ ] Warning: "Are you sure you want to delete this transcript?"
  - [ ] Note: "This will delete the transcript, all export formats, and AI summary. This cannot be undone."
  - [ ] Buttons: "Cancel" and "Delete Permanently"

- [ ] Create delete server action in `app/actions/transcriptions.ts`:
  - [ ] Action: `deleteTranscript(userId, transcriptId)`
  - [ ] Verify user owns transcript
  - [ ] Delete record from `ai_summaries` table (if exists)
  - [ ] Delete record from `transcripts` table
  - [ ] Delete record from `transcription_jobs` table
  - [ ] Delete files from Supabase Storage (media-uploads and transcripts buckets)
  - [ ] Decrement usage tracking counts (uploads_count, minutes_transcribed, storage_bytes)
  - [ ] Redirect to /app/transcripts after successful deletion

**Copy to Clipboard Functionality:**

[Goal: Enable quick copying of transcript sections for content repurposing]

- [ ] Implement clipboard copy for all sections:
  - [ ] Use browser Clipboard API: `navigator.clipboard.writeText()`
  - [ ] Show success toast notification: "Copied to clipboard"
  - [ ] Handle copy failures (permissions denied): Show error toast
  - [ ] Copy buttons for: Full transcript, highlights, topics, show notes, each social caption

**Data Layer:**

[Goal: Fetch transcript and summary data from database]

- [ ] Create `lib/transcripts.ts`:
  - [ ] Function: `getTranscript(transcriptId, userId)` - Get transcript with ownership verification
  - [ ] Function: `getAISummary(transcriptId, userId)` - Get AI summary if exists
  - [ ] Function: `getTranscriptExport(transcriptId, format)` - Get specific export format
  - [ ] Join queries: Get transcript + job + summary in single query for efficiency

**Integration & Testing:**

[Goal: Ensure transcript viewer works seamlessly with all features]

- [ ] Test transcript display:
  - [ ] Short transcript (2 min): Displays correctly
  - [ ] Long transcript (60 min): Scrolls properly, readable
  - [ ] Segment-level timestamps: Formatted as blocks
  - [ ] Word-level timestamps: Accessible via hover or inline display
- [ ] Test download functionality:
  - [ ] Download TXT: Plain text file downloads correctly
  - [ ] Download SRT: Subtitle file with proper formatting
  - [ ] Download VTT: WebVTT file with correct structure
  - [ ] Download JSON: Valid JSON with all data
  - [ ] Download verbose_json (Pro): Full metadata included
  - [ ] Download All: ZIP file contains all available formats
  - [ ] Tier restrictions: VTT/JSON disabled for Free tier
- [ ] Test AI summary display:
  - [ ] Free tier: Shows upgrade prompt
  - [ ] Creator tier: Shows summary sections
  - [ ] Pro tier: Shows full summary with all sections
  - [ ] Loading state: Displays while summary generates
  - [ ] Summary appears automatically when generation completes
- [ ] Test copy functionality:
  - [ ] Copy full transcript: Entire text copied
  - [ ] Copy highlights: Bullet list copied
  - [ ] Copy social captions: Each platform caption copied individually
  - [ ] Success toast appears for each copy action
- [ ] Test delete functionality:
  - [ ] Delete confirmation modal appears
  - [ ] Delete removes transcript, summary, and files
  - [ ] Redirects to transcripts list after deletion
  - [ ] Usage stats decrease appropriately
- [ ] Test security:
  - [ ] Users can only view their own transcripts
  - [ ] Accessing another user's transcript redirects to /unauthorized
  - [ ] Download URLs are properly signed and expire
- [ ] Test mobile responsive design:
  - [ ] 2-column layout stacks on mobile (transcript on top, summary below)
  - [ ] All buttons accessible and properly sized
  - [ ] Scrolling works smoothly

---

## Phase 10: AI Summaries with Intelligent Classification ✅ COMPLETED

**Goal**: Generate AI-powered markdown summaries with intelligent transcript classification for Pro tier users

**Status**: ✅ Classification-based AI summaries with real-time streaming (Pro tier only)

### Implementation Overview

[Background: Built with GPT-4.1 (not GPT-5) using intelligent classification system. Summaries are on-demand (user-initiated), not automatic. Uses Trigger.dev streaming for real-time generation display.]

**✅ What Was Actually Built:**

**API & Model Selection:**
- Uses OpenAI GPT-4.1 (model: `gpt-4.1`)
- OpenAI SDK installed via `trigger/utils/openai.ts`
- `OPENAI_API_KEY` environment variable configured
- Temperature: 0.7 for classification, 0.7 for summary generation
- Streaming enabled for real-time frontend updates

**Two-Step Classification System:**

Built in `trigger/utils/prompts.ts`:

1. **Step 1: Classify Transcript Type** (via `classifyTranscript()`)
   - Uses GPT-4.1 to analyze transcript content
   - Returns one of three types:
     - `meeting_notes` - Business meetings, standups, team calls, interviews
     - `youtube_video` - Video content, tutorials, presentations, talks
     - `general` - Podcasts, conversations, lectures, other content
   - Analyzes first 2000 characters
   - Temperature: 0.3, Max tokens: 20
   - Defaults to "general" if classification fails

2. **Step 2: Generate Type-Specific Summary** (via `buildTypeSpecificPrompt()`)
   - Selects appropriate prompt template based on classification
   - Each type has unique markdown structure optimized for use case
   - Full transcript text passed to GPT-4.1
   - Streams markdown response in real-time

**Type-Specific Prompt Templates:**

All prompts generate **markdown output** (not JSON):

- **Meeting Notes Format**:
  - Meeting Title, Purpose, Key Takeaways
  - Discussion Topics (expandable sections)
  - Decisions Made, Action Items, Next Steps
  - Attendees/Participants

- **YouTube Video Format**:
  - Video Title, Overview
  - Chapter Breakdown (with timestamps)
  - Main Takeaways, Key Concepts
  - Target Audience, Notable Quotes
  - Resources Mentioned, Practical Applications

- **General Content Format**:
  - Content Title, Summary
  - Key Points (chronological order)
  - Important Moments, Main Themes
  - Notable Quotes, Discussion Topics
  - Conclusion, Who Should Listen/Read

**Database Schema:**

File: `lib/drizzle/schema/ai-summaries.ts`

```typescript
aiSummaries table:
- id: uuid (PK)
- transcript_id: uuid (FK → transcripts.id, UNIQUE, cascade delete)
- user_id: uuid (FK → users.id, cascade delete)
- summary_type: enum("meeting_notes" | "youtube_video" | "general")
- summary_content: text (full markdown)
- created_at: timestamp

Indexes:
- Unique constraint on transcript_id (one summary per transcript)
- Index on user_id
- Index on summary_type
```

**Trigger.dev Background Task:**

File: `trigger/tasks/generate-ai-summary.ts`

- Task ID: `generate-ai-summary`
- Input payload: `{ jobId, userId, transcriptId, transcriptText }`
- Progress tracking: 0% → 10% (classify) → 90% (stream) → 100% (save)
- Streams summary chunks via `metadata.stream("summary", completion)`
- Frontend receives real-time updates via `useRealtimeRunWithStreams` hook

**Task Workflow:**
1. Initialize progress (0%)
2. Classify transcript type with GPT-4.1 (0-10%)
3. Build type-specific prompt
4. Generate markdown summary with streaming (10-90%)
5. Accumulate full markdown response
6. Save to `ai_summaries` table (90-95%)
7. Update transcription job status (95-100%)

**Server Actions:**

File: `app/actions/transcriptions.ts`

Three key actions:
1. `getTriggerRealtimeToken()` - Generate public token for frontend streaming (1hr expiry)
2. `generateAISummary(transcriptId)` - Validate tier, check eligibility, trigger task, return run ID
3. `getAISummaryForPolling(transcriptId)` - Fetch completed summary for display

**Eligibility Validation:**
- Pro tier ONLY (not Creator, not Free)
- Checks if summary already exists (UNIQUE constraint)
- Verifies transcript exists and user owns it
- Validates transcript text is available

**Frontend Implementation:**

File: `components/transcripts/AISummaryTab.tsx`

**Three UI States:**

1. **Empty State** (no summary, not generating):
   - Shows `AISummaryEmptyState` component
   - "Generate Summary" button (Pro tier only)
   - Upgrade prompt for Free/Creator tiers
   - Error display with retry button if generation failed

2. **Generating State** (streaming in progress):
   - Real-time markdown display as chunks arrive
   - Animated cursor after streamed text
   - Loading spinner before stream starts
   - Progress indicator from run metadata
   - Estimated time: "This usually takes 30-60 seconds"

3. **Completed State** (summary saved):
   - Full markdown rendered via `Response` component
   - Summary type badge (Meeting Notes/YouTube Video/General)
   - "Copy Summary" button (copies entire markdown)
   - No polling needed (summary already exists)

**Real-Time Streaming:**

Uses `@trigger.dev/react-hooks`:
```typescript
const { run, streams } = useRealtimeRunWithStreams<
  typeof generateAISummaryTask,
  SUMMARY_STREAMS
>(runId, { accessToken: token });

const summaryText = streams.summary
  .map(chunk => chunk.choices[0]?.delta?.content || "")
  .join("");
```

**Stream Error Handling:**
- Suppresses `AbortError` when navigating away (expected behavior)
- Task continues in background if client disconnects
- User can return to view completed summary later

**Tier Enforcement:**

- **Free Tier**: "Generate Summary" button disabled, shows upgrade CTA
- **Creator Tier**: "Generate Summary" button disabled, shows upgrade to Pro CTA
- **Pro Tier**: Full access, on-demand generation
- **Admin Role**: Full access regardless of subscription tier

**Key Architectural Decisions:**

1. **On-Demand Generation** (not automatic):
   - User explicitly clicks "Generate Summary" button
   - Summary only created when requested
   - One summary per transcript (UNIQUE constraint)
   - No regeneration allowed (keeps costs predictable)

2. **Classification-Based Prompts** (not tier-based):
   - AI determines content type automatically
   - Type-specific markdown structures
   - No manual user selection needed
   - Better summaries than generic prompts

3. **Real-Time Streaming** (not polling):
   - Uses Trigger.dev streaming infrastructure
   - Frontend receives chunks as they generate
   - Users see markdown sections appear live
   - Better UX than waiting for completion

4. **Markdown Output** (not structured JSON):
   - Single markdown field in database
   - Easier to copy/paste for users
   - Better for display in Response component
   - Simpler data model

5. **Pro Tier Only** (not Creator/Pro):
   - Premium feature differentiation
   - Cost management (GPT-4.1 API usage)
   - Simplified tier logic
   - Admin override for testing

**Error Handling:**

Task level:
- Classification failure: Default to "general" type
- Empty GPT response: Throw error, update job status to "failed"
- Stream interruption: Continue in background, save complete summary
- Database insert failure: Throw error with message

Frontend level:
- Stream error (non-AbortError): Show warning, generation continues
- Run failure: Show error message with retry button
- Navigation during generation: Stream aborts, task continues
- Missing access token: Request fails gracefully

**Testing Checklist:**

- [✅] Classification accuracy:
  - Meeting transcript → "meeting_notes"
  - YouTube tutorial → "youtube_video"
  - Podcast interview → "general"

- [✅] Streaming UX:
  - Text appears in real-time
  - Cursor animation shows progress
  - No flashing or re-renders

- [✅] Tier gating:
  - Free: Upgrade prompt, no generation
  - Creator: Upgrade to Pro prompt
  - Pro: Full access
  - Admin: Full access

- [✅] Error scenarios:
  - API failure: Error message with retry
  - Duplicate summary: Clear error message
  - Navigation away: Task completes in background

**Cost Analysis:**

- GPT-4.1 API cost: ~$0.03-0.10 per summary (varies by transcript length)
- Classification cost: ~$0.001 per request (minimal)
- Total cost per summary: ~$0.04-0.11
- Pro tier pricing: $49/month supports ~500-1200 summaries/month at cost

**Files Created/Modified:**

Created:
- `trigger/tasks/generate-ai-summary.ts` - Main task with streaming
- `trigger/utils/prompts.ts` - Classification + type-specific prompts
- `lib/drizzle/schema/ai-summaries.ts` - Database schema
- `components/transcripts/AISummaryTab.tsx` - Frontend UI
- `components/transcripts/AISummaryEmptyState.tsx` - Empty state component

Modified:
- `app/actions/transcriptions.ts` - Added `generateAISummary()`, `getTriggerRealtimeToken()`, `getAISummaryForPolling()`
- `trigger/index.ts` - Exported `generateAISummaryTask`

**What Was NOT Built (Differs from Original Plan):**

- ❌ GPT-5 API (used GPT-4.1 instead)
- ❌ Tier-based prompts (used classification-based instead)
- ❌ Structured JSON output (used markdown instead)
- ❌ Automatic generation after transcription (user-initiated only)
- ❌ Creator tier support (Pro only)
- ❌ Regenerate summary feature
- ❌ Legacy v1 schema fields (key_highlights, topics, show_notes, social_captions)
- ❌ Separate `gpt-summary.ts` task (consolidated into `generate-ai-summary.ts`)

**Migration from Original Plan:**

Original design had:
- Automatic summaries for Creator/Pro after transcription
- Tier-based prompts (Creator = basic, Pro = advanced)
- JSON output with structured fields
- Polling for completion

Actual implementation:
- On-demand summaries for Pro only
- Classification-based prompts (meeting/video/general)
- Markdown output in single field
- Streaming for real-time display

**Why These Changes:**

1. User control: Let users decide if they want summary
2. Better UX: Streaming shows progress vs waiting
3. Simpler schema: Single markdown field vs multiple JSON fields
4. Cost management: Pro-only reduces API usage
5. Better summaries: Type-specific prompts > tier-based prompts

---

## Phase 11: Usage Quota Enforcement ✅ COMPLETED

**Goal**: Track usage and enforce tier limits to ensure subscription value and prevent abuse

**Status**: ✅ Event-based usage tracking with tier limits enforced

### Usage Tracking System

[Background: Need to enforce monthly upload limits and file duration limits based on subscription tier]

**Usage Tracking Logic:**

[Goal: Record and aggregate usage data for quota enforcement]

- [ ] Create `lib/usage.ts`:
  - [ ] Function: `getMonthlyUsage(userId)` - Get current month usage from usage_tracking table
    - [ ] Query by user_id and month (first day of current month: 2024-10-01)
    - [ ] Return: { uploads_count, minutes_transcribed, storage_bytes }
    - [ ] Create new record if doesn't exist for current month

  - [ ] Function: `incrementUploadCount(userId)` - Increment uploads after job created
    - [ ] Upsert usage_tracking record for current month
    - [ ] Increment uploads_count by 1
    - [ ] Update updated_at timestamp

  - [ ] Function: `addMinutesTranscribed(userId, minutes)` - Add transcribed minutes after job completes
    - [ ] Upsert usage_tracking record
    - [ ] Increment minutes_transcribed by duration
    - [ ] Update updated_at

  - [ ] Function: `addStorageUsed(userId, bytes)` - Add storage after files uploaded
    - [ ] Upsert usage_tracking record
    - [ ] Increment storage_bytes by file size
    - [ ] Update updated_at

  - [ ] Function: `checkQuotaAllowed(userId, fileDuration)` - Validate before upload
    - [ ] Get user's tier from Stripe API
    - [ ] Get monthly usage from usage_tracking table
    - [ ] Check upload limit: Free (3), Creator (50), Pro (unlimited)
    - [ ] Check file duration limit: Free (15 min), Creator (60 min), Pro (120 min)
    - [ ] Return: { allowed: boolean, reason: string, upgradeRequired: boolean }
    - [ ] Reason examples: "Monthly upload limit reached (3/3)", "File too long for Free tier (20 min, max 15 min)"

**Quota Enforcement in Upload Flow:**

[Goal: Block uploads that exceed tier limits before processing]

- [ ] Update `app/actions/transcriptions.ts` (initiateUpload action):
  - [ ] Before creating job: Call `checkQuotaAllowed(userId, fileDuration)`
  - [ ] If not allowed: Return error with reason and upgrade prompt
  - [ ] If allowed: Continue with upload and job creation
  - [ ] After job created: Call `incrementUploadCount(userId)`
  - [ ] After file uploaded: Call `addStorageUsed(userId, fileSize)`

**Usage Updates After Job Completion:**

[Goal: Update usage stats when transcription completes]

- [ ] Update `trigger/transcription.ts` (step 5 - Result Merging):
  - [ ] After transcript saved: Get accurate file duration from FFmpeg
  - [ ] Call `addMinutesTranscribed(userId, durationMinutes)`
  - [ ] Track in Trigger.dev logs for admin monitoring

**Usage Stats Display in Profile:**

[Goal: Show users their current usage so they understand quota consumption]

- [ ] Already implemented in Phase 5 (Profile page)
- [ ] Usage Statistics card queries `usage_tracking` table
- [ ] Shows: Uploads used (with progress bar), minutes transcribed, storage used
- [ ] Add upgrade prompt when usage exceeds 80% of quota

**Tier Limits Configuration:**

[Goal: Centralize tier limits for easy maintenance]

- [ ] Create `lib/tier-limits.ts`:
  - [ ] Export tier limits constants:
    ```typescript
    export const TIER_LIMITS = {
      free: {
        uploads_per_month: 3,
        max_file_duration_minutes: 15,
        max_storage_gb: 1,
        features: ["segment_timestamps", "txt_export", "srt_export"],
      },
      creator: {
        uploads_per_month: 50,
        max_file_duration_minutes: 60,
        max_storage_gb: 5,
        features: [
          "word_timestamps",
          "gpt_summaries",
          "txt_export",
          "srt_export",
          "vtt_export",
          "json_export",
        ],
      },
      pro: {
        uploads_per_month: -1, // Unlimited
        max_file_duration_minutes: 120,
        max_storage_gb: 50,
        features: ["word_timestamps", "gpt_summaries_full", "all_exports"],
      },
    };
    ```
  - [ ] Use these constants throughout app for consistent limits

**Stripe Webhook for Quota Resets:**

[Goal: Reset usage when subscription renews or user upgrades/downgrades]

- [ ] Update `app/api/webhooks/stripe/route.ts`:
  - [ ] Handle `customer.subscription.updated` event:
    - [ ] If plan changed (upgrade/downgrade): No quota reset, just enforce new limits
    - [ ] If billing period renewed: Quota automatically resets next month (no action needed)
  - [ ] Handle `customer.subscription.deleted` event:
    - [ ] User downgraded to Free tier
    - [ ] Enforce Free tier limits on next upload
    - [ ] Don't delete existing usage data (for analytics)

**Quota Reset Logic:**

[Goal: Monthly quota resets automatically on first day of month]

- [ ] Usage tracking uses `month` field (date: 2024-10-01)
- [ ] Each month is separate record in usage_tracking table
- [ ] Query always uses current month: `WHERE month = '2024-10-01'`
- [ ] Old months remain in database for historical analytics
- [ ] No cron job needed - automatic by design

**Over-Quota Handling:**

[Goal: Gracefully handle edge cases where users exceed quota]

- [ ] If user downgrades mid-month and already exceeded new tier's quota:
  - [ ] Block new uploads until next month
  - [ ] Don't delete existing transcripts
  - [ ] Show message: "You've used 12/3 uploads for Free tier. Quota resets on [next month date]."
  - [ ] Offer upgrade to resume uploads immediately

**Testing & Integration:**

[Goal: Ensure quota enforcement works correctly for all tiers and scenarios]

- [ ] Test Free tier limits:
  - [ ] Upload 3 files: All succeed
  - [ ] Try 4th upload: Blocked with "Monthly upload limit reached"
  - [ ] Try upload 20-minute file: Blocked with "File too long for Free tier (max 15 min)"
  - [ ] Verify upgrade prompt appears
- [ ] Test Creator tier limits:
  - [ ] Upload 50 files: All succeed
  - [ ] Try 51st upload: Blocked
  - [ ] Try upload 70-minute file: Blocked (max 60 min)
- [ ] Test Pro tier (unlimited uploads):
  - [ ] Upload 100+ files: No upload limit error
  - [ ] Try upload 130-minute file: Blocked (max 120 min)
- [ ] Test usage tracking:
  - [ ] Upload file, verify uploads_count increments
  - [ ] Complete transcription, verify minutes_transcribed increments
  - [ ] Check storage_bytes updates correctly
- [ ] Test monthly quota reset:
  - [ ] Simulate month change (update system date or manually create next month record)
  - [ ] Verify new month starts with 0 usage
  - [ ] Verify previous month data preserved
- [ ] Test tier changes:
  - [ ] Upgrade Free → Creator: Verify new limits apply immediately
  - [ ] Downgrade Creator → Free mid-month: Verify over-quota handled gracefully
- [ ] Test profile usage display:
  - [ ] Verify progress bars show correct percentages
  - [ ] Verify counts match usage_tracking table
  - [ ] Verify upgrade prompts appear at 80%+ usage
- [ ] Test error messages:
  - [ ] All quota errors show clear, actionable messages
  - [ ] Upgrade CTAs are prominent and functional

---

## Phase 12: Admin System Monitoring ⚠️ PARTIALLY COMPLETED

**Goal**: Provide admin-level visibility into system health, usage analytics, and user management

**Status**: ⚠️ Basic admin dashboard created, but most features marked as "Coming Soon"

### Admin Dashboard

[Background: System administrators need to monitor job queue health, track costs, analyze usage trends, and manage users]

**Admin Route & Access Control:**

[Goal: Create admin-only page with role-based access enforcement]

- [ ] Create `app/(protected)/admin/page.tsx`:
  - [ ] Use `requireAdminAccess()` from `lib/auth.ts` to enforce admin role
  - [ ] Redirect non-admin users to `/unauthorized`
  - [ ] Tabbed layout: Overview (default), Analytics, Users

**Navigation Update:**

[Goal: Add Admin link to sidebar for users with admin role]

- [ ] Update sidebar navigation in `components/navigation/`:
  - [ ] Add "Admin" link with dashboard icon
  - [ ] Only visible if user.role === 'admin' (conditional rendering)
  - [ ] Highlight when on admin route

**Overview Tab (Default):**

[Goal: Display real-time system metrics and health status]

**System Metrics Cards:**

[Goal: Show key operational metrics at a glance]

- [ ] Create 8 metric tiles in grid layout:
  - [ ] **Total Users**: Count from users table
  - [ ] **Free Tier Users**: Count where tier is Free (via Stripe API or query pattern)
  - [ ] **Creator Tier Users**: Count of Creator subscribers
  - [ ] **Pro Tier Users**: Count of Pro subscribers
  - [ ] **Total Minutes (Month)**: Sum of minutes_transcribed from usage_tracking for current month
  - [ ] **Total Jobs Today**: Count of transcription_jobs where created_at is today
  - [ ] **Active Jobs Now**: Count where status='processing' or 'queued'
  - [ ] **Total Storage Used**: Sum of storage_bytes from usage_tracking, format as GB/TB

- [ ] Create `lib/admin.ts`:
  - [ ] Function: `getSystemMetrics()` - Aggregate queries for all metrics
  - [ ] Query users table: Total count, role distribution
  - [ ] Query transcription_jobs table: Today's jobs, active jobs, total failures
  - [ ] Query usage_tracking table: Current month minutes, total storage
  - [ ] Calculate error rate: (failed jobs / total jobs) \* 100 for last 24 hours
  - [ ] Return structured object with all metrics

**Job Statistics Chart:**

[Goal: Visualize job processing trends over last 30 days]

- [ ] Build line chart showing jobs processed per day:
  - [ ] X-axis: Dates for last 30 days
  - [ ] Y-axis: Number of jobs
  - [ ] Data series: Total jobs, completed jobs, failed jobs
  - [ ] Query transcription_jobs table grouped by date

- [ ] Display summary stats below chart:
  - [ ] Total jobs (last 30 days)
  - [ ] Completion rate: (completed / total) \* 100
  - [ ] Failure rate: (failed / total) \* 100
  - [ ] Average processing time: Average of (completed_at - created_at) for completed jobs

**System Health Status:**

[Goal: Alert admins to potential issues]

- [ ] Create health indicators:
  - [ ] **Queue Status**: ✓ Healthy if avg wait time < 5 min, ⚠️ Warning if > 5 min
    - Calculate: Average time between job created_at and first progress update for queued jobs
    - Display: "✓ Healthy (avg wait: 45 seconds)" or "⚠️ Warning (avg wait: 8 minutes)"

  - [ ] **API Status**: Check if Whisper API and GPT-5 API are operational
    - Simple health check: Try test API call or check last successful job
    - Display: "✓ All services operational" or "⚠️ Whisper API degraded"

  - [ ] **Error Spike Alert**: Detect unusual error rates
    - Calculate: Error rate for last 1 hour vs last 24 hours
    - If last hour > 2x average: Show "⚠️ Error rate elevated (investigate)"
    - Threshold: >10% error rate in last hour

**Analytics Tab:**

[Goal: Provide cost analysis and revenue insights]

**Time Range Selector:**

[Goal: Allow filtering analytics by time period]

- [ ] Build dropdown: Last 7 days, Last 30 days, Last 90 days, Custom range
- [ ] Date range picker for custom option
- [ ] Filter all analytics queries by selected time range

**Revenue vs Costs Chart:**

[Goal: Show profitability trends over time]

- [ ] Build dual-line chart:
  - [ ] Line 1 (green): Monthly recurring revenue (MRR)
    - Calculate: Sum of active subscriptions (Creator × $19 + Pro × $49)
    - Query Stripe API for subscription counts by tier
  - [ ] Line 2 (red): Monthly costs
    - Calculate: Whisper API + GPT-5 API + Supabase Storage costs
  - [ ] Display profit margin: (Revenue - Costs) / Revenue \* 100

**Cost Breakdown:**

[Goal: Identify cost drivers for optimization]

- [ ] Display itemized costs:
  - [ ] **Whisper API**: Total minutes transcribed × $0.006/min
    - Query: Sum duration_seconds from completed transcription_jobs, convert to minutes
    - Example: "46,667 minutes × $0.006/min = $280"

  - [ ] **GPT-5 Summaries**: Estimate based on summary count
    - Query: Count ai_summaries created in time range
    - Estimate: $0.10 per summary (input tokens + output tokens)
    - Example: "800 summaries × $0.10 est. = $80"

  - [ ] **Supabase Storage**: Total storage used × $0.021/GB
    - Query: Sum storage_bytes from usage_tracking, convert to GB
    - Example: "2,857 GB × $0.021/GB = $60"

  - [ ] **Total Monthly Costs**: Sum of all above
  - [ ] Display percentage breakdown pie chart

**Usage Trends:**

[Goal: Analyze usage patterns by tier]

- [ ] Build chart: Total minutes transcribed over time
  - [ ] Line graph with daily data points
  - [ ] Breakdown by tier: Free users, Creator users, Pro users
  - [ ] Color-coded for easy tier comparison

- [ ] Display average usage per user:
  - [ ] Free tier: Average minutes/month per Free user
  - [ ] Creator tier: Average minutes/month per Creator user
  - [ ] Pro tier: Average minutes/month per Pro user
  - [ ] Helps identify power users and tier utilization

**Revenue Breakdown:**

[Goal: Track revenue composition]

- [ ] Display MRR (Monthly Recurring Revenue):
  - [ ] Query Stripe API for active subscriptions
  - [ ] Calculate: (Creator count × $19) + (Pro count × $49)
  - [ ] Show revenue per tier: "Creator: $1,653 (87 users)", "Pro: $1,127 (23 users)"

**Conversion Metrics:**

[Goal: Track subscription funnel performance]

- [ ] Calculate conversion rates:
  - [ ] **Free → Creator**: (Creator users / Total users who ever had Free tier) × 100
  - [ ] **Creator → Pro**: (Pro users / Total users who ever had Creator tier) × 100
  - [ ] **Monthly Churn Rate**: (Canceled subscriptions this month / Active subscriptions last month) × 100
  - [ ] Display trends: Compare to previous month with up/down arrows

**Users Tab:**

[Goal: Manage users and analyze behavior]

**Search & Filters:**

[Goal: Enable admins to find specific users quickly]

- [ ] Build filter bar:
  - [ ] Search by email: Text input with debounced query
  - [ ] Filter by plan tier: Dropdown (All / Free / Creator / Pro)
  - [ ] Filter by status: Dropdown (Active / Suspended / Banned)
  - [ ] Sort by: Dropdown (Joined date, Usage, Plan tier)

**User Table:**

[Goal: Display user list with key information and actions]

- [ ] Build table with columns:
  - [ ] **Email**: User email address
  - [ ] **Plan Tier**: Current subscription tier (Free/Creator/Pro)
  - [ ] **Usage**: Current month stats - "12/50 uploads (245 min)"
  - [ ] **Joined Date**: Account creation date
  - [ ] **Actions**: "View" button (opens detail modal), "Ban" button (direct action)

- [ ] Pagination: Load 50 users per page with "Load More" button
- [ ] Query users table with joins to usage_tracking and Stripe API for tier

**Top Users by Usage:**

[Goal: Identify power users and potential abuse]

- [ ] Build top users section:
  - [ ] Query: Top 10 users by minutes_transcribed for current month
  - [ ] Display: Email, plan tier, total minutes
  - [ ] Highlight users who might benefit from tier upgrade
  - [ ] Flag users with unusually high usage (potential abuse)

**User Detail Modal:**

[Goal: Provide comprehensive user information for support and management]

- [ ] Build modal that opens when clicking "View" on user:
  - [ ] **Account Information**:
    - [ ] Email, full name, joined date, role
    - [ ] Stripe customer ID (for cross-reference)

  - [ ] **Plan History**:
    - [ ] Current plan tier and renewal date
    - [ ] Past subscriptions: Dates and tiers
    - [ ] Query Stripe API for subscription history

  - [ ] **Total Usage Stats (All-Time)**:
    - [ ] Total uploads: Count from transcription_jobs
    - [ ] Total minutes transcribed: Sum from usage_tracking
    - [ ] Total storage used: Sum from usage_tracking
    - [ ] Account age and average usage per month

  - [ ] **Recent Transcriptions**:
    - [ ] Last 10 transcription jobs
    - [ ] Show: File name, date, status, duration

  - [ ] **Admin Actions**:
    - [ ] **Manual Quota Adjustment**: Override monthly limits for specific user (e.g., grant extra uploads)
    - [ ] **Ban/Suspend User**: Disable account access with reason field
    - [ ] **View Billing History**: Link to Stripe Customer Portal
    - [ ] **Reset Password**: Trigger password reset email
    - [ ] **Delete Account**: Permanently remove user and all data (confirmation required)

**Data Layer:**

[Goal: Create admin-specific queries with proper aggregations]

- [ ] Update `lib/admin.ts`:
  - [ ] Function: `getSystemMetrics()` - Already created in Overview section
  - [ ] Function: `getJobStatistics(timeRange)` - Job stats for chart
  - [ ] Function: `getCostBreakdown(timeRange)` - Calculate costs by service
  - [ ] Function: `getRevenueMetrics(timeRange)` - MRR, revenue breakdown
  - [ ] Function: `getConversionMetrics()` - Free→Creator→Pro funnel
  - [ ] Function: `getUserList(filters, pagination)` - Filtered user list
  - [ ] Function: `getUserDetails(userId)` - Comprehensive user info
  - [ ] Function: `getTopUsersByUsage(limit)` - Power users list

**Admin Actions (Server Actions):**

[Goal: Enable admin operations with proper authorization]

- [ ] Create `app/actions/admin.ts`:
  - [ ] Action: `banUser(userId, reason)` - Set user status to banned, prevent login
  - [ ] Action: `suspendUser(userId, reason)` - Temporarily disable account
  - [ ] Action: `adjustQuota(userId, newLimits)` - Manual quota override
  - [ ] Action: `deleteUser(userId)` - Hard delete user and all data (transcripts, jobs, usage)
  - [ ] Action: `resetUserPassword(userId)` - Trigger Supabase password reset email
  - [ ] All actions require admin role verification
  - [ ] All actions log to audit trail (optional: create admin_actions table)

**Testing & Integration:**

[Goal: Ensure admin dashboard provides accurate insights and secure access]

- [ ] Test access control:
  - [ ] Admin user can access /admin page
  - [ ] Non-admin user redirected to /unauthorized
  - [ ] Navigation link only visible to admins
- [ ] Test Overview tab:
  - [ ] All metric tiles display correct counts
  - [ ] Job statistics chart renders with real data
  - [ ] System health indicators show accurate status
  - [ ] Health alerts trigger correctly (simulate high error rate)
- [ ] Test Analytics tab:
  - [ ] Revenue vs costs chart displays correctly
  - [ ] Cost breakdown matches actual usage (compare to Stripe/OpenAI billing)
  - [ ] Usage trends show proper tier breakdowns
  - [ ] Conversion metrics calculate correctly
  - [ ] Time range filter updates all charts
- [ ] Test Users tab:
  - [ ] User table loads with pagination
  - [ ] Search by email works correctly
  - [ ] Filters (tier, status, sort) work properly
  - [ ] Top users list shows highest usage
  - [ ] User detail modal displays all information
- [ ] Test admin actions:
  - [ ] Ban user: User cannot login
  - [ ] Suspend user: Temporary disable works
  - [ ] Manual quota adjustment: Override limits work
  - [ ] Delete user: All user data removed
  - [ ] All actions require confirmation
- [ ] Test data accuracy:
  - [ ] Cross-check metrics with database queries
  - [ ] Verify cost calculations match actual bills
  - [ ] Verify revenue matches Stripe dashboard
- [ ] Test mobile responsive design:
  - [ ] Metric tiles stack properly
  - [ ] Charts render on mobile
  - [ ] Tables scroll horizontally
  - [ ] Modal fits on small screens

---

## Phase 13: Final Implementation Sweep ⚠️ IN PROGRESS

**Goal**: Handle any remaining requirements from prep documents and polish the application

**Status**: ⚠️ Core features complete, polish and edge cases in progress

### Remaining Requirements Implementation

[Background: Catch-all for edge cases and smaller requirements not covered in main features]

**Landing Page Polish:**

[Goal: Ensure landing page is production-ready]

- [ ] Review `ai_docs/prep/app_pages_and_functionality.md` for any missed landing page requirements
- [ ] Verify all pricing tier details are accurate (Free/Creator/Pro)
- [ ] Verify FAQ section covers common questions:
  - [ ] What file formats are supported? (MP3, MP4, WAV, MOV, M4A)
  - [ ] Can I upgrade/downgrade anytime? (Yes, via Stripe Customer Portal)
  - [ ] What's your refund policy? (Link to /refunds page)
  - [ ] Are my files secure? (Files encrypted in Supabase Storage)
  - [ ] How accurate is the transcription? (Whisper API industry-leading accuracy)
- [ ] Add trust signals: Testimonials, security badges, uptime guarantee (optional)
- [ ] Optimize hero section copy for conversions
- [ ] Test all CTA buttons link correctly

**Legal Pages Completion:**

[Goal: Ensure all legal pages are complete and compliant]

- [ ] Review `/privacy` page:
  - [ ] Update with Skribo.ai branding
  - [ ] Include data collection practices (files, transcripts, usage data)
  - [ ] Include third-party services: Stripe, OpenAI, Supabase
  - [ ] Include GDPR compliance statements
  - [ ] Include data retention and deletion policies
- [ ] Review `/terms` page:
  - [ ] Update with Skribo.ai branding
  - [ ] Include subscription terms (billing cycle, cancellation)
  - [ ] Include acceptable use policy (no illegal content)
  - [ ] Include liability limitations
- [ ] Create `/refunds` page (if not exists):
  - [ ] Refund policy: 30-day money-back guarantee or no refunds
  - [ ] How to request refund: Contact support or self-service via Stripe
  - [ ] Processing time: 5-10 business days

**Error Handling & Edge Cases:**

[Goal: Ensure app handles all edge cases gracefully]

- [ ] Test and handle empty states:
  - [ ] No transcripts yet: "Upload your first file" prompt
  - [ ] No AI summary (Free tier): Upgrade prompt
  - [ ] No usage data: "No usage this month"
  - [ ] No invoices: "No billing history yet"
- [ ] Test and handle error states:
  - [ ] Network errors: Retry button and offline indicator
  - [ ] API errors: User-friendly messages
  - [ ] File upload failures: Clear error + retry option
  - [ ] Quota exceeded: Upgrade prompts with clear explanation
- [ ] Test and handle loading states:
  - [ ] Skeleton loaders for slow queries
  - [ ] Progress indicators for uploads
  - [ ] Spinners for processing jobs
  - [ ] "Generating..." states for AI summaries
- [ ] Test and handle edge cases:
  - [ ] User cancels upload mid-transfer: Clean up partial files
  - [ ] User deletes job while processing: Cancel Trigger.dev job
  - [ ] User downgrades while jobs processing: Jobs complete but don't count toward new tier quota
  - [ ] User upgrades mid-month: New limits apply immediately

**Mobile Responsive Design:**

[Goal: Ensure all pages work perfectly on mobile devices]

- [ ] Test all pages on mobile:
  - [ ] Landing page: Stacks properly, CTAs visible
  - [ ] Auth pages: Forms fit on screen, keyboard doesn't obscure inputs
  - [ ] Transcripts page: Upload zone accessible, job list readable
  - [ ] Transcript viewer: 2-column layout stacks (transcript top, summary bottom)
  - [ ] Profile page: Cards stack in 1 column
  - [ ] Admin page: Tables scroll horizontally, charts resize
- [ ] Test navigation on mobile:
  - [ ] Sidebar collapses into hamburger menu
  - [ ] Bottom tab bar for main sections (alternative to sidebar)
  - [ ] User avatar dropdown accessible
- [ ] Test interactions on mobile:
  - [ ] File upload: Camera/gallery access on mobile devices
  - [ ] Copy buttons: Work with mobile clipboard
  - [ ] Dropdowns: Touch-friendly
  - [ ] Modals: Fit on small screens

**Performance Optimization:**

[Goal: Ensure app loads quickly and performs well]

- [ ] Optimize images:
  - [ ] Logo and icons: Use WebP format, lazy load
  - [ ] Avatar images: Compress and resize
- [ ] Optimize queries:
  - [ ] Add indexes to frequently queried fields (already done in schema)
  - [ ] Use pagination for large lists (already implemented)
  - [ ] Minimize database round-trips (use joins)
- [ ] Optimize client-side:
  - [ ] Code splitting for large components
  - [ ] Lazy load admin dashboard (admin users only)
  - [ ] Minimize bundle size (tree-shake unused code)
- [ ] Optimize polling:
  - [ ] Only poll when active jobs exist (already implemented)
  - [ ] Stop polling when user navigates away (already implemented)
  - [ ] Use server-sent events or WebSockets if polling causes performance issues

**Accessibility:**

[Goal: Ensure app is accessible to all users]

- [ ] Add ARIA labels to interactive elements:
  - [ ] Buttons: Descriptive labels
  - [ ] Forms: Label associations
  - [ ] Modals: Focus trapping
- [ ] Test keyboard navigation:
  - [ ] All actions accessible via keyboard
  - [ ] Tab order is logical
  - [ ] Focus indicators visible
- [ ] Test screen reader compatibility:
  - [ ] Page structure makes sense
  - [ ] Dynamic updates announced
  - [ ] Alternative text for images/icons
- [ ] Color contrast:
  - [ ] Text meets WCAG AA standards
  - [ ] Error states clearly indicated

**Analytics & Monitoring (Optional):**

[Goal: Set up basic analytics for product insights]

- [ ] Consider adding analytics:
  - [ ] Google Analytics or Plausible for page views
  - [ ] Track key events: Sign-ups, uploads, upgrades
  - [ ] Track error rates and user flows
- [ ] Set up error monitoring:
  - [ ] Sentry or similar for error tracking
  - [ ] Alert on critical errors (payment failures, job crashes)

**Documentation:**

[Goal: Create basic documentation for users and admins]

- [ ] Create user help docs (optional):
  - [ ] How to upload files
  - [ ] How to download transcripts
  - [ ] How to upgrade/downgrade
  - [ ] How to cancel subscription
- [ ] Create admin documentation:
  - [ ] How to interpret system metrics
  - [ ] How to handle user support requests
  - [ ] How to manage costs and pricing

**Final Testing Checklist:**

[Goal: Comprehensive end-to-end testing before launch]

- [ ] **User Flows**:
  - [ ] Sign up → Upload file → View transcript → Download export → Upgrade → Upload more files
  - [ ] Test all three tiers: Free, Creator, Pro
  - [ ] Test quota enforcement at each tier

- [ ] **Payment Flows**:
  - [ ] Free → Creator upgrade via Stripe Checkout
  - [ ] Creator → Pro upgrade
  - [ ] Pro → Free downgrade via Customer Portal
  - [ ] Subscription cancellation
  - [ ] Payment failure handling

- [ ] **Core Features**:
  - [ ] File upload for all supported formats (MP3, MP4, WAV, MOV, M4A)
  - [ ] Background job processing end-to-end
  - [ ] Progress tracking accuracy
  - [ ] Transcript viewing and copying
  - [ ] Export downloads in all formats
  - [ ] AI summaries for Creator/Pro
  - [ ] Usage quota enforcement

- [ ] **Admin Features**:
  - [ ] System metrics accuracy
  - [ ] Cost analytics match actual bills
  - [ ] User management actions work
  - [ ] Access control enforced

- [ ] **Edge Cases**:
  - [ ] Very long files (120 min Pro max)
  - [ ] Very short files (30 seconds)
  - [ ] Different languages (test auto-detect)
  - [ ] Video files (ensure audio extraction works)
  - [ ] Failed jobs (retry and error handling)
  - [ ] Network interruptions during upload

- [ ] **Security**:
  - [ ] Users can only access their own data
  - [ ] Admin-only pages require admin role
  - [ ] File access via signed URLs with expiration
  - [ ] Stripe webhooks verified
  - [ ] SQL injection prevention (Drizzle ORM handles this)

- [ ] **Performance**:
  - [ ] Page load times < 3 seconds
  - [ ] File uploads work on slow connections
  - [ ] Large transcripts (60-120 min) load quickly
  - [ ] No memory leaks from polling

**Pre-Launch Checklist:**

[Goal: Final preparation before going live]

- [ ] Environment variables:
  - [ ] All production API keys configured
  - [ ] Stripe production mode enabled
  - [ ] OpenAI production API key
  - [ ] Trigger.dev production environment
  - [ ] Supabase production database

- [ ] Domain & DNS:
  - [ ] Domain registered (Skribo.ai)
  - [ ] DNS configured for deployment (Vercel/other host)
  - [ ] SSL certificate active (HTTPS)

- [ ] Database:
  - [ ] Production migrations run: `npm run db:migrate:prod`
  - [ ] Database backups configured

- [ ] Stripe:
  - [ ] Production products created (Creator $19, Pro $49)
  - [ ] Webhook endpoints configured for production URL
  - [ ] Customer Portal configured
  - [ ] Test payment flow in production mode

- [ ] Monitoring:
  - [ ] Error tracking configured
  - [ ] Cost alerts set up (OpenAI, Supabase)
  - [ ] Uptime monitoring enabled

- [ ] Legal:
  - [ ] Privacy policy reviewed by legal (if applicable)
  - [ ] Terms of service reviewed
  - [ ] Refund policy finalized

---

**🎉 ROADMAP COMPLETE**

You now have a complete, feature-based development roadmap for Skribo.ai that:

- ✅ Starts with Phase 0 (mandatory project setup)
- ✅ Updates landing page and authentication for new branding
- ✅ Replaces incompatible chat schema with transcription schema (Phase 3)
- ✅ Builds complete features one at a time (not technical layers)
- ✅ Leverages existing template infrastructure (auth, Stripe, storage)
- ✅ Adds only necessary extensions (Trigger.dev, FFmpeg, Whisper, GPT-5)
- ✅ Sequences features based on logical dependencies
- ✅ Includes concrete implementation tasks with specific file paths
- ✅ Provides clear goals and background for each major section

**Next Steps:**
Start with Phase 0 to understand the current template state, then proceed sequentially through each phase. Each phase is a complete, shippable increment that adds real user value.
