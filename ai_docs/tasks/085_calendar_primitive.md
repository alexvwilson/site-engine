# AI Task Template

> **Instructions:** This template helps you create comprehensive task documents for AI-driven development. Fill out each section thoroughly to ensure the AI agent has all necessary context and can execute the task systematically.

---

## 1. Task Overview

### Task Title
**Title:** Calendar Primitive Block Implementation

### Goal Statement
**Goal:** Create a unified Calendar primitive block with three modes (list, countdown, embed) that enables users to display upcoming events, countdown timers, and scheduling embeds on their websites. This complements the recently added Accordion, Pricing, and Showcase primitives and enables event-focused landing pages, webinar announcements, and course launch countdowns.

---

## 2. Strategic Analysis & Solution Options

### When to Use Strategic Analysis
**Assessment:** This is a straightforward implementation following established primitive patterns (Accordion, Showcase, Pricing). No strategic analysis needed - the architecture is well-established and the feature requirements are clear.

---

## 3. Project Analysis & Current State

### Technology & Architecture
- **Frameworks & Versions:** Next.js 15.3, React 19
- **Language:** TypeScript 5.4 with strict mode
- **Database & ORM:** Supabase (Postgres) via Drizzle ORM
- **UI & Styling:** shadcn/ui components with Tailwind CSS v4
- **Key Architectural Patterns:** Primitive blocks with mode-based content, SectionStyling for consistent styling controls

### Current State
- Accordion, Pricing, and Showcase primitives successfully implemented
- Established patterns for mode-based primitives with:
  - `*Content` interface extending `SectionStyling`
  - Mode-specific fields within a single interface
  - Editor with mode tabs and conditional field rendering
  - Renderer with mode-specific layouts
  - Templates for common use cases
  - BLOCK_TYPE_INFO registration for block picker

### Existing Codebase Analysis

**Relevant Files to Reference:**
- `lib/section-types.ts` - `AccordionContent`, `ShowcaseContent`, `PricingContent` for interface patterns
- `lib/section-defaults.ts` - Default content structure
- `lib/section-templates.ts` - Template definitions
- `lib/drizzle/schema/sections.ts` - BLOCK_TYPES array
- `components/render/blocks/ShowcaseBlock.tsx` - Intersection Observer animation (for countdown)
- `components/editor/blocks/ShowcaseEditor.tsx` - Mode-based editor pattern

---

## 4. Context & Problem Definition

### Problem Statement
Users building event landing pages, course platforms, or webinar announcements need to display:
1. Lists of upcoming events with dates, times, and "Add to Calendar" functionality
2. Countdown timers for launch dates, webinars, or limited-time offers
3. Embedded scheduling tools like Calendly or Cal.com for booking

Currently, there's no native block to handle these use cases, forcing users to use embed blocks with raw HTML or external widgets.

### Success Criteria
- [ ] Calendar block appears in block picker under "Utility" category
- [ ] List mode displays events with date/time, location type (virtual/in-person), and "Add to Calendar" buttons
- [ ] Countdown mode shows animated days/hours/minutes/seconds with customizable target date
- [ ] Embed mode supports Calendly, Cal.com, and custom iframe URLs
- [ ] Full SectionStyling support (border, background, typography)
- [ ] 6+ templates for common use cases
- [ ] Mode switching with confirmation dialog when data would be lost
- [ ] Responsive design (mobile-friendly countdown, stacked event cards)

---

## 5. Development Mode Context

### Development Mode Context
- **This is a new application in active development**
- **No backwards compatibility concerns** - new block type
- **Priority: Clean implementation** following established patterns

---

## 6. Technical Requirements

### Functional Requirements

**List Mode:**
- User can add/edit/delete events with drag-drop reordering
- Each event has: title, description (optional), start date/time, end date/time (optional), location type (virtual/in-person), location/link
- "Add to Calendar" dropdown with Google Calendar, iCal (.ics download), and Outlook options
- Timezone display (show event timezone, optionally detect user timezone)
- Visual indicators for virtual vs. in-person
- Support for recurrence labels (e.g., "Every Monday", "Monthly")

