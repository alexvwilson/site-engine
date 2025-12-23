## Wireframe Reference Doc

### ASCII / Markdown Mock-ups

```text
═══════════════════════════════════════════════════════════════════════
MAIN WORKFLOW DASHBOARD  `/app/transcripts`
═══════════════════════════════════════════════════════════════════════

+------------------------------------------------------------------+
| Sidebar              |  Transcripts Dashboard                    |
|----------------------|-------------------------------------------|
| 📜 Transcripts       |  [INPUT AREA - File Upload]               |
| 👤 Profile           |  +--------------------------------------+ |
| 📊 Admin*            |  |                                      | |
|                      |  |   📁 Drag & drop audio/video files   | |
| [Usage Stats]        |  |      or click to browse              | |
| Uploads: 12/50       |  |                                      | |
| [████████░░] 24%     |  |   Supported: MP3, MP4, WAV, MOV, M4A | |
| Creator plan         |  |   Max duration: 60 min (Creator)     | |
|                      |  |                                      | |
|                      |  +--------------------------------------+ |
|                      |                                           |
|                      |  Language: [Auto-detect ▼]               |
|                      |  Timestamps: [☑ Word-level] (Creator/Pro)|
|                      |                                           |
|                      |  Quota: 12/50 uploads  [████████░░] 24%  |
|----------------------------------------------------------------------|
|                      |  ACTIVE JOBS (2)                          |
|                      |  +--------------------------------------+ |
|                      |  | 📄 Episode_42.mp3                    | |
|                      |  | [Processing ⟳ 65%]                   | |
|                      |  | [=================>      ]           | |
|                      |  | Status: Whisper transcription (65%)  | |
|                      |  | Estimated: ~3 min remaining          | |
|                      |  | [Cancel] [Delete]                    | |
|                      |  +--------------------------------------+ |
|                      |  | 📄 Interview_Smith.wav               | |
|                      |  | [Queued ⏸]                           | |
|                      |  | Position #2 in queue                 | |
|                      |  | [Delete]                             | |
|                      |  +--------------------------------------+ |
|----------------------------------------------------------------------|
|                      |  COMPLETED JOBS (8)                       |
|                      |  Filters: [All ▼] [Newest ▼] [Last 30d ▼]|
|                      |  +--------------------------------------+ |
|                      |  | 📄 Podcast_Episode_41.mp3            | |
|                      |  | [Completed ✓]  45 min  |  English    | |
|                      |  | Completed: 2 mins ago                | |
|                      |  | [View Results] [Download ▼] [Delete]| |
|                      |  +--------------------------------------+ |
|                      |  | 📄 Meeting_Notes.m4a                 | |
|                      |  | [Failed ✗]  Error: File too large   | |
|                      |  | [Retry] [Delete]                     | |
|                      |  +--------------------------------------+ |
|                      |  | [Show 6 more...]                     | |
|                      |                                           |
|                      |  [Load More] (Pagination: 1-20 of 47)    |
+----------------------+-------------------------------------------+


--- EMPTY STATE (First-time user) ---

+------------------------------------------------------------------+
| Sidebar              |  Transcripts Dashboard                    |
|----------------------|-------------------------------------------|
| 📜 Transcripts       |  [INPUT AREA]                             |
| 👤 Profile           |  +--------------------------------------+ |
|                      |  |                                      | |
| [Usage Stats]        |  |   📁 Drag & drop your first file     | |
| Uploads: 0/3         |  |      to get started                  | |
| Free plan            |  |                                      | |
|                      |  |   Supported: MP3, MP4, WAV, MOV, M4A | |
|                      |  |                                      | |
|                      |  +--------------------------------------+ |
|                      |                                           |
|----------------------------------------------------------------------|
|                      |                                           |
|                      |              📄                           |
|                      |                                           |
|                      |       No transcriptions yet               |
|                      |   Upload an audio or video file           |
|                      |          to get started                   |
|                      |                                           |
+----------------------+-------------------------------------------+


═══════════════════════════════════════════════════════════════════════
RESULTS VIEWER PAGE  `/app/transcripts/[transcriptId]`
═══════════════════════════════════════════════════════════════════════

+------------------------------------------------------------------+
| ← Back to Transcripts                                            |
|------------------------------------------------------------------|
| Job: Episode_42.mp3  |  Completed: Oct 20, 2024  |  ✓ Success   |
| Duration: 45 min  |  Language: English                          |
|------------------------------------------------------------------|
| [Download ▼]  [Copy All]  [Delete]                               |
|------------------------------------------------------------------|
|                                                                  |
| TABS (if multiple outputs):                                      |
| [Transcript] [AI Summary] [Ask Scribo]                          |
|                                                                  |
|------------------------------------------------------------------|
| TAB: TRANSCRIPT                                                  |
|                                                                  |
| +--------------------------------------------------------------+ |
| | [00:00:00] Welcome to episode 42 of the podcast.           | |
| | Today we're discussing AI and transcription...             | |
| |                                                            | |
| | [00:01:23] Our guest today is an expert in AI              | |
| | transcription and has been working in...                   | |
| |                                                            | |
| | [00:03:45] One of the key challenges we face is            | |
| | accuracy when dealing with multiple speakers...            | |
| |                                                            | |
| | (scrollable timestamped content)                           | |
| +--------------------------------------------------------------+ |
|                                                                  |
|------------------------------------------------------------------|
| TAB: AI SUMMARY (Creator/Pro only)                               |
|                                                                  |
| +--------------------------------------------------------------+ |
| | KEY HIGHLIGHTS                                             | |
| | • Main topic discussed                                     | |
| | • Guest introduction                                       | |
| | • Key takeaways                                            | |
| |                                                            | |
| | TOPICS                                                     | |
| | #AI #Podcasting #Content                                   | |
| |                                                            | |
| | SHOW NOTES                                                 | |
| | [Generated summary text for podcast description]           | |
| | [Copy]                                                     | |
| |                                                            | |
| | SOCIAL CAPTIONS                                            | |
| | Twitter: [text] [Copy]                                     | |
| | LinkedIn: [text] [Copy]                                    | |
| +--------------------------------------------------------------+ |
|                                                                  |
| --- IF FREE TIER (Upgrade Prompt) ---                            |
| +--------------------------------------------------------------+ |
| | [UPGRADE PROMPT]                                           | |
| | Upgrade to Creator for AI-generated summaries!             | |
| | [Upgrade Now]                                              | |
| +--------------------------------------------------------------+ |
|                                                                  |
|------------------------------------------------------------------|
| DOWNLOAD SECTION                                                 |
|                                                                  |
| [Download TXT] [Download SRT] [Download VTT] [Download JSON]    |
| [Download All Formats] (zip)                                     |
|                                                                  |
| Tier-based format restrictions:                                  |
| • Free: TXT, SRT                                                |
| • Creator: TXT, SRT, VTT, JSON                                  |
| • Pro: All formats + verbose_json                               |
+------------------------------------------------------------------+


═══════════════════════════════════════════════════════════════════════
LANDING PAGE (Marketing)  `/`
═══════════════════════════════════════════════════════════════════════

+------------------------------------------------------------------+
| Logo                           [Sign In] [Start Free - Primary]  |
|------------------------------------------------------------------|
| HERO SECTION                                                     |
|                                                                  |
|          Turn Audio Into Text in Minutes                         |
|     Stop wasting 5-10 hours weekly on manual transcription      |
|                                                                  |
|              [Start Transcribing Free - CTA]                     |
|------------------------------------------------------------------|
| FEATURE HIGHLIGHTS (3 columns)                                   |
|                                                                  |
| [AI-Powered]      [Multiple Formats]      [Fast Processing]     |
| Whisper API       SRT, VTT, TXT          Real-time tracking     |
|------------------------------------------------------------------|
| PRICING SECTION (3 cards side-by-side)                           |
|                                                                  |
|              Choose the Right Plan                               |
|                                                                  |
| +----------------+ +----------------+ +----------------+         |
| | FREE           | | CREATOR $19/mo | | PRO $49/mo     |         |
| |                | | [Most Popular] | |                |         |
| | 3 uploads/mo   | | 50 uploads/mo  | | Unlimited      |         |
| | 15 min max     | | 60 min max     | | 120 min max    |         |
| | Segment times  | | Word-level     | | Word-level     |         |
| | TXT, SRT       | | + VTT, JSON    | | All formats    |         |
| | No AI summary  | | GPT-5 summary  | | Full summaries |         |
| |                | |                | |                |         |
| | [Start Free]   | | [Choose Plan]  | | [Choose Plan]  |         |
| +----------------+ +----------------+ +----------------+         |
|                                                                  |
| FAQ: What file formats? Can I upgrade anytime? Refund policy?    |
|------------------------------------------------------------------|
| FOOTER                                                           |
| Privacy | Terms | Refunds                                        |
+------------------------------------------------------------------+


═══════════════════════════════════════════════════════════════════════
PROFILE PAGE (Unified)  `/app/profile`
═══════════════════════════════════════════════════════════════════════

+------------------------------------------------------------------+
| Profile                                                          |
|------------------------------------------------------------------|
| CARD GRID (2 columns on desktop, 1 column on mobile)             |
|                                                                  |
| +---------------------------+ +---------------------------+      |
| | ACCOUNT INFORMATION       | | BILLING MANAGEMENT        |      |
| |                           | |                           |      |
| | [Avatar Photo]            | | Current Plan              |      |
| | Brandon Hancock           | | Creator - $19/month       |      |
| |                           | | Renews: Nov 20, 2024      |      |
| | Email (verified ✓)        | |                           |      |
| | brandon@example.com       | | Payment Method            |      |
| |                           | | Visa •••• 4242            |      |
| | [Change Password]         | |                           |      |
| | [Delete Account]          | | [Manage Billing]          |      |
| |                           | | (→ Stripe Portal)         |      |
| +---------------------------+ +---------------------------+      |
|                                                                  |
| +---------------------------+ +---------------------------+      |
| | USAGE STATISTICS          | | SUBSCRIPTION PLANS        |      |
| |                           | |                           |      |
| | This Month:               | | [FREE]                    |      |
| |                           | | 3 uploads/mo              |      |
| | Uploads Used              | | 15 min max                |      |
| | [████████░░] 12/50 (24%)  | | [Start Free]              |      |
| |                           | |                           |      |
| | Minutes Transcribed       | | [CREATOR - $19/mo]        |      |
| | 245 minutes               | | [Most Popular]            |      |
| |                           | | 50 uploads/mo             |      |
| | Storage Used              | | 60 min max                |      |
| | [███░░░] 1.2/5 GB (24%)   | | [Current Plan ✓]          |      |
| |                           | |                           |      |
| |                           | | [PRO - $49/mo]            |      |
| |                           | | Unlimited uploads         |      |
| |                           | | 120 min max               |      |
| |                           | | [Upgrade]                 |      |
| +---------------------------+ +---------------------------+      |
|                                                                  |
| Invoice History:                                                 |
| Oct 20, 2024  $19.00  Paid  [Download PDF]                      |
| Sep 20, 2024  $19.00  Paid  [Download PDF]                      |
+------------------------------------------------------------------+


═══════════════════════════════════════════════════════════════════════
ADMIN DASHBOARD (Single Page - No Tabs)  `/admin/dashboard`
═══════════════════════════════════════════════════════════════════════

+------------------------------------------------------------------+
| Admin Dashboard                                                  |
| Monitor system health, user analytics, and job processing       |
|------------------------------------------------------------------|
|                                                                  |
| SYSTEM METRICS (4 cards in a row)                                |
|                                                                  |
| +------------+ +------------+ +------------+ +------------+      |
| | Total      | | Jobs       | | Minutes    | | Storage    |      |
| | Users      | | Today      | | This Month | | Used       |      |
| |            | |            | |            | |            |      |
| | 1,355      | | 47         | | 6,200 min  | | 0.00 GB    |      |
| |            | |            | | ≈ 103 hrs  | |            |      |
| +------------+ +------------+ +------------+ +------------+      |
|                                                                  |
| TODAY'S ACTIVITY (2 cards side by side)                          |
|                                                                  |
| +---------------------------+ +---------------------------+      |
| | Today's Activity          | | Last Hour                 |      |
| |                           | |                           |      |
| | Jobs Today: 47            | | ✓ Completed: 3            |      |
| | Success Rate: 97.9%       | | ✗ Failed: 0               |      |
| | Failure Rate: 2.1%        | | ⏱ Processing: 1            |      |
| | [⚠️ Spike Alert if > 2x]   | | Total: 4 jobs             |      |
| +---------------------------+ +---------------------------+      |
|                                                                  |
| CHARTS (2 charts side by side)                                   |
|                                                                  |
| +---------------------------+ +---------------------------+      |
| | Job Statistics (30 days)  | | Usage Trends (30 days)    |      |
| |                           | |                           |      |
| | [Line chart showing:]     | | [Line chart showing:]     |      |
| | • Total jobs per day      | | • Minutes transcribed/day |      |
| | • Completed jobs          | |                           |      |
| | • Failed jobs             | |                           |      |
| +---------------------------+ +---------------------------+      |
|                                                                  |
| USER SEARCH & LIST                                               |
|                                                                  |
| Search by email: [_________________] [Search]                    |
|                                                                  |
| +--------------------------------------------------------------+ |
| | Email                  | Full Name      | Joined            | |
| |------------------------|----------------|-------------------| |
| | user1@example.com      | John Doe       | Oct 20, 2024      | |
| | user2@example.com      | Jane Smith     | Oct 19, 2024      | |
| | user3@example.com      | Bob Wilson     | Oct 18, 2024      | |
| |                        |                |                   | |
| | Showing 1-20 of 1,355 total users                            | |
| | [Load More]                                                  | |
| +--------------------------------------------------------------+ |
|                                                                  |
+------------------------------------------------------------------+

Note: Some metrics are disabled for performance:
• Tier breakdown (Free/Creator/Pro counts) - requires Stripe API calls
• Active jobs count - disabled for performance
• Total jobs all time - disabled for performance
• Storage tracking - disabled (shows 0 GB)
```

