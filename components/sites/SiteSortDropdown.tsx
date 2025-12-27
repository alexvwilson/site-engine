"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SiteSortField } from "@/lib/queries/sites";

interface SiteSortDropdownProps {
  currentSort: SiteSortField;
}

const SORT_OPTIONS: { value: SiteSortField; label: string }[] = [
  { value: "updated_at", label: "Last Updated" },
  { value: "name", label: "Name (A-Z)" },
  { value: "created_at", label: "Date Created" },
];

export function SiteSortDropdown({ currentSort }: SiteSortDropdownProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "updated_at") {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }
    router.push(`/app?${params.toString()}`);
  };

  return (
    <Select value={currentSort} onValueChange={handleSortChange}>
      <SelectTrigger className="w-[160px]">
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent>
        {SORT_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
