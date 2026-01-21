"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { LayoutGrid, FileText, Palette } from "lucide-react";

export type EditorMode = "all" | "content" | "layout";

interface EditorModeToggleProps {
  mode: EditorMode;
  onChange: (mode: EditorMode) => void;
  disabled?: boolean;
}

export function EditorModeToggle({
  mode,
  onChange,
  disabled,
}: EditorModeToggleProps): React.ReactElement {
  const handleValueChange = (value: string): void => {
    if (value) {
      onChange(value as EditorMode);
    }
  };

  return (
    <ToggleGroup
      type="single"
      value={mode}
      onValueChange={handleValueChange}
      disabled={disabled}
      variant="outline"
      size="sm"
      className="w-full"
    >
      <ToggleGroupItem
        value="all"
        aria-label="Show all fields"
        className="flex-1 text-xs gap-1"
      >
        <LayoutGrid className="h-3.5 w-3.5" />
        All
      </ToggleGroupItem>
      <ToggleGroupItem
        value="content"
        aria-label="Show content fields only"
        className="flex-1 text-xs gap-1"
      >
        <FileText className="h-3.5 w-3.5" />
        Content
      </ToggleGroupItem>
      <ToggleGroupItem
        value="layout"
        aria-label="Show layout fields only"
        className="flex-1 text-xs gap-1"
      >
        <Palette className="h-3.5 w-3.5" />
        Layout
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
