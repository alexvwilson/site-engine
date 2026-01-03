# AI Task Template

---

## 1. Task Overview

### Task Title
**Title:** Image Library Albums / Categories

### Goal Statement
**Goal:** Allow users to organize their uploaded images into albums/folders for easier management. As sites grow and users upload more images, a flat image library becomes hard to navigate. Albums provide logical grouping (e.g., "Blog Photos", "Logos", "Team Headshots") to keep the image library organized.

---

## 2. Strategic Analysis & Solution Options

### Problem Context
Currently, images are stored in Supabase Storage with the path pattern `userId/siteId/filename` and listed directly from storage without any database tracking. There's no organization - all images appear in a single flat list. To implement albums, we need to decide how to track album membership.

### Solution Options Analysis

#### Option 1: Database Tracking (Recommended)
**Approach:** Create `image_albums` and `images` tables in the database. Track all images with album relationships.

**Pros:**
- Full metadata tracking (album name, description, image count)
- Easy querying and filtering by album
- Albums are CRUD-able (rename, delete, merge)
- Future-proof for additional features (tags, favorites, usage tracking)
- Supports both folder-like (one album) and tag-like (multiple albums) relationships

**Cons:**
- Requires database migration
- Existing images need to be synced/imported to database
- More complex implementation
- Slight overhead for new uploads (create DB record)

**Implementation Complexity:** Medium
**Risk Level:** Low - Clean new tables, no modification to existing tables

#### Option 2: Storage Path-Based
**Approach:** Organize albums via storage paths: `userId/siteId/albumName/filename`

**Pros:**
- No database changes needed
- Simple conceptually
- Albums inferred from folder structure

**Cons:**
- Moving images between albums = re-upload (expensive)
- Renaming albums = moving all files (expensive)
- Can't query images by album efficiently
- Limited metadata (no album descriptions)
- Can't have image in multiple albums

**Implementation Complexity:** Low initially, High for maintenance
**Risk Level:** Medium - Storage operations are slow and error-prone at scale

#### Option 3: Storage Metadata
**Approach:** Use Supabase Storage's file metadata to store album ID

**Pros:**
- No new tables
- Images stay in flat storage

**Cons:**
- Can't list images by album without fetching all + filtering
- Album CRUD still needs database table
- Hybrid approach = complexity
- Limited query capabilities

**Implementation Complexity:** Medium
**Risk Level:** Medium - Metadata has size limits, querying is inefficient

### Recommendation & Rationale

**RECOMMENDED SOLUTION:** Option 1 - Database Tracking

**Why this is the best choice:**
1. **Scalability** - Database queries scale well; filtering 1000s of images by album is instant
2. **Flexibility** - Albums can be renamed, merged, or converted to tags later without touching storage
3. **Metadata** - Store album descriptions, sort order, cover images, etc.
4. **Future features** - Easy to add "recently used", "favorites", or "usage count" later

**Key Decision Factors:**
- **Performance Impact:** Minimal - one extra DB insert on upload, indexed queries for filtering
- **User Experience:** Better - instant album switching, album management UI
- **Maintainability:** Better - all album logic in database, storage stays simple
- **Scalability:** Better - database handles filtering at scale

### Decision Request

**One clarification before proceeding:**

For the one-album vs. multiple-albums question: I recommend **one album per image** (folder-like) for simplicity. This matches user mental models of file folders and keeps the UI simple. We can always add a "tags" feature later if needed.

**Do you agree with:**
1. Database tracking approach (Option 1)?
2. One album per image (folder-like)?

---

## 3. Project Analysis & Current State

### Technology & Architecture
- **Frameworks & Versions:** Next.js 15.3, React 19
- **Language:** TypeScript 5.x with strict mode
- **Database & ORM:** Supabase (Postgres) via Drizzle ORM
- **Storage:** Supabase Storage bucket `media-uploads`
- **UI & Styling:** shadcn/ui components with Tailwind CSS v4
- **Authentication:** Supabase Auth managed by `middleware.ts`

### Current State
**Image Storage Pattern:**
- Images uploaded to: `userId/siteId/timestamp-random.ext`
- Listed via `supabase.storage.from().list()` - no database tracking
- `ImageFile` interface: `{ name, url, createdAt, size }`

**Existing Components:**
- `ImageUpload` - Upload component with 3 tabs: Upload, Library, URL
- `ImageLibrary` - Grid picker for selecting from uploaded images
- `ImageLibraryManager` - Full management UI (Settings > Manage Images)

