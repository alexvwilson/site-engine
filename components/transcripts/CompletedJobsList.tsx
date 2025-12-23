"use client";

import React, { useState, useMemo } from "react";
import { ArrowUpDown, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { JOBS_PER_PAGE } from "@/lib/transcription-constants";
import JobListItem from "./JobListItem";
import { loadMoreCompletedJobs } from "@/app/actions/transcriptions";
import type { TranscriptionJob } from "@/lib/drizzle/schema/transcription-jobs";

interface CompletedJobsListProps {
  jobs: TranscriptionJob[]; // Direct prop from parent (renamed from initialJobs)
  hasMoreInitial: boolean;
  realtimeToken?: string;
  onJobDeleted?: (jobId: string) => void;
}

type SortOrder = "newest" | "oldest";

export default function CompletedJobsList({
  jobs,
  hasMoreInitial,
  realtimeToken,
  onJobDeleted,
}: CompletedJobsListProps): React.ReactElement {
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  // Only track ADDITIONAL jobs loaded via "load more" button
  const [additionalJobs, setAdditionalJobs] = useState<TranscriptionJob[]>([]);
  const [hasMore, setHasMore] = useState(hasMoreInitial);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Wrapper function to handle job deletion
  const handleJobDeleted = (jobId: string): void => {
    // Remove from additional jobs if present
    setAdditionalJobs((prev) => prev.filter((job) => job.id !== jobId));

    // Notify parent (parent will handle removing from its state)
    if (onJobDeleted) {
      onJobDeleted(jobId);
    }
  };

  // Combine jobs from parent + additional loaded jobs
  // Use Map to deduplicate by ID (prevents duplicate keys)
  const allJobs = useMemo(() => {
    const jobsMap = new Map<string, TranscriptionJob>();

    // Add all jobs (props first, then additional)
    // If there are duplicates, props wins (latest data from parent)
    [...jobs, ...additionalJobs].forEach((job) => {
      jobsMap.set(job.id, job);
    });

    return Array.from(jobsMap.values());
  }, [jobs, additionalJobs]);

  // Apply sorting to combined jobs
  const sortedJobs = useMemo(() => {
    return [...allJobs].sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });
  }, [allJobs, sortOrder]);

  // Handle loading more jobs from server
  const handleLoadMore = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Use allJobs length for offset (combined count)
      const result = await loadMoreCompletedJobs(allJobs.length, JOBS_PER_PAGE);

      if (result.success && result.jobs) {
        // Add to additional jobs (will be combined with props via allJobs)
        setAdditionalJobs((prev) => [...prev, ...result.jobs!]);
        setHasMore(result.hasMore ?? false);
      } else {
        setError(result.error ?? "Failed to load more jobs");
      }
    } catch {
      setError("Failed to load more jobs. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Empty state when no completed jobs
  if (allJobs.length === 0) {
    return (
      <div className="rounded-xl border border-dashed bg-muted/50 px-6 py-12">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="rounded-full bg-background p-3 mb-4">
            <CheckCircle2 className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No Completed Jobs Yet</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Your finished transcriptions will appear here. Start by uploading a file above.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Completed ({allJobs.length})</h2>
          <p className="text-sm text-muted-foreground">
            {allJobs.length} job{allJobs.length === 1 ? "" : "s"}
            {hasMore && " • More available"}
          </p>
        </div>

        {/* Sort Order */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          <Label htmlFor="completed-sort-order" className="sr-only">
            Sort order
          </Label>
          <Select
            value={sortOrder}
            onValueChange={(value) => setSortOrder(value as SortOrder)}
          >
            <SelectTrigger id="completed-sort-order" className="w-[120px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Jobs List */}
      <div className="space-y-3">
        {sortedJobs.map((job) => (
          <JobListItem
            key={job.id}
            job={job}
            realtimeToken={realtimeToken}
            onJobDeleted={handleJobDeleted}
          />
        ))}

        {/* Load More Button */}
        {hasMore && (
          <div className="flex flex-col items-center gap-2 pt-4">
            <Button
              variant="outline"
              onClick={handleLoadMore}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                "Load More"
              )}
            </Button>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
