# Course/Training Platform Roadmap

> Exploration document for adding Kajabi/Teachable-style course platform capabilities to Site Engine.
> Status: **Exploratory** - Not committed. Phase 0 content blocks may be implemented independently.

---

## Overview

Site Engine could evolve from a website builder into a platform that enables users to create and sell online courses, memberships, and training programs. This document outlines what that would require.

### Current Architecture

```
Headstringweb.com (Platform)
└── Users (site owners)
    └── Sites (websites)
        └── Pages → Sections
```

### Course Platform Architecture

```
Headstringweb.com (Platform)
├── Platform Admins
├── Site Owners (course creators)
│   └── Sites
│       ├── Pages → Sections (current)
│       ├── Courses
│       │   └── Modules → Lessons
│       └── Students (site-scoped)
│           └── Enrollments, Progress, Payments
```

This is a **B2B2C model** - the platform enables site owners to run businesses with their own customers.

---

## Phase 0: Content Blocks (No Infrastructure)

**Goal:** Add blocks that let site owners display course-related content and link to external platforms for delivery.

**Value:** Course landing pages, marketing sites, free content display. No auth/payment complexity.

**Approach:** Extend 1 existing primitive + add 4 new primitives. Avoids block proliferation.

### Summary

| Change | Type | Description |
|--------|------|-------------|
| **Media** | Extend | Add `video` and `audio` modes |
| **Pricing** | New Primitive | Pricing tiers with feature comparison |
| **Calendar** | New Primitive | Events list, countdown, add-to-calendar |
| **Accordion** | New Primitive | Collapsible FAQ, curriculum, custom |
| **Showcase** | New Primitive | Modes: `stats` (counters) + `downloads` (files) |

---

### 1. Media Primitive Extension

Add `video` and `audio` modes to the existing Media primitive.

**Current modes:** `single`, `gallery`, `embed`
**New modes:** `video`, `audio`

#### Video Mode

Native video player with enhanced features beyond simple embed.

**Features:**
- Custom video player UI (play/pause, progress bar, volume, fullscreen)
- Playback speed control (0.5x, 1x, 1.25x, 1.5x, 2x)
- Chapter markers/timestamps (clickable list)
- Poster image (thumbnail before play)
- Autoplay, loop, muted options
- Responsive aspect ratios

**Additional MediaContent fields:**
```typescript
// Add to existing MediaContent interface
interface MediaContent extends SectionStyling {
  mode: "single" | "gallery" | "embed" | "video" | "audio";

  // ... existing fields ...

  // ===== VIDEO MODE =====
  videoSrc?: string;              // Direct URL (Supabase Storage, CDN, etc.)
  posterImage?: string;           // Thumbnail before play
  chapters?: VideoChapter[];      // Chapter markers

  // Video player options
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  showControls?: boolean;
  allowSpeedControl?: boolean;
  allowFullscreen?: boolean;

  // ===== AUDIO MODE =====
  audioSrc?: string;
  audioTitle?: string;
  audioArtist?: string;
  audioCoverImage?: string;
  audioDuration?: string;
  showDownloadButton?: boolean;

  // Audio playlist (optional)
  audioTracks?: AudioTrack[];
}

interface VideoChapter {
  timestamp: number;              // Seconds from start
  title: string;
}

interface AudioTrack {
  id: string;
  src: string;
  title: string;
  artist?: string;
  coverImage?: string;
  duration?: string;
}
```

**Implementation Notes:**
- Video: HTML5 `<video>` with custom controls, or use Plyr/Video.js library
- Audio: HTML5 `<audio>` with custom styled player
- Storage: Supabase Storage for self-hosted, or support external URLs (Bunny, Mux, etc.)
- Chapters: Display as sidebar list or overlay, click to seek

---

### 2. Accordion Primitive (NEW)

Collapsible sections for FAQ, curriculum, or any expandable content.

**Modes:**
- `faq` - Question/answer pairs
- `curriculum` - Course outline with modules/lessons
- `custom` - Generic collapsible sections

**Features:**
- Expand/collapse animation (smooth height transition)
- "Expand All" / "Collapse All" toggle
- Icon styles (chevron, plus/minus)
- Optional numbering
- Nested levels (curriculum mode)
- Keyboard accessible

