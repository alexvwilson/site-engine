# AI Task Template

> **Instructions:** Landing page contact form and "Built with Headstring Web" showcase section.

---

## 1. Task Overview

### Task Title
**Title:** Landing Page Contact Form + Sites Showcase Section

### Goal Statement
**Goal:** Replace non-functional "Get Started Free" CTAs with a contact/interest flow, and add social proof by showcasing sites built with verified custom domains. This enables visitor outreach while sign-ups are disabled and demonstrates platform capabilities.

---

## 2. Strategic Analysis & Solution Options

### Problem Context
Sign-ups are disabled in Supabase, but the landing page still has "Get Started Free" buttons that lead nowhere. Visitors interested in the platform have no way to reach out. Additionally, there's no social proof showing what can be built with Headstring Web.

### Recommendation
**Direct implementation** - This is straightforward with clear requirements. No strategic analysis needed.

---

## 3. Project Analysis & Current State

### Technology & Architecture
- **Frameworks & Versions:** Next.js 15.3, React 19
- **Language:** TypeScript 5.4 with strict mode
- **Database & ORM:** Supabase (Postgres) via Drizzle ORM
- **UI & Styling:** shadcn/ui components with Tailwind CSS v4
- **Email:** Resend (already configured for child site contact forms)

### Current State
- Landing page has 3 CTAs linking to `/auth/sign-up` (disabled)
- Child site contact forms already work with Resend (pattern to follow)
- Sites table has `custom_domain` and `domain_verified` columns
- No landing page contact form or showcase section exists

### Existing Codebase Analysis

**Relevant Files:**
- `app/actions/contact.ts` - Child site contact submission pattern
- `lib/email.ts` - Resend email sending with `sendContactNotification()`
- `lib/rate-limit.ts` - Rate limiting for spam protection
- `lib/drizzle/schema/contact-submissions.ts` - Existing contact table pattern
- `lib/drizzle/schema/sites.ts` - Sites table with domain fields
- `components/landing/HeroSection.tsx` - CTA button
- `components/landing/CTASection.tsx` - CTA button
- `components/landing/Navbar.tsx` - CTA button

---

## 4. Context & Problem Definition

### Problem Statement
1. **No contact path:** Visitors interested in Headstring Web cannot reach out
2. **Dead CTAs:** "Get Started Free" buttons lead to disabled sign-up
3. **No social proof:** Landing page doesn't showcase sites built with the platform

### Success Criteria
- [x] `/contact` page with working form (Name, Email, Company optional, Message)
- [x] Form submissions stored in `landing_contacts` table (name, email, company only)
- [x] Email notification sent to alex@headstringweb.com via Resend
- [x] All 3 CTAs changed to "Let's Talk" linking to `/contact`
- [x] "Built with Headstring Web" section displays verified custom domain sites
- [x] Honeypot + rate limiting spam protection on contact form

---

## 5. Development Mode Context

- **New application in active development**
- **No backwards compatibility concerns**
- **Priority: Speed and simplicity**

---

## 6. Technical Requirements

### Functional Requirements

**Contact Form:**
- User can submit: Name (required), Email (required), Company (optional), Message (required)
- System stores: name, email, company in database (NOT message)
- System sends email notification with all fields including message
- Honeypot field for bot detection
- Rate limiting (5 submissions per IP per 15 minutes)
- Success/error feedback to user

**CTA Updates:**
- Navbar: "Get Started Free" → "Let's Talk" → `/contact`
- HeroSection: "Get Started" → "Let's Talk" → `/contact`
- CTASection: "Get Started" → "Let's Talk" → `/contact`

**Showcase Section:**
- Query sites where `domain_verified = true`
- Display grid of domain names as clickable links
- Add section to landing page (after testimonials or before CTA)

### Non-Functional Requirements
- **Performance:** Contact form submission < 2 seconds
- **Security:** Honeypot + rate limiting, input validation
- **Responsive Design:** Mobile-first approach
- **Theme Support:** Light/dark mode compatible

---

## 7. Data & Database Changes

### Database Schema Changes

```sql
-- New table for landing page contacts
CREATE TABLE landing_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255),
  company VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for email lookups
CREATE INDEX idx_landing_contacts_email ON landing_contacts(email);
```

### Data Model Updates

```typescript
// lib/drizzle/schema/landing-contacts.ts
import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";

export const landingContacts = pgTable("landing_contacts", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  company: varchar("company", { length: 255 }),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});
```

### 🚨 MANDATORY: Down Migration Safety Protocol
- [ ] **Step 1: Generate Migration** - Run `npm run db:generate`
- [ ] **Step 2: Create Down Migration** - Create `drizzle/migrations/[timestamp]/down.sql`
- [ ] **Step 3: Apply Migration** - Only after down migration is created

