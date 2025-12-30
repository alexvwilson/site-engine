"use client";

import { useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Icon,
  ICON_CATEGORIES,
} from "@/components/render/utilities/icon-resolver";

interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
  disabled?: boolean;
}

export function IconPicker({
  value,
  onChange,
  disabled,
}: IconPickerProps): React.ReactElement {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredCategories = ICON_CATEGORIES.map((category) => ({
    ...category,
    icons: category.icons.filter((icon) =>
      icon.name.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter((category) => category.icons.length > 0);

  const handleSelect = (iconName: string): void => {
    onChange(iconName);
    setOpen(false);
    setSearch("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          <span className="flex items-center gap-2">
            <Icon name={value} size={18} />
            <span className="text-muted-foreground">{value}</span>
          </span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="start">
        <div className="border-b p-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search icons..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-8"
            />
          </div>
        </div>

        <div className="max-h-72 overflow-y-auto p-2">
          {filteredCategories.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No icons found
            </p>
          ) : (
            filteredCategories.map((category) => (
              <div key={category.name} className="mb-3 last:mb-0">
                <div className="mb-1.5 px-1 text-xs font-medium text-muted-foreground">
                  {category.name}
                </div>
                <div className="grid grid-cols-6 gap-1">
                  {category.icons.map((icon) => (
                    <button
                      key={icon.name}
                      type="button"
                      onClick={() => handleSelect(icon.name)}
                      className={cn(
                        "flex items-center justify-center rounded-md p-2 transition-colors",
                        "hover:bg-accent hover:text-accent-foreground",
                        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
                        value === icon.name && "bg-accent text-accent-foreground"
                      )}
                      title={icon.name}
                    >
                      <Icon name={icon.name} size={18} />
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
