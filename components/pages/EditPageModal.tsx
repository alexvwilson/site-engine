"use client";

import { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { updatePage } from "@/app/actions/pages";
import type { Page } from "@/lib/drizzle/schema/pages";

interface EditPageModalProps {
  page: Page;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditPageModal({ page, open, onOpenChange }: EditPageModalProps) {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(page.title);
  const [slug, setSlug] = useState(page.slug);
  const [metaTitle, setMetaTitle] = useState(page.meta_title || "");
  const [metaDescription, setMetaDescription] = useState(
    page.meta_description || ""
  );

  // Reset form when page changes
  useEffect(() => {
    setTitle(page.title);
    setSlug(page.slug);
    setMetaTitle(page.meta_title || "");
    setMetaDescription(page.meta_description || "");
  }, [page]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Page title is required");
      return;
    }

    if (!slug.trim()) {
      toast.error("URL slug is required");
      return;
    }

    setLoading(true);
    const result = await updatePage(page.id, {
      title: title.trim(),
      slug: slug.trim(),
      meta_title: metaTitle.trim() || undefined,
      meta_description: metaDescription.trim() || undefined,
    });
    setLoading(false);

    if (result.success) {
      toast.success("Page updated successfully");
      onOpenChange(false);
    } else {
      toast.error(result.error || "Failed to update page");
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!loading) {
      onOpenChange(newOpen);
      if (!newOpen) {
        // Reset to original values on close
        setTitle(page.title);
        setSlug(page.slug);
        setMetaTitle(page.meta_title || "");
        setMetaDescription(page.meta_description || "");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Page</DialogTitle>
          <DialogDescription>
            Update your page details and SEO settings.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Page Title</Label>
            <Input
              id="edit-title"
              placeholder="About Us"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-slug">URL Slug</Label>
            <div className="flex items-center">
              <span className="text-muted-foreground mr-1">/</span>
              <Input
                id="edit-slug"
                placeholder="about-us"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-meta-title">Meta Title (optional)</Label>
            <Input
              id="edit-meta-title"
              placeholder="SEO title for search engines"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-meta-description">
              Meta Description (optional)
            </Label>
            <Textarea
              id="edit-meta-description"
              placeholder="SEO description for search engines..."
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              disabled={loading}
              rows={3}
            />
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
            <Button
              type="submit"
              disabled={loading || !title.trim() || !slug.trim()}
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
