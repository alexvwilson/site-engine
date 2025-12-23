/**
 * Transcription Job Management
 *
 * Server-side operations for creating and managing transcription jobs.
 * Handles job creation, status updates, and database queries.
 *
 * This file contains server-only operations and should not be imported by client components.
 */

import { logger } from "@/lib/logger";

import { eq, desc, and, inArray } from "drizzle-orm";
import { db } from "@/lib/drizzle/db";
import {
  transcriptionJobs,
  type TranscriptionJob,
  type NewTranscriptionJob,
} from "@/lib/drizzle/schema/transcription-jobs";

// Job creation data interface
export interface JobCreationData {
  fileName: string;
  fileUrl: string;
  fileSizeBytes: number;
  fileType: "audio" | "video";
  fileExtension: string;
  language?: string;
  timestampGranularity: "segment" | "word";
}

// Job filter interface for queries
export interface JobFilters {
  status?: "pending" | "processing" | "completed" | "failed" | "cancelled";
  limit?: number;
  offset?: number;
}

/**
 * Create a new transcription job in the database
 * Called after file is successfully uploaded to Supabase Storage
 *
 * @param userId - User ID who owns the job
 * @param jobData - Job creation data
 * @returns Job ID of created job
 */
export async function createTranscriptionJob(
  userId: string,
  jobData: JobCreationData
): Promise<string> {
  try {
    const newJob: NewTranscriptionJob = {
      user_id: userId,
      file_name: jobData.fileName,
      original_file_url: jobData.fileUrl,
      file_size_bytes: jobData.fileSizeBytes,
      file_type: jobData.fileType,
      file_extension: jobData.fileExtension,
      status: "pending",
      progress_percentage: 0,
      language: jobData.language || "auto",
      timestamp_granularity: jobData.timestampGranularity,
      error_message: null,
      duration_seconds: null,
      detected_language: null,
      trigger_job_id: null,
      completed_at: null,
    };

    const [job] = await db
      .insert(transcriptionJobs)
      .values(newJob)
      .returning({ id: transcriptionJobs.id });

    if (!job) {
      throw new Error("Failed to create transcription job");
    }

    return job.id;
  } catch (error) {
    logger.error("Error creating transcription job:", error);
    throw new Error("Failed to create transcription job");
  }
}

/**
 * Trigger background processing job (Trigger.dev)
 * Initiates the transcription workflow by triggering the extract-audio task
 *
 * @param jobId - Job ID to process
 */