**Gap:** No database tracking of images, no album organization

### Existing Codebase Analysis

**Relevant files analyzed:**
- [x] `app/actions/storage.ts` - Upload, delete, list functions (no DB)
- [x] `components/editor/ImageUpload.tsx` - Main upload component
- [x] `components/editor/ImageLibrary.tsx` - Simple grid picker
- [x] `components/sites/ImageLibraryManager.tsx` - Full management UI
- [x] `lib/drizzle/schema/sites.ts` - Site schema pattern reference

---

## 4. Context & Problem Definition

### Problem Statement
As users upload more images, the flat image library becomes hard to navigate. Users want to organize images into folders/albums for easier management. Currently, there's no way to categorize images, and finding a specific image requires scrolling through all uploads or searching by filename.

### Success Criteria
- [ ] Users can create, rename, and delete albums
- [ ] Users can assign images to albums during upload
- [ ] Users can move existing images between albums
- [ ] Album filter dropdown appears in ImageLibraryManager
- [ ] Album selector appears in ImageUpload component
- [ ] Default "Uncategorized" album exists for images without assignment
- [ ] Existing images remain accessible (backwards compatible)

---

## 5. Development Mode Context

- **This is a new application in active development**
- **No backwards compatibility concerns** for the new tables
- **Existing images** will initially be untracked (null album_id) until user organizes them
- **Priority: Clean implementation** with proper database design

---

## 6. Technical Requirements

### Functional Requirements
- Users can create albums with a name (and optional description)
- Users can rename albums
- Users can delete albums (images move to Uncategorized or get album_id = null)
- Users can select an album when uploading new images
- Users can change an image's album from the library manager
- Users can filter images by album in the library view
- Images without an album show in "All" or "Uncategorized" filter

### Non-Functional Requirements
- **Performance:** Album filtering should be instant (< 100ms)
- **Security:** Users can only see/modify their own albums and images
- **Usability:** Album selection should not slow down the upload flow
- **Responsive Design:** Album UI works on mobile (320px+), tablet (768px+), desktop
- **Theme Support:** Album UI matches existing shadcn/ui styling

### Technical Constraints
- Must work with existing Supabase Storage (files stay in flat structure)
- Must not break existing image URLs (storage paths unchanged)
- Album names must be unique per site

---

## 7. Data & Database Changes

### Database Schema Changes

```sql
-- New table: image_albums
CREATE TABLE image_albums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(site_id, name)
);

CREATE INDEX image_albums_site_id_idx ON image_albums(site_id);
CREATE INDEX image_albums_display_order_idx ON image_albums(display_order);

-- New table: images (tracks uploaded images)
CREATE TABLE images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  album_id UUID REFERENCES image_albums(id) ON DELETE SET NULL,
  storage_path TEXT NOT NULL,
  url TEXT NOT NULL,
  filename TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(site_id, storage_path)
);

CREATE INDEX images_site_id_idx ON images(site_id);
CREATE INDEX images_album_id_idx ON images(album_id);
CREATE INDEX images_created_at_idx ON images(created_at);
```

### Data Model Updates

```typescript
// lib/drizzle/schema/image-albums.ts
import { pgTable, text, timestamp, uuid, index, integer } from "drizzle-orm/pg-core";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { sites } from "./sites";

export const imageAlbums = pgTable(
  "image_albums",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    site_id: uuid("site_id")
      .notNull()
      .references(() => sites.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    display_order: integer("display_order").notNull().default(0),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("image_albums_site_id_idx").on(t.site_id),
    index("image_albums_display_order_idx").on(t.display_order),
  ]
);

export type ImageAlbum = InferSelectModel<typeof imageAlbums>;
export type NewImageAlbum = InferInsertModel<typeof imageAlbums>;
```

```typescript
// lib/drizzle/schema/images.ts
import { pgTable, text, timestamp, uuid, index, integer } from "drizzle-orm/pg-core";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { sites } from "./sites";
import { imageAlbums } from "./image-albums";

export const images = pgTable(
  "images",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    site_id: uuid("site_id")
      .notNull()
      .references(() => sites.id, { onDelete: "cascade" }),
    album_id: uuid("album_id").references(() => imageAlbums.id, { onDelete: "set null" }),
    storage_path: text("storage_path").notNull(),
    url: text("url").notNull(),
    filename: text("filename").notNull(),
    file_size: integer("file_size"),
    mime_type: text("mime_type"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("images_site_id_idx").on(t.site_id),
    index("images_album_id_idx").on(t.album_id),
    index("images_created_at_idx").on(t.created_at),
  ]
);

export type ImageRecord = InferSelectModel<typeof images>;
export type NewImage = InferInsertModel<typeof images>;
```