**Content Interface:**
```typescript
interface AccordionContent extends SectionStyling {
  mode: "faq" | "curriculum" | "custom";

  // Section header
  sectionTitle?: string;
  sectionSubtitle?: string;

  // Items
  items: AccordionItem[];

  // Display options
  allowMultipleOpen?: boolean;    // Default: false (one at a time)
  defaultOpenIndex?: number;      // -1 for all closed, 0+ for specific item
  showExpandAll?: boolean;
  iconStyle?: "chevron" | "plus-minus";
  showNumbers?: boolean;

  // Curriculum-specific
  showDuration?: boolean;         // Show time estimates
  showLessonCount?: boolean;      // "5 lessons" per module
}

interface AccordionItem {
  id: string;
  title: string;
  content: string;                // Rich text HTML

  // Curriculum mode extras
  duration?: string;              // "15 min"
  lessonCount?: number;
  isLocked?: boolean;           // Show lock icon
  isCompleted?: boolean;        // Show checkmark (display only in Phase 0)

  // Nested items (curriculum mode)
  children?: AccordionItem[];
}
```

---

### 3. Pricing Primitive (NEW)

Display pricing tiers for courses, memberships, or services.

**Features:**
- 2-4 pricing columns
- Monthly/annual toggle with savings badge
- Feature checklist with check/x icons
- Highlighted "popular" tier
- CTA buttons per tier

**Content Interface:**
```typescript
interface PricingContent extends SectionStyling {
  // Section header
  sectionTitle?: string;
  sectionSubtitle?: string;

  // Pricing options
  showBillingToggle?: boolean;
  defaultBilling?: "monthly" | "annual";
  annualSavingsLabel?: string;    // "Save 20%"

  // Tiers
  tiers: PricingTier[];

  // Display options
  highlightedTierId?: string;     // Which tier to highlight as "popular"
  columns?: 2 | 3 | 4;
}

interface PricingTier {
  id: string;
  name: string;                   // "Starter", "Pro", "Enterprise"
  description?: string;

  // Pricing
  monthlyPrice?: number;          // null = "Contact us" or custom
  annualPrice?: number;
  currency?: string;              // "USD", "EUR"
  customPriceLabel?: string;      // "Contact us", "Free"

  // Features
  features: PricingFeature[];

  // CTA
  ctaText: string;
  ctaUrl: string;
  ctaVariant?: "primary" | "secondary" | "outline";
}

interface PricingFeature {
  text: string;
  included: boolean;              // true = checkmark, false = x
  tooltip?: string;               // Hover explanation
}
```

---

### 4. Calendar Primitive (NEW)

Display upcoming events, webinars, or office hours.

**Modes:**
- `list` - Upcoming events list
- `countdown` - Countdown timer to a specific event
- `embed` - Calendly, Cal.com, or other scheduling embed

**Features:**
- List view of upcoming events with date/time
- Countdown timer with days/hours/minutes
- "Add to Calendar" buttons (Google, iCal, Outlook)
- Timezone display/conversion
- Virtual vs. in-person indicators

**Content Interface:**
```typescript
interface CalendarContent extends SectionStyling {
  mode: "list" | "countdown" | "embed";

  // Section header
  sectionTitle?: string;
  sectionSubtitle?: string;

  // List mode
  events?: CalendarEvent[];
  maxEvents?: number;
  showPastEvents?: boolean;

  // Countdown mode
  countdownEventId?: string;      // Which event to countdown to
  showCountdownDays?: boolean;
  showCountdownHours?: boolean;
  showCountdownMinutes?: boolean;
  countdownFinishedText?: string; // "Event has started!"

  // Embed mode (Calendly, Cal.com, etc.)
  embedCode?: string;

  // Options
  showAddToCalendar?: boolean;
  timezone?: string;              // Display timezone
}

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: string;              // ISO datetime
  endDate?: string;
  location?: string;              // Physical or URL
  isVirtual?: boolean;
  meetingUrl?: string;
  recurrence?: "once" | "weekly" | "monthly";
}
```

---

### 5. Showcase Primitive (NEW)

Combines stats/counters and file downloads into a single flexible primitive.

