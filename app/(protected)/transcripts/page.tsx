import React from "react";
import { requireUserId } from "@/lib/auth";
import {
  getUserTranscriptionJobs,
  getUserTranscriptionJobsByStatuses,
} from "@/lib/jobs";
import { getTriggerRealtimeToken } from "@/app/actions/transcriptions";
import {
  INITIAL_COMPLETED_JOBS_LIMIT,
  JOB_STATUS_CATEGORIES,
} from "@/lib/transcription-constants";
import TranscriptsPageClient from "@/components/transcripts/TranscriptsPageClient";

export const metadata = {
  title: "Transcriptions",
  description: "Upload and manage your audio and video transcriptions",
};

// Disable caching for this page to ensure fresh data on refresh
export const revalidate = 0;

export default async function TranscriptsPage() {
  // Require authentication
  const userId = await requireUserId();

  // Fetch in-progress jobs (pending, processing, failed, cancelled) in a single query
  // This is more efficient than making 4 separate queries
  const inProgressJobs = await getUserTranscriptionJobsByStatuses(
    userId,
    [...JOB_STATUS_CATEGORIES.IN_PROGRESS],
    100,
  );

  // Fetch only initial batch of completed jobs (server-side pagination)
  const completedJobs = await getUserTranscriptionJobs(userId, {
    status: "completed",
    limit: INITIAL_COMPLETED_JOBS_LIMIT + 1, // Fetch one extra to check if there are more
  });

  // Check if there are more completed jobs
  const hasMoreCompleted = completedJobs.length > INITIAL_COMPLETED_JOBS_LIMIT;
  const initialCompletedJobs = hasMoreCompleted
    ? completedJobs.slice(0, INITIAL_COMPLETED_JOBS_LIMIT)
    : completedJobs;

  // Fetch Trigger.dev realtime token for progress tracking
  let realtimeToken: string | undefined;
  try {
    realtimeToken = await getTriggerRealtimeToken();
  } catch (error) {
    console.error("Failed to fetch realtime token:", error);
    // Continue without realtime updates - will fall back to static progress
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <TranscriptsPageClient
        initialInProgressJobs={inProgressJobs}
        initialCompletedJobs={initialCompletedJobs}
        hasMoreCompleted={hasMoreCompleted}
        realtimeToken={realtimeToken}
      />
    </div>
  );
}
