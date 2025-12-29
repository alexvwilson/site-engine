"use client";

import { useState, useCallback } from "react";
import { Check, ChevronsUpDown, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { createCategory } from "@/app/actions/blog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { BlogCategory } from "@/lib/drizzle/schema/blog-categories";

interface CategorySelectorProps {
  siteId: string;
  categories: BlogCategory[];
  value: string | null;
  onChange: (categoryId: string | null) => void;
  onCategoryCreated?: (category: BlogCategory) => void;
}

export function CategorySelector({
  siteId,
  categories,
  value,
  onChange,
  onCategoryCreated,
}: CategorySelectorProps) {
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const selectedCategory = categories.find((c) => c.id === value);

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = useCallback(async () => {
    const name = newCategoryName.trim();
    if (!name) return;

    setCreating(true);
    const result = await createCategory(siteId, { name });
    setCreating(false);

    if (result.success && result.category) {
      onChange(result.category.id);
      onCategoryCreated?.(result.category);
      setNewCategoryName("");
      setSearchQuery("");
      setOpen(false);
      toast.success(`Category "${result.category.name}" created`);
    } else {
      toast.error(result.error || "Failed to create category");
    }
  }, [siteId, newCategoryName, onChange, onCategoryCreated]);

  const handleSelect = useCallback(
    (categoryId: string | null) => {
      onChange(categoryId);
      setSearchQuery("");
      setOpen(false);
    },
    [onChange]
  );

  const showCreateOption =
    searchQuery.trim() &&
    !categories.some(
      (c) => c.name.toLowerCase() === searchQuery.trim().toLowerCase()
    );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          <span className={cn(!selectedCategory && "text-muted-foreground")}>
            {selectedCategory?.name ?? "Uncategorized"}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0" align="start">
        <div className="p-2">
          <Input
            placeholder="Search or create..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setNewCategoryName(e.target.value);
            }}
            className="h-8"
          />
        </div>
        <Separator />
        <ScrollArea className="max-h-[200px]">
          <div className="p-1">
            {/* Uncategorized option */}
            <button
              type="button"
              onClick={() => handleSelect(null)}
              className={cn(
                "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none",
                "hover:bg-accent hover:text-accent-foreground",
                !value && "bg-accent"
              )}
            >
              <Check
                className={cn("h-4 w-4", value ? "opacity-0" : "opacity-100")}
              />
              <span className="text-muted-foreground">Uncategorized</span>
            </button>

            {/* Existing categories */}
            {filteredCategories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => handleSelect(category.id)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none",
                  "hover:bg-accent hover:text-accent-foreground",
                  value === category.id && "bg-accent"
                )}
              >
                <Check
                  className={cn(
                    "h-4 w-4",
                    value === category.id ? "opacity-100" : "opacity-0"
                  )}
                />
                {category.name}
              </button>
            ))}

            {/* No results message */}
            {filteredCategories.length === 0 && !showCreateOption && (
              <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                No categories found
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Create new category option */}
        {showCreateOption && (
          <>
            <Separator />
            <div className="p-1">
              <button
                type="button"
                onClick={handleCreate}
                disabled={creating}
                className={cn(
                  "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none",
                  "hover:bg-accent hover:text-accent-foreground",
                  "text-primary"
                )}
              >
                {creating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Create &quot;{searchQuery.trim()}&quot;
              </button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
