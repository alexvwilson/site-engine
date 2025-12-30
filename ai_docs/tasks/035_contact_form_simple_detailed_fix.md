# Task 035: Contact Form Simple vs Detailed Fix

## 1. Task Overview

### Task Title
**Title:** Fix Contact Form Simple vs Detailed Variants with Message Field

### Goal Statement
**Goal:** Replace the broken custom fields system with working Simple/Detailed presets, add a Message field that's sent via email only (not stored in database), and ensure the published form respects the selected variant.

---

## 2. Strategic Analysis & Solution Options

### Problem Context
The contact form editor has a custom fields system that's completely ignored by the published form. The published form renders hardcoded fields (Name, Email, Company, Phone) regardless of configuration. Additionally, there's no Message field anywhere, which is essential for contact forms.

### Recommendation
**Direct implementation** - This is a straightforward bug fix with a clear solution. No strategic analysis needed.

---

## 3. Project Analysis & Current State

### Technology & Architecture
- **Frameworks & Versions:** Next.js 15, React 19
- **Language:** TypeScript 5.x with strict mode
- **Database & ORM:** Supabase (Postgres) via Drizzle ORM
- **UI & Styling:** shadcn/ui components with Tailwind CSS
- **Email:** Resend for email notifications

### Current State

**ContactEditor (`components/editor/blocks/ContactEditor.tsx`):**
- Has a custom fields system where users can add/remove fields
- Each field has: type (text/email/textarea), label, required
- NO variant selector (Simple/Detailed)

**ContactBlockPublished (`components/render/blocks/ContactBlockPublished.tsx`):**
- **IGNORES `content.fields` entirely**
- Renders hardcoded fields: Name, Email, Company, Phone
- No Message field
- Doesn't use any configuration from the editor

**contact.ts action (`app/actions/contact.ts`):**
- Only handles: name, email, company, phone
- No message field in the interface or database insert

**email.ts (`lib/email.ts`):**
- Only includes: name, email, company, phone in notification
- No message field

**section-types.ts:**
```typescript
export interface ContactField {
  type: "text" | "email" | "textarea";
  label: string;
  required: boolean;
}

export interface ContactContent {
  heading: string;
  description: string;
  fields: ContactField[];  // Currently ignored by published form
}
```

**section-defaults.ts:**
```typescript
contact: {
  heading: "Get in Touch",
  description: "...",
  fields: [
    { type: "text", label: "Name", required: true },
    { type: "email", label: "Email", required: true },
    { type: "textarea", label: "Message", required: true },
  ],
}
```
Note: Default has Message field, but it's never rendered.

---

## 4. Context & Problem Definition

### Problem Statement
1. ContactBlockPublished ignores configured fields entirely
2. No Simple vs Detailed variant selection in editor
3. No Message field in published form
4. Custom fields system is confusing and broken
5. Message needs to be emailed but NOT stored in database

### Success Criteria
- [ ] Simple variant shows: Name, Email (required), Message (required)
- [ ] Detailed variant shows: Name, Email (required), Company, Phone, Message (required)
- [ ] Editor has clear Simple/Detailed selector (no custom field editing)
- [ ] Message field is a textarea
- [ ] Message is included in email notification
- [ ] Message is NOT stored in database
- [ ] Existing contact submissions table unchanged (no migration needed)

---

## 5. Development Mode Context

- **No backwards compatibility concerns** - Custom fields weren't working anyway
- **Data preservation** - contact_submissions table unchanged, no data loss
- **Priority: Speed and simplicity**

---

## 6. Technical Requirements

### Functional Requirements
- User can select Simple or Detailed variant in editor
- Simple: Name, Email*, Message* (3 fields)
- Detailed: Name, Email*, Company, Phone, Message* (5 fields)
- Published form renders correct fields based on variant
- Message sent via email notification
- Message NOT stored in contact_submissions table

### Non-Functional Requirements
- **Responsive Design:** Form works on mobile (320px+)
- **Theme Support:** Uses existing theme system (CSS variables)
- **Accessibility:** Proper labels, required field indicators

### Technical Constraints
- Must not modify contact_submissions table schema
- Must maintain existing spam protection (honeypot, rate limiting)

---

## 7. Data & Database Changes

### Database Schema Changes
**NONE** - No database changes needed. Message is email-only.

### Data Model Updates

**section-types.ts changes:**
```typescript
// NEW: Variant type
export type ContactVariant = "simple" | "detailed";

// UPDATED: ContactContent interface
export interface ContactContent {
  heading: string;
  description: string;
  variant: ContactVariant;  // NEW - replaces fields array
  // fields: ContactField[];  // REMOVED - no longer needed
}
```

**section-defaults.ts changes:**
```typescript
contact: {
  heading: "Get in Touch",
  description: "Have questions? We'd love to hear from you.",
  variant: "simple",  // Default to simple
}
```

