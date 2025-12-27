"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { TableCell, TableRow } from "@/components/ui/table";
import { PageStatusBadge } from "./PageStatusBadge";
import { HomeBadge } from "./HomeBadge";
import { PageActions } from "./PageActions";
import { EditPageModal } from "./EditPageModal";
import type { Page } from "@/lib/drizzle/schema/pages";

interface PageRowProps {
  page: Page;
  siteId: string;
}

export function PageRow({ page, siteId }: PageRowProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const router = useRouter();

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
      <TableRow
        className="cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={handleRowClick}
      >
        <TableCell className="font-medium">
          <div className="flex items-center gap-2">
            {page.title}
            {page.is_home && <HomeBadge />}
          </div>
        </TableCell>
        <TableCell className="text-muted-foreground">/{page.slug}</TableCell>
        <TableCell>
          <PageStatusBadge status={page.status} />
        </TableCell>
        <TableCell className="text-muted-foreground">
          {formatDistanceToNow(new Date(page.updated_at), { addSuffix: true })}
        </TableCell>
        <TableCell className="text-right">
          <PageActions page={page} onEdit={() => setShowEditModal(true)} />
        </TableCell>
      </TableRow>

      <EditPageModal
        page={page}
        open={showEditModal}
        onOpenChange={setShowEditModal}
      />
    </>
  );
}
