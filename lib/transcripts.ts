/**
 * Transcript Data Access Functions
 *
 * Server-side operations for fetching transcript data with related entities.
 * Handles complex JOIN queries and ownership verification.
 *
 * This file contains server-only operations and should not be imported by client components.
 */

import { eq, and } from "drizzle-orm";
import { logger } from "@/lib/logger";
import { db } from "@/lib/drizzle/db";
import { transcripts, type Transcript } from "@/lib/drizzle/schema/transcripts";
import {
  aiSummaries,
  type AiSummary,
} from "@/lib/drizzle/schema/ai-summaries";
import {
  transcriptionJobs,
  type TranscriptionJob,
} from "@/lib/drizzle/schema/transcription-jobs";

/**
 * Combined transcript data with related entities
 */
export interface TranscriptWithRelations {
  transcript: Transcript;
  job: TranscriptionJob;
  summary: AiSummary | null;
}

/**
 * Get transcript with job and AI summary data
 * Performs JOIN across transcripts, transcription_jobs, and ai_summaries tables
 * Validates user ownership
 *
 * @param jobId - Transcription job ID (used as route parameter)
 * @param userId - User ID for ownership verification
 * @returns Combined transcript data or null if not found/unauthorized
 */
export async function getTranscriptByJobId(
  jobId: string,
  userId: string,
): Promise<TranscriptWithRelations | null> {
  try {
    const result = await db
      .select({
        transcript: transcripts,
        job: transcriptionJobs,
        summary: aiSummaries,
      })
      .from(transcripts)
      .innerJoin(transcriptionJobs, eq(transcripts.job_id, transcriptionJobs.id))
      .leftJoin(aiSummaries, eq(transcripts.id, aiSummaries.transcript_id))
      .where(
        and(
          eq(transcripts.job_id, jobId),
          eq(transcripts.user_id, userId),
        ),
      )
      .limit(1);

    return result[0] || null;
  } catch (error) {
    logger.error("Error fetching transcript by job ID:", error);
    throw new Error("Failed to fetch transcript");
  }
}

/**
 * Get transcript by transcript ID (alternative lookup method)
 * Used when transcript ID is known directly
 *
 * @param transcriptId - Transcript ID
 * @param userId - User ID for ownership verification
 * @returns Combined transcript data or null if not found/unauthorized
 */
export async function getTranscriptById(
  transcriptId: string,
  userId: string,
): Promise<TranscriptWithRelations | null> {
  try {
    const result = await db
      .select({
        transcript: transcripts,
        job: transcriptionJobs,
        summary: aiSummaries,
      })
      .from(transcripts)
      .innerJoin(transcriptionJobs, eq(transcripts.job_id, transcriptionJobs.id))
      .leftJoin(aiSummaries, eq(transcripts.id, aiSummaries.transcript_id))
      .where(
        and(
          eq(transcripts.id, transcriptId),
          eq(transcripts.user_id, userId),
        ),
      )
      .limit(1);

    return result[0] || null;
  } catch (error) {
    logger.error("Error fetching transcript by ID:", error);
    throw new Error("Failed to fetch transcript");
  }
}

/**
 * Check if AI summary exists for a transcript
 * Used for polling to detect when summary generation completes
 *
 * @param transcriptId - Transcript ID
 * @param userId - User ID for ownership verification
 * @returns AI summary or null if not yet generated
 */
export async function getAISummary(
  transcriptId: string,
  userId: string,
): Promise<AiSummary | null> {
  try {
    const [result] = await db
      .select()
      .from(aiSummaries)
      .innerJoin(transcripts, eq(aiSummaries.transcript_id, transcripts.id))
      .where(
        and(
          eq(aiSummaries.transcript_id, transcriptId),
          eq(transcripts.user_id, userId),
        ),
      )
      .limit(1);

    return result?.ai_summaries || null;
  } catch (error) {
    logger.error("Error fetching AI summary:", error);
    throw new Error("Failed to fetch AI summary");
  }
}
