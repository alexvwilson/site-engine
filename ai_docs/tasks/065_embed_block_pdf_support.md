# AI Task Template

---

## 1. Task Overview

### Task Title
**Title:** Add PDF Document Support to Embed Block

### Goal Statement
**Goal:** Extend the existing embed block to support displaying PDF documents from the site's document library, allowing users to embed PDFs on pages without creating a new block type (which would add unwanted scrolling). Users can toggle between "Embed Code" (existing functionality) and "PDF Document" modes.

---

## 2. Strategic Analysis & Solution Options

### Strategic Analysis Not Required
This task has a clear, user-approved approach:
- Extend the existing embed block with a source type toggle
- Add a document picker for PDF selection
- Add document-friendly aspect ratios (Letter)
- Preserve all existing embed functionality

The user has already confirmed this approach through our discussion.

---

## 3. Project Analysis & Current State

### Technology & Architecture
- **Frameworks & Versions:** Next.js 15 (App Router), React 19
- **Language:** TypeScript 5.x with strict mode
- **Database & ORM:** Supabase (Postgres) via Drizzle ORM
- **UI & Styling:** shadcn/ui components with Tailwind CSS

### Current State

**Embed Block (Existing)**
- `EmbedContent` interface: `embedCode`, `src`, `aspectRatio`, `customHeight`, `title`
- `EmbedEditor.tsx`: Textarea for embed code input, aspect ratio selector, preview
- `EmbedBlock.tsx`: Renders iframe with the `src` URL
- `embed-utils.ts`: Validates embed codes against domain allowlist (YouTube, Vimeo, Google Maps, Spotify, SoundCloud)

**Document System (Existing)**
- `documents` table: `id`, `site_id`, `storage_path`, `url`, `filename`, `slug`, `file_size`, `mime_type`
- `listSiteDocuments()` server action returns documents for a site
- Public URL route: `/sites/[siteSlug]/docs/[documentSlug]`
- Documents are PDFs only (validated on upload)

### Existing Codebase Analysis

**Relevant Files:**
- `lib/section-types.ts` - EmbedContent interface definition
- `lib/section-defaults.ts` - Default values for embed block
- `lib/embed-utils.ts` - Domain allowlist validation
- `components/editor/blocks/EmbedEditor.tsx` - Editor UI
- `components/render/blocks/EmbedBlock.tsx` - Renderer
- `app/actions/storage.ts` - `listSiteDocuments()` action
- `lib/drizzle/schema/documents.ts` - Document schema

---

## 4. Context & Problem Definition

### Problem Statement
Users want to display PDF documents (like resumes, brochures, reports) on their site pages. Currently:
1. PDFs can be uploaded and shared via URL from Settings → Documents
2. But there's no way to embed them visually on a page
3. Creating a new "PDF block" would add another block to the page, causing unwanted scrolling

The embed block already handles iframe-based content, and browsers natively render PDFs in iframes, making it the ideal place to add PDF support.

### Success Criteria
- [ ] Users can toggle between "Embed Code" and "PDF Document" in the embed editor
- [ ] PDF Document mode shows a picker with uploaded site documents
- [ ] "Letter (8.5:11)" aspect ratio option available for document-friendly display
- [ ] PDFs render correctly in the published site using the existing iframe approach
- [ ] Existing embed functionality (YouTube, Vimeo, etc.) works exactly as before
- [ ] Empty state shows "No documents uploaded" when no PDFs exist

---

## 5. Development Mode Context

- **New application in active development** - no backwards compatibility concerns
- **Aggressive refactoring allowed** - can modify existing interfaces
- **Priority: Speed and simplicity**

---

## 6. Technical Requirements

### Functional Requirements
- User can switch between "Embed Code" and "PDF Document" source types via tabs
- When "PDF Document" is selected, user sees a dropdown of uploaded PDFs for the site
- User can select a PDF and it populates the embed with the document URL
- User can choose "Letter (8.5:11)" aspect ratio for document-friendly display
- PDF renders in iframe on published page (browser native PDF viewer)
- Existing embed code functionality unchanged

