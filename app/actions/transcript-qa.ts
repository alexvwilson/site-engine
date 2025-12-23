"use server";
import { logger } from "@/lib/logger";

import { tasks } from "@trigger.dev/sdk";
import type { answerTranscriptQuestion } from "@/trigger/tasks/answer-transcript-question";
import { requireUserId } from "@/lib/auth";
import { db } from "@/lib/drizzle/db";
import {
  transcriptConversations,
  transcriptMessages,
  type TranscriptConversation,
  type TranscriptMessage,
} from "@/lib/drizzle/schema";
import {
  getConversationWithMessages,
  listConversationsForTranscript,
  checkConversationOwnership,
  generateConversationTitle,
  type ConversationWithMessages,
} from "@/lib/transcript-conversations";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createTranscriptConversation(
  transcriptId: string,
  firstQuestion: string,
): Promise<{
  success: boolean;
  conversationId?: string;
  runId?: string;
  userMessage?: TranscriptMessage;
  error?: string;
}> {
  try {
    const userId = await requireUserId();

    const title = generateConversationTitle(firstQuestion);

    const [conversation] = await db
      .insert(transcriptConversations)
      .values({
        transcript_id: transcriptId,
        user_id: userId,
        title,
      })
      .returning();

    const [userMessage] = await db
      .insert(transcriptMessages)
      .values({
        transcript_conversation_id: conversation.id,
        sender: "user",
        content: firstQuestion,
        status: "success",
      })
      .returning();

    const handle = await tasks.trigger<typeof answerTranscriptQuestion>(
      "answer-transcript-question",
      {
        conversationId: conversation.id,
        transcriptId,
        userMessageId: userMessage.id,
        question: firstQuestion,
      },
      {
        tags: [`user:${userId}`], // User scoping for token-level security
      }
    );

    revalidatePath(`/transcripts/${transcriptId}`);

    return {
      success: true,
      conversationId: conversation.id,
      runId: handle.id,
      userMessage,
    };
  } catch (error) {
    logger.error("Error creating transcript conversation:", error);
    return {
      success: false,
      error: "Failed to create conversation",
    };
  }
}

export async function askTranscriptQuestion(
  conversationId: string,
  question: string,
  transcriptId: string,
): Promise<{
  success: boolean;
  runId?: string;
  userMessage?: TranscriptMessage;
  error?: string;
}> {
  try {
    const userId = await requireUserId();

    const hasOwnership = await checkConversationOwnership(
      conversationId,
      userId,
    );

    if (!hasOwnership) {
      return {
        success: false,
        error: "Conversation not found or access denied",
      };
    }

    const [userMessage] = await db
      .insert(transcriptMessages)
      .values({
        transcript_conversation_id: conversationId,
        sender: "user",
        content: question,
        status: "success",
      })
      .returning();

    await db
      .update(transcriptConversations)
      .set({ updated_at: new Date() })
      .where(eq(transcriptConversations.id, conversationId));

    const handle = await tasks.trigger<typeof answerTranscriptQuestion>(
      "answer-transcript-question",
      {
        conversationId,
        transcriptId,
        userMessageId: userMessage.id,
        question,
      },
      {
        tags: [`user:${userId}`], // User scoping for token-level security
      }
    );

    revalidatePath(`/transcripts/${transcriptId}`);

    return { success: true, runId: handle.id, userMessage };
  } catch (error) {
    logger.error("Error asking transcript question:", error);
    return { success: false, error: "Failed to process question" };
  }
}

export async function getTranscriptConversation(
  conversationId: string,
): Promise<{
  success: boolean;
  conversation?: ConversationWithMessages;
  error?: string;
}> {
  try {
    const userId = await requireUserId();

    const conversation = await getConversationWithMessages(
      conversationId,
      userId,
    );

    if (!conversation) {
      return {
        success: false,
        error: "Conversation not found or access denied",
      };
    }

    return { success: true, conversation };
  } catch (error) {
    logger.error("Error fetching conversation:", error);
    return { success: false, error: "Failed to fetch conversation" };
  }
}

export async function listTranscriptConversations(
  transcriptId: string,
): Promise<{
  success: boolean;
  conversations?: TranscriptConversation[];
  error?: string;
}> {
  try {
    const userId = await requireUserId();

    const conversations = await listConversationsForTranscript(
      transcriptId,
      userId,
    );

    return { success: true, conversations };
  } catch (error) {
    logger.error("Error listing conversations:", error);
    return { success: false, error: "Failed to list conversations" };
  }
}

export async function deleteTranscriptConversation(
  conversationId: string,
  transcriptId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const userId = await requireUserId();

    const hasOwnership = await checkConversationOwnership(
      conversationId,
      userId,
    );

    if (!hasOwnership) {
      return {
        success: false,
        error: "Conversation not found or access denied",
      };
    }

    await db
      .delete(transcriptConversations)
      .where(
        and(
          eq(transcriptConversations.id, conversationId),
          eq(transcriptConversations.user_id, userId),
        ),
      );

    revalidatePath(`/transcripts/${transcriptId}`);

    return { success: true };
  } catch (error) {
    logger.error("Error deleting conversation:", error);
    return { success: false, error: "Failed to delete conversation" };
  }
}
