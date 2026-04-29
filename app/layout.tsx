import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import CookieBanner from "@/components/CookieBanner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.merkly.nl";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Merkly | Jouw complete merkidentiteit in minuten",
    template: "%s | Merkly",
  },
  description:
    "Merkly genereert in minder dan twee minuten een volledige merkidentiteit: logo, kleurenpalet, typografie, merkstem en copy. Voor ondernemers die snel professioneel willen lanceren.",
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
    title: "Merkly | Jouw complete merkidentiteit in minuten",
    description:
      "Van naam tot volledig brand book: logo, kleuren, typografie, merkstem en klaar-om-te-gebruiken copy. Speciaal voor Nederlandse ondernemers.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Merkly | Merkidentiteit in minuten",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Merkly | Jouw complete merkidentiteit in minuten",
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
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    shortcut: "/favicon.ico",
    apple: { url: "/logo-favicon.png", sizes: "512x512" },
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

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    url: `${siteUrl}/`,
    name: "Merkly",
    description:
      "AI-huisstijlgenerator voor Nederlandse ondernemers: logo, kleurenpalet, typografie en merkverhaal in minder dan twee minuten.",
    inLanguage: "nl-NL",
  },
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteUrl}/#organization`,
    name: "Merkly",
    url: `${siteUrl}/`,
    logo: {
      "@type": "ImageObject",
      url: `${siteUrl}/logo-favicon.png`,
      width: 512,
      height: 512,
    },
    description:
      "Merkly is een Nederlandse SaaS-tool waarmee ondernemers in minder dan twee minuten een complete merkidentiteit genereren met AI: logo, kleurenpalet, typografie, merkverhaal en copy.",
    foundingDate: "2025",
    areaServed: { "@type": "Country", name: "Nederland" },
    inLanguage: "nl-NL",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Lokomotiefstraat 14",
      addressLocality: "Apeldoorn",
      postalCode: "7331 AC",
      addressCountry: "NL",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: "info@merkly.nl",
      availableLanguage: "Dutch",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${siteUrl}/#software`,
    name: "Merkly",
    url: `${siteUrl}/`,
    description:
      "AI-powered merkidentiteitsgenerator voor Nederlandse ondernemers. Genereer in minder dan twee minuten een compleet brand kit: logo, kleurenpalet, typografie, merkverhaal, tone of voice en kant-en-klare copy.",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    inLanguage: "nl-NL",
    offers: [
      {
        "@type": "Offer",
        name: "Gratis",
        price: "0",
        priceCurrency: "EUR",
        description:
          "Kleurenpalet, typografie, merkverhaal, tone of voice en merkpersoonlijkheid. Tot 3 generaties per dag.",
        availability: "https://schema.org/InStock",
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: "0",
          priceCurrency: "EUR",
          billingDuration: "P1M",
          unitCode: "MON",
        },
      },
      {
        "@type": "Offer",
        name: "Merkly Premium",
        price: "18.95",
        priceCurrency: "EUR",
        description:
          "Onbeperkt genereren, AI-logo in SVG/PNG (5 varianten), PDF brand guide (19 pagina's), mockups, slogans, voorbeeldteksten en WCAG kleurcontrast-check.",
        availability: "https://schema.org/InStock",
        url: `${siteUrl}/upgrade`,
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: "18.95",
          priceCurrency: "EUR",
          billingDuration: "P1M",
          unitCode: "MON",
        },
      },
    ],
    publisher: { "@id": `${siteUrl}/#organization` },
  },
];

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
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
