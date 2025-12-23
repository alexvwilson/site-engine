/**
 * File Upload Utilities for Transcription Service
 *
 * Server-side file validation and upload management for audio/video files.
 * Handles file type validation, size checking, and Supabase Storage operations.
 *
 * This file contains server-only operations and should not be imported by client components.
 */

import { logger } from "@/lib/logger";
import { createClient } from "@/lib/supabase/server";
import { MEDIA_UPLOAD_CONSTRAINTS } from "@/lib/app-utils";

// Validation result interface
export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

// File metadata interface
export interface FileMetadata {
  name: string;
  size: number;
  type: string;
  extension: string;
}

/**
 * Validate file type and extension
 * Checks if file is an allowed audio/video format
 */
export function validateFileType(file: FileMetadata): FileValidationResult {
  // Check MIME type
  if (!MEDIA_UPLOAD_CONSTRAINTS.ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Supported formats: ${MEDIA_UPLOAD_CONSTRAINTS.ALLOWED_EXTENSIONS.join(", ").toUpperCase()}`,
    };
  }

  // Check file extension
  const extension = file.extension.toLowerCase();
  if (!MEDIA_UPLOAD_CONSTRAINTS.ALLOWED_EXTENSIONS.includes(extension)) {
    return {
      valid: false,
      error: `Invalid file extension. Supported: ${MEDIA_UPLOAD_CONSTRAINTS.ALLOWED_EXTENSIONS.join(", ").toUpperCase()}`,
    };
  }

  return { valid: true };
}

/**
 * Validate file size
 */
export function validateFileSize(fileSize: number): FileValidationResult {
  if (fileSize > MEDIA_UPLOAD_CONSTRAINTS.MAX_FILE_SIZE) {
    const maxSizeMB = (
      MEDIA_UPLOAD_CONSTRAINTS.MAX_FILE_SIZE /
      (1024 * 1024)
    ).toFixed(0);
    return {
      valid: false,
      error: `File size exceeds maximum of ${maxSizeMB} MB.`,
    };
  }

  return { valid: true };
}

/**
 * Validate file against all constraints
 * Combines type and size validation
 */
export function validateFile(file: FileMetadata): FileValidationResult {
  // Check file type
  const typeValidation = validateFileType(file);
  if (!typeValidation.valid) {
    return typeValidation;
  }

  // Check file size
  const sizeValidation = validateFileSize(file.size);
  if (!sizeValidation.valid) {
    return sizeValidation;
  }

  return { valid: true };
}

/**
 * Generate a signed upload URL for Supabase Storage
 * Creates a secure URL for client-side file upload
 *
 * @param userId - User ID (used in storage path)
 * @param jobId - Job ID (used in storage path)
 * @param filename - Original filename with extension
 * @returns Signed upload URL with 1-hour expiration
 */
export async function generateSignedUploadUrl(
  userId: string,
  jobId: string,
  filename: string
): Promise<{ signedUrl: string; path: string }> {
  const supabase = await createClient();

  // Create storage path: uploads/{user_id}/{job_id}/original.{ext}
  const extension = filename.split(".").pop()?.toLowerCase() || "";
  const storagePath = `uploads/${userId}/${jobId}/original.${extension}`;

  try {
    // Generate signed URL for upload
    const { data, error } = await supabase.storage
      .from(MEDIA_UPLOAD_CONSTRAINTS.BUCKET_NAME)
      .createSignedUploadUrl(storagePath);

    if (error) {
      logger.error("Error creating signed upload URL:", error);
      throw new Error("Failed to generate upload URL");
    }

    if (!data) {
      throw new Error("No signed URL data returned from Supabase");
    }

    return {
      signedUrl: data.signedUrl,
      path: storagePath,
    };
  } catch (error) {
    logger.error("Unexpected error generating signed upload URL:", error);
    throw new Error("Failed to generate upload URL");
  }
}

/**
 * Get a signed download URL for a file in storage
 * Used for downloading original files or transcripts
 *
 * @param storagePath - Path to file in storage bucket
 * @returns Signed download URL with 24-hour expiration
 */
export async function generateSignedDownloadUrl(
  storagePath: string
): Promise<string> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase.storage
      .from(MEDIA_UPLOAD_CONSTRAINTS.BUCKET_NAME)
      .createSignedUrl(
        storagePath,
        MEDIA_UPLOAD_CONSTRAINTS.DOWNLOAD_URL_EXPIRATION
      );

    if (error) {
      logger.error("Error creating signed download URL:", error);
      throw new Error("Failed to generate download URL");
    }

    if (!data?.signedUrl) {
      throw new Error("No signed URL returned from Supabase");
    }

    return data.signedUrl;
  } catch (error) {
    logger.error("Unexpected error generating signed download URL:", error);
    throw new Error("Failed to generate download URL");
  }
}

/**
 * Delete a file from Supabase Storage
 * Removes uploaded media files or transcripts
 *
 * @param storagePath - Path to file in storage bucket
 */
export async function deleteFileFromStorage(
  storagePath: string
): Promise<void> {
  const supabase = await createClient();

  try {
    const { error } = await supabase.storage
      .from(MEDIA_UPLOAD_CONSTRAINTS.BUCKET_NAME)
      .remove([storagePath]);

    if (error) {
      logger.error("Error deleting file from storage:", error);
      throw new Error("Failed to delete file from storage");
    }
  } catch (error) {
    logger.error("Unexpected error deleting file:", error);
    throw new Error("Failed to delete file from storage");
  }
}

/**
 * Delete all files associated with a job
 * Removes original media file and any processed outputs
 *
 * @param userId - User ID
 * @param jobId - Job ID
 */
export async function deleteJobFiles(
  userId: string,
  jobId: string
): Promise<void> {
  const supabase = await createClient();

  // Delete entire job folder (uploads/{user_id}/{job_id}/)
  const jobFolderPrefix = `uploads/${userId}/${jobId}`;

  try {
    // List all files in the job folder
    const { data: files, error: listError } = await supabase.storage
      .from(MEDIA_UPLOAD_CONSTRAINTS.BUCKET_NAME)
      .list(`uploads/${userId}/${jobId}`);

    if (listError) {
      logger.error("Error listing job files:", listError);
      throw new Error("Failed to list job files for deletion");
    }

    if (!files || files.length === 0) {
      return;
    }

    // Delete all files
    const filePaths = files.map((file) => `${jobFolderPrefix}/${file.name}`);
    const { error: deleteError } = await supabase.storage
      .from(MEDIA_UPLOAD_CONSTRAINTS.BUCKET_NAME)
      .remove(filePaths);

    if (deleteError) {
      logger.error("Error deleting job files:", deleteError);
      throw new Error("Failed to delete job files");
    }
  } catch (error) {
    logger.error("Unexpected error deleting job files:", error);
    throw new Error("Failed to delete job files");
  }
}
