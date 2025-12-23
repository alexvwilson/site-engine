/**
 * Answer Transcript Question Task
 *
 * Streams GPT-4.1 responses to user questions about transcripts:
 * 1. Fetches transcript data from database
 * 2. Builds context with transcript text and segment timestamps
 * 3. Streams GPT-4.1 response in real-time via Trigger.dev streams
 * 4. Saves assistant message to transcript_messages table
 */

import { logger, task, streams } from "@trigger.dev/sdk";
import { openai } from "../utils/openai";
import { buildTranscriptContext } from "../utils/transcript-context";
import { db } from "@/lib/drizzle/db";
import { transcriptMessages, transcripts } from "@/lib/drizzle/schema";
import { eq } from "drizzle-orm";
import type OpenAI from "openai";

export interface AnswerTranscriptQuestionPayload {
  conversationId: string;
  transcriptId: string;
  userMessageId: string;
  question: string;
}

export type ANSWER_STREAMS = {
  answer: OpenAI.ChatCompletionChunk;
};

export const answerTranscriptQuestion = task({
  id: "answer-transcript-question",
  run: async (payload: AnswerTranscriptQuestionPayload) => {
    const { conversationId, transcriptId, userMessageId, question } = payload;

    logger.info("Starting transcript Q&A", {
      conversationId,
      transcriptId,
      userMessageId,
      questionLength: question.length,
    });

    try {
      const transcriptResult = await db
        .select({
          transcript_text_plain: transcripts.transcript_text_plain,
          transcript_json: transcripts.transcript_json,
          detected_language: transcripts.detected_language,
          duration_seconds: transcripts.duration_seconds,
        })
        .from(transcripts)
        .where(eq(transcripts.id, transcriptId))
        .limit(1);

      if (transcriptResult.length === 0) {
        throw new Error("Transcript not found");
      }

      const transcript = transcriptResult[0];

      const transcriptJson = transcript.transcript_json as {
        segments?: Array<{ start: number; end: number; text: string }>;
      } | null;
      const segments = transcriptJson?.segments || [];
      const context = buildTranscriptContext(
        transcript.transcript_text_plain,
        segments
      );

      logger.info("Built transcript context", {
        segmentCount: segments.length,
        contextLength: context.length,
      });

      const completion = await openai.chat.completions.create({
        model: "gpt-4.1",
        messages: [
          {
            role: "system",
            content: `You are an AI assistant helping users understand their transcripts.
Answer questions based on the transcript content provided.
When relevant, reference specific timestamps using the format [MM:SS].
Be concise but thorough in your answers.`,
          },
          {
            role: "user",
            content: `${context}\n\nQuestion: ${question}`,
          },
        ],
        stream: true,
      });

      const { stream } = await streams.pipe("answer", completion);
      let fullAnswer = "";

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        fullAnswer += content;
      }

      logger.info("Completed streaming response", {
        answerLength: fullAnswer.length,
      });

      await db.insert(transcriptMessages).values({
        transcript_conversation_id: conversationId,
        sender: "assistant",
        content: fullAnswer,
        status: "success",
      });

      logger.info("Saved assistant message to database");

      return { success: true, answer: fullAnswer };
    } catch (error) {
      logger.error("Error answering transcript question", { error });

      await db.insert(transcriptMessages).values({
        transcript_conversation_id: conversationId,
        sender: "assistant",
        content:
          "I apologize, but I encountered an error processing your question. Please try again.",
        status: "error",
      });

      throw error;
    }
  },
});
