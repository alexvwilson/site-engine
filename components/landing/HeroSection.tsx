"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Palette, LayoutGrid, Monitor, Rocket } from "lucide-react";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="bg-background py-16 sm:py-20 md:py-24 lg:py-32">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="grid gap-12 md:grid-cols-2 md:gap-16 items-center">
          {/* Left Column: Content */}
          <div className="space-y-6">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-5xl lg:text-6xl xl:text-7xl">
              Build Beautiful Websites Without Code
            </h1>
            <p className="text-lg text-muted-foreground sm:text-xl md:text-xl lg:text-2xl">
              AI-powered theme generation and intuitive content management for
              creators and businesses.
            </p>
            <p className="text-base text-muted-foreground sm:text-lg md:text-xl lg:text-xl">
              Create stunning pages in minutes, not days.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/contact">Let&apos;s Talk</Link>
              </Button>
            </div>
          </div>

          {/* Right Column: Demo Preview */}
          <div className="relative">
            <DemoPreview />
          </div>
        </div>
      </div>
    </section>
  );
}

const DEMO_STEPS = [
  { id: 1, label: "Design", duration: 2000 },
  { id: 2, label: "Build", duration: 2000 },
  { id: 3, label: "Preview", duration: 2500 },
  { id: 4, label: "Publish", duration: 2500 },
];

