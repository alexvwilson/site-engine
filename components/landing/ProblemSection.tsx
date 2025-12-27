import { X, Check } from "lucide-react";

export default function ProblemSection() {
  const problems = [
    "Waiting days for simple website updates",
    "Expensive developer dependency for every change",
    "Rigid templates that don't match your brand",
    "No way to preview changes before going live",
  ];

  const solutions = [
    "Make changes instantly with visual editing",
    "Full content control without any coding required",
    "AI generates themes that match your brand perfectly",
    "Preview on any device before publishing",
  ];

  return (
    <section className="bg-background py-16 md:py-20">
      <div className="container mx-auto max-w-7xl px-4">
        {/* Section Header */}
        <div className="mb-12 text-center md:mb-16">
          <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
            Website Building Made Simple
          </h2>
          <p className="mt-4 text-lg text-muted-foreground md:text-xl">
            See how Site Engine puts you in control
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 md:gap-8 lg:gap-12">
          {/* Left: Problems */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-lg transition-shadow hover:shadow-xl md:p-8">
            <div className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                  Stop Waiting on Developers
                </h2>
                <p className="text-lg text-muted-foreground">
                  Content managers spend too much time waiting for simple
                  updates that should take minutes, not days.
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
                  Start Building Smarter with Site Engine
                </h2>
                <p className="text-lg text-muted-foreground">
                  Take control of your website with AI-powered tools that make
                  updates fast, easy, and stress-free.
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
