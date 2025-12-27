# Task 017: Image Upload (Supabase Storage)

> **Task Document for AI-driven development**

---

## 1. Task Overview

### Task Title
**Title:** Image Upload with Supabase Storage Integration

### Goal Statement
**Goal:** Replace URL-only image inputs with a comprehensive upload experience that supports both direct file uploads to Supabase Storage and external URL inputs, improving the content creation workflow for users building websites.

---

## 2. Strategic Analysis & Solution Options

### Problem Context
Currently, all image fields in the site builder require users to provide external URLs. This creates friction because:
- Users must host images elsewhere first (Imgur, Cloudinary, etc.)
- Copy/paste URL workflow is cumbersome
- No way to upload images directly from their device
- Professional users expect drag-and-drop upload functionality

Multiple implementation approaches exist for the upload UX and image processing strategy.

### Solution Options Analysis

#### Option 1: Simple Upload with URL Fallback (Recommended)
**Approach:** Add a file upload button alongside the existing URL input. Users can either upload a file OR paste a URL.

**Pros:**
- Simplest implementation
- Maintains backward compatibility with URL workflow
- Clear user choice between upload and URL
- Lower complexity, faster to implement

**Cons:**
- No drag-and-drop (slightly less polished UX)
- No image optimization/resizing on upload

**Implementation Complexity:** Low-Medium
**Risk Level:** Low

#### Option 2: Drag-and-Drop Upload Zone with URL Option
**Approach:** Replace URL input with a drag-and-drop zone that also accepts clicks. URL input available via toggle/tab.

**Pros:**
- Modern, polished UX
- Drag-and-drop is intuitive
- Visual feedback during upload

**Cons:**
- More complex implementation
- Requires careful state management for drag events
- Larger component footprint

**Implementation Complexity:** Medium
**Risk Level:** Low-Medium

#### Option 3: Full-Featured Upload with Image Optimization
**Approach:** Option 2 + server-side image resizing/compression via Sharp or similar.

**Pros:**
- Optimized images for performance
- Multiple size variants (thumbnail, medium, full)
- Best end-user site performance

**Cons:**
- Requires additional server-side processing
- More complex Trigger.dev task or Edge Function
- Longer implementation time
- Storage costs increase with multiple variants

**Implementation Complexity:** High
**Risk Level:** Medium

### Recommendation & Rationale

**RECOMMENDED SOLUTION:** Option 2 - Drag-and-Drop Upload Zone with URL Option

**Why this is the best choice:**
1. **User Experience:** Drag-and-drop is the expected pattern for image uploads in 2024
2. **Balanced Complexity:** More polished than Option 1 without the overhead of Option 3
3. **Future Ready:** Can add image optimization later as a separate enhancement
4. **Clear UX:** Tab-based toggle between Upload and URL modes is intuitive

**Key Decision Factors:**
- **Performance Impact:** Minimal - uploads go directly to Supabase Storage
- **User Experience:** Significantly improved over URL-only
- **Maintainability:** Single upload component reused across all editors
- **Scalability:** Supabase Storage handles scaling automatically

---

## 3. Project Analysis & Current State

### Technology & Architecture
- **Frameworks & Versions:** Next.js 15.3, React 19
- **Language:** TypeScript 5.x with strict mode
- **Database & ORM:** Supabase (Postgres) via Drizzle ORM
- **UI & Styling:** shadcn/ui components with Tailwind CSS v4
- **Storage:** Supabase Storage (to be configured)
- **Authentication:** Supabase Auth

### Current State
- **5 editors** have image URL fields: HeroEditor, ImageEditor, GalleryEditor, HeaderEditor, TestimonialsEditor
- All use plain text `<Input>` components for URLs
- Placeholder text exists: "Image upload will be available in a future update"
- No Supabase Storage bucket configured
- No upload utilities exist
- Some editors (ImageEditor, GalleryEditor) have basic image preview functionality

### Existing Codebase Analysis

**Relevant Files Analyzed:**
- [x] `lib/section-types.ts` - Image field types (src, alt, caption, backgroundImage, logoUrl, avatar)
- [x] `components/editor/blocks/*.tsx` - 5 editors with image URL inputs
- [x] `components/render/blocks/*.tsx` - Image rendering patterns
- [x] `lib/supabase/server.ts` - Server-side Supabase client
- [x] `lib/supabase/admin.ts` - Admin client with service role
- [x] `lib/env.ts` - Environment variables (no storage config yet)

---

