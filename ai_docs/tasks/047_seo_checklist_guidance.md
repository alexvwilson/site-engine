# Task 047: SEO Checklist & Guidance

> **Status:** Complete - 2025-12-31
> **Priority:** P1 - High
> **Complexity:** Medium

---

## 1. Task Overview

### Task Title
**Title:** SEO Checklist & Guidance - Manual Scorecard for Site Optimization

### Goal Statement
**Goal:** Provide site owners with immediate visibility into their SEO optimization status through a checklist-based scorecard in the Settings tab. Users can see at a glance which SEO best practices are met and which need attention, with guidance text explaining each factor and why it matters.

---

## 2. Strategic Analysis & Solution Options

### Problem Context
Site owners don't know if their child sites are well-optimized for search engines. The current SEO Settings card only provides input fields for meta title and description, but no feedback on whether they're properly configured or if other SEO factors (alt text, headings, etc.) need attention.

### Solution Approach
Create an SEO Scorecard component that:
1. Analyzes existing site data (meta fields, images, sections)
2. Shows pass/fail status for each SEO check
3. Provides actionable guidance for each factor
4. Displays a visual progress indicator

This is Phase 1 of the SEO Guidance feature. Phase 2 (AI-powered analysis) will be a separate task.

---

## 3. Project Analysis & Current State

### Technology & Architecture
- **Frameworks & Versions:** Next.js 15.3, React 19
- **Language:** TypeScript 5.4 with strict mode
- **Database & ORM:** Supabase (Postgres) via Drizzle ORM
- **UI & Styling:** shadcn/ui components with Tailwind CSS v4

### Current State

**Site Schema** (`lib/drizzle/schema/sites.ts`):
- `meta_title: text` - Optional site-level meta title
- `meta_description: text` - Optional site-level meta description
- `favicon_url: text` - Optional favicon URL

**Page Schema** (`lib/drizzle/schema/pages.ts`):
- `meta_title: text` - Optional page-level meta title
- `meta_description: text` - Optional page-level meta description

**Section Content** (`lib/section-types.ts`):
- Images have `alt` text fields in various block types (ImageContent, GalleryContent, HeroContent)
- Text blocks have rich HTML content that may include headings

**Settings Tab** (`components/sites/SettingsTab.tsx`):
- Existing "SEO Settings" card at lines 655-711
- Contains meta title and meta description inputs
- Shows a preview of how the site appears in search results

### Data Available for Checks
1. **Site-level:** meta_title, meta_description, favicon_url, name, description
2. **Pages:** Each page has meta_title, meta_description, title
3. **Sections:** Content JSON contains image alt text, headings in text blocks
4. **Header:** Logo image (needs alt text)

---

## 4. Context & Problem Definition

### Problem Statement
Users have no visibility into whether their sites follow SEO best practices. They must manually check each page and section to verify meta tags, alt text, and heading structure.

### Success Criteria
- [ ] SEO Scorecard card displays in Settings tab (after existing SEO Settings card)
- [ ] Visual progress indicator shows "X/Y checks passed"
- [ ] Each SEO check shows ✓ (pass), ✗ (fail), or ⚠ (warning) status
- [ ] Per-page breakdown for page-level checks
- [ ] Guidance text explains each SEO factor and why it matters
- [ ] Clicking a failed check provides actionable next steps
- [ ] Real-time updates when user navigates back to Settings after making changes

---

## 5. Development Mode Context

- **New application in active development**
- **No backwards compatibility concerns**
- **Priority: Clean implementation** following established patterns

---

## 6. Technical Requirements

### Functional Requirements

**Site-Level Checks:**
| Check | Pass Condition | Guidance |
|-------|---------------|----------|
| Site Meta Title | `meta_title` is set and 30-60 chars | Titles appear in search results. 50-60 chars optimal. |
| Site Meta Description | `meta_description` is set and 120-160 chars | Descriptions appear below title in search results. |
| Favicon | `favicon_url` is set | Favicons build brand recognition in browser tabs. |
| Site Description | `description` (for brand personality) is set | Used for AI features and potential structured data. |

**Page-Level Checks (per page):**
| Check | Pass Condition | Guidance |
|-------|---------------|----------|
| Page Meta Title | `meta_title` is set OR page `title` exists | Each page needs a unique, descriptive title. |
| Page Meta Description | `meta_description` is set | Unique descriptions help search engines understand page content. |

