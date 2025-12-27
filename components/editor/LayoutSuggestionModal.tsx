"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SuggestionCard } from "./SuggestionCard";
import {
  triggerLayoutSuggestion,
  getLayoutJobStatus,
  applyLayoutSuggestions,
} from "@/app/actions/layout-suggestions";
import type { LayoutSuggestion } from "@/lib/drizzle/schema/layout-suggestion-jobs";

interface LayoutSuggestionModalProps {
  pageId: string;
  siteId: string;
}

type ModalStep = "input" | "generating" | "results";

export function LayoutSuggestionModal({
  pageId,
  siteId,
}: LayoutSuggestionModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<ModalStep>("input");
  const [description, setDescription] = useState("");
  const [jobId, setJobId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<LayoutSuggestion[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(
    new Set()
  );
  const [isApplying, setIsApplying] = useState(false);

  // Poll for job status during generation
  useEffect(() => {
    if (step !== "generating" || !jobId) return;

    const pollInterval = setInterval(async () => {
      const result = await getLayoutJobStatus(jobId);

      if (!result.success) {
        setError(result.error ?? "Failed to check status");
        setStep("input");
        clearInterval(pollInterval);
        return;
      }

      setProgress(result.progress ?? 0);

      if (result.status === "completed" && result.suggestions) {
        setSuggestions(result.suggestions);
        // Select all by default
        setSelectedIndices(new Set(result.suggestions.map((_, i) => i)));
        setStep("results");
        clearInterval(pollInterval);
      } else if (result.status === "failed") {
        setError(result.error ?? "Generation failed");
        setStep("input");
        clearInterval(pollInterval);
      }
    }, 1000);

    return () => clearInterval(pollInterval);
  }, [step, jobId]);

  const handleGenerate = async (): Promise<void> => {
    if (!description.trim()) return;

    setError(null);
    setStep("generating");
    setProgress(0);

    const result = await triggerLayoutSuggestion(pageId, description);

    if (!result.success) {
      setError(result.error ?? "Failed to start generation");
      setStep("input");
      return;
    }

    setJobId(result.jobId ?? null);
  };

  const handleToggleSuggestion = (index: number, selected: boolean): void => {
    setSelectedIndices((prev) => {
      const next = new Set(prev);
      if (selected) {
        next.add(index);
      } else {
        next.delete(index);
      }
      return next;
    });
  };

  const handleSelectAll = (): void => {
    setSelectedIndices(new Set(suggestions.map((_, i) => i)));
  };

  const handleSelectNone = (): void => {
    setSelectedIndices(new Set());
  };

  const handleApply = async (): Promise<void> => {
    const selectedSuggestions = suggestions.filter((_, i) =>
      selectedIndices.has(i)
    );

    if (selectedSuggestions.length === 0) return;

    setIsApplying(true);
    const result = await applyLayoutSuggestions(
      pageId,
      siteId,
      selectedSuggestions
    );
    setIsApplying(false);

    if (result.success) {
      setOpen(false);
      resetModal();
      router.refresh();
    } else {
      setError(result.error ?? "Failed to apply suggestions");
    }
  };

  const resetModal = (): void => {
    setStep("input");
    setDescription("");
    setJobId(null);
    setProgress(0);
    setError(null);
    setSuggestions([]);
    setSelectedIndices(new Set());
  };

  const handleOpenChange = (newOpen: boolean): void => {
    setOpen(newOpen);
    if (!newOpen) {
      resetModal();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Sparkles className="h-4 w-4 mr-2" />
          Suggest Layout
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>AI Layout Suggestions</DialogTitle>
          <DialogDescription>
            Describe your page and get AI-recommended sections.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {step === "input" && (
          <div className="space-y-4">
            <Textarea
              placeholder="E.g., Landing page for a premium snack brand showcasing products and customer testimonials..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              maxLength={500}
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">
                {description.length}/500 characters
              </span>
              <Button onClick={handleGenerate} disabled={!description.trim()}>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Suggestions
              </Button>
            </div>
          </div>
        )}

        {step === "generating" && (
          <div className="space-y-4 py-8">
            <div className="flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
            <Progress value={progress} className="w-full" />
            <p className="text-center text-sm text-muted-foreground">
              Generating layout suggestions...
            </p>
          </div>
        )}

        {step === "results" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {suggestions.length} section{suggestions.length !== 1 ? "s" : ""}{" "}
                suggested
              </span>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectAll}
                  disabled={selectedIndices.size === suggestions.length}
                >
                  Select All
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectNone}
                  disabled={selectedIndices.size === 0}
                >
                  Clear
                </Button>
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-2">
              {suggestions.map((suggestion, index) => (
                <SuggestionCard
                  key={index}
                  suggestion={suggestion}
                  selected={selectedIndices.has(index)}
                  onToggle={(selected) =>
                    handleToggleSuggestion(index, selected)
                  }
                />
              ))}
            </div>

            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-sm text-muted-foreground">
                {selectedIndices.size} of {suggestions.length} selected
              </span>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep("input")}>
                  Back
                </Button>
                <Button
                  onClick={handleApply}
                  disabled={selectedIndices.size === 0 || isApplying}
                >
                  {isApplying ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    `Add ${selectedIndices.size} Section${selectedIndices.size !== 1 ? "s" : ""}`
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