### Data Migration Plan
- [ ] Generate migration for new tables
- [ ] Create down migration file BEFORE applying
- [ ] Apply migration
- [ ] Existing images remain in storage but won't appear in DB until:
  - Option A: Manual sync action in Settings (import existing images)
  - Option B: New uploads tracked, old images shown separately or auto-imported on first library view

**Recommended:** Option B with lazy import - when ImageLibraryManager loads, sync any storage images not in DB to the images table (with album_id = null).

### MANDATORY: Down Migration Safety Protocol
- [ ] **Step 1: Generate Migration** - Run `npm run db:generate`
- [ ] **Step 2: Create Down Migration** - Follow `drizzle_down_migration.md` template
- [ ] **Step 3: Create Subdirectory** - `drizzle/migrations/[timestamp_name]/`
- [ ] **Step 4: Generate down.sql** - Safe rollback operations
- [ ] **Step 5: Verify Safety** - `IF EXISTS` clauses, warnings
- [ ] **Step 6: Apply Migration** - `npm run db:migrate`

---

## 8. Backend Changes

### Server Actions - `app/actions/albums.ts` (NEW)

```typescript
"use server";

// Album CRUD
export async function createAlbum(siteId: string, name: string, description?: string): Promise<{ success: boolean; album?: ImageAlbum; error?: string }>;
export async function updateAlbum(albumId: string, data: { name?: string; description?: string }): Promise<{ success: boolean; error?: string }>;
export async function deleteAlbum(albumId: string): Promise<{ success: boolean; error?: string }>;
export async function getAlbumsForSite(siteId: string): Promise<{ success: boolean; albums?: ImageAlbum[]; error?: string }>;
export async function reorderAlbums(siteId: string, albumIds: string[]): Promise<{ success: boolean; error?: string }>;
```

### Server Actions - `app/actions/storage.ts` (MODIFIED)

```typescript
// Modify uploadImage to accept optional albumId and create DB record
export async function uploadImage(formData: FormData): Promise<UploadResult>;
// formData now includes optional "albumId" field

// Modify listSiteImages to query from database instead of storage
export async function listSiteImages(siteId: string, albumId?: string | null): Promise<ListImagesResult>;
// If albumId is undefined: return all images
// If albumId is null: return images with no album (Uncategorized)
// If albumId is string: return images in that album

// New: Update image album
export async function updateImageAlbum(imageId: string, albumId: string | null): Promise<{ success: boolean; error?: string }>;

// New: Sync storage images to database (lazy import)
export async function syncStorageToDatabase(siteId: string): Promise<{ success: boolean; imported: number; error?: string }>;
```

---

## 9. Frontend Changes

### New Components

#### `components/sites/AlbumManager.tsx` (NEW)
- Album CRUD UI for Settings tab
- Create album button + modal
- Album list with rename/delete actions
- Drag-to-reorder albums

#### `components/editor/AlbumSelector.tsx` (NEW)
- Dropdown to select album during upload
- Used in ImageUpload component
- Options: "No Album", existing albums, "+ Create Album"

#### `components/sites/AlbumFilterDropdown.tsx` (NEW)
- Filter dropdown for ImageLibraryManager
- Options: "All Images", "Uncategorized", [album names...]

### Component Modifications

#### `components/editor/ImageUpload.tsx`
- Add AlbumSelector above or within the Upload tab
- Pass albumId to uploadImage action

#### `components/editor/ImageLibrary.tsx`
- Add album filter dropdown
- Filter images by selected album

#### `components/sites/ImageLibraryManager.tsx`
- Add AlbumFilterDropdown to action bar
- Add "Move to Album" action for selected images
- Show album badge on each image card
- Add "Sync Images" button (imports storage images to DB)

#### `components/sites/SettingsTab.tsx`
- Add AlbumManager component to "Image Library" card
- Or create new "Image Albums" card

---

## 10. Code Changes Overview

### Current Implementation (Before)

```typescript
// app/actions/storage.ts - listSiteImages
export async function listSiteImages(siteId: string): Promise<ListImagesResult> {
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .list(prefix, { limit: 100, sortBy: { column: "created_at", order: "desc" } });

  // Returns images directly from storage - no database involved
  const images: ImageFile[] = data.filter(...).map(...);
  return { success: true, images };
}
```

