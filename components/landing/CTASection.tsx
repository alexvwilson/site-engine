import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CTASection() {
  return (
    <section className="bg-background py-16 md:py-20">
      <div className="container mx-auto max-w-4xl px-4 text-center">
        <div className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
            Start Transcribing in Minutes
          </h2>
          <p className="text-lg text-muted-foreground md:text-xl">
            Join creators saving 5-10 hours weekly on transcription.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" asChild>
              <Link href="/auth/sign-up">Get Started</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/#features">Learn More</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
