"use client";

import { useState, useTransition, useMemo } from "react";
import { Plus, Search, Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BlockIcon } from "./BlockIcon";
import { TemplateSelector } from "./TemplateSelector";
import { addSection } from "@/app/actions/sections";
import {
  BLOCK_TYPE_INFO,
  BLOCK_CATEGORIES,
  type BlockCategory,
  type BlockTypeInfo,
} from "@/lib/section-types";
import type { BlockType } from "@/lib/drizzle/schema/sections";
import type { SectionContent } from "@/lib/section-types";
import { cn } from "@/lib/utils";
import { useBlockPickerStorage } from "@/hooks/useBlockPickerStorage";

interface BlockPickerProps {
  pageId: string;
  siteId: string;
  className?: string;
  position?: number;
  trigger?: React.ReactNode;
  onClose?: () => void;
}

type Step = "block-type" | "template";

export function BlockPicker({
  pageId,
  className,
  position,
  trigger,
  onClose,
}: BlockPickerProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("block-type");
  const [selectedBlockType, setSelectedBlockType] = useState<BlockType | null>(
    null
  );
  const [isPending, startTransition] = useTransition();

  // Search and category state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    BlockCategory | "all"
  >("all");

  // Favorites and recent from localStorage
  const { favorites, recent, toggleFavorite, addRecent, isFavorite } =
    useBlockPickerStorage();

  // Filter blocks based on search and category
  const filteredBlocks = useMemo(() => {
    let blocks = BLOCK_TYPE_INFO;

    // Filter by search query (searches across all categories)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      blocks = blocks.filter(
        (block) =>
          block.label.toLowerCase().includes(query) ||
          block.description.toLowerCase().includes(query)
      );
      return blocks;
    }

    // Filter by category (only when not searching)
    if (selectedCategory !== "all") {
      blocks = blocks.filter((block) => block.category === selectedCategory);
    }

    return blocks;
  }, [searchQuery, selectedCategory]);

  // Get blocks for Recent and Favorites sections
  const recentBlocks = useMemo(
    () =>
      recent
        .map((type) => BLOCK_TYPE_INFO.find((b) => b.type === type))
        .filter((b): b is BlockTypeInfo => b !== undefined),
    [recent]
  );

  const favoriteBlocks = useMemo(
    () =>
      favorites
        .map((type) => BLOCK_TYPE_INFO.find((b) => b.type === type))
        .filter((b): b is BlockTypeInfo => b !== undefined),
    [favorites]
  );

  const handleSelectBlockType = (blockType: BlockType): void => {
    addRecent(blockType);
    setSelectedBlockType(blockType);
    setStep("template");
  };

  const handleSelectTemplate = (content: SectionContent): void => {
    if (!selectedBlockType) return;

    startTransition(async () => {
      await addSection(pageId, selectedBlockType, position, content);
      handleClose();
      onClose?.();
    });
  };

  const handleBack = (): void => {
    setStep("block-type");
    setSelectedBlockType(null);
  };

  const handleClose = (): void => {
    setOpen(false);
    // Reset state after dialog closes
    setTimeout(() => {
      setStep("block-type");
      setSelectedBlockType(null);
      setSearchQuery("");
      setSelectedCategory("all");
    }, 200);
  };

  // Block card component with favorite toggle (compact design)
  const BlockCard = ({ block }: { block: BlockTypeInfo }): React.ReactElement => (
    <button
      onClick={() => handleSelectBlockType(block.type)}
      disabled={isPending}
      className={cn(
        "relative flex flex-col items-center p-3 rounded-lg border",
        "hover:border-primary hover:bg-primary/5 transition-colors",
        "disabled:opacity-50 disabled:pointer-events-none",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      )}
    >
      {/* Favorite star button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          toggleFavorite(block.type);
        }}
        className={cn(
          "absolute top-1.5 right-1.5 p-0.5 rounded-full",
          "hover:bg-muted transition-colors",
          isFavorite(block.type)
            ? "text-yellow-500"
            : "text-muted-foreground/40 hover:text-muted-foreground"
        )}
        aria-label={
          isFavorite(block.type)
            ? `Remove ${block.label} from favorites`
            : `Add ${block.label} to favorites`
        }
      >
        <Star
          className="h-3.5 w-3.5"
          fill={isFavorite(block.type) ? "currentColor" : "none"}
        />
      </button>

      <div className="rounded-full bg-muted p-2 mb-2">
        <BlockIcon blockType={block.type} className="h-5 w-5" />
      </div>
      <span className="font-medium text-xs">{block.label}</span>
      <span className="text-[10px] text-muted-foreground text-center mt-0.5 line-clamp-2">
        {block.description}
      </span>
    </button>
  );

  // Section with optional title (compact design)
  const BlockSection = ({
    title,
    blocks,
  }: {
    title?: string;
    blocks: BlockTypeInfo[];
  }): React.ReactElement | null => {
    if (blocks.length === 0) return null;
    return (
      <div className="mb-4">
        {title && (
          <h3 className="text-xs font-medium text-muted-foreground mb-2">
            {title}
          </h3>
        )}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {blocks.map((block) => (
            <BlockCard key={block.type} block={block} />
          ))}
        </div>
      </div>
    );
  };

  // Check if we should show Recent/Favorites sections
  const showRecent =
    selectedCategory === "all" && recentBlocks.length > 0 && !searchQuery.trim();
  const showFavorites =
    selectedCategory === "all" &&
    favoriteBlocks.length > 0 &&
    !searchQuery.trim();

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) handleClose();
        else setOpen(true);
      }}
    >
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" className={cn("gap-2", className)}>
            <Plus className="h-4 w-4" />
            Add Section
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-hidden flex flex-col gap-4">
        {step === "block-type" ? (
          <>
            <DialogHeader>
              <DialogTitle>Add Section</DialogTitle>
              <DialogDescription>
                Choose a block type to add to your page
              </DialogDescription>
            </DialogHeader>

            {/* Search input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search blocks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-9"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Category tabs */}
            <Tabs
              value={selectedCategory}
              onValueChange={(v) =>
                setSelectedCategory(v as BlockCategory | "all")
              }
            >
              <TabsList className="w-full justify-start flex-wrap h-auto gap-1">
                {BLOCK_CATEGORIES.map((cat) => (
                  <TabsTrigger
                    key={cat.id}
                    value={cat.id}
                    className="text-xs px-3"
                  >
                    {cat.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            {/* Block grid with scroll */}
            <div className="overflow-y-auto max-h-[45vh] -mx-6 px-6">
              <div className="py-2">
                {/* Search results */}
                {searchQuery.trim() ? (
                  filteredBlocks.length > 0 ? (
                    <BlockSection blocks={filteredBlocks} />
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      No blocks match &quot;{searchQuery}&quot;
                    </p>
                  )
                ) : (
                  <>
                    {/* Recent section (only in "All" tab) */}
                    {showRecent && (
                      <BlockSection title="Recent" blocks={recentBlocks} />
                    )}

                    {/* Favorites section (only in "All" tab) */}
                    {showFavorites && (
                      <BlockSection title="Favorites" blocks={favoriteBlocks} />
                    )}

                    {/* All blocks or filtered by category */}
                    <BlockSection
                      title={
                        showRecent || showFavorites ? "All Blocks" : undefined
                      }
                      blocks={filteredBlocks}
                    />
                  </>
                )}
              </div>
            </div>
          </>
        ) : (
          <>
            <DialogHeader className="sr-only">
              <DialogTitle>Select Template</DialogTitle>
              <DialogDescription>
                Choose a template for your {selectedBlockType} section
              </DialogDescription>
            </DialogHeader>
            {selectedBlockType && (
              <TemplateSelector
                blockType={selectedBlockType}
                onSelect={handleSelectTemplate}
                onBack={handleBack}
                disabled={isPending}
              />
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
