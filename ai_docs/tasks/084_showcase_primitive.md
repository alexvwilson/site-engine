# AI Task Template

> **Instructions:** This template helps you create comprehensive task documents for AI-driven development. Fill out each section thoroughly to ensure the AI agent has all necessary context and can execute the task systematically.

---

## 1. Task Overview

### Task Title
**Title:** Showcase Primitive Block - Stats Counters & File Downloads

### Goal Statement
**Goal:** Create a unified Showcase primitive block with two modes (Stats and Downloads) that enables users to add social proof statistics with animated counters and file download sections to their sites. This supports common use cases like displaying achievements ("500+ Clients"), metrics ("10 Years Experience"), lead magnet downloads, and resource libraries.

---

## 2. Strategic Analysis & Solution Options

### When to Use Strategic Analysis
**Decision:** Skip strategic analysis - the solution approach is well-defined in the backlog (#87) and follows established primitive patterns from Cards, Accordion, Pricing, and other recent consolidations.

---

## 3. Project Analysis & Current State

### Technology & Architecture
- **Frameworks & Versions:** Next.js 15.3, React 19
- **Language:** TypeScript 5.4 with strict mode
- **Database & ORM:** Supabase (Postgres) via Drizzle ORM
- **UI & Styling:** shadcn/ui components with Tailwind CSS v4 for styling
- **Key Architectural Patterns:** Unified primitives with mode-based architecture, SectionStyling interface

### Current State
- No stats counter or file download block type currently exists
- Users need social proof sections but must use workarounds (Features block, custom HTML)
- Documents table already exists for tracking uploaded files (from #54 PDF Document Upload)
- Existing primitives (Cards, Accordion, Pricing) provide established patterns to follow

### Existing Codebase Analysis

**Relevant Analysis Areas:**

- [x] **Component Patterns** (`components/ui/`, `components/editor/blocks/`, `components/render/blocks/`)
  - Card, Badge, Button components available from shadcn/ui
  - Established editor patterns: mode selector tabs, drag-drop reordering, item dialogs
  - Renderer patterns: SectionStyling application, theme CSS variables
  - CardsEditor/PricingEditor provide good patterns for managing arrays of items

- [x] **Section Types** (`lib/section-types.ts`)
  - SectionStyling base interface for consistent styling across blocks
  - Mode-based content interfaces (AccordionMode, PricingMode, etc.)
  - BLOCK_TYPE_INFO registry with category assignments

- [x] **Documents System** (`lib/drizzle/schema/documents.ts`, `app/actions/storage.ts`)
  - `documents` table already tracks uploaded files
  - `listSiteDocuments()` action returns documents for a site
  - Documents have: id, filename, storage_path, file_size, mime_type, site_id, created_at

- [x] **Section Defaults** (`lib/section-defaults.ts`)
  - Default content structures for all block types
  - Pattern: provide sensible defaults, backwards-compatible

- [x] **Section Templates** (`lib/section-templates.ts`)
  - Curated templates per block type
  - Pattern: 4-8 templates covering common use cases

---

## 4. Context & Problem Definition

### Problem Statement
Users need social proof and download sections for:
1. **Stats/Metrics** - "500+ Happy Clients", "10+ Years Experience", "$2M+ Revenue"
2. **Achievement counters** - Animated numbers that count up on scroll for visual impact
3. **Lead magnet downloads** - PDF guides, checklists, resources with download buttons
4. **Resource libraries** - Lists of downloadable files with descriptions

Currently no block type supports these patterns. Users must:
- Create Features blocks with static numbers (no animation)
- Add download links manually in text blocks
- Use external widgets for animated counters

### Success Criteria
- [ ] Showcase block available in block picker under "Utility" category
- [ ] Stats mode works with animated count-up numbers on scroll-into-view
- [ ] Stats mode supports 2-4 stat items in a row with icons/labels
- [ ] Stats mode supports prefix/suffix ("$", "+", "K", "%", "M")
- [ ] Downloads mode works with file list and download buttons
- [ ] Downloads mode shows file type icons (PDF, ZIP, DOC, etc.)
- [ ] Downloads mode can pull from uploaded documents or manual entries
- [ ] Full SectionStyling support (borders, backgrounds, etc.)
- [ ] 6+ templates for common use cases
- [ ] Mobile responsive (stats stack, downloads list properly)
- [ ] Theme-aware colors (via CSS variables)
- [ ] Drag-drop reordering for stats and download items

---

## 5. Development Mode Context

### Development Mode Context
- **This is a new application in active development**
- **No backwards compatibility concerns** - new block type
- **Priority: Speed and simplicity** over over-engineering
- **Follow existing primitive patterns** from Cards, Accordion, Pricing

---

## 6. Technical Requirements

### Functional Requirements

**Stats Mode:**
- User can add 2-6 stat items
- Each stat has: value (number), prefix, suffix, label, optional icon
- Numbers animate from 0 to target value when section scrolls into view
- Animation duration configurable (fast/medium/slow)
- Animation only triggers once per page load
- Layout: 2, 3, or 4 columns (auto-responsive)

**Downloads Mode:**
- User can add download items manually OR select from uploaded documents
- Each item has: title, description (optional), file URL, file type, file size (optional)
- File type determines icon (PDF, DOC, XLS, ZIP, IMG, VIDEO, AUDIO, OTHER)
- Download button with customizable text ("Download", "Get Free PDF", etc.)
- Layout: List view or Grid view (2-3 columns)
- "New Window" toggle for downloads

### Non-Functional Requirements
- **Performance:** Smooth count-up animations using requestAnimationFrame
- **Accessibility:** WCAG AA compliant, download links clearly labeled, ARIA attributes
- **Responsive Design:** Works on mobile (320px+), tablet (768px+), desktop (1024px+)
- **Theme Support:** Uses CSS variables for colors, supports light/dark mode

### Technical Constraints
- Must use existing SectionStyling interface
- Must integrate with existing editor infrastructure (auto-save, undo/redo)
- Must follow established primitive patterns
- Count-up animation uses Intersection Observer API (no external libraries)

---

## 7. Data & Database Changes

### Database Schema Changes
```sql
-- No new tables required
-- Just adding 'showcase' to BLOCK_TYPES array in sections schema
```

### Data Model Updates
```typescript
// lib/section-types.ts additions

export type ShowcaseMode = "stats" | "downloads";
export type ShowcaseAnimationSpeed = "fast" | "medium" | "slow";
export type ShowcaseLayout = 2 | 3 | 4 | "auto";
export type DownloadLayout = "list" | "grid";
export type DownloadFileType = "pdf" | "doc" | "xls" | "zip" | "img" | "video" | "audio" | "other";

export interface StatItem {
  id: string;
  value: number;           // The number to count to (e.g., 500)
  prefix?: string;         // Before number: "$", "#"
  suffix?: string;         // After number: "+", "K", "M", "%"
  label: string;           // Description: "Happy Clients"
  icon?: string;           // Lucide icon name (optional)
}

export interface DownloadItem {
  id: string;
  title: string;
  description?: string;
  fileUrl: string;
  fileType: DownloadFileType;
  fileSize?: string;       // "2.5 MB", "340 KB"
  buttonText?: string;     // Default: "Download"
  openInNewWindow?: boolean;
  // If linked to documents table
  documentId?: string;
}

export interface ShowcaseContent extends SectionStyling {
  mode: ShowcaseMode;

  // Section header (all modes)
  sectionTitle?: string;
  sectionSubtitle?: string;

  // Stats mode
  stats: StatItem[];
  statsLayout: ShowcaseLayout;
  animationSpeed: ShowcaseAnimationSpeed;
  animateOnScroll: boolean;  // If false, shows final values immediately
  showStatIcons: boolean;

  // Downloads mode
  downloads: DownloadItem[];
  downloadLayout: DownloadLayout;
  downloadColumns?: 2 | 3;  // For grid layout
  showFileSize: boolean;
  showFileType: boolean;
  defaultButtonText: string;
}
```

### Data Migration Plan
- [ ] No data migration required - new block type

---

## 8. Backend Changes & Background Jobs

### Data Access Patterns
No new server actions required. Uses existing section CRUD operations.

The Downloads mode may optionally fetch from `listSiteDocuments()` action for document picker.

---

## 9. Frontend Changes

### New Components

**Editor:**
- [ ] `components/editor/blocks/ShowcaseEditor.tsx` - Unified editor with mode tabs
  - Stats tab: StatItem array management with drag-drop
  - Downloads tab: DownloadItem management with document picker option

**Renderer:**
- [ ] `components/render/blocks/ShowcaseBlock.tsx` - Unified renderer
  - Stats mode: Animated counters with Intersection Observer
  - Downloads mode: File list/grid with type icons

**Shared:**
- [ ] `lib/file-icons.tsx` - File type icons (PDF, DOC, XLS, ZIP, etc.)

### Files to Modify

**Schema & Types:**
- [ ] `lib/drizzle/schema/sections.ts` - Add "showcase" to BLOCK_TYPES
- [ ] `lib/section-types.ts` - Add ShowcaseContent and related types
- [ ] `lib/section-defaults.ts` - Add showcase defaults
- [ ] `lib/section-templates.ts` - Add showcase templates

**Editor Integration:**
- [ ] `components/editor/inspector/ContentTab.tsx` - Add ShowcaseEditor case
- [ ] `components/editor/BlockIcon.tsx` - Add icon for showcase

**Renderer Integration:**
- [ ] `components/render/BlockRenderer.tsx` - Add ShowcaseBlock case
- [ ] `components/render/PreviewBlockRenderer.tsx` - Add ShowcaseBlock case

---

## 10. Code Changes Overview

### 📂 **Files to Create**

```typescript
// components/editor/blocks/ShowcaseEditor.tsx (~800-1000 lines)
// - Mode tabs (Stats / Downloads)
// - Stats: drag-drop list, item fields (value, prefix, suffix, label, icon)
// - Downloads: drag-drop list, document picker option, file type selector

// components/render/blocks/ShowcaseBlock.tsx (~500-700 lines)
// - Stats mode with Intersection Observer animation
// - Downloads mode with file icons and buttons

// lib/file-icons.tsx (~150 lines)
// - SVG icons for PDF, DOC, XLS, ZIP, IMG, VIDEO, AUDIO, OTHER
// - getFileTypeFromUrl() utility
// - getFileIcon() component
```

### 📂 **Files to Modify**

```typescript
// lib/drizzle/schema/sections.ts
// Add "showcase" to BLOCK_TYPES array

// lib/section-types.ts
// Add ~60 lines: ShowcaseMode, StatItem, DownloadItem, ShowcaseContent

// lib/section-defaults.ts
// Add ~50 lines: showcase defaults with sample stats and downloads

// lib/section-templates.ts
// Add ~100 lines: 6 templates (Stats Simple, Stats Icons, Downloads List, etc.)

// components/editor/inspector/ContentTab.tsx
// Add 1 case for ShowcaseEditor

// components/editor/BlockIcon.tsx
// Add 1 icon mapping (Trophy or Award for showcase)

// components/render/BlockRenderer.tsx
// Add 1 case for ShowcaseBlock

// components/render/PreviewBlockRenderer.tsx
// Add 1 case for ShowcaseBlock
```

### 🎯 **Key Implementation Details**

**Stats Count-Up Animation:**
```typescript
// Uses Intersection Observer + requestAnimationFrame
const useCountUp = (target: number, duration: number, isVisible: boolean) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    const startTime = performance.now();
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(target * easeOut));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [target, duration, isVisible]);

  return count;
};
```

**File Type Detection:**
```typescript
const getFileType = (url: string, mimeType?: string): DownloadFileType => {
  const ext = url.split('.').pop()?.toLowerCase();

  const typeMap: Record<string, DownloadFileType> = {
    pdf: "pdf",
    doc: "doc", docx: "doc",
    xls: "xls", xlsx: "xls",
    zip: "zip", rar: "zip", "7z": "zip",
    jpg: "img", jpeg: "img", png: "img", gif: "img", webp: "img",
    mp4: "video", mov: "video", avi: "video",
    mp3: "audio", wav: "audio", ogg: "audio",
  };

  return typeMap[ext || ""] || "other";
};
```

---

## 11. Implementation Plan

### Phase 1: Type Definitions & Schema (~15 min)
**Goal:** Add showcase types and database schema

- [ ] **Task 1.1:** Add "showcase" to BLOCK_TYPES in `lib/drizzle/schema/sections.ts`
- [ ] **Task 1.2:** Add type definitions to `lib/section-types.ts`
  - ShowcaseMode, ShowcaseAnimationSpeed, ShowcaseLayout, DownloadLayout, DownloadFileType
  - StatItem, DownloadItem interfaces
  - ShowcaseContent interface extending SectionStyling
- [ ] **Task 1.3:** Update ContentType union and ContentTypeMap

### Phase 2: Defaults & Templates (~20 min)
**Goal:** Add showcase defaults and templates

- [ ] **Task 2.1:** Add showcase defaults to `lib/section-defaults.ts`
  - Default mode: "stats"
  - 3 sample stat items
  - 2 sample download items
  - SectionStyling defaults
- [ ] **Task 2.2:** Add showcase templates to `lib/section-templates.ts`
  - Stats Simple (4 numbers, no icons)
  - Stats with Icons (3 items with icons)
  - Stats Styled (with background)
  - Downloads List (simple list)
  - Downloads Grid (2 columns with descriptions)
  - Resource Library (styled downloads)
- [ ] **Task 2.3:** Add BLOCK_TYPE_INFO entry for showcase

### Phase 3: File Icons Utility (~15 min)
**Goal:** Create file type icons and utilities

- [ ] **Task 3.1:** Create `lib/file-icons.tsx`
  - SVG icons for each file type (PDF red, DOC blue, XLS green, ZIP orange, etc.)
  - getFileTypeFromUrl() utility function
  - FileIcon component with size prop

### Phase 4: Showcase Renderer (~45 min)
**Goal:** Build the block renderer with animations

- [ ] **Task 4.1:** Create `components/render/blocks/ShowcaseBlock.tsx`
  - Stats mode rendering with grid layout
  - useCountUp hook with Intersection Observer
  - Animation speed mapping (fast: 1s, medium: 2s, slow: 3s)
  - Optional icon display from Lucide
- [ ] **Task 4.2:** Add Downloads mode rendering
  - List and grid layouts
  - File type icons
  - Download buttons with hover states
  - File size display
- [ ] **Task 4.3:** Apply SectionStyling (border, background, overlay)
- [ ] **Task 4.4:** Wire up to BlockRenderer.tsx and PreviewBlockRenderer.tsx

### Phase 5: Showcase Editor (~60 min)
**Goal:** Build the editor with both modes

- [ ] **Task 5.1:** Create `components/editor/blocks/ShowcaseEditor.tsx`
  - Mode tabs (Stats / Downloads)
  - EditorMode support (Content/Layout toggle)
- [ ] **Task 5.2:** Stats mode editor
  - Drag-drop stat item list
  - Inputs: value (number), prefix, suffix, label
  - Icon picker (optional, Lucide icons)
  - Layout selector (2/3/4/auto columns)
  - Animation speed toggle
  - "Animate on Scroll" toggle
- [ ] **Task 5.3:** Downloads mode editor
  - Drag-drop download item list
  - Manual entry: title, description, file URL, file type
  - Document picker integration (select from uploaded docs)
  - Layout selector (list/grid)
  - Button text customization
- [ ] **Task 5.4:** StylingControls integration
- [ ] **Task 5.5:** Wire up to ContentTab.tsx

### Phase 6: Icon & Integration (~10 min)
**Goal:** Final integration and icon

- [ ] **Task 6.1:** Add showcase icon to BlockIcon.tsx (Trophy or BarChart3)
- [ ] **Task 6.2:** Verify block appears in block picker under "Utility"
- [ ] **Task 6.3:** Test mode switching with confirmation dialog

### Phase 7: Testing & Validation
**Goal:** Verify all functionality works

- [ ] **Task 7.1:** Test stats animation triggers on scroll
- [ ] **Task 7.2:** Test downloads with different file types
- [ ] **Task 7.3:** Test all 6 templates load correctly
- [ ] **Task 7.4:** Test SectionStyling (borders, backgrounds)
- [ ] **Task 7.5:** Run linting on all modified files

🛑 **CRITICAL WORKFLOW CHECKPOINT**
After completing Phase 7, present "Implementation Complete!" message and wait for user approval of code review.

### Phase 8: Comprehensive Code Review (Mandatory)
**Goal:** Present implementation completion and request thorough code review

- [ ] **Task 8.1:** Present "Implementation Complete!" Message (MANDATORY)
- [ ] **Task 8.2:** Execute Comprehensive Code Review (If Approved)

### Phase 9: User Browser Testing (Only After Code Review)
**Goal:** Request human testing for UI/UX functionality

- [ ] **Task 9.1:** Present AI Testing Results
- [ ] **Task 9.2:** Request User UI Testing
  - Test stats animation on scroll
  - Test downloads button functionality
  - Test mobile responsiveness
  - Test template selection
- [ ] **Task 9.3:** Wait for User Confirmation

---

## 12. Task Completion Tracking - MANDATORY WORKFLOW

🚨 **CRITICAL: Real-time task completion tracking is mandatory**

- [ ] **🗓️ GET TODAY'S DATE FIRST** - Use time tool before adding completion timestamps
- [ ] **Update task document immediately** after each completed subtask
- [ ] **Mark checkboxes as [x]** with completion timestamp using ACTUAL current date
- [ ] **Add brief completion notes** (file paths, line counts, key changes)

---

## 13. File Structure & Organization

### New Files to Create
```
project-root/
├── lib/
│   └── file-icons.tsx                    # File type icons and utilities
└── components/
    ├── editor/blocks/
    │   └── ShowcaseEditor.tsx            # Unified editor
    └── render/blocks/
        └── ShowcaseBlock.tsx             # Unified renderer
```

### Files to Modify
- [ ] `lib/drizzle/schema/sections.ts` - Add "showcase" to BLOCK_TYPES
- [ ] `lib/section-types.ts` - Add ~70 lines of type definitions
- [ ] `lib/section-defaults.ts` - Add ~50 lines of defaults
- [ ] `lib/section-templates.ts` - Add ~100 lines of templates
- [ ] `components/editor/inspector/ContentTab.tsx` - Add ShowcaseEditor case
- [ ] `components/editor/BlockIcon.tsx` - Add Trophy icon mapping
- [ ] `components/render/BlockRenderer.tsx` - Add ShowcaseBlock case
- [ ] `components/render/PreviewBlockRenderer.tsx` - Add ShowcaseBlock case

---

## 14. Potential Issues & Security Review

### Error Scenarios to Analyze
- [ ] **Invalid stat values:** What if user enters non-numeric value?
  - **Code Review Focus:** ShowcaseEditor value input validation
  - **Potential Fix:** Use number input with min=0, fallback to 0 for NaN
- [ ] **Missing download URL:** What if file URL is empty?
  - **Code Review Focus:** ShowcaseBlock download button rendering
  - **Potential Fix:** Disable/hide download button if URL empty

### Edge Cases to Consider
- [ ] **Large numbers:** Stats with values like 1,000,000+
  - **Analysis Approach:** Test animation performance with large numbers
  - **Recommendation:** Cap animation frames, use easing
- [ ] **Long file names:** Downloads with very long titles
  - **Analysis Approach:** Check text overflow handling
  - **Recommendation:** Use truncate class with ellipsis

### Security & Access Control Review
- [ ] **Download URLs:** Are external URLs allowed?
  - **Check:** Downloads can link to any URL (user responsibility)
- [ ] **File types:** No server-side validation (client display only)
  - **Note:** File type is for icon display, not security

---

## 15. Deployment & Configuration

### Environment Variables
No new environment variables required.

### Dependencies
No new dependencies required. Uses:
- Intersection Observer API (native browser)
- requestAnimationFrame (native browser)
- Lucide icons (already installed)

---

## 16. AI Agent Instructions

### Implementation Approach
1. Follow existing primitive patterns from Accordion and Pricing
2. Use Intersection Observer for scroll-triggered animations (no external libraries)
3. Keep animation simple and performant
4. Integrate with existing document picker for Downloads mode

### Code Quality Standards
- [ ] TypeScript strict mode compliance
- [ ] No `any` types
- [ ] Use early returns
- [ ] Follow existing editor patterns (mode tabs, drag-drop, StylingControls)

### Architecture Compliance
- [ ] Extend SectionStyling interface
- [ ] Follow mode-based content pattern
- [ ] Use existing drag-drop patterns from CardsEditor/PricingEditor
- [ ] Use CSS variables for theming

---

## 17. Notes & Additional Context

### Design Decisions

**Stats Animation:**
- Uses native Intersection Observer (no library needed)
- Animation triggers once when section enters viewport
- Easing function for smooth count-up effect
- Option to disable animation (show final values immediately)

**File Icons:**
- Color-coded by type (PDF=red, DOC=blue, XLS=green, ZIP=orange)
- Simple SVG icons for performance
- Fallback "document" icon for unknown types

### Reference Implementations
- CardsEditor drag-drop pattern
- PricingEditor for complex item management
- AccordionBlock for mode-based rendering

### Templates Summary
1. **Stats Simple** - 4 basic stats, no icons, center aligned
2. **Stats with Icons** - 3 stats with Lucide icons
3. **Stats Styled** - 4 stats with background styling
4. **Downloads List** - Simple file list with download buttons
5. **Downloads Grid** - 2-column grid with descriptions
6. **Resource Library** - Styled downloads section

---

*Template Version: 1.0*
*Created: 2026-01-23*
*Task Number: 084*
