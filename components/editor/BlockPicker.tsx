"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BlockIcon } from "./BlockIcon";
import { TemplateSelector } from "./TemplateSelector";
import { addSection } from "@/app/actions/sections";
import { BLOCK_TYPE_INFO } from "@/lib/section-types";
import type { BlockType } from "@/lib/drizzle/schema/sections";
import type { SectionContent } from "@/lib/section-types";
import { cn } from "@/lib/utils";

interface BlockPickerProps {
  pageId: string;
  siteId: string;
  className?: string;
  position?: number;
  trigger?: React.ReactNode;
  onClose?: () => void;
}

type Step = "block-type" | "template";

export function BlockPicker({
  pageId,
  className,
  position,
  trigger,
  onClose,
}: BlockPickerProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("block-type");
  const [selectedBlockType, setSelectedBlockType] = useState<BlockType | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSelectBlockType = (blockType: BlockType): void => {
    setSelectedBlockType(blockType);
    setStep("template");
  };

  const handleSelectTemplate = (content: SectionContent): void => {
    if (!selectedBlockType) return;

    startTransition(async () => {
      await addSection(pageId, selectedBlockType, position, content);
      handleClose();
      onClose?.();
    });
  };

  const handleBack = (): void => {
    setStep("block-type");
    setSelectedBlockType(null);
  };

  const handleClose = (): void => {
    setOpen(false);
    // Reset state after dialog closes
    setTimeout(() => {
      setStep("block-type");
      setSelectedBlockType(null);
    }, 200);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) handleClose();
      else setOpen(true);
    }}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" className={cn("gap-2", className)}>
            <Plus className="h-4 w-4" />
            Add Section
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        {step === "block-type" ? (
          <>
            <DialogHeader>
              <DialogTitle>Add Section</DialogTitle>
              <DialogDescription>
                Choose a block type to add to your page
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 py-4">
              {BLOCK_TYPE_INFO.map((block) => (
                <button
                  key={block.type}
                  onClick={() => handleSelectBlockType(block.type)}
                  disabled={isPending}
                  className={cn(
                    "flex flex-col items-center p-4 rounded-lg border",
                    "hover:border-primary hover:bg-primary/5 transition-colors",
                    "disabled:opacity-50 disabled:pointer-events-none",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  )}
                >
                  <div className="rounded-full bg-muted p-3 mb-3">
                    <BlockIcon blockType={block.type} className="h-6 w-6" />
                  </div>
                  <span className="font-medium text-sm">{block.label}</span>
                  <span className="text-xs text-muted-foreground text-center mt-1">
                    {block.description}
                  </span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <DialogHeader className="sr-only">
              <DialogTitle>Select Template</DialogTitle>
              <DialogDescription>
                Choose a template for your {selectedBlockType} section
              </DialogDescription>
            </DialogHeader>
            {selectedBlockType && (
              <TemplateSelector
                blockType={selectedBlockType}
                onSelect={handleSelectTemplate}
                onBack={handleBack}
                disabled={isPending}
              />
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
