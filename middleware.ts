import { updateSession } from "@/lib/supabase/middleware";
import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

// In-memory cache for domain → slug mapping
// TTL: 60 seconds to balance freshness vs performance
const domainCache = new Map<string, { slug: string; timestamp: number }>();
const CACHE_TTL = 60 * 1000; // 1 minute

/**
 * Look up site slug by custom domain using Supabase
 * Uses in-memory cache to reduce database queries
 */
async function getSiteSlugByDomain(
  domain: string,
  request: NextRequest
): Promise<string | null> {
  // Check cache first
  const cached = domainCache.get(domain);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.slug;
  }

  try {
    // Create Supabase client for edge runtime
    const supabase = createServerClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll() {
            // We don't need to set cookies for this read-only query
          },
        },
      }
    );

    // Query for verified custom domain on published site
    const { data: site, error } = await supabase
      .from("sites")
      .select("slug")
      .eq("custom_domain", domain)
      .eq("domain_verification_status", "verified")
      .eq("status", "published")
      .single();

    if (error || !site) {
      return null;
    }

    // Cache the result
    domainCache.set(domain, { slug: site.slug, timestamp: Date.now() });
    return site.slug;
  } catch (error) {
    console.error("Domain lookup error:", error);
    return null;
  }
}

/**
 * Check if a hostname is a custom domain (not the app domain)
 */
function isCustomDomain(host: string): boolean {
  // Get app domain from environment
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) return false;

  try {
    const appHost = new URL(appUrl).host;

    // Not a custom domain if it matches the app domain
    if (host === appHost) return false;

    // Not a custom domain if it's localhost
    if (host.includes("localhost") || host.includes("127.0.0.1")) return false;

    // Not a custom domain if it's a Vercel preview/deployment URL
    if (host.endsWith(".vercel.app")) return false;

    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  try {
    const host = request.headers.get("host") || "";

    // Check if this is a custom domain request
    if (isCustomDomain(host)) {
      const siteSlug = await getSiteSlugByDomain(host, request);

      if (siteSlug) {
        // Rewrite to internal sites route
        const url = request.nextUrl.clone();
        const pathname = url.pathname;

        // Handle root path → site homepage
        if (pathname === "/" || pathname === "") {
          url.pathname = `/sites/${siteSlug}`;
        } else {
          // Handle page paths → site subpages
          // Remove leading slash and append to site path
          const pagePath = pathname.startsWith("/") ? pathname.slice(1) : pathname;
          url.pathname = `/sites/${siteSlug}/${pagePath}`;
        }

        // Rewrite (not redirect) to preserve the custom domain in browser
        return NextResponse.rewrite(url);
      }
    }

    // Continue with normal auth handling
    return await updateSession(request);
  } catch (error) {
    console.error("Middleware error:", error);
    // Fallback to continue without middleware on error
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     *
     * This middleware handles:
     * 1. Custom domain routing (rewrites to /sites/[slug])
     * 2. Authentication via Supabase
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
