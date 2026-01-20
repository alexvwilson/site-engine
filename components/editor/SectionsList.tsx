"use client";

import { useTransition } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { SectionCard } from "./SectionCard";
import { InsertionPoint } from "./InsertionPoint";
import { reorderSections } from "@/app/actions/sections";
import type { Section } from "@/lib/drizzle/schema/sections";
import { FileText } from "lucide-react";

interface SectionsListProps {
  sections: Section[];
  pageId: string;
  siteId: string;
}

export function SectionsList({ sections, pageId, siteId }: SectionsListProps) {
  const [isPending, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent): void => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = sections.findIndex((s) => s.id === active.id);
    const newIndex = sections.findIndex((s) => s.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    // Create new order
    const newSectionIds = [...sections.map((s) => s.id)];
    const [movedId] = newSectionIds.splice(oldIndex, 1);
    newSectionIds.splice(newIndex, 0, movedId);

    startTransition(async () => {
      await reorderSections(pageId, newSectionIds);
    });
  };

  if (sections.length === 0) {
    return (
      <div className="border-2 border-dashed rounded-lg p-12 text-center">
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-muted p-4">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>
        <h3 className="text-lg font-medium mb-2">No sections yet</h3>
        <p className="text-muted-foreground mb-4">
          Add your first section to start building this page.
        </p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis]}
    >
      <SortableContext
        items={sections.map((s) => s.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className={isPending ? "opacity-70" : ""}>
          {/* Insertion point before first section */}
          <InsertionPoint pageId={pageId} siteId={siteId} position={0} />

          {sections.map((section, index) => (
            <div key={section.id}>
              <SectionCard section={section} siteId={siteId} />
              {/* Insertion point after each section */}
              <InsertionPoint
                pageId={pageId}
                siteId={siteId}
                position={index + 1}
              />
            </div>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