### Navigation Flow Map

```
═══════════════════════════════════════════════════════════════════════
NAVIGATION FLOW MAP
═══════════════════════════════════════════════════════════════════════

PUBLIC FLOW
───────────
Landing (/) → Sign Up (/sign-up) → Email Verification → /app/transcripts
          ↘
           Sign In (/sign-in) → /app/transcripts


AUTHENTICATED WORKFLOW FLOW
───────────────────────────
/app/transcripts (Main Dashboard)
  ├─ [Upload Area] → Trigger Workflow
  │    ↓
  │  Background Job Processing (Trigger.dev)
  │    ├─ File validation (0-10%)
  │    ├─ Audio extraction with FFmpeg (10-30%)
  │    ├─ Whisper transcription (30-90%)
  │    └─ GPT-5 AI summary if Creator/Pro (90-100%)
  │    ↓
  ├─ Active Jobs Section (Progress tracking)
  │    ↓
  └─ Completed Jobs → [View Results] → /app/transcripts/[transcriptId]
                                          ↓
                                    Results Viewer
                                    ├─ Transcript tab (timestamped text)
                                    ├─ AI Summary tab (Creator/Pro)
                                    ├─ Ask Scribo tab (Pro)
                                    └─ Download exports (TXT/SRT/VTT/JSON)


/app/profile (Unified Profile)
  ├─ Account Info Card
  ├─ Usage Statistics Card
  ├─ Billing Management Card → [Manage Billing] → Stripe Portal
  └─ Subscription Plans Card → [Upgrade] → Stripe Checkout


/admin/dashboard (Admin Only - Single scrollable page)
  ├─ System Metrics (4 cards)
  ├─ Today's Activity + Last Hour (2 cards)
  ├─ Job Statistics Chart + Usage Trends Chart (30 days)
  └─ User Search & List (email search, pagination)


EXTERNAL INTEGRATIONS
──────────────────────
Stripe Checkout → Payment → Webhook → Update subscription → /app/profile

Stripe Portal → Manage billing → Webhook → Update subscription → /app/profile

Trigger.dev Jobs → Process transcription → Webhook → Update status →
  User sees progress on /app/transcripts
```

