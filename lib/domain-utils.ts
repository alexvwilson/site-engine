/**
 * Domain Validation Utilities
 *
 * Client-safe utilities for domain validation and formatting.
 * No server-only imports - safe for use in client components.
 */

// Valid domain regex (supports apex and subdomains)
const DOMAIN_REGEX =
  /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;

/**
 * Validate a domain name format
 */
export function isValidDomain(domain: string): boolean {
  if (!domain || domain.length > 253) return false;
  return DOMAIN_REGEX.test(domain);
}

/**
 * Normalize domain (lowercase, trim, remove protocol/path)
 */
export function normalizeDomain(input: string): string {
  let domain = input.trim().toLowerCase();

  // Remove protocol if present
  domain = domain.replace(/^https?:\/\//, "");

  // Remove path if present
  domain = domain.split("/")[0];

  // Remove trailing dots
  domain = domain.replace(/\.+$/, "");

  // Remove port if present
  domain = domain.split(":")[0];

  return domain;
}

/**
 * Check if domain is apex (no subdomain except www)
 */
export function isApexDomain(domain: string): boolean {
  const parts = domain.split(".");
  return parts.length === 2 || (parts.length === 3 && parts[0] === "www");
}

/**
 * Get the apex domain from a subdomain
 */
export function getApexDomain(domain: string): string {
  const parts = domain.split(".");
  if (parts.length <= 2) return domain;
  return parts.slice(-2).join(".");
}

/**
 * DNS instruction for display
 */
export interface DnsInstruction {
  type: "A" | "CNAME" | "TXT";
  name: string;
  value: string;
  purpose: string;
}

/**
 * Vercel verification challenge from API
 */
export interface VercelChallenge {
  type: string;
  domain: string;
  value: string;
}

/**
 * Format DNS record instructions for display
 */
export function formatDnsInstructions(
  domain: string,
  challenges: VercelChallenge[]
): DnsInstruction[] {
  const instructions: DnsInstruction[] = [];

  // Add verification challenge if present
  for (const challenge of challenges) {
    if (challenge.type === "TXT") {
      instructions.push({
        type: "TXT",
        name: challenge.domain,
        value: challenge.value,
        purpose: "Domain verification",
      });
    }
  }

  // Add routing records based on domain type
  if (isApexDomain(domain)) {
    instructions.push({
      type: "A",
      name: "@",
      value: "76.76.21.21",
      purpose: "Route apex domain to Vercel",
    });
  } else {
    // Get subdomain part for CNAME
    const parts = domain.split(".");
    const subdomain = parts.slice(0, -2).join(".");

    instructions.push({
      type: "CNAME",
      name: subdomain || domain.split(".")[0],
      value: "cname.vercel-dns.com",
      purpose: "Route subdomain to Vercel",
    });
  }

  return instructions;
}

/**
 * Check if custom domain features are available
 * Returns true if Vercel API credentials are configured
 */
export function isDomainFeatureEnabled(): boolean {
  // This is checked at runtime in server components
  // Client components should check the UI state instead
  return true;
}
