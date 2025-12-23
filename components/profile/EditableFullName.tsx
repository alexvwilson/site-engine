"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateUserFullName } from "@/app/actions/profile";
import { Edit2, Check, X } from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@/contexts/UserContext";

export function EditableFullName() {
  const { full_name } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(full_name || "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    setError(null);
    startTransition(async () => {
      const result = await updateUserFullName(fullName);
      if (result.error) {
        setError(result.error);
      } else {
        setIsEditing(false);
        toast.success("Full name updated successfully");
      }
    });
  };

  const handleCancel = () => {
    setFullName(full_name || "");
    setError(null);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter your full name"
            maxLength={100}
            disabled={isPending}
            className="flex-1"
            autoFocus
          />
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isPending}
            className="h-8 w-8 p-0"
          >
            <Check className="h-4 w-4" />
            <span className="sr-only">Save</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleCancel}
            disabled={isPending}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Cancel</span>
          </Button>
        </div>
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 group">
      <p className="text-sm flex-1">
        {full_name || (
          <span className="text-muted-foreground italic">Not provided</span>
        )}
      </p>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setIsEditing(true)}
        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Edit2 className="h-3 w-3" />
        <span className="sr-only">Edit full name</span>
      </Button>
    </div>
  );
}
