/**
 * Transcription Server Actions
 *
 * Server-side actions for file upload and transcription job management.
 * Handles upload workflow, job creation, and deletion.
 */

"use server";
import { logger } from "@/lib/logger";
import { runs } from "@trigger.dev/sdk";

import { revalidatePath } from "next/cache";
import { requireUserId } from "@/lib/auth";
import {
  validateFile,
  generateSignedUploadUrl,
  deleteJobFiles,
  type FileMetadata,
} from "@/lib/upload";
import {
  createTranscriptionJob,
  triggerBackgroundJob,
  getTranscriptionJob,
  deleteTranscriptionJob,
  type JobCreationData,
} from "@/lib/jobs";
import type { TranscriptionJob } from "@/lib/drizzle/schema/transcription-jobs";

// Result types for server actions
interface ActionResult {
  success: boolean;
  error?: string;
}

interface InitiateUploadResult extends ActionResult {
  uploadUrl?: string;
  jobId?: string;
  storagePath?: string;
}

interface CompleteUploadResult extends ActionResult {
  job?: TranscriptionJob;
}

interface RetryJobResult extends ActionResult {
  newJobId?: string;
}

interface BatchUploadValidationResult extends ActionResult {
  acceptedFiles: Array<{ name: string; size: number; type: string }>;
  rejectedFiles: Array<{
    name: string;
    size: number;
    type: string;
    reason: string;
  }>;
}

/**
 * Check if batch upload is allowed
 * Validates multiple files and returns accepted/rejected lists
 *
 * @param files - Array of file metadata objects
 */
export async function checkBatchUploadAllowed(
  files: Array<{ name: string; size: number; type: string }>
): Promise<BatchUploadValidationResult> {
  try {
    await requireUserId();

    const acceptedFiles: Array<{ name: string; size: number; type: string }> =
      [];
    const rejectedFiles: Array<{
      name: string;
      size: number;
      type: string;
      reason: string;
    }> = [];

    // Validate each file (max 5 files per batch)
    const filesToValidate = files.slice(0, 5);

    for (const file of filesToValidate) {
      // Extract file extension
      const extension = file.name.split(".").pop()?.toLowerCase() || "";

      // Validate file type and size
      const fileMetadata: FileMetadata = {
        name: file.name,
        size: file.size,
        type: file.type,
        extension,
      };

      const validation = validateFile(fileMetadata);

      if (!validation.valid) {
        rejectedFiles.push({
          ...file,
          reason: validation.error || "Invalid file",
        });
        continue;
      }

      // File passes all validations - accept it
      acceptedFiles.push(file);
    }

    return {
      success: true,
      acceptedFiles,
      rejectedFiles,
    };
  } catch (error) {
    logger.error("Error in checkBatchUploadAllowed:", error);
    return {
      success: false,
      error: "Failed to validate batch upload. Please try again.",
      acceptedFiles: [],
      rejectedFiles: files.map((file) => ({
        ...file,
        reason: "Validation failed",
      })),
    };
  }
}

/**
 * Initiate batch file uploads
 * Pre-generates signed upload URLs for multiple files in a single server action
 * This avoids serialization bottleneck from multiple concurrent initiateUpload calls
 *
 * @param files - Array of file metadata objects
 */
export async function initiateBatchUpload(
  files: Array<{ name: string; size: number; type: string }>
): Promise<
  Array<{
    success: boolean;
    uploadUrl?: string;
    jobId?: string;
    storagePath?: string;
    error?: string;
    fileName: string;
  }>
