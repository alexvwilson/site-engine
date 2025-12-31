"use client";

import { useState, useEffect } from "react";
import { Scale, Loader2, FileText, ExternalLink, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  startLegalPageGeneration,
  getLegalGenerationJob,
  getLatestLegalJobForSite,
  checkExistingLegalPages,
} from "@/app/actions/legal-pages";
import type { Site } from "@/lib/drizzle/schema/sites";
import type {
  BusinessType,
  DataCollectionType,
  Jurisdiction,
  LegalPageType,
  LegalGenerationJob,
} from "@/lib/drizzle/schema/legal-generation-jobs";

// ============================================================================
// Types & Constants
// ============================================================================

interface LegalPagesCardProps {
  site: Site;
}

const BUSINESS_TYPE_OPTIONS: { value: BusinessType; label: string }[] = [
  { value: "ecommerce", label: "E-commerce Store" },
  { value: "blog", label: "Blog / Content Site" },
  { value: "saas", label: "SaaS Application" },
  { value: "portfolio", label: "Portfolio / Personal" },
  { value: "service", label: "Service Business" },
  { value: "other", label: "Other" },
];

const DATA_COLLECTION_OPTIONS: { value: DataCollectionType; label: string; description: string }[] = [
  { value: "contact_forms", label: "Contact Forms", description: "Collect name, email, messages" },
  { value: "analytics", label: "Analytics", description: "Track visitor behavior" },
  { value: "cookies", label: "Cookies", description: "Store preferences, sessions" },
  { value: "user_accounts", label: "User Accounts", description: "Registration, login" },
  { value: "payments", label: "Payments", description: "Process transactions" },
];

const JURISDICTION_OPTIONS: { value: Jurisdiction; label: string }[] = [
  { value: "us", label: "United States" },
  { value: "eu_gdpr", label: "European Union (GDPR)" },
  { value: "uk", label: "United Kingdom" },
  { value: "canada", label: "Canada (PIPEDA)" },
  { value: "australia", label: "Australia" },
  { value: "other", label: "Other / International" },
];

const LEGAL_PAGE_OPTIONS: { value: LegalPageType; label: string; slug: string }[] = [
  { value: "privacy", label: "Privacy Policy", slug: "privacy-policy" },
  { value: "terms", label: "Terms of Service", slug: "terms-of-service" },
  { value: "cookies", label: "Cookie Policy", slug: "cookie-policy" },
];

// ============================================================================
// Component
// ============================================================================

