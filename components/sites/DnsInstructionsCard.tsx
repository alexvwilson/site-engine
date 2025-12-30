"use client";

import { useState } from "react";
import { Copy, Check, AlertCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { DnsInstruction } from "@/lib/domain-utils";

interface DnsInstructionsCardProps {
  instructions: DnsInstruction[];
}

export function DnsInstructionsCard({ instructions }: DnsInstructionsCardProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = async (text: string, index: number): Promise<void> => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (instructions.length === 0) {
    return null;
  }

  return (
    <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          DNS Configuration Required
        </CardTitle>
        <CardDescription>
          Add these DNS records at your domain registrar (GoDaddy, Namecheap,
          Cloudflare, etc.)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {instructions.map((instruction, index) => (
          <div
            key={index}
            className="flex items-start justify-between gap-3 p-3 bg-background rounded-lg border"
          >
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  variant="outline"
                  className={
                    instruction.type === "A"
                      ? "bg-blue-100 text-blue-700 border-blue-200"
                      : instruction.type === "CNAME"
                        ? "bg-green-100 text-green-700 border-green-200"
                        : "bg-purple-100 text-purple-700 border-purple-200"
                  }
                >
                  {instruction.type}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {instruction.purpose}
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground font-medium min-w-[50px]">
                    Name:
                  </span>
                  <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">
                    {instruction.name}
                  </code>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-muted-foreground font-medium min-w-[50px]">
                    Value:
                  </span>
                  <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono break-all">
                    {instruction.value}
                  </code>
                </div>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => copyToClipboard(instruction.value, index)}
            >
              {copiedIndex === index ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        ))}

        <p className="text-xs text-muted-foreground pt-2">
          DNS changes can take up to 48 hours to propagate, but usually complete
          within a few minutes. Click &quot;Check Verification&quot; after adding
          the records.
        </p>
      </CardContent>
    </Card>
  );
}