### Key Workflow Patterns

**Input Method Detected: File Upload**
- Drag-drop upload zone for audio/video files (MP3, MP4, WAV, MOV, M4A)
- File validation based on tier (15/60/120 min max)
- Configuration options: Language selection, timestamp precision

**Progress Tracking: Real-Time via Trigger.dev**
- 4-stage workflow with progress percentages
- Estimated time remaining displayed
- Jobs continue in background if user navigates away

**Results Display: Tab-Based Viewer**
- Primary output: Timestamped transcript (always available)
- Secondary output: AI summary (Creator/Pro tiers)
- Tertiary output: Ask Scribo chat (Pro tier)
- Multiple export formats with tier restrictions

**Quota Enforcement:**
- Free: 3 uploads/mo, 15 min max, TXT/SRT only
- Creator: 50 uploads/mo, 60 min max, + VTT/JSON
- Pro: Unlimited uploads, 120 min max, all formats

**Navigation Structure:**
- 📜 Transcripts (main workflow page)
- 👤 Profile (account + billing + usage + plans)
- 📊 Admin (single-page dashboard) - role-based

**Admin Dashboard Features (Single Page):**
- System metrics: Total users, jobs today, minutes this month, storage used
- Activity tracking: Today's summary + last hour breakdown
- Charts: Job statistics (30 days), Usage trends (30 days)
- User management: Search by email, view basic user info, pagination
- Performance optimizations: Some metrics disabled to avoid slow queries

**Admin Dashboard Limitations:**
- No tier breakdown (Free/Creator/Pro counts) - requires expensive Stripe API calls
- No active jobs tracking - disabled for performance
- No revenue/cost analytics - not implemented
- No conversion metrics - not implemented
- No user detail modal or ban/suspend actions - not implemented

**Total Pages: 9 pages**
- Public: 4 pages (landing, privacy, terms, refunds)
- Auth: 4 pages (sign-in, sign-up, reset-password, verify-email)
- Protected: 2 pages (transcripts main, transcript viewer)
- Profile: 1 page (unified cards layout)
- Admin: 1 page (single scrollable dashboard)
