"use client";

import { type TranscriptMessage } from "@/lib/drizzle/schema";
import { cn } from "@/lib/utils";
import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { TimestampLink } from "./TimestampLink";
import { TIMESTAMP_REGEX } from "@/lib/timestamp-utils-client";
import { Copy, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { copyToClipboard } from "@/lib/clipboard";

interface MessageListProps {
  messages: TranscriptMessage[];
  streamingAnswer?: string;
  isLoadingConversation: boolean;
}

/**
 * Process text content to convert timestamps into clickable links
 */
function processTextWithTimestamps(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  const regex = new RegExp(TIMESTAMP_REGEX.source, "g");
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    parts.push(
      <TimestampLink key={match.index} timestamp={match[0]}>
        {match[0]}
      </TimestampLink>
    );

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

const markdownComponents: Components = {
  p: ({ children }) => {
    // Process paragraph content for timestamps
    const processedChildren = React.Children.map(children, (child) => {
      if (typeof child === "string") {
        return processTextWithTimestamps(child);
      }
      return child;
    });

    return <p className="mb-2 last:mb-0">{processedChildren}</p>;
  },
  ul: ({ children }) => (
    <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>
  ),
  li: ({ children }) => {
    // Process list item content for timestamps
    const processedChildren = React.Children.map(children, (child) => {
      if (typeof child === "string") {
        return processTextWithTimestamps(child);
      }
      return child;
    });

    return <li>{processedChildren}</li>;
  },
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  code: ({ children }) => (
    <code className="bg-muted-foreground/20 px-1 py-0.5 rounded text-xs">
      {children}
    </code>
  ),
};

export function MessageList({ messages, streamingAnswer, isLoadingConversation }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  const handleCopyMessage = async (
    content: string,
    messageId: string,
  ): Promise<void> => {
    const result = await copyToClipboard(content);

    if (result.success) {
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
      toast.success("Answer copied to clipboard!");
    } else {
      toast.error(result.error || "Failed to copy to clipboard");
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingAnswer]);

  if (isLoadingConversation) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (messages.length === 0 && !streamingAnswer) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-muted-foreground text-sm">
          No messages yet. Ask a question to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={cn(
            "flex flex-col gap-1",
            message.sender === "user" ? "items-end" : "items-start",
          )}
        >
          <div
            className={cn(
              "max-w-[85%] rounded-lg px-4 py-2",
              message.sender === "user"
                ? "bg-primary text-primary-foreground"
                : "bg-muted",
              message.status === "error" && "border-destructive border",
            )}
          >
            {message.sender === "user" ? (
              <p className="whitespace-pre-wrap text-base">{message.content}</p>
            ) : (
              <>
                <div className="prose dark:prose-invert max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={markdownComponents}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/50">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      handleCopyMessage(message.content, message.id)
                    }
                    className="h-7 px-2 text-xs"
                  >
                    <Copy className="h-3 w-3 mr-1.5" />
                    {copiedMessageId === message.id ? "Copied!" : "Copy"}
                  </Button>
                </div>
              </>
            )}
          </div>
          <span className="text-muted-foreground text-xs">
            {new Date(message.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      ))}

      {streamingAnswer && (
        <div className="flex flex-col gap-1 items-start">
          <div className="max-w-[85%] rounded-lg bg-muted px-4 py-2">
            <div className="prose dark:prose-invert max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={markdownComponents}
              >
                {streamingAnswer}
              </ReactMarkdown>
            </div>
            <span className="inline-block h-4 w-1 bg-foreground animate-pulse ml-0.5" />
          </div>
          <span className="text-muted-foreground text-xs">Typing...</span>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
