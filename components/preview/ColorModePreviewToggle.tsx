"use client";

import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type PreviewColorMode = "light" | "dark";

interface ColorModePreviewToggleProps {
  colorMode: PreviewColorMode;
  onChange: (mode: PreviewColorMode) => void;
}

const MODE_OPTIONS = [
  { mode: "light" as const, icon: Sun, label: "Light" },
  { mode: "dark" as const, icon: Moon, label: "Dark" },
];

export function ColorModePreviewToggle({
  colorMode,
  onChange,
}: ColorModePreviewToggleProps) {
  return (
    <div className="flex items-center gap-1 p-1 rounded-lg bg-muted">
      {MODE_OPTIONS.map(({ mode, icon: Icon, label }) => (
        <Button
          key={mode}
          variant="ghost"
          size="sm"
          onClick={() => onChange(mode)}
          className={cn(
            "h-8 px-3 gap-2",
            colorMode === mode && "bg-background shadow-sm"
          )}
          title={`${label} mode`}
        >
          <Icon className="h-4 w-4" />
          <span className="hidden sm:inline text-xs">{label}</span>
        </Button>
      ))}
    </div>
  );
}
