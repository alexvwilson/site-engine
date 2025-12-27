"use client";

import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, Loader2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProgressDisplayProps {
  progress: number;
  status: string;
  error?: string;
}

const STEPS = [
  { key: "init", label: "Initializing", minProgress: 0 },
  { key: "colors", label: "Generating colors", minProgress: 10 },
  { key: "typography", label: "Generating typography", minProgress: 40 },
  { key: "components", label: "Generating components", minProgress: 60 },
  { key: "finalize", label: "Finalizing theme", minProgress: 85 },
  { key: "complete", label: "Complete", minProgress: 100 },
];

export function ProgressDisplay({ progress, status, error }: ProgressDisplayProps) {
  const isFailed = status === "failed";
  const isComplete = status === "completed" || progress >= 100;

  // Determine which step is currently active
  const currentStepIndex = STEPS.findIndex((step, index) => {
    const nextStep = STEPS[index + 1];
    if (!nextStep) return true;
    return progress < nextStep.minProgress;
  });

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            {isFailed ? "Generation failed" : isComplete ? "Complete!" : "Generating theme..."}
          </span>
          <span className="font-medium">{Math.round(progress)}%</span>
        </div>
        <Progress
          value={progress}
          className={cn(
            "h-2",
            isFailed && "[&>div]:bg-destructive"
          )}
        />
      </div>

      {/* Step List */}
      <div className="space-y-3">
        {STEPS.map((step, index) => {
          const isCompleted = progress > step.minProgress || (progress === 100 && step.minProgress === 100);
          const isCurrent = index === currentStepIndex && !isFailed && !isComplete;
          const isPending = index > currentStepIndex;

          return (
            <div
              key={step.key}
              className={cn(
                "flex items-center gap-3 text-sm",
                isPending && "text-muted-foreground",
                isCurrent && "text-foreground font-medium",
                isCompleted && "text-muted-foreground"
              )}
            >
              {isFailed && isCurrent ? (
                <XCircle className="h-5 w-5 text-destructive" />
              ) : isCompleted ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : isCurrent ? (
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              ) : (
                <Circle className="h-5 w-5" />
              )}
              <span>{step.label}</span>
            </div>
          );
        })}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}
    </div>
  );
}
