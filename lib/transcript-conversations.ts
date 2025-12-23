import { db } from "@/lib/drizzle/db";
import {
  transcriptConversations,
  transcriptMessages,
  type TranscriptConversation,
  type TranscriptMessage,
} from "@/lib/drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

export interface ConversationWithMessages extends TranscriptConversation {
  messages: TranscriptMessage[];
}

export async function getConversationWithMessages(
  conversationId: string,
  userId: string,
): Promise<ConversationWithMessages | null> {
  const conversationResult = await db
    .select()
    .from(transcriptConversations)
    .where(
      and(
        eq(transcriptConversations.id, conversationId),
        eq(transcriptConversations.user_id, userId),
      ),
    )
    .limit(1);

  if (conversationResult.length === 0) {
    return null;
  }

  const conversation = conversationResult[0];

  const messages = await db
    .select()
    .from(transcriptMessages)
    .where(eq(transcriptMessages.transcript_conversation_id, conversationId))
    .orderBy(transcriptMessages.created_at);

  return {
    ...conversation,
    messages,
  };
}

export async function listConversationsForTranscript(
  transcriptId: string,
  userId: string,
): Promise<TranscriptConversation[]> {
  const conversations = await db
    .select()
    .from(transcriptConversations)
    .where(
      and(
        eq(transcriptConversations.transcript_id, transcriptId),
        eq(transcriptConversations.user_id, userId),
      ),
    )
    .orderBy(desc(transcriptConversations.updated_at));

  return conversations;
}

export async function checkConversationOwnership(
  conversationId: string,
  userId: string,
): Promise<boolean> {
  const result = await db
    .select({ id: transcriptConversations.id })
    .from(transcriptConversations)
    .where(
      and(
        eq(transcriptConversations.id, conversationId),
        eq(transcriptConversations.user_id, userId),
      ),
    )
    .limit(1);

  return result.length > 0;
}

export function generateConversationTitle(firstQuestion: string): string {
  const maxLength = 60;

  if (firstQuestion.length <= maxLength) {
    return firstQuestion;
  }

  const truncated = firstQuestion.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");

  if (lastSpace > maxLength * 0.7) {
    return truncated.slice(0, lastSpace) + "...";
  }

  return truncated + "...";
}
