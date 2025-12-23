"use client";

import type { TranscriptionJob } from "@/lib/drizzle/schema/transcription-jobs";
import { useJobsSync } from "./hooks/useJobsSync";
import { useJobsActions } from "./hooks/useJobsActions";
import UploadZone from "./UploadZone";
import InProgressJobsList from "./InProgressJobsList";
import CompletedJobsList from "./CompletedJobsList";

interface TranscriptsPageClientProps {
  initialInProgressJobs: TranscriptionJob[];
  initialCompletedJobs: TranscriptionJob[];
  hasMoreCompleted: boolean;
  realtimeToken?: string;
}

export default function TranscriptsPageClient({
  initialInProgressJobs,
  initialCompletedJobs,
  hasMoreCompleted,
  realtimeToken,
}: TranscriptsPageClientProps) {
  // State synchronization hook
  const { inProgressJobs, completedJobs, addJob, completeJob, deleteJob } =
    useJobsSync({
      initialInProgressJobs,
      initialCompletedJobs,
    });

  // Action handlers hook
  const { handleJobComplete, handleJobDeleted, handleJobCreated } =
    useJobsActions({
      onJobComplete: completeJob,
      onJobDeleted: deleteJob,
      onJobCreated: addJob,
    });

  // Wrap handleJobComplete to provide jobs context
  const handleJobCompleteWithContext = (jobId: string): void => {
    handleJobComplete(jobId, inProgressJobs);
  };

  return (
    <div className="space-y-12">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Transcriptions</h1>
        <p className="text-muted-foreground">
          Upload audio or video files to generate accurate transcriptions with
          timestamps
        </p>
      </div>

      {/* Upload Section */}
      <section>
        <UploadZone onJobCreated={handleJobCreated} />
      </section>

      {/* In Progress Jobs Section */}
      <section>
        <InProgressJobsList
          jobs={inProgressJobs}
          realtimeToken={realtimeToken}
          onJobComplete={handleJobCompleteWithContext}
          onJobDeleted={handleJobDeleted}
        />
      </section>

      {/* Completed Jobs Section */}
      <section>
        <CompletedJobsList
          jobs={completedJobs}
          hasMoreInitial={hasMoreCompleted}
          realtimeToken={realtimeToken}
          onJobDeleted={handleJobDeleted}
        />
      </section>
    </div>
  );
}
