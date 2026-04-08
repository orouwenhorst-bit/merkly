import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://merkly.nl";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Merkly — Jouw complete merkidentiteit in 60 seconden",
    template: "%s | Merkly",
  },
  description:
    "Merkly genereert in één minuut een volledige merkidentiteit: logo, kleurenpalet, typografie, merkstem en copy. Voor ondernemers die snel professioneel willen lanceren.",
  applicationName: "Merkly",
  authors: [{ name: "Merkly" }],
  creator: "Merkly",
  publisher: "Merkly",
  keywords: [
    "brand guide generator",
    "merkidentiteit maken",
    "logo generator Nederland",
    "kleurenpalet genereren",
    "huisstijl ontwerpen",
    "brand kit voor ondernemers",
    "AI branding tool",
    "Merkly",
  ],
  category: "business",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
    languages: {
      "nl-NL": "/",
    },
  },
  openGraph: {
    type: "website",
    locale: "nl_NL",
    url: "/",
    siteName: "Merkly",
    title: "Merkly — Jouw complete merkidentiteit in 60 seconden",
    description:
      "Van naam tot volledig brand book: logo, kleuren, typografie, merkstem en klaar-om-te-gebruiken copy. Speciaal voor Nederlandse ondernemers.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Merkly — Merkidentiteit in 60 seconden",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Merkly — Jouw complete merkidentiteit in 60 seconden",
    description:
      "AI-gegenereerde merkidentiteit voor Nederlandse ondernemers: logo, kleuren, typografie en copy.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="nl"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
