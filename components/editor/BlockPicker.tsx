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
import { addSection } from "@/app/actions/sections";
import { BLOCK_TYPE_INFO } from "@/lib/section-types";
import type { BlockType } from "@/lib/drizzle/schema/sections";
import { cn } from "@/lib/utils";

interface BlockPickerProps {
  pageId: string;
  siteId: string;
  className?: string;
}

export function BlockPicker({ pageId, className }: BlockPickerProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSelectBlock = (blockType: BlockType): void => {
    startTransition(async () => {
      await addSection(pageId, blockType);
      setOpen(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className={cn("gap-2", className)}>
          <Plus className="h-4 w-4" />
          Add Section
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
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
              onClick={() => handleSelectBlock(block.type)}
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
      </DialogContent>
    </Dialog>
  );
}