**Countdown Mode:**
- Target date/time picker with timezone selection
- **Real-time updates:** Timer ticks down every second for live experience
- Initial animation on scroll-into-view (like ShowcaseBlock), then continues real-time
- Days, hours, minutes, seconds display (configurable which units to show)
- Custom labels for each unit (e.g., "Days" vs "D" vs "days")
- Event title/description
- Completion message when countdown reaches zero (e.g., "Event Started!")
- Optional: Single CTA button

**Embed Mode:**
- Platform presets: Calendly, Cal.com, Custom URL
- Embed URL input with validation
- Aspect ratio options (16:9, 4:3, square, custom height)
- Optional heading/description above embed

### Non-Functional Requirements
- **Performance:** Countdown should not cause layout shift on re-render
- **Accessibility:** Screen reader support for countdown values, keyboard navigation for events
- **Responsive Design:** Stacked layout for event cards on mobile, compact countdown on small screens
- **Theme Support:** Light/dark mode via SectionStyling

### Technical Constraints
- Must follow existing primitive patterns (mode-based, SectionStyling)
- No external dependencies beyond existing packages
- No database changes required (events stored in JSONB content field)

---

## 7. Data & Database Changes

### Database Schema Changes
```sql
-- Add 'calendar' to BLOCK_TYPES enum in sections.ts
-- No database migration needed - just schema type update
```

### Data Model Updates
```typescript
// lib/section-types.ts additions

export type CalendarMode = "list" | "countdown" | "embed";
export type CalendarEventType = "virtual" | "in-person";
export type CalendarEmbedPlatform = "calendly" | "cal.com" | "custom";
export type CountdownUnit = "days" | "hours" | "minutes" | "seconds";

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: string; // ISO date string
  startTime?: string; // HH:MM format, optional for all-day events
  endDate?: string;
  endTime?: string;
  timezone: string; // IANA timezone (e.g., "America/New_York")
  eventType: CalendarEventType;
  location?: string; // Address or meeting link
  recurrence?: string; // Display label like "Every Monday"
}

export interface CalendarContent extends SectionStyling {
  mode: CalendarMode;

  // Section header (all modes)
  sectionTitle?: string;
  sectionSubtitle?: string;

  // List mode
  events: CalendarEvent[];
  showAddToCalendar: boolean;
  showTimezone: boolean;
  eventCardStyle: "simple" | "detailed";

  // Countdown mode
  countdownTitle: string;
  countdownDescription?: string;
  targetDate: string; // ISO date string
  targetTime: string; // HH:MM format
  targetTimezone: string;
  showUnits: CountdownUnit[];
  unitLabels: {
    days: string;
    hours: string;
    minutes: string;
    seconds: string;
  };
  completionMessage: string;
  showButton: boolean;
  buttonText?: string;
  buttonUrl?: string;
  animateOnScroll: boolean;

  // Embed mode
  embedPlatform: CalendarEmbedPlatform;
  embedUrl: string;
  embedAspectRatio: "16:9" | "4:3" | "1:1" | "custom";
  embedCustomHeight?: number; // px, when aspect ratio is "custom"
}
```

### Data Migration Plan
- [ ] No migration needed - new block type with no existing data

---

## 8. Backend Changes & Background Jobs

### Data Access Patterns
No backend changes required. This is a frontend-only block with all data stored in the sections table JSONB `content` field.

---

## 9. Frontend Changes

### New Components

- [ ] **`components/render/blocks/CalendarBlock.tsx`** - Unified renderer (~600-800 lines)
  - CalendarListMode component with event cards
  - CalendarCountdownMode component with animated timer
  - CalendarEmbedMode component with iframe
  - Add to Calendar dropdown (generates Google/iCal/Outlook links)

- [ ] **`components/editor/blocks/CalendarEditor.tsx`** - Unified editor (~800-1000 lines)
  - Mode tabs with confirmation on mode switch
  - List mode: Event management with drag-drop
  - Countdown mode: Date/time pickers, unit configuration
  - Embed mode: Platform selector, URL input

### Page Updates
No page updates needed - block renders through existing BlockRenderer.

### State Management
Standard pattern: Editor state managed locally, saved via existing section autosave mechanism.

### Component Requirements
- **Responsive Design:** Mobile-first with Tailwind breakpoints
- **Theme Support:** Uses SectionStyling for all styling options
- **Accessibility:** ARIA labels for countdown, keyboard navigation for event list

---

## 10. Code Changes Overview

### Current Implementation (Before)
No calendar block exists. Users must use embed block for scheduling widgets.

