"use client";

import { useMemo } from "react";
import type { TranscriptionJob } from "@/lib/drizzle/schema/transcription-jobs";
import {
  isActiveStatus,
  isCompletedStatus,
  isFailedStatus,
} from "@/lib/transcription-constants";

interface UseJobsFilteringProps {
  jobs: TranscriptionJob[];
  statusFilter?: "active" | "completed" | "failed" | "all";
  searchQuery?: string;
}

interface UseJobsFilteringReturn {
  filteredJobs: TranscriptionJob[];
  jobsByStatus: {
    active: TranscriptionJob[];
    completed: TranscriptionJob[];
    failed: TranscriptionJob[];
  };
  totalCount: number;
}

/**
 * Custom hook for filtering and categorizing jobs
 * Provides memoized filtered lists and categorizations
 */
export function useJobsFiltering({
  jobs,
  statusFilter = "all",
  searchQuery = "",
}: UseJobsFilteringProps): UseJobsFilteringReturn {
  // Apply search filter
  const searchFilteredJobs = useMemo(() => {
    if (!searchQuery.trim()) {
      return jobs;
    }

    const query = searchQuery.toLowerCase();
    return jobs.filter((job) =>
      job.file_name.toLowerCase().includes(query),
    );
  }, [jobs, searchQuery]);

  // Categorize jobs by status
  const jobsByStatus = useMemo(() => {
    return {
      active: searchFilteredJobs.filter((job) => isActiveStatus(job.status)),
      completed: searchFilteredJobs.filter((job) =>
        isCompletedStatus(job.status),
      ),
      failed: searchFilteredJobs.filter((job) => isFailedStatus(job.status)),
    };
  }, [searchFilteredJobs]);

  // Apply status filter
  const filteredJobs = useMemo(() => {
    switch (statusFilter) {
      case "active":
        return jobsByStatus.active;
      case "completed":
        return jobsByStatus.completed;
      case "failed":
        return jobsByStatus.failed;
      default:
        return searchFilteredJobs;
    }
  }, [statusFilter, searchFilteredJobs, jobsByStatus]);

  return {
    filteredJobs,
    jobsByStatus,
    totalCount: filteredJobs.length,
  };
}
