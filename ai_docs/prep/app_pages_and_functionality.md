# App Pages & Functionality Blueprint

### App Summary

**End Goal:** Help solo creators and podcasters convert their audio and video content into accurate, searchable transcripts using AI-powered transcription workflows built with Whisper, FFmpeg, and Trigger.dev

**Core Value Proposition:** Save creators 5-10 hours weekly by eliminating slow, inconsistent manual transcription and enabling easy content repurposing across platforms

**Target Users:** Solo creators, podcasters, and small YouTubers producing audio/video content weekly

**Template Type:** worker-simple (background job processing with Trigger.dev)

---

## 🌐 Universal SaaS Foundation

### Public Marketing Pages

- **Landing Page** — `/`
  - Hero: "Turn Audio Into Text in Minutes"
  - Problem highlight: "Stop wasting 5-10 hours weekly on manual transcription"
  - Feature showcase: AI-powered, fast processing, multiple export formats (SRT, VTT, TXT)
  - Pricing section (embedded): 3-tier comparison cards side-by-side
    - Free: 3 uploads/month, 15 min max, segment timestamps, TXT/SRT exports
    - Creator ($19/mo): 50 uploads/month, 60 min max, word-level timestamps, GPT-5 summaries, VTT/JSON exports
    - Pro ($49/mo): Unlimited uploads, 120 min max, full AI summaries with show notes, all export formats
  - FAQ section: Common questions about billing, refunds, upgrades, file limits
  - CTA: "Start Transcribing Free" driving to sign-up

- **Legal Pages** — `/privacy`, `/terms`, `/refunds`
  - Privacy policy (GDPR compliance)
  - Terms of service (SaaS operations)
  - Refund policy (optional)

### Authentication Flow

- **Login** — `/sign-in` (Email/password, OAuth via Google and GitHub)
- **Sign Up** — `/sign-up` (Account creation, auto-assign Free tier)
- **Password Reset** — `/reset-password` (Email reset flow)
- **Email Verification** — `/verify-email` (Confirm email after signup)

---

## ⚡ Core Application Pages

### Main Transcription Workflow

- **Transcripts (Main Page)** — `/app/transcripts`
  - Upload area (top section):
    - Drag-and-drop file upload zone (MP3, MP4, WAV, MOV, M4A)
    - File validation based on plan tier: Free (15 min max), Creator (60 min max), Pro (120 min max)
    - Job configuration settings:
      - Language selection (auto-detect or manual: English, Spanish, French, German, etc.)
      - Timestamp precision: Segment-level (Free) vs Word-level (Creator/Pro)
    - Quota display: "You have X uploads remaining this month" with progress bar
    - Submit uploads directly from this page

  > 💡 **Decision Helper:** Combining upload and job tracking on the same page creates a unified workflow. Users can see their upload history and progress without switching screens, which works well when jobs complete quickly enough that users stay on the page to see results.

  - Active/Processing jobs section (inline):
    - Real-time status tracking via Trigger.dev
    - Job cards showing: File name, upload date/time, status badge, progress percentage
    - Progress stages displayed inline:
      1. File validation ✓ (0-10%)
      2. Audio extraction with FFmpeg (10-30%)
      3. Whisper transcription (30-90%)
      4. GPT-5 AI summary if Creator/Pro tier (90-100%)
    - Estimated time remaining, file metadata (duration, size, format)
    - Actions: "View Transcript" button (available after Whisper completes), "Delete" button
    - Error handling: User-friendly error message, "Retry" button for failed jobs
    - Note: Progress persists when navigating away - jobs continue in background

  > 💡 **Decision Helper:** If your workflow takes longer than 30 seconds to complete, consider showing real-time progress updates to keep users informed. This helps reduce anxiety during long-running operations like transcription or AI processing.
  - Completed transcriptions section:
    - Browse all past transcription jobs with pagination (20 per page)
    - Filters: Status (All, Completed, Failed), Sort by date (Newest/Oldest), Date range picker
    - List view showing: File name, upload date, duration, detected language, status badge
    - Quick actions per item: "View Transcript", "Download" dropdown (TXT/SRT/VTT/JSON), "Delete"
  - Empty state (first-time users): "Upload your first file to get started" with prominent upload area
  - Upgrade prompt if on Free tier and approaching limits

