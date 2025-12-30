# Task 038: Image Library Management

> **Instructions:** Add standalone image library management with view, search, and bulk delete capabilities.

---

## 1. Task Overview

### Task Title
**Title:** Image Library Management - View, Search, and Delete Site Images

### Goal Statement
**Goal:** Provide site owners with a way to view all uploaded images, search by filename, see file sizes/dates, and delete unused images in bulk. This reduces storage clutter from testing and allows better media asset management.

---

## 2. Strategic Analysis & Solution Options

### Strategic Analysis Decision
**SKIP** - Straightforward feature with clear requirements. The codebase already has:
- `listSiteImages()` action that returns images
- `deleteImage()` action for single image deletion
- `ImageLibrary` component as a reference pattern

Implementation path is clear: extend existing infrastructure with selection and bulk delete capabilities.

---

## 3. Project Analysis & Current State

### Technology & Architecture
- **Frameworks & Versions:** Next.js 15.3, React 19
- **Language:** TypeScript 5.4 with strict mode
- **UI & Styling:** shadcn/ui components with Tailwind CSS v4
- **Storage:** Supabase Storage (`media-uploads` bucket)
- **Relevant Existing Components:**
  - `components/editor/ImageLibrary.tsx` - Current image grid for selection
  - `app/actions/storage.ts` - Upload, delete, list functions
  - `components/sites/SettingsTab.tsx` - Where button will be added

### Current State
The existing `ImageLibrary` component shows a simple grid for selecting images but has no management capabilities:
- No delete functionality
- No file size or metadata display
- No search/filter
- No multi-select

**Existing `ImageFile` interface:**
```typescript
export interface ImageFile {
  name: string;
  url: string;
  createdAt: string;
}
```

**Supabase list response includes metadata** with `size` and `mimetype` that we're not currently using.

### Existing Codebase Analysis

**storage.ts capabilities:**
- `listSiteImages(siteId)` - Lists images, returns name/url/createdAt
- `deleteImage(imagePath)` - Deletes single image
- `uploadImage(formData)` - Uploads new image

**What needs to be added:**
- Extend `ImageFile` to include `size`
- Add `deleteImages()` for bulk deletion
- New management UI components

---

## 4. Context & Problem Definition

### Problem Statement
Site owners accumulate images during testing and development with no way to clean them up. The current ImageLibrary only allows selection - users cannot see file sizes, cannot search through images, and cannot delete unused ones.

### Success Criteria
- [ ] "Manage Images" card in Settings tab opens management modal
- [ ] Modal shows grid of all site images with thumbnails
- [ ] Each image shows filename, file size, and upload date
- [ ] Search input filters images by filename
- [ ] Checkbox selection for multiple images
- [ ] "Select All" / "Deselect All" controls
- [ ] Delete button with confirmation dialog
- [ ] Success toast after deletion with count
- [ ] Empty state when no images exist

---

## 5. Development Mode Context

- **This is a new application in active development**
- **No backwards compatibility concerns**
- **Priority: Speed and simplicity**

---

## 6. Technical Requirements

### Functional Requirements
- User can open image library modal from Settings
- User can view all uploaded images in a responsive grid
- User can see filename, size (formatted), and upload date for each image
- User can search/filter images by filename
- User can select multiple images via checkboxes
- User can delete selected images with confirmation
- Deletion is permanent (no undo)

### Non-Functional Requirements
- **Performance:** Lazy load images, limit to 100 per page
- **Usability:** Clear selection state, obvious delete action
- **Responsive Design:** Grid adjusts columns on mobile
- **Accessibility:** Keyboard navigation, proper ARIA labels

### Technical Constraints
- Must use existing Supabase Storage bucket
- Must use existing auth patterns (requireUserId)
- Must use shadcn/ui Dialog for modal

---

## 7. Data & Database Changes

### Database Schema Changes
**None required** - Images are stored in Supabase Storage, not database.

### Data Model Updates
Extend `ImageFile` interface to include size:

```typescript
export interface ImageFile {
  name: string;
  url: string;
  createdAt: string;
  size: number; // bytes
}
```

---

## 8. Backend Changes

### Server Actions