```typescript
// components/sites/ImageLibraryManager.tsx - No album filtering
const filteredImages = images.filter((img) =>
  img.name.toLowerCase().includes(search.toLowerCase())
);
```

### After Refactor

```typescript
// app/actions/storage.ts - listSiteImages with album support
export async function listSiteImages(
  siteId: string,
  albumId?: string | null
): Promise<ListImagesResult> {
  // First ensure storage is synced to database
  await syncStorageToDatabase(siteId);

  // Query from database with optional album filter
  let query = db.select().from(images).where(eq(images.site_id, siteId));

  if (albumId === null) {
    query = query.where(isNull(images.album_id));
  } else if (albumId) {
    query = query.where(eq(images.album_id, albumId));
  }

  const results = await query.orderBy(desc(images.created_at));
  return { success: true, images: results };
}
```

```typescript
// components/sites/ImageLibraryManager.tsx - With album filtering
const [selectedAlbum, setSelectedAlbum] = useState<string | null | undefined>(undefined);

// Album filter dropdown + existing search
<AlbumFilterDropdown value={selectedAlbum} onChange={setSelectedAlbum} albums={albums} />

// Load images with album filter
useEffect(() => {
  listSiteImages(siteId, selectedAlbum).then(...);
}, [siteId, selectedAlbum]);
```

### Key Changes Summary
- [ ] **Database schema:** Add `image_albums` and `images` tables
- [ ] **Storage actions:** Modify to create DB records on upload, query from DB
- [ ] **Album CRUD:** New server actions for album management
- [ ] **ImageUpload:** Add album selector dropdown
- [ ] **ImageLibrary:** Add album filter
- [ ] **ImageLibraryManager:** Add album filter, move-to-album, sync button
- [ ] **SettingsTab:** Add album management UI

---

## 11. Implementation Plan

### Phase 1: Database Schema
**Goal:** Create database tables for albums and image tracking

- [x] **Task 1.1:** Create `lib/drizzle/schema/image-albums.ts` ✓ 2026-01-03
- [x] **Task 1.2:** Create `lib/drizzle/schema/images.ts` ✓ 2026-01-03
- [x] **Task 1.3:** Export from `lib/drizzle/schema/index.ts` ✓ 2026-01-03
- [x] **Task 1.4:** Run `npm run db:generate` → `0026_overjoyed_apocalypse.sql` ✓ 2026-01-03
- [x] **Task 1.5:** Create down migration file → `0026_overjoyed_apocalypse/down.sql` ✓ 2026-01-03
- [x] **Task 1.6:** Run `npm run db:migrate` ✓ 2026-01-03

### Phase 2: Album Server Actions
**Goal:** Implement album CRUD operations

- [x] **Task 2.1:** Create `app/actions/albums.ts` with CRUD actions ✓ 2026-01-03
  - createAlbum, updateAlbum, deleteAlbum, getAlbumsForSite, reorderAlbums
- [x] **Task 2.2:** Add auth checks and validation ✓ 2026-01-03
  - verifySiteOwnership, verifyAlbumOwnership helpers
  - Name length validation (max 100 chars)
- [x] **Task 2.3:** Add revalidatePath calls ✓ 2026-01-03

### Phase 3: Image Server Actions
**Goal:** Modify storage actions to use database

- [x] **Task 3.1:** Add `syncStorageToDatabase()` function ✓ 2026-01-03
  - Private helper + public `syncSiteImages()` for manual trigger
- [x] **Task 3.2:** Modify `uploadImage()` to create DB record ✓ 2026-01-03
  - Accepts optional albumId, creates images table record
- [x] **Task 3.3:** Modify `listSiteImages()` to query from DB with album filter ✓ 2026-01-03
  - Auto-syncs storage before querying, supports undefined/null/string albumId
- [x] **Task 3.4:** Add `updateImageAlbum()` for moving images ✓ 2026-01-03
  - Also added `updateImagesAlbum()` for bulk moves
- [x] **Task 3.5:** Update `deleteImages()` to also delete DB records ✓ 2026-01-03
  - Both `deleteImage()` and `deleteImages()` now delete from DB first

### Phase 4: Album Management UI
**Goal:** Create album CRUD UI in Settings

- [x] **Task 4.1:** Create `components/sites/AlbumManager.tsx` ✓ 2026-01-03
  - Create album with name input + button
  - List albums with image count
  - Inline rename with edit/cancel buttons
  - Delete with confirmation dialog
