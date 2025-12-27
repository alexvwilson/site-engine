"use client";

import { useState } from "react";
import { HexColorPicker, HexColorInput } from "react-colorful";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";

interface ColorPickerFieldProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
}

export function ColorPickerField({
  label,
  value,
  onChange,
}: ColorPickerFieldProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex items-center gap-2 w-full h-9 px-3 rounded-md border bg-background hover:bg-accent/50 transition-colors text-sm"
          >
            <div
              className="w-5 h-5 rounded border shadow-sm flex-shrink-0"
              style={{ backgroundColor: value }}
            />
            <span className="font-mono text-xs uppercase">{value}</span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3" align="start">
          <HexColorPicker color={value} onChange={onChange} />
          <div className="mt-2">
            <HexColorInput
              color={value}
              onChange={onChange}
              prefixed
              className="w-full h-8 px-2 text-sm font-mono rounded border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