export function LegalPagesCard({ site }: LegalPagesCardProps) {
  // Form state
  const [businessType, setBusinessType] = useState<BusinessType>("other");
  const [dataCollection, setDataCollection] = useState<DataCollectionType[]>([]);
  const [jurisdiction, setJurisdiction] = useState<Jurisdiction>("us");
  const [pagesToGenerate, setPagesToGenerate] = useState<LegalPageType[]>(["privacy", "terms"]);

  // Generation state
  const [generating, setGenerating] = useState(false);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState("");

  // Previous generation state
  const [lastJob, setLastJob] = useState<LegalGenerationJob | null>(null);
  const [existingPages, setExistingPages] = useState<LegalPageType[]>([]);
  const [loading, setLoading] = useState(true);

  // Load previous job and existing pages on mount
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [jobResult, pagesResult] = await Promise.all([
        getLatestLegalJobForSite(site.id),
        checkExistingLegalPages(site.id),
      ]);

      if (jobResult.success && jobResult.job) {
        setLastJob(jobResult.job);
        // Pre-fill form with last job's configuration
        setBusinessType(jobResult.job.business_type);
        setDataCollection(jobResult.job.data_collection);
        setJurisdiction(jobResult.job.jurisdiction);
      }

      if (pagesResult.success && pagesResult.existingPages) {
        setExistingPages(pagesResult.existingPages);
      }

      setLoading(false);
    }

    loadData();
  }, [site.id]);

  // Poll for job status during generation
  useEffect(() => {
    if (!currentJobId || !generating) return;

    const pollInterval = setInterval(async () => {
      const result = await getLegalGenerationJob(currentJobId);

      if (result.success && result.job) {
        setProgress(result.job.progress_percentage);

        // Determine step text based on progress
        if (result.job.progress_percentage < 10) {
          setStep("Initializing...");
        } else if (result.job.progress_percentage < 60) {
          setStep("Generating legal content with AI...");
        } else if (result.job.progress_percentage < 85) {
          setStep("Creating pages...");
        } else if (result.job.progress_percentage < 95) {
          setStep("Updating footer links...");
        } else {
          setStep("Finishing up...");
        }

        if (result.job.status === "completed") {
          clearInterval(pollInterval);
          setGenerating(false);
          setLastJob(result.job);
          setCurrentJobId(null);
          setProgress(0);
          setStep("");

          // Update existing pages
          if (result.job.created_page_ids) {
            const newPages = Object.keys(result.job.created_page_ids) as LegalPageType[];
            setExistingPages((prev) => [...new Set([...prev, ...newPages])]);
          }

          toast.success("Legal pages generated successfully!");
        } else if (result.job.status === "failed") {
          clearInterval(pollInterval);
          setGenerating(false);
          setCurrentJobId(null);
          setProgress(0);
          setStep("");
          toast.error(result.job.error_message || "Generation failed");
        }
      }
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [currentJobId, generating]);

  // Toggle data collection checkbox
  const toggleDataCollection = (type: DataCollectionType) => {
    setDataCollection((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  // Toggle page to generate checkbox
  const togglePageToGenerate = (type: LegalPageType) => {
    setPagesToGenerate((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  // Start generation
  const handleGenerate = async () => {
    if (pagesToGenerate.length === 0) {
      toast.error("Select at least one page to generate");
      return;
    }

    setGenerating(true);
    setProgress(0);
    setStep("Starting generation...");

    const result = await startLegalPageGeneration(site.id, {
      businessType,
      dataCollection,
      jurisdiction,
      pagesToGenerate,
    });

    if (result.success && result.jobId) {
      setCurrentJobId(result.jobId);
    } else {
      setGenerating(false);
      setStep("");
      toast.error(result.error || "Failed to start generation");
    }
  };

  // Build page URL
  const getPageUrl = (slug: string) => `/sites/${site.slug}/${slug}`;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Legal Pages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="h-5 w-5" />
          Legal Pages
        </CardTitle>
        <CardDescription>
          Generate AI-powered Privacy Policy, Terms of Service, and Cookie Policy for your site
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Existing Pages Status */}
        {existingPages.length > 0 && (
          <div className="p-3 bg-muted/50 rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Existing Legal Pages
            </div>
            <div className="flex flex-wrap gap-2">
              {LEGAL_PAGE_OPTIONS.filter((opt) => existingPages.includes(opt.value)).map((opt) => (
                <a
                  key={opt.value}
                  href={getPageUrl(opt.slug)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  <FileText className="h-3 w-3" />
                  {opt.label}
                  <ExternalLink className="h-3 w-3" />
                </a>
              ))}
            </div>
            {lastJob?.created_page_ids && (
              <p className="text-xs text-muted-foreground">
                Edit these pages in the Pages tab to customize the content.
              </p>
            )}
          </div>
        )}

        {/* Generation Progress */}
        {generating && (
          <div className="space-y-3 p-4 border rounded-lg bg-blue-50/50 dark:bg-blue-950/20">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              <span className="text-sm font-medium">Generating Legal Pages...</span>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground">{step}</p>
          </div>
        )}

        {/* Configuration Form */}
        {!generating && (
          <>
            {/* Business Type */}
            <div className="space-y-2">
              <Label>Business Type</Label>
              <Select value={businessType} onValueChange={(v) => setBusinessType(v as BusinessType)}>
                <SelectTrigger className="w-full max-w-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BUSINESS_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Helps generate content specific to your industry
              </p>
            </div>

            <Separator />

            {/* Data Collection */}
            <div className="space-y-3">
              <Label>Data Collection Practices</Label>
              <p className="text-sm text-muted-foreground">
                Select all that apply to your site
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {DATA_COLLECTION_OPTIONS.map((opt) => (
                  <div key={opt.value} className="flex items-start gap-3">
                    <Checkbox
                      id={`dc-${opt.value}`}
                      checked={dataCollection.includes(opt.value)}
                      onCheckedChange={() => toggleDataCollection(opt.value)}
                    />
                    <label htmlFor={`dc-${opt.value}`} className="cursor-pointer">
                      <div className="text-sm font-medium">{opt.label}</div>
                      <div className="text-xs text-muted-foreground">{opt.description}</div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Jurisdiction */}
            <div className="space-y-2">
              <Label>Primary Jurisdiction</Label>
              <Select value={jurisdiction} onValueChange={(v) => setJurisdiction(v as Jurisdiction)}>
                <SelectTrigger className="w-full max-w-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {JURISDICTION_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Determines which privacy laws to reference (GDPR, CCPA, etc.)
              </p>
            </div>

            <Separator />

            {/* Pages to Generate */}
            <div className="space-y-3">
              <Label>Pages to Generate</Label>
              <div className="flex flex-wrap gap-4">
                {LEGAL_PAGE_OPTIONS.map((opt) => {
                  const alreadyExists = existingPages.includes(opt.value);
                  return (
                    <div key={opt.value} className="flex items-center gap-2">
                      <Checkbox
                        id={`page-${opt.value}`}
                        checked={pagesToGenerate.includes(opt.value)}
                        onCheckedChange={() => togglePageToGenerate(opt.value)}
                      />
                      <label htmlFor={`page-${opt.value}`} className="text-sm cursor-pointer">
                        {opt.label}
                      </label>
                      {alreadyExists && (
                        <Badge variant="outline" className="text-xs">
                          Exists
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
              {existingPages.length > 0 && pagesToGenerate.some((p) => existingPages.includes(p)) && (
                <div className="flex items-start gap-2 p-2 bg-amber-50 dark:bg-amber-950/20 rounded text-sm text-amber-700 dark:text-amber-400">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>Existing pages will be updated with new content.</span>
                </div>
              )}
            </div>

            {/* Generate Button */}
            <div className="pt-2">
              <Button
                type="button"
                onClick={handleGenerate}
                disabled={generating || pagesToGenerate.length === 0}
              >
                {generating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : existingPages.length > 0 ? (
                  "Regenerate Legal Pages"
                ) : (
                  "Generate Legal Pages"
                )}
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                AI-generated content should be reviewed by legal counsel before publishing.
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
