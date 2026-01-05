# AI Task Template

> **Instructions:** PDF document upload feature for Site Engine settings page.

---

## 1. Task Overview

### Task Title
**Title:** Add PDF Document Upload to Site Settings

### Goal Statement
**Goal:** Allow users to upload PDF documents (resumes, portfolios, brochures, etc.) via the Settings page and get public URLs they can link to from anywhere on their site (header navigation, CTA buttons, footer links).

---

## 2. Strategic Analysis & Solution Options

### When to Use Strategic Analysis
**Decision:** Strategic analysis NOT needed - the approach is straightforward and mirrors the existing image upload pattern.

### Recommendation & Rationale

**Recommended Solution:** Follow the same pattern as image uploads:
1. Create a documents database table (like images table)
2. Add PDF upload/list/delete server actions (like image storage actions)
3. Create DocumentUpload component (simpler than ImageUpload - no library/preview tabs)
4. Add Documents section to SettingsTab

This approach is consistent with existing architecture and reuses proven patterns.

---

## 3. Project Analysis & Current State

### Technology & Architecture
- **Frameworks & Versions:** Next.js 15, React 19
- **Language:** TypeScript 5.4 with strict mode
- **Database & ORM:** Supabase (Postgres) via Drizzle ORM
- **UI & Styling:** shadcn/ui components with Tailwind CSS
- **Storage:** Supabase Storage bucket `media-uploads`

### Current State
- Image upload system fully implemented with database tracking
- Storage uses path pattern: `${userId}/${siteId}/${timestamp}-${random}.${ext}`
- Images tracked in `images` table with site_id, storage_path, url, filename, file_size, mime_type
- SettingsTab has Image Library section at the bottom

### Existing Codebase Analysis

**Relevant Analysis Completed:**

- [x] **Server Actions** (`app/actions/storage.ts`)
  - `uploadImage()` - validates file type/size, uploads to Supabase, creates DB record
  - `listSiteImages()` - lists images from database with storage sync
  - `deleteImage()` - removes from storage and database
  - Current limits: 5MB max, images only (JPEG, PNG, GIF, WebP, SVG)

- [x] **Database Schema** (`lib/drizzle/schema/images.ts`)
  - `images` table with: id, site_id, album_id, storage_path, url, filename, file_size, mime_type, created_at
  - Index on site_id for efficient queries

- [x] **Components** (`components/sites/SettingsTab.tsx`)
  - Image Library section at bottom of settings
  - Uses ImageUpload component for logo/favicon uploads

---

## 4. Context & Problem Definition

### Problem Statement
Users need to upload and share PDF documents (resumes, portfolios) on their portfolio sites. Currently, they can only upload images. They need a way to:
1. Upload PDFs to their site
2. Get public URLs for the PDFs
3. Link to the PDFs from header navigation, CTA buttons, or footer links

### Success Criteria
- [x] User can upload PDF files (up to 10MB)
- [x] PDFs are tracked in database for management
- [x] User can see list of uploaded documents with URLs
- [x] User can copy document URLs to use in links
- [x] User can delete uploaded documents

---

## 5. Development Mode Context

### Development Mode Context
- **This is a new application in active development**
- **No backwards compatibility concerns**
- **Priority: Speed and simplicity**

---

## 6. Technical Requirements

### Functional Requirements
- User can upload PDF files (max 10MB)
- System stores PDFs in Supabase Storage at path `{userId}/{siteId}/documents/`
- System tracks documents in database with metadata
- User can view list of uploaded documents
- User can copy public URL for each document
- User can delete documents

### Non-Functional Requirements
- **Performance:** Upload should complete within 10 seconds for typical files
- **Security:** Only owner can view/delete their documents
- **Usability:** Simple drag-and-drop upload interface

### Technical Constraints
- Must use existing Supabase Storage bucket (`media-uploads`)
- Must follow existing authentication patterns
- Must follow existing storage action patterns

---

## 7. Data & Database Changes

### Database Schema Changes

**File:** `lib/drizzle/schema/documents.ts` (new file)

```typescript
import { pgTable, text, timestamp, uuid, integer, index } from "drizzle-orm/pg-core";
import { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { sites } from "./sites";

export const documents = pgTable(
  "documents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    site_id: uuid("site_id")
      .notNull()
      .references(() => sites.id, { onDelete: "cascade" }),
    storage_path: text("storage_path").notNull(),
    url: text("url").notNull(),
    filename: text("filename").notNull(),
    file_size: integer("file_size"),
    mime_type: text("mime_type"),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [index("documents_site_id_idx").on(t.site_id)]
);

export type Document = InferSelectModel<typeof documents>;
export type NewDocument = InferInsertModel<typeof documents>;
```

### Data Migration Plan
- [x] Create documents schema
- [x] Export from schema index
- [x] Generate migration
- [x] Create down migration
- [x] Apply migration

### Down Migration Safety Protocol
- [x] Follow `drizzle_down_migration.md` template process

---

## 8. Backend Changes & Background Jobs

### Server Actions

**File:** `app/actions/storage.ts` (extend existing)

