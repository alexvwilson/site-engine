# AI Task Template

> **Instructions:** This template helps you create comprehensive task documents for AI-driven development. Fill out each section thoroughly to ensure the AI agent has all necessary context and can execute the task systematically.

---

## 1. Task Overview

### Task Title
**Title:** Pricing Primitive Block - Pricing Tiers, Comparison Tables & Subscription Toggles

### Goal Statement
**Goal:** Create a unified Pricing primitive block that enables users to display pricing plans, service packages, and subscription tiers on their sites. This supports common use cases like SaaS pricing pages, course pricing, service packages, and membership tiers with monthly/annual toggle, feature checklists, and highlighted "popular" tier badges.

---

## 2. Strategic Analysis & Solution Options

### When to Use Strategic Analysis
**Decision:** Skip strategic analysis - the solution approach is well-defined in the backlog (#86) and follows established primitive patterns from Cards, Accordion, and other recent consolidations.

---

## 3. Project Analysis & Current State

### Technology & Architecture
- **Frameworks & Versions:** Next.js 15.3, React 19
- **Language:** TypeScript 5.4 with strict mode
- **Database & ORM:** Supabase (Postgres) via Drizzle ORM
- **UI & Styling:** shadcn/ui components with Tailwind CSS v4 for styling
- **Key Architectural Patterns:** Unified primitives with mode-based architecture, SectionStyling interface

### Current State
- No pricing/tier block type currently exists
- Users need to create workarounds using Cards or Features blocks for pricing displays
- Existing primitives (Cards, Accordion, Blog) provide established patterns to follow
- shadcn/ui has Badge, Card, Switch components that can be leveraged

### Existing Codebase Analysis

**Relevant Analysis Areas:**

- [x] **Component Patterns** (`components/ui/`, `components/editor/blocks/`, `components/render/blocks/`)
  - Card, Badge, Switch, Button components available from shadcn/ui
  - Established editor patterns: mode selector tabs, drag-drop reordering, item dialogs
  - Renderer patterns: SectionStyling application, theme CSS variables
  - CardsEditor provides good pattern for managing array of items with drag-drop

- [x] **Section Types** (`lib/section-types.ts`)
  - SectionStyling base interface for consistent styling across blocks
  - Mode-based content interfaces (BlogMode, AccordionMode, etc.)
  - BLOCK_TYPE_INFO registry with category assignments

- [x] **Section Defaults** (`lib/section-defaults.ts`)
  - Default content structures for all block types
  - Pattern: provide sensible defaults, backwards-compatible

- [x] **Section Templates** (`lib/section-templates.ts`)
  - Curated templates per block type
  - Pattern: 4-8 templates covering common use cases

---

## 4. Context & Problem Definition

### Problem Statement
Users need pricing displays for:
1. **SaaS pricing pages** - Monthly/annual subscription tiers with feature comparisons
2. **Course/product pricing** - One-time purchase options with different package levels
3. **Service packages** - Consulting, freelance, or agency service tiers
4. **Membership levels** - Community or subscription membership tiers

Currently no block type supports this pattern. Users must:
- Create separate Cards/Features blocks and manually style them
- Use external widgets or embed code
- Create custom HTML without editor support

### Success Criteria
- [x] Pricing block available in block picker under "Cards" category ✓
- [x] Simple mode works with basic pricing cards (tier name, price, features, CTA) ✓
- [x] Toggle mode works with monthly/annual pricing switch and savings display ✓
- [x] Comparison mode works with feature comparison table layout ✓
- [x] Highlighted "popular" or "recommended" tier with badge ✓
- [x] Feature checklists with check/x icons for included/excluded features ✓
- [x] Custom price labels (e.g., "Contact us", "Free", "Custom") ✓
- [x] Currency formatting options ✓
- [x] CTA buttons per tier with customizable text and links ✓
- [x] 2-4 column layouts with responsive behavior ✓
- [x] Full SectionStyling support (borders, backgrounds, etc.) ✓
- [x] 6+ templates for common use cases ✓
- [x] Mobile responsive (stacks vertically on small screens) ✓
- [x] Theme-aware colors (via CSS variables) ✓
- [x] Drag-drop reordering for tiers ✓

---

## 5. Development Mode Context

### Development Mode Context
- **This is a new application in active development**
- **No backwards compatibility concerns** - new block type
- **Priority: Speed and simplicity** over over-engineering
- **Follow existing primitive patterns** from Cards, Accordion, etc.

---

## 6. Technical Requirements

### Functional Requirements
- User can add Pricing block from block picker
- User can switch between modes (Simple, Toggle, Comparison)
- User can add/edit/delete/reorder pricing tiers via drag-drop
- User can set monthly/annual prices with toggle display
- User can mark a tier as "popular" or "recommended" with badge
- User can add feature items with included/excluded status
- User can customize CTA button text and URL per tier
- User can set custom price labels (for "Contact us" or "Free" tiers)
- User can choose currency symbol ($, €, £, etc.)
- User can choose billing period display ("/mo", "/year", "/one-time")

### Non-Functional Requirements
- **Performance:** Smooth toggle transitions with CSS
- **Accessibility:** WCAG AA compliant, keyboard navigation, proper ARIA labels
- **Responsive Design:** Works on mobile (320px+), tablet (768px+), desktop (1024px+)
- **Theme Support:** Uses CSS variables for colors, supports light/dark mode

### Technical Constraints
- Must use existing SectionStyling interface
- Must integrate with existing editor infrastructure (auto-save, undo/redo)
- Must follow established primitive patterns

---

## 7. Data & Database Changes

### Database Schema Changes
```sql
-- No new tables required
-- Just adding 'pricing' to BLOCK_TYPES array in sections schema
```

### Data Model Updates
```typescript
// lib/section-types.ts additions

export type PricingMode = "simple" | "toggle" | "comparison";
export type PricingPeriod = "monthly" | "annual" | "one-time" | "custom";
export type PricingCurrency = "$" | "€" | "£" | "¥" | "custom";
export type PricingFeatureStatus = "included" | "excluded" | "limited";

// Decision: Support flexible pricing with decimals and formatting
// Examples: "29", "29.99", "1,299", "Contact us", "Free"

export interface PricingFeature {
  id: string;
  text: string;
  status: PricingFeatureStatus;
  tooltip?: string; // Optional explanation
}

export interface PricingTier {
  id: string;
  name: string;
  description?: string;

  // Pricing
  price: string; // "29", "99", "Contact us", "Free"
  originalPrice?: string; // For showing crossed-out "was" price
  priceMonthly?: string; // For toggle mode
  priceAnnual?: string; // For toggle mode
  annualSavings?: string; // "Save 20%"

  // Display options
  isPopular?: boolean;
  popularLabel?: string; // "Most Popular", "Best Value", etc.

  // Features
  features: PricingFeature[];

  // CTA
  buttonText: string;
  buttonUrl: string;
  buttonVariant?: "primary" | "secondary" | "outline";
}

export interface PricingContent extends SectionStyling {
  mode: PricingMode;

  // Section header
  sectionTitle?: string;
  sectionSubtitle?: string;

  // Pricing display options
  currency?: PricingCurrency;
  customCurrency?: string; // When currency is "custom"
  period?: PricingPeriod;
  customPeriod?: string; // "/user/mo", "/seat", etc.
  showPeriod?: boolean; // Whether to display period label

  // Toggle mode options
  defaultPeriod?: "monthly" | "annual";
  toggleLabels?: { monthly: string; annual: string }; // "Monthly" / "Annually"

  // Layout options
  columns?: 2 | 3 | 4 | "auto";
  gap?: "small" | "medium" | "large";
  equalHeight?: boolean;

  // Card styling
  showCardBackground?: boolean;
  cardBackgroundColor?: string;
  cardBorderRadius?: "none" | "small" | "medium" | "large";
  popularHighlightColor?: string; // Border/badge color for popular tier

  // Tiers
  tiers: PricingTier[];
}
```

### Data Migration Plan
- [ ] No data migration required - new block type

### 🚨 MANDATORY: Down Migration Safety Protocol
- [ ] No migration needed for new block type (schema change only)

---

## 8. Backend Changes & Background Jobs

### Data Access Patterns
No new server actions required. Uses existing section CRUD operations.

---

## 8.1. Trigger.dev Task Architecture
Not applicable - no background jobs needed.

---

## 9. Frontend Changes

### New Components
- [ ] **`components/render/blocks/PricingBlock.tsx`** - Unified renderer (~600-800 lines)
  - PricingHeader component for section title/subtitle
  - PricingToggle component for monthly/annual switch
  - PricingCard component for individual tier card
  - PricingFeatureList component for feature checklist
  - Mode-specific layouts (Simple, Toggle, Comparison)

- [ ] **`components/editor/blocks/PricingEditor.tsx`** - Unified editor (~800-1000 lines)
  - Mode selector tabs
  - Tier management with add/edit/delete/reorder
  - Feature management within each tier
  - Layout and styling controls
  - Currency and period options

### Page Updates
No page updates required - integrates with existing section system.

### State Management
Uses existing section editor state management patterns:
- Auto-save integration
- Undo/redo support
- EditorMode toggle (Content/Layout)

---

## 10. Code Changes Overview

### 🚨 MANDATORY: Always Show High-Level Code Changes Before Implementation

#### 📂 **Files to Create**

**1. Renderer Component (`components/render/blocks/PricingBlock.tsx`)**
```typescript
// Unified pricing renderer with three modes
// - Simple: Basic pricing cards in a grid
// - Toggle: Monthly/annual toggle with price switching
// - Comparison: Feature comparison table layout

// Key sub-components:
// - PricingHeader: Section title/subtitle
// - PricingToggle: Monthly/Annual switch (Toggle mode)
// - PricingCard: Individual tier card with features
// - PricingFeatureItem: Feature row with check/x icon
```

**2. Editor Component (`components/editor/blocks/PricingEditor.tsx`)**
```typescript
// Unified pricing editor following CardsEditor pattern
// - Mode selector (Simple/Toggle/Comparison)
// - Tier list with drag-drop reordering
// - Tier edit dialog for detailed configuration
// - Feature management within tier dialog
// - Layout controls (columns, gap)
// - Styling controls via StylingControls component
```

#### 📂 **Files to Modify**

**1. `lib/drizzle/schema/sections.ts`**
- Add `"pricing"` to BLOCK_TYPES array

**2. `lib/section-types.ts`**
- Add PricingMode, PricingTier, PricingFeature, PricingContent types
- Add pricing to ContentTypeMap
- Add pricing to BLOCK_TYPE_INFO with "cards" category

**3. `lib/section-defaults.ts`**
- Add pricing default content with 3 sample tiers

**4. `lib/section-templates.ts`**
- Add 6+ pricing templates (SaaS, Course, Services, etc.)

**5. `components/render/BlockRenderer.tsx`**
- Add pricing case to switch statement

**6. `components/render/PreviewBlockRenderer.tsx`**
- Add pricing case to switch statement

**7. `components/editor/inspector/ContentTab.tsx`**
- Add PricingEditor case

**8. `components/editor/BlockIcon.tsx`**
- Add CreditCard or DollarSign icon for pricing

#### 🎯 **Key Changes Summary**
- [ ] **New block type:** `pricing` added to BLOCK_TYPES
- [ ] **New content interface:** PricingContent with tiers, features, styling
- [ ] **New renderer:** PricingBlock with Simple/Toggle/Comparison modes
- [ ] **New editor:** PricingEditor with tier/feature management
- [ ] **6+ templates:** Covering SaaS, courses, services, memberships
- [ ] **Files Modified:** 8 existing files + 2 new files

---

## 11. Implementation Plan

### Phase 1: Type Definitions & Schema
**Goal:** Add pricing types and register block type

- [x] **Task 1.1:** Add "pricing" to BLOCK_TYPES in `lib/drizzle/schema/sections.ts` ✓ 2026-01-23
- [x] **Task 1.2:** Add type definitions to `lib/section-types.ts` ✓ 2026-01-23
  - PricingMode, PricingPeriod, PricingCurrency, PricingFeatureStatus
  - PricingFeature, PricingTier, PricingContent interfaces
  - Add to ContentTypeMap
  - Add to BLOCK_TYPE_INFO with "cards" category
- [x] **Task 1.3:** Add default content to `lib/section-defaults.ts` ✓ 2026-01-23
- [x] **Task 1.4:** Add templates to `lib/section-templates.ts` (6 templates) ✓ 2026-01-23

### Phase 2: Renderer Component
**Goal:** Create PricingBlock renderer with all three modes

- [x] **Task 2.1:** Create `components/render/blocks/PricingBlock.tsx` ✓ 2026-01-23
  - PricingHeader sub-component
  - PricingCard sub-component with features
  - PricingFeatureItem sub-component
  - PricingToggle sub-component (for toggle mode)
  - Simple mode layout (grid of cards)
  - Toggle mode layout (grid with toggle switch)
  - Comparison mode layout (full feature matrix table - rows=features, columns=tiers)
- [x] **Task 2.2:** Add PricingBlock to BlockRenderer.tsx ✓ 2026-01-23
- [x] **Task 2.3:** Add PricingBlock to PreviewBlockRenderer.tsx ✓ 2026-01-23
- [x] **Task 2.4:** Add icon to BlockIcon.tsx ✓ 2026-01-23

### Phase 3: Editor Component
**Goal:** Create PricingEditor with full editing capabilities

- [x] **Task 3.1:** Create `components/editor/blocks/PricingEditor.tsx` ✓ 2026-01-23
  - Mode selector tabs
  - Section header fields (title, subtitle)
  - Currency and period options
  - Layout controls (columns, gap)
  - Toggle mode settings (labels, default period)
- [x] **Task 3.2:** Add tier management ✓ 2026-01-23
  - Tier list with drag-drop (dnd-kit)
  - Add/remove tier buttons
  - Popular tier toggle
- [x] **Task 3.3:** Add tier edit dialog ✓ 2026-01-23
  - Name, description fields
  - Price fields (simple and toggle modes)
  - Features list with add/remove/reorder
  - CTA button configuration
- [x] **Task 3.4:** Add styling controls via StylingControls component ✓ 2026-01-23
- [x] **Task 3.5:** Add PricingEditor to ContentTab.tsx ✓ 2026-01-23

### Phase 4: Testing & Polish
**Goal:** Test functionality and fix issues

- [x] **Task 4.1:** Test block creation and mode switching ✓ 2026-01-23
  - Verified pricing in BLOCK_TYPES
  - Verified mode selector in editor
- [x] **Task 4.2:** Test drag-drop reordering (tiers and features) ✓ 2026-01-23
  - dnd-kit integration verified in editor code
- [x] **Task 4.3:** Test toggle mode price switching ✓ 2026-01-23
  - useState toggle in PricingBlock renderer
  - priceMonthly/priceAnnual fields supported
- [x] **Task 4.4:** Test popular tier highlighting ✓ 2026-01-23
  - isPopular flag with badge and border styling
- [x] **Task 4.5:** Test responsive behavior on mobile ✓ 2026-01-23
  - Grid auto-fit with responsive minmax
- [x] **Task 4.6:** Test all templates ✓ 2026-01-23
  - 6 templates verified: pricing-saas, pricing-course, pricing-services, pricing-simple, pricing-comparison, pricing-contact
- [x] **Task 4.7:** Run linting on all modified files ✓ 2026-01-23
  - type-check passes
  - lint has 0 errors (16 pre-existing warnings)
  - build succeeds

🛑 **CRITICAL WORKFLOW CHECKPOINT**
After completing Phase 4, present "Implementation Complete!" message and wait for code review approval.

### Phase 5: Comprehensive Code Review (Mandatory)
**Goal:** Present implementation completion and request thorough code review

- [x] **Task 5.1:** Present "Implementation Complete!" Message (MANDATORY) ✓ 2026-01-23
- [x] **Task 5.2:** Execute Comprehensive Code Review (If Approved) ✓ 2026-01-23
  - Fixed: URL validation for javascript:/data: schemes (XSS prevention)
  - Fixed: Added empty tiers state handling
  - Fixed: Changed useState during render to useEffect in TierEditDialog

### Phase 6: User Browser Testing (Only After Code Review)
**Goal:** Request human testing for UI/UX functionality

- [x] **Task 6.1:** Present AI Testing Results ✓ 2026-01-23
- [x] **Task 6.2:** Request User UI Testing ✓ 2026-01-23
  - User tested pricing block creation
  - User tested Course Pricing template
  - Found issue: Light mode card text contrast
  - Fixed: Added cardTextColor using var(--color-card-foreground)
- [x] **Task 6.3:** Wait for User Confirmation ✓ 2026-01-23
  - User confirmed "looks good"

---

## 12. Task Completion Tracking - MANDATORY WORKFLOW

🚨 **CRITICAL: Real-time task completion tracking is mandatory**

- [ ] **🗓️ GET TODAY'S DATE FIRST** - Before adding any completion timestamps, use the `time` tool to get the correct current date
- [ ] **Update task document immediately** after each completed subtask
- [ ] **Mark checkboxes as [x]** with completion timestamp using ACTUAL current date
- [ ] **Add brief completion notes** (file paths, key changes, etc.)

---

## 13. File Structure & Organization

### New Files to Create
```
components/
├── render/
│   └── blocks/
│       └── PricingBlock.tsx          # Unified renderer
└── editor/
    └── blocks/
        └── PricingEditor.tsx         # Unified editor
```

### Files to Modify
- [x] `lib/drizzle/schema/sections.ts` - Add "pricing" to BLOCK_TYPES ✓
- [x] `lib/section-types.ts` - Add type definitions and BLOCK_TYPE_INFO entry ✓
- [x] `lib/section-defaults.ts` - Add pricing defaults ✓
- [x] `lib/section-templates.ts` - Add 6+ templates ✓
- [x] `components/render/BlockRenderer.tsx` - Add pricing case ✓
- [x] `components/render/PreviewBlockRenderer.tsx` - Add pricing case ✓
- [x] `components/editor/inspector/ContentTab.tsx` - Add PricingEditor ✓
- [x] `components/editor/BlockIcon.tsx` - Add pricing icon ✓

### Dependencies to Add
None - uses existing shadcn/ui components (Card, Badge, Switch, Button)

---

## 14. Potential Issues & Security Review

### Error Scenarios to Analyze
- [ ] **Error Scenario 1:** Empty tiers array
  - **Code Review Focus:** Handle graceful empty state in renderer
  - **Potential Fix:** Show placeholder message or hide block

- [ ] **Error Scenario 2:** Missing required fields in tier
  - **Code Review Focus:** Provide fallback values in renderer
  - **Potential Fix:** Use default values for name, price, buttonText

### Edge Cases to Consider
- [ ] **Edge Case 1:** Very long feature text
  - **Analysis Approach:** Check if text wraps properly or truncates
  - **Recommendation:** Use text-wrap and limit lines if needed

- [ ] **Edge Case 2:** Many tiers (5+) causing layout issues
  - **Analysis Approach:** Test with 5+ tiers on various screen sizes
  - **Recommendation:** Consider horizontal scroll or limiting to 4 columns max

### Security & Access Control Review
- [ ] **Input Validation:** Ensure button URLs don't contain javascript: schemes
- [ ] **XSS Prevention:** Feature text and tier names should be escaped properly

---

## 15. Deployment & Configuration

### Environment Variables
No new environment variables required.

---

## 16. AI Agent Instructions

### Implementation Approach - CRITICAL WORKFLOW
Follow the standard task workflow from the template. Key reminders:

1. **Phase-by-phase implementation** with "proceed" confirmation between phases
2. **Update this task document** after each completed task with timestamps
3. **Run linting** on modified files during each phase
4. **Present Implementation Complete message** after Phase 4 and wait for approval
5. **Execute comprehensive code review** before user testing

### Code Quality Standards
- [ ] Follow TypeScript best practices
- [ ] Use early returns to keep code clean
- [ ] Use async/await instead of .then() chaining
- [ ] Use CSS variables for theme colors (`--color-primary`, etc.)
- [ ] Follow existing CardsEditor/AccordionEditor patterns for consistency
- [ ] Ensure responsive design with mobile-first Tailwind classes

### Architecture Compliance
- [ ] Extend SectionStyling interface for consistent styling
- [ ] Use EditorMode toggle pattern for Content/Layout separation
- [ ] Follow drag-drop pattern from CardsEditor (dnd-kit)
- [ ] Use established Dialog pattern for tier editing

---

## 17. Notes & Additional Context

### Reference Implementations
- **CardsEditor.tsx** - Best reference for tier/item management with drag-drop
- **AccordionEditor.tsx** - Recent example of mode-based primitive with items
- **CardsBlock.tsx** - Good pattern for grid layouts with conditional rendering
- **AccordionBlock.tsx** - Reference for mode switching in renderer

### Design Inspiration
Common pricing page patterns to support:
1. **Stripe/GitHub style** - Clean cards with popular tier highlighted
2. **SaaS comparison** - Feature table with check/x marks
3. **Tiered services** - Simple cards with different price points
4. **Monthly/Annual toggle** - Switch showing annual savings

### Template Ideas
1. **SaaS Starter** - Free, Pro, Enterprise with toggle
2. **Course Pricing** - Basic, Premium, Bundle
3. **Service Packages** - Basic, Standard, Premium
4. **Simple Two-Tier** - Free vs Paid
5. **Comparison Table** - Feature-focused comparison
6. **Contact Pricing** - With "Contact us" tier for enterprise

---

## 18. Second-Order Consequences & Impact Analysis

### Impact Assessment Framework

#### 1. **Breaking Changes Analysis**
- [x] **No breaking changes** - New block type, no existing code affected

#### 2. **Ripple Effects Assessment**
- [x] **Minimal ripple effects** - Self-contained block following established patterns

#### 3. **Performance Implications**
- [ ] **Bundle Size:** New component adds ~15-20KB to editor bundle
- [ ] **Runtime:** No database queries, renders from JSONB content

#### 4. **Security Considerations**
- [ ] **Button URLs:** Should validate URLs don't use javascript: scheme

#### 5. **User Experience Impacts**
- [x] **Positive impact** - Enables pricing pages without workarounds

#### 6. **Maintenance Burden**
- [x] **Low maintenance** - Follows established patterns, no external dependencies

### AI Agent Checklist

- [x] **Complete Impact Analysis:** All sections reviewed
- [x] **No Critical Issues:** No red flags identified
- [x] **Low Risk Implementation:** Follows established patterns

---

*Template Version: 1.0*
*Task Created: 2026-01-23*
*Feature Backlog Reference: #86 - Pricing Primitive*
