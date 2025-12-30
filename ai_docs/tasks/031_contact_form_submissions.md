# Task 031: Contact Form Submissions

> **Status:** Planning
> **Created:** 2025-12-29

---

## 1. Task Overview

### Task Title
**Title:** Contact Form Submissions with Email Notifications & Spam Protection

### Goal Statement
**Goal:** Make contact forms functional on published sites by storing submissions in the database, sending email notifications to site owners, and protecting against spam. Contact submissions will be unique per email per site (upsert pattern), storing only contact info (name, email, company, phone) - no message storage.

---

## 2. Strategic Analysis & Solution Options

### Problem Context
Contact forms currently render but don't submit anywhere. This is a core feature gap - visitors can't actually contact site owners.

### Solution Options Analysis

#### Option 1: Server Action + Direct Database Insert (Recommended)
**Approach:** Form submits to a server action that validates, checks spam protection, and inserts/updates the database directly.

**Pros:**
- Fastest implementation
- No additional infrastructure
- Works immediately
- Full type safety with Drizzle

**Cons:**
- Email sending adds latency to form submission
- If email fails, submission still succeeds (acceptable tradeoff)

**Implementation Complexity:** Low
**Risk Level:** Low

#### Option 2: Server Action + Trigger.dev Background Task
**Approach:** Form submits to server action, which triggers a background task for email sending.

**Pros:**
- Form submission instant (email async)
- Retry logic for failed emails
- Better UX (faster response)

**Cons:**
- More complex architecture
- Overkill for simple email sending

**Implementation Complexity:** Medium
**Risk Level:** Low

### Recommendation & Rationale

**RECOMMENDED SOLUTION:** Option 1 - Server Action + Direct Database Insert

**Why this is the best choice:**
1. **Simplicity** - One round trip, minimal moving parts
2. **Email latency is acceptable** - Resend is fast (<200ms typical)
3. **We can add background tasks later** if needed
4. **Development speed** - Ship faster, iterate if needed

---

## 3. Project Analysis & Current State

### Technology & Architecture
- **Frameworks & Versions:** Next.js 15.3, React 19
- **Language:** TypeScript 5.4 with strict mode
- **Database & ORM:** Supabase (Postgres) via Drizzle ORM
- **UI & Styling:** shadcn/ui components with Tailwind CSS
- **Email Service:** Resend (to be added)

### Current State
- `ContactBlock.tsx` renders a disabled form with "Form is display-only in preview mode" message
- `ContactContent` interface has heading, description, and fields array
- Contact fields support: text, email, textarea types
- Sites table exists but has no notification email field
- No email service configured

### Existing Codebase Analysis

**Checked:**
- [x] **Database Schema** - Sites table needs `contact_notification_email` column
- [x] **Server Actions** - Will create new `app/actions/contact.ts`
- [x] **Component Patterns** - ContactBlock needs client-side interactivity for published sites

---

## 4. Context & Problem Definition

### Problem Statement
Contact forms render on published sites but don't submit anywhere. Visitors see a disabled form. Site owners have no way to receive contact information from visitors.

### Success Criteria
- [ ] Contact forms on published sites are functional and submit data
- [ ] Submissions stored in database (unique per email per site, upsert pattern)
- [ ] Site owners receive email notifications when someone submits
- [ ] Spam protection via honeypot + rate limiting
- [ ] Site owners can configure notification email in Settings
- [ ] Only contact info stored (name, email, company, phone) - no message

---

## 5. Development Mode Context

- **This is a new application in active development**
- **No backwards compatibility concerns**
- **Priority: Speed and simplicity**

---

## 6. Technical Requirements

### Functional Requirements
- User can configure notification email per site in Settings
- Visitor can submit contact form on published site
- System validates required fields and email format
- System checks honeypot field (spam protection)
- System enforces rate limiting (spam protection)
- System upserts contact info (unique by email per site)
- System sends email notification to site owner
- Visitor sees success/error feedback

### Non-Functional Requirements
- **Performance:** Form submission < 2 seconds including email
- **Security:** Honeypot + rate limiting, input validation, SQL injection prevention
- **Usability:** Clear success/error messages
- **Spam Protection:** Block 90%+ of basic bots

### Technical Constraints
- Must work on published site routes (`/sites/[siteSlug]`)
- Must not affect preview/editor functionality
- Email service must have generous free tier (Resend: 100 emails/day free)

---

## 7. Data & Database Changes

### Database Schema Changes

**New Table: `contact_submissions`**
```sql
CREATE TABLE contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  company TEXT,
  phone TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(site_id, email)
);

CREATE INDEX contact_submissions_site_id_idx ON contact_submissions(site_id);
CREATE INDEX contact_submissions_email_idx ON contact_submissions(email);
```

