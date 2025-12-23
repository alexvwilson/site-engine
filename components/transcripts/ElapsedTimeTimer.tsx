"use client";

import React, { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { formatElapsedTime } from "@/lib/format-utils-client";
import { isActiveStatus } from "@/lib/transcription-constants";
import type { JobStatus } from "@/lib/transcription-constants";

interface ElapsedTimeTimerProps {
  /**
   * Start time of the job (when it was created/started)
   */
  startTime: Date | string;
  /**
   * Current job status
   */
  status: JobStatus;
}

/**
 * Real-time elapsed time timer for in-progress jobs
 * Updates every second to show how long a job has been running
 * Shows for both pending and processing jobs
 */
export function ElapsedTimeTimer({
  startTime,
  status,
}: ElapsedTimeTimerProps): React.ReactElement | null {
  const [elapsedTime, setElapsedTime] = useState<string>(() =>
    formatElapsedTime(startTime),
  );

  useEffect(() => {
    // Only run timer for active jobs (pending or processing)
    if (!isActiveStatus(status)) {
      return;
    }

    // Update immediately on mount
    setElapsedTime(formatElapsedTime(startTime));

    // Update every second
    const intervalId = setInterval(() => {
      setElapsedTime(formatElapsedTime(startTime));
    }, 1000);

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [startTime, status]);

  // Only show timer for active jobs (pending or processing)
  if (!isActiveStatus(status)) {
    return null;
  }

  return (
    <span className="flex items-center gap-1.5 text-sm text-muted-foreground shrink-0">
      <Clock className="h-3.5 w-3.5" />
      <span className="font-medium tabular-nums">{elapsedTime}</span>
    </span>
  );
}
