"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Page } from "@/lib/drizzle/schema/pages";

interface PageSelectorProps {
  pages: Page[];
  value: string | null;
  onChange: (pageId: string | null) => void;
}

export function PageSelector({ pages, value, onChange }: PageSelectorProps) {
  return (
    <Select
      value={value ?? "none"}
      onValueChange={(v) => onChange(v === "none" ? null : v)}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select a page..." />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">
          <span className="text-muted-foreground">No page assigned</span>
        </SelectItem>
        {pages.map((page) => (
          <SelectItem key={page.id} value={page.id}>
            {page.title}
            {page.is_home && (
              <span className="ml-2 text-xs text-muted-foreground">(Home)</span>
            )}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
