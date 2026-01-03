"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FolderPlus,
  Folder,
  Pencil,
  Trash2,
  Loader2,
  Check,
  X,
  ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  createAlbum,
  updateAlbum,
  deleteAlbum,
  getAlbumsForSite,
} from "@/app/actions/albums";
import type { ImageAlbum } from "@/lib/drizzle/schema/image-albums";

interface AlbumManagerProps {
  siteId: string;
}

type AlbumWithCount = ImageAlbum & { imageCount: number };

export function AlbumManager({ siteId }: AlbumManagerProps): React.ReactElement {
  const [albums, setAlbums] = useState<AlbumWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadAlbums = useCallback(async () => {
    const result = await getAlbumsForSite(siteId);
    if (result.success && result.albums) {
      setAlbums(result.albums);
    }
    setLoading(false);
  }, [siteId]);

  useEffect(() => {
    loadAlbums();
  }, [loadAlbums]);

  const handleCreate = async (): Promise<void> => {
    const name = newAlbumName.trim();
    if (!name) {
      toast.error("Album name is required");
      return;
    }

    setCreating(true);
    const result = await createAlbum(siteId, name);

    if (result.success && result.album) {
      setAlbums((prev) => [...prev, { ...result.album!, imageCount: 0 }]);
      setNewAlbumName("");
      toast.success("Album created");
    } else {
      toast.error(result.error || "Failed to create album");
    }
    setCreating(false);
  };

  const handleStartEdit = (album: AlbumWithCount): void => {
    setEditingId(album.id);
    setEditingName(album.name);
  };

  const handleCancelEdit = (): void => {
    setEditingId(null);
    setEditingName("");
  };

  const handleSaveEdit = async (): Promise<void> => {
    if (!editingId) return;

    const name = editingName.trim();
    if (!name) {
      toast.error("Album name is required");
      return;
    }

    setSavingEdit(true);
    const result = await updateAlbum(editingId, { name });

    if (result.success) {
      setAlbums((prev) =>
        prev.map((a) => (a.id === editingId ? { ...a, name } : a))
      );
      setEditingId(null);
      setEditingName("");
      toast.success("Album renamed");
    } else {
      toast.error(result.error || "Failed to rename album");
    }
    setSavingEdit(false);
  };

  const handleDelete = async (albumId: string): Promise<void> => {
    setDeletingId(albumId);
    const result = await deleteAlbum(albumId);

    if (result.success) {
      setAlbums((prev) => prev.filter((a) => a.id !== albumId));
      toast.success("Album deleted");
    } else {
      toast.error(result.error || "Failed to delete album");
    }
    setDeletingId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Create new album */}
      <div className="flex gap-2">
        <Input
          placeholder="New album name..."
          value={newAlbumName}
          onChange={(e) => setNewAlbumName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleCreate();
            }
          }}
          disabled={creating}
          className="flex-1"
        />
        <Button
          onClick={handleCreate}
          disabled={creating || !newAlbumName.trim()}
          size="sm"
        >
          {creating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FolderPlus className="h-4 w-4" />
          )}
          <span className="ml-2 hidden sm:inline">Create</span>
        </Button>
      </div>

      {/* Album list */}
      {albums.length === 0 ? (
        <div className="py-6 text-center">
          <Folder className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No albums yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Create albums to organize your images
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {albums.map((album) => (
            <div
              key={album.id}
              className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2"
            >
              <Folder className="h-4 w-4 text-muted-foreground shrink-0" />

              {editingId === album.id ? (
                // Edit mode
                <div className="flex flex-1 items-center gap-2">
                  <Input
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSaveEdit();
                      } else if (e.key === "Escape") {
                        handleCancelEdit();
                      }
                    }}
                    disabled={savingEdit}
                    className="h-8 flex-1"
                    autoFocus
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={handleSaveEdit}
                    disabled={savingEdit}
                  >
                    {savingEdit ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4 text-green-600" />
                    )}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={handleCancelEdit}
                    disabled={savingEdit}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                // Display mode
                <>
                  <span className="flex-1 truncate text-sm font-medium">
                    {album.name}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                    <ImageIcon className="h-3 w-3" />
                    {album.imageCount}
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 shrink-0"
                    onClick={() => handleStartEdit(album)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 shrink-0 text-destructive hover:text-destructive"
                        disabled={deletingId === album.id}
                      >
                        {deletingId === album.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete album?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will delete the album &quot;{album.name}&quot;.
                          {album.imageCount > 0 && (
                            <>
                              {" "}
                              The {album.imageCount} image
                              {album.imageCount > 1 ? "s" : ""} in this album
                              will become uncategorized.
                            </>
                          )}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(album.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
