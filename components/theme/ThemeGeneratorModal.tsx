"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RequirementsForm } from "./RequirementsForm";
import { ProgressDisplay } from "./ProgressDisplay";
import { ThemePreview } from "./ThemePreview";
import {
  triggerThemeGeneration,
  getThemeJobStatus,
  retryThemeGeneration,
  getThemeDataById,
} from "@/app/actions/theme";
import { toast } from "sonner";
import type { ThemeRequirements, ThemeData } from "@/lib/drizzle/schema/theme-types";

type ModalStep = "requirements" | "generating" | "preview";

interface ThemeGeneratorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  siteId: string;
  siteName: string;
  onThemeGenerated?: () => void;
}

export function ThemeGeneratorModal({
  open,
  onOpenChange,
  siteId,
  siteName,
  onThemeGenerated,
}: ThemeGeneratorModalProps) {
  const router = useRouter();
  const [step, setStep] = useState<ModalStep>("requirements");
  const [jobId, setJobId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("pending");
  const [error, setError] = useState<string | undefined>();
  const [generatedTheme, setGeneratedTheme] = useState<ThemeData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [themeWasGenerated, setThemeWasGenerated] = useState(false);

  // Poll for job status when generating
  const pollJobStatus = useCallback(async () => {
    if (!jobId) return;

    const result = await getThemeJobStatus(jobId);

    if (!result.success) {
      setError(result.error);
      setStatus("failed");
      return;
    }

    setProgress(result.progress ?? 0);
    setStatus(result.status ?? "pending");
    setError(result.error);

    // If completed, fetch the generated theme
    if (result.status === "completed" && result.themeId) {
      const themeResult = await getThemeDataById(result.themeId);
      if (themeResult.success && themeResult.data) {
        setGeneratedTheme(themeResult.data);
        setThemeWasGenerated(true);
        setStep("preview");
        onThemeGenerated?.();
      }
    }
  }, [jobId, onThemeGenerated]);

  useEffect(() => {
    if (step !== "generating" || !jobId) return;

    // Poll every 2 seconds
    const interval = setInterval(pollJobStatus, 2000);
    // Initial poll
    pollJobStatus();

    return () => clearInterval(interval);
  }, [step, jobId, pollJobStatus]);

  // Reset state when modal closes and refresh if theme was generated
  useEffect(() => {
    if (!open) {
      // Refresh the page if a theme was generated
      if (themeWasGenerated) {
        router.refresh();
      }
      // Delay reset to avoid flash during close animation
      const timeout = setTimeout(() => {
        setStep("requirements");
        setJobId(null);
        setProgress(0);
        setStatus("pending");
        setError(undefined);
        setGeneratedTheme(null);
        setIsSubmitting(false);
        setThemeWasGenerated(false);
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [open, themeWasGenerated, router]);

  const handleSubmitRequirements = async (requirements: ThemeRequirements) => {
    setIsSubmitting(true);
    setError(undefined);

    const result = await triggerThemeGeneration(siteId, "quick", requirements);

    if (!result.success) {
      setError(result.error);
      setIsSubmitting(false);
      toast.error(result.error || "Failed to start theme generation");
      return;
    }

    setJobId(result.jobId ?? null);
    setStep("generating");
    setIsSubmitting(false);
  };

  const handleRetry = async () => {
    if (!jobId) return;

    setIsSubmitting(true);
    setError(undefined);
    setProgress(0);
    setStatus("pending");

    const result = await retryThemeGeneration(jobId);

    if (!result.success) {
      setError(result.error);
      setIsSubmitting(false);
      toast.error(result.error || "Failed to retry generation");
      return;
    }

    setJobId(result.jobId ?? null);
    setIsSubmitting(false);
  };

  const handleStartOver = () => {
    setStep("requirements");
    setJobId(null);
    setProgress(0);
    setStatus("pending");
    setError(undefined);
    setGeneratedTheme(null);
  };

  const handleClose = () => {
    // Don't allow closing during generation unless failed
    if (step === "generating" && status !== "failed") {
      toast.info("Please wait for generation to complete");
      return;
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === "requirements" && "Generate Theme"}
            {step === "generating" && "Generating Theme"}
            {step === "preview" && "Theme Generated"}
          </DialogTitle>
          <DialogDescription>
            {step === "requirements" &&
              "Tell us about your brand and style preferences to generate a custom theme."}
            {step === "generating" &&
              "AI is creating your theme. This usually takes 15-30 seconds."}
            {step === "preview" &&
              "Your theme has been generated and saved. Review it below."}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {step === "requirements" && (
            <RequirementsForm
              siteName={siteName}
              onSubmit={handleSubmitRequirements}
              isLoading={isSubmitting}
            />
          )}

          {step === "generating" && (
            <div className="space-y-6">
              <ProgressDisplay
                progress={progress}
                status={status}
                error={error}
              />

              {status === "failed" && (
                <div className="flex gap-3 justify-end">
                  <Button variant="outline" onClick={handleStartOver}>
                    Start Over
                  </Button>
                  <Button onClick={handleRetry} disabled={isSubmitting}>
                    {isSubmitting ? "Retrying..." : "Retry"}
                  </Button>
                </div>
              )}
            </div>
          )}

          {step === "preview" && generatedTheme && (
            <div className="space-y-6">
              <ThemePreview theme={generatedTheme} showRationale />

              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={handleStartOver}>
                  Generate Another
                </Button>
                <Button onClick={() => onOpenChange(false)}>Done</Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
