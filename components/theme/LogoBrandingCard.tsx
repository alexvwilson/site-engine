"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Image as ImageIcon, Eye, Clock } from "lucide-react";
import { getPastLogoJobs, type PastLogoJob } from "@/app/actions/logo-generation";
import type { Site } from "@/lib/drizzle/schema/sites";
import type { HeaderContent } from "@/lib/section-types";

interface LogoBrandingCardProps {
  site: Site;
  headerContent?: HeaderContent | null;
  onGenerateClick: () => void;
  onViewPastJob: (jobId: string) => void;
}

const PERSONALITY_LABELS: Record<string, string> = {
  professional: "Professional",
  consumer: "Consumer-Friendly",
  tech: "Tech / AI",
  creative: "Creative",
};

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

export function LogoBrandingCard({
  site,
  headerContent,
  onGenerateClick,
  onViewPastJob,
}: LogoBrandingCardProps) {
  const currentLogo = headerContent?.logoUrl;
  const brandPersonality = site.brand_personality;
  const [pastJobs, setPastJobs] = useState<PastLogoJob[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);

  // Fetch past jobs on mount
  useEffect(() => {
    async function fetchPastJobs() {
      const result = await getPastLogoJobs(site.id);
      if (result.success && result.jobs) {
        setPastJobs(result.jobs);
      }
      setIsLoadingJobs(false);
    }
    fetchPastJobs();
  }, [site.id]);

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Logo & Branding</CardTitle>
          <Button onClick={onGenerateClick}>
            <Sparkles className="h-4 w-4 mr-2" />
            Generate Logo Prompts
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Logo Status */}
          {currentLogo ? (
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-lg border bg-muted/50 flex items-center justify-center overflow-hidden">
                <img
                  src={currentLogo}
                  alt="Site logo"
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="flex-1">
                <p className="font-medium">Logo configured</p>
                <p className="text-sm text-muted-foreground">
                  Displayed in header across all pages
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4 p-4 rounded-lg border border-dashed">
              <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                <ImageIcon className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-medium">No logo yet</p>
                <p className="text-sm text-muted-foreground">
                  Generate AI prompts for ChatGPT or upload your own
                </p>
              </div>
            </div>
          )}

          {/* Brand Personality */}
          {brandPersonality && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Brand Personality:</span>
              <Badge variant="secondary">
                {PERSONALITY_LABELS[brandPersonality] || brandPersonality}
              </Badge>
            </div>
          )}

          {/* Description Preview */}
          {site.description && (
            <div className="text-sm">
              <span className="text-muted-foreground">Site Description: </span>
              <span className="text-foreground">
                {site.description.length > 100
                  ? `${site.description.substring(0, 100)}...`
                  : site.description}
              </span>
            </div>
          )}

          {/* Previous Generations */}
          {!isLoadingJobs && pastJobs.length > 0 && (
            <div className="pt-2 border-t">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Previous Generations</span>
              </div>
              <div className="space-y-2">
                {pastJobs.map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                  >
                    <div className="text-sm">
                      <span className="text-muted-foreground">
                        {formatDate(job.createdAt)}
                      </span>
                      <span className="mx-2 text-muted-foreground">•</span>
                      <span>{job.conceptCount} concepts</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewPastJob(job.id)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