---

## 8. Backend Changes

### Server Actions

**app/actions/contact.ts - UPDATE:**
```typescript
interface ContactFormData {
  name?: string;
  email: string;
  company?: string;   // Only from detailed variant
  phone?: string;     // Only from detailed variant
  message: string;    // NEW - required, email only
  website?: string;   // Honeypot
}
```

### Email Changes

**lib/email.ts - UPDATE:**
```typescript
interface ContactNotificationParams {
  to: string;
  siteName: string;
  contact: {
    name?: string;
    email: string;
    company?: string;
    phone?: string;
    message: string;  // NEW
  };
}
```

---

## 9. Frontend Changes

### Component Updates

**ContactEditor.tsx - SIMPLIFIED:**
- Remove custom fields system entirely
- Add Simple/Detailed variant selector (radio or select)
- Keep heading and description fields
- Much simpler UI

**ContactBlockPublished.tsx - REWRITE:**
- Read `content.variant` to determine which fields to show
- Simple: Name, Email*, Message*
- Detailed: Name, Email*, Company, Phone, Message*
- Message uses textarea element
- Include message in form submission

---

## 10. Code Changes Overview

### Current Implementation (Before)

**ContactEditor.tsx (lines 58-156):**
```typescript
// Complex custom fields system
<div className="space-y-4">
  <Label>Form Fields</Label>
  {content.fields.map((field, index) => (
    <div key={index} className="border rounded-lg p-4 space-y-3">
      {/* Field editor with label, type, required toggle */}
      {/* Add/remove field buttons */}
    </div>
  ))}
  <Button onClick={handleAddField}>Add Field</Button>
</div>
```

**ContactBlockPublished.tsx (lines 127-199):**
```typescript
// Hardcoded fields - ignores content.fields
<div>
  <label>Name</label>
  <input type="text" name="name" />
</div>
<div>
  <label>Email *</label>
  <input type="email" name="email" required />
</div>
<div>
  <label>Company</label>
  <input type="text" name="company" />
</div>
<div>
  <label>Phone</label>
  <input type="tel" name="phone" />
</div>
// NO MESSAGE FIELD
```

### After Refactor

**ContactEditor.tsx:**
```typescript
// Simple variant selector
<div className="space-y-2">
  <Label>Form Type</Label>
  <Select
    value={content.variant}
    onValueChange={(value) => handleChange("variant", value)}
  >
    <SelectTrigger>
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="simple">
        Simple (Name, Email, Message)
      </SelectItem>
      <SelectItem value="detailed">
        Detailed (Name, Email, Company, Phone, Message)
      </SelectItem>
    </SelectContent>
  </Select>
</div>
```

**ContactBlockPublished.tsx:**
```typescript
// Conditional fields based on variant
{/* Always show: Name, Email, Message */}
<div>
  <label>Name</label>
  <input type="text" name="name" />
</div>
<div>
  <label>Email *</label>
  <input type="email" name="email" required />
</div>

{/* Only show for detailed variant */}
{content.variant === "detailed" && (
  <>
    <div>
      <label>Company</label>
      <input type="text" name="company" />
    </div>
    <div>
      <label>Phone</label>
      <input type="tel" name="phone" />
    </div>
  </>
)}

{/* Always show: Message */}
<div>
  <label>Message *</label>
  <textarea name="message" required rows={4} />
</div>
```

### Key Changes Summary
- [ ] **ContactContent type:** Replace `fields` array with `variant` string
- [ ] **ContactEditor:** Replace complex field editor with simple variant selector
- [ ] **ContactBlockPublished:** Render fields based on variant, add Message textarea
- [ ] **contact.ts action:** Add message to interface, include in email, don't store in DB
- [ ] **email.ts:** Add message to notification email
- [ ] **section-defaults.ts:** Update default to use variant instead of fields
- [ ] **section-templates.ts:** Update contact templates to use variant

**Files Modified:**
- `lib/section-types.ts`
- `lib/section-defaults.ts`
- `lib/section-templates.ts`
- `components/editor/blocks/ContactEditor.tsx`
- `components/render/blocks/ContactBlockPublished.tsx`
- `app/actions/contact.ts`
- `lib/email.ts`

---

## 11. Implementation Plan

### Phase 1: Type & Default Updates ✅
**Goal:** Update type definitions and defaults

- [x] **Task 1.1:** Update section-types.ts ✓ 2025-12-30
  - Files: `lib/section-types.ts`
  - Details: Added ContactVariant type, replaced fields array with variant in ContactContent, removed ContactField interface
- [x] **Task 1.2:** Update section-defaults.ts ✓ 2025-12-30
  - Files: `lib/section-defaults.ts`
  - Details: Changed contact default to use variant: "simple"
