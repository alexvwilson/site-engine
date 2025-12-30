/**
 * Vercel API Client
 *
 * Server-only client for Vercel REST API domain management.
 * Used for adding, verifying, and checking custom domains.
 */

import { env } from "@/lib/env";

const VERCEL_API_BASE = "https://api.vercel.com";

// ============================================================================
// Types
// ============================================================================

export interface VercelVerificationChallenge {
  type: "TXT" | "CNAME" | "A";
  domain: string;
  value: string;
  reason: string;
}

export interface VercelDomainResponse {
  name: string;
  apexName: string;
  projectId: string;
  verified: boolean;
  verification?: VercelVerificationChallenge[];
  redirect?: string | null;
  redirectStatusCode?: 301 | 302 | 307 | 308 | null;
  gitBranch?: string | null;
  updatedAt: number;
  createdAt: number;
}

export interface VercelDomainConfigResponse {
  configuredBy: "CNAME" | "A" | "http" | "dns-01" | null;
  acceptedChallenges: string[];
  misconfigured: boolean;
}

export interface VercelErrorResponse {
  error: {
    code: string;
    message: string;
  };
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Check if Vercel API is configured
 */
export function isVercelConfigured(): boolean {
  return !!(env.VERCEL_API_TOKEN && env.VERCEL_PROJECT_ID);
}

/**
 * Build URL with optional team ID
 */
function buildUrl(path: string): string {
  const url = new URL(path, VERCEL_API_BASE);
  if (env.VERCEL_TEAM_ID) {
    url.searchParams.set("teamId", env.VERCEL_TEAM_ID);
  }
  return url.toString();
}

/**
 * Get authorization headers
 */
function getHeaders(): HeadersInit {
  if (!env.VERCEL_API_TOKEN) {
    throw new Error("VERCEL_API_TOKEN is not configured");
  }
  return {
    Authorization: `Bearer ${env.VERCEL_API_TOKEN}`,
    "Content-Type": "application/json",
  };
}

/**
 * Type guard for Vercel error responses
 */
export function isVercelError(
  response: unknown
): response is VercelErrorResponse {
  return (
    typeof response === "object" &&
    response !== null &&
    "error" in response &&
    typeof (response as VercelErrorResponse).error === "object"
  );
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Add a domain to the Vercel project
 */
export async function addDomainToProject(
  domain: string
): Promise<VercelDomainResponse | VercelErrorResponse> {
  if (!env.VERCEL_PROJECT_ID) {
    throw new Error("VERCEL_PROJECT_ID is not configured");
  }

  const response = await fetch(
    buildUrl(`/v10/projects/${env.VERCEL_PROJECT_ID}/domains`),
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ name: domain }),
    }
  );

  return response.json();
}

/**
 * Verify a domain on the Vercel project
 */
export async function verifyDomain(
  domain: string
): Promise<VercelDomainResponse | VercelErrorResponse> {
  if (!env.VERCEL_PROJECT_ID) {
    throw new Error("VERCEL_PROJECT_ID is not configured");
  }

  const response = await fetch(
    buildUrl(`/v9/projects/${env.VERCEL_PROJECT_ID}/domains/${domain}/verify`),
    {
      method: "POST",
      headers: getHeaders(),
    }
  );

  return response.json();
}

/**
 * Get domain configuration status (DNS, SSL)
 */
export async function getDomainConfig(
  domain: string
): Promise<VercelDomainConfigResponse | VercelErrorResponse> {
  const response = await fetch(buildUrl(`/v6/domains/${domain}/config`), {
    method: "GET",
    headers: getHeaders(),
  });

  return response.json();
}

/**
 * Remove a domain from the Vercel project
 */
export async function removeDomainFromProject(
  domain: string
): Promise<{ success: boolean } | VercelErrorResponse> {
  if (!env.VERCEL_PROJECT_ID) {
    throw new Error("VERCEL_PROJECT_ID is not configured");
  }

  const response = await fetch(
    buildUrl(`/v9/projects/${env.VERCEL_PROJECT_ID}/domains/${domain}`),
    {
      method: "DELETE",
      headers: getHeaders(),
    }
  );

  // 204 No Content = success
  if (response.status === 204) {
    return { success: true };
  }

  return response.json();
}

/**
 * Get domain details from Vercel
 */
export async function getDomainDetails(
  domain: string
): Promise<VercelDomainResponse | VercelErrorResponse> {
  if (!env.VERCEL_PROJECT_ID) {
    throw new Error("VERCEL_PROJECT_ID is not configured");
  }

  const response = await fetch(
    buildUrl(`/v9/projects/${env.VERCEL_PROJECT_ID}/domains/${domain}`),
    {
      method: "GET",
      headers: getHeaders(),
    }
  );

  return response.json();
}
