"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Page } from "@/lib/drizzle/schema/pages";

export type BlogSortOption =
  | "newest"
  | "oldest"
  | "updated"
  | "alphabetical"
  | "status";

interface BlogFilterBarProps {
  sortBy: BlogSortOption;
  onSortChange: (value: BlogSortOption) => void;
  pageFilter: string;
  onPageFilterChange: (value: string) => void;
  pages: Page[];
}

export function BlogFilterBar({
  sortBy,
  onSortChange,
  pageFilter,
  onPageFilterChange,
  pages,
}: BlogFilterBarProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Select
        value={sortBy}
        onValueChange={(v) => onSortChange(v as BlogSortOption)}
      >
        <SelectTrigger className="w-[170px]">
          <SelectValue placeholder="Sort by..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Newest First</SelectItem>
          <SelectItem value="oldest">Oldest First</SelectItem>
          <SelectItem value="updated">Recently Updated</SelectItem>
          <SelectItem value="alphabetical">Alphabetical (A-Z)</SelectItem>
          <SelectItem value="status">By Status</SelectItem>
        </SelectContent>
      </Select>

      <Select value={pageFilter} onValueChange={onPageFilterChange}>
        <SelectTrigger className="w-[170px]">
          <SelectValue placeholder="Filter by page..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Pages</SelectItem>
          <SelectItem value="unassigned">Unassigned</SelectItem>
          {pages.map((page) => (
            <SelectItem key={page.id} value={page.id}>
              {page.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
