import type { Metadata } from "next"

export const BASE_URL = "https://www.myalgorise.in"

export const DEFAULT_METADATA: Metadata = {
  title: "AlgoRise - Master Competitive Programming & Algorithms",
  description:
    "Practice that adapts. Compete when it counts. Master algorithms and data structures with personalized learning paths, real-time contests, and AI-powered analytics.",
  keywords: [
    "competitive programming",
    "algorithms",
    "data structures",
    "coding practice",
    "online judge",
    "codeforces",
    "programming contests",
    "algorithm learning",
    "coding interview prep",
    "DSA practice",
    "battle arena",
    "coding challenges",
  ],
  authors: [{ name: "AlgoRise Team" }],
  creator: "AlgoRise",
  publisher: "AlgoRise",
  openGraph: {
    title: "AlgoRise - Master Competitive Programming & Algorithms",
    description:
      "Practice that adapts. Compete when it counts. Master algorithms and data structures with personalized learning paths.",
    type: "website",
    siteName: "AlgoRise",
    locale: "en_US",
    url: BASE_URL,
    images: [
      {
        url: `${BASE_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "AlgoRise - Master Competitive Programming",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AlgoRise - Master Competitive Programming & Algorithms",
    description: "Practice that adapts. Compete when it counts.",
    creator: "@AlgoRise",
    images: [`${BASE_URL}/og-image.jpg`],
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
}

export function generatePageMetadata(title: string, description: string, path: string, image?: string): Metadata {
  const fullTitle = `${title} | AlgoRise`
  const url = `${BASE_URL}${path}`

  return {
    title: fullTitle,
    description,
    openGraph: {
      title: fullTitle,
      description,
      url,
      type: "website",
      images: image
        ? [
            {
              url: image,
              width: 1200,
              height: 630,
              alt: title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: image ? [image] : undefined,
    },
    alternates: {
      canonical: url,
    },
  }
}
