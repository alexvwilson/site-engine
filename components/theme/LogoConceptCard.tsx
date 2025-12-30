"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Shield, Zap } from "lucide-react";
import type { LogoConcept } from "@/lib/drizzle/schema/logo-generation-jobs";

interface LogoConceptCardProps {
  concept: LogoConcept;
  isSelected: boolean;
  onToggle: () => void;
}

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  decomposed: { label: "Visual Metaphor", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  monogram: { label: "Monogram", color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" },
  snapai: { label: "SnapAI Pattern", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
};

const RECOMMENDATION_CONFIG: Record<string, { label: string; icon: typeof Star; color: string }> = {
  top: { label: "Top Choice", icon: Star, color: "text-yellow-600 dark:text-yellow-400" },
  alternative: { label: "Strong Alternative", icon: Zap, color: "text-blue-600 dark:text-blue-400" },
  safe: { label: "Safe Choice", icon: Shield, color: "text-green-600 dark:text-green-400" },
};

export function LogoConceptCard({
  concept,
  isSelected,
  onToggle,
}: LogoConceptCardProps) {
  const category = CATEGORY_LABELS[concept.category] || CATEGORY_LABELS.decomposed;
  const recommendation = concept.recommendation
    ? RECOMMENDATION_CONFIG[concept.recommendation]
    : null;

  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "w-full text-left p-4 rounded-lg border-2 transition-all",
        "hover:border-primary/50 hover:bg-muted/50",
        isSelected
          ? "border-primary bg-primary/5"
          : "border-border bg-card"
      )}
    >
      <div className="space-y-3">
        {/* Header with badges */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className={cn("text-xs", category.color)}>
              {category.label}
            </Badge>
            {recommendation && (
              <Badge
                variant="outline"
                className={cn("text-xs gap-1", recommendation.color)}
              >
                <recommendation.icon className="h-3 w-3" />
                {recommendation.label}
              </Badge>
            )}
          </div>
          <div
            className={cn(
              "h-5 w-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
              isSelected
                ? "border-primary bg-primary text-primary-foreground"
                : "border-muted-foreground/30"
            )}
          >
            {isSelected && <Check className="h-3 w-3" />}
          </div>
        </div>

        {/* Concept number and description */}
        <div>
          <p className="font-medium text-sm mb-1">Concept #{concept.id}</p>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {concept.description}
          </p>
        </div>

        {/* Prompt preview */}
        <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded line-clamp-2 font-mono">
          {concept.prompt}
        </div>
      </div>
    </button>
  );
}
