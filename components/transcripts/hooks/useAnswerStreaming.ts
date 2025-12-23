import { useState, useEffect, type Dispatch, type SetStateAction } from "react";
import { toast } from "sonner";
import { useRealtimeRunWithStreams } from "@trigger.dev/react-hooks";
import {
  createTranscriptConversation,
  askTranscriptQuestion,
} from "@/app/actions/transcript-qa";
import { getTriggerRealtimeToken } from "@/app/actions/transcriptions";
import type {
  answerTranscriptQuestion,
  ANSWER_STREAMS,
} from "@/trigger/tasks/answer-transcript-question";
import type { ConversationWithMessages } from "@/lib/transcript-conversations";

interface UseAnswerStreamingParams {
  transcriptId: string;
  activeConversationId: string | null;
  onConversationCreated: () => Promise<void>;
  onAnswerCompleted: (conversationId: string) => Promise<void>;
  setActiveConversationId: (id: string) => void;
  setCurrentConversation: Dispatch<SetStateAction<ConversationWithMessages | null>>;
}

interface UseAnswerStreamingReturn {
  isStreaming: boolean;
  currentStreamedAnswer: string;
  handleAskQuestion: (question: string) => Promise<void>;
  handleNewConversation: (question: string) => Promise<void>;
}

/**
 * Hook for managing AI answer streaming via Trigger.dev
 * Handles new conversations, asking questions, and real-time streaming
 */
export function useAnswerStreaming({
  transcriptId,
  activeConversationId,
  onConversationCreated,
  onAnswerCompleted,
  setActiveConversationId,
  setCurrentConversation,
}: UseAnswerStreamingParams): UseAnswerStreamingReturn {
  const [runId, setRunId] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  const { run, streams, error: streamError } = useRealtimeRunWithStreams<
    typeof answerTranscriptQuestion,
    ANSWER_STREAMS
  >(runId || "", {
    accessToken: accessToken || undefined,
    enabled: !!runId && !!accessToken && isStreaming,
  });

  // Handle stream errors (suppress AbortError when navigating away)
  useEffect(() => {
    if (streamError && streamError.name !== "AbortError") {
      console.error("Stream error:", streamError);
      toast.error(
        "Failed to stream response. The generation continues in the background."
      );
    }
  }, [streamError]);

  const buildStreamedAnswer = (): string => {
    if (!streams.answer) return "";

    return streams.answer
      .map((chunk) => {
        return chunk.choices
          .map((choice) => choice.delta?.content || "")
          .join("");
      })
      .join("");
  };

  const currentStreamedAnswer = buildStreamedAnswer();

  // Monitor run status and handle completion
  useEffect(() => {
    if (!run || !isStreaming) return;

    let mounted = true;

    if (run.status === "COMPLETED" && mounted) {
      setIsStreaming(false);
      if (activeConversationId) {
        onAnswerCompleted(activeConversationId);
      }
    }

    if (run.status === "FAILED" && mounted) {
      setIsStreaming(false);
      toast.error("Failed to get answer. Please try again.");
    }

    // Cleanup: Prevent state updates after unmount
    // Note: The "BodyStreamBuffer was aborted" error when navigating away is expected behavior
    // from useRealtimeRunWithStreams. The Trigger.dev job continues running in the background.
    return () => {
      mounted = false;
    };
  }, [run, isStreaming, activeConversationId, onAnswerCompleted]);

  const handleNewConversation = async (question: string): Promise<void> => {
    // Fetch access token BEFORE setting streaming state to avoid race conditions
    const token = await getTriggerRealtimeToken();
    if (token) {
      setAccessToken(token);
    }

    setIsStreaming(true);

    const result = await createTranscriptConversation(transcriptId, question);

    if (result.success && result.conversationId && result.runId && result.userMessage) {
      setRunId(result.runId);
      setActiveConversationId(result.conversationId);

      // Reload conversations list to get the new conversation
      await onConversationCreated();

      // Set current conversation with the user message
      // We'll get the full conversation details after onConversationCreated runs
      toast.success("New conversation started!");
    } else {
      setIsStreaming(false);
      toast.error(result.error || "Failed to create conversation");
    }
  };

  const handleAskQuestion = async (question: string): Promise<void> => {
    if (!activeConversationId) {
      await handleNewConversation(question);
      return;
    }

    // Fetch access token BEFORE setting streaming state to avoid race conditions
    const token = await getTriggerRealtimeToken();
    if (token) {
      setAccessToken(token);
    }

    setIsStreaming(true);

    const result = await askTranscriptQuestion(
      activeConversationId,
      question,
      transcriptId
    );

    if (result.success && result.runId && result.userMessage) {
      setRunId(result.runId);

      // Add user message optimistically to current conversation
      setCurrentConversation((prev: ConversationWithMessages | null) => {
        if (!prev) return prev;
        return {
          ...prev,
          messages: [...prev.messages, result.userMessage!],
        };
      });
    } else {
      setIsStreaming(false);
      toast.error(result.error || "Failed to ask question");
    }
  };

  return {
    isStreaming,
    currentStreamedAnswer,
    handleAskQuestion,
    handleNewConversation,
  };
}
