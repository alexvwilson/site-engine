# AI Task Template

> **Instructions:** This template helps you create comprehensive task documents for AI-driven development. Fill out each section thoroughly to ensure the AI agent has all necessary context and can execute the task systematically.

---

## 1. Task Overview

### Task Title
**Title:** Admin Landing Page Content Management System

### Goal Statement
**Goal:** Enable admins to manage landing page content (FAQ questions, features list) through the admin dashboard without requiring code deployments. When users submit questions via the contact form, admins can easily add them to the FAQ. This reduces friction for landing page updates and keeps content fresh.

---

## 2. Strategic Analysis & Solution Options

### When to Use Strategic Analysis
**Decision:** Skip strategic analysis - this is a straightforward CRUD feature with a single obvious implementation approach.

---

## 3. Project Analysis & Current State

### Technology & Architecture
- **Frameworks & Versions:** Next.js 15.3, React 19
- **Language:** TypeScript 5.4 with strict mode
- **Database & ORM:** Supabase (Postgres) via Drizzle ORM
- **UI & Styling:** shadcn/ui components with Tailwind CSS v4
- **Authentication:** Supabase Auth, admin access via `requireAdminAccess()`

### Current State
The landing page has several sections with hardcoded content:

1. **FAQSection.tsx** - 6 hardcoded FAQ items (question/answer pairs)
2. **FeaturesSection.tsx** - 4 hardcoded features (icon/title/description)
3. **ProblemSection.tsx** - 4 problems + 4 solutions (hardcoded strings)
4. **HeroSection.tsx** - 4 demo steps (hardcoded animation timings)

**Already dynamic:**
- ShowcaseSection - fetches verified custom domains from `sites` table
- Contact form submissions - stored in `landing_contacts` table

**Admin Dashboard exists at:** `/admin/dashboard` with metrics, charts, and user search.

### Existing Codebase Analysis

**🔍 Analysis Checklist - Relevant Areas:**

- [x] **Database Schema** (`lib/drizzle/schema/*.ts`)
  - `landing_contacts` table exists - good pattern to follow
  - No tables for FAQ or features content yet

- [x] **Authentication/Authorization** (`lib/auth.ts`)
  - `requireAdminAccess()` - redirects non-admin to /unauthorized
  - Admin dashboard already uses this pattern

- [x] **Server Actions** (`app/actions/*.ts`)
  - Pattern: CRUD actions with `requireAdminAccess()` for admin-only operations
  - `app/actions/admin.ts` exists but focused on metrics

- [x] **Component Patterns** (`components/admin/`)
  - `SystemMetricsCards`, `UserSearchList`, charts exist
  - No content management components yet

---

## 4. Context & Problem Definition

### Problem Statement
When users submit questions via the landing page contact form, there's no easy way to update the FAQ without code changes. Similarly, updating the features list or other landing page content requires a deployment. This creates friction and delays content updates.

### Success Criteria
- [ ] Admin can view, add, edit, delete, and reorder FAQ items from the admin dashboard
- [ ] Admin can view, add, edit, delete, and reorder feature items from the admin dashboard
- [ ] Landing page FAQ section renders from database instead of hardcoded array
- [ ] Landing page Features section renders from database instead of hardcoded array
- [ ] Changes to FAQ/features are reflected immediately (no deployment needed)
- [ ] Existing FAQ and feature content is migrated to database via seed script

---

## 5. Development Mode Context

### Development Mode Context
- **🚨 IMPORTANT: This is a new application in active development**
- **No backwards compatibility concerns** - feel free to make breaking changes
- **Data loss acceptable** - existing data can be wiped/migrated aggressively
- **Users are developers/testers** - not production users requiring careful migration
- **Priority: Speed and simplicity** over data preservation
- **Aggressive refactoring allowed** - delete/recreate components as needed

---

## 6. Technical Requirements

### Functional Requirements
- Admin can CRUD FAQ items (question, answer, display order, active flag)
- Admin can CRUD feature items (title, description, icon name, display order, active flag)
- Admin can reorder items via drag-and-drop
- Admin can toggle items active/inactive without deleting
- Landing page fetches content from database at request time
- Empty state handling when no items exist

### Non-Functional Requirements
- **Performance:** Landing page should still be fast (server-side fetch, no client waterfall)
- **Security:** Only admin users can modify content
- **Usability:** Simple CRUD interface, inline editing where possible
- **Responsive Design:** Admin UI works on desktop (primary) and tablet

### Technical Constraints
- Must use existing Drizzle ORM patterns
- Must use existing shadcn/ui components
- Admin routes must use `requireAdminAccess()`

---

## 7. Data & Database Changes

### Database Schema Changes

**New table: `landing_faqs`**
```sql
CREATE TABLE landing_faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question VARCHAR(500) NOT NULL,
  answer TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_landing_faqs_order ON landing_faqs(display_order);
CREATE INDEX idx_landing_faqs_active ON landing_faqs(is_active);
```