**Sites Table Update:**
```sql
ALTER TABLE sites ADD COLUMN contact_notification_email TEXT;
```

### Data Model Updates

```typescript
// lib/drizzle/schema/contact-submissions.ts
import { pgTable, text, timestamp, uuid, index, unique } from "drizzle-orm/pg-core";
import { sites } from "./sites";

export const contactSubmissions = pgTable(
  "contact_submissions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    site_id: uuid("site_id")
      .notNull()
      .references(() => sites.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    name: text("name"),
    company: text("company"),
    phone: text("phone"),
    submitted_at: timestamp("submitted_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("contact_submissions_site_id_idx").on(t.site_id),
    index("contact_submissions_email_idx").on(t.email),
    unique("contact_submissions_site_email_unique").on(t.site_id, t.email),
  ]
);
```

### Down Migration Safety Protocol
- [ ] Generate migration with `npm run db:generate`
- [ ] Create down migration file before running `npm run db:migrate`
- [ ] Use `DROP TABLE IF EXISTS` and `ALTER TABLE DROP COLUMN IF EXISTS`

---

## 8. Backend Changes

### Server Actions

**`app/actions/contact.ts`**
- [ ] `submitContactForm(siteId, data)` - Validate, spam check, upsert, send email
- [ ] Rate limiting: Max 5 submissions per IP per 15 minutes

### Spam Protection Implementation

**Honeypot Field:**
```typescript
// Hidden field that bots fill out, humans don't see
// If filled, reject submission silently (return success to not tip off bot)
```

**Rate Limiting:**
```typescript
// In-memory rate limiter using Map
// Key: IP address
// Value: { count: number, resetAt: Date }
// Limit: 5 submissions per 15 minutes per IP
```

### Email Service Setup

**Resend Configuration:**
```typescript
// lib/email.ts
import { Resend } from 'resend';
import { env } from './env';

export const resend = new Resend(env.RESEND_API_KEY);
```

**Email Template:**
- Simple text email with contact details
- From: noreply@yourdomain.com (configured in Resend)
- To: Site's `contact_notification_email`
- Subject: "New Contact Submission - [Site Name]"

---

## 9. Frontend Changes

### New Components

- [ ] **`components/render/blocks/ContactBlockPublished.tsx`** - Interactive contact form for published sites

### Component Updates

- [ ] **`ContactBlock.tsx`** - Keep for preview, conditionally render published version
- [ ] **`SettingsTab.tsx`** - Add notification email field

### Published Site Contact Form Flow

1. Visitor fills out form (name, email, company, phone, message hidden)
2. Client validates required fields
3. Form submits to server action
4. Server validates, checks honeypot, rate limit
5. Server upserts to database
6. Server sends email notification
7. Client shows success/error toast

---

## 10. Code Changes Overview

### Current Implementation (Before)

```tsx
// components/render/blocks/ContactBlock.tsx (lines 42-95)
<form className="space-y-4">
  {content.fields.map((field, index) => (
    <div key={index}>
      {/* Fields render but are disabled */}
      <input
        type={field.type}
        disabled  // Always disabled
        className="opacity-60 cursor-not-allowed"
      />
    </div>
  ))}
  <button
    type="submit"
    disabled  // Always disabled
    className="opacity-60 cursor-not-allowed"
  >
    Submit
  </button>
  <p>Form is display-only in preview mode</p>
</form>
```

### After Implementation

```tsx
// components/render/blocks/ContactBlockPublished.tsx
"use client";

export function ContactBlockPublished({ content, theme, siteId }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const result = await submitContactForm(siteId, formData);

    if (result.success) {
      setStatus("success");
    } else {
      setStatus("error");
    }
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Honeypot field - hidden from users */}
      <input type="text" name="website" className="hidden" tabIndex={-1} />

      {/* Real fields - now enabled! */}
      <input type="text" name="name" required />
      <input type="email" name="email" required />
      <input type="text" name="company" />
      <input type="tel" name="phone" />

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Sending..." : "Submit"}
      </button>

      {status === "success" && <p>Thanks! We'll be in touch.</p>}
      {status === "error" && <p>Something went wrong. Please try again.</p>}
    </form>
  );
}
```

### Key Changes Summary
- [ ] **New database table** - `contact_submissions` with unique constraint on (site_id, email)
- [ ] **Sites table update** - Add `contact_notification_email` column
- [ ] **New server action** - `submitContactForm` with spam protection
- [ ] **New client component** - `ContactBlockPublished` for interactive form
- [ ] **Settings update** - Notification email field in site settings
- [ ] **Email integration** - Resend for sending notifications

---

## 11. Implementation Plan

### Phase 1: Database & Schema
**Goal:** Add contact_submissions table and notification email column