- [x] **Task 4.2:** Add to SettingsTab (Image Library card) ✓ 2026-01-03
  - Added Albums section above All Images
  - Separated with Separator component
- [x] **Task 4.3:** Test album create/rename/delete - 👤 USER TESTING

### Phase 5: Album Selector in Upload
**Goal:** Allow selecting album during upload

- [x] **Task 5.1:** Create `components/editor/AlbumSelector.tsx` ✓ 2026-01-03
  - Reusable dropdown with folder icon
  - Shows album name and image count
  - Exports helper `toListImagesAlbumId()` for converting values
  - Supports `showAllOption` for filter mode
- [x] **Task 5.2:** Integrate into ImageUpload component ✓ 2026-01-03
  - Added `showAlbumSelector` prop
  - Album selector appears above upload zone
- [x] **Task 5.3:** Pass albumId through upload flow ✓ 2026-01-03
  - Uses `toListImagesAlbumId()` to convert selection
  - Appends to FormData when not uncategorized

### Phase 6: Album Filter in Library
**Goal:** Filter images by album in library views

- [x] **Task 6.1:** Used AlbumSelector with `showAllOption` instead of separate component ✓ 2026-01-03
  - All Images / Uncategorized / Album options
- [x] **Task 6.2:** Add to ImageLibraryManager ✓ 2026-01-03
  - Filter dropdown in toolbar
  - Clears selection when filter changes
- [x] **Task 6.3:** Add to ImageLibrary (for image picker) ✓ 2026-01-03
  - Same AlbumSelector component
  - Dynamic empty state message
- [x] **Task 6.4:** Add "Move to Album" action for selected images ✓ 2026-01-03
  - DropdownMenu with album options
  - Shows loading state during move
  - Toast confirmation with album name

### Phase 7: Testing & Polish
**Goal:** Verify all flows work correctly

- [x] **Task 7.1:** TypeScript compilation verified ✓ 2026-01-03
- [x] **Task 7.2:** Production build successful ✓ 2026-01-03
- [x] **Task 7.3:** ESLint - no new warnings ✓ 2026-01-03
- [x] **Task 7.4:** Fixed AlbumSelector value handling ✓ 2026-01-03
  - ALL_IMAGES_VALUE, UNCATEGORIZED_VALUE, album ID
  - toListImagesAlbumId() helper for API calls

### Phase 8: Comprehensive Code Review (Mandatory)
- [x] **Task 8.1:** All phases implemented ✓ 2026-01-03
- [x] **Task 8.2:** Code review completed ✓ 2026-01-03

---

## 12. Task Completion Tracking - MANDATORY WORKFLOW

- [ ] **GET TODAY'S DATE FIRST** - Use time tool before adding timestamps
- [ ] **Update task document immediately** after each completed subtask
- [ ] **Mark checkboxes as [x]** with completion timestamp
- [ ] **Add brief completion notes** (file paths, key changes)

---

## 13. File Structure & Organization

### New Files to Create
```
lib/drizzle/schema/
├── image-albums.ts          # Album table schema
├── images.ts                # Image tracking table schema

app/actions/
├── albums.ts                # Album CRUD server actions

components/sites/
├── AlbumManager.tsx         # Album management UI
├── AlbumFilterDropdown.tsx  # Album filter for library

components/editor/
├── AlbumSelector.tsx        # Album picker for upload
```

### Files to Modify
- [ ] `lib/drizzle/schema/index.ts` - Export new schemas
- [ ] `app/actions/storage.ts` - Database integration
- [ ] `components/editor/ImageUpload.tsx` - Add album selector
- [ ] `components/editor/ImageLibrary.tsx` - Add album filter
- [ ] `components/sites/ImageLibraryManager.tsx` - Add filter + move actions
- [ ] `components/sites/SettingsTab.tsx` - Add album management

---

## 14. Potential Issues & Security Review

### Error Scenarios
- [ ] **Album name conflict:** User tries to create album with existing name
  - **Fix:** Unique constraint + friendly error message
- [ ] **Delete album with images:** What happens to images?
  - **Fix:** ON DELETE SET NULL - images become uncategorized
- [ ] **Storage sync failure:** Images in storage but not in DB
  - **Fix:** Sync function handles gracefully, skips existing

### Edge Cases
- [ ] **No albums created:** Show all images, album filter shows "No albums yet"
- [ ] **Large image library:** Pagination needed? Current limit is 100
- [ ] **Image URL in use:** Deleted image URL referenced in content
  - **Already exists:** Not changing this behavior

