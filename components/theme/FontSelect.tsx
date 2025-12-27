"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  SANS_SERIF_FONTS,
  SERIF_FONTS,
  DISPLAY_FONTS,
} from "@/trigger/utils/font-list";

interface FontSelectProps {
  label: string;
  value: string;
  onChange: (font: string) => void;
  type: "heading" | "body";
}

export function FontSelect({ label, value, onChange, type }: FontSelectProps) {
  // Heading fonts can use display fonts, body fonts shouldn't
  const showDisplay = type === "heading";

  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select font" />
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          <SelectGroup>
            <SelectLabel>Sans-Serif</SelectLabel>
            {SANS_SERIF_FONTS.map((font) => (
              <SelectItem key={font} value={font}>
                <span style={{ fontFamily: font }}>{font}</span>
              </SelectItem>
            ))}
          </SelectGroup>
          <SelectGroup>
            <SelectLabel>Serif</SelectLabel>
            {SERIF_FONTS.map((font) => (
              <SelectItem key={font} value={font}>
                <span style={{ fontFamily: font }}>{font}</span>
              </SelectItem>
            ))}
          </SelectGroup>
          {showDisplay && (
            <SelectGroup>
              <SelectLabel>Display</SelectLabel>
              {DISPLAY_FONTS.map((font) => (
                <SelectItem key={font} value={font}>
                  <span style={{ fontFamily: font }}>{font}</span>
                </SelectItem>
              ))}
            </SelectGroup>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