**New table: `landing_features`**
```sql
CREATE TABLE landing_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  icon_name VARCHAR(50) NOT NULL DEFAULT 'sparkles',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_landing_features_order ON landing_features(display_order);
CREATE INDEX idx_landing_features_active ON landing_features(is_active);
```

### Data Model Updates

```typescript
// lib/drizzle/schema/landing-content.ts
import { pgTable, uuid, varchar, text, integer, boolean, timestamp, index } from "drizzle-orm/pg-core";

export const landingFaqs = pgTable(
  "landing_faqs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    question: varchar("question", { length: 500 }).notNull(),
    answer: text("answer").notNull(),
    display_order: integer("display_order").notNull().default(0),
    is_active: boolean("is_active").notNull().default(true),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("idx_landing_faqs_order").on(table.display_order),
    index("idx_landing_faqs_active").on(table.is_active),
  ]
);

export const landingFeatures = pgTable(
  "landing_features",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description").notNull(),
    icon_name: varchar("icon_name", { length: 50 }).notNull().default("sparkles"),
    display_order: integer("display_order").notNull().default(0),
    is_active: boolean("is_active").notNull().default(true),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("idx_landing_features_order").on(table.display_order),
    index("idx_landing_features_active").on(table.is_active),
  ]
);

export type LandingFaq = typeof landingFaqs.$inferSelect;
export type NewLandingFaq = typeof landingFaqs.$inferInsert;
export type LandingFeature = typeof landingFeatures.$inferSelect;
export type NewLandingFeature = typeof landingFeatures.$inferInsert;
```

### Data Migration Plan
- [ ] Create schema file with tables
- [ ] Generate migration
- [ ] Create down migration (MANDATORY)
- [ ] Run migration
- [ ] Create seed script to populate initial FAQ/features from current hardcoded values

### 🚨 MANDATORY: Down Migration Safety Protocol
- [ ] **Step 1: Generate Migration** - Run `npm run db:generate`
- [ ] **Step 2: Create Down Migration** - Create rollback file
- [ ] **Step 3: Apply Migration** - Only after down migration created

---

## 8. Backend Changes & Background Jobs

### Data Access Patterns

#### **MUTATIONS (Server Actions)** → `app/actions/landing-content.ts`
- [ ] `createFaq(data)` - Add new FAQ item
- [ ] `updateFaq(id, data)` - Update FAQ question/answer
- [ ] `deleteFaq(id)` - Remove FAQ item
- [ ] `reorderFaqs(orderedIds)` - Update display_order for all FAQs
- [ ] `toggleFaqActive(id, isActive)` - Toggle active status
- [ ] `createFeature(data)` - Add new feature
- [ ] `updateFeature(id, data)` - Update feature details
- [ ] `deleteFeature(id)` - Remove feature
- [ ] `reorderFeatures(orderedIds)` - Update display_order for all features
- [ ] `toggleFeatureActive(id, isActive)` - Toggle active status

#### **QUERIES (Data Fetching)** → `lib/queries/landing-content.ts`
- [ ] `getActiveFaqs()` - Get active FAQs ordered by display_order (for landing page)
- [ ] `getAllFaqs()` - Get all FAQs for admin (including inactive)
- [ ] `getActiveFeatures()` - Get active features ordered (for landing page)
- [ ] `getAllFeatures()` - Get all features for admin

---

## 9. Frontend Changes

### New Components

**Admin Components:**
- [ ] **`components/admin/FAQManager.tsx`** - CRUD interface for FAQ items
  - List view with drag-drop reordering
  - Add/Edit dialog with question/answer fields
  - Toggle active/inactive
  - Delete with confirmation
- [ ] **`components/admin/FeatureManager.tsx`** - CRUD interface for features
  - List view with drag-drop reordering
  - Add/Edit dialog with title/description/icon fields
  - Icon picker from allowed Lucide icons
  - Toggle active/inactive
  - Delete with confirmation

### Page Updates
- [ ] **`/admin/dashboard`** - Add "Landing Page Content" section inline (below User Search)
  - FAQManager component for FAQ CRUD
  - FeatureManager component for Features CRUD
- [ ] **`FAQSection.tsx`** - Fetch from database instead of hardcoded array
- [ ] **`FeaturesSection.tsx`** - Fetch from database instead of hardcoded array

### State Management
- Server-side data fetching via queries
- Server Actions for mutations with revalidatePath
- Optimistic UI updates for toggle/reorder operations

---

## 10. Code Changes Overview

### 📂 **Current Implementation (Before)**

