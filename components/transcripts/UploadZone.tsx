"use client";

import React, { useState, useRef, useCallback } from "react";
import { Upload, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  initiateBatchUpload,
  completeUpload,
  checkBatchUploadAllowed,
} from "@/app/actions/transcriptions";
import { MEDIA_UPLOAD_CONSTRAINTS } from "@/lib/app-utils";
import { cn } from "@/lib/utils";
import type { TranscriptionJob } from "@/lib/drizzle/schema/transcription-jobs";
import FileConfigItem, { type SelectedFileWithConfig } from "./FileConfigItem";

interface UploadZoneProps {
  onJobCreated?: (job: TranscriptionJob) => void;
}

export default function UploadZone({
  onJobCreated,
}: UploadZoneProps): React.ReactElement {
  // Multi-file state
  const [selectedFiles, setSelectedFiles] = useState<SelectedFileWithConfig[]>(
    []
  );
  const [isDragging, setIsDragging] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<{
    total: number;
    success: number;
    failed: number;
  } | null>(null);

  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validate and process selected files
  const processFileSelection = useCallback(async (files: FileList) => {
    // Limit to 5 files max
    const fileArray = Array.from(files).slice(
      0,
      MEDIA_UPLOAD_CONSTRAINTS.MAX_BATCH_UPLOAD_SIZE
    );

    if (fileArray.length === 0) return;

    setIsValidating(true);

    // Create initial selected files with pending status
    const newSelectedFiles: SelectedFileWithConfig[] = fileArray.map(
      (file) => ({
        file,
        id: crypto.randomUUID(),
        language: "auto",
        wordLevelTimestamps: false,
        status: "pending" as const,
        progress: 0,
      })
    );

    setSelectedFiles(newSelectedFiles);

    // Validate batch on server
    try {
      const validationResult = await checkBatchUploadAllowed(
        fileArray.map((f) => ({
          name: f.name,
          size: f.size,
          type: f.type,
        }))
      );

      if (!validationResult.success) {
        // All files rejected
        setSelectedFiles((prev) =>
          prev.map((file) => ({
            ...file,
            status: "error",
            error:
              validationResult.error || "Validation failed. Please try again.",
          }))
        );
        setIsValidating(false);
        return;
      }

      // Update file statuses based on validation results
      const acceptedNames = new Set(
        validationResult.acceptedFiles.map((f) => f.name)
      );
      const rejectedMap = new Map(
        validationResult.rejectedFiles.map((f) => [f.name, f.reason])
      );

      setSelectedFiles((prev) =>
        prev.map((file) => {
          if (acceptedNames.has(file.file.name)) {
            return { ...file, status: "pending" as const };
          } else {
            return {
              ...file,
              status: "error" as const,
              error:
                rejectedMap.get(file.file.name) || "File rejected by validation",
            };
          }
        })
      );
    } catch (error) {
      console.error("Batch validation error:", error);
      setSelectedFiles((prev) =>
        prev.map((file) => ({
          ...file,
          status: "error",
          error: "Validation failed. Please try again.",
        }))
      );
    }

    setIsValidating(false);
  }, []);

  // Handle file input change
  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        processFileSelection(files);
      }
    },
    [processFileSelection]
  );

  // Handle drag events
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        processFileSelection(files);
      }
    },
    [processFileSelection]
  );

  // Handle click to browse
  const handleBrowseClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Update file configuration
  const handleFileConfigUpdate = useCallback(
    (fileId: string, config: Partial<SelectedFileWithConfig>) => {
      setSelectedFiles((prev) =>
        prev.map((file) => (file.id === fileId ? { ...file, ...config } : file))
      );
    },
    []
  );

  // Remove file from selection
  const handleRemoveFile = useCallback((fileId: string) => {
    setSelectedFiles((prev) => prev.filter((file) => file.id !== fileId));
  }, []);

  // Clear all files
  const handleClearBatch = useCallback(() => {
    setSelectedFiles([]);
    setUploadResults(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  // Reset upload state to allow another batch upload
  const handleUploadAnother = useCallback(() => {
    setSelectedFiles([]);
    setUploadResults(null);
    setIsUploading(false);
    setIsValidating(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  // Helper to update individual file status
  const updateFileStatus = useCallback(
    (fileId: string, updates: Partial<SelectedFileWithConfig>) => {
      setSelectedFiles((prev) =>
        prev.map((file) =>
          file.id === fileId ? { ...file, ...updates } : file
        )
      );
    },
    []
  );

  // Upload single file with pre-fetched initiation data (for batch uploads)
  const uploadSingleFileWithInitiateData = async (
    selectedFile: SelectedFileWithConfig,
    initiateData: {
      success: boolean;
      uploadUrl?: string;
      jobId?: string;
      storagePath?: string;
      error?: string;
    }
  ): Promise<{ success: boolean; fileId: string; error?: Error }> => {
    try {
      // Update status to uploading
      updateFileStatus(selectedFile.id, { status: "uploading", progress: 0 });

      if (!initiateData.success || !initiateData.uploadUrl) {
        throw new Error(initiateData.error || "Failed to initiate upload");
      }

      updateFileStatus(selectedFile.id, { progress: 10 });

      // Step 2: Upload file to Supabase
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 75) + 10;
          updateFileStatus(selectedFile.id, { progress: percentComplete });
        }
      });

      await new Promise<void>((resolve, reject) => {
        xhr.addEventListener("load", () => {
          if (xhr.status === 200) {
            resolve();
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        });

        xhr.addEventListener("error", () => {
          reject(new Error("Network error during upload"));
        });

        if (!initiateData.uploadUrl) {
          reject(new Error("Missing upload URL"));
          return;
        }

        xhr.open("PUT", initiateData.uploadUrl);
        xhr.setRequestHeader("Content-Type", selectedFile.file.type);
        xhr.send(selectedFile.file);
      });

      updateFileStatus(selectedFile.id, { progress: 85 });

      // Step 3: Complete upload
      const completeResult = await completeUpload(
        initiateData.jobId!,
        initiateData.storagePath!,
        {
          name: selectedFile.file.name,
          size: selectedFile.file.size,
          type: selectedFile.file.type,
        },
        {
          language:
            selectedFile.language === "auto"
              ? undefined
              : selectedFile.language,
          timestampGranularity: selectedFile.wordLevelTimestamps
            ? "word"
            : "segment",
        }
      );

      if (!completeResult.success) {
        throw new Error(completeResult.error || "Failed to create job");
      }

      // Success!
      updateFileStatus(selectedFile.id, {
        status: "success",
        progress: 100,
        jobId: completeResult.job?.id,
      });

      // Notify parent component
      if (onJobCreated && completeResult.job) {
        onJobCreated(completeResult.job);
      }

      return { success: true, fileId: selectedFile.id };
    } catch (error) {
      console.error("Upload error:", error);
      updateFileStatus(selectedFile.id, {
        status: "error",
        error: error instanceof Error ? error.message : "Upload failed",
      });
      return {
        success: false,
        fileId: selectedFile.id,
        error: error instanceof Error ? error : new Error("Upload failed"),
      };
    }
  };

  // Handle batch upload
  const handleBatchUpload = async (): Promise<void> => {
    setIsUploading(true);
    setUploadResults(null);

    // Get only pending files (not already rejected or uploaded)
    const filesToUpload = selectedFiles.filter((f) => f.status === "pending");

    if (filesToUpload.length === 0) {
      setIsUploading(false);
      return;
    }

    // Step 1: Pre-generate all upload URLs in a single server action call
    const initiateResults = await initiateBatchUpload(
      filesToUpload.map((f) => ({
        name: f.file.name,
        size: f.file.size,
        type: f.file.type,
      }))
    );

    // Create a map of fileName -> initiate result for quick lookup
    const initiateMap = new Map(
      initiateResults.map((result) => [result.fileName, result])
    );

    // Mark files that failed initiation as errors
    filesToUpload.forEach((file) => {
      const result = initiateMap.get(file.file.name);
      if (result && !result.success) {
        updateFileStatus(file.id, {
          status: "error",
          error: result.error || "Failed to initiate upload",
        });
      }
    });

    // Filter to only files that successfully initiated
    const successfulInitiations = filesToUpload.filter((file) => {
      const result = initiateMap.get(file.file.name);
      return result?.success;
    });

    // Step 2: Upload all files in parallel
    const uploadPromises = successfulInitiations.map((file) => {
      const initiateResult = initiateMap.get(file.file.name);
      return uploadSingleFileWithInitiateData(file, initiateResult!);
    });
    const results = await Promise.allSettled(uploadPromises);

    // Calculate success/failure counts
    const successCount = results.filter(
      (r) => r.status === "fulfilled" && r.value.success
    ).length;
    const failedCount = results.length - successCount;

    setUploadResults({
      total: results.length,
      success: successCount,
      failed: failedCount,
    });

    setIsUploading(false);
  };

  // Check if upload button should be disabled
  const hasValidFiles = selectedFiles.some((f) => f.status === "pending");
  const isUploadDisabled = !hasValidFiles || isUploading || isValidating;

  // Count files by status
  const pendingCount = selectedFiles.filter(
    (f) => f.status === "pending"
  ).length;
  const errorCount = selectedFiles.filter((f) => f.status === "error").length;

  // Max file size in MB
  const maxFileSizeMB = Math.round(
    MEDIA_UPLOAD_CONSTRAINTS.MAX_FILE_SIZE / (1024 * 1024)
  );

  return (
    <div className="space-y-6">
      {/* Drag-and-drop upload area */}
      {selectedFiles.length === 0 ? (
        <div
          className={cn(
            "relative rounded-lg border-2 border-dashed p-8 transition-colors",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-muted-foreground/50",
            (isUploading || isValidating) && "pointer-events-none opacity-50"
          )}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={MEDIA_UPLOAD_CONSTRAINTS.ALLOWED_MIME_TYPES.join(",")}
            onChange={handleFileInputChange}
            multiple
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center space-y-2 text-center">
            <div className="rounded-full p-4 bg-primary/10 dark:bg-primary/20">
              <Upload className="h-8 w-8 text-primary" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">
                Drop your audio or video files here
              </h3>
              <p className="text-base text-muted-foreground">
                Upload up to {MEDIA_UPLOAD_CONSTRAINTS.MAX_BATCH_UPLOAD_SIZE}{" "}
                files at once
              </p>
            </div>

            <div className="text-sm text-muted-foreground space-y-1">
              <p>Supported: MP3, MP4, WAV, MOV, M4A</p>
              <p>Max file size: {maxFileSizeMB} MB</p>
            </div>

            <Button onClick={handleBrowseClick} variant="outline">
              Browse Files
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* File list header */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">
                {selectedFiles.length} file
                {selectedFiles.length === 1 ? "" : "s"} selected
              </h3>
              {errorCount > 0 && (
                <p className="text-sm text-muted-foreground">
                  {pendingCount} ready to upload, {errorCount} rejected
                </p>
              )}
            </div>
            {!isUploading && (
              <Button variant="outline" onClick={handleClearBatch}>
                Clear All
              </Button>
            )}
          </div>

          {/* File list */}
          <div className="space-y-3">
            {selectedFiles.map((file) => (
              <FileConfigItem
                key={file.id}
                file={file}
                onUpdateConfig={handleFileConfigUpdate}
                onRemove={handleRemoveFile}
                canUseWordTimestamps={true}
              />
            ))}
          </div>

          {/* Upload button */}
          {!uploadResults && (
            <Button
              onClick={handleBatchUpload}
              disabled={isUploadDisabled}
              className="w-full"
              size="lg"
            >
              {isUploading
                ? "Uploading..."
                : `Upload ${pendingCount} file${pendingCount === 1 ? "" : "s"}`}
            </Button>
          )}

          {/* Upload results summary */}
          {uploadResults && (
            <div className="space-y-3">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {uploadResults.success === uploadResults.total ? (
                    <span className="font-medium text-green-600 dark:text-green-400">
                      All {uploadResults.total} file
                      {uploadResults.total === 1 ? "" : "s"} uploaded
                      successfully!
                    </span>
                  ) : (
                    <span>
                      {uploadResults.success} of {uploadResults.total} file
                      {uploadResults.total === 1 ? "" : "s"} uploaded
                      successfully.{" "}
                      {uploadResults.failed > 0 && (
                        <span className="text-destructive">
                          {uploadResults.failed} failed.
                        </span>
                      )}
                    </span>
                  )}
                </AlertDescription>
              </Alert>

              <Button
                onClick={handleUploadAnother}
                variant="outline"
                className="w-full"
                size="lg"
              >
                Upload Another Batch
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