> {
  try {
    const userId = await requireUserId();

    // Process each file
    const results = await Promise.all(
      files.map(async (fileData) => {
        try {
          // Extract file extension
          const extension = fileData.name.split(".").pop()?.toLowerCase() || "";

          // Create file metadata object
          const fileMetadata: FileMetadata = {
            name: fileData.name,
            size: fileData.size,
            type: fileData.type,
            extension,
          };

          // Validate file type and size
          const fileValidation = validateFile(fileMetadata);

          if (!fileValidation.valid) {
            return {
              success: false,
              error: fileValidation.error,
              fileName: fileData.name,
            };
          }

          // Generate temporary job ID
          const tempJobId = crypto.randomUUID();

          // Generate signed upload URL
          const { signedUrl, path } = await generateSignedUploadUrl(
            userId,
            tempJobId,
            fileData.name
          );

          return {
            success: true,
            uploadUrl: signedUrl,
            jobId: tempJobId,
            storagePath: path,
            fileName: fileData.name,
          };
        } catch (error) {
          logger.error("Error initiating upload for file:", error);
          return {
            success: false,
            error: "Failed to initiate upload. Please try again.",
            fileName: fileData.name,
          };
        }
      })
    );

    return results;
  } catch (error) {
    logger.error("Error in batch upload initiation:", error);
    return files.map((file) => ({
      success: false,
      error: "Failed to initiate batch upload. Please try again.",
      fileName: file.name,
    }));
  }
}

/**
 * Initiate file upload
 * Step 1: Validate file, generate signed upload URL
 *
 * @param fileData - File metadata (name, size, type)
 */
export async function initiateUpload(fileData: {
  name: string;
  size: number;
  type: string;
}): Promise<InitiateUploadResult> {
  try {
    const userId = await requireUserId();

    // Extract file extension
    const extension = fileData.name.split(".").pop()?.toLowerCase() || "";

    // Create file metadata object
    const fileMetadata: FileMetadata = {
      name: fileData.name,
      size: fileData.size,
      type: fileData.type,
      extension,
    };

    // Validate file type and size
    const fileValidation = validateFile(fileMetadata);

    if (!fileValidation.valid) {
      return {
        success: false,
        error: fileValidation.error,
      };
    }

    // Generate a temporary job ID for upload path
    // This will be used to create the job after upload completes
    const tempJobId = crypto.randomUUID();

    // Generate signed upload URL
    const { signedUrl, path } = await generateSignedUploadUrl(
      userId,
      tempJobId,
      fileData.name
    );

    return {
      success: true,
      uploadUrl: signedUrl,
      jobId: tempJobId,
      storagePath: path,
    };
  } catch (error) {
    logger.error("Error initiating upload:", error);
    return {
      success: false,
      error: "Failed to initiate upload. Please try again.",
    };
  }
}

/**
 * Complete file upload
 * Step 2: Create job record after file successfully uploaded to storage
 *
 * @param jobId - Temporary job ID from initiateUpload
 * @param storagePath - Storage path where file was uploaded
 * @param fileData - File metadata
 * @param config - Upload configuration
 */
export async function completeUpload(
  jobId: string,
  storagePath: string,
  fileData: { name: string; size: number; type: string },
  config: {
    language?: string;
    timestampGranularity: "segment" | "word";
  }
): Promise<CompleteUploadResult> {
  try {
    const userId = await requireUserId();

    // Extract file extension and determine type
    const extension = fileData.name.split(".").pop()?.toLowerCase() || "";
    const fileType = fileData.type.startsWith("video/") ? "video" : "audio";

    // Create job in database
    const jobCreationData: JobCreationData = {
      fileName: fileData.name,
      fileUrl: storagePath,
      fileSizeBytes: fileData.size,
      fileType,
      fileExtension: extension,
      language: config.language || "auto",
      timestampGranularity: config.timestampGranularity,
    };

    const createdJobId = await createTranscriptionJob(userId, jobCreationData);

    // Trigger background processing and get the trigger_job_id
    // This ensures the client can immediately start real-time tracking
    await triggerBackgroundJob(createdJobId);

    // NOW fetch the complete job from database with trigger_job_id populated
    const createdJob = await getTranscriptionJob(createdJobId, userId);

    if (!createdJob) {
      throw new Error("Failed to retrieve created job");
    }

    // Return the complete job object so client can add it to state
    return {
      success: true,
      job: createdJob,
    };
  } catch (error) {
    logger.error("Error completing upload:", error);
    return {
      success: false,
      error: "Failed to create transcription job. Please try again.",
    };
  }
}

/**
 * Delete a transcription job
 * Removes job from database and deletes associated files from storage
 *
 * @param jobId - Job ID to delete
 */
