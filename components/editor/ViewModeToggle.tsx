"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { PenLine, Columns2, Eye } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type ViewMode = "builder" | "split" | "preview";

interface ViewModeToggleProps {
  value: ViewMode;
  onChange: (value: ViewMode) => void;
  disableSplit?: boolean;
}

export function ViewModeToggle({
  value,
  onChange,
  disableSplit = false,
}: ViewModeToggleProps) {
  const handleChange = (newValue: string): void => {
    if (newValue) {
      onChange(newValue as ViewMode);
    }
  };

  return (
    <ToggleGroup type="single" value={value} onValueChange={handleChange}>
      <Tooltip>
        <TooltipTrigger asChild>
          <ToggleGroupItem value="builder" aria-label="Builder view">
            <PenLine className="h-4 w-4" />
          </ToggleGroupItem>
        </TooltipTrigger>
        <TooltipContent>Builder</TooltipContent>
      </Tooltip>

      {!disableSplit && (
        <Tooltip>
          <TooltipTrigger asChild>
            <ToggleGroupItem value="split" aria-label="Split view">
              <Columns2 className="h-4 w-4" />
            </ToggleGroupItem>
          </TooltipTrigger>
          <TooltipContent>Split View</TooltipContent>
        </Tooltip>
      )}

      <Tooltip>
        <TooltipTrigger asChild>
          <ToggleGroupItem value="preview" aria-label="Preview view">
            <Eye className="h-4 w-4" />
          </ToggleGroupItem>
        </TooltipTrigger>
        <TooltipContent>Preview</TooltipContent>
      </Tooltip>
    </ToggleGroup>
  );
}
