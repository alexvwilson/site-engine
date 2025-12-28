import Link from "next/link";

export default function PostNotFound() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: "var(--theme-background)" }}
    >
      <div className="text-center space-y-4 px-4">
        <h1
          className="text-4xl font-bold"
          style={{
            color: "var(--theme-text)",
            fontFamily: "var(--theme-font-heading)",
          }}
        >
          Post Not Found
        </h1>
        <p
          className="text-lg"
          style={{
            color: "var(--theme-muted-text)",
            fontFamily: "var(--theme-font-body)",
          }}
        >
          The blog post you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Link
          href="."
          className="inline-block mt-4 px-6 py-3 rounded-lg font-medium transition-colors"
          style={{
            backgroundColor: "var(--theme-primary)",
            color: "var(--theme-background)",
          }}
        >
          Back to Blog
        </Link>
      </div>
    </div>
  );
}