**FAQSection.tsx:**
```typescript
const FAQSection = () => {
  const faqs = [
    {
      question: "How does AI theme generation work?",
      answer: "Simply describe your brand..."
    },
    // ... 5 more hardcoded items
  ];

  return (
    <Accordion>
      {faqs.map((faq, index) => (
        <AccordionItem key={index} ...>
          {faq.question} / {faq.answer}
        </AccordionItem>
      ))}
    </Accordion>
  );
};
```

**FeaturesSection.tsx:**
```typescript
const features = [
  { icon: Sparkles, title: "AI Theme Generation", description: "..." },
  // ... 3 more hardcoded items
];
```

### 📂 **After Refactor**

**FAQSection.tsx:**
```typescript
import { getActiveFaqs } from "@/lib/queries/landing-content";

const FAQSection = async () => {
  const faqs = await getActiveFaqs();

  if (faqs.length === 0) return null; // Hide if no FAQs

  return (
    <Accordion>
      {faqs.map((faq) => (
        <AccordionItem key={faq.id} ...>
          {faq.question} / {faq.answer}
        </AccordionItem>
      ))}
    </Accordion>
  );
};
```

**Admin Dashboard - New Section:**
```typescript
// New components added to admin dashboard
<FAQManager faqs={allFaqs} />
<FeatureManager features={allFeatures} />
```

### 🎯 **Key Changes Summary**
- [ ] **Database**: Add `landing_faqs` and `landing_features` tables
- [ ] **Server Actions**: CRUD operations in `app/actions/landing-content.ts`
- [ ] **Queries**: Fetch functions in `lib/queries/landing-content.ts`
- [ ] **Admin UI**: FAQManager and FeatureManager components
- [ ] **Landing Page**: Update FAQSection and FeaturesSection to fetch from DB
- [ ] **Seed Data**: Script to migrate existing hardcoded content

---

## 11. Implementation Plan

### Phase 1: Database Setup
**Goal:** Create database tables for landing page content

- [x] **Task 1.1:** Create schema file `lib/drizzle/schema/landing-content.ts` ✓ 2026-01-23
  - Defined `landingFaqs` and `landingFeatures` tables with indexes
  - Exported types: LandingFaq, NewLandingFaq, LandingFeature, NewLandingFeature
- [x] **Task 1.2:** Export schema in `lib/drizzle/schema/index.ts` ✓ 2026-01-23
- [x] **Task 1.3:** Generate migration with `npm run db:generate` ✓ 2026-01-23
  - Generated: `0036_wakeful_marvel_zombies.sql`
- [x] **Task 1.4:** Create down migration (MANDATORY before migrate) ✓ 2026-01-23
  - Created: `drizzle/migrations/0036_wakeful_marvel_zombies/down.sql`
- [x] **Task 1.5:** Run migration with `npm run db:migrate` ✓ 2026-01-23

### Phase 2: Query Functions & Server Actions
**Goal:** Create data access layer

- [x] **Task 2.1:** Create `lib/queries/landing-content.ts` ✓ 2026-01-23
  - `getActiveFaqs()`, `getAllFaqs()`
  - `getActiveFeatures()`, `getAllFeatures()`
- [x] **Task 2.2:** Create `app/actions/landing-content.ts` ✓ 2026-01-23
  - CRUD for FAQs: createFaq, updateFaq, deleteFaq, reorderFaqs, toggleFaqActive
  - CRUD for Features: createFeature, updateFeature, deleteFeature, reorderFeatures, toggleFeatureActive
  - All actions use `requireAdminAccess()` + revalidatePath

### Phase 3: Update Landing Page Components
**Goal:** Make FAQSection and FeaturesSection database-driven

- [x] **Task 3.0:** Create `lib/feature-icons.ts` ✓ 2026-01-23
  - ALLOWED_FEATURE_ICONS array with 10 icons
  - getFeatureIcon() helper function
- [x] **Task 3.1:** Update `FAQSection.tsx` to fetch from database ✓ 2026-01-23
  - Converted to async server component
  - Uses getActiveFaqs() query
  - Returns null if no FAQs (hides section)
- [x] **Task 3.2:** Update `FeaturesSection.tsx` to fetch from database ✓ 2026-01-23
  - Converted to async server component
  - Uses getActiveFeatures() query + getFeatureIcon()
  - Returns null if no features (hides section)

### Phase 4: Admin UI - FAQ Manager
**Goal:** Build admin interface for FAQ management

- [x] **Task 4.1:** Create `components/admin/FAQManager.tsx` ✓ 2026-01-23
  - List of FAQ items with question preview
  - Add/Edit dialog with question/answer fields
  - Delete button with AlertDialog confirmation
  - Active/inactive toggle with Switch
  - Drag-drop reordering with @dnd-kit
- [x] **Task 4.2:** Add FAQManager to admin dashboard page ✓ 2026-01-23

### Phase 5: Admin UI - Feature Manager
**Goal:** Build admin interface for feature management