New functions to add:
- [x] **`uploadDocument(formData: FormData)`** - Upload PDF, validate type/size, store in Supabase, create DB record
- [x] **`listSiteDocuments(siteId: string)`** - List documents for a site
- [x] **`deleteDocument(documentId: string)`** - Delete from storage and database

### Constants to add:
```typescript
const VALID_DOCUMENT_TYPES = ["application/pdf"];
const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10MB
```

---

## 9. Frontend Changes

### New Components

**File:** `components/editor/DocumentUpload.tsx` (new)

Simple upload component with:
- Drag-and-drop area for PDF files
- File size validation (10MB max)
- Upload progress indicator
- Error handling

### Page Updates

**File:** `components/sites/SettingsTab.tsx`

Add new Card section after "Image Library":
```tsx
<Card>
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <FileText className="h-5 w-5" />
      Documents
    </CardTitle>
    <CardDescription>
      Upload PDFs and documents. Copy URLs to use in links, buttons, or navigation.
    </CardDescription>
  </CardHeader>
  <CardContent>
    {/* DocumentUpload component */}
    {/* List of documents with copy URL & delete buttons */}
  </CardContent>
</Card>
```

---

## 10. Code Changes Overview

### Current Implementation (Before)

`app/actions/storage.ts` only handles images with these constraints:
```typescript
const VALID_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
```

### After Implementation

Add parallel document functions alongside image functions:
```typescript
// Document-specific constants
const VALID_DOCUMENT_TYPES = ["application/pdf"];
const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10MB

// New server actions
export async function uploadDocument(formData: FormData): Promise<UploadResult>
export async function listSiteDocuments(siteId: string): Promise<ListDocumentsResult>
export async function deleteDocument(documentId: string): Promise<DeleteResult>
```

### Key Changes Summary
- [x] **New documents schema:** `lib/drizzle/schema/documents.ts`
- [x] **Export schema:** Update `lib/drizzle/schema/index.ts`
- [x] **Document storage actions:** Extend `app/actions/storage.ts`
- [x] **DocumentUpload component:** New `components/editor/DocumentUpload.tsx`
- [x] **Settings UI:** Add Documents section to `components/sites/SettingsTab.tsx`

---

## 11. Implementation Plan

### Phase 1: Database Schema
**Goal:** Create documents table

- [ ] **Task 1.1:** Create `lib/drizzle/schema/documents.ts`
  - Files: `lib/drizzle/schema/documents.ts`
- [ ] **Task 1.2:** Export from `lib/drizzle/schema/index.ts`
  - Files: `lib/drizzle/schema/index.ts`
- [ ] **Task 1.3:** Generate migration
  - Command: `npm run db:generate`
- [ ] **Task 1.4:** Create down migration
  - Follow `drizzle_down_migration.md` template
- [ ] **Task 1.5:** Apply migration
  - Command: `npm run db:migrate`

### Phase 2: Server Actions
**Goal:** Add document upload/list/delete functions

- [ ] **Task 2.1:** Add document types and interfaces to `app/actions/storage.ts`
- [ ] **Task 2.2:** Add `uploadDocument()` function
- [ ] **Task 2.3:** Add `listSiteDocuments()` function
- [ ] **Task 2.4:** Add `deleteDocument()` function

### Phase 3: Frontend Components
**Goal:** Create DocumentUpload component and add to Settings

- [ ] **Task 3.1:** Create `components/editor/DocumentUpload.tsx`
- [ ] **Task 3.2:** Add Documents section to `components/sites/SettingsTab.tsx`

### Phase 4: Testing & Validation
**Goal:** Verify everything works

- [ ] **Task 4.1:** Run linting and type-check
- [ ] **Task 4.2:** Manual browser testing (USER)

---

## 12. Task Completion Tracking

_To be updated during implementation_

---

## 13. File Structure & Organization

### New Files to Create
```
lib/drizzle/schema/
└── documents.ts                    # Documents table schema

components/editor/
└── DocumentUpload.tsx              # PDF upload component
```

### Files to Modify
- [ ] `lib/drizzle/schema/index.ts` - Export documents
- [ ] `app/actions/storage.ts` - Add document functions
- [ ] `components/sites/SettingsTab.tsx` - Add Documents section

---

## 14. Potential Issues & Security Review

### Security Considerations
- [x] **File Type Validation:** Only allow `application/pdf` MIME type
- [x] **File Size Limit:** Max 10MB
- [x] **User Authorization:** Verify user owns site before upload/delete
- [x] **Path Security:** Use same path structure as images (`userId/siteId/documents/`)

---

## 15. Deployment & Configuration

### Environment Variables
No new environment variables needed - uses existing Supabase configuration.

---

## 16. AI Agent Instructions

### Implementation Approach
1. Follow existing patterns from image upload system
2. Create schema, generate migration, apply
3. Add server actions following `uploadImage` pattern
4. Create simple upload component (no library tabs needed)
5. Add section to SettingsTab

---

## 17. Notes & Additional Context

### Design Decisions
- **No document library:** Unlike images, documents don't need a library picker. Users just copy URLs.
- **Same storage bucket:** Uses `media-uploads` bucket with `/documents/` path
- **10MB limit:** Larger than images (5MB) to accommodate PDFs with graphics

---

*Template Version: 1.0*
*Created: 2026-01-05*
