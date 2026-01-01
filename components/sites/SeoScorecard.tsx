"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Search,
  RefreshCw,
  ChevronDown,
  Loader2,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Lightbulb,
  ThumbsUp,
} from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  runSeoAuditAction,
  startSeoAnalysis,
  getSeoAnalysisJob,
  getLatestSeoAnalysisForSite,
} from "@/app/actions/seo";
import { SeoCheckItem } from "@/components/sites/SeoCheckItem";
import {
  groupResultsByCategory,
  groupPageResults,
  getScoreColor,
  type SeoAuditSummary,
  type SeoCheckResult,
} from "@/lib/seo-checks";
import type { SeoAnalysisJob } from "@/lib/drizzle/schema/seo-analysis-jobs";

interface SeoScorecardProps {
  siteId: string;
}

export function SeoScorecard({ siteId }: SeoScorecardProps) {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<SeoAuditSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  // AI Analysis state
  const [aiJob, setAiJob] = useState<SeoAnalysisJob | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiAnalysisOpen, setAiAnalysisOpen] = useState(true);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

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

  // Fetch latest AI analysis
  const fetchLatestAiAnalysis = useCallback(async () => {
    const result = await getLatestSeoAnalysisForSite(siteId);
    if (result.success && result.job) {
      setAiJob(result.job);
      // If job is still pending or analyzing, start polling
      if (result.job.status === "pending" || result.job.status === "analyzing") {
        startPolling(result.job.id);
      }
    }
  }, [siteId]);

  // Poll for job status
  const startPolling = useCallback((jobId: string) => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }

    pollingRef.current = setInterval(async () => {
      const result = await getSeoAnalysisJob(jobId);
      if (result.success && result.job) {
        setAiJob(result.job);
        // Stop polling when complete or failed
        if (result.job.status === "completed" || result.job.status === "failed") {
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
          }
          setAiLoading(false);
        }
      }
    }, 2000); // Poll every 2 seconds
  }, []);

  // Start AI analysis
  const handleStartAnalysis = async () => {
    setAiLoading(true);
    setAiError(null);

    const result = await startSeoAnalysis(siteId);

    if (result.success && result.jobId) {
      // Fetch the job and start polling
      const jobResult = await getSeoAnalysisJob(result.jobId);
      if (jobResult.success && jobResult.job) {
        setAiJob(jobResult.job);
        startPolling(result.jobId);
      }
    } else {
      setAiError(result.error || "Failed to start analysis");
      setAiLoading(false);
    }
  };

  useEffect(() => {
    runAudit();
    fetchLatestAiAnalysis();

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [runAudit, fetchLatestAiAnalysis]);

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

        {/* AI Analysis Section */}
        <div className="border-t pt-6">
          <AiAnalysisSection
            job={aiJob}
            isLoading={aiLoading}
            error={aiError}
            isOpen={aiAnalysisOpen}
            onOpenChange={setAiAnalysisOpen}
            onStartAnalysis={handleStartAnalysis}
          />
        </div>
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

// ============================================================================
// AI Analysis Section
// ============================================================================

interface AiAnalysisSectionProps {
  job: SeoAnalysisJob | null;
  isLoading: boolean;
  error: string | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onStartAnalysis: () => void;
}

interface SeoRecommendation {
  id: string;
  category: "content" | "technical" | "keywords" | "meta";
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  currentState?: string;
  suggestedFix: string;
  pageSlug?: string;
}

interface AiAnalysisResult {
  overallScore: number;
  recommendations: SeoRecommendation[];
  summary: string;
  strengths: string[];
  analyzedAt: string;
}

function AiAnalysisSection({
  job,
  isLoading,
  error,
  isOpen,
  onOpenChange,
  onStartAnalysis,
}: AiAnalysisSectionProps) {
  const isAnalyzing = job?.status === "pending" || job?.status === "analyzing";
  const hasResults = job?.status === "completed" && job?.result;

  // Parse the result if available
  const result = hasResults ? (job.result as AiAnalysisResult) : null;

  return (
    <Collapsible open={isOpen} onOpenChange={onOpenChange}>
      <CollapsibleTrigger className="w-full">
        <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 hover:from-purple-100 hover:to-blue-100 dark:hover:from-purple-950/50 dark:hover:to-blue-950/50 transition-colors">
          <div className="flex flex-col items-start gap-0.5">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span className="font-medium text-sm">AI SEO Analysis</span>
              {hasResults && result && (
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs",
                    result.overallScore >= 80
                      ? "border-green-300 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-950/30 dark:text-green-400"
                      : result.overallScore >= 60
                        ? "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                        : "border-red-300 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-950/30 dark:text-red-400"
                  )}
                >
                  Score: {result.overallScore}/100
                </Badge>
              )}
              {isAnalyzing && (
                <Badge variant="outline" className="text-xs border-purple-300 bg-purple-50 text-purple-700 dark:border-purple-700 dark:bg-purple-950/30 dark:text-purple-400">
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  Analyzing...
                </Badge>
              )}
            </div>
            <span className="text-xs text-muted-foreground text-left">
              Get personalized AI recommendations to improve your search rankings
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
        <div className="pt-4 space-y-4">
          {/* Error state */}
          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Job failed state */}
          {job?.status === "failed" && (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {job.error_message || "Analysis failed. Please try again."}
            </div>
          )}

          {/* Analyzing state */}
          {isAnalyzing && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
                <span>AI is analyzing your site content...</span>
              </div>
              <Progress
                value={job?.progress_percentage ?? 0}
                className="h-2 [&>div]:bg-purple-600"
              />
              <p className="text-xs text-muted-foreground">
                This usually takes 30-60 seconds.
              </p>
            </div>
          )}

          {/* Results state */}
          {hasResults && result && (
            <div className="space-y-6">
              {/* Summary */}
              <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                <p className="text-sm">{result.summary}</p>

                {/* Strengths */}
                {result.strengths.length > 0 && (
                  <div className="pt-2 border-t">
                    <div className="flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-400 mb-2">
                      <ThumbsUp className="h-4 w-4" />
                      Strengths
                    </div>
                    <ul className="space-y-1">
                      {result.strengths.map((strength, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Recommendations */}
              {result.recommendations.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Lightbulb className="h-4 w-4 text-amber-500" />
                    Recommendations ({result.recommendations.length})
                  </div>
                  <div className="space-y-2">
                    {result.recommendations.map((rec) => (
                      <RecommendationItem key={rec.id} recommendation={rec} />
                    ))}
                  </div>
                </div>
              )}

              {/* Last analyzed */}
              <p className="text-xs text-muted-foreground">
                Last analyzed: {new Date(result.analyzedAt).toLocaleString()}
              </p>
            </div>
          )}

          {/* No results state - show analyze button */}
          {!isAnalyzing && !hasResults && (
            <div className="text-center py-4 space-y-3">
              <p className="text-sm text-muted-foreground">
                Get AI-powered recommendations to improve your site&apos;s SEO performance.
              </p>
              <Button
                onClick={onStartAnalysis}
                disabled={isLoading}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                Analyze with AI
              </Button>
            </div>
          )}

          {/* Has results - show re-analyze button */}
          {hasResults && (
            <div className="flex justify-center pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={onStartAnalysis}
                disabled={isLoading || isAnalyzing}
              >
                {isLoading || isAnalyzing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Re-analyze
              </Button>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

// ============================================================================
// Recommendation Item
// ============================================================================

interface RecommendationItemProps {
  recommendation: SeoRecommendation;
}

function RecommendationItem({ recommendation }: RecommendationItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  const priorityConfig = {
    high: {
      icon: AlertCircle,
      badge: "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400",
      label: "High Priority",
    },
    medium: {
      icon: AlertTriangle,
      badge: "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
      label: "Medium Priority",
    },
    low: {
      icon: Lightbulb,
      badge: "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400",
      label: "Low Priority",
    },
  };

  const config = priorityConfig[recommendation.priority];
  const Icon = config.icon;

  const categoryLabels = {
    content: "Content",
    technical: "Technical",
    keywords: "Keywords",
    meta: "Meta Tags",
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="w-full">
        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors text-left">
          <Icon className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium">{recommendation.title}</span>
              <Badge variant="outline" className={cn("text-xs", config.badge)}>
                {config.label}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {categoryLabels[recommendation.category]}
              </Badge>
              {recommendation.pageSlug && (
                <Badge variant="secondary" className="text-xs">
                  /{recommendation.pageSlug}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {recommendation.description}
            </p>
          </div>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform shrink-0 mt-0.5",
              isOpen && "rotate-180"
            )}
          />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="px-3 pb-3 pt-2 ml-7 space-y-3 border-l-2 border-muted">
          {recommendation.currentState && (
            <div>
              <span className="text-xs font-medium text-muted-foreground">Current:</span>
              <p className="text-sm text-muted-foreground">{recommendation.currentState}</p>
            </div>
          )}
          <div>
            <span className="text-xs font-medium text-green-700 dark:text-green-400">Suggested Fix:</span>
            <p className="text-sm">{recommendation.suggestedFix}</p>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