**Content Checks:**
| Check | Pass Condition | Guidance |
|-------|---------------|----------|
| Image Alt Text | All images in sections have non-empty `alt` | Alt text helps search engines and screen readers. |
| Heading Structure | Text blocks use H2/H3 in proper hierarchy | Headings create content structure for SEO. |
| Logo Alt Text | Header logo has descriptive alt text | Logo alt text improves accessibility and SEO. |

**Scoring System:**
- Total score = (passed checks / total checks) × 100
- Display as: "7/10 SEO checks passed" with percentage
- Color coding: Green (80%+), Yellow (50-79%), Red (<50%)

### Non-Functional Requirements
- **Performance:** Lightweight client-side analysis, no API calls needed
- **UX:** Clear, non-overwhelming presentation
- **Expandable:** Design allows adding more checks later

---

## 7. Data & Database Changes

### Database Schema Changes
None required - all data already exists in current schema.

### Data Fetching
Need to extend the site data fetch to include:
- All pages with their meta fields
- All sections with their content (for image/heading analysis)

---

## 8. Backend Changes & Background Jobs

### Server Action Updates

**New Query Function** (`lib/queries/seo.ts`):
```typescript
export async function getSeoAuditData(siteId: string): Promise<SeoAuditData> {
  // Fetch site, all pages, all sections
  // Return structured data for client-side analysis
}
```

**Data Structure:**
```typescript
interface SeoAuditData {
  site: {
    name: string;
    description: string | null;
    metaTitle: string | null;
    metaDescription: string | null;
    faviconUrl: string | null;
    headerContent: HeaderContent | null;
  };
  pages: Array<{
    id: string;
    title: string;
    slug: string;
    metaTitle: string | null;
    metaDescription: string | null;
    isHome: boolean;
  }>;
  sections: Array<{
    pageId: string;
    blockType: string;
    content: unknown; // JSON content
  }>;
}
```

---

## 9. Frontend Changes

### Files to Create

#### 1. `lib/seo-checks.ts`
SEO check definitions and analysis logic:
```typescript
export interface SeoCheck {
  id: string;
  category: 'site' | 'page' | 'content';
  name: string;
  description: string;
  guidance: string;
}

export interface SeoCheckResult {
  check: SeoCheck;
  status: 'pass' | 'fail' | 'warning';
  details?: string;
  pageId?: string; // For page-specific checks
}

export function runSeoAudit(data: SeoAuditData): SeoCheckResult[];
```

#### 2. `components/sites/SeoScorecard.tsx`
Main scorecard component:
```typescript
interface SeoScorecardProps {
  siteId: string;
}

export function SeoScorecard({ siteId }: SeoScorecardProps) {
  // Fetch data, run checks, display results
}
```

#### 3. `components/sites/SeoCheckItem.tsx`
Individual check display:
```typescript
interface SeoCheckItemProps {
  result: SeoCheckResult;
  onNavigate?: () => void; // Optional navigation to fix location
}
```

### Files to Modify

#### 1. `components/sites/SettingsTab.tsx`
- Import and add SeoScorecard after existing SEO Settings card
- Pass siteId to SeoScorecard

#### 2. `lib/queries/seo.ts` (new file)
- Add getSeoAuditData query function

### Component Structure

```
<Card> SEO Scorecard
├── <CardHeader>
│   ├── Title: "SEO Health Check"
│   └── Progress: "7/10 checks passed" [===========---] 70%
├── <CardContent>
│   ├── <Collapsible> Site-Level (3 checks)
│   │   ├── <SeoCheckItem> Meta Title ✓
│   │   ├── <SeoCheckItem> Meta Description ✗
│   │   └── <SeoCheckItem> Favicon ✓
│   ├── <Collapsible> Page-Level (by page)
│   │   ├── <Collapsible> Home Page (2/2 passed)
│   │   │   ├── <SeoCheckItem> Meta Title ✓
│   │   │   └── <SeoCheckItem> Meta Description ✓
│   │   └── <Collapsible> About Page (1/2 passed)
│   │       ├── <SeoCheckItem> Meta Title ✓
│   │       └── <SeoCheckItem> Meta Description ✗
│   └── <Collapsible> Content Checks
│       ├── <SeoCheckItem> Image Alt Text (5/6 images) ⚠
│       └── <SeoCheckItem> Heading Structure ✓
└── </Card>
```

---

## 10. Code Changes Overview

### SEO Check Definitions