export async function deleteJob(jobId: string): Promise<ActionResult> {
  try {
    const userId = await requireUserId();

    // Get job to verify ownership and get file paths
    const job = await getTranscriptionJob(jobId, userId);

    if (!job) {
      return {
        success: false,
        error: "Job not found or access denied.",
      };
    }

    // Cancel the Trigger.dev run if it exists and is still running
    if (job.trigger_job_id) {
      try {
        await runs.cancel(job.trigger_job_id);
        logger.info("Cancelled Trigger.dev run", {
          jobId,
          runId: job.trigger_job_id,
        });
      } catch (error) {
        // Gracefully handle errors (run already completed, doesn't exist, etc.)
        logger.warn(
          "Failed to cancel Trigger.dev run, proceeding with cleanup",
          {
            jobId,
            runId: job.trigger_job_id,
            error,
          }
        );
      }
    }

    // Delete files from storage
    await deleteJobFiles(userId, jobId);

    // Delete job from database
    await deleteTranscriptionJob(jobId, userId);

    // Revalidate transcripts page
    revalidatePath("/transcripts", "page");

    return {
      success: true,
    };
  } catch (error) {
    logger.error("Error deleting job:", error);
    return {
      success: false,
      error: "Failed to delete job. Please try again.",
    };
  }
}

/**
 * Retry a failed transcription job
 * Creates a new job with the same file (if file still exists in storage)
 *
 * @param failedJobId - Job ID of failed job to retry
 */
export async function retryJob(failedJobId: string): Promise<RetryJobResult> {
  try {
    const userId = await requireUserId();

    // Get the failed job
    const failedJob = await getTranscriptionJob(failedJobId, userId);

    if (!failedJob) {
      return {
        success: false,
        error: "Job not found or access denied.",
      };
    }

    // Verify job is actually failed
    if (failedJob.status !== "failed") {
      return {
        success: false,
        error: "Can only retry failed jobs.",
      };
    }

    // Create new job with same file
    const newJobData: JobCreationData = {
      fileName: failedJob.file_name,
      fileUrl: failedJob.original_file_url,
      fileSizeBytes: failedJob.file_size_bytes,
      fileType: failedJob.file_type,
      fileExtension: failedJob.file_extension,
      language: failedJob.language || undefined,
      timestampGranularity: failedJob.timestamp_granularity,
    };

    const newJobId = await createTranscriptionJob(userId, newJobData);

    // Trigger background processing
    await triggerBackgroundJob(newJobId);

    // Revalidate transcripts page
    revalidatePath("/transcripts", "page");

    return {
      success: true,
      newJobId,
    };
  } catch (error) {
    logger.error("Error retrying job:", error);
    return {
      success: false,
      error: "Failed to retry job. Please try again.",
    };
  }
}

/**
 * Cancel a pending or processing job
 * Stops job processing and marks as cancelled
 *
 * @param jobId - Job ID to cancel
 */
export async function cancelJob(jobId: string): Promise<ActionResult> {
  try {
    const userId = await requireUserId();

    // Get job to verify ownership
    const job = await getTranscriptionJob(jobId, userId);

    if (!job) {
      return {
        success: false,
        error: "Job not found or access denied.",
      };
    }

    // Verify job can be cancelled
    if (job.status !== "pending" && job.status !== "processing") {
      return {
        success: false,
        error: "Can only cancel pending or processing jobs.",
      };
    }

    // Update job status to cancelled
    const { updateJobStatus } = await import("@/lib/jobs");
    await updateJobStatus(jobId, "cancelled");

    // Revalidate transcripts page
    revalidatePath("/transcripts", "page");

    return {
      success: true,
    };
  } catch (error) {
    logger.error("Error cancelling job:", error);
    return {
      success: false,
      error: "Failed to cancel job. Please try again.",
    };
  }
}

/**
 * Get Trigger.dev realtime token for frontend progress tracking
 *
 * Generates a public access token that allows the frontend to subscribe
 * to real-time updates from Trigger.dev tasks without database polling.
 *
 * @returns Public access token for Trigger.dev Realtime SDK
 */