- [x] **Task 1.3:** Update section-templates.ts ✓ 2025-12-30
  - Files: `lib/section-templates.ts`
  - Details: Updated contact-simple and contact-detailed templates to use variant

### Phase 2: Backend Updates ✅
**Goal:** Update server action and email to support message

- [x] **Task 2.1:** Update contact action ✓ 2025-12-30
  - Files: `app/actions/contact.ts`
  - Details: Added message to interface, added validation, passed to email notification (NOT stored in DB)
- [x] **Task 2.2:** Update email notification ✓ 2025-12-30
  - Files: `lib/email.ts`
  - Details: Added message field to interface and email template

### Phase 3: Frontend Updates ✅
**Goal:** Fix editor and published form

- [x] **Task 3.1:** Simplify ContactEditor ✓ 2025-12-30
  - Files: `components/editor/blocks/ContactEditor.tsx`
  - Details: Replaced 159-line custom fields system with 89-line variant selector. Much simpler UI.
- [x] **Task 3.2:** Fix ContactBlockPublished ✓ 2025-12-30
  - Files: `components/render/blocks/ContactBlockPublished.tsx`
  - Details: Renders fields based on variant, added Message textarea, legacy fallback to "detailed"

### Phase 4: Testing & Validation ✅
**Goal:** Verify everything works

- [x] **Task 4.1:** Type check all modified files ✓ 2025-12-30
  - Found additional file needing update: `components/render/blocks/ContactBlock.tsx` (preview version)
  - Fixed ContactBlock.tsx to use variant system
  - All type checks pass
- [x] **Task 4.2:** Lint all modified files ✓ 2025-12-30
  - No errors, only pre-existing warnings unrelated to this task

### Phase 5: Code Review ✅
**Goal:** Comprehensive review of all changes

- [x] **Task 5.1:** Present "Implementation Complete!" message ✓ 2025-12-30
- [x] **Task 5.2:** Execute comprehensive code review ✓ 2025-12-30
  - Verified all 8 files match task requirements
  - Type definitions correct with ContactVariant type
  - Defaults and templates using variant
  - Backend: message validated, passed to email, NOT stored in DB
  - Frontend: Editor simplified, published form renders by variant with Message

### Phase 6: User Testing
**Goal:** User verifies in browser

- [ ] **Task 6.1:** User tests Simple variant form
- [ ] **Task 6.2:** User tests Detailed variant form
- [ ] **Task 6.3:** User verifies email includes message

---

## 12. Task Completion Tracking

*Will be updated during implementation*

---

## 13. File Structure & Organization

### Files to Modify
```
lib/
├── section-types.ts      # Add ContactVariant, update ContactContent
├── section-defaults.ts   # Update contact default
├── section-templates.ts  # Update contact templates to use variant
├── email.ts              # Add message to notification

app/actions/
└── contact.ts            # Add message handling (email only)

components/
├── editor/blocks/
│   └── ContactEditor.tsx        # Simplify to variant selector
└── render/blocks/
    └── ContactBlockPublished.tsx # Fix to use variant, add Message
```

### No New Files Needed

### No Dependencies to Add

---

## 14. Potential Issues & Security Review

### Edge Cases
- [ ] **Existing contact sections:** May have `fields` array instead of `variant`
  - **Mitigation:** Add fallback in ContactBlockPublished - if no variant, default to "detailed" (matches current hardcoded behavior)
- [ ] **Empty message:**
  - **Mitigation:** Message is required, form validation will catch this

### Security
- [ ] **XSS in message:** Message goes directly to email
  - **Mitigation:** Plain text email, no HTML rendering
- [ ] **Spam:** Existing honeypot and rate limiting still apply

---

## 15. Deployment & Configuration

No environment variables or configuration changes needed.

---

## 16. AI Agent Instructions

Follow standard implementation workflow:
1. Implement phase-by-phase
2. Update task document with completion timestamps
3. Present implementation complete message
4. Execute comprehensive code review
5. Request user browser testing

---

## 17. Notes & Additional Context

### Backwards Compatibility
Existing contact sections may have the old `fields` array. The published form should handle this gracefully by defaulting to "detailed" variant if `variant` is undefined.

```typescript
// In ContactBlockPublished
const variant = content.variant ?? "detailed"; // Fallback for old data
```

---

## 18. Second-Order Consequences & Impact Analysis

### Breaking Changes
- [ ] **ContactContent interface change:** Old `fields` array removed
  - **Impact:** Low - fields were never used in published form anyway
  - **Mitigation:** Add fallback for old data

### Ripple Effects
- [ ] **Section templates:** May need update if contact templates exist
  - **Check:** `lib/section-templates.ts`

### No Database Migration Required
Message is email-only, contact_submissions table unchanged.

---

*Task Created: 2025-12-30*
