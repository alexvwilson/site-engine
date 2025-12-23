"use client";

import { useState, useEffect } from "react";
import { Copy, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Response } from "@/components/ui/response";
import {
  generateAISummary,
  fetchAISummary,
  getTriggerRealtimeToken,
} from "@/app/actions/transcriptions";
import { copyToClipboard } from "@/lib/clipboard";
import type { AiSummary } from "@/lib/drizzle/schema/ai-summaries";
import { useRealtimeRunWithStreams } from "@trigger.dev/react-hooks";
import type {
  generateAISummaryTask,
  SUMMARY_STREAMS,
} from "@/trigger/tasks/generate-ai-summary";
import { AISummaryEmptyState } from "./AISummaryEmptyState";

interface AISummaryTabProps {
  transcriptId: string;
  initialSummary: AiSummary | null;
}

export function AISummaryTab({
  transcriptId,
  initialSummary,
}: AISummaryTabProps) {
  const [summary, setSummary] = useState<AiSummary | null>(initialSummary);
  const [isGenerating, setIsGenerating] = useState(false);
  const [runId, setRunId] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Use Trigger.dev Realtime hook for streaming
  // It's logged internally by the hook and cannot be suppressed, but is harmless.
  // The Trigger.dev job continues running in the background regardless.
  const {
    run,
    streams,
    error: streamError,
  } = useRealtimeRunWithStreams<typeof generateAISummaryTask, SUMMARY_STREAMS>(
    runId || "",
    {
      accessToken: accessToken || undefined,
      enabled: !!runId && !!accessToken && isGenerating,
    }
  );

  // Handle stream errors (suppress AbortError logging on our end)
  useEffect(() => {
    if (streamError) {
      // AbortError is expected when navigating away - harmless
      if (streamError.name === "AbortError") {
        return;
      }

      console.error("Unexpected stream error:", streamError);
      setError(
        "Failed to stream AI summary. The generation continues in the background."
      );
    }
  }, [streamError]);

  // Build streamed text from chunks
  const buildStreamedText = (): string => {
    if (!streams.summary) return "";

    return streams.summary
      .map((chunk) => {
        return chunk.choices
          .map((choice) => choice.delta?.content || "")
          .join("");
      })
      .join("");
  };

  const currentStreamedText = buildStreamedText();

  // Handle run completion and failure
  useEffect(() => {
    if (!run || !isGenerating) return;

    let mounted = true;

    // Update summary when run completes
    if (run.status === "COMPLETED") {
      // Poll for the final summary from database
      (async () => {
        const finalSummary = await fetchAISummary(transcriptId);
        if (finalSummary && mounted) {
          setSummary(finalSummary);
          setIsGenerating(false);
          toast.success("AI summary generated successfully!");
        }
      })();
    }

    // Handle run failure
    if (run.status === "FAILED" && mounted) {
      setIsGenerating(false);
      setError("AI summary generation failed. Please try again.");
      toast.error("Failed to generate AI summary");
    }

    return () => {
      mounted = false;
    };
  }, [run, isGenerating, transcriptId]);

  const handleGenerateSummary = async () => {
    try {
      setIsGenerating(true);
      setError(null);

      // Get Trigger.dev realtime token
      const token = await getTriggerRealtimeToken();
      setAccessToken(token);

      // Trigger AI summary generation
      const result = await generateAISummary(transcriptId);

      if (!result.success) {
        setIsGenerating(false);
        setError(result.error || "Failed to start generation");
        toast.error(result.error || "Failed to start generation");
        return;
      }

      // Set run ID to start monitoring
      setRunId(result.runId || null);
      toast.success("AI summary generation started!");
    } catch (err) {
      setIsGenerating(false);
      setError("An unexpected error occurred");
      toast.error("An unexpected error occurred");
      console.error("Error generating summary:", err);
    }
  };

  const handleCopy = async (text: string, label: string) => {
    const result = await copyToClipboard(text);

    if (result.success) {
      toast.success(`${label} copied successfully`);
    } else {
      toast.error(result.error || "Failed to copy to clipboard");
    }
  };

  const formatSummaryType = (type: string): string => {
    const typeMap: Record<string, string> = {
      meeting_notes: "Meeting Notes",
      youtube_video: "YouTube Video",
      general: "General",
    };
    return typeMap[type] || "Summary";
  };

  // Empty state - no summary yet
  if (!summary && !isGenerating) {
    return (
      <div className="w-full">
        {error && (
          <div className="mb-6 rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-center">
            <p className="text-base text-destructive">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateSummary}
              className="mt-3"
            >
              Retry
            </Button>
          </div>
        )}
        <AISummaryEmptyState
          onGenerate={handleGenerateSummary}
          isGenerating={isGenerating}
        />
      </div>
    );
  }

  // Generating state - show streaming text
  if (isGenerating) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">AI Summary</h2>
          </div>

          {/* Show streaming text as it arrives */}
          {currentStreamedText ? (
            <div className="rounded-lg border border-border/50 bg-muted/30 p-6">
              <Response className="prose prose-invert max-w-none text-base text-foreground/80">
                {currentStreamedText}
              </Response>
              <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1 mt-2" />
            </div>
          ) : (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-primary" />
                <p className="text-base text-muted-foreground">
                  Analyzing transcript and generating summary...
                </p>
                <p className="mt-2 text-base text-muted-foreground">
                  This usually takes 30-60 seconds
                </p>
              </div>
            </div>
          )}

          {/* Show progress if available */}
          {run?.metadata && (
            <div className="text-base text-muted-foreground text-center">
              {run.metadata.currentStep as string}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Completed state - v2 format only
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-foreground">AI Summary</h2>
          {summary!.summary_type && (
            <Badge variant="secondary" className="text-base">
              {formatSummaryType(summary!.summary_type)}
            </Badge>
          )}
        </div>
        <Button
          variant="outline"
          onClick={() =>
            handleCopy(summary!.summary_content || "", "AI Summary")
          }
          className="cursor-pointer"
        >
          <Copy className="h-4 w-4 mr-2" />
          Copy Summary
        </Button>
      </div>

      <Response className="prose prose-invert max-w-none">
        {summary!.summary_content || ""}
      </Response>
    </div>
  );
}
