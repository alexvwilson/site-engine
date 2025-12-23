import type { Metadata } from "next";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: {
    template: "%s | Skribo.ai",
    default: "Skribo.ai - AI-Powered Transcription for Creators",
  },
  description:
    "Turn audio and video into accurate text in minutes. AI-powered transcription built for solo creators and podcasters. Save 5-10 hours weekly with automated transcription, timestamps, and searchable content.",
  keywords: [
    "AI Transcription",
    "Audio to Text",
    "Video Transcription",
    "Podcast Transcription",
    "Content Creator Tools",
    "Speech to Text",
    "Automated Transcription",
    "Whisper AI",
    "Transcription Software",
    "Creator Tools",
  ],
  openGraph: {
    title: "Skribo.ai - AI-Powered Transcription for Creators",
    description:
      "Turn audio and video into accurate text in minutes. Save 5-10 hours weekly with AI transcription built for solo creators and podcasters.",
    url: new URL(defaultUrl),
    siteName: "Skribo.ai",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Skribo.ai - AI-powered transcription for creators",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Skribo.ai - AI-Powered Transcription for Creators",
    description:
      "Turn audio and video into accurate text in minutes. Save 5-10 hours weekly with AI transcription built for solo creators and podcasters.",
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
    title: `${title} | Skribo.ai`,
    description,
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title: `${title} | Skribo.ai`,
      description,
      type: "website",
    },
  };
};
