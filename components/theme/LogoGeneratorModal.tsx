"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import {
  Loader2,
  Copy,
  Check,
  ChevronDown,
  AlertCircle,
  Sparkles,
  ExternalLink,
  Eraser,
  Image as ImageIcon,
  Crop,
} from "lucide-react";
import { toast } from "sonner";
import { LogoConceptCard } from "./LogoConceptCard";
import {
  triggerLogoGeneration,
  getLogoJobStatus,
  retryLogoGeneration,
} from "@/app/actions/logo-generation";
import { wrapForChatGPT } from "@/trigger/utils/logo-prompts";
import type { Site, BrandPersonality } from "@/lib/drizzle/schema/sites";
import type { LogoConcept, LogoGenerationOutput } from "@/lib/drizzle/schema/logo-generation-jobs";

type ModalStep = "context" | "generating" | "selection" | "output";

interface LogoGeneratorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  site: Site;
  primaryColor?: string | null;
  /** If provided, opens modal in view mode for a past job */
  initialJobId?: string | null;
}

const BRAND_PERSONALITY_OPTIONS = [
  { value: "professional", label: "Professional / Enterprise" },
  { value: "consumer", label: "Consumer / Friendly" },
  { value: "tech", label: "Tech / AI" },
  { value: "creative", label: "Creative / Artistic" },
];

const TRANSPARENT_BG_PROMPT = "Remove the background (make it transparent) and crop tightly to remove any padding, margins, or whitespace around the logo. The logo should touch the edges of the image canvas.";

