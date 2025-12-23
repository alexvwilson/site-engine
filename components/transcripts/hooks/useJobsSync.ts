"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { TranscriptionJob } from "@/lib/drizzle/schema/transcription-jobs";
import { JOB_STATUSES } from "@/lib/transcription-constants";

interface UseJobsSyncProps {
  initialInProgressJobs: TranscriptionJob[];
  initialCompletedJobs: TranscriptionJob[];
}

interface UseJobsSyncReturn {
  inProgressJobs: TranscriptionJob[];
  completedJobs: TranscriptionJob[];
  addJob: (job: TranscriptionJob) => void;
  completeJob: (jobId: string) => void;
  deleteJob: (jobId: string) => void;
}

/**
 * Custom hook for managing job state synchronization
 * Handles optimistic updates, server sync, and prevents duplicate operations
 */
export function useJobsSync({
  initialInProgressJobs,
  initialCompletedJobs,
}: UseJobsSyncProps): UseJobsSyncReturn {
  const [inProgressJobs, setInProgressJobs] = useState(initialInProgressJobs);
  const [completedJobs, setCompletedJobs] = useState(initialCompletedJobs);

  // Track jobs that were moved to completed by the client (before server confirms)
  const locallyCompletedJobs = useRef<Set<string>>(new Set());

  // Guard to prevent duplicate completion calls (React Strict Mode, SDK double-firing)
  const completedJobsRef = useRef<Set<string>>(new Set());

  // Track jobs that were explicitly deleted by user
  const locallyDeletedJobs = useRef<Set<string>>(new Set());

  /**
   * Sync in-progress jobs with server
   * Merges server updates with local state, preserving optimistic updates
   */
  useEffect(() => {
    setInProgressJobs((currentJobs) => {
      // Filter out jobs that were completed or deleted locally
      const filteredServerJobs = initialInProgressJobs.filter(
        (job) =>
          !locallyCompletedJobs.current.has(job.id) &&
          !locallyDeletedJobs.current.has(job.id),
      );

      // Create a map of current jobs by ID
      const currentJobsMap = new Map(currentJobs.map((job) => [job.id, job]));

      // Merge: update existing jobs with server data, add new jobs
      const mergedJobs = filteredServerJobs.map((serverJob) => {
        const currentJob = currentJobsMap.get(serverJob.id);
        if (currentJob) {
          // Job exists locally - merge server updates (especially trigger_job_id)
          return { ...currentJob, ...serverJob };
        }
        // New job from server
        return serverJob;
      });

      // Add any local-only jobs that aren't in server response yet
      const serverJobIds = new Set(filteredServerJobs.map((j) => j.id));
      const localOnlyJobs = currentJobs.filter(
        (job) =>
          !serverJobIds.has(job.id) && !locallyDeletedJobs.current.has(job.id),
      );

      return [...mergedJobs, ...localOnlyJobs];
    });
  }, [initialInProgressJobs]);

  /**
   * Sync completed jobs with server
   * Updates existing jobs with server data (fixes optimistic completed_at timestamps)
   * Preserves optimistically added jobs and removes deleted ones
   */
  useEffect(() => {
    setCompletedJobs((current) => {
      // Create a map of server jobs by ID for easy lookup
      const serverJobsMap = new Map(
        initialCompletedJobs
          .filter((job) => !locallyDeletedJobs.current.has(job.id))
          .map((job) => [job.id, job]),
      );

      // Update existing jobs with server data, or keep client version if not on server yet
      const updatedJobs = current
        .filter((job) => !locallyDeletedJobs.current.has(job.id))
        .map((job) => {
          const serverJob = serverJobsMap.get(job.id);
          // If server has this job, use server version (has accurate completed_at)
          if (serverJob) {
            serverJobsMap.delete(job.id); // Mark as processed
            return serverJob;
          }
          // Keep optimistic job that server doesn't know about yet
          return job;
        });

      // Add any server jobs that weren't in current state
      const newServerJobs = Array.from(serverJobsMap.values());

      return [...newServerJobs, ...updatedJobs];
    });
  }, [initialCompletedJobs]);

  /**
   * Add a newly created job to in-progress list
   */
  const addJob = useCallback((job: TranscriptionJob) => {
    setInProgressJobs((prev) => [job, ...prev]);
  }, []);

  /**
   * Move a job from in-progress to completed (optimistic update)
   */
  const completeJob = useCallback((jobId: string) => {
    // Guard: prevent duplicate processing
    if (completedJobsRef.current.has(jobId)) {
      return;
    }

    completedJobsRef.current.add(jobId);
    locallyCompletedJobs.current.add(jobId);

    // Find the completed job
    setInProgressJobs((prev) => {
      const completedJob = prev.find((job) => job.id === jobId);
      if (!completedJob) {
        return prev;
      }

      // Create the updated job object
      const updatedJob: TranscriptionJob = {
        ...completedJob,
        status: JOB_STATUSES.COMPLETED,
        progress_percentage: 100,
        completed_at: new Date(),
      };

      // Add to completed list
      setCompletedJobs((prevCompleted) => [updatedJob, ...prevCompleted]);

      // Remove from in-progress list
      return prev.filter((job) => job.id !== jobId);
    });
  }, []);

  /**
   * Delete a job from both lists (optimistic update)
   */
  const deleteJob = useCallback((jobId: string) => {
    // Mark as locally deleted
    locallyDeletedJobs.current.add(jobId);

    // Remove from both lists
    setInProgressJobs((prev) => prev.filter((job) => job.id !== jobId));
    setCompletedJobs((prev) => prev.filter((job) => job.id !== jobId));

    // Clear from tracking sets
    locallyCompletedJobs.current.delete(jobId);
    completedJobsRef.current.delete(jobId);
  }, []);

  return {
    inProgressJobs,
    completedJobs,
    addJob,
    completeJob,
    deleteJob,
  };
}
