import type { Metadata } from "next";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: {
    template: "%s | Headstring Web",
    default: "Headstring Web - AI-Powered Website Builder",
  },
  description:
    "Build beautiful websites without code. AI-powered theme generation and intuitive content management for creators and businesses.",
  keywords: [
    "Website Builder",
    "AI Website Builder",
    "No Code Website",
    "Content Management",
    "AI Theme Generation",
    "Visual Page Editor",
    "Drag and Drop Website",
    "Website Creator",
    "Landing Page Builder",
    "Small Business Website",
  ],
  openGraph: {
    title: "Headstring Web - AI-Powered Website Builder",
    description:
      "Build beautiful websites without code. AI-powered theme generation and intuitive content management.",
    url: new URL(defaultUrl),
    siteName: "Headstring Web",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Headstring Web - AI-powered website builder",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Headstring Web - AI-Powered Website Builder",
    description:
      "Build beautiful websites without code. AI-powered theme generation and intuitive content management.",
    images: ["/twitter-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const generateLegalMetadata = (
  title: string,
  description: string,
): Metadata => {
  return {
    title: `${title} | Headstring Web`,
    description,
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title: `${title} | Headstring Web`,
      description,
      type: "website",
    },
  };
};
