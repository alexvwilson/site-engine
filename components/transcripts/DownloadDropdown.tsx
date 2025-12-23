"use client";

import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DownloadDropdownProps {
  jobId: string;
}

export default function DownloadDropdown({ jobId }: DownloadDropdownProps) {
  const handleDownload = (format: string) => {
    window.open(`/api/download/${jobId}/${format}`, "_blank");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          Download
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuItem onClick={() => handleDownload("txt")}>
          <span className="font-medium">TXT</span>
          <span className="ml-auto text-xs text-muted-foreground">
            Plain Text
          </span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => handleDownload("srt")}>
          <span className="font-medium">SRT</span>
          <span className="ml-auto text-xs text-muted-foreground">
            Subtitles
          </span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => handleDownload("vtt")}>
          <span className="font-medium">VTT</span>
          <span className="ml-auto text-xs text-muted-foreground">WebVTT</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => handleDownload("json")}>
          <span className="font-medium">JSON</span>
          <span className="ml-auto text-xs text-muted-foreground">
            Structured
          </span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => handleDownload("verbose_json")}>
          <span className="font-medium">Verbose JSON</span>
          <span className="ml-auto text-xs text-muted-foreground">
            Full Data
          </span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => handleDownload("all")}>
          <span className="font-medium">Download All (ZIP)</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