### Non-Functional Requirements
- **Performance:** Document list should load quickly (already fetched in editor)
- **Usability:** Clear visual distinction between the two modes
- **Responsive Design:** Works on mobile, tablet, desktop

### Technical Constraints
- Must use existing `listSiteDocuments()` action for fetching documents
- Must preserve existing EmbedContent structure for backward compatibility
- PDF URLs use internal document route: `/sites/[siteSlug]/docs/[documentSlug]`

---

## 7. Data & Database Changes

### Database Schema Changes
**None required** - Using existing documents table.

### Data Model Updates

```typescript
// lib/section-types.ts - Updated EmbedContent interface

export type EmbedSourceType = "embed" | "pdf";
export type EmbedAspectRatio = "16:9" | "4:3" | "1:1" | "letter" | "custom";

export interface EmbedContent {
  // Existing fields
  embedCode: string;
  src: string;
  aspectRatio: EmbedAspectRatio;
  customHeight?: number;
  title?: string;

  // New fields for PDF support
  sourceType?: EmbedSourceType; // Default: "embed" for backward compatibility
  documentId?: string;          // Reference to documents table
  documentSlug?: string;        // For building the URL
}
```

---

## 8. Backend Changes & Background Jobs

### Server Actions
- **Modify `listSiteDocuments()`** in `app/actions/storage.ts` to also return the site slug
- The site slug is needed to build the PDF URL: `/sites/[siteSlug]/docs/[docSlug]`

### Validation Changes
The embed-utils domain allowlist doesn't apply to PDF mode since:
1. PDF URLs are same-origin (internal `/sites/[slug]/docs/[docSlug]` route)
2. The document picker ensures only valid uploaded documents can be selected
3. No user-provided URLs to validate in PDF mode

---

## 9. Frontend Changes

### Modified Components

#### `lib/section-types.ts`
- Add `EmbedSourceType` type
- Add `"letter"` to `EmbedAspectRatio`
- Add `sourceType`, `documentId`, `documentSlug` to `EmbedContent`

#### `lib/section-defaults.ts`
- Add `sourceType: "embed"` to embed defaults

#### `components/editor/blocks/EmbedEditor.tsx`
- Add tabs UI for "Embed Code" | "PDF Document"
- Add document picker dropdown (fetches from `listSiteDocuments`)
- Show appropriate UI based on selected source type
- Handle document selection → populate `src`, `documentId`, `documentSlug`

#### `components/render/blocks/EmbedBlock.tsx`
- Handle "letter" aspect ratio (8.5:11 = 0.773)
- No other changes needed - iframe already renders PDFs

#### `lib/embed-utils.ts`
- Add helper to get aspect ratio CSS value including "letter"

---

## 10. Code Changes Overview

### 📂 **Current Implementation (Before)**

```typescript
// lib/section-types.ts
export type EmbedAspectRatio = "16:9" | "4:3" | "1:1" | "custom";

export interface EmbedContent {
  embedCode: string;
  src: string;
  aspectRatio: EmbedAspectRatio;
  customHeight?: number;
  title?: string;
}
```

```typescript
// components/editor/blocks/EmbedEditor.tsx
// Single mode - embed code textarea only
<Textarea
  value={content.embedCode}
  onChange={(e) => handleEmbedCodeChange(e.target.value)}
  placeholder='Paste iframe embed code here...'
/>
```

### 📂 **After Changes**

```typescript
// lib/section-types.ts
export type EmbedSourceType = "embed" | "pdf";
export type EmbedAspectRatio = "16:9" | "4:3" | "1:1" | "letter" | "custom";

export interface EmbedContent {
  embedCode: string;
  src: string;
  aspectRatio: EmbedAspectRatio;
  customHeight?: number;
  title?: string;
  sourceType?: EmbedSourceType;
  documentId?: string;
  documentSlug?: string;
}
```

