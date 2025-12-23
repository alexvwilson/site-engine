"use client";

import { memo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, MessageSquare, Sparkles } from "lucide-react";
import { MessageList } from "./MessageList";
import { QuestionInput } from "./QuestionInput";
import { ConversationList } from "./ConversationList";
import { useConversations } from "./hooks/useConversations";
import { useAnswerStreaming } from "./hooks/useAnswerStreaming";

interface AskScriboPanelProps {
  transcriptId: string;
}

function AskScriboPanelComponent({ transcriptId }: AskScriboPanelProps) {
  // Use custom hooks for state management
  const {
    conversations,
    activeConversationId,
    currentConversation,
    isLoading,
    isLoadingConversation,
    setActiveConversationId,
    setCurrentConversation,
    loadConversations,
    loadConversation,
  } = useConversations(transcriptId);

  const { isStreaming, currentStreamedAnswer, handleAskQuestion } =
    useAnswerStreaming({
      transcriptId,
      activeConversationId,
      onConversationCreated: loadConversations,
      onAnswerCompleted: loadConversation,
      setActiveConversationId,
      setCurrentConversation,
    });

  const handleNewConversation = useCallback(() => {
    setActiveConversationId(null);
    setCurrentConversation(null);
  }, [setActiveConversationId, setCurrentConversation]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (conversations.length === 0) {
    const suggestedQuestions = [
      "What are the main topics discussed?",
      "Summarize the key takeaways",
      "What action items were mentioned?",
    ];

    return (
      <div className="flex flex-col h-[600px]">
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center max-w-2xl mx-auto space-y-8">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                <div className="relative bg-gradient-to-br from-primary/10 to-primary/5 p-6 rounded-2xl border border-primary/20">
                  <MessageSquare className="h-12 w-12 text-primary" />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2">
                <h3 className="text-2xl font-bold">Ask Scribo</h3>
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <p className="text-muted-foreground text-base max-w-md mx-auto">
                Ask questions about your transcript and get AI-powered answers
                with timestamp references.
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-base font-medium text-muted-foreground">
                Try asking:
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {suggestedQuestions.map((question) => (
                  <Button
                    key={question}
                    variant="outline"
                    size="sm"
                    onClick={() => handleAskQuestion(question)}
                    disabled={isStreaming}
                    className="text-base hover:bg-primary/10 hover:border-primary/50 transition-colors"
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <QuestionInput onSubmit={handleAskQuestion} disabled={isStreaming} />
      </div>
    );
  }

  return (
    <div className="flex h-[600px] border rounded-lg overflow-hidden">
      <ConversationList
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelect={setActiveConversationId}
        transcriptId={transcriptId}
        onDelete={loadConversations}
      />

      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-semibold text-base">
            {isLoadingConversation ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="text-muted-foreground">Loading...</span>
              </div>
            ) : (
              currentConversation?.title || "Conversation"
            )}
          </h3>
          <Button
            onClick={handleNewConversation}
            size="sm"
            variant="outline"
            disabled={isStreaming}
          >
            <Plus className="h-4 w-4 mr-2" />
            New
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <MessageList
            messages={currentConversation?.messages || []}
            streamingAnswer={isStreaming ? currentStreamedAnswer : undefined}
            isLoadingConversation={isLoadingConversation}
          />
        </div>

        <QuestionInput onSubmit={handleAskQuestion} disabled={isStreaming || isLoadingConversation} />
      </div>
    </div>
  );
}

export const AskScriboPanel = memo(AskScriboPanelComponent);