- **Transcript Viewer** — `/app/transcripts/[transcriptId]`
  - Transcript header: File name, transcription date, duration, detected language
  - Back navigation: "← Back to Transcripts" link
  - Tab-based results display:
    - **Transcript Tab**: Timestamped text blocks (segment-level or word-level), copy to clipboard
    - **AI Summary Tab** (Creator/Pro only): Key highlights, topics, show notes, social captions
    - **Ask Scribo Tab** (Pro only): Chat with AI about the transcript content
  - Export options: Generate and download TXT, SRT, VTT, JSON (Pro), verbose_json (Pro)
  - Actions: "Download All Formats" (zip file), "Delete Transcript" button

  > 💡 **Decision Helper:** Using tabs for different output types (transcript, summary, chat) works well when you have multiple ways users might want to interact with results. This keeps the interface clean while making all features easily accessible.

### User Account Management

- **Profile** — `/app/profile`
  - Card-based layout (4 cards in 2-column grid on desktop, 1-column on mobile):
    - **Account Information Card**:
      - Avatar upload
      - Display name
      - Email (view-only with verification status)
      - Change password button
      - Delete account button (with confirmation modal)
    - **Billing Management Card**:
      - Current plan display: Plan name (Free/Creator/Pro), monthly cost, renewal date
      - Payment method: Display saved card (last 4 digits)
      - "Manage Billing" button → Opens Stripe Customer Portal (external)
    - **Usage Statistics Card**:
      - Uploads used this month: Progress bar (e.g., "12/50 uploads" with 24% filled bar)
      - Minutes transcribed this month: Total count
      - Storage used: Progress bar (e.g., "1.2/5 GB" with percentage)
    - **Subscription Plans Card**:
      - Free tier card: 3 uploads/mo, 15 min max, segment timestamps, TXT/SRT exports
        - Button: "Current Plan ✓" or "Start Free"
      - Creator tier card ($19/mo): 50 uploads/mo, 60 min max, word-level timestamps, GPT-5 summaries
        - Badge: "Most Popular"
        - Button: "Current Plan ✓" or "Upgrade" → Stripe Checkout
      - Pro tier card ($49/mo): Unlimited uploads, 120 min max, full AI summaries, all export formats
        - Button: "Current Plan ✓" or "Upgrade" → Stripe Checkout
  - Invoice history section (below cards):
    - Table with columns: Date, Amount, Status, Download link
    - Shows past invoices with PDF download option

---

## 👥 Admin Features

### Admin Dashboard (Role-Based Access)

- **Admin Dashboard (Single Scrollable Page)** — `/admin/dashboard`
  - **System Metrics Cards** (4 cards in a row):
    - Total users (count)
    - Jobs today (count)
    - Minutes transcribed this month (with hours subtitle)
    - Storage used (displays 0 GB - tracking disabled for performance)

  - **Today's Activity Section** (2 cards side by side):
    - Today's Activity Card:
      - Jobs today count
      - Success rate (24h)
      - Failure rate (24h)
      - Error spike alert badge (if failure rate > 2x normal)
    - Last Hour Card:
      - Completed jobs (last 60 min)
      - Failed jobs (last 60 min)
      - Processing jobs (currently active)
      - Total jobs this hour

  - **Charts Section** (2 charts side by side):
    - Job Statistics Chart (last 30 days):
      - Line chart showing total, completed, and failed jobs per day
    - Usage Trends Chart (last 30 days):
      - Line chart showing minutes transcribed per day

  - **User Search & List**:
    - Search by email (text input with search button)
    - User table columns: Email, Full Name, Joined Date
    - Pagination: "Load More" button, shows "1-20 of X total users"
    - No tier/status filters
    - No user actions (view/ban/suspend)

  > 💡 **Performance Trade-offs:** Several features are intentionally disabled to prevent slow database queries and expensive API calls:
  > - Tier breakdown (Free/Creator/Pro counts) - would require Stripe API calls for every user
  > - Active jobs tracking - disabled for performance
  > - Total jobs all time - disabled for performance
  > - Queue wait time calculation - disabled (causes timeouts)
  > - Revenue/cost analytics - not implemented
  > - Conversion metrics - not implemented
  > - User detail modal - not implemented
  > - Ban/suspend actions - not implemented

---

## 📱 Navigation Structure

### Main Sidebar (Responsive)

- 📜 **Transcripts** — Main page with upload area, active jobs, and completed transcriptions
- 👤 **Profile** — Account, billing, usage, and subscription management
- 📊 **Admin Dashboard** (Admin only - role-based visibility) — Single-page system monitoring dashboard

