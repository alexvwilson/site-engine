"use client";

import React from "react";
import Link from "next/link";
import { FileAudio, FileVideo, FileText, X, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CompletedJobCardProps {
  jobId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  onClear: () => void;
}

export default function CompletedJobCard({
  jobId,
  fileName,
  fileSize,
  fileType,
  onClear,
}: CompletedJobCardProps) {
  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Determine if file is video
  const isVideo = fileType.startsWith("video/");

  return (
    <div className="relative rounded-lg border bg-card p-4 transition-colors">
      {/* Completion Badge */}
      <div className="absolute right-4 top-4">
        <Badge
          variant="default"
          className={cn(
            "bg-green-500 text-white hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700",
          )}
        >
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Complete
        </Badge>
      </div>

      <div className="space-y-4">
        {/* File Info */}
        <div className="flex items-start gap-3 pr-24">
          {/* File Icon */}
          <div className="rounded-lg bg-muted p-2">
            {isVideo ? (
              <FileVideo className="h-5 w-5 text-muted-foreground" />
            ) : (
              <FileAudio className="h-5 w-5 text-muted-foreground" />
            )}
          </div>

          {/* File Details */}
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-medium">{fileName}</h3>
            <p className="text-sm text-muted-foreground">
              {formatFileSize(fileSize)} • Unknown
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button asChild className="flex-1 sm:flex-none">
            <Link href={`/transcripts/${jobId}`}>
              <FileText className="mr-2 h-4 w-4" />
              View Transcript
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="h-9 w-9 p-0"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Clear completed upload</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