### Security & Access Control
- [ ] **Album ownership:** Verify site ownership before album CRUD
- [ ] **Image ownership:** Verify user owns image before move/delete
- [ ] **Cross-site access:** Prevent accessing other sites' albums

---

## 15. Deployment & Configuration

No new environment variables required.

---

## 16. AI Agent Instructions

Standard workflow applies. See template section 16 for full instructions.

**Key reminders:**
- Create down migration BEFORE running db:migrate
- Update task document after each completed task
- Request user approval before Phase 8

---

## 17. Notes & Additional Context

### Related Features
- This enables future "Recently Used" images feature
- Could extend to "Favorites" or "Starred" images
- Album cover images could be added later

### Design Decisions
- Albums are site-specific (not user-wide)
- One album per image (folder-like, not tag-like)
- Uncategorized = album_id IS NULL (no default album row needed)
- Lazy sync: existing images imported on first library view

---

## 18. Second-Order Consequences & Impact Analysis

### Impact Assessment

#### Breaking Changes Analysis
- [ ] **Existing API Contracts:** `listSiteImages` signature changes to add optional `albumId`
  - **Mitigation:** Optional parameter, backwards compatible
- [ ] **Database Dependencies:** None - new tables only
- [ ] **Component Dependencies:** ImageUpload, ImageLibrary, ImageLibraryManager all modified
  - **Mitigation:** Additive changes, existing functionality preserved

#### Performance Implications
- [ ] **Database Query Impact:** New queries are indexed, should be fast
- [ ] **Bundle Size:** 3 new components (~5KB each estimated)
- [ ] **Server Load:** Sync operation could be slow for large libraries
  - **Mitigation:** Sync runs once per session, incremental

#### Security Considerations
- [ ] **Attack Surface:** New album CRUD endpoints
  - **Mitigation:** Standard auth checks, user ownership verification
- [ ] **Permission Boundaries:** Albums scoped to site, images scoped to user

### Critical Issues Identification

**No red flags identified** - This is an additive feature with new tables only.

**Yellow flags:**
- [ ] **Increased Complexity:** Database tracking adds complexity vs. storage-only
- [ ] **New Dependencies:** None

### Mitigation Strategies
- [ ] **Database Changes:** Down migration created before applying
- [ ] **Gradual Migration:** Existing images lazily imported, no forced migration

---

## 19. Implementation Complete

### Summary
Successfully implemented Image Library Albums feature allowing users to organize uploaded images into albums/folders.

### Files Created (7)
- `lib/drizzle/schema/image-albums.ts` - Album table schema
- `lib/drizzle/schema/images.ts` - Image tracking table schema
- `app/actions/albums.ts` - Album CRUD server actions (~250 lines)
- `components/sites/AlbumManager.tsx` - Album management UI (~300 lines)
- `components/editor/AlbumSelector.tsx` - Reusable album dropdown (~120 lines)
- `drizzle/migrations/0026_overjoyed_apocalypse.sql` - Migration
- `drizzle/migrations/0026_overjoyed_apocalypse/down.sql` - Rollback

### Files Modified (5)
- `lib/drizzle/schema/index.ts` - Added exports
- `app/actions/storage.ts` - Database integration (~180 lines added)
- `components/editor/ImageUpload.tsx` - Album selector integration
- `components/editor/ImageLibrary.tsx` - Album filter
- `components/sites/ImageLibraryManager.tsx` - Filter + move actions
- `components/sites/SettingsTab.tsx` - AlbumManager integration

### Key Features Implemented
1. **Album CRUD** - Create, rename, delete albums in Settings
2. **Upload to Album** - Select album when uploading (via `showAlbumSelector` prop)
3. **Filter by Album** - All Images / Uncategorized / Specific album
4. **Move to Album** - Bulk move selected images between albums
5. **Lazy Sync** - Existing storage images auto-imported to database
6. **Delete Cascade** - Album deletion sets images to uncategorized

### Technical Notes
- Database-backed with lazy sync for existing images
- One album per image (folder-like organization)
- Albums are site-specific with unique names per site
- ON DELETE SET NULL preserves images when album deleted

### Testing Status
- TypeScript: PASS
- ESLint: PASS (no new warnings)
- Build: PASS

*Completed: 2026-01-03*

---

*Template Version: 1.0*
*Task Number: 057*
*Created: 2026-01-03*
