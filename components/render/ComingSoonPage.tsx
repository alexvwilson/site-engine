import type { Site } from "@/lib/drizzle/schema/sites";

interface ComingSoonPageProps {
  site: Site;
}

export function ComingSoonPage({ site }: ComingSoonPageProps) {
  const title = site.construction_title || site.name;
  const description =
    site.construction_description ||
    "We're working on something exciting. Check back soon!";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 px-4">
      <div className="text-center max-w-lg">
        <div className="mb-6">
          <span className="text-6xl">🚧</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
          {title}
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
          {description}
        </p>
        <div className="text-sm text-slate-400 dark:text-slate-500">
          Coming Soon
        </div>
      </div>
    </div>
  );
}
