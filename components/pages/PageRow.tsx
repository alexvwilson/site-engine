"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { PageStatusBadge } from "./PageStatusBadge";
import { HomeBadge } from "./HomeBadge";
import { PageActions } from "./PageActions";
import { EditPageModal } from "./EditPageModal";
import { cn } from "@/lib/utils";
import type { Page } from "@/lib/drizzle/schema/pages";

interface PageRowProps {
  page: Page;
  siteId: string;
}

export function PageRow({ page, siteId }: PageRowProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const router = useRouter();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: page.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  function handleRowClick(e: React.MouseEvent) {
    // Don't navigate if clicking on actions dropdown or edit modal trigger
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("[role='menuitem']")) {
      return;
    }
    router.push(`/app/sites/${siteId}/pages/${page.id}`);
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          "border rounded-lg bg-card p-4 flex items-center gap-4 transition-shadow",
          isDragging && "shadow-lg opacity-90 z-50",
          "hover:border-muted-foreground/30"
        )}
      >
        {/* Drag handle */}
        <button
          type="button"
          className="cursor-grab touch-none text-muted-foreground hover:text-foreground transition-colors"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-5 w-5" />
        </button>

        {/* Clickable content area */}
        <div
          className="flex-1 flex items-center gap-4 cursor-pointer min-w-0"
          onClick={handleRowClick}
        >
          {/* Title and slug */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 font-medium">
              <span className="truncate">{page.title}</span>
              {page.is_home && <HomeBadge />}
            </div>
            <div className="text-sm text-muted-foreground truncate">
              /{page.slug}
            </div>
          </div>

          {/* Status badge */}
          <PageStatusBadge status={page.status} />

          {/* Updated time */}
          <div className="text-sm text-muted-foreground whitespace-nowrap hidden sm:block">
            {formatDistanceToNow(new Date(page.updated_at), { addSuffix: true })}
          </div>
        </div>

        {/* Actions menu */}
        <PageActions page={page} onEdit={() => setShowEditModal(true)} />
      </div>

      <EditPageModal
        page={page}
        open={showEditModal}
        onOpenChange={setShowEditModal}
      />
    </>
  );
}