### Usage Stats Box (Sidebar Footer)

- Displays current month usage: "12/50 uploads"
- Shows current plan tier: "Creator plan"
- Quick visual indicator of quota consumption

### Mobile Navigation

- Bottom tab bar: Transcripts, Profile, Admin (if admin role)
- Collapsible sidebar with touch-optimized interface
- Header: Logo (left), user avatar dropdown (right)

---

## 🔧 Next.js App Router Structure

### Layout Groups

```
app/
├── (public)/          # Marketing and legal pages (no auth)
├── (auth)/            # Authentication flow
└── (protected)/       # Main authenticated app (includes admin routes with role check)
    ├── transcripts/   # User workflow pages
    ├── profile/       # User profile page
    └── admin/         # Admin dashboard (role-based access via layout)
        └── dashboard/ # Single-page admin dashboard
```

### Complete Route Mapping

**🌐 Public Routes (No Auth Required)**

- `/` → Landing page with embedded pricing section
- `/privacy` → Privacy policy
- `/terms` → Terms of service
- `/refunds` → Refund policy (optional)

**🔐 Auth Routes (Redirect if Authenticated)**

- `/sign-in` → User login
- `/sign-up` → User registration
- `/reset-password` → Password reset flow
- `/verify-email` → Email verification

**🛡️ Protected Routes (Auth Required)**

- `/app/transcripts` → Main page (upload area, active jobs, completed transcriptions)
- `/app/transcripts/[transcriptId]` → Transcript viewer (read-only with AI summary panel)
- `/app/profile` → Profile with 4 cards (account, billing, usage, subscription plans)

**👑 Admin Routes (Admin Role Required)**

- `/admin/dashboard` → Single-page admin dashboard (system metrics, charts, user search)

**🔧 Backend Architecture**

**API Endpoints (External Communication Only)**

- `/api/webhooks/stripe/route.ts` → Handle subscription changes from Stripe
- `/api/webhooks/trigger/route.ts` → Receive job status updates from background processing
- `/api/download/[transcriptId]/[format]/route.ts` → Generate file downloads

**Server Actions (Internal App Operations)**

- `app/actions/transcription.ts` → Handle uploads, create jobs, manage transcripts
- `app/actions/subscription.ts` → Process billing and subscription changes
- `app/actions/profile.ts` → Update user account settings
- `app/actions/admin.ts` → Manage users and view system data

**Database Queries (Data Layer)**

- `lib/queries/transcriptions.ts` → Fetch job and transcript data
- `lib/queries/usage.ts` → Check quotas and track usage
- `lib/queries/subscriptions.ts` → Get subscription information
- `lib/queries/admin.ts` → Pull system metrics and analytics

**How It Connects**

- **User actions in the app**: User clicks button → Server Action runs → Database query → Return result
- **External services**: User clicks "Upgrade" → API endpoint called → Stripe processes → Success
- **Background updates**: Stripe/Trigger.dev sends event → Webhook receives → Updates database → User sees change

> 💡 **Decision Helper:** Separating Server Actions (internal operations) from API endpoints (external webhooks) creates a clear boundary. Server Actions handle user interactions within your app, while API endpoints only respond to external services like Stripe or background job systems.

---

## 💰 Business Model Integration

### Subscription Tiers & Quota Enforcement

**Free Tier ($0/month)**

- 3 uploads per month
- 15 minutes max per file
- Segment-level timestamps
- Export formats: TXT, SRT
- No AI summaries
- Quota enforcement: Block uploads after 3/month, block files over 15 min, hide advanced features

**Creator Tier ($19/month)**

- 50 uploads per month
- 60 minutes max per file
- Word-level timestamps available
- Export formats: TXT, SRT, VTT, JSON
- GPT-5 AI summaries (basic): Key highlights, topics, basic show notes, social captions
- Quota enforcement: Block uploads after 50/month, block files over 60 min

**Pro Tier ($49/month)**

- Unlimited uploads
- 120 minutes max per file
- Word-level timestamps included
- Export formats: All (TXT, SRT, VTT, JSON, verbose_json)
- GPT-5 AI summaries (full): Key highlights, topics, comprehensive show notes, social captions, content repurposing suggestions
- Quota enforcement: No upload limit, block files over 120 min

### Stripe Integration Architecture

**Subscription Flow:**