**Modes:**
- `stats` - Animated number counters for social proof
- `downloads` - File download list/grid

#### Stats Mode

**Features:**
- Animated count-up on scroll into view
- Multiple stats in a row (2-4 columns)
- Icons or custom labels
- Prefix/suffix support ("+", "K", "%", "$")

#### Downloads Mode

**Features:**
- File list with type icons (PDF, ZIP, DOC, etc.)
- Download buttons
- File size display
- Optional descriptions
- List or grid layout

**Content Interface:**
```typescript
interface ShowcaseContent extends SectionStyling {
  mode: "stats" | "downloads";

  // Section header
  sectionTitle?: string;
  sectionSubtitle?: string;

  // ===== STATS MODE =====
  stats?: StatItem[];
  animateOnScroll?: boolean;
  animationDuration?: number;     // ms (default: 2000)

  // ===== DOWNLOADS MODE =====
  files?: DownloadFile[];
  downloadLayout?: "list" | "grid";
  showFileSize?: boolean;
  showFileType?: boolean;

  // Shared layout
  columns?: 2 | 3 | 4 | "auto";
}

interface StatItem {
  id: string;
  value: number;
  prefix?: string;                // "$"
  suffix?: string;                // "+", "K", "%"
  label: string;                  // "Students Enrolled"
  icon?: string;                  // Lucide icon name
}

interface DownloadFile {
  id: string;
  title: string;
  description?: string;
  fileUrl: string;
  fileType?: "pdf" | "zip" | "doc" | "xls" | "ppt" | "image" | "video" | "audio" | "other";
  fileSize?: string;              // "2.4 MB"
  thumbnail?: string;             // Preview image
}
```

---

### Phase 0 Implementation Priority

1. **Media (video/audio modes)** - Core learning content, extends existing primitive
2. **Accordion** - Most versatile, useful for FAQ and curriculum display
3. **Pricing** - Essential for selling courses
4. **Showcase (stats)** - Quick win, good for landing pages
5. **Showcase (downloads)** - Simple, useful for lead magnets
6. **Calendar** - Lower priority, Calendly embed covers most cases

---

## Phase 1: Student Accounts (Foundation)

**Goal:** Enable site owners to have "members" who can log in to their site.

**Prerequisites:** Phase 0 blocks implemented

### Database Schema

```sql
-- Students are users scoped to a specific site
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  auth_provider TEXT DEFAULT 'email',  -- email, google, magic_link
  password_hash TEXT,                   -- null for OAuth/magic link
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,
  UNIQUE(site_id, email)
);

-- Courses belong to a site
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  cover_image TEXT,
  access_type TEXT DEFAULT 'free',      -- free, paid, subscription
  price_cents INTEGER,
  currency TEXT DEFAULT 'USD',
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(site_id, slug)
);

-- Modules organize lessons within a course
CREATE TABLE course_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  drip_days INTEGER,                    -- null = immediate, N = unlock N days after enrollment
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lessons are the actual content
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES course_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  content_type TEXT NOT NULL,           -- video, text, audio, quiz
  content JSONB NOT NULL DEFAULT '{}',  -- Type-specific content
  position INTEGER NOT NULL DEFAULT 0,
  is_preview BOOLEAN DEFAULT FALSE,     -- Free preview even for paid courses
  duration_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enrollments link students to courses
CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,               -- null = lifetime access
  access_type TEXT NOT NULL,            -- free, paid, gifted, subscription
  stripe_subscription_id TEXT,
  UNIQUE(student_id, course_id)
);

-- Track progress per lesson
CREATE TABLE lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  progress_percent INTEGER DEFAULT 0,
  video_position_seconds INTEGER,       -- Resume position
  UNIQUE(enrollment_id, lesson_id)
);
```

### New Routes

```
app/(student)/
  [siteSlug]/
    login/page.tsx              -- Student login for this site
    register/page.tsx           -- Student registration
    forgot-password/page.tsx
    dashboard/page.tsx          -- My courses, progress
    courses/[courseSlug]/
      page.tsx                  -- Course landing/sales page
    learn/[courseSlug]/
      page.tsx                  -- Course player (requires enrollment)
      [lessonSlug]/page.tsx     -- Individual lesson
```