export async function triggerBackgroundJob(jobId: string): Promise<string> {
  try {
    // Import Trigger.dev SDK
    const { tasks } = await import("@trigger.dev/sdk");

    // Fetch job details from database
    const job = await db
      .select()
      .from(transcriptionJobs)
      .where(eq(transcriptionJobs.id, jobId))
      .limit(1);

    if (!job || job.length === 0) {
      throw new Error(`Job ${jobId} not found`);
    }

    const jobData = job[0];

    // Trigger the extract-audio task with user-scoped tags for security
    const handle = await tasks.trigger(
      "extract-audio",
      {
        jobId: jobData.id,
        userId: jobData.user_id,
        fileUrl: jobData.original_file_url,
        fileName: jobData.file_name,
        fileType: jobData.file_type,
      },
      {
        tags: [`user:${jobData.user_id}`], // User scoping for token-level security
      }
    );

    // Store Trigger.dev run ID in database
    await updateJobWithTriggerJobId(jobId, handle.id);

    logger.info(
      `Triggered Trigger.dev workflow for job ${jobId}, run ID: ${handle.id}`
    );

    // Return the trigger job ID so caller can use it
    return handle.id;
  } catch (error) {
    logger.error(`Failed to trigger background job for ${jobId}:`, error);
    throw new Error(
      `Failed to trigger background job: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Get a single transcription job by ID
 * Validates user ownership
 *
 * @param jobId - Job ID
 * @param userId - User ID (for ownership verification)
 * @returns Transcription job or null if not found
 */
export async function getTranscriptionJob(
  jobId: string,
  userId: string
): Promise<TranscriptionJob | null> {
  try {
    const [job] = await db
      .select()
      .from(transcriptionJobs)
      .where(
        and(
          eq(transcriptionJobs.id, jobId),
          eq(transcriptionJobs.user_id, userId)
        )
      )
      .limit(1);

    return job || null;
  } catch (error) {
    logger.error("Error fetching transcription job:", error);
    throw new Error("Failed to fetch transcription job");
  }
}

/**
 * Get all transcription jobs for a user
 * Supports filtering by status and pagination
 *
 * @param userId - User ID
 * @param filters - Optional filters (status, limit, offset)
 * @returns Array of transcription jobs
 */
export async function getUserTranscriptionJobs(
  userId: string,
  filters?: JobFilters
): Promise<TranscriptionJob[]> {
  try {
    // Build where conditions
    const conditions = [eq(transcriptionJobs.user_id, userId)];

    if (filters?.status) {
      conditions.push(eq(transcriptionJobs.status, filters.status));
    }

    // Build and execute query with all conditions and pagination
    const jobs = await db
      .select()
      .from(transcriptionJobs)
      .where(and(...conditions))
      .orderBy(desc(transcriptionJobs.created_at))
      .limit(filters?.limit ?? 100)
      .offset(filters?.offset ?? 0);

    return jobs;
  } catch (error) {
    logger.error("Error fetching user transcription jobs:", error);
    throw new Error("Failed to fetch transcription jobs");
  }
}

/**
 * Get transcription jobs for a user filtered by multiple statuses
 * More efficient than making multiple queries for different statuses
 *
 * @param userId - User ID
 * @param statuses - Array of status values to filter by
 * @param limit - Optional limit (default: 100)
 * @param offset - Optional offset (default: 0)
 * @returns Array of transcription jobs matching any of the provided statuses
 */
export async function getUserTranscriptionJobsByStatuses(
  userId: string,
  statuses: Array<
    "pending" | "processing" | "completed" | "failed" | "cancelled"
  >,
  limit: number = 100,
  offset: number = 0
): Promise<TranscriptionJob[]> {
  try {
    const jobs = await db
      .select()
      .from(transcriptionJobs)
      .where(
        and(
          eq(transcriptionJobs.user_id, userId),
          inArray(transcriptionJobs.status, statuses)
        )
      )
      .orderBy(desc(transcriptionJobs.created_at))
      .limit(limit)
      .offset(offset);

    return jobs;
  } catch (error) {
    logger.error("Error fetching user transcription jobs by statuses:", error);
    throw new Error("Failed to fetch transcription jobs");
  }
}

/**
 * Update transcription job status
 * Used by background processing to update job progress
 *
 * @param jobId - Job ID
 * @param status - New status
 * @param progressPercentage - Progress (0-100)
 * @param errorMessage - Optional error message for failed jobs
 */
export async function updateJobStatus(
  jobId: string,
  status: "pending" | "processing" | "completed" | "failed" | "cancelled",
  progressPercentage?: number,
  errorMessage?: string
): Promise<void> {
  try {
    const updateData: Partial<NewTranscriptionJob> = {
      status,
    };

    if (progressPercentage !== undefined) {
      updateData.progress_percentage = progressPercentage;
    }

    if (errorMessage) {
      updateData.error_message = errorMessage;
    }

    if (status === "completed") {
      updateData.completed_at = new Date();
    }

    await db
      .update(transcriptionJobs)
      .set(updateData)
      .where(eq(transcriptionJobs.id, jobId));
  } catch (error) {
    logger.error("Error updating job status:", error);
    throw new Error("Failed to update job status");
  }
}

/**
 * Update job with Trigger.dev job ID
 * Called after successfully starting background job
 *
 * @param jobId - Job ID
 * @param triggerJobId - Trigger.dev job ID
 */
export async function updateJobWithTriggerJobId(
  jobId: string,
  triggerJobId: string
): Promise<void> {
  try {
    await db
      .update(transcriptionJobs)
      .set({ trigger_job_id: triggerJobId })
      .where(eq(transcriptionJobs.id, jobId));
  } catch (error) {
    logger.error("Error updating job with Trigger.dev job ID:", error);
    throw new Error("Failed to update job with Trigger.dev job ID");
  }
}

/**
 * Update job with audio metadata
 * Called after FFmpeg extracts duration and other metadata
 *
 * @param jobId - Job ID
 * @param durationSeconds - Audio/video duration in seconds
 * @param detectedLanguage - Language detected by Whisper
 */
export async function updateJobMetadata(
  jobId: string,
  durationSeconds: number,
  detectedLanguage?: string
): Promise<void> {
  try {
    const updateData: Partial<NewTranscriptionJob> = {
      duration_seconds: durationSeconds,
    };

    if (detectedLanguage) {
      updateData.detected_language = detectedLanguage;
    }

    await db
      .update(transcriptionJobs)
      .set(updateData)
      .where(eq(transcriptionJobs.id, jobId));
  } catch (error) {
    logger.error("Error updating job metadata:", error);
    throw new Error("Failed to update job metadata");
  }
}

/**
 * Delete a transcription job from the database
 * Note: This does NOT delete associated files from storage
 * Use deleteJobFiles() from lib/upload.ts to clean up storage
 *
 * @param jobId - Job ID to delete
 * @param userId - User ID (for ownership verification)
 */
export async function deleteTranscriptionJob(
  jobId: string,
  userId: string
): Promise<void> {
  try {
    // Verify ownership before deletion
    const job = await getTranscriptionJob(jobId, userId);

    if (!job) {
      throw new Error("Job not found or access denied");
    }

    await db
      .delete(transcriptionJobs)
      .where(
        and(
          eq(transcriptionJobs.id, jobId),
          eq(transcriptionJobs.user_id, userId)
        )
      );
  } catch (error) {
    logger.error("Error deleting transcription job:", error);
    throw new Error("Failed to delete transcription job");
  }
}

/**
 * Get count of jobs by status for a user
 * Useful for dashboard statistics
 *
 * @param userId - User ID
 * @returns Object with counts by status
 */
export async function getJobStatusCounts(userId: string): Promise<{
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  cancelled: number;
}> {
  try {
    const jobs = await db
      .select({
        status: transcriptionJobs.status,
      })
      .from(transcriptionJobs)
      .where(eq(transcriptionJobs.user_id, userId));

    const counts = {
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0,
      cancelled: 0,
    };

    for (const job of jobs) {
      counts[job.status]++;
    }

    return counts;
  } catch (error) {
    logger.error("Error getting job status counts:", error);
    throw new Error("Failed to get job status counts");
  }
}

/**
 * Get active jobs (pending or processing) for a user
 * Used to show real-time progress in UI
 *
 * @param userId - User ID
 * @returns Array of active transcription jobs
 */
export async function getActiveJobs(
  userId: string
): Promise<TranscriptionJob[]> {
  try {
    const jobs = await db
      .select()
      .from(transcriptionJobs)
      .where(
        and(
          eq(transcriptionJobs.user_id, userId),
          inArray(transcriptionJobs.status, ["pending", "processing"])
        )
      )
      .orderBy(desc(transcriptionJobs.created_at));

    return jobs;
  } catch (error) {
    logger.error("Error fetching active jobs:", error);
    throw new Error("Failed to fetch active jobs");
  }
}
