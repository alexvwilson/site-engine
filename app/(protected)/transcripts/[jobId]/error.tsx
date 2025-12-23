"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function TranscriptError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Transcript viewer error:", error);
  }, [error]);

  return (
    <div className="container mx-auto flex min-h-[60vh] max-w-5xl items-center justify-center px-4 py-8">
      <div className="text-center">
        <div className="mb-4 flex justify-center">
          <div className="rounded-full bg-destructive/10 p-3">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
        </div>

        <h2 className="mb-2 text-2xl font-semibold">Something went wrong</h2>
        <p className="mb-6 text-muted-foreground">
          Failed to load transcript. This might be a temporary issue.
        </p>

        <div className="flex items-center justify-center gap-4">
          <Button onClick={reset} variant="default">
            Try Again
          </Button>
          <Button asChild variant="outline">
            <Link href="/transcripts">Back to Transcripts</Link>
          </Button>
        </div>

        {error.digest && (
          <p className="mt-4 text-xs text-muted-foreground">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
