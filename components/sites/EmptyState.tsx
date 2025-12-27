"use client";

import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateSiteModal } from "./CreateSiteModal";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="rounded-full bg-muted p-6 mb-6">
        <Globe className="h-12 w-12 text-muted-foreground" />
      </div>
      <h2 className="text-2xl font-semibold mb-2">No sites yet</h2>
      <p className="text-muted-foreground text-center max-w-md mb-6">
        Get started by creating your first website. You can add pages, customize
        themes, and publish when you&apos;re ready.
      </p>
      <CreateSiteModal>
        <Button size="lg">Create Your First Site</Button>
      </CreateSiteModal>
    </div>
  );
}
