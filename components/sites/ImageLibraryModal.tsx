"use client";

import { useState } from "react";
import { FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ImageLibraryManager } from "./ImageLibraryManager";

interface ImageLibraryModalProps {
  siteId: string;
}

export function ImageLibraryModal({
  siteId,
}: ImageLibraryModalProps): React.ReactElement {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <FolderOpen className="mr-2 h-4 w-4" />
          Manage Images
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Image Library</DialogTitle>
          <DialogDescription>
            View, search, and delete uploaded images for this site.
          </DialogDescription>
        </DialogHeader>
        <ImageLibraryManager siteId={siteId} onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
