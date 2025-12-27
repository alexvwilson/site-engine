import { Sparkles, Layout, Eye, Rocket } from "lucide-react";

export default function FeaturesSection() {
  const features = [
    {
      icon: Sparkles,
      title: "AI Theme Generation",
      description:
        "Describe your brand in words and let AI create a unique, cohesive theme with colors, typography, and component styles.",
    },
    {
      icon: Layout,
      title: "Visual Page Editor",
      description:
        "Drag-and-drop sections, edit content inline, and see changes instantly. No coding required.",
    },
    {
      icon: Eye,
      title: "Instant Preview",
      description:
        "Preview your pages on desktop, tablet, and mobile before publishing. What you see is what your visitors get.",
    },
    {
      icon: Rocket,
      title: "One-Click Publishing",
      description:
        "When you're ready, publish to your custom domain with a single click. Your changes go live instantly.",
    },
  ];

  return (
    <section className="bg-background py-16 md:py-20">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="text-center space-y-4 mb-12 md:mb-16">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
            Everything You Need to Build Faster
          </h2>
          <p className="text-lg text-muted-foreground md:text-xl max-w-3xl mx-auto">
            Professional website tools powered by AI, designed for content
            managers who value their time.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} {...feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  index,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  description: string;
  index: number;
}) {
  const animationDelayClass = [
    "animate-fade-in",
    "animate-fade-in-delay-1",
    "animate-fade-in-delay-2",
    "animate-fade-in-delay-3",
  ][index % 4];

  return (
    <div
      className={`group relative rounded-xl border border-border/50 bg-card p-8 shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/50 ${animationDelayClass}`}
    >
      <div className="mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary shadow-lg shadow-primary/30 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-primary/40">
          <Icon
            className="w-8 h-8 text-primary-foreground transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110"
            strokeWidth={2.5}
          />
        </div>
      </div>

      <h3 className="mb-3 text-xl font-semibold tracking-tight">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
