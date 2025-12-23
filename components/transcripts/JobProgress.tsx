"use client";

/**
 * Job Progress Component
 *
 * Real-time progress tracking for transcription jobs using Trigger.dev Realtime SDK.
 * Shows current status, progress percentage, and current processing step.
 * No database polling - updates stream directly from Trigger.dev!
 */

import { useRealtimeRun } from "@trigger.dev/react-hooks";
import { Progress } from "@/components/ui/progress";
import { Loader2, XCircle, Clock } from "lucide-react";
import { useEffect } from "react";

export interface JobProgressProps {
  runId: string; // Trigger.dev run ID
  accessToken: string; // Public access token from getTriggerRealtimeToken()
  jobId: string; // Database job ID (not used internally, but kept for future reference)
  onComplete?: () => void; // Callback when job completes
  onProgress?: (progress: number, status: string) => void; // Callback for progress updates
  variant?: "simple" | "detailed"; // Display variant: simple shows just progress bar, detailed shows step info
  disabled?: boolean; // Disable real-time queries (e.g., during deletion)
}

export function JobProgress({
  runId,
  accessToken,
  onComplete,
  onProgress,
  variant = "detailed",
  disabled = false,
}: JobProgressProps) {
  // Subscribe to real-time updates from Trigger.dev
  const { run, error } = useRealtimeRun(runId, {
    accessToken,
    enabled: !!runId && !!accessToken && !disabled,
    // Don't use onComplete callback - it fires prematurely
    // Instead, we'll check status in useEffect
  });

  // Extract progress metadata
  const progress = (run?.metadata?.progress as number) || 0;
  const currentStep = (run?.metadata?.currentStep as string) || "Starting...";
  const errorMessage = run?.metadata?.error as string | undefined;

  // Determine status
  const isCompleted = run?.status === "COMPLETED";
  const isFailed = run?.status === "FAILED" || !!errorMessage;
  const isPending = !run || run.status === "QUEUED";

  // Call onProgress callback when progress updates
  useEffect(() => {
    if (onProgress && !isCompleted && !isFailed) {
      onProgress(progress, currentStep);
    }
  }, [progress, currentStep, onProgress, isCompleted, isFailed]);

  // Call onComplete callback ONLY when status is truly COMPLETED
  useEffect(() => {
    if (run?.status === "COMPLETED" && onComplete) {
      onComplete();
    }
  }, [run?.status, onComplete, runId]);

  // Error state
  if (error) {
    return (
      <div className="flex items-center gap-2 text-sm text-destructive">
        <XCircle className="h-4 w-4" />
        <span>Failed to connect to job status</span>
      </div>
    );
  }

  // Completed state - trigger callback and let parent handle display
  if (isCompleted) {
    // Callback already triggered by onComplete in useRealtimeRun config
    // Return null so parent can show the button immediately
    return null;
  }

  // Failed state
  if (isFailed) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-destructive">
          <XCircle className="h-4 w-4" />
          <span>Processing failed</span>
        </div>
        {errorMessage && (
          <p className="text-xs text-muted-foreground">{errorMessage}</p>
        )}
      </div>
    );
  }

  // Pending state
  if (isPending) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Clock className="h-4 w-4 animate-pulse" />
        <span>Queued for processing...</span>
      </div>
    );
  }

  // Processing state (default)
  // Simple variant: just progress bar (no percentage below)
  if (variant === "simple") {
    return <Progress value={progress} />;
  }

  // Detailed variant: progress bar + current step
  return (
    <div className="space-y-3">
      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Processing</span>
          <span className="font-medium">{progress}%</span>
        </div>
        <Progress value={progress} />
      </div>

      {/* Current step */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>{currentStep}</span>
      </div>
    </div>
  );
}