**Modify `listSiteImages`** to include file size from metadata:
```typescript
const images: ImageFile[] = (data ?? [])
  .filter((file) => file.name && !file.name.endsWith("/"))
  .map((file) => ({
    name: file.name,
    url: supabase.storage.from(STORAGE_BUCKET).getPublicUrl(`${prefix}${file.name}`).data.publicUrl,
    createdAt: file.created_at ?? "",
    size: file.metadata?.size ?? 0,
  }));
```

**Add `deleteImages`** for bulk deletion:
```typescript
export async function deleteImages(imagePaths: string[]): Promise<DeleteResult> {
  await requireUserId();

  const paths = imagePaths.map(path => {
    const match = path.match(/media-uploads\/(.+)$/);
    return match ? match[1] : path;
  });

  const supabase = await createClient();
  const { error } = await supabase.storage.from(STORAGE_BUCKET).remove(paths);

  if (error) {
    return { success: false, error: "Delete failed. Please try again." };
  }

  return { success: true };
}
```

---

## 9. Frontend Changes

### New Components

- [ ] **`components/sites/ImageLibraryModal.tsx`** - Dialog wrapper with trigger button
- [ ] **`components/sites/ImageLibraryManager.tsx`** - Full management UI with:
  - Search input
  - Image grid with checkboxes
  - Selection controls (Select All / Clear)
  - Delete button with count
  - Confirmation dialog

### Files to Modify

- [ ] **`app/actions/storage.ts`** - Add `size` to ImageFile, add `deleteImages` action
- [ ] **`components/sites/SettingsTab.tsx`** - Add Image Library card with modal trigger

---

## 10. Code Changes Overview

### Current Implementation (Before)

**storage.ts - ImageFile interface:**
```typescript
export interface ImageFile {
  name: string;
  url: string;
  createdAt: string;
}
```

**storage.ts - listSiteImages mapping:**
```typescript
.map((file) => ({
  name: file.name,
  url: supabase.storage.from(STORAGE_BUCKET).getPublicUrl(`${prefix}${file.name}`).data.publicUrl,
  createdAt: file.created_at ?? "",
}));
```

### After Refactor

**storage.ts - Extended ImageFile:**
```typescript
export interface ImageFile {
  name: string;
  url: string;
  createdAt: string;
  size: number;
}
```

**storage.ts - Updated mapping + new action:**
```typescript
.map((file) => ({
  name: file.name,
  url: supabase.storage.from(STORAGE_BUCKET).getPublicUrl(`${prefix}${file.name}`).data.publicUrl,
  createdAt: file.created_at ?? "",
  size: (file.metadata as { size?: number })?.size ?? 0,
}));

export async function deleteImages(imageUrls: string[]): Promise<DeleteResult> {
  // bulk delete implementation
}
```

**New ImageLibraryManager.tsx (key parts):**
```typescript
export function ImageLibraryManager({ siteId, onClose }: Props) {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState(false);

  const filteredImages = images.filter(img =>
    img.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async () => {
    const urls = Array.from(selected);
    const result = await deleteImages(urls);
    if (result.success) {
      toast.success(`Deleted ${urls.length} image(s)`);
      setImages(prev => prev.filter(img => !selected.has(img.url)));
      setSelected(new Set());
    }
  };

  // Grid with checkboxes, search, delete confirmation...
}
```

**SettingsTab.tsx - New card:**
```typescript
<Card>
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <ImageIcon className="h-5 w-5" />
      Image Library
    </CardTitle>
    <CardDescription>
      View and manage all uploaded images for this site
    </CardDescription>
  </CardHeader>
  <CardContent>
    <ImageLibraryModal siteId={site.id} />
  </CardContent>
</Card>
```

### Key Changes Summary
- [ ] **Change 1:** Extend `ImageFile` interface with `size` field
- [ ] **Change 2:** Update `listSiteImages` to extract size from metadata
- [ ] **Change 3:** Add `deleteImages` bulk delete action
- [ ] **Change 4:** Create `ImageLibraryManager` component with full UI
- [ ] **Change 5:** Create `ImageLibraryModal` dialog wrapper
- [ ] **Change 6:** Add Image Library card to SettingsTab
- [ ] **Files:** 2 new, 2 modified
- [ ] **Impact:** Users can now manage their uploaded images