```typescript
// components/editor/blocks/EmbedEditor.tsx
// Tabs for switching modes
<Tabs value={sourceType} onValueChange={handleSourceTypeChange}>
  <TabsList>
    <TabsTrigger value="embed">Embed Code</TabsTrigger>
    <TabsTrigger value="pdf">PDF Document</TabsTrigger>
  </TabsList>
  <TabsContent value="embed">
    {/* Existing embed code textarea */}
  </TabsContent>
  <TabsContent value="pdf">
    {/* Document picker dropdown */}
    <Select onValueChange={handleDocumentSelect}>
      {documents.map(doc => (
        <SelectItem value={doc.id}>{doc.name}</SelectItem>
      ))}
    </Select>
  </TabsContent>
</Tabs>
```

### 🎯 **Key Changes Summary**
- [ ] **EmbedContent interface:** Add `sourceType`, `documentId`, `documentSlug` fields
- [ ] **EmbedAspectRatio:** Add `"letter"` option
- [ ] **EmbedEditor:** Add tabs UI and document picker
- [ ] **EmbedBlock:** Handle letter aspect ratio
- [ ] **Files Modified:** 4 files (section-types.ts, section-defaults.ts, EmbedEditor.tsx, EmbedBlock.tsx)

---

## 11. Implementation Plan

### Phase 1: Type System & Backend Updates
**Goal:** Update interfaces, types, and server action to support PDF source type

- [ ] **Task 1.1:** Update EmbedContent interface in section-types.ts
  - Files: `lib/section-types.ts`
  - Details: Add EmbedSourceType, update EmbedAspectRatio, add new fields
- [ ] **Task 1.2:** Update embed defaults in section-defaults.ts
  - Files: `lib/section-defaults.ts`
  - Details: Add `sourceType: "embed"` default
- [ ] **Task 1.3:** Update listSiteDocuments to return site slug
  - Files: `app/actions/storage.ts`
  - Details: Join with sites table to fetch slug, update return type

### Phase 2: Editor UI Updates
**Goal:** Add tabs and document picker to EmbedEditor

- [ ] **Task 2.1:** Add tabs for source type switching
  - Files: `components/editor/blocks/EmbedEditor.tsx`
  - Details: Add Tabs component with "Embed Code" and "PDF Document" tabs
- [ ] **Task 2.2:** Add document fetching and picker
  - Files: `components/editor/blocks/EmbedEditor.tsx`
  - Details: Fetch documents on mount, render Select dropdown in PDF tab
- [ ] **Task 2.3:** Handle document selection
  - Files: `components/editor/blocks/EmbedEditor.tsx`
  - Details: On select, build URL and update content with documentId, documentSlug, src
- [ ] **Task 2.4:** Update aspect ratio options
  - Files: `components/editor/blocks/EmbedEditor.tsx`
  - Details: Add "Letter (8.5:11)" option to aspect ratio selector

### Phase 3: Renderer Updates
**Goal:** Update EmbedBlock to handle letter aspect ratio

- [ ] **Task 3.1:** Add letter aspect ratio handling
  - Files: `components/render/blocks/EmbedBlock.tsx`
  - Details: Handle "letter" ratio (8.5/11 = ~0.773 or inverted for portrait)

### Phase 4: Testing & Validation
**Goal:** Verify all functionality works correctly

- [ ] **Task 4.1:** Test existing embed functionality
  - Details: Verify YouTube, Vimeo embeds still work unchanged
- [ ] **Task 4.2:** Test PDF document selection
  - Details: Upload PDF, select in embed editor, verify preview
- [ ] **Task 4.3:** Test letter aspect ratio
  - Details: Select letter ratio, verify PDF displays correctly
- [ ] **Task 4.4:** Test empty state
  - Details: Verify "No documents uploaded" shows when no PDFs exist

