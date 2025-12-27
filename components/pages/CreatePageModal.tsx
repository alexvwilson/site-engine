"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createPage } from "@/app/actions/pages";

interface CreatePageModalProps {
  siteId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreatePageModal({
  siteId,
  open,
  onOpenChange,
}: CreatePageModalProps) {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Page title is required");
      return;
    }

    setLoading(true);
    const result = await createPage(siteId, { title, slug: slug || undefined });
    setLoading(false);

    if (result.success) {
      toast.success("Page created successfully");
      onOpenChange(false);
      setTitle("");
      setSlug("");
    } else {
      toast.error(result.error || "Failed to create page");
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!loading) {
      onOpenChange(newOpen);
      if (!newOpen) {
        setTitle("");
        setSlug("");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Page</DialogTitle>
          <DialogDescription>
            Give your page a title. A URL slug will be generated automatically
            if you don&apos;t provide one.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Page Title</Label>
            <Input
              id="title"
              placeholder="About Us"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">URL Slug (optional)</Label>
            <div className="flex items-center">
              <span className="text-muted-foreground mr-1">/</span>
              <Input
                id="slug"
                placeholder="about-us"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                disabled={loading}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Leave empty to auto-generate from title
            </p>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !title.trim()}>
              {loading ? "Creating..." : "Create Page"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
