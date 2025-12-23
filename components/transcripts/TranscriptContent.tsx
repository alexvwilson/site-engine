"use client";

import { useState, useCallback, memo } from "react";
import type { Transcript } from "@/lib/drizzle/schema/transcripts";
import { Search, X, Copy, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { copyToClipboard } from "@/lib/clipboard";
import { formatTimestamp } from "@/lib/format-utils-client";
import { useTranscriptValidation } from "./hooks/useTranscriptValidation";
import { useTranscriptSearch } from "./hooks/useTranscriptSearch";
import { useTimestampHighlight } from "./hooks/useTimestampHighlight";

interface TranscriptContentProps {
  transcript: Transcript;
  highlightTimestamp?: number | null;
}

function TranscriptContent({
  transcript,
  highlightTimestamp,
}: TranscriptContentProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showWordLevel, setShowWordLevel] = useState(false);
  const [isCopying, setIsCopying] = useState(false);

  // Use custom hooks for state management
  const { validatedSegments, validatedWords, hasWordLevelData } =
    useTranscriptValidation(
      transcript.transcript_json,
      transcript.word_timestamps
    );

  const { filteredSegments, filteredWords } = useTranscriptSearch(
    validatedSegments,
    validatedWords,
    searchQuery
  );

  const { highlightedSegmentId, segmentRefs } = useTimestampHighlight(
    highlightTimestamp,
    validatedSegments
  );

  const handleCopyAll = useCallback(async (): Promise<void> => {
    setIsCopying(true);

    try {
      const result = await copyToClipboard(transcript.transcript_text_plain);

      if (result.success) {
        toast.success("Entire transcript copied successfully");
      } else {
        toast.error(result.error || "Failed to copy to clipboard");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsCopying(false);
    }
  }, [transcript.transcript_text_plain]);

  // Helper function to highlight search matches
  const highlightText = useCallback(
    (text: string, query: string): React.ReactElement => {
      if (!query.trim()) {
        return <>{text}</>;
      }

      const parts = text.split(new RegExp(`(${query})`, "gi"));

      return (
        <>
          {parts.map((part, index) =>
            part.toLowerCase() === query.toLowerCase() ? (
              <mark key={index} className="bg-primary text-white">
                {part}
              </mark>
            ) : (
              <span key={index}>{part}</span>
            )
          )}
        </>
      );
    },
    []
  );

  const renderSegmentLevel = (): React.ReactElement => {
    // Case 1: No valid segments available
    if (!validatedSegments || validatedSegments.length === 0) {
      // Try to show plain text as fallback
      if (transcript.transcript_text_plain) {
        return (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Structured transcript not available. Showing plain text:
            </p>
            <p className="whitespace-pre-wrap text-base leading-relaxed">
              {transcript.transcript_text_plain}
            </p>
          </div>
        );
      }

      return (
        <p className="text-sm text-muted-foreground">
          No transcript data available
        </p>
      );
    }

    // Case 2: Search returned no results
    if (
      searchQuery.trim() &&
      (!filteredSegments || filteredSegments.length === 0)
    ) {
      return (
        <div className="space-y-2 text-center">
          <p className="text-sm text-muted-foreground">
            No results found for &quot;{searchQuery}&quot;
          </p>
          <button
            onClick={() => setSearchQuery("")}
            className="text-sm text-primary hover:underline"
          >
            Clear search
          </button>
        </div>
      );
    }

    // Case 3: Display filtered segments
    const segmentsToDisplay = filteredSegments || validatedSegments;

    return (
      <div className="space-y-5">
        {segmentsToDisplay.map((segment, index) => {
          const segmentId = segment.id ?? index;
          const isHighlighted = highlightedSegmentId === segmentId;

          return (
            <div
              key={segmentId}
              ref={(el) => {
                if (el) segmentRefs.current.set(segmentId, el);
              }}
              className={cn(
                "space-x-2 transition-colors duration-300 rounded px-2",
                isHighlighted && "bg-primary/20"
              )}
            >
              <span className="text-sm font-medium text-primary/60 dark:text-primary/80">
                [{formatTimestamp(segment.start)}]
              </span>
              <span className="leading-normal text-foreground">
                {highlightText(segment.text, searchQuery)}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  const renderWordLevel = (): React.ReactElement => {
    // Case 1: No word-level data available, fallback to segment view
    if (!validatedWords || validatedWords.length === 0) {
      return renderSegmentLevel();
    }

    // Case 2: Search returned no results
    if (searchQuery.trim() && (!filteredWords || filteredWords.length === 0)) {
      return (
        <div className="space-y-2 text-center">
          <p className="text-sm text-muted-foreground">
            No results found for &quot;{searchQuery}&quot;
          </p>
          <button
            onClick={() => setSearchQuery("")}
            className="text-sm text-primary hover:underline"
          >
            Clear search
          </button>
        </div>
      );
    }

    // Case 3: Display each word on its own line with timestamp
    const wordsToDisplay = filteredWords || validatedWords;

    return (
      <div className="space-y-5">
        {wordsToDisplay.map((word, index) => (
          <div key={index} className="space-x-2 rounded px-2">
            <span className="text-sm font-medium text-primary/60 dark:text-primary/80">
              [{formatTimestamp(word.start)}]
            </span>
            <span className="text-base leading-normal text-foreground">
              {searchQuery.trim() &&
              word.word.toLowerCase().includes(searchQuery.toLowerCase()) ? (
                <mark className="bg-primary text-white">{word.word}</mark>
              ) : (
                word.word
              )}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Transcription</h2>

        <div className="flex items-center space-x-4">
          {/* Word-level toggle - Only show if word data exists */}
          {hasWordLevelData && (
            <div>
              <div className="flex items-center space-x-2">
                <Label
                  htmlFor="word-level-toggle"
                  className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Word-level
                </Label>
                <Switch
                  id="word-level-toggle"
                  checked={showWordLevel}
                  onCheckedChange={setShowWordLevel}
                  className="cursor-pointer"
                />
              </div>
            </div>
          )}
          
          {/* Search Input - Available for both segment and word-level views */}
          {validatedSegments && validatedSegments.length > 0 && (
            <div>
              <div className="relative w-56">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search transcript..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border bg-background py-1.5 pl-9 pr-8 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-4 cursor-pointer" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Copy button */}
          <Button
            variant="outline"
            size="icon"
            onClick={handleCopyAll}
            disabled={isCopying}
            title="Copy entire transcript"
          >
            {isCopying ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Border container for visual separation and polish */}
      <div className="overflow-hidden">
        <ScrollArea className="h-[600px]">
          {showWordLevel ? renderWordLevel() : renderSegmentLevel()}
        </ScrollArea>
      </div>
    </div>
  );
}

export default memo(TranscriptContent);
