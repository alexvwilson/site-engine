"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, RefreshCw, ChevronDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { runSeoAuditAction } from "@/app/actions/seo";
import { SeoCheckItem } from "@/components/sites/SeoCheckItem";
import {
  groupResultsByCategory,
  groupPageResults,
  getScoreColor,
  type SeoAuditSummary,
  type SeoCheckResult,
} from "@/lib/seo-checks";

interface SeoScorecardProps {
  siteId: string;
}

export function SeoScorecard({ siteId }: SeoScorecardProps) {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<SeoAuditSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Collapsible states
  const [siteOpen, setSiteOpen] = useState(true);
  const [pagesOpen, setPagesOpen] = useState(false);
  const [contentOpen, setContentOpen] = useState(false);

  const runAudit = useCallback(async () => {
    setLoading(true);
    setError(null);

    const result = await runSeoAuditAction(siteId);

    if (result.success) {
      setSummary(result.data);
    } else {
      setError(result.error);
    }

    setLoading(false);
  }, [siteId]);

  useEffect(() => {
    runAudit();
  }, [runAudit]);

  const scoreColor = summary ? getScoreColor(summary.score) : "red";
  const scoreColorClass = {
    green: "text-green-600",
    yellow: "text-amber-600",
    red: "text-red-600",
  }[scoreColor];

  const progressColorClass = {
    green: "[&>div]:bg-green-600",
    yellow: "[&>div]:bg-amber-500",
    red: "[&>div]:bg-red-500",
  }[scoreColor];

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            SEO Health Check
          </CardTitle>
          <CardDescription>Analyzing your site...</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            SEO Health Check
          </CardTitle>
          <CardDescription>Unable to analyze site</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">{error}</p>
          <Button variant="outline" size="sm" onClick={runAudit} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!summary) {
    return null;
  }

  const grouped = groupResultsByCategory(summary.results);
  const pageResults = groupPageResults(grouped.page);

  // Calculate category summaries
  const sitePassed = grouped.site.filter((r) => r.status === "pass").length;
  const siteTotal = grouped.site.length;

  const pagePassed = grouped.page.filter((r) => r.status === "pass").length;
  const pageTotal = grouped.page.length;

  const contentPassed = grouped.content.filter((r) => r.status === "pass").length;
  const contentTotal = grouped.content.length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              SEO Health Check
            </CardTitle>
            <CardDescription>
              See how well your site is optimized for search engines like Google.
              Higher scores mean better visibility in search results.
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={runAudit}
            disabled={loading}
            className="shrink-0"
          >
            <RefreshCw
              className={cn("h-4 w-4", loading && "animate-spin")}
            />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Score Overview */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Overall Score</span>
            <span className={cn("text-2xl font-bold", scoreColorClass)}>
              {summary.score}%
            </span>
          </div>
          <Progress
            value={summary.score}
            className={cn("h-3", progressColorClass)}
          />
          <div className="text-sm text-muted-foreground space-y-1">
            <p>
              <span className="font-medium text-foreground">{summary.passedChecks}</span> of{" "}
              <span className="font-medium text-foreground">{summary.totalChecks}</span> checks passed
              {summary.warningChecks > 0 && (
                <span className="text-amber-600">
                  {" "}
                  • {summary.warningChecks} could be improved
                </span>
              )}
              {summary.failedChecks > 0 && (
                <span className="text-red-600">
                  {" "}
                  • {summary.failedChecks} missing
                </span>
              )}
            </p>
            <p className="text-xs">
              Click each section below to see details and how to fix any issues.
            </p>
          </div>
        </div>

        {/* Site-Level Checks */}
        {siteTotal > 0 && (
          <CategorySection
            title="Site Settings"
            description="Global SEO settings that apply to your entire site"
            passed={sitePassed}
            total={siteTotal}
            isOpen={siteOpen}
            onOpenChange={setSiteOpen}
          >
            <div className="space-y-1">
              {grouped.site.map((result, idx) => (
                <SeoCheckItem key={`site-${idx}`} result={result} />
              ))}
            </div>
          </CategorySection>
        )}

        {/* Page-Level Checks */}
        {pageTotal > 0 && (
          <CategorySection
            title="Page SEO"
            description="Each page needs its own meta title and description for search results"
            passed={pagePassed}
            total={pageTotal}
            isOpen={pagesOpen}
            onOpenChange={setPagesOpen}
          >
            <div className="space-y-4">
              {Array.from(pageResults.entries()).map(([pageId, { pageName, results }]) => (
                <PageSection
                  key={pageId}
                  pageName={pageName}
                  results={results}
                />
              ))}
            </div>
          </CategorySection>
        )}

        {/* Content Checks */}
        {contentTotal > 0 && (
          <CategorySection
            title="Content Quality"
            description="Images and media should have descriptive alt text for accessibility and SEO"
            passed={contentPassed}
            total={contentTotal}
            isOpen={contentOpen}
            onOpenChange={setContentOpen}
          >
            <div className="space-y-1">
              {grouped.content.map((result, idx) => (
                <SeoCheckItem key={`content-${idx}`} result={result} />
              ))}
            </div>
          </CategorySection>
        )}

        {/* Empty state */}
        {summary.totalChecks === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No SEO checks available. Add pages and content to get started.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

interface CategorySectionProps {
  title: string;
  description: string;
  passed: number;
  total: number;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

function CategorySection({
  title,
  description,
  passed,
  total,
  isOpen,
  onOpenChange,
  children,
}: CategorySectionProps) {
  const allPassed = passed === total;

  return (
    <Collapsible open={isOpen} onOpenChange={onOpenChange}>
      <CollapsibleTrigger className="w-full">
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
          <div className="flex flex-col items-start gap-0.5">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{title}</span>
              <span
                className={cn(
                  "text-xs px-2 py-0.5 rounded-full",
                  allPassed
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                )}
              >
                {passed} of {total} passed
              </span>
            </div>
            <span className="text-xs text-muted-foreground text-left">
              {description}
            </span>
          </div>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform shrink-0",
              isOpen && "rotate-180"
            )}
          />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="pt-3">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
}

interface PageSectionProps {
  pageName: string;
  results: SeoCheckResult[];
}

function PageSection({ pageName, results }: PageSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const passed = results.filter((r) => r.status === "pass").length;
  const total = results.length;
  const allPassed = passed === total;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="w-full">
        <div className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{pageName} page</span>
            <span className="text-xs text-muted-foreground">—</span>
            <span
              className={cn(
                "text-xs",
                allPassed ? "text-green-600" : "text-amber-600"
              )}
            >
              {allPassed ? "All checks passed" : `${passed} of ${total} passed`}
            </span>
          </div>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform",
              isOpen && "rotate-180"
            )}
          />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="pl-4 pt-2 space-y-1">
          {results.map((result, idx) => (
            <SeoCheckItem key={idx} result={result} />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
