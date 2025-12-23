"use client";

import { useState } from "react";
import { ArrowLeft, Trash2, Loader2, Clock, Globe } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { deleteJob } from "@/app/actions/transcriptions";
import DownloadDropdown from "./DownloadDropdown";
import type { TranscriptionJob } from "@/lib/drizzle/schema/transcription-jobs";
import type { Transcript } from "@/lib/drizzle/schema/transcripts";
import { Calendar } from "lucide-react";
import { formatDate, formatDuration } from "@/lib/format-utils-client";

interface TranscriptHeaderProps {
  job: TranscriptionJob;
  transcript: Transcript;
}

export default function TranscriptHeader({
  job,
  transcript,
}: TranscriptHeaderProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const result = await deleteJob(job.id);

      if (!result.success) {
        throw new Error(result.error || "Failed to delete transcript");
      }

      toast.success("Your transcript has been permanently deleted");
      router.push("/transcripts");
    } catch (error) {
      console.error("Error deleting transcript:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete transcript"
      );
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="space-y-10">
        {/* Back navigation */}
        <Link
          href="/transcripts"
          className="inline-flex items-center text-base text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Transcripts
        </Link>

        {/* File name and metadata */}
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">
              {job.file_name}
            </h1>
            <div className="flex flex-wrap items-center text-base text-muted-foreground space-x-5">
              <div className="flex justify-center items-center space-x-1.5">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(new Date(job.created_at))}</span>
              </div>
              <div className="flex justify-center items-center space-x-1.5">
                <Clock className="h-4 w-4" />
                <span>{formatDuration(transcript.duration_seconds)}</span>
              </div>
              <div className="flex justify-center items-center space-x-1.5">
                <Globe className="h-4 w-4" />
                <span className="capitalize">
                  {transcript.detected_language || job.language || "Auto"}
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
          <DownloadDropdown jobId={job.id} />

          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowDeleteDialog(true)}
            disabled={isDeleting}
            className="text-red-500 hover:text-red-500 border-red-500/40 hover:bg-destructive/10 dark:hover:bg-destructive/20"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transcript?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{job.file_name}&quot; and all
              associated files including the transcript, all export formats, and AI
              summary. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Permanently"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