---

## 11. Implementation Plan

### Phase 1: Backend - Extend Storage Actions
**Goal:** Add size to ImageFile and bulk delete capability

- [ ] **Task 1.1:** Update `ImageFile` interface to include `size`
  - Files: `app/actions/storage.ts`
- [ ] **Task 1.2:** Update `listSiteImages` to extract size from metadata
  - Files: `app/actions/storage.ts`
- [ ] **Task 1.3:** Add `deleteImages` bulk delete action
  - Files: `app/actions/storage.ts`

### Phase 2: Frontend - Create Management Components
**Goal:** Build the image management UI

- [ ] **Task 2.1:** Create `ImageLibraryManager.tsx`
  - Files: `components/sites/ImageLibraryManager.tsx`
  - Details: Grid with checkboxes, search, selection controls, delete with confirmation
- [ ] **Task 2.2:** Create `ImageLibraryModal.tsx`
  - Files: `components/sites/ImageLibraryModal.tsx`
  - Details: Dialog wrapper with trigger button

### Phase 3: Integration
**Goal:** Add to Settings tab

- [ ] **Task 3.1:** Add Image Library card to SettingsTab
  - Files: `components/sites/SettingsTab.tsx`
  - Details: New card with ImageLibraryModal

### Phase 4: Testing & Validation
**Goal:** Verify functionality

- [ ] **Task 4.1:** Run linting and type-checking
  - Command: `npm run lint && npm run type-check`
- [ ] **Task 4.2:** User browser testing
  - Details: Test image selection, search, bulk delete, confirmation

---

## 12. Task Completion Tracking

*(Will be updated during implementation)*

---

## 13. File Structure & Organization

### New Files to Create
```
components/
  sites/
    ImageLibraryManager.tsx    # Management UI component
    ImageLibraryModal.tsx      # Dialog wrapper
```

### Files to Modify
- [ ] `app/actions/storage.ts` - Add size, deleteImages
- [ ] `components/sites/SettingsTab.tsx` - Add Image Library card

### Dependencies to Add
**None** - Uses existing shadcn/ui Dialog, Checkbox, AlertDialog

---

## 14. Potential Issues & Security Review

### Edge Cases
- [ ] **Empty library:** Show helpful empty state message
- [ ] **Large file count:** Limit to 100 images, consider pagination later
- [ ] **Failed delete:** Show error toast, don't clear selection
- [ ] **Image in use:** Not checking usage - user accepts deletion is permanent

### Security
- [ ] **Auth required:** All actions verify userId
- [ ] **Path validation:** Extract correct path from URL before delete
- [ ] **Bulk limit:** Consider limiting bulk delete size (100 max)

---

## 15. Deployment & Configuration

### Environment Variables
**None required** - Uses existing Supabase configuration

---

## 16. AI Agent Instructions

### Implementation Approach
1. Start with Phase 1 (backend changes)
2. Create management components in Phase 2
3. Integrate with Settings in Phase 3
4. Run linting/type-checking in Phase 4
5. Request user browser testing

### Code Quality Standards
- Use early returns for cleaner code
- Proper TypeScript types
- Accessible keyboard navigation
- Mobile-responsive grid
- Format file sizes (KB, MB)
- Format dates (relative or absolute)

---

## 17. Notes & Additional Context

### Design Decisions
- **Modal over page:** Keeps user in Settings context, quicker access
- **No usage tracking:** Adds complexity, can be a future enhancement
- **No image dimensions:** Requires loading images, expensive for MVP
- **Permanent delete:** No trash/restore - matches Supabase Storage behavior

### Utility Functions Needed
```typescript
// Format bytes to human readable
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Format date
function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString();
}
```

---

## 18. Second-Order Consequences & Impact Analysis

### Impact Assessment

#### Breaking Changes
- [ ] **ImageFile interface change:** Adding `size` field - existing consumers will get `0` for images without metadata, no breaking change

#### Ripple Effects
- [ ] **ImageLibrary component:** May need update to handle new `size` field (optional display)

### Critical Issues
**None identified** - This is an additive feature with no breaking changes.

---

*Template Version: 1.0*
*Created: 2025-12-30*
*Backlog Reference: #21 Image Library Management*
