"use client";

import { useState, useTransition } from "react";
import { ArrowRight, RefreshCw } from "lucide-react";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { convertSectionToPrimitive } from "@/app/actions/sections";
import type { Section } from "@/lib/drizzle/schema/sections";

interface ConvertBlockDialogProps {
  section: Section;
  oldLabel: string;
  targetLabel: string;
  targetPreset: string;
  onConverted: () => void;
}

export function ConvertBlockDialog({
  section,
  oldLabel,
  targetLabel,
  targetPreset,
  onConverted,
}: ConvertBlockDialogProps): React.ReactElement {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleConvert = (): void => {
    startTransition(async () => {
      const result = await convertSectionToPrimitive(section.id);
      if (result.success) {
        setOpen(false);
        onConverted();
      }
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-6 px-2 text-xs gap-1 shrink-0"
        >
          <RefreshCw className="h-3 w-3" />
          Convert
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Convert to {targetLabel}</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>
                This will convert your <strong>{oldLabel}</strong> section to
                the new <strong>{targetLabel}</strong> block type with the{" "}
                <strong>{targetPreset}</strong> preset.
              </p>
              <div className="flex items-center justify-center gap-2 py-2 text-sm">
                <span className="px-2 py-1 bg-muted rounded font-mono">
                  {oldLabel}
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <span className="px-2 py-1 bg-primary/10 text-primary rounded font-mono">
                  {targetLabel} ({targetPreset})
                </span>
              </div>
              <p className="text-sm">
                Your content will be preserved. This action cannot be undone.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConvert} disabled={isPending}>
            {isPending ? "Converting..." : "Convert"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
