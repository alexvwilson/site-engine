"use client";

import { Undo2, Redo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface UndoRedoButtonsProps {
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  disabled?: boolean;
}

export function UndoRedoButtons({
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  disabled = false,
}: UndoRedoButtonsProps) {
  const handleUndo = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onUndo();
  };

  const handleRedo = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onRedo();
  };

  return (
    <TooltipProvider>
      <div className="flex items-center gap-0.5">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleUndo}
              disabled={!canUndo || disabled}
              className="h-7 w-7 p-0"
              aria-label="Undo"
            >
              <Undo2 className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>Undo (Ctrl+Z)</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRedo}
              disabled={!canRedo || disabled}
              className="h-7 w-7 p-0"
              aria-label="Redo"
            >
              <Redo2 className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>Redo (Ctrl+Shift+Z)</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
