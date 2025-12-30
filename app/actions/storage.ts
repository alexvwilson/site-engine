"use server";

import { createClient } from "@/lib/supabase/server";
import { requireUserId } from "@/lib/auth";

const STORAGE_BUCKET = "media-uploads";

const VALID_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export async function uploadImage(formData: FormData): Promise<UploadResult> {
  const userId = await requireUserId();

  const file = formData.get("file") as File | null;
  const siteId = formData.get("siteId") as string | null;

  if (!file) {
    return { success: false, error: "No file provided" };
  }

  if (!siteId) {
    return { success: false, error: "No site ID provided" };
  }

  if (!VALID_TYPES.includes(file.type)) {
    return {
      success: false,
      error: "Invalid file type. Use JPG, PNG, GIF, WebP, or SVG.",
    };
  }

  if (file.size > MAX_SIZE) {
    return { success: false, error: "File too large. Maximum size is 5MB." };
  }

  // Generate unique filename: userId/siteId/timestamp-random.ext
  const ext = file.name.split(".").pop() || "jpg";
  const filename = `${userId}/${siteId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const supabase = await createClient();

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(filename, file, {
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

  return { success: true, url: urlData.publicUrl };
}

interface DeleteResult {
  success: boolean;
  error?: string;
}

// ============================================================================
// Image Library Types
// ============================================================================

export interface ImageFile {
  name: string;
  url: string;
  createdAt: string;
  size: number;
}

export interface ListImagesResult {
  success: boolean;
  images?: ImageFile[];
  error?: string;
}

export async function deleteImage(imagePath: string): Promise<DeleteResult> {
  await requireUserId();

  // Extract path from full URL if needed
  const pathMatch = imagePath.match(/media-uploads\/(.+)$/);
  const path = pathMatch ? pathMatch[1] : imagePath;

  const supabase = await createClient();

  const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([path]);

  if (error) {
    console.error("Storage delete error:", error);
    return { success: false, error: "Delete failed. Please try again." };
  }

  return { success: true };
}

// ============================================================================
// Image Library
// ============================================================================

/**
 * List all images uploaded to a site's storage folder.
 * Returns images sorted by most recent first.
 */
export async function listSiteImages(siteId: string): Promise<ListImagesResult> {
  const userId = await requireUserId();
  const supabase = await createClient();

  const prefix = `${userId}/${siteId}/`;

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .list(prefix, {
      limit: 100,
      sortBy: { column: "created_at", order: "desc" },
    });

  if (error) {
    console.error("Storage list error:", error);
    return { success: false, error: error.message };
  }

  // Filter out folders and map to ImageFile format
  const images: ImageFile[] = (data ?? [])
    .filter((file) => file.name && !file.name.endsWith("/"))
    .map((file) => ({
      name: file.name,
      url: supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(`${prefix}${file.name}`).data.publicUrl,
      createdAt: file.created_at ?? "",
      size: (file.metadata as { size?: number })?.size ?? 0,
    }));

  return { success: true, images };
}

/**
 * Delete multiple images from a site's storage folder.
 */
export async function deleteImages(imageUrls: string[]): Promise<DeleteResult> {
  await requireUserId();

  if (imageUrls.length === 0) {
    return { success: false, error: "No images selected" };
  }

  if (imageUrls.length > 100) {
    return { success: false, error: "Cannot delete more than 100 images at once" };
  }

  const paths = imageUrls.map((url) => {
    const match = url.match(/media-uploads\/(.+)$/);
    return match ? match[1] : url;
  });

  const supabase = await createClient();
  const { error } = await supabase.storage.from(STORAGE_BUCKET).remove(paths);

  if (error) {
    console.error("Storage bulk delete error:", error);
    return { success: false, error: "Delete failed. Please try again." };
  }

  return { success: true };
}
