import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";
import { MEDIA_UPLOAD_CONSTRAINTS } from "@/lib/app-utils";

interface ValidationResult {
  valid: boolean;
  error?: string;
}

interface UploadResult {
  success: boolean;
  filePath?: string;
  error?: string;
}

interface SignedUrlResult {
  url?: string;
  error?: string;
}

interface DeleteResult {
  success: boolean;
  error?: string;
}

/**
 * Validate file type against allowed MIME types and extensions
 */
export async function validateFileType(
  mimeType: string,
  extension: string
): Promise<ValidationResult> {
  const normalizedExtension = extension.toLowerCase().replace(".", "");

  if (!MEDIA_UPLOAD_CONSTRAINTS.ALLOWED_MIME_TYPES.includes(mimeType)) {
    return {
      valid: false,
      error: `File type not supported. Allowed formats: ${MEDIA_UPLOAD_CONSTRAINTS.ALLOWED_EXTENSIONS.join(", ").toUpperCase()}`,
    };
  }

  if (
    !MEDIA_UPLOAD_CONSTRAINTS.ALLOWED_EXTENSIONS.includes(normalizedExtension)
  ) {
    return {
      valid: false,
      error: `File extension .${normalizedExtension} not supported. Allowed formats: ${MEDIA_UPLOAD_CONSTRAINTS.ALLOWED_EXTENSIONS.join(", ").toUpperCase()}`,
    };
  }

  return { valid: true };
}

/**
 * Validate file size against maximum limit
 */
export async function validateFileSize(
  fileSizeBytes: number
): Promise<ValidationResult> {
  const maxSize = MEDIA_UPLOAD_CONSTRAINTS.MAX_FILE_SIZE;

  if (fileSizeBytes > maxSize) {
    const fileSizeMB = Math.round(fileSizeBytes / (1024 * 1024));
    const maxSizeMB = Math.round(maxSize / (1024 * 1024));

    return {
      valid: false,
      error: `File size (${fileSizeMB}MB) exceeds maximum limit (${maxSizeMB}MB).`,
    };
  }

  return { valid: true };
}

/**
 * Upload media file to Supabase Storage with validation
 */
export async function uploadMediaFile(
  userId: string,
  jobId: string,
  file: File
): Promise<UploadResult> {
  // Extract file extension
  const fileExtension = file.name.split(".").pop() || "";

  // Validate file type
  const typeValidation = await validateFileType(file.type, fileExtension);
  if (!typeValidation.valid) {
    return { success: false, error: typeValidation.error };
  }

  // Validate file size
  const sizeValidation = await validateFileSize(file.size);
  if (!sizeValidation.valid) {
    return { success: false, error: sizeValidation.error };
  }

  // Construct storage path: uploads/{userId}/{jobId}/original.{ext}
  const filePath = `uploads/${userId}/${jobId}/original.${fileExtension}`;

  try {
    const supabase = await createClient();

    const { error } = await supabase.storage
      .from(MEDIA_UPLOAD_CONSTRAINTS.BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true, // Allow overwrite if user re-uploads
      });

    if (error) {
      logger.error("Supabase Storage upload error:", error);
      return {
        success: false,
        error:
          "Upload failed. Please try again or contact support if issue persists.",
      };
    }

    return { success: true, filePath };
  } catch (error) {
    logger.error("Unexpected error during upload:", error);
    return {
      success: false,
      error: "Upload failed due to unexpected error. Please try again.",
    };
  }
}

/**
 * Generate signed URL for client-side file uploads (1 hour expiration)
 */
export async function getSignedUploadUrl(
  userId: string,
  jobId: string,
  fileName: string
): Promise<SignedUrlResult> {
  // Extract file extension
  const fileExtension = fileName.split(".").pop() || "";

  // Construct storage path
  const filePath = `uploads/${userId}/${jobId}/original.${fileExtension}`;

  try {
    const supabase = await createClient();

    const { data, error } = await supabase.storage
      .from(MEDIA_UPLOAD_CONSTRAINTS.BUCKET_NAME)
      .createSignedUploadUrl(filePath);

    if (error) {
      logger.error("Error generating signed upload URL:", error);
      return { error: "Failed to generate upload URL. Please try again." };
    }

    return { url: data.signedUrl };
  } catch (error) {
    logger.error("Unexpected error generating signed upload URL:", error);
    return { error: "Failed to generate upload URL due to unexpected error." };
  }
}

/**
 * Generate signed URL for accessing uploaded media files (24 hour expiration)
 */
export async function getSignedDownloadUrl(
  filePath: string
): Promise<string | null> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.storage
      .from(MEDIA_UPLOAD_CONSTRAINTS.BUCKET_NAME)
      .createSignedUrl(
        filePath,
        MEDIA_UPLOAD_CONSTRAINTS.DOWNLOAD_URL_EXPIRATION
      );

    if (error) {
      logger.error("Error creating signed download URL:", error);
      return null;
    }

    return data?.signedUrl || null;
  } catch (error) {
    logger.error("Unexpected error creating signed download URL:", error);
    return null;
  }
}

/**
 * Delete media file from storage (cleanup after transcription)
 */
export async function deleteMediaFile(filePath: string): Promise<DeleteResult> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.storage
      .from(MEDIA_UPLOAD_CONSTRAINTS.BUCKET_NAME)
      .remove([filePath]);

    if (error) {
      logger.error("Error deleting media file:", error);
      return {
        success: false,
        error: "Failed to delete media file. This is non-blocking.",
      };
    }

    return { success: true };
  } catch (error) {
    logger.error("Unexpected error deleting media file:", error);
    return {
      success: false,
      error: "Failed to delete media file due to unexpected error.",
    };
  }
}