### After Implementation

**New Types in `lib/section-types.ts`:**
```typescript
export type CalendarMode = "list" | "countdown" | "embed";

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  startTime?: string;
  // ... other fields
}

export interface CalendarContent extends SectionStyling {
  mode: CalendarMode;
  events: CalendarEvent[];
  countdownTitle: string;
  targetDate: string;
  // ... other fields
}
```

**New Block Registration in `lib/drizzle/schema/sections.ts`:**
```typescript
export const BLOCK_TYPES = [
  // ... existing types
  "calendar",  // ADD
] as const;
```

**New Block Info in `lib/section-types.ts`:**
```typescript
{
  type: "calendar",
  label: "Calendar",
  description: "Events list, countdown timer, or scheduling embed",
  icon: "calendar",
  category: "utility",
}
```

### Key Changes Summary
- [ ] **New TypeScript types:** CalendarMode, CalendarEvent, CalendarContent (~60 lines)
- [ ] **Block registration:** Add to BLOCK_TYPES and BLOCK_TYPE_INFO
- [ ] **Defaults:** Add calendar defaults in section-defaults.ts (~80 lines)
- [ ] **Templates:** Add 6 calendar templates in section-templates.ts (~200 lines)
- [ ] **Editor:** Create CalendarEditor.tsx (~900 lines)
- [ ] **Renderer:** Create CalendarBlock.tsx (~700 lines)
- [ ] **Routing:** Add cases in BlockRenderer, PreviewBlockRenderer, ContentTab, BlockIcon

---

## 11. Implementation Plan

### Phase 1: Type Definitions & Registration
**Goal:** Define types and register the calendar block

- [ ] **Task 1.1:** Add CalendarMode, CalendarEvent, CalendarContent types to `lib/section-types.ts`
- [ ] **Task 1.2:** Add CalendarContent to SectionContent union type
- [ ] **Task 1.3:** Add "calendar" to BLOCK_TYPES in `lib/drizzle/schema/sections.ts`
- [ ] **Task 1.4:** Add calendar block info to BLOCK_TYPE_INFO
- [ ] **Task 1.5:** Add calendar defaults to `lib/section-defaults.ts`

### Phase 2: Templates
**Goal:** Create templates for common use cases

- [ ] **Task 2.1:** Create 6 calendar templates in `lib/section-templates.ts`:
  - Events List Simple
  - Events List Detailed
  - Webinar Countdown
  - Launch Countdown (with CTA)
  - Calendly Booking
  - Cal.com Booking

### Phase 3: Renderer Implementation
**Goal:** Create the CalendarBlock renderer

- [ ] **Task 3.1:** Create `components/render/blocks/CalendarBlock.tsx`
- [ ] **Task 3.2:** Implement CalendarListMode with event cards and "Add to Calendar" dropdown
- [ ] **Task 3.3:** Implement CalendarCountdownMode with animated timer (Intersection Observer)
- [ ] **Task 3.4:** Implement CalendarEmbedMode with iframe wrapper
- [ ] **Task 3.5:** Add calendar case to BlockRenderer.tsx
- [ ] **Task 3.6:** Add calendar case to PreviewBlockRenderer.tsx

### Phase 4: Editor Implementation
**Goal:** Create the CalendarEditor

- [ ] **Task 4.1:** Create `components/editor/blocks/CalendarEditor.tsx`
- [ ] **Task 4.2:** Implement mode tabs with data loss confirmation
- [ ] **Task 4.3:** Implement List mode editor (event CRUD, drag-drop)
- [ ] **Task 4.4:** Implement Countdown mode editor (date pickers, unit config)
- [ ] **Task 4.5:** Implement Embed mode editor (platform selector, URL input)
- [ ] **Task 4.6:** Add calendar case to ContentTab.tsx
- [ ] **Task 4.7:** Add Calendar icon to BlockIcon.tsx

### Phase 5: Testing & Validation
**Goal:** Verify implementation works correctly

- [ ] **Task 5.1:** Lint all new/modified files
- [ ] **Task 5.2:** Test all three modes in editor
- [ ] **Task 5.3:** Test responsive layouts
- [ ] **Task 5.4:** Test light/dark mode
- [ ] **Task 5.5:** Test "Add to Calendar" links generate correctly

