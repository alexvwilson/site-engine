"use client";

import { useTransition, useRef, useEffect, useCallback } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Copy, Trash2 } from "lucide-react";
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
import { SectionStatusToggle } from "./SectionStatusToggle";
import { deleteSection, duplicateSection } from "@/app/actions/sections";
import type { Section } from "@/lib/drizzle/schema/sections";
import { BLOCK_TYPE_INFO } from "@/lib/section-types";
import { useEditorSelection } from "@/contexts/EditorSelectionContext";
import { cn } from "@/lib/utils";

interface SectionCardProps {
  section: Section;
  siteId: string;
}

export function SectionCard({ section, siteId: _siteId }: SectionCardProps): React.ReactElement {
  const [isPending, startTransition] = useTransition();
  const cardRef = useRef<HTMLDivElement>(null);

  const {
    hoveredSectionId,
    selectedSectionId,
    setHoveredSectionId,
    setSelectedSectionId,
    registerEditorSection,
  } = useEditorSelection();

  // Selection state from context
  const isSelected = selectedSectionId === section.id;
  const isHighlighted = hoveredSectionId === section.id && !isSelected;

  // Register ref for scroll sync
  useEffect(() => {
    registerEditorSection(section.id, cardRef.current);
    return () => registerEditorSection(section.id, null);
  }, [section.id, registerEditorSection]);

  const handleSelect = useCallback((): void => {
    setSelectedSectionId(isSelected ? null : section.id);
  }, [isSelected, section.id, setSelectedSectionId]);

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

  // Combine refs for both sortable and scroll sync
  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      setNodeRef(node);
      (cardRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    },
    [setNodeRef]
  );

  return (
    <div
      ref={setRefs}
      style={style}
      className={cn(
        "border rounded-lg bg-card cursor-pointer transition-all",
        isDragging && "shadow-lg opacity-90 z-50",
        isPending && "opacity-50 pointer-events-none",
        isSelected && "ring-2 ring-primary bg-primary/5",
        isHighlighted && "ring-2 ring-primary/50"
      )}
      onClick={handleSelect}
      onMouseEnter={() => setHoveredSectionId(section.id)}
      onMouseLeave={() => setHoveredSectionId(null)}
    >
      {/* Compact Header */}
      <div className="flex items-center gap-2 p-3">
        <button
          className="cursor-grab touch-none text-muted-foreground hover:text-foreground transition-colors"
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <BlockIcon
          blockType={section.block_type}
          className={cn(
            "h-4 w-4 shrink-0",
            isSelected ? "text-primary" : "text-muted-foreground"
          )}
        />

        <span
          className={cn(
            "font-medium text-sm flex-1 truncate",
            isSelected && "text-primary"
          )}
        >
          {blockInfo?.label ?? section.block_type}
        </span>

        {section.anchor_id && (
          <span className="text-xs text-muted-foreground shrink-0">
            #{section.anchor_id}
          </span>
        )}

        <div
          className="flex items-center gap-1 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <SectionStatusToggle
            sectionId={section.id}
            status={section.status}
          />

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleDuplicate}
            disabled={isPending}
          >
            <Copy className="h-3.5 w-3.5" />
            <span className="sr-only">Duplicate section</span>
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                disabled={isPending}
              >
                <Trash2 className="h-3.5 w-3.5" />
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
        </div>
      </div>
    </div>
  );
}
