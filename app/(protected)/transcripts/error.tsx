"use client";

import React from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function TranscriptsError({ error, reset }: ErrorProps) {
  React.useEffect(() => {
    // Log error to console for debugging
    console.error("Transcripts page error:", error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4 text-center">
          <div className="rounded-full bg-destructive/10 p-4">
            <AlertCircle className="h-10 w-10 text-destructive" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Something went wrong</h2>
            <p className="text-muted-foreground">
              We encountered an error while loading your transcription jobs.
            </p>
            {error.message && (
              <p className="text-sm text-muted-foreground">
                Error: {error.message}
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <Button onClick={reset} variant="default">
              Try Again
            </Button>
            <Button onClick={() => window.location.href = "/"} variant="outline">
              Go Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