1. User signs up → Auto-assign Free tier
2. User upgrades → Stripe Checkout session
3. Payment completes → Stripe webhook updates subscription status
4. Monthly renewal → Stripe auto-charges, resets usage quota
5. Cancellation → Subscription active until period end, then downgrade to Free

**Database Schema:**

- `user_subscriptions` table: stripe_customer_id, stripe_subscription_id, plan_tier, status, current_period_start/end
- `usage_tracking` table: user_id, month, uploads_count, minutes_transcribed, storage_bytes

**Quota Enforcement:**

- Check user's plan before allowing uploads
- Validate file size/duration matches their tier limits
- Block uploads when monthly quota is reached
- Show upgrade prompts at the right moments

> 💡 **Decision Helper:** Enforcing quotas requires checking limits in multiple places: when showing the upload button (so users see it's disabled), when processing the upload (so they can't bypass client-side checks), and when displaying usage stats (so they know how close they are to limits).

---

## 🎯 MVP Functionality Summary

This blueprint delivers your core value proposition: **Save creators 5-10 hours weekly by automating transcription and enabling easy content repurposing**

**Phase 1 (Launch Ready):**

- Universal SaaS foundation (auth, legal, responsive design)
- Complete upload-to-export transcription workflow (Frontend + Backend + Background Jobs)
- Real-time job progress tracking with Trigger.dev
- Native Whisper features: Word-level timestamps, multiple export formats (SRT/VTT/TXT/JSON), automatic language detection
- GPT-5 AI summaries for Creator/Pro tiers (show notes, social captions, highlights)
- 3-tier subscription system with Stripe integration (Free/Creator/Pro)
- Quota enforcement and usage tracking per plan tier
- Admin dashboard: System metrics, job/usage charts, basic user search (simplified for performance)
- Supabase Storage for file uploads and transcripts
- Mobile-responsive design with collapsible sidebar

**Phase 2 (Growth Features):**

- Speaker diarization (requires WhisperX or Pyannote integration)
- Transcript editing capability (make corrections before export)
- Search within transcripts
- Email notifications for job completion
- Annual billing option (2 months free discount)
- Team/Agency plans (multi-user accounts)
- Affiliate/referral program
- Custom enterprise pricing
- Enhanced admin features:
  - Revenue vs cost analytics (Stripe MRR vs API costs)
  - Conversion metrics (free → paid upgrade tracking)
  - User tier breakdown (requires caching Stripe data)
  - User detail modal with ban/suspend actions
  - Top users by usage section

**Technology Stack:**

- **Frontend**: Next.js 15, React, Tailwind CSS v4 (Creator Pink theme)
- **Backend**: Next.js Server Actions, API Routes (webhooks only)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (email/password + OAuth)
- **Storage**: Supabase Storage (file uploads)
- **Background Jobs**: Trigger.dev (FFmpeg, Whisper API, GPT-5 API)
- **Payments**: Stripe (Checkout, Customer Portal, Webhooks)
- **AI Services**: OpenAI Whisper API (transcription), OpenAI GPT-5 API (summaries)

**Key Design Decisions:**

- ✅ Using Whisper API directly (simpler than managing third-party transcription services)
- ✅ Read-only transcript viewer in MVP (editing comes later if users need it)
- ✅ Keep it simple first - no search, no email notifications (add these if users ask for them)
- ✅ Let Stripe manage subscription status (don't duplicate in our database)
- ✅ Only essential webhooks (Stripe payments, job status updates)
- ✅ Check quotas in real-time before users hit limits
- ✅ Consolidated transcripts page combines upload + active jobs + history (reduces navigation)
- ✅ Profile shows everything in one view with cards (account, billing, usage, plans)
- ✅ Single admin dashboard (scrollable page with all metrics, no tabs needed)
- ✅ Store AI API keys on backend only (users never see them)
- ✅ Show transcript as soon as it's ready (AI summary can load in the background)
- ✅ Jobs keep running even if user navigates away (they can come back later to check)

> **Next Step:** Ready for wireframe design with this concrete blueprint

---

**Total Pages: 9 pages** (simplified from 19!)

- Public: 4 pages (landing with embedded pricing, privacy, terms, refunds)
- Auth: 4 pages (sign-in, sign-up, reset-password, verify-email)
- Protected: 2 pages (transcripts main page, transcript viewer)
- Profile: 1 page (unified card layout)
- Admin: 1 page (single scrollable dashboard at `/admin/dashboard`)