```typescript
// lib/seo-checks.ts

export const SEO_CHECKS: SeoCheck[] = [
  // Site-level
  {
    id: 'site-meta-title',
    category: 'site',
    name: 'Site Meta Title',
    description: 'A concise, keyword-rich title for your site',
    guidance: 'Set a meta title in Settings → SEO Settings. Aim for 50-60 characters. This appears as the clickable headline in search results.',
  },
  {
    id: 'site-meta-description',
    category: 'site',
    name: 'Site Meta Description',
    description: 'A compelling summary of your site',
    guidance: 'Add a meta description in Settings → SEO Settings. Keep it 120-160 characters. This appears below the title in search results.',
  },
  {
    id: 'site-favicon',
    category: 'site',
    name: 'Favicon',
    description: 'Browser tab icon for brand recognition',
    guidance: 'Upload a favicon in Settings → Logo & Branding. Square images (512x512px) work best.',
  },
  // Page-level
  {
    id: 'page-meta-title',
    category: 'page',
    name: 'Page Meta Title',
    description: 'Unique title for each page',
    guidance: 'Edit the page and set a custom meta title, or ensure the page has a descriptive title.',
  },
  {
    id: 'page-meta-description',
    category: 'page',
    name: 'Page Meta Description',
    description: 'Unique description for each page',
    guidance: 'Edit the page and add a meta description to help search engines understand the page content.',
  },
  // Content
  {
    id: 'image-alt-text',
    category: 'content',
    name: 'Image Alt Text',
    description: 'Descriptive text for all images',
    guidance: 'Add alt text to images in your sections. Describe what the image shows for accessibility and SEO.',
  },
  {
    id: 'logo-alt-text',
    category: 'content',
    name: 'Logo Alt Text',
    description: 'Alt text for your site logo',
    guidance: 'Your header logo should have descriptive alt text (e.g., "Company Name Logo").',
  },
];
```

### Analysis Logic

```typescript
// lib/seo-checks.ts

export function runSeoAudit(data: SeoAuditData): SeoCheckResult[] {
  const results: SeoCheckResult[] = [];

  // Site meta title
  const titleLength = data.site.metaTitle?.length ?? 0;
  results.push({
    check: SEO_CHECKS.find(c => c.id === 'site-meta-title')!,
    status: titleLength >= 30 && titleLength <= 60 ? 'pass' :
            titleLength > 0 ? 'warning' : 'fail',
    details: titleLength > 0 ? `${titleLength} characters` : 'Not set',
  });

  // ... similar for other checks

  return results;
}
```

---

## 11. Implementation Plan

### Phase 1: Core Infrastructure
**Goal:** Set up data fetching and check definitions

- [ ] **Task 1.1:** Create `lib/seo-checks.ts` with check definitions
  - Files: `lib/seo-checks.ts` (new)
  - Details: Define SeoCheck interface, SEO_CHECKS array, SeoCheckResult interface
- [ ] **Task 1.2:** Create `lib/queries/seo.ts` with data fetching
  - Files: `lib/queries/seo.ts` (new)
  - Details: getSeoAuditData function that fetches site, pages, sections

### Phase 2: Analysis Logic
**Goal:** Implement check analysis functions

- [ ] **Task 2.1:** Implement site-level checks
  - Files: `lib/seo-checks.ts`
  - Details: Meta title, meta description, favicon checks
- [ ] **Task 2.2:** Implement page-level checks
  - Files: `lib/seo-checks.ts`
  - Details: Per-page meta title and description checks
- [ ] **Task 2.3:** Implement content checks
  - Files: `lib/seo-checks.ts`
  - Details: Image alt text, logo alt text analysis

### Phase 3: UI Components
**Goal:** Build the scorecard display

- [ ] **Task 3.1:** Create SeoCheckItem component
  - Files: `components/sites/SeoCheckItem.tsx` (new)
  - Details: Display individual check with status icon, name, and expandable guidance
- [ ] **Task 3.2:** Create SeoScorecard component
  - Files: `components/sites/SeoScorecard.tsx` (new)
  - Details: Fetch data, run audit, display progress and grouped results
- [ ] **Task 3.3:** Integrate into SettingsTab
  - Files: `components/sites/SettingsTab.tsx`
  - Details: Add SeoScorecard card after SEO Settings card

### Phase 4: Polish & Testing
**Goal:** Refine UX and verify functionality

- [ ] **Task 4.1:** Add collapsible sections for categories
- [ ] **Task 4.2:** Add progress bar visualization
- [ ] **Task 4.3:** Test with various site configurations
- [ ] **Task 4.4:** Verify type safety and build passes

---

## 12. Task Completion Tracking

### Phase 1: Core Infrastructure ✓ 2025-12-31
- [x] **Task 1.1:** Created `lib/seo-checks.ts` with SeoCheck, SeoCheckResult, SeoAuditData interfaces
- [x] **Task 1.2:** Created `lib/queries/seo.ts` with getSeoAuditData function