### Phase 5: Comprehensive Code Review (Mandatory)
**Goal:** Present implementation completion and request thorough code review

- [ ] **Task 5.1:** Present "Implementation Complete!" message
- [ ] **Task 5.2:** Execute comprehensive code review (if approved)

### Phase 6: User Browser Testing
**Goal:** User verifies UI behavior in browser

- [ ] **Task 6.1:** Present AI testing results
- [ ] **Task 6.2:** Request user UI testing
- [ ] **Task 6.3:** Wait for user confirmation

---

## 12. Task Completion Tracking - MANDATORY WORKFLOW

- [ ] Update task document immediately after each completed subtask
- [ ] Mark checkboxes as [x] with completion timestamp
- [ ] Add brief completion notes (file paths, key changes)

---

## 13. File Structure & Organization

### Files to Modify
- [ ] `lib/section-types.ts` - Add types and interface fields
- [ ] `lib/section-defaults.ts` - Add sourceType default
- [ ] `app/actions/storage.ts` - Update listSiteDocuments to return site slug
- [ ] `components/editor/blocks/EmbedEditor.tsx` - Major changes (tabs, picker)
- [ ] `components/render/blocks/EmbedBlock.tsx` - Minor change (letter ratio)

### No New Files Required
All changes are modifications to existing files.

---

## 14. Potential Issues & Security Review

### Edge Cases to Consider
- [ ] **Deleted document:** If a document is deleted after being embedded, the iframe will show 404
  - **Recommendation:** Accept this behavior - user can update the block
- [ ] **Site slug changes:** Document URLs use site slug, which could theoretically change
  - **Recommendation:** URLs are built dynamically from documentSlug, not hardcoded

### Security Considerations
- [ ] **Document access:** Document picker only shows documents for the current site
- [ ] **No user URL input:** PDF mode uses picker only, no arbitrary URL input
- [ ] **Same-origin:** PDF URLs are internal routes, not external

---

## 15. Deployment & Configuration

No environment variables or configuration changes required.

---

## 16. AI Agent Instructions

### Implementation Approach
1. Start with type system updates (Phase 1)
2. Build editor UI incrementally (Phase 2)
3. Update renderer (Phase 3)
4. Test thoroughly (Phase 4)
5. Follow mandatory code review process (Phase 5)

### Key Implementation Notes
- Use existing `listSiteDocuments()` action - no new backend code needed
- Document URL format: `/sites/${siteSlug}/docs/${documentSlug}`
- The siteSlug needs to be passed to the editor or fetched from context
- Preserve backward compatibility - existing embeds with `sourceType: undefined` should work as "embed" type

---

## 17. Notes & Additional Context

### URL Building for PDFs
The embed editor needs access to the site's slug to build the PDF URL. Check how other editors access site data - likely through props or context.

### Aspect Ratio Calculation
- Letter size is 8.5" x 11" (portrait)
- For an iframe displaying a PDF, we want the height to be taller than width
- Ratio: 11/8.5 = 1.294 (height/width) or as CSS aspect-ratio: 8.5/11

---

## 18. Second-Order Consequences & Impact Analysis

### Breaking Changes Analysis
- [ ] **Existing embeds:** No breaking changes - `sourceType` defaults to "embed" behavior
- [ ] **API contracts:** No API changes

### Ripple Effects Assessment
- [ ] **Document deletion:** If PDF is deleted, embed shows 404 - acceptable behavior
- [ ] **UI consistency:** Tabs pattern used elsewhere in app - consistent

### Performance Implications
- [ ] **Document fetching:** One additional query on editor mount - minimal impact
- [ ] **Bundle size:** No new dependencies - using existing shadcn Tabs, Select

### Security Considerations
- [ ] **No new attack surface:** Document picker restricts to uploaded docs only

---

*Task Number: 065*
*Created: 2026-01-08*