- [ ] **Task 1.1:** Create contact-submissions.ts schema file
- [ ] **Task 1.2:** Add `contact_notification_email` to sites.ts
- [ ] **Task 1.3:** Export new schema in index.ts
- [ ] **Task 1.4:** Generate migration (`npm run db:generate`)
- [ ] **Task 1.5:** Create down migration
- [ ] **Task 1.6:** Apply migration (`npm run db:migrate`)

### Phase 2: Email Service Setup
**Goal:** Configure Resend for email notifications

- [ ] **Task 2.1:** Add RESEND_API_KEY to env.ts
- [ ] **Task 2.2:** Create lib/email.ts with Resend client
- [ ] **Task 2.3:** Create email sending function

### Phase 3: Server Action & Spam Protection
**Goal:** Create submission endpoint with validation and spam protection

- [ ] **Task 3.1:** Create app/actions/contact.ts
- [ ] **Task 3.2:** Implement honeypot validation
- [ ] **Task 3.3:** Implement rate limiting (in-memory)
- [ ] **Task 3.4:** Implement database upsert logic
- [ ] **Task 3.5:** Implement email notification sending

### Phase 4: Frontend - Settings
**Goal:** Allow site owners to configure notification email

- [ ] **Task 4.1:** Add notification email field to SettingsTab.tsx
- [ ] **Task 4.2:** Update updateSiteSettings action to handle new field

### Phase 5: Frontend - Published Contact Form
**Goal:** Make contact forms work on published sites

- [ ] **Task 5.1:** Create ContactBlockPublished.tsx client component
- [ ] **Task 5.2:** Update published site pages to use ContactBlockPublished
- [ ] **Task 5.3:** Add success/error states and feedback
- [ ] **Task 5.4:** Add loading state during submission

### Phase 6: Code Review & Testing
**Goal:** Verify implementation

- [ ] **Task 6.1:** Review all changed files
- [ ] **Task 6.2:** Test form submission flow
- [ ] **Task 6.3:** Test spam protection (honeypot, rate limit)
- [ ] **Task 6.4:** Test email delivery

---

## 12. Task Completion Tracking

(Will be updated as tasks are completed)

---

## 13. File Structure & Organization

### New Files to Create
```
lib/drizzle/schema/contact-submissions.ts  # New table schema
lib/email.ts                                # Resend client
lib/rate-limit.ts                           # Rate limiting utility
app/actions/contact.ts                      # Contact form server action
components/render/blocks/ContactBlockPublished.tsx  # Interactive form
```

### Files to Modify
```
lib/drizzle/schema/sites.ts                 # Add contact_notification_email
lib/drizzle/schema/index.ts                 # Export contact-submissions
lib/env.ts                                  # Add RESEND_API_KEY
components/sites/SettingsTab.tsx            # Add notification email field
app/actions/sites.ts                        # Handle new field in update
app/(sites)/sites/[siteSlug]/page.tsx       # Use ContactBlockPublished
app/(sites)/sites/[siteSlug]/[pageSlug]/page.tsx  # Use ContactBlockPublished
```

### Dependencies to Add
```json
{
  "dependencies": {
    "resend": "^4.0.0"
  }
}
```

---

## 14. Potential Issues & Security Review

### Error Scenarios
- [ ] **Email service down** - Form still saves to DB, log email failure
- [ ] **Rate limit edge case** - Use IP from headers, fallback to "unknown"
- [ ] **Invalid email format** - Validate with regex before submission

### Security Considerations
- [ ] **SQL Injection** - Using Drizzle ORM with parameterized queries
- [ ] **XSS** - Not storing message content, minimal risk
- [ ] **Spam** - Honeypot + rate limiting
- [ ] **Email validation** - Server-side regex validation

---

## 15. Deployment & Configuration

### Environment Variables
```bash
# Add to .env.local
RESEND_API_KEY=re_xxxxxxxxxxxx
```

### Resend Setup Required
1. Create account at resend.com
2. Verify domain (or use @resend.dev for testing)
3. Generate API key
4. Add to environment variables

---

## 16. AI Agent Instructions

Follow the standard workflow from task_template.md:
1. Get user approval of this task document
2. Implement phase by phase
3. Wait for "proceed" between phases
4. Comprehensive code review after implementation

---

## 17. Notes & Additional Context

### Contact Form Fields (Fixed Set)
The form will always collect:
- **Name** (text, optional)
- **Email** (email, required) - used as unique key per site
- **Company** (text, optional)
- **Phone** (tel, optional)

The existing `ContactContent.fields` configuration will be used for display labels and required flags, but we'll map them to our fixed schema.

### Future Enhancements (Not in Scope)
- Cloudflare Turnstile integration
- Viewing submissions in admin dashboard
- Export submissions to CSV
- Webhook integrations

---

*Created: 2025-12-29*