function DemoPreview() {
  const [stepIndex, setStepIndex] = React.useState(0);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setStepIndex((prev) => (prev + 1) % DEMO_STEPS.length);
    }, DEMO_STEPS[stepIndex].duration);

    return () => clearTimeout(timer);
  }, [stepIndex]);

  const currentStep = stepIndex + 1;

  return (
    <div className="relative h-[400px] md:h-[500px] w-full overflow-hidden rounded-lg border border-border bg-card shadow-2xl">
      {/* Step Indicator */}
      <div className="absolute left-0 right-0 top-0 border-b border-border bg-card px-6 py-4">
        <div className="flex items-center w-full">
          {DEMO_STEPS.map((step, idx) => (
            <React.Fragment key={step.id}>
              <div
                className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold transition-all ${
                  idx === stepIndex
                    ? "border-2 border-primary bg-primary/10 text-primary scale-110"
                    : idx < stepIndex
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {idx < stepIndex ? (
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    strokeWidth={3}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  step.id
                )}
              </div>
              {idx < DEMO_STEPS.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-2 transition-all ${
                    idx < stepIndex ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Step 1: Design - AI Theme Generation */}
      {currentStep === 1 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 animate-fade-in">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <Palette className="h-10 w-10 text-primary" strokeWidth={2.5} />
          </div>
          <h3 className="mb-3 text-2xl font-bold text-foreground sm:text-3xl md:text-3xl lg:text-4xl">
            Describe Your Brand
          </h3>
          <p className="text-center text-base text-muted-foreground sm:text-lg md:text-lg lg:text-xl">
            Tell AI about your style and watch the magic happen
          </p>
          <div className="mt-6 rounded-lg border border-dashed border-primary/30 bg-primary/5 px-6 py-3">
            <p className="text-sm font-mono text-foreground sm:text-base md:text-base">
              &quot;Modern, minimal, professional...&quot;
            </p>
            <div className="mt-2 flex gap-2">
              <span className="h-4 w-4 rounded-full bg-blue-500" />
              <span className="h-4 w-4 rounded-full bg-slate-800" />
              <span className="h-4 w-4 rounded-full bg-emerald-500" />
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Build - Visual Editor */}
      {currentStep === 2 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 animate-fade-in">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <LayoutGrid className="h-10 w-10 text-primary" strokeWidth={2.5} />
          </div>
          <h3 className="mb-3 text-2xl font-bold text-foreground sm:text-3xl md:text-3xl lg:text-4xl">
            Add Your Content
          </h3>
          <p className="text-center text-base text-muted-foreground sm:text-lg md:text-lg lg:text-xl">
            Drag sections, edit text, upload images
          </p>
          <div className="mt-6 w-full max-w-sm space-y-2">
            <div className="animate-slide-in-line-1 h-12 rounded-lg border border-border bg-muted/50 flex items-center px-4">
              <span className="text-sm text-muted-foreground">Hero Section</span>
            </div>
            <div className="animate-slide-in-line-2 h-12 rounded-lg border border-primary bg-primary/10 flex items-center px-4">
              <span className="text-sm text-primary font-medium">+ Add Features</span>
            </div>
            <div className="animate-slide-in-line-3 h-12 rounded-lg border border-border bg-muted/50 flex items-center px-4">
              <span className="text-sm text-muted-foreground">Contact Form</span>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Preview - Device Preview */}
      {currentStep === 3 && (
        <div className="absolute inset-0 flex flex-col px-6 pb-6 pt-20 md:px-8 md:pb-8 md:pt-24 animate-fade-in">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Monitor className="h-5 w-5 text-primary" strokeWidth={2.5} />
            </div>
            <h3 className="text-xl font-bold text-foreground sm:text-2xl md:text-2xl lg:text-3xl">
              Preview Every Device
            </h3>
          </div>
          <p className="mb-4 text-sm text-muted-foreground sm:text-base md:text-base lg:text-lg">
            See exactly how visitors will experience your site
          </p>
          <div className="flex-1 flex items-center justify-center gap-4">
            <div className="animate-slide-in-line-1 w-32 h-48 rounded-lg border-2 border-primary bg-card shadow-lg flex flex-col">
              <div className="h-6 border-b border-border bg-muted/50 rounded-t-lg" />
              <div className="flex-1 p-2 space-y-1">
                <div className="h-2 w-full bg-muted rounded" />
                <div className="h-2 w-3/4 bg-muted rounded" />
              </div>
            </div>
            <div className="animate-slide-in-line-2 w-20 h-36 rounded-lg border border-border bg-card shadow-md flex flex-col">
              <div className="h-4 border-b border-border bg-muted/50 rounded-t-lg" />
              <div className="flex-1 p-1.5 space-y-1">
                <div className="h-1.5 w-full bg-muted rounded" />
                <div className="h-1.5 w-3/4 bg-muted rounded" />
              </div>
            </div>
            <div className="animate-slide-in-line-3 w-12 h-24 rounded-lg border border-border bg-card shadow-sm flex flex-col">
              <div className="h-3 border-b border-border bg-muted/50 rounded-t-lg" />
              <div className="flex-1 p-1 space-y-0.5">
                <div className="h-1 w-full bg-muted rounded" />
                <div className="h-1 w-3/4 bg-muted rounded" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Publish - Go Live */}
      {currentStep === 4 && (
        <div className="absolute inset-0 flex flex-col px-6 pb-6 pt-20 md:px-8 md:pb-8 md:pt-24 animate-fade-in">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Rocket className="h-5 w-5 text-primary" strokeWidth={2.5} />
            </div>
            <h3 className="text-xl font-bold text-foreground sm:text-2xl md:text-2xl lg:text-3xl">
              Publish Instantly
            </h3>
          </div>
          <p className="mb-4 text-sm text-muted-foreground sm:text-base md:text-base lg:text-lg">
            One click and your site is live on your custom domain
          </p>
          <div className="flex-1 space-y-3 overflow-hidden">
            <div className="animate-slide-in-line-1 rounded-lg border border-primary/20 bg-primary/5 p-4">
              <p className="mb-2 text-sm font-semibold text-primary sm:text-base md:text-base lg:text-lg">
                ✓ Site Published
              </p>
              <p className="text-sm text-muted-foreground font-mono">
                yourbrand.com
              </p>
            </div>
            <div className="animate-slide-in-line-2 rounded-lg border border-border bg-muted/30 p-4">
              <p className="mb-2 text-sm font-semibold text-foreground sm:text-base md:text-base lg:text-lg">
                What&apos;s Included
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-md bg-primary/10 px-3 py-1 text-sm font-medium text-primary sm:text-sm md:text-base">
                  SSL
                </span>
                <span className="rounded-md bg-primary/10 px-3 py-1 text-sm font-medium text-primary sm:text-sm md:text-base">
                  CDN
                </span>
                <span className="rounded-md bg-primary/10 px-3 py-1 text-sm font-medium text-primary sm:text-sm md:text-base">
                  Analytics
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes progress-sweep {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(0);
          }
        }

        @keyframes slide-in-line {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-progress-sweep {
          animation: progress-sweep 1.5s ease-out forwards;
        }

        .animate-slide-in-line-1 {
          animation: slide-in-line 0.4s ease-out 0.1s forwards;
          opacity: 0;
        }

        .animate-slide-in-line-2 {
          animation: slide-in-line 0.4s ease-out 0.3s forwards;
          opacity: 0;
        }

        .animate-slide-in-line-3 {
          animation: slide-in-line 0.4s ease-out 0.5s forwards;
          opacity: 0;
        }

        .animate-slide-in-line-4 {
          animation: slide-in-line 0.4s ease-out 0.7s forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
