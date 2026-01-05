import { getShowcaseSites } from "@/lib/queries/showcase";
import { Globe } from "lucide-react";
import Link from "next/link";

export default async function ShowcaseSection() {
  const sites = await getShowcaseSites();

  // Don't render the section if there are no verified sites
  if (sites.length === 0) {
    return null;
  }

  return (
    <section className="bg-muted/30 py-16 md:py-20">
      <div className="container mx-auto max-w-5xl px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl mb-4">
            Built with Headstring Web
          </h2>
          <p className="text-lg text-muted-foreground md:text-xl">
            See what others are creating with our platform
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {sites.map((site) => (
            <Link
              key={site.domain}
              href={`https://${site.domain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 rounded-lg border border-border bg-card p-4 transition-all hover:border-primary hover:shadow-md"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Globe className="h-5 w-5 text-primary" />
              </div>
              <span className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
                {site.domain}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
