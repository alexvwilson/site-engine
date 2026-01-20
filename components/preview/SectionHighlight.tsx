"use client";

import { useRef, useEffect } from "react";
import { useEditorSelection } from "@/contexts/EditorSelectionContext";
import { BLOCK_TYPE_INFO } from "@/lib/section-types";
import { cn } from "@/lib/utils";

interface SectionHighlightProps {
  sectionId: string;
  blockType: string;
  children: React.ReactNode;
}

export function SectionHighlight({
  sectionId,
  blockType,
  children,
}: SectionHighlightProps): React.ReactElement {
  const {
    hoveredSectionId,
    selectedSectionId,
    setHoveredSectionId,
    setSelectedSectionId,
    registerPreviewSection,
  } = useEditorSelection();

  const ref = useRef<HTMLDivElement>(null);

  // Register ref for scroll sync
  useEffect(() => {
    registerPreviewSection(sectionId, ref.current);
    return () => registerPreviewSection(sectionId, null);
  }, [sectionId, registerPreviewSection]);

  const isHovered = hoveredSectionId === sectionId;
  const isSelected = selectedSectionId === sectionId;
  const isHighlighted = isHovered || isSelected;

  const blockInfo = BLOCK_TYPE_INFO.find((b) => b.type === blockType);

  const handleClick = (e: React.MouseEvent): void => {
    // Don't interfere with clicks on interactive elements
    const target = e.target as HTMLElement;
    if (target.closest("a, button, input, textarea, select")) {
      return;
    }
    e.stopPropagation();
    setSelectedSectionId(sectionId);
  };

  return (
    <div
      ref={ref}
      data-section-id={sectionId}
      data-section-type={blockType}
      className={cn(
        "relative transition-all duration-200",
        isHighlighted &&
          "ring-2 ring-primary ring-offset-2 ring-offset-background rounded-sm"
      )}
      onMouseEnter={() => setHoveredSectionId(sectionId)}
      onMouseLeave={() => setHoveredSectionId(null)}
      onClick={handleClick}
    >
      {children}

      {/* Floating label showing section type */}
      {isHighlighted && (
        <div
          className={cn(
            "absolute -top-3 left-4 z-50 px-2 py-0.5 text-xs font-medium rounded shadow-sm",
            "bg-primary text-primary-foreground",
            "pointer-events-none"
          )}
        >
          {blockInfo?.label ?? blockType}
        </div>
      )}
    </div>
  );
}
