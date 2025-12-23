"use client";

import React, { useState, useMemo } from "react";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { JOB_STATUS_CATEGORIES } from "@/lib/transcription-constants";
import JobListItem from "./JobListItem";
import { useJobsPagination } from "./hooks/useJobsPagination";
import type { TranscriptionJob } from "@/lib/drizzle/schema/transcription-jobs";

interface InProgressJobsListProps {
  jobs: TranscriptionJob[];
  realtimeToken?: string;
  onJobComplete?: (jobId: string) => void;
  onJobDeleted?: (jobId: string) => void;
}

type SortOrder = "newest" | "oldest";

export default function InProgressJobsList({
  jobs,
  realtimeToken,
  onJobComplete,
  onJobDeleted,
}: InProgressJobsListProps): React.ReactElement | null {
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");

  // Filter jobs to only in-progress statuses
  const inProgressJobs = useMemo(() => {
    const filtered = jobs.filter((job) =>
      JOB_STATUS_CATEGORIES.IN_PROGRESS.includes(
        job.status as (typeof JOB_STATUS_CATEGORIES.IN_PROGRESS)[number],
      ),
    );
    return filtered;
  }, [jobs]);

  // Apply sorting
  const sortedJobs = useMemo(() => {
    const sorted = [...inProgressJobs].sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    return sorted;
  }, [inProgressJobs, sortOrder]);

  // Use pagination hook
  const { visibleJobs, hasMore, loadMore, totalCount } = useJobsPagination(
    sortedJobs
  );

  // Don't render section if there are no in-progress jobs
  if (inProgressJobs.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">In Progress ({inProgressJobs.length})</h2>
          <p className="text-sm text-muted-foreground">
            {totalCount} job{totalCount === 1 ? "" : "s"}
          </p>
        </div>

        {/* Sort Order */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          <Label htmlFor="in-progress-sort-order" className="sr-only">
            Sort order
          </Label>
          <Select
            value={sortOrder}
            onValueChange={(value) => setSortOrder(value as SortOrder)}
          >
            <SelectTrigger id="in-progress-sort-order" className="w-[120px]">
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
        {visibleJobs.map((job) => (
          <JobListItem
            key={job.id}
            job={job}
            realtimeToken={realtimeToken}
            onJobComplete={onJobComplete}
            onJobDeleted={onJobDeleted}
          />
        ))}

        {/* Load More Button */}
        {hasMore && (
          <div className="flex justify-center pt-4">
            <Button variant="outline" onClick={loadMore}>
              Load More ({totalCount - visibleJobs.length} remaining)
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
