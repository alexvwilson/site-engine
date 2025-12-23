"use client";

import React, { useState } from "react";
import {
  CircleCheck,
  AlertCircle,
  Loader2,
  Trash2,
  RotateCcw,
  Hourglass,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  JOB_STATUSES,
  isCompletedStatus,
  isFailedStatus,
  isActiveStatus,
} from "@/lib/transcription-constants";
import { retryJob } from "@/app/actions/transcriptions";
import type { TranscriptionJob } from "@/lib/drizzle/schema/transcription-jobs";
import { JobProgress } from "./JobProgress";
import { formatProcessingDuration } from "@/lib/format-utils-client";
import { ElapsedTimeTimer } from "./ElapsedTimeTimer";

interface JobListItemProps {
  job: TranscriptionJob;
  realtimeToken?: string;
  onJobComplete?: (jobId: string) => void;
  onJobDeleted?: (jobId: string) => void;
}

function JobListItem({
  job,
  realtimeToken,
  onJobComplete,
  onJobDeleted,
}: JobListItemProps): React.ReactElement {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [realtimeProgress, setRealtimeProgress] = useState<number | null>(null);
  const [currentStatus, setCurrentStatus] = useState<string | null>(null);

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };


  // Handle delete (used for both Delete and Cancel)
  const handleDelete = async (): Promise<void> => {
    setError(null);
    setIsDeleting(true);
    setShowDeleteDialog(false);

    try {
      // Parent component handles the actual deletion via server action
      // We just notify them that delete was requested
      if (onJobDeleted) {
        await onJobDeleted(job.id);
      }
    } catch (err) {
      console.error("Error deleting job:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete job. Please try again."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle retry
  const handleRetry = async (): Promise<void> => {
    setError(null);
    setIsRetrying(true);

    try {
      const result = await retryJob(job.id);

      if (!result.success) {
        throw new Error(result.error || "Failed to retry job");
      }
    } catch (err) {
      console.error("Error retrying job:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to retry job. Please try again."
      );
    } finally {
      setIsRetrying(false);
    }
  };

  // Render completed layout
  const renderCompletedLayout = (): React.ReactElement => {
    return (
      <div className="rounded-xl border bg-card px-6 py-5 relative">
        {/* Loading overlay when deleting */}
        {isDeleting && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-xl z-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}

        <div className={isDeleting ? "opacity-50 pointer-events-none" : ""}>
          <div className="flex items-center justify-between gap-4">
            {/* Left: Icon + Info */}
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <CircleCheck className="h-6 w-6  shrink-0" />
              <div className="min-w-0 flex-1 space-y-1">
                <h3 className="font-medium truncate">{job.file_name}</h3>
                <div className="flex items-center gap-3">
                  <p className="text-sm text-muted-foreground">
                    Date: {new Date(job.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Processing time: {formatProcessingDuration(job.created_at, job.completed_at) || "Unknown"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Size: {formatFileSize(job.file_size_bytes)}
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Delete Icon + View Button */}
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowDeleteDialog(true)}
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button asChild>
                <Link href={`/transcripts/${job.id}`}>View Transcript</Link>
              </Button>
            </div>
          </div>

          {/* Error from actions */}
          {error && (
            <div className="mt-3 rounded-md bg-destructive/10 p-2">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render in-progress layout (pending/processing)
  const renderInProgressLayout = (): React.ReactElement => {
    // Calculate display values
    const displayProgress = realtimeProgress ?? job.progress_percentage ?? 0;
    const displayStatus =
      currentStatus ?? (job.status === JOB_STATUSES.PENDING ? "Queued" : "Processing");

    return (
      <div className="rounded-xl border bg-card px-6 py-5 relative">
        {/* Loading overlay when deleting */}
        {isDeleting && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-xl z-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}

        <div className={isDeleting ? "opacity-50 pointer-events-none" : ""}>
          <div className="space-y-3">
            {/* Grid layout: Icon (2 rows) | Content (2 rows) | Cancel (2 rows) */}
            <div className="grid grid-cols-[auto_1fr_auto] gap-x-3 gap-y-2">
              {/* Left: Hourglass icon spanning 2 rows */}
              <div className="row-span-2 flex items-center">
                <Hourglass className="h-6 w-6 shrink-0" />
              </div>

              {/* First row: Filename + (Status) */}
              <div className="flex items-center gap-2 min-w-0">
                <h3 className="font-medium truncate max-w-[250px]">
                  {job.file_name}
                </h3>
                <Badge variant="secondary" className="shrink-0">
                  {displayStatus}
                </Badge>
              </div>

              {/* Right: Cancel button spanning 2 rows */}
              <div className="row-span-2 flex items-center">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
              </div>

              {/* Second row: Progress bar + Percentage + Timer */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex-1 min-w-0">
                  {job.trigger_job_id && realtimeToken ? (
                    <JobProgress
                      runId={job.trigger_job_id}
                      accessToken={realtimeToken}
                      jobId={job.id}
                      variant="simple"
                      onProgress={(progress, status) => {
                        setRealtimeProgress(progress);
                        setCurrentStatus(status);
                      }}
                      onComplete={() => {
                        onJobComplete?.(job.id);
                      }}
                    />
                  ) : (
                    <Progress value={displayProgress} />
                  )}
                </div>
                <span className="text-sm font-medium text-muted-foreground shrink-0">
                  {displayProgress}%
                </span>
                <ElapsedTimeTimer
                  startTime={job.created_at}
                  status={job.status}
                />
              </div>
            </div>

            {/* Error from actions */}
            {error && (
              <div className="rounded-md bg-destructive/10 p-2">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render failed layout
  const renderFailedLayout = (): React.ReactElement => {
    return (
      <div className="rounded-xl border bg-card px-6 py-5 relative">
        {/* Loading overlay when deleting */}
        {isDeleting && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-xl z-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}

        <div className={isDeleting ? "opacity-50 pointer-events-none" : ""}>
          <div className="space-y-3">
            {/* Top row: Icon + Name + Buttons */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <AlertCircle className="h-6 w-6 text-destructive shrink-0" />
                <h3 className="font-medium truncate">{job.file_name}</h3>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  onClick={handleRetry}
                  disabled={isRetrying || isDeleting}
                >
                  {isRetrying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Retrying...
                    </>
                  ) : (
                    <>
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Retry
                    </>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={isDeleting || isRetrying}
                >
                  Cancel
                </Button>
              </div>
            </div>

            {/* Error message from job */}
            {job.error_message && (
              <div className="rounded-md bg-destructive/10 p-2">
                <p className="text-sm text-destructive">{job.error_message}</p>
              </div>
            )}

            {/* Error from actions */}
            {error && (
              <div className="rounded-md bg-destructive/10 p-2">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Render appropriate layout based on status */}
      {isCompletedStatus(job.status) && renderCompletedLayout()}
      {isFailedStatus(job.status) && renderFailedLayout()}
      {(isActiveStatus(job.status) || job.status === JOB_STATUSES.CANCELLED) &&
        renderInProgressLayout()}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isCompletedStatus(job.status) ? "Delete" : "Cancel"} Transcription
              Job?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{job.file_name}&quot; and all
              associated files. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              {isCompletedStatus(job.status) ? "Keep" : "Keep Processing"}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// Memoize to prevent unnecessary re-renders when parent re-renders
export default React.memo(JobListItem);
