"use client";

import { useState, useTransition } from "react";
import { Hash, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getAnchorIdError } from "@/lib/anchor-utils";
import { updateSectionAnchorId } from "@/app/actions/sections";
import { cn } from "@/lib/utils";

interface AnchorIdInputProps {
  sectionId: string;
  currentAnchorId: string | null;
}

export function AnchorIdInput({
  sectionId,
  currentAnchorId,
}: AnchorIdInputProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(currentAnchorId || "");
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const validationError = getAnchorIdError(value);
  const error = validationError || serverError;

  const handleSave = (): void => {
    if (validationError) return;

    setServerError(null);
    startTransition(async () => {
      const result = await updateSectionAnchorId(
        sectionId,
        value.trim() || null
      );
      if (result.success) {
        setIsEditing(false);
      } else {
        setServerError(result.error || "Failed to save");
      }
    });
  };

  const handleCancel = (): void => {
    setValue(currentAnchorId || "");
    setServerError(null);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    }
    if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  };

  if (!isEditing) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              className={cn(
                "flex items-center gap-1 text-xs px-2 py-0.5 rounded-full transition-colors",
                currentAnchorId
                  ? "bg-primary/10 text-primary hover:bg-primary/20"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              <Hash className="h-3 w-3" />
              {currentAnchorId || "Add ID"}
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>
              {currentAnchorId
                ? `Anchor: #${currentAnchorId}`
                : "Add anchor ID for navigation"}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div
      className="flex items-center gap-1"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="relative">
        <Hash className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
        <Input
          value={value}
          onChange={(e) => {
            setValue(e.target.value.toLowerCase().replace(/\s/g, "-"));
            setServerError(null);
          }}
          placeholder="section-id"
          className={cn(
            "h-7 w-32 pl-6 text-xs",
            error && "border-destructive focus-visible:ring-destructive"
          )}
          autoFocus
          onKeyDown={handleKeyDown}
          disabled={isPending}
        />
      </div>
      <Button
        size="icon"
        variant="ghost"
        className="h-6 w-6"
        onClick={handleSave}
        disabled={!!validationError || isPending}
      >
        <Check className="h-3 w-3" />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        className="h-6 w-6"
        onClick={handleCancel}
        disabled={isPending}
      >
        <X className="h-3 w-3" />
      </Button>
      {error && (
        <TooltipProvider>
          <Tooltip open>
            <TooltipTrigger asChild>
              <span className="text-xs text-destructive">!</span>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-destructive text-destructive-foreground">
              <p>{error}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}
