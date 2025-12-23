"use client";

import { useState, useEffect, useMemo } from "react";
import { JOBS_PER_PAGE } from "@/lib/transcription-constants";

interface UseJobsPaginationReturn<T> {
  visibleJobs: T[];
  hasMore: boolean;
  loadMore: () => void;
  totalCount: number;
  visibleCount: number;
}

/**
 * Shared pagination hook for job lists
 * Manages visible items count and "Load More" functionality
 */
export function useJobsPagination<T>(
  jobs: T[]
): UseJobsPaginationReturn<T> {
  const [displayCount, setDisplayCount] = useState(JOBS_PER_PAGE);

  // Reset pagination when jobs array changes (e.g., filter applied)
  useEffect(() => {
    setDisplayCount(JOBS_PER_PAGE);
  }, [jobs.length]);

  // Calculate visible jobs and pagination state
  const { visibleJobs, hasMore } = useMemo(() => {
    return {
      visibleJobs: jobs.slice(0, displayCount),
      hasMore: jobs.length > displayCount,
    };
  }, [jobs, displayCount]);

  const loadMore = (): void => {
    setDisplayCount((prev) => prev + JOBS_PER_PAGE);
  };

  return {
    visibleJobs,
    hasMore,
    loadMore,
    totalCount: jobs.length,
    visibleCount: visibleJobs.length,
  };
}