### Auth Considerations

**Option A: Separate Student Auth (Recommended)**
- Students exist only in `students` table
- Magic link or email/password auth
- Session stored in cookie scoped to site
- Simpler: students don't need full Supabase auth

**Option B: Unified Supabase Auth**
- Students are Supabase users with a `student` role
- More complex RLS policies
- Students could potentially access multiple sites

---

## Phase 2: Payments (Stripe)

**Goal:** Enable site owners to charge for courses.

### Stripe Integration Options

**Option A: Direct Keys (Simpler)**
- Site owner enters their own Stripe API keys
- You provide the infrastructure, they handle payments directly
- No platform fees, no Stripe Connect complexity
- Risk: Keys stored in your database

**Option B: Stripe Connect (Marketplace)**
- Site owners connect their Stripe account via OAuth
- Platform can take a percentage of each sale
- Better UX, more compliant
- Complexity: Onboarding flow, Connect webhooks

### Database Additions

```sql
-- Site payment settings
ALTER TABLE sites ADD COLUMN stripe_account_id TEXT;
ALTER TABLE sites ADD COLUMN stripe_publishable_key TEXT;
ALTER TABLE sites ADD COLUMN payment_enabled BOOLEAN DEFAULT FALSE;

-- Payment records
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES sites(id),
  student_id UUID NOT NULL REFERENCES students(id),
  course_id UUID REFERENCES courses(id),
  stripe_payment_intent_id TEXT,
  stripe_checkout_session_id TEXT,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL,                 -- pending, succeeded, failed, refunded
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Checkout Flow

1. Student clicks "Enroll" on course page
2. Redirect to Stripe Checkout (or embedded checkout)
3. Stripe webhook confirms payment
4. Create enrollment record
5. Redirect to course player

---

## Phase 3: Advanced Features

### Subscriptions
- Recurring billing for membership sites
- Access to all courses or course bundles
- Pause/cancel subscription handling

### Drip Content
- Lessons unlock based on enrollment date
- "Available in 3 days" display
- Email notifications when content unlocks

### Quizzes/Assessments
- Question types: multiple choice, true/false, fill-in-blank
- Scoring with pass/fail thresholds
- Required to complete before next lesson
- Database schema for questions and responses

### Certificates
- Auto-generated on course completion
- PDF generation (react-pdf or similar)
- Unique certificate ID for verification
- Custom certificate templates

### Community Features
- Comments on lessons
- Discussion forums per course
- Q&A with instructor responses

---

## Competitive Analysis

| Feature | Kajabi | Teachable | Thinkific | Site Engine (Vision) |
|---------|--------|-----------|-----------|---------------------|
| Website Builder | Yes | Limited | Limited | Yes (core strength) |
| Course Hosting | Yes | Yes | Yes | Phase 1+ |
| Video Hosting | Yes (Wistia) | Yes | Yes | Phase 0 (embed), Phase 1+ (native) |
| Payments | Stripe | Stripe | Stripe | Phase 2 |
| Email Marketing | Yes | Limited | Integrations | Future |
| Community | Yes | Limited | Limited | Phase 3 |
| Pricing | $149-399/mo | $0-199/mo | $0-199/mo | TBD |

### Differentiation Opportunity
- **Website-first approach**: Better marketing sites than course-first platforms
- **Simpler pricing**: Could undercut Kajabi significantly
- **Modern stack**: Next.js 15, better performance than legacy platforms
- **AI-powered**: Theme generation, potentially content assistance

---

## Open Questions

1. **Student auth strategy**: Separate table vs. Supabase auth with roles?
2. **Video hosting**: Self-hosted (Supabase Storage), Bunny Stream, Mux, or Cloudflare Stream?
3. **Stripe approach**: Direct keys or Stripe Connect?
4. **Pricing model**: Per-site fee, per-student fee, or transaction percentage?
5. **Scope**: Full LMS or "website builder with course pages" (lighter)?

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-01-21 | Created roadmap | Exploring feasibility, not committed |
| | Phase 0 may proceed independently | Content blocks add value regardless of full platform |

---

## Related Documents

- `ai_docs/features-backlog.md` - Main feature backlog
- `lib/section-types.ts` - Current block type definitions