## 4. Context & Problem Definition

### Problem Statement
Users cannot upload images directly when building their websites. They must:
1. Upload images to an external service
2. Copy the URL
3. Paste into the Site Engine editor

This multi-step process is frustrating and breaks the content creation flow. Users expect to drag images directly into the editor or click to browse.

### Success Criteria
- [ ] Users can drag-and-drop images into upload zones
- [ ] Users can click to browse and select files
- [ ] Upload progress indicator shows during upload
- [ ] Uploaded images are stored in Supabase Storage
- [ ] URL input option remains available for external images
- [ ] All 5 editors support the new upload component
- [ ] Images are accessible on published sites
- [ ] Basic validation (file type, size limits)

---

## 5. Development Mode Context

- **This is a new application in active development**
- **No backwards compatibility concerns** - feel free to modify existing patterns
- **Data loss acceptable** - can require re-uploading images if needed
- **Priority: Speed and simplicity** over complex optimization

---

## 6. Technical Requirements

### Functional Requirements
- User can drag-and-drop image files onto upload zone
- User can click upload zone to open file browser
- System validates file type (jpg, png, gif, webp, svg)
- System validates file size (max 5MB recommended)
- System shows upload progress during transfer
- System stores file in Supabase Storage bucket
- System returns public URL after successful upload
- User can switch between Upload and URL input modes
- User can remove/replace uploaded images
- Uploaded images display preview after upload

### Non-Functional Requirements
- **Performance:** Upload should complete within 5 seconds for typical images (<2MB)
- **Security:** Only authenticated users can upload; files stored per-site for organization
- **Usability:** Clear visual feedback for drag state, uploading state, error state
- **Responsive Design:** Upload zone works on mobile (tap to browse)
- **Theme Support:** Component respects light/dark mode

### Technical Constraints
- Must use Supabase Storage (already in stack)
- Must work with existing section auto-save pattern
- Must not require page refresh after upload

---

## 7. Data & Database Changes

### Database Schema Changes
No database schema changes required. Images are stored in Supabase Storage, and URLs are stored in existing JSONB `content` fields.

### Supabase Storage Configuration
```sql
-- Create storage bucket (run in Supabase dashboard or via SQL)
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-images', 'site-images', true);

-- RLS Policy: Authenticated users can upload
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'site-images');

-- RLS Policy: Anyone can view (public bucket)
CREATE POLICY "Public read access for site images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'site-images');

-- RLS Policy: Users can delete their own uploads
CREATE POLICY "Users can delete own uploads"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'site-images' AND auth.uid()::text = (storage.foldername(name))[1]);
```

---

## 8. Backend Changes

### Server Actions