export function LogoGeneratorModal({
  open,
  onOpenChange,
  site,
  primaryColor,
  initialJobId,
}: LogoGeneratorModalProps) {
  const router = useRouter();
  const [step, setStep] = useState<ModalStep>("context");

  // Form state
  const [siteName, setSiteName] = useState(site.name);
  const [siteDescription, setSiteDescription] = useState(site.description || "");
  const [brandPersonality, setBrandPersonality] = useState<BrandPersonality>(
    (site.brand_personality as BrandPersonality) || "professional"
  );

  // Generation state
  const [jobId, setJobId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("pending");
  const [error, setError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Results state
  const [concepts, setConcepts] = useState<LogoGenerationOutput | null>(null);
  const [selectedConceptIds, setSelectedConceptIds] = useState<Set<number>>(new Set());

  // Output state
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [copiedTransparent, setCopiedTransparent] = useState(false);
  const [instructionsOpen, setInstructionsOpen] = useState(false);
  const [faviconOpen, setFaviconOpen] = useState(false);

  // Ref to track if generation completed for refresh
  const wasGeneratedRef = useRef(false);
  // Ref to track if we're viewing a past job
  const isViewingPastJob = useRef(false);

  // Load past job if initialJobId is provided
  useEffect(() => {
    if (open && initialJobId) {
      isViewingPastJob.current = true;
      // Fetch the past job's concepts
      async function loadPastJob() {
        const result = await getLogoJobStatus(initialJobId!);
        if (result.success && result.concepts) {
          setConcepts(result.concepts);
          setStep("selection");
        } else {
          toast.error("Failed to load past job");
          onOpenChange(false);
        }
      }
      loadPastJob();
    }
  }, [open, initialJobId, onOpenChange]);

  // Poll for job status when generating
  const pollJobStatus = useCallback(async () => {
    if (!jobId) return;

    const result = await getLogoJobStatus(jobId);

    if (!result.success) {
      setError(result.error);
      setStatus("failed");
      return;
    }

    setProgress(result.progress ?? 0);
    setStatus(result.status ?? "pending");
    setError(result.error);

    // If completed, move to selection step
    if (result.status === "completed" && result.concepts) {
      setConcepts(result.concepts);
      wasGeneratedRef.current = true;
      setStep("selection");
    }
  }, [jobId]);

  useEffect(() => {
    if (step !== "generating" || !jobId) return;

    // Poll every 2 seconds
    const interval = setInterval(pollJobStatus, 2000);
    // Initial poll
    pollJobStatus();

    return () => clearInterval(interval);
  }, [step, jobId, pollJobStatus]);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      // Refresh if generation completed
      if (wasGeneratedRef.current) {
        router.refresh();
      }
      // Delay reset to avoid flash during close animation
      const timeout = setTimeout(() => {
        setStep("context");
        setSiteName(site.name);
        setSiteDescription(site.description || "");
        setBrandPersonality((site.brand_personality as BrandPersonality) || "professional");
        setJobId(null);
        setProgress(0);
        setStatus("pending");
        setError(undefined);
        setIsSubmitting(false);
        setConcepts(null);
        setSelectedConceptIds(new Set());
        setCopiedId(null);
        setCopiedTransparent(false);
        setInstructionsOpen(false);
        setFaviconOpen(false);
        wasGeneratedRef.current = false;
        isViewingPastJob.current = false;
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [open, site, router]);

  const handleStartGeneration = async () => {
    setIsSubmitting(true);
    setError(undefined);

    const result = await triggerLogoGeneration(site.id, {
      siteName,
      siteDescription: siteDescription || null,
      brandPersonality,
      primaryColor: primaryColor || null,
    });

    if (!result.success) {
      setError(result.error);
      setIsSubmitting(false);
      toast.error(result.error || "Failed to start logo generation");
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

    const result = await retryLogoGeneration(jobId);

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
    setStep("context");
    setJobId(null);
    setProgress(0);
    setStatus("pending");
    setError(undefined);
    setConcepts(null);
    setSelectedConceptIds(new Set());
    setCopiedId(null);
    setCopiedTransparent(false);
    setInstructionsOpen(false);
    setFaviconOpen(false);
    isViewingPastJob.current = false;
  };

  const handleConceptToggle = (conceptId: number) => {
    setSelectedConceptIds((prev) => {
      const next = new Set(prev);
      if (next.has(conceptId)) {
        next.delete(conceptId);
      } else if (next.size < 3) {
        next.add(conceptId);
      } else {
        toast.info("You can select up to 3 concepts");
      }
      return next;
    });
  };

  const handleProceedToOutput = () => {
    if (selectedConceptIds.size === 0) {
      toast.error("Please select at least one concept");
      return;
    }
    setStep("output");
  };

  const handleCopyPrompt = async (concept: LogoConcept) => {
    const wrappedPrompt = wrapForChatGPT(concept.prompt);
    await navigator.clipboard.writeText(wrappedPrompt);
    setCopiedId(concept.id);
    toast.success("Prompt copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyTransparentPrompt = async () => {
    await navigator.clipboard.writeText(TRANSPARENT_BG_PROMPT);
    setCopiedTransparent(true);
    toast.success("Transparent background prompt copied");
    setTimeout(() => setCopiedTransparent(false), 2000);
  };

  const handleClose = () => {
    // Don't allow closing during generation unless failed
    if (step === "generating" && status !== "failed") {
      toast.info("Please wait for generation to complete");
      return;
    }
    onOpenChange(false);
  };

  const selectedConcepts = concepts?.concepts.filter((c) =>
    selectedConceptIds.has(c.id)
  );

  const isViewMode = isViewingPastJob.current;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === "context" && "Generate Logo Prompts"}
            {step === "generating" && "Generating Concepts"}
            {step === "selection" && (isViewMode ? "Previous Generation" : "Select Your Favorites")}
            {step === "output" && "Your Logo Prompts"}
          </DialogTitle>
          <DialogDescription>
            {step === "context" &&
              "Review your site details to generate AI-powered logo prompts for ChatGPT."}
            {step === "generating" &&
              "AI is creating 10 unique logo concepts. This usually takes 15-30 seconds."}
            {step === "selection" &&
              (isViewMode
                ? "View and select concepts from this previous generation."
                : "Choose up to 3 concepts to get ChatGPT-ready prompts.")}
            {step === "output" &&
              "Copy these prompts into ChatGPT to generate your logo images."}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {/* Step 1: Context Collection */}
          {step === "context" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="siteName">Site Name</Label>
                <Input
                  id="siteName"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  placeholder="My Awesome App"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="siteDescription">
                  Site Description
                  <span className="text-muted-foreground ml-1">(optional)</span>
                </Label>
                <Textarea
                  id="siteDescription"
                  value={siteDescription}
                  onChange={(e) => setSiteDescription(e.target.value)}
                  placeholder="Describe what your site or app does..."
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  A good description helps AI generate more relevant logo concepts.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="brandPersonality">Brand Personality</Label>
                <Select
                  value={brandPersonality}
                  onValueChange={(value) => setBrandPersonality(value as BrandPersonality)}
                >
                  <SelectTrigger id="brandPersonality">
                    <SelectValue placeholder="Select personality" />
                  </SelectTrigger>
                  <SelectContent>
                    {BRAND_PERSONALITY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {primaryColor && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div
                    className="h-4 w-4 rounded-full border"
                    style={{ backgroundColor: primaryColor }}
                  />
                  <span>Using theme color: {primaryColor}</span>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleStartGeneration}
                  disabled={!siteName.trim() || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Starting...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Concepts
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Generating */}
          {step === "generating" && (
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {status === "pending" && "Starting generation..."}
                    {status === "generating" && "Generating logo concepts..."}
                    {status === "completed" && "Complete!"}
                    {status === "failed" && "Generation failed"}
                  </span>
                  <span className="font-medium">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              {status === "generating" && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              )}

              {status === "failed" && error && (
                <div className="flex items-start gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                  <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-destructive">Generation Failed</p>
                    <p className="text-sm text-muted-foreground mt-1">{error}</p>
                  </div>
                </div>
              )}

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

          {/* Step 3: Selection */}
          {step === "selection" && concepts && (
            <div className="space-y-4">
              {concepts.appContext && (
                <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                  {concepts.appContext}
                </p>
              )}

              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {selectedConceptIds.size}/3 selected
                </p>
              </div>

              <div className="grid gap-3 max-h-[400px] overflow-y-auto pr-2">
                {concepts.concepts.map((concept) => (
                  <LogoConceptCard
                    key={concept.id}
                    concept={concept}
                    isSelected={selectedConceptIds.has(concept.id)}
                    onToggle={() => handleConceptToggle(concept.id)}
                  />
                ))}
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t">
                <Button variant="outline" onClick={isViewMode ? () => onOpenChange(false) : handleStartOver}>
                  {isViewMode ? "Close" : "Start Over"}
                </Button>
                <Button
                  onClick={handleProceedToOutput}
                  disabled={selectedConceptIds.size === 0}
                >
                  Get Prompts ({selectedConceptIds.size})
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Output */}
          {step === "output" && selectedConcepts && (
            <div className="space-y-4">
              {/* Selected Prompts */}
              <div className="space-y-4 max-h-[280px] overflow-y-auto pr-2">
                {selectedConcepts.map((concept) => (
                  <div
                    key={concept.id}
                    className="space-y-2 p-4 rounded-lg border bg-card"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-sm">
                          Concept #{concept.id}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {concept.description}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopyPrompt(concept)}
                        className="flex-shrink-0"
                      >
                        {copiedId === concept.id ? (
                          <>
                            <Check className="h-4 w-4 mr-1" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 mr-1" />
                            Copy Prompt
                          </>
                        )}
                      </Button>
                    </div>
                    <div className="bg-muted/50 p-3 rounded text-xs font-mono whitespace-pre-wrap">
                      {wrapForChatGPT(concept.prompt)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Transparent Background Helper */}
              <div className="p-4 rounded-lg border bg-muted/30">
                <div className="flex items-start gap-3">
                  <Eraser className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">Get Transparent Version</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      After generating your logo in ChatGPT, use this prompt to remove the background:
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCopyTransparentPrompt}
                      className="mt-2"
                    >
                      {copiedTransparent ? (
                        <>
                          <Check className="h-4 w-4 mr-1" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-1" />
                          Copy Transparent Prompt
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Favicon Instructions */}
              <Collapsible open={faviconOpen} onOpenChange={setFaviconOpen}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between text-muted-foreground"
                  >
                    <span className="flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" />
                      Favicon & App Icon Setup
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        faviconOpen ? "rotate-180" : ""
                      }`}
                    />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-2">
                  <div className="p-4 bg-muted/50 rounded-lg text-sm space-y-4">
                    <div>
                      <p className="font-medium">Step 1: Generate Favicon Files</p>
                      <p className="text-muted-foreground text-xs mt-1">
                        Go to the favicon generator and upload your logo:
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2"
                        asChild
                      >
                        <a
                          href="https://realfavicongenerator.net/favicon-generator/nextjs"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Open Favicon Generator
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </Button>
                    </div>

                    <div>
                      <p className="font-medium">Step 2: Place Files</p>
                      <p className="text-muted-foreground text-xs mt-1">
                        Download and place these files in your project:
                      </p>
                      <ul className="text-xs text-muted-foreground mt-2 space-y-1 font-mono">
                        <li>• app/favicon.ico</li>
                        <li>• app/apple-icon.png</li>
                        <li>• public/logo.png (transparent version)</li>
                      </ul>
                    </div>

                    <div className="flex items-start gap-2 p-3 rounded bg-muted/50 border">
                      <Crop className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-xs">Need to trim excess space?</p>
                        <p className="text-xs text-muted-foreground">
                          Use Trimmy to automatically crop whitespace:
                        </p>
                        <a
                          href="https://app.trimmy.io/submit"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline inline-flex items-center gap-1 mt-1"
                        >
                          Open Trimmy
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Usage Instructions */}
              <Collapsible
                open={instructionsOpen}
                onOpenChange={setInstructionsOpen}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between text-muted-foreground"
                  >
                    How to use these prompts
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        instructionsOpen ? "rotate-180" : ""
                      }`}
                    />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-2">
                  <div className="p-4 bg-muted/50 rounded-lg text-sm space-y-3">
                    <div>
                      <p className="font-medium">1. Generate in ChatGPT</p>
                      <p className="text-muted-foreground text-xs">
                        Copy a prompt above and paste it into ChatGPT (requires ChatGPT Plus for image generation).
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">2. Tweak if needed</p>
                      <p className="text-muted-foreground text-xs">
                        Ask ChatGPT to modify colors, make it more minimal, or adjust contrast.
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">3. Get transparent version</p>
                      <p className="text-muted-foreground text-xs">
                        Use the &quot;Copy Transparent Prompt&quot; button above to remove the background.
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">4. Upload to Site Engine</p>
                      <p className="text-muted-foreground text-xs">
                        Go to Settings → Header Configuration to upload your finished logo.
                      </p>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              <div className="flex gap-3 justify-end pt-4 border-t">
                <Button variant="outline" onClick={() => setStep("selection")}>
                  Back to Selection
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