### Phase 6: Comprehensive Code Review
**Goal:** Present implementation completion and request thorough code review

- [ ] **Task 6.1:** Present "Implementation Complete!" message
- [ ] **Task 6.2:** Execute comprehensive code review if approved

---

## 12. Task Completion Tracking - MANDATORY WORKFLOW

### Tracking Format
```
- [x] **Task 1.1:** Description ✓ YYYY-MM-DD
  - Files: `path/to/file.ts` ✓
  - Details: Brief notes on changes ✓
```

---

## 13. File Structure & Organization

### New Files to Create
```
components/
├── render/
│   └── blocks/
│       └── CalendarBlock.tsx      # Unified renderer
└── editor/
    └── blocks/
        └── CalendarEditor.tsx     # Unified editor
```

### Files to Modify
- [ ] `lib/drizzle/schema/sections.ts` - Add "calendar" to BLOCK_TYPES
- [ ] `lib/section-types.ts` - Add CalendarContent interface, BLOCK_TYPE_INFO entry
- [ ] `lib/section-defaults.ts` - Add calendar defaults
- [ ] `lib/section-templates.ts` - Add calendar templates
- [ ] `components/render/BlockRenderer.tsx` - Add calendar case
- [ ] `components/render/PreviewBlockRenderer.tsx` - Add calendar case
- [ ] `components/editor/inspector/ContentTab.tsx` - Add CalendarEditor case
- [ ] `components/editor/BlockIcon.tsx` - Add Calendar icon

### Dependencies to Add
None - using existing packages only.

---

## 14. Potential Issues & Security Review

### Error Scenarios
- [ ] **Invalid Date Parsing:** Countdown may receive invalid date strings
  - **Code Review Focus:** Date parsing in CalendarBlock countdown mode
  - **Potential Fix:** Validate dates, show "Invalid Date" message gracefully

- [ ] **Embed URL Injection:** Malicious URLs could be entered in embed mode
  - **Code Review Focus:** URL validation before iframe src
  - **Potential Fix:** Validate URL format, only allow https:// URLs

### Edge Cases
- [ ] **Past Events in List:** Events with past dates should still display (for archives)
- [ ] **Countdown Completion:** Timer at 0 should show completion message, not negative
- [ ] **Empty Events List:** Show helpful empty state, not blank section

### Security Considerations
- [ ] **XSS via Embed URLs:** Validate embed URLs are proper https URLs
- [ ] **Calendar Link Generation:** Ensure event data is properly URL-encoded

---

## 15. Deployment & Configuration

### Environment Variables
No new environment variables required.

---

## 16. AI Agent Instructions

### Implementation Approach
Follow established primitive patterns:
1. Study ShowcaseBlock for animation pattern (countdown)
2. Study AccordionEditor for drag-drop pattern (events)
3. Use existing StylingControls for styling options
4. Use existing date/time input patterns from other editors

### Code Quality Standards
- [ ] Follow TypeScript best practices
- [ ] Use early returns for cleaner code
- [ ] No inline styles - use Tailwind classes
- [ ] Proper accessibility (ARIA labels on countdown)
- [ ] Responsive design with mobile-first approach

---

## 17. Notes & Additional Context

### Add to Calendar Link Formats

**Google Calendar:**
```
https://calendar.google.com/calendar/render?action=TEMPLATE
&text=${encodeURIComponent(title)}
&dates=${startISO}/${endISO}
&details=${encodeURIComponent(description)}
&location=${encodeURIComponent(location)}
```

**iCal (.ics file):**
Generate a .ics file with VCALENDAR/VEVENT format and trigger download.

**Outlook Web:**
```
https://outlook.live.com/calendar/0/deeplink/compose?subject=${title}&startdt=${start}&enddt=${end}
```

### Countdown Animation
Reuse the Intersection Observer pattern from ShowcaseBlock for animating countdown numbers when scrolling into view.

---

## 18. Second-Order Consequences & Impact Analysis

### Impact Assessment

**Breaking Changes:** None - new block type.

**Performance:** Countdown uses requestAnimationFrame for smooth updates - ensure cleanup on unmount.

**Bundle Size:** Minimal impact - no new dependencies.

### Critical Issues
None identified - straightforward new feature.

---

*Template Version: 1.0*
*Task Created: 2026-01-23*
*Feature Backlog Reference: #88*
