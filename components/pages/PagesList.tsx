"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageRow } from "./PageRow";
import { EmptyPagesState } from "./EmptyPagesState";
import { CreatePageModal } from "./CreatePageModal";
import type { Page } from "@/lib/drizzle/schema/pages";

interface PagesListProps {
  pages: Page[];
  siteId: string;
}

export function PagesList({ pages, siteId }: PagesListProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);

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

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Page</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pages.map((page) => (
              <PageRow key={page.id} page={page} siteId={siteId} />
            ))}
          </TableBody>
        </Table>
      </div>

      <CreatePageModal
        siteId={siteId}
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
      />
    </>
  );
}
