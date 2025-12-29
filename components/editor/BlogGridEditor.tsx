"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { BlogGridContent } from "@/lib/section-types";

interface BlogGridEditorProps {
  content: BlogGridContent;
  onChange: (content: BlogGridContent) => void;
}

export function BlogGridEditor({ content, onChange }: BlogGridEditorProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Number of Posts</Label>
        <Select
          value={String(content.postCount)}
          onValueChange={(value) =>
            onChange({ ...content, postCount: Number(value) as 3 | 6 | 9 })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3">3 Posts (1 row)</SelectItem>
            <SelectItem value="6">6 Posts (2 rows)</SelectItem>
            <SelectItem value="9">9 Posts (3 rows)</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Posts are displayed in a responsive grid (3 columns on desktop, 2 on
          tablet, 1 on mobile)
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="show-excerpt">Show Excerpts</Label>
          <p className="text-xs text-muted-foreground">
            Display post excerpts below titles
          </p>
        </div>
        <Switch
          id="show-excerpt"
          checked={content.showExcerpt}
          onCheckedChange={(checked) =>
            onChange({ ...content, showExcerpt: checked })
          }
        />
      </div>
    </div>
  );
}
