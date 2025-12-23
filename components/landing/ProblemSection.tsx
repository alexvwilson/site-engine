import { X, Check } from "lucide-react";

export default function ProblemSection() {
  const problems = [
    "Manual transcription takes 5-10 hours weekly",
    "Expensive services drain creator budgets ($100+/month)",
    "Inconsistent quality and formatting across tools",
    "No easy way to repurpose content for social media",
  ];

  const solutions = [
    "Automated AI transcription in minutes, not hours",
    "Simple transcription service powered by AI",
    "Consistent, industry-leading 95%+ accuracy with Whisper AI",
    "AI-powered summaries and social captions included",
  ];

  return (
    <section className="bg-background py-16 md:py-20">
      <div className="container mx-auto max-w-7xl px-4">
        {/* Section Header */}
        <div className="mb-12 text-center md:mb-16">
          <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
            AI Transcriptions Made Simple
          </h2>
          <p className="mt-4 text-lg text-muted-foreground md:text-xl">
            See how Skribo makes transcription effortless
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 md:gap-8 lg:gap-12">
          {/* Left: Problems */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-lg transition-shadow hover:shadow-xl md:p-8">
            <div className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                  Stop Wasting Time on Manual Transcription
                </h2>
                <p className="text-lg text-muted-foreground">
                  Content creators lose hours every week to repetitive
                  transcription work that steals time from actual content
                  creation.
                </p>
              </div>
              <div className="space-y-3">
                {problems.map((problem) => (
                  <div
                    key={problem}
                    className="group flex items-start gap-4 rounded-lg p-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-destructive/10">
                      <X
                        className="h-5 w-5 text-destructive"
                        strokeWidth={2.5}
                      />
                    </div>
                    <p className="pt-2 text-foreground">{problem}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Solutions */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-lg transition-shadow hover:shadow-xl md:p-8">
            <div className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                  Start Transcribing Smarter with Skribo
                </h2>
                <p className="text-lg text-muted-foreground">
                  Automate your transcription workflow with AI and reclaim 5-10
                  hours weekly for what matters most.
                </p>
              </div>
              <div className="space-y-3">
                {solutions.map((solution) => (
                  <div
                    key={solution}
                    className="group flex items-start gap-4 rounded-lg p-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-success/10">
                      <Check
                        className="h-5 w-5 text-success"
                        strokeWidth={2.5}
                      />
                    </div>
                    <p className="pt-2 text-foreground">{solution}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
