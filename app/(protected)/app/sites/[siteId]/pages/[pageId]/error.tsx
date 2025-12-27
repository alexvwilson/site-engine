"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function PageEditorError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Page editor error:", error);
  }, [error]);

  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="flex flex-col items-center justify-center text-center px-4">
        <div className="rounded-full bg-destructive/10 p-4 mb-6">
          <AlertCircle className="h-10 w-10 text-destructive" />
        </div>
        <h2 className="text-2xl font-semibold mb-2">Something went wrong</h2>
        <p className="text-muted-foreground max-w-md mb-6">
          We couldn&apos;t load this page editor. Please try again.
        </p>
        <Button onClick={reset}>Try Again</Button>
      </div>
    </div>
  );
}
