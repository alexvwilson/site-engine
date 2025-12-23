"use client";

import { useCallback, useRef } from "react";
import { toast } from "sonner";
import { deleteJob, retryJob } from "@/app/actions/transcriptions";
import type { TranscriptionJob } from "@/lib/drizzle/schema/transcription-jobs";

interface UseJobsActionsProps {
  onJobComplete?: (jobId: string) => void;
  onJobDeleted?: (jobId: string) => void;
  onJobCreated?: (job: TranscriptionJob) => void;
}

interface UseJobsActionsReturn {
  handleJobComplete: (jobId: string, jobs: TranscriptionJob[]) => void;
  handleJobDeleted: (jobId: string) => Promise<void>;
  handleJobCreated: (job: TranscriptionJob) => void;
  handleJobRetry: (jobId: string) => Promise<void>;
  isProcessing: (jobId: string) => boolean;
}

/**
 * Custom hook for managing job actions (complete, delete, retry)
 * Centralizes action logic with error handling and callbacks
 */
export function useJobsActions({
  onJobComplete,
  onJobDeleted,
  onJobCreated,
}: UseJobsActionsProps): UseJobsActionsReturn {
  // Track jobs being processed to prevent duplicate actions
  const processingJobs = useRef<Set<string>>(new Set());

  /**
   * Handle job completion
   * Called when a job finishes processing (from real-time updates)
   */
  const handleJobComplete = useCallback(
    (jobId: string, jobs: TranscriptionJob[]) => {
      // Guard: prevent duplicate processing
      if (processingJobs.current.has(jobId)) {
        return;
      }

      processingJobs.current.add(jobId);

      // Check if job exists
      const job = jobs.find((j) => j.id === jobId);
      if (!job) {
        processingJobs.current.delete(jobId);
        return;
      }

      // Call parent callback
      if (onJobComplete) {
        onJobComplete(jobId);
      }

      // Show success toast
      toast.success("Transcription completed!", {
        description: `"${job.file_name}" is ready to view.`,
      });

      // Remove from processing set after a delay to prevent race conditions
      setTimeout(() => {
        processingJobs.current.delete(jobId);
      }, 1000);
    },
    [onJobComplete],
  );

  /**
   * Handle job deletion
   * Deletes job from database and storage
   */
  const handleJobDeleted = useCallback(
    async (jobId: string): Promise<void> => {
      try {
        const result = await deleteJob(jobId);

        if (result.success) {
          // Small delay to ensure JobProgress cleanup completes before removing from UI
          // This prevents race condition where JobProgress tries to query deleted job during unmount
          await new Promise(resolve => setTimeout(resolve, 100));

          // Now safe to remove from UI
          if (onJobDeleted) {
            onJobDeleted(jobId);
          }

          toast.success("Job deleted successfully");
        } else {
          toast.error(result.error || "Failed to delete job");
        }
      } catch (error) {
        console.error("Error deleting job:", error);
        toast.error("Failed to delete job. Please try again.");
      }
    },
    [onJobDeleted],
  );

  /**
   * Handle job creation
   * Called after a new job is uploaded
   */
  const handleJobCreated = useCallback(
    (job: TranscriptionJob) => {
      if (onJobCreated) {
        onJobCreated(job);
      }

      toast.success("Upload successful!", {
        description: `"${job.file_name}" is being processed.`,
      });
    },
    [onJobCreated],
  );

  /**
   * Handle job retry
   * Creates a new job from a failed one
   */
  const handleJobRetry = useCallback(async (jobId: string): Promise<void> => {
    try {
      const result = await retryJob(jobId);

      if (result.success) {
        toast.success("Job retry started", {
          description: "The transcription is being processed again.",
        });
      } else {
        toast.error(result.error || "Failed to retry job");
      }
    } catch (error) {
      console.error("Error retrying job:", error);
      toast.error("Failed to retry job. Please try again.");
    }
  }, []);

  /**
   * Check if a job is currently being processed
   */
  const isProcessing = useCallback((jobId: string): boolean => {
    return processingJobs.current.has(jobId);
  }, []);

  return {
    handleJobComplete,
    handleJobDeleted,
    handleJobCreated,
    handleJobRetry,
    isProcessing,
  };
}
