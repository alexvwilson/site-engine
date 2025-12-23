import { Sparkles, FileText, Brain, Clock, Zap, Shield } from "lucide-react";

export default function FeaturesSection() {
  const features = [
    {
      icon: Sparkles,
      title: "AI-Powered Accuracy",
      description:
        "Industry-leading transcription powered by OpenAI Whisper API with automatic language detection and 95%+ accuracy.",
    },
    {
      icon: FileText,
      title: "Multiple Export Formats",
      description:
        "Download transcripts in TXT, SRT, VTT, JSON, and verbose JSON formats for any workflow or video editor.",
    },
    {
      icon: Brain,
      title: "AI Summaries",
      description:
        "GPT-5 generates show notes, key highlights, and platform-optimized social media captions automatically.",
    },
    {
      icon: Clock,
      title: "Word-Level Timestamps",
      description:
        "Precise synchronization with word-level timestamps for video editing and subtitle creation.",
    },
    {
      icon: Zap,
      title: "Fast Processing",
      description:
        "Real-time progress tracking with typical processing time of 0.3x file duration. 30-minute file transcribed in ~9 minutes.",
    },
    {
      icon: Shield,
      title: "Secure Storage",
      description:
        "Enterprise-grade encryption for all files stored in Supabase with automatic deletion options for privacy.",
    },
  ];

  return (
    <section className="bg-background py-16 md:py-20">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="text-center space-y-4 mb-12 md:mb-16">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
            Everything You Need to Transcribe Faster
          </h2>
          <p className="text-lg text-muted-foreground md:text-xl max-w-3xl mx-auto">
            Professional transcription features powered by AI, designed for
            creators who value their time.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
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
    "animate-fade-in-delay-1",
    "animate-fade-in-delay-2",
  ][index % 6];

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
