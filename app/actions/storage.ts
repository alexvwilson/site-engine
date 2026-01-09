"use server";

import { createClient } from "@/lib/supabase/server";
import { createSupabaseServerAdminClient } from "@/lib/supabase/admin";
import { requireUserId } from "@/lib/auth";
import { db } from "@/lib/drizzle/db";
import { images } from "@/lib/drizzle/schema/images";
import { documents } from "@/lib/drizzle/schema/documents";
import { sites } from "@/lib/drizzle/schema/sites";
import { eq, and, desc, isNull, inArray } from "drizzle-orm";

const STORAGE_BUCKET = "media-uploads";

const VALID_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

const VALID_DOCUMENT_TYPES = ["application/pdf"];
const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10MB

// ============================================================================
// Types
// ============================================================================

interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

interface DeleteResult {
  success: boolean;
  error?: string;
}

export interface ImageFile {
  id: string;
  name: string;
  url: string;
  createdAt: string;
  size: number;
  albumId: string | null;
}

export interface ListImagesResult {
  success: boolean;
  images?: ImageFile[];
  error?: string;
}

interface UpdateAlbumResult {
  success: boolean;
  error?: string;
}

interface SyncResult {
  success: boolean;
  imported: number;
  error?: string;
}

export interface DocumentFile {
  id: string;
  name: string;
  url: string;
  slug: string;
  createdAt: string;
  size: number;
}

export interface ListDocumentsResult {
  success: boolean;
  documents?: DocumentFile[];
  siteSlug?: string;
  error?: string;
}

// ============================================================================
// Storage Sync - Lazy Import of Existing Images
// ============================================================================

/**
 * Sync images from Supabase Storage to the database.
 * Called automatically when listing images to ensure existing uploads are tracked.
 */
