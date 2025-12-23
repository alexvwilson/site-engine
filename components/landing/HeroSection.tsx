"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="bg-background py-16 sm:py-20 md:py-24 lg:py-32">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="grid gap-12 md:grid-cols-2 md:gap-16 items-center">
          {/* Left Column: Content */}
          <div className="space-y-6">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-5xl lg:text-6xl xl:text-7xl">
              Fast, Affordable Transcriptions and Summaries
            </h1>
            <p className="text-lg text-muted-foreground sm:text-xl md:text-xl lg:text-2xl">
              Transcripts and summaries for your podcasts, meetings, and
              interviews. Fast, accurate, and affordable.
            </p>
            <p className="text-base text-muted-foreground sm:text-lg md:text-xl lg:text-xl">
              Perfect for podcasters, creators, and content teams.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/sign-up">Start Transcribing Free</Link>
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
  { id: 1, label: "Upload", duration: 2000 },
  { id: 2, label: "Transcribe", duration: 2000 },
  { id: 3, label: "Review", duration: 2500 },
  { id: 4, label: "Export", duration: 2500 },
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

      {/* Step 1: Upload */}
      {currentStep === 1 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 animate-fade-in">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <Upload className="h-10 w-10 text-primary" strokeWidth={2.5} />
          </div>
          <h3 className="mb-3 text-2xl font-bold text-foreground sm:text-3xl md:text-3xl lg:text-4xl">
            Upload Your Audio
          </h3>
          <p className="text-center text-base text-muted-foreground sm:text-lg md:text-lg lg:text-xl">
            Drop your podcast, interview, or meeting recording
          </p>
          <div className="mt-6 rounded-lg border border-dashed border-primary/30 bg-primary/5 px-6 py-3">
            <p className="text-sm font-mono text-foreground sm:text-base md:text-base">
              podcast_episode_42.mp3
            </p>
            <p className="text-sm text-muted-foreground sm:text-sm md:text-base">45:23 duration</p>
          </div>
        </div>
      )}

      {/* Step 2: Transcribe */}
      {currentStep === 2 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 animate-fade-in">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
          <h3 className="mb-3 text-2xl font-bold text-foreground sm:text-3xl md:text-3xl lg:text-4xl">
            AI Transcription
          </h3>
          <p className="text-center text-base text-muted-foreground sm:text-lg md:text-lg lg:text-xl">
            Whisper AI converts speech to text with timestamps
          </p>
          <div className="mt-6 w-full max-w-sm space-y-3">
            <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full w-full animate-progress-sweep rounded-full bg-primary" />
            </div>
            <p className="text-center text-sm text-muted-foreground sm:text-base md:text-base">
              Processing with AI...
            </p>
          </div>
        </div>
      )}

      {/* Step 3: Review Transcript */}
      {currentStep === 3 && (
        <div className="absolute inset-0 flex flex-col px-6 pb-6 pt-20 md:px-8 md:pb-8 md:pt-24 animate-fade-in">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <svg
                className="h-5 w-5 text-primary"
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
            </div>
            <h3 className="text-xl font-bold text-foreground sm:text-2xl md:text-2xl lg:text-3xl">
              Accurate Transcript
            </h3>
          </div>
          <p className="mb-4 text-sm text-muted-foreground sm:text-base md:text-base lg:text-lg">
            Word-level timestamps ready for editing
          </p>
          <div className="flex-1 space-y-3 overflow-hidden rounded-lg border border-border bg-muted/30 p-4">
            <p className="animate-slide-in-line-1 font-mono text-sm text-foreground sm:text-base md:text-base lg:text-lg">
              <span className="text-primary font-semibold">[00:00:00]</span>{" "}
              Welcome to The Creator&apos;s Toolkit...
            </p>
            <p className="animate-slide-in-line-2 font-mono text-sm text-foreground sm:text-base md:text-base lg:text-lg">
              <span className="text-primary font-semibold">[00:00:15]</span> Today
              we&apos;re diving deep into AI-powered workflows...
            </p>
            <p className="animate-slide-in-line-3 font-mono text-sm text-foreground sm:text-base md:text-base lg:text-lg">
              <span className="text-primary font-semibold">[00:00:32]</span> The
              biggest challenge I hear from podcasters...
            </p>
            <p className="animate-slide-in-line-4 font-mono text-sm text-foreground/60 sm:text-base md:text-base lg:text-lg">
              <span className="text-primary/60 font-semibold">[00:00:48]</span>{" "}
              Let&apos;s talk about solutions that work...
            </p>
          </div>
        </div>
      )}

      {/* Step 4: Export with AI Summary */}
      {currentStep === 4 && (
        <div className="absolute inset-0 flex flex-col px-6 pb-6 pt-20 md:px-8 md:pb-8 md:pt-24 animate-fade-in">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <svg
                className="h-5 w-5 text-primary"
                fill="none"
                strokeWidth={2.5}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-foreground sm:text-2xl md:text-2xl lg:text-3xl">
              AI Summary + Export
            </h3>
          </div>
          <p className="mb-4 text-sm text-muted-foreground sm:text-base md:text-base lg:text-lg">
            Get show notes, highlights, and multiple formats
          </p>
          <div className="flex-1 space-y-3 overflow-hidden">
            <div className="animate-slide-in-line-1 rounded-lg border border-primary/20 bg-primary/5 p-4">
              <p className="mb-2 text-sm font-semibold text-primary sm:text-base md:text-base lg:text-lg">
                Key Highlights
              </p>
              <ul className="space-y-1 text-sm text-muted-foreground sm:text-sm md:text-base lg:text-base">
                <li>• AI-powered content workflows</li>
                <li>• Time-saving strategies for creators</li>
                <li>• Content repurposing techniques</li>
              </ul>
            </div>
            <div className="animate-slide-in-line-2 rounded-lg border border-border bg-muted/30 p-4">
              <p className="mb-2 text-sm font-semibold text-foreground sm:text-base md:text-base lg:text-lg">
                Export Formats
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-md bg-primary/10 px-3 py-1 text-sm font-medium text-primary sm:text-sm md:text-base">
                  TXT
                </span>
                <span className="rounded-md bg-primary/10 px-3 py-1 text-sm font-medium text-primary sm:text-sm md:text-base">
                  SRT
                </span>
                <span className="rounded-md bg-primary/10 px-3 py-1 text-sm font-medium text-primary sm:text-sm md:text-base">
                  VTT
                </span>
                <span className="rounded-md bg-primary/10 px-3 py-1 text-sm font-medium text-primary sm:text-sm md:text-base">
                  JSON
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