### Phase 2: Analysis Logic ✓ 2025-12-31
- [x] **Task 2.1:** Site-level checks (meta title, meta description, favicon)
- [x] **Task 2.2:** Page-level checks (per-page meta title/description)
- [x] **Task 2.3:** Content checks (image alt text, logo alt text)

### Phase 3: UI Components ✓ 2025-12-31
- [x] **Task 3.1:** Created `components/sites/SeoCheckItem.tsx` with expandable guidance
- [x] **Task 3.2:** Created `components/sites/SeoScorecard.tsx` with progress bar and grouped results
- [x] **Task 3.3:** Integrated SeoScorecard into SettingsTab.tsx

### Phase 4: Polish & Testing ✓ 2025-12-31
- [x] **Task 4.1:** Collapsible sections for categories (site, page, content)
- [x] **Task 4.2:** Progress bar with color coding (green/yellow/red)
- [x] **Task 4.3:** Created `app/actions/seo.ts` server action
- [x] **Task 4.4:** Type check passes, no lint errors

---

## 13. File Structure & Organization

### Files to Create
```
lib/
├── seo-checks.ts           # Check definitions and analysis logic
└── queries/
    └── seo.ts              # Data fetching for SEO audit

components/sites/
├── SeoScorecard.tsx        # Main scorecard card component
└── SeoCheckItem.tsx        # Individual check item display
```

### Files to Modify
```
components/sites/
└── SettingsTab.tsx         # Add SeoScorecard card
```

---

## 14. Potential Issues & Security Review

### Edge Cases to Consider
- [ ] **Site with no pages:** Should show site-level checks only
- [ ] **Page with no sections:** Should not fail content checks
- [ ] **Empty alt text strings:** Treat as missing (fail)
- [ ] **Very long meta titles/descriptions:** Show warning, not fail
- [ ] **Missing header configuration:** Skip logo alt check gracefully

### Security Considerations
- [ ] **No user input processed:** All data comes from database
- [ ] **Read-only operation:** No mutations in SEO audit

---

## 15. Deployment & Configuration

No environment variables or configuration changes required.

---

## 16. AI Agent Instructions

### Implementation Approach
1. Start with check definitions (establishes data contract)
2. Add data fetching query
3. Implement analysis logic with tests
4. Build UI components bottom-up (SeoCheckItem → SeoScorecard)
5. Integrate into SettingsTab
6. Polish and test

### Code Quality Standards
- [ ] Use existing shadcn/ui components (Card, Collapsible, Badge)
- [ ] Follow established patterns from SettingsTab
- [ ] TypeScript strict mode compliance
- [ ] Mobile-responsive design

### Reference Files
- `components/sites/SettingsTab.tsx` - Card patterns, existing SEO section
- `lib/queries/sites.ts` - Query pattern examples
- `components/ui/collapsible.tsx` - Collapsible component (if exists)

---

## 17. Notes & Additional Context

### Design Decisions
- Scorecard is read-only (no edits from this view, links to edit locations)
- Grouped by category (site, pages, content) for scannability
- Expandable details prevent overwhelming users
- Progress indicator provides quick status at a glance

### Future Enhancements (Phase 2)
- AI-powered analysis via Trigger.dev background task
- Keyword optimization suggestions
- Content gap analysis
- Priority-ranked recommendations
- These will be implemented in a separate task

### Visual Design Notes
- Status icons: ✓ (CheckCircle2, green), ✗ (XCircle, red), ⚠ (AlertTriangle, yellow)
- Progress bar: Filled portion colored by score (green/yellow/red)
- Page grouping: Accordion/collapsible for per-page details

---

## 18. Second-Order Consequences & Impact Analysis

### Breaking Changes Analysis
- [ ] **None** - Additive feature only

### Ripple Effects Assessment
- [ ] **SettingsTab:** New card added, minimal visual impact
- [ ] **Data fetching:** New query function, no impact on existing queries

### Performance Implications
- [ ] **Initial load:** Additional query for pages/sections
- [ ] **Client-side:** Lightweight analysis, no heavy computation
- [ ] **Optimization:** Consider caching audit results if needed

### User Experience Impacts
- [ ] **Positive:** Clear visibility into SEO status
- [ ] **Guidance:** Actionable next steps reduce confusion
- [ ] **Motivation:** Progress indicator encourages completion

---

*Task Document Created: 2025-12-31*
*Template Version: 1.0*