---

## 8. Backend Changes

### Server Actions

**`app/actions/landing-contact.ts`:**
```typescript
"use server";

export async function submitLandingContact(data: {
  name: string;
  email: string;
  company?: string;
  message: string;
  website?: string; // Honeypot
}): Promise<{ success: boolean; error?: string }>;
```

### Email Notification

Update `lib/email.ts` to add:
```typescript
export async function sendLandingContactNotification({
  contact: { name, email, company, message }
}): Promise<{ success: boolean; error?: string }>;
```

### Query for Showcase

```typescript
// lib/queries/showcase.ts
export async function getShowcaseSites(): Promise<{ domain: string }[]> {
  return db
    .select({ domain: sites.custom_domain })
    .from(sites)
    .where(eq(sites.domain_verified, true))
    .orderBy(sites.created_at);
}
```

---

## 9. Frontend Changes

### New Components

- [ ] **`app/(public)/contact/page.tsx`** - Contact page with form
- [ ] **`components/landing/ContactForm.tsx`** - Reusable contact form component
- [ ] **`components/landing/ShowcaseSection.tsx`** - Sites showcase grid

### Component Updates

- [ ] **`components/landing/Navbar.tsx`** - Change CTA to "Let's Talk" → `/contact`
- [ ] **`components/landing/HeroSection.tsx`** - Change CTA to "Let's Talk" → `/contact`
- [ ] **`components/landing/CTASection.tsx`** - Change CTA to "Let's Talk" → `/contact`
- [ ] **`app/(public)/page.tsx`** - Add ShowcaseSection component

---

## 10. Code Changes Overview

### 📂 **CTA Changes (Before)**
```tsx
// components/landing/Navbar.tsx
<Link href="/auth/sign-up">Get Started Free</Link>

// components/landing/HeroSection.tsx
<Link href="/auth/sign-up">Get Started</Link>

// components/landing/CTASection.tsx
<Link href="/auth/sign-up">Get Started</Link>
```

### 📂 **CTA Changes (After)**
```tsx
// All three files
<Link href="/contact">Let's Talk</Link>
```

### 🎯 **Key Changes Summary**
- [ ] **3 CTA buttons** - Text and href updated
- [ ] **1 new database table** - `landing_contacts`
- [ ] **1 new page** - `/contact`
- [ ] **2 new components** - ContactForm, ShowcaseSection
- [ ] **1 new server action** - `submitLandingContact`
- [ ] **1 email function update** - Add landing contact notification

---

## 11. Implementation Plan

### Phase 1: Database Schema ✅
**Goal:** Create landing_contacts table

- [x] **Task 1.1:** Create schema file `lib/drizzle/schema/landing-contacts.ts`
- [x] **Task 1.2:** Export from `lib/drizzle/schema/index.ts`
- [x] **Task 1.3:** Generate migration with `npm run db:generate`
- [x] **Task 1.4:** Create down migration file
- [x] **Task 1.5:** Apply migration with `npm run db:migrate`

### Phase 2: Backend (Server Actions + Email) ✅
**Goal:** Create contact submission logic

- [x] **Task 2.1:** Create `app/actions/landing-contact.ts` server action
- [x] **Task 2.2:** Add `sendLandingContactNotification()` to `lib/email.ts`
- [x] **Task 2.3:** Create `lib/queries/showcase.ts` for verified sites query

### Phase 3: Contact Page ✅
**Goal:** Create contact form UI

- [x] **Task 3.1:** Create `components/landing/ContactForm.tsx`
- [x] **Task 3.2:** Create `app/(public)/contact/page.tsx`

### Phase 4: Update CTAs ✅
**Goal:** Change all CTAs to "Let's Talk"

- [x] **Task 4.1:** Update `components/landing/Navbar.tsx`
- [x] **Task 4.2:** Update `components/landing/HeroSection.tsx`
- [x] **Task 4.3:** Update `components/landing/CTASection.tsx`

### Phase 5: Showcase Section ✅
**Goal:** Add sites showcase to landing page

- [x] **Task 5.1:** Create `components/landing/ShowcaseSection.tsx`
- [x] **Task 5.2:** Add ShowcaseSection to `app/(public)/page.tsx`

### Phase 6: Testing & Validation ✅
**Goal:** Verify all functionality works

- [x] **Task 6.6:** Run type-check and lint (passed)

---

## 12. Task Completion Tracking - MANDATORY WORKFLOW

🚨 **CRITICAL: Real-time task completion tracking is mandatory**

