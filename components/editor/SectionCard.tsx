"use client";

import { useState, useTransition } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Copy,
  Trash2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { BlockIcon } from "./BlockIcon";
import { SectionEditor } from "./SectionEditor";
import { SectionStatusToggle } from "./SectionStatusToggle";
import { deleteSection, duplicateSection } from "@/app/actions/sections";
import type { Section } from "@/lib/drizzle/schema/sections";
import { BLOCK_TYPE_INFO } from "@/lib/section-types";
import { cn } from "@/lib/utils";

interface SectionCardProps {
  section: Section;
}

export function SectionCard({ section }: SectionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const blockInfo = BLOCK_TYPE_INFO.find((b) => b.type === section.block_type);

  const handleDelete = (): void => {
    startTransition(async () => {
      await deleteSection(section.id);
    });
  };

  const handleDuplicate = (): void => {
    startTransition(async () => {
      await duplicateSection(section.id);
    });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "border rounded-lg bg-card transition-shadow",
        isDragging && "shadow-lg opacity-90 z-50",
        isPending && "opacity-50 pointer-events-none"
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b">
        <button
          className="cursor-grab touch-none text-muted-foreground hover:text-foreground transition-colors"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-5 w-5" />
        </button>

        <BlockIcon blockType={section.block_type} className="h-5 w-5 text-muted-foreground" />

        <span className="font-medium">
          {blockInfo?.label ?? section.block_type}
        </span>

        <SectionStatusToggle
          sectionId={section.id}
          status={section.status}
        />

        <div className="flex-1" />

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleDuplicate}
            disabled={isPending}
          >
            <Copy className="h-4 w-4" />
            <span className="sr-only">Duplicate section</span>
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                disabled={isPending}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete section</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete section?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete this {blockInfo?.label.toLowerCase() ?? "section"}.
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
            <span className="sr-only">
              {isExpanded ? "Collapse" : "Expand"} section
            </span>
          </Button>
        </div>
      </div>

      {/* Content Editor */}
      {isExpanded && (
        <div className="p-4">
          <SectionEditor section={section} />
        </div>
      )}
    </div>
  );
}