- [x] **Task 5.1:** Create `components/admin/FeatureManager.tsx` ✓ 2026-01-23
  - List of features with title/icon preview
  - Add/Edit dialog with title, description, icon picker
  - Icon picker: Select from 10 Lucide icons
  - Delete, toggle active, drag-drop reorder
- [x] **Task 5.2:** Add FeatureManager to admin dashboard page ✓ 2026-01-23
  - Added "Landing Page Content" section below User Search

### Phase 6: Seed Data & Testing
**Goal:** Migrate existing content and test

- [x] **Task 6.1:** Create seed script `scripts/seed-landing-content.ts` ✓ 2026-01-23
  - Inserts 6 FAQs with display_order 0-5
  - Inserts 4 features with display_order 0-3
  - Skips if content already exists (safe to re-run)
- [x] **Task 6.2:** Run seed script ✓ 2026-01-23
  - Inserted 6 FAQ items
  - Inserted 4 feature items
- [x] **Task 6.3:** Type check passed ✓ 2026-01-23
- [ ] **Task 6.4:** 👤 USER TESTING - Manual browser testing
  - Verify landing page renders from database
  - Verify admin can CRUD FAQs
  - Verify admin can CRUD features
  - Verify reordering works
  - Verify toggle active hides from landing

### Phase 7: Comprehensive Code Review (Mandatory)
**Goal:** Present implementation completion and thorough review

- [ ] **Task 7.1:** Present "Implementation Complete!" Message
- [ ] **Task 7.2:** Execute Comprehensive Code Review (If Approved)

---

## 12. Task Completion Tracking - MANDATORY WORKFLOW

### Task Completion Tracking - MANDATORY WORKFLOW
🚨 **CRITICAL: Real-time task completion tracking is mandatory**

- [ ] **🗓️ GET TODAY'S DATE FIRST** - Use time tool to get correct current date
- [ ] **Update task document immediately** after each completed subtask
- [ ] **Mark checkboxes as [x]** with completion timestamp
- [ ] **Add brief completion notes** (file paths, key changes)

---

## 13. File Structure & Organization

### New Files to Create
```
lib/drizzle/schema/
└── landing-content.ts          # New table definitions

lib/queries/
└── landing-content.ts          # Query functions

app/actions/
└── landing-content.ts          # Server actions (CRUD)

components/admin/
├── FAQManager.tsx              # FAQ CRUD interface
└── FeatureManager.tsx          # Feature CRUD interface

scripts/
└── seed-landing-content.ts     # Initial data seed
```

### Files to Modify
- [ ] `lib/drizzle/schema/index.ts` - Export new schema
- [ ] `components/landing/FAQSection.tsx` - Fetch from DB
- [ ] `components/landing/FeaturesSection.tsx` - Fetch from DB
- [ ] `app/(protected)/admin/dashboard/page.tsx` - Add content management sections

### Dependencies to Add
```json
{
  "dependencies": {
    "@dnd-kit/core": "^6.1.0",
    "@dnd-kit/sortable": "^8.0.0"
  }
}
```

---

## 14. Potential Issues & Security Review

### Error Scenarios to Analyze
- [ ] **Empty database state:** FAQSection/FeaturesSection should gracefully hide when no items
- [ ] **Concurrent edits:** Low risk (single admin), but revalidatePath should handle

### Security & Access Control Review
- [ ] **Admin Access Control:** All server actions must use `requireAdminAccess()`
- [ ] **Input Validation:** Validate question/answer lengths, icon name against allowlist
- [ ] **SQL Injection:** Using Drizzle ORM prevents SQL injection

---

## 15. Deployment & Configuration

### Environment Variables
No new environment variables required.

---

## 16. AI Agent Instructions

### Implementation Approach
Follow the standard workflow from the task template:
1. Create database schema and migration
2. Create down migration BEFORE running migrate
3. Build query functions and server actions
4. Update landing page components
5. Build admin UI components
6. Seed initial data
7. Test and review

### Code Quality Standards
- [ ] Follow TypeScript best practices
- [ ] Use early returns for validation
- [ ] Use async/await instead of .then()
- [ ] No fallback behavior - throw errors for invalid states
- [ ] Clean, professional comments (no history comments)

---

## 17. Notes & Additional Context

### Icon Allowlist for Features
Limited set of Lucide icons to choose from:
- `sparkles` - AI/magic features
- `layout` - Editor/design features
- `eye` - Preview features
- `rocket` - Publishing/speed features
- `shield` - Security features
- `zap` - Performance features
- `globe` - Domain/web features
- `palette` - Theme/design features
- `code` - Developer features
- `users` - Collaboration features

### Future Considerations
If this pattern works well, could extend to:
- Problem/Solution section management
- Hero demo steps configuration
- CTA text customization
- Testimonials management (if added)

---

*Task Number: 086*
*Created: 2026-01-23*
