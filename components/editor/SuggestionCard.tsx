"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { BlockIcon } from "./BlockIcon";
import { BLOCK_TYPE_INFO } from "@/lib/section-types";
import type { LayoutSuggestion } from "@/lib/drizzle/schema/layout-suggestion-jobs";
import { cn } from "@/lib/utils";

interface SuggestionCardProps {
  suggestion: LayoutSuggestion;
  selected: boolean;
  onToggle: (selected: boolean) => void;
}

export function SuggestionCard({
  suggestion,
  selected,
  onToggle,
}: SuggestionCardProps) {
  const blockInfo = BLOCK_TYPE_INFO.find((b) => b.type === suggestion.blockType);
  const label = blockInfo?.label ?? suggestion.blockType;

  return (
    <label
      className={cn(
        "flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors",
        "hover:bg-muted/50",
        selected ? "border-primary bg-primary/5" : "border-border"
      )}
    >
      <Checkbox
        checked={selected}
        onCheckedChange={(checked) => onToggle(checked === true)}
        className="mt-0.5"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <BlockIcon
            blockType={suggestion.blockType}
            className="h-4 w-4 text-muted-foreground"
          />
          <span className="font-medium">{label}</span>
        </div>
        <p className="text-sm text-muted-foreground">{suggestion.rationale}</p>
      </div>
    </label>
  );
}