export async function getTriggerRealtimeToken(): Promise<string> {
  try {
    // Require authentication and get user ID for token scoping
    const userId = await requireUserId();

    // Import Trigger.dev SDK utilities
    const { configure, auth } = await import("@trigger.dev/sdk");

    // Configure SDK with secret key (required for auth methods to work)
    configure({
      secretKey: process.env.TRIGGER_SECRET_KEY,
    });

    // Generate public access token scoped to user-tagged runs only
    // This enforces security at the token level - users can only subscribe to their own runs
    const publicToken = await auth.createPublicToken({
      scopes: {
        read: {
          tags: [`user:${userId}`], // Only allow reading runs tagged with this user's ID
        },
      },
      expirationTime: "1hr", // Token expires in 1 hour
    });

    return publicToken;
  } catch (error) {
    logger.error("Error generating Trigger.dev realtime token:", error);
    throw new Error("Failed to generate realtime token");
  }
}

/**
 * Fetch AI summary for a transcript from database
 *
 * @param transcriptId - ID of the transcript
 */
export async function fetchAISummary(transcriptId: string) {
  try {
    const userId = await requireUserId();
    const { getAISummary } = await import("@/lib/transcripts");
    return await getAISummary(transcriptId, userId);
  } catch (error) {
    logger.error("Error getting AI summary:", error);
    return null;
  }
}

/**
 * Generate AI summary for a transcript
 * Triggers the Trigger.dev task to generate AI summary with streaming
 *
 * @param transcriptId - ID of the transcript to generate summary for
 * @returns Run ID to subscribe to for real-time updates, or error
 */
export async function generateAISummary(
  transcriptId: string
): Promise<{ success: boolean; runId?: string; error?: string }> {
  try {
    const userId = await requireUserId();

    // Get transcript data
    const { getTranscriptById } = await import("@/lib/transcripts");
    const transcriptData = await getTranscriptById(transcriptId, userId);

    if (!transcriptData) {
      return {
        success: false,
        error: "Transcript not found.",
      };
    }

    // Check if summary already exists
    if (transcriptData.summary) {
      return {
        success: false,
        error: "AI summary already exists for this transcript.",
      };
    }

    // Get transcript text
    const transcriptText = transcriptData.transcript.transcript_text_plain;

    if (!transcriptText) {
      return {
        success: false,
        error: "Transcript text not available.",
      };
    }

    // Trigger the generate-ai-summary task
    const { tasks } = await import("@trigger.dev/sdk/v3");
    type GenerateAISummaryTask =
      typeof import("@/trigger/tasks/generate-ai-summary").generateAISummaryTask;

    const handle = await tasks.trigger<GenerateAISummaryTask>(
      "generate-ai-summary",
      {
        userId,
        transcriptId,
        transcriptText,
      },
      {
        tags: [`user:${userId}`], // Tag with user ID for token-level access control
      }
    );

    logger.info("AI summary generation triggered", {
      transcriptId,
      runId: handle.id,
    });

    return {
      success: true,
      runId: handle.id,
    };
  } catch (error) {
    logger.error("Error generating AI summary:", error);
    return {
      success: false,
      error: "Failed to start AI summary generation. Please try again.",
    };
  }
}

/**
 * Load more completed jobs with server-side pagination
 *
 * @param offset - Number of jobs to skip
 * @param limit - Number of jobs to return (default: 20)
 * @returns Array of completed transcription jobs
 */
export async function loadMoreCompletedJobs(
  offset: number,
  limit: number = 20
): Promise<{
  success: boolean;
  jobs?: TranscriptionJob[];
  hasMore?: boolean;
  error?: string;
}> {
  try {
    const userId = await requireUserId();

    // Import jobs library
    const { getUserTranscriptionJobs } = await import("@/lib/jobs");

    // Fetch completed jobs with pagination
    const jobs = await getUserTranscriptionJobs(userId, {
      status: "completed",
      limit: limit + 1, // Fetch one extra to check if there are more
      offset,
    });

    // Check if there are more jobs
    const hasMore = jobs.length > limit;
    const jobsToReturn = hasMore ? jobs.slice(0, limit) : jobs;

    return {
      success: true,
      jobs: jobsToReturn,
      hasMore,
    };
  } catch (error) {
    logger.error("Error loading more completed jobs:", error);
    return {
      success: false,
      error: "Failed to load more jobs. Please try again.",
    };
  }
}
