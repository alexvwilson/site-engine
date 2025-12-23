"use client";

import React from "react";
import { FileAudio, FileVideo, X, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { LANGUAGES } from "@/lib/transcription-constants";
import { cn } from "@/lib/utils";

export interface SelectedFileWithConfig {
  file: File;
  id: string;
  language: string;
  wordLevelTimestamps: boolean;
  status: "pending" | "validating" | "uploading" | "success" | "error";
  progress: number;
  error?: string;
  jobId?: string;
}

interface FileConfigItemProps {
  file: SelectedFileWithConfig;
  onUpdateConfig: (
    fileId: string,
    config: Partial<SelectedFileWithConfig>,
  ) => void;
  onRemove: (fileId: string) => void;
  canUseWordTimestamps: boolean;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

export default function FileConfigItem({
  file,
  onUpdateConfig,
  onRemove,
  canUseWordTimestamps,
}: FileConfigItemProps): React.ReactElement {
  const isAudio = file.file.type.startsWith("audio/");
  const isVideo = file.file.type.startsWith("video/");

  return (
    <div
      className={cn(
        "rounded-lg border p-3 transition-colors",
        file.status === "error" && "border-destructive bg-destructive/5",
        file.status === "success" && "border-green-600 bg-green-50 dark:bg-green-950/20",
      )}
    >
      {/* File info and configuration in horizontal layout */}
      <div className="flex items-center gap-4">
        {/* File icon and info */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {isAudio && (
            <FileAudio className="h-5 w-5 text-muted-foreground shrink-0" />
          )}
          {isVideo && (
            <FileVideo className="h-5 w-5 text-muted-foreground shrink-0" />
          )}
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">{file.file.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(file.file.size)}
            </p>
          </div>
        </div>

        {/* Configuration controls (only if pending) */}
        {file.status === "pending" && (
          <>
            {/* Language selector */}
            <div className="flex items-center gap-2 shrink-0">
              <Label className="text-sm text-muted-foreground shrink-0">
                Language:
              </Label>
              <Select
                value={file.language}
                onValueChange={(value) =>
                  onUpdateConfig(file.id, { language: value })
                }
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Word timestamps checkbox */}
            {canUseWordTimestamps && (
              <div className="flex items-center gap-2 shrink-0">
                <Checkbox
                  id={`word-timestamps-${file.id}`}
                  checked={file.wordLevelTimestamps}
                  onCheckedChange={(checked) =>
                    onUpdateConfig(file.id, { wordLevelTimestamps: !!checked })
                  }
                />
                <Label
                  htmlFor={`word-timestamps-${file.id}`}
                  className="text-sm font-normal cursor-pointer whitespace-nowrap"
                >
                  Word timestamps
                </Label>
              </div>
            )}

            {/* Remove button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(file.id)}
              className="shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </>
        )}

        {/* Validating state */}
        {file.status === "validating" && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground shrink-0">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Validating...</span>
          </div>
        )}

        {/* Uploading state */}
        {file.status === "uploading" && (
          <div className="flex items-center gap-3 shrink-0 min-w-[200px]">
            <Progress value={file.progress} className="flex-1" />
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {file.progress}%
            </span>
          </div>
        )}

        {/* Success state */}
        {file.status === "success" && (
          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 shrink-0">
            <Check className="h-4 w-4" />
            <span>Uploaded</span>
          </div>
        )}

        {/* Error state */}
        {file.status === "error" && (
          <div className="flex items-center gap-2 shrink-0">
            <div className="h-2 w-2 rounded-full bg-destructive shrink-0" />
            <p className="text-sm font-medium text-destructive">
              {file.error || "Upload failed"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