**New File: `app/actions/storage.ts`**
```typescript
"use server";

import { createClient } from "@/lib/supabase/server";
import { requireUserId } from "@/lib/auth";

export async function uploadImage(
  formData: FormData
): Promise<{ success: boolean; url?: string; error?: string }> {
  const userId = await requireUserId();
  const file = formData.get("file") as File;
  const siteId = formData.get("siteId") as string;

  // Validation
  if (!file) return { success: false, error: "No file provided" };
  if (!siteId) return { success: false, error: "No site ID provided" };

  const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];
  if (!validTypes.includes(file.type)) {
    return { success: false, error: "Invalid file type" };
  }

  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return { success: false, error: "File too large (max 5MB)" };
  }

  // Generate unique filename
  const ext = file.name.split(".").pop();
  const filename = `${userId}/${siteId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from("site-images")
    .upload(filename, file);

  if (error) {
    return { success: false, error: error.message };
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from("site-images")
    .getPublicUrl(data.path);

  return { success: true, url: urlData.publicUrl };
}

export async function deleteImage(
  path: string
): Promise<{ success: boolean; error?: string }> {
  await requireUserId();

  const supabase = await createClient();
  const { error } = await supabase.storage
    .from("site-images")
    .remove([path]);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
```

---

## 9. Frontend Changes

### New Components

**`components/editor/ImageUpload.tsx`** - Reusable upload component
- Drag-and-drop zone with visual feedback
- Click to browse functionality
- Tab toggle between Upload and URL modes
- Upload progress indicator
- Preview after upload
- Error state handling

### Component Props Interface
```typescript
interface ImageUploadProps {
  value: string; // Current image URL
  onChange: (url: string) => void;
  siteId: string;
  disabled?: boolean;
  aspectRatio?: "square" | "video" | "banner" | "auto";
  placeholder?: string;
  className?: string;
}
```

### Files to Modify
- [ ] `components/editor/blocks/ImageEditor.tsx` - Replace URL input with ImageUpload
- [ ] `components/editor/blocks/HeroEditor.tsx` - Replace background image URL input
- [ ] `components/editor/blocks/GalleryEditor.tsx` - Replace URL inputs per image
- [ ] `components/editor/blocks/HeaderEditor.tsx` - Replace logo URL input
- [ ] `components/editor/blocks/TestimonialsEditor.tsx` - Replace avatar URL inputs

### State Management
- Upload state managed locally in ImageUpload component
- On successful upload, `onChange` callback updates parent state
- Parent state flows through existing auto-save mechanism
- No global state changes needed

---

## 10. Code Changes Overview

### Current Implementation (Before)

**ImageEditor.tsx** (example pattern used in all 5 editors):
```tsx
<div className="space-y-2">
  <Label htmlFor="image-src">Image URL</Label>
  <Input
    id="image-src"
    value={content.src}
    onChange={(e) => handleChange("src", e.target.value)}
    placeholder="https://example.com/image.jpg"
    disabled={disabled}
  />
  <p className="text-xs text-muted-foreground">
    Image upload will be available in a future update
  </p>
</div>
```

### After Refactor

**ImageEditor.tsx**:
```tsx
<div className="space-y-2">
  <Label>Image</Label>
  <ImageUpload
    value={content.src}
    onChange={(url) => handleChange("src", url)}
    siteId={siteId}
    disabled={disabled}
    aspectRatio="auto"
  />
</div>
```

### Key Changes Summary
- [ ] **New upload component:** Reusable `ImageUpload` with drag-drop, progress, URL fallback
- [ ] **Server action:** `uploadImage` action for secure file upload to Supabase Storage
- [ ] **Storage bucket:** Configure `site-images` bucket with appropriate RLS policies
- [ ] **Editor updates:** Replace URL inputs in 5 editor components
- [ ] **Context threading:** Pass `siteId` through to upload component for file organization

---

## 11. Implementation Plan

### Phase 1: Supabase Storage Setup
**Goal:** Configure storage bucket and policies

- [ ] **Task 1.1:** Create `site-images` storage bucket in Supabase
  - Details: Via Supabase dashboard or SQL migration
- [ ] **Task 1.2:** Configure RLS policies for upload/read/delete
  - Details: Authenticated upload, public read, owner delete
- [ ] **Task 1.3:** Test bucket access via Supabase client
  - Details: Verify policies work correctly

### Phase 2: Server Action
**Goal:** Create secure upload endpoint

- [ ] **Task 2.1:** Create `app/actions/storage.ts`
  - Files: `app/actions/storage.ts`
  - Details: `uploadImage` and `deleteImage` actions
- [ ] **Task 2.2:** Add validation (file type, size)
  - Details: Reject invalid files before upload
- [ ] **Task 2.3:** Implement file path structure
  - Details: `userId/siteId/timestamp-random.ext` pattern

### Phase 3: Upload Component
**Goal:** Build reusable ImageUpload component

- [ ] **Task 3.1:** Create `components/editor/ImageUpload.tsx`
  - Files: `components/editor/ImageUpload.tsx`
  - Details: Core component with upload zone
- [ ] **Task 3.2:** Implement drag-and-drop handlers
  - Details: onDragEnter, onDragLeave, onDrop events
- [ ] **Task 3.3:** Add click-to-browse functionality
  - Details: Hidden file input triggered by zone click
- [ ] **Task 3.4:** Implement upload progress indicator
  - Details: Show progress bar during upload
- [ ] **Task 3.5:** Add Upload/URL mode toggle
  - Details: Tabs to switch between upload and URL input
- [ ] **Task 3.6:** Add preview and remove functionality
  - Details: Show uploaded image, allow removal

### Phase 4: Editor Integration
**Goal:** Integrate ImageUpload into all editors

- [ ] **Task 4.1:** Update ImageEditor.tsx
  - Files: `components/editor/blocks/ImageEditor.tsx`
  - Details: Replace URL input with ImageUpload
- [ ] **Task 4.2:** Update HeroEditor.tsx
  - Files: `components/editor/blocks/HeroEditor.tsx`
  - Details: Replace background image input
- [ ] **Task 4.3:** Update GalleryEditor.tsx
  - Files: `components/editor/blocks/GalleryEditor.tsx`
  - Details: Replace URL inputs for each gallery image
- [ ] **Task 4.4:** Update HeaderEditor.tsx
  - Files: `components/editor/blocks/HeaderEditor.tsx`
  - Details: Replace logo URL input
- [ ] **Task 4.5:** Update TestimonialsEditor.tsx
  - Files: `components/editor/blocks/TestimonialsEditor.tsx`
  - Details: Replace avatar URL inputs
- [ ] **Task 4.6:** Pass siteId prop through component tree
  - Files: `components/editor/SectionEditor.tsx` and parent components
  - Details: Ensure siteId available to ImageUpload

### Phase 5: Testing & Validation
**Goal:** Verify upload functionality works correctly

- [ ] **Task 5.1:** Test single image upload (ImageEditor)
- [ ] **Task 5.2:** Test background image upload (HeroEditor)
- [ ] **Task 5.3:** Test multiple image uploads (GalleryEditor)
- [ ] **Task 5.4:** Test logo upload (HeaderEditor)
- [ ] **Task 5.5:** Test avatar uploads (TestimonialsEditor)
- [ ] **Task 5.6:** Verify images display on published sites
- [ ] **Task 5.7:** Test URL fallback mode still works

### Phase 6: Code Review
**Goal:** Comprehensive review of all changes

- [ ] **Task 6.1:** Present "Implementation Complete!" message
- [ ] **Task 6.2:** Execute comprehensive code review

### Phase 7: User Testing
**Goal:** User verification of upload experience

- [ ] **Task 7.1:** User tests drag-and-drop upload
- [ ] **Task 7.2:** User tests click-to-browse upload
- [ ] **Task 7.3:** User tests URL input fallback
- [ ] **Task 7.4:** User verifies images on published site

---

## 12. File Structure & Organization

### New Files to Create
```
app/actions/
  └── storage.ts                    # Upload/delete server actions

components/editor/
  └── ImageUpload.tsx               # Reusable upload component

lib/
  └── storage-client.ts             # Client-safe constants (file types, sizes)
```

### Files to Modify
```
components/editor/blocks/
  ├── ImageEditor.tsx               # Replace URL input
  ├── HeroEditor.tsx                # Replace background image input
  ├── GalleryEditor.tsx             # Replace gallery image inputs
  ├── HeaderEditor.tsx              # Replace logo input
  └── TestimonialsEditor.tsx        # Replace avatar inputs

components/editor/
  └── SectionEditor.tsx             # Pass siteId prop
```

---

## 13. Potential Issues & Security Review

### Error Scenarios
- [ ] **Upload fails mid-transfer:** Show error message, allow retry
- [ ] **Invalid file type:** Validate before upload, show clear error
- [ ] **File too large:** Check size before upload, show limit in UI
- [ ] **Network timeout:** Handle gracefully with retry option

### Security Considerations
- [ ] **Authentication required:** Upload action requires authenticated user
- [ ] **File type validation:** Server-side validation, not just client
- [ ] **Size limits:** Enforced server-side to prevent abuse
- [ ] **Path structure:** Files organized by userId/siteId prevents cross-user access
- [ ] **RLS policies:** Supabase policies enforce access control

---

## 14. Dependencies to Add

```json
{
  "dependencies": {
    // No new dependencies needed - using existing Supabase client
  }
}
```

---

## 15. Environment Variables

No new environment variables required. Using existing Supabase configuration.

---

## 16. AI Agent Instructions

### Implementation Approach
1. **Start with storage setup** - Bucket must exist before upload works
2. **Build component in isolation** - Test ImageUpload before integrating
3. **Integrate one editor at a time** - Verify each before moving on
4. **Test published site rendering** - Uploaded images must work on public pages

### Code Quality Standards
- Use TypeScript strict typing for all new code
- Follow existing shadcn/ui component patterns
- Implement proper error handling with user-friendly messages
- Ensure responsive design (mobile-first)
- Support light/dark mode via existing theme system

---

## 17. Notes & Additional Context

### Supabase Storage Documentation
- https://supabase.com/docs/guides/storage
- https://supabase.com/docs/reference/javascript/storage-from-upload

### Future Enhancements (Not in Scope)
- Image optimization/resizing (can be added later)
- Image cropping in editor
- Stock image integration
- Image alt text generation via AI

---

**Created:** 2025-12-27
**Completed:** 2025-12-27
**Status:** ✅ Complete
**Backlog Reference:** P2 - Item #3 (Image Upload)
