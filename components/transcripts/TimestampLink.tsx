"use client";

import { useRouter } from "next/navigation";
import { parseTimestamp } from "@/lib/timestamp-utils-client";

interface TimestampLinkProps {
  timestamp: string;
  children: React.ReactNode;
}

/**
 * Clickable timestamp link that navigates to transcript at specific time
 *
 * Parses timestamp format like "[1:23]" and navigates to
 * ?tab=transcript&t={seconds} when clicked
 */
export function TimestampLink({ timestamp, children }: TimestampLinkProps) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent): void => {
    e.preventDefault();
    const seconds = parseTimestamp(timestamp);
    if (seconds === null) return;

    router.push(`?tab=transcript&t=${seconds}`);
  };

  const seconds = parseTimestamp(timestamp);
  if (seconds === null) {
    return <>{children}</>;
  }

  return (
    <a
      href={`?tab=transcript&t=${seconds}`}
      onClick={handleClick}
      className="text-primary hover:underline cursor-pointer inline-block transition-colors"
      aria-label={`Jump to timestamp ${timestamp}`}
    >
      {children}
    </a>
  );
}
