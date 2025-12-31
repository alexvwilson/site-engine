import { Metadata } from "next";

export const metadata: Metadata = {
  robots: {
    index: true,
    follow: true,
  },
};

/**
 * Layout for published sites.
 * Does NOT include the app's navbar/footer - sites render their own content.
 */
export default function PublishedSiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Smooth scroll for anchor links */}
      <style>{`html { scroll-behavior: smooth; }`}</style>
      {/* Google Fonts - Inter as default, sites can override with their theme fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      {children}
    </>
  );
}
