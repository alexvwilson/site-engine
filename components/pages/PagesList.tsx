"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { PageRow } from "./PageRow";
import { EmptyPagesState } from "./EmptyPagesState";
import { CreatePageModal } from "./CreatePageModal";
import { reorderPages } from "@/app/actions/pages";
import { cn } from "@/lib/utils";
import type { Page } from "@/lib/drizzle/schema/pages";

interface PagesListProps {
  pages: Page[];
  siteId: string;
}

export function PagesList({ pages, siteId }: PagesListProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
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

    const oldIndex = pages.findIndex((p) => p.id === active.id);
    const newIndex = pages.findIndex((p) => p.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    // Create new order
    const newPageIds = [...pages.map((p) => p.id)];
    const [movedId] = newPageIds.splice(oldIndex, 1);
    newPageIds.splice(newIndex, 0, movedId);

    startTransition(async () => {
      await reorderPages(siteId, newPageIds);
    });
  };

  if (pages.length === 0) {
    return (
      <>
        <EmptyPagesState onCreateClick={() => setShowCreateModal(true)} />
        <CreatePageModal
          siteId={siteId}
          open={showCreateModal}
          onOpenChange={setShowCreateModal}
        />
      </>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">
          {pages.length} {pages.length === 1 ? "Page" : "Pages"}
        </h2>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Page
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis]}
      >
        <SortableContext
          items={pages.map((p) => p.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className={cn("space-y-2", isPending && "opacity-70")}>
            {pages.map((page) => (
              <PageRow key={page.id} page={page} siteId={siteId} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <CreatePageModal
        siteId={siteId}
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
      />
    </>
  );
}
