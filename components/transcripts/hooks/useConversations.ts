import { useState, useEffect, useCallback, type Dispatch, type SetStateAction } from "react";
import { type TranscriptConversation } from "@/lib/drizzle/schema";
import type { ConversationWithMessages } from "@/lib/transcript-conversations";
import {
  listTranscriptConversations,
  getTranscriptConversation,
} from "@/app/actions/transcript-qa";

interface UseConversationsReturn {
  conversations: TranscriptConversation[];
  activeConversationId: string | null;
  currentConversation: ConversationWithMessages | null;
  isLoading: boolean;
  isLoadingConversation: boolean;
  setActiveConversationId: (id: string | null) => void;
  setCurrentConversation: Dispatch<SetStateAction<ConversationWithMessages | null>>;
  loadConversations: () => Promise<void>;
  loadConversation: (conversationId: string) => Promise<void>;
}

/**
 * Hook for managing transcript conversations
 * Handles conversation list loading, active conversation selection, and conversation details
 */
export function useConversations(
  transcriptId: string
): UseConversationsReturn {
  const [conversations, setConversations] = useState<TranscriptConversation[]>(
    []
  );
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [currentConversation, setCurrentConversation] =
    useState<ConversationWithMessages | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  const loadConversations = useCallback(async (): Promise<void> => {
    const result = await listTranscriptConversations(transcriptId);
    if (result.success && result.conversations) {
      setConversations(result.conversations);

      // Only auto-select first conversation on initial load, not when user clicks "New"
      if (result.conversations.length > 0 && !activeConversationId && !hasInitialized) {
        setActiveConversationId(result.conversations[0].id);
      }
    }
    setIsLoading(false);
    setHasInitialized(true);
  }, [transcriptId, activeConversationId, hasInitialized]);

  const loadConversation = useCallback(async (conversationId: string): Promise<void> => {
    setIsLoadingConversation(true);
    setCurrentConversation(null);

    const result = await getTranscriptConversation(conversationId);
    if (result.success && result.conversation) {
      setCurrentConversation(result.conversation);
    }

    setIsLoadingConversation(false);
  }, []);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Load conversation details when active conversation changes
  useEffect(() => {
    if (activeConversationId) {
      loadConversation(activeConversationId);
    } else {
      // Clear current conversation when starting a new one
      setCurrentConversation(null);
      setIsLoadingConversation(false);
    }
  }, [activeConversationId, loadConversation]);

  return {
    conversations,
    activeConversationId,
    currentConversation,
    isLoading,
    isLoadingConversation,
    setActiveConversationId,
    setCurrentConversation,
    loadConversations,
    loadConversation,
  };
}