- [ ] **Update task document immediately** after each completed subtask
- [ ] **Mark checkboxes as [x]** with completion timestamp
- [ ] **Add brief completion notes** (file paths, key changes)

---

## 13. File Structure & Organization

### New Files to Create
```
project-root/
├── app/(public)/
│   └── contact/
│       └── page.tsx                    # Contact page
├── components/landing/
│   ├── ContactForm.tsx                 # Contact form component
│   └── ShowcaseSection.tsx             # Sites showcase grid
├── lib/drizzle/schema/
│   └── landing-contacts.ts             # New table schema
├── lib/queries/
│   └── showcase.ts                     # Verified sites query
└── app/actions/
    └── landing-contact.ts              # Contact form server action
```

### Files to Modify
- [ ] **`lib/drizzle/schema/index.ts`** - Export landing-contacts
- [ ] **`lib/email.ts`** - Add landing contact notification
- [ ] **`components/landing/Navbar.tsx`** - CTA update
- [ ] **`components/landing/HeroSection.tsx`** - CTA update
- [ ] **`components/landing/CTASection.tsx`** - CTA update
- [ ] **`app/(public)/page.tsx`** - Add ShowcaseSection

---

## 14. Potential Issues & Security Review

### Security & Access Control Review
- [ ] **Rate limiting** - Reuse existing `checkRateLimit()` from child site contacts
- [ ] **Honeypot field** - Hidden field to catch bots
- [ ] **Email validation** - Server-side regex validation
- [ ] **Input sanitization** - Trim and validate all inputs

### Edge Cases
- [ ] **No verified sites** - Showcase section should hide or show "Coming soon"
- [ ] **Email already exists** - Upsert pattern (update existing contact)
- [ ] **Rate limit exceeded** - Show friendly error message
- [ ] **Resend API failure** - Log error but still save to database

---

## 15. Deployment & Configuration

### Environment Variables
Already configured:
- `RESEND_API_KEY` - For email sending

No new environment variables needed. Email destination (alex@headstringweb.com) will be hardcoded since this is for the landing page only.

---

## 16. AI Agent Instructions

### Implementation Approach
1. Follow phase-by-phase implementation
2. Update this document after each task
3. Run `npm run type-check` and `npm run lint` after each phase
4. Present completion message after all phases

---

## 17. Notes & Additional Context

### Reference Implementation
- Child site contact form: `app/actions/contact.ts`
- Email sending: `lib/email.ts`
- Rate limiting: `lib/rate-limit.ts`

### Email Configuration
- From: `Headstring Web <noreply@updates.alexvwilson.com>` (existing verified domain)
- To: `alex@headstringweb.com`
- Reply-To: Contact's email address

---

*Task Document Version: 1.0*
*Created: 2026-01-05*
*Completed: 2026-01-05*
*Backlog Items: #49, #50*

---

## 18. Completion Summary

**Status: COMPLETE**

### Files Created
- `lib/drizzle/schema/landing-contacts.ts` - Database schema for landing contacts
- `drizzle/migrations/0028_glorious_blonde_phantom.sql` - Migration for landing_contacts table
- `drizzle/migrations/0028_glorious_blonde_phantom/down.sql` - Down migration
- `app/actions/landing-contact.ts` - Server action for form submission
- `lib/queries/showcase.ts` - Query for verified domain sites
- `components/landing/ContactForm.tsx` - Contact form component
- `components/landing/ShowcaseSection.tsx` - Sites showcase grid
- `app/(public)/contact/page.tsx` - Contact page

### Files Modified
- `lib/drizzle/schema/index.ts` - Added landing-contacts export
- `lib/email.ts` - Added `sendLandingContactNotification()` function
- `components/landing/Navbar.tsx` - CTA: "Get Started Free" → "Let's Talk" → `/contact`
- `components/landing/HeroSection.tsx` - CTA: "Get Started" → "Let's Talk" → `/contact`
- `components/landing/CTASection.tsx` - CTA: "Get Started" → "Let's Talk" → `/contact`
- `app/(public)/page.tsx` - Added ShowcaseSection

### Key Features
1. **Contact Form** at `/contact` with:
   - Name, Email, Company (optional), Message fields
   - Honeypot spam protection
   - Rate limiting (5 per 15 min per IP)
   - Stores name/email/company in DB (not message)
   - Sends email notification to alex@headstringweb.com

2. **CTA Updates**: All 3 "Get Started" buttons now say "Let's Talk" and link to `/contact`

3. **Showcase Section**: Displays sites with verified custom domains as clickable links
   - Hides automatically if no verified sites exist