async function syncStorageToDatabase(
  siteId: string,
  userId: string
): Promise<{ imported: number }> {
  const supabase = await createClient();
  const prefix = `${userId}/${siteId}/`;

  // Get all files from storage
  const { data: storageFiles, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .list(prefix, { limit: 500 });

  if (error || !storageFiles?.length) {
    return { imported: 0 };
  }

  // Get existing tracked images for this site
  const existingImages = await db
    .select({ storage_path: images.storage_path })
    .from(images)
    .where(eq(images.site_id, siteId));

  const existingPaths = new Set(existingImages.map((img) => img.storage_path));

  // Find untracked images (in storage but not in database)
  const untracked = storageFiles
    .filter((file) => file.name && !file.name.endsWith("/"))
    .filter((file) => !existingPaths.has(`${prefix}${file.name}`));

  if (untracked.length === 0) {
    return { imported: 0 };
  }

  // Insert untracked images into database
  const newRecords = untracked.map((file) => ({
    site_id: siteId,
    album_id: null,
    storage_path: `${prefix}${file.name}`,
    url: supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(`${prefix}${file.name}`).data.publicUrl,
    filename: file.name,
    file_size: (file.metadata as { size?: number })?.size ?? null,
    mime_type: (file.metadata as { mimetype?: string })?.mimetype ?? null,
  }));

  await db.insert(images).values(newRecords).onConflictDoNothing();

  return { imported: newRecords.length };
}

/**
 * Manually trigger storage sync (exposed for UI "Sync Images" button).
 */
export async function syncSiteImages(siteId: string): Promise<SyncResult> {
  const userId = await requireUserId();

  try {
    const result = await syncStorageToDatabase(siteId, userId);
    return { success: true, imported: result.imported };
  } catch (error) {
    console.error("Sync error:", error);
    return { success: false, imported: 0, error: "Failed to sync images" };
  }
}

// ============================================================================
// Image Upload
// ============================================================================

export async function uploadImage(formData: FormData): Promise<UploadResult> {
  const userId = await requireUserId();

  const file = formData.get("file") as File | null;
  const siteId = formData.get("siteId") as string | null;
  const albumId = formData.get("albumId") as string | null;

  if (!file) {
    return { success: false, error: "No file provided" };
  }

  if (!siteId) {
    return { success: false, error: "No site ID provided" };
  }

  if (!VALID_IMAGE_TYPES.includes(file.type)) {
    return {
      success: false,
      error: "Invalid file type. Use JPG, PNG, GIF, WebP, or SVG.",
    };
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return { success: false, error: "File too large. Maximum size is 5MB." };
  }

  // Generate unique filename: userId/siteId/timestamp-random.ext
  const ext = file.name.split(".").pop() || "jpg";
  const storagePath = `${userId}/${siteId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const supabase = await createClient();

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error("Storage upload error:", error.message, error);
    return { success: false, error: `Upload failed: ${error.message}` };
  }

  const { data: urlData } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(data.path);

  // Create database record to track the image
  try {
    await db.insert(images).values({
      site_id: siteId,
      album_id: albumId || null,
      storage_path: storagePath,
      url: urlData.publicUrl,
      filename: file.name,
      file_size: file.size,
      mime_type: file.type,
    });
  } catch (dbError) {
    console.error("Database insert error (image still uploaded):", dbError);
    // Image is still in storage, will be synced later
  }

  return { success: true, url: urlData.publicUrl };
}

// ============================================================================
// Image Listing
// ============================================================================

/**
 * List images for a site, optionally filtered by album.
 *
 * @param siteId - The site ID
 * @param albumId - Optional album filter:
 *   - undefined: All images
 *   - null: Uncategorized images only (no album)
 *   - string: Images in specific album
 */
export async function listSiteImages(
  siteId: string,
  albumId?: string | null
): Promise<ListImagesResult> {
  const userId = await requireUserId();

  // Ensure storage images are synced to database
  await syncStorageToDatabase(siteId, userId);

  // Build query with optional album filter
  const conditions = [eq(images.site_id, siteId)];

  if (albumId === null) {
    // Uncategorized only
    conditions.push(isNull(images.album_id));
  } else if (albumId !== undefined) {
    // Specific album
    conditions.push(eq(images.album_id, albumId));
  }
  // If albumId is undefined, return all images (no additional filter)

  const results = await db
    .select()
    .from(images)
    .where(and(...conditions))
    .orderBy(desc(images.created_at));

  const imageFiles: ImageFile[] = results.map((img) => ({
    id: img.id,
    name: img.filename,
    url: img.url,
    createdAt: img.created_at.toISOString(),
    size: img.file_size ?? 0,
    albumId: img.album_id,
  }));

  return { success: true, images: imageFiles };
}

// ============================================================================
// Image Album Management
// ============================================================================

/**
 * Update the album assignment for an image.
 */
export async function updateImageAlbum(
  imageId: string,
  albumId: string | null
): Promise<UpdateAlbumResult> {
  await requireUserId();

  try {
    await db
      .update(images)
      .set({ album_id: albumId })
      .where(eq(images.id, imageId));

    return { success: true };
  } catch (error) {
    console.error("Update image album error:", error);
    return { success: false, error: "Failed to update image album" };
  }
}

/**
 * Update album assignment for multiple images.
 */
export async function updateImagesAlbum(
  imageIds: string[],
  albumId: string | null
): Promise<UpdateAlbumResult> {
  await requireUserId();

  if (imageIds.length === 0) {
    return { success: false, error: "No images selected" };
  }

  try {
    await db
      .update(images)
      .set({ album_id: albumId })
      .where(inArray(images.id, imageIds));

    return { success: true };
  } catch (error) {
    console.error("Update images album error:", error);
    return { success: false, error: "Failed to update image albums" };
  }
}

// ============================================================================
// Image Deletion
// ============================================================================

export async function deleteImage(imagePath: string): Promise<DeleteResult> {
  const userId = await requireUserId();

  // Extract path from full URL if needed
  const pathMatch = imagePath.match(/media-uploads\/(.+)$/);
  const path = pathMatch ? pathMatch[1] : imagePath;

  // Security check: verify path belongs to the current user
  // Path format is: userId/siteId/filename
  if (!path.startsWith(`${userId}/`)) {
    console.error("Unauthorized delete attempt:", { userId, path });
    return { success: false, error: "Unauthorized: Cannot delete images you don't own" };
  }

  // Delete from database first
  await db.delete(images).where(eq(images.storage_path, path));

  // Use admin client to bypass storage RLS policies
  const adminClient = createSupabaseServerAdminClient();
  const { error } = await adminClient.storage.from(STORAGE_BUCKET).remove([path]);

  if (error) {
    console.error("Storage delete error:", error);
    return { success: false, error: "Delete failed. Please try again." };
  }

  return { success: true };
}

/**
 * Delete multiple images from storage and database.
 * Uses the admin client (bypasses RLS) but verifies ownership first.
 */
export async function deleteImages(imageUrls: string[]): Promise<DeleteResult> {
  const userId = await requireUserId();

  if (imageUrls.length === 0) {
    return { success: false, error: "No images selected" };
  }

  if (imageUrls.length > 100) {
    return { success: false, error: "Cannot delete more than 100 images at once" };
  }

  // Extract paths from URLs
  const paths = imageUrls.map((url) => {
    const match = url.match(/media-uploads\/(.+)$/);
    return match ? match[1] : url;
  });

  // Security check: verify all paths belong to the current user
  // Path format is: userId/siteId/filename
  const unauthorizedPaths = paths.filter((path) => !path.startsWith(`${userId}/`));
  if (unauthorizedPaths.length > 0) {
    console.error("Unauthorized delete attempt:", { userId, unauthorizedPaths });
    return { success: false, error: "Unauthorized: Cannot delete images you don't own" };
  }

  // Delete from database first
  await db.delete(images).where(inArray(images.storage_path, paths));

  // Use admin client to bypass storage RLS policies
  const adminClient = createSupabaseServerAdminClient();
  const { error } = await adminClient.storage.from(STORAGE_BUCKET).remove(paths);

  if (error) {
    console.error("Storage bulk delete error:", error);
    return { success: false, error: "Delete failed. Please try again." };
  }

  return { success: true };
}

// ============================================================================
// Document Upload
// ============================================================================

/**
 * Generate a URL-friendly slug from a filename
 */
function generateDocumentSlug(filename: string): string {
  // Remove file extension
  const nameWithoutExt = filename.replace(/\.[^.]+$/, "");

  return nameWithoutExt
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special chars
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Remove consecutive hyphens
    .substring(0, 50); // Max 50 chars
}

/**
 * Get a unique slug for a document within a site
 */
async function getUniqueDocumentSlug(siteId: string, baseSlug: string): Promise<string> {
  let slug = baseSlug;
  let counter = 0;

  while (true) {
    const [existing] = await db
      .select({ id: documents.id })
      .from(documents)
      .where(and(eq(documents.site_id, siteId), eq(documents.slug, slug)))
      .limit(1);

    if (!existing) {
      return slug;
    }

    counter++;
    slug = `${baseSlug}-${counter}`;
  }
}

export async function uploadDocument(formData: FormData): Promise<UploadResult> {
  const userId = await requireUserId();

  const file = formData.get("file") as File | null;
  const siteId = formData.get("siteId") as string | null;

  if (!file) {
    return { success: false, error: "No file provided" };
  }

  if (!siteId) {
    return { success: false, error: "No site ID provided" };
  }

  if (!VALID_DOCUMENT_TYPES.includes(file.type)) {
    return {
      success: false,
      error: "Invalid file type. Only PDF files are supported.",
    };
  }

  if (file.size > MAX_DOCUMENT_SIZE) {
    return { success: false, error: "File too large. Maximum size is 10MB." };
  }

  // Generate unique filename: userId/siteId/documents/timestamp-random.pdf
  const storagePath = `${userId}/${siteId}/documents/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.pdf`;

  const supabase = await createClient();

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error("Storage upload error:", error.message, error);
    return { success: false, error: `Upload failed: ${error.message}` };
  }

  const { data: urlData } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(data.path);

  // Generate unique slug for the document
  const baseSlug = generateDocumentSlug(file.name);
  const slug = await getUniqueDocumentSlug(siteId, baseSlug);

  // Create database record to track the document
  try {
    await db.insert(documents).values({
      site_id: siteId,
      storage_path: storagePath,
      url: urlData.publicUrl,
      filename: file.name,
      slug,
      file_size: file.size,
      mime_type: file.type,
    });
  } catch (dbError) {
    console.error("Database insert error (document still uploaded):", dbError);
  }

  return { success: true, url: urlData.publicUrl };
}

// ============================================================================
// Document Listing
// ============================================================================

export async function listSiteDocuments(
  siteId: string
): Promise<ListDocumentsResult> {
  await requireUserId();

  // Fetch site slug for building document URLs
  const [site] = await db
    .select({ slug: sites.slug })
    .from(sites)
    .where(eq(sites.id, siteId))
    .limit(1);

  const results = await db
    .select()
    .from(documents)
    .where(eq(documents.site_id, siteId))
    .orderBy(desc(documents.created_at));

  const documentFiles: DocumentFile[] = results.map((doc) => ({
    id: doc.id,
    name: doc.filename,
    url: doc.url,
    slug: doc.slug,
    createdAt: doc.created_at.toISOString(),
    size: doc.file_size ?? 0,
  }));

  return { success: true, documents: documentFiles, siteSlug: site?.slug };
}

// ============================================================================
// Document Deletion
// ============================================================================

export async function deleteDocument(documentId: string): Promise<DeleteResult> {
  const userId = await requireUserId();

  // Get document from database
  const [doc] = await db
    .select()
    .from(documents)
    .where(eq(documents.id, documentId));

  if (!doc) {
    return { success: false, error: "Document not found" };
  }

  // Security check: verify path belongs to the current user
  if (!doc.storage_path.startsWith(`${userId}/`)) {
    console.error("Unauthorized delete attempt:", { userId, path: doc.storage_path });
    return { success: false, error: "Unauthorized: Cannot delete documents you don't own" };
  }

  // Delete from database first
  await db.delete(documents).where(eq(documents.id, documentId));

  // Use admin client to bypass storage RLS policies
  const adminClient = createSupabaseServerAdminClient();
  const { error } = await adminClient.storage.from(STORAGE_BUCKET).remove([doc.storage_path]);

  if (error) {
    console.error("Storage delete error:", error);
    return { success: false, error: "Delete failed. Please try again." };
  }

  return { success: true };
}
