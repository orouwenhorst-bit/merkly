import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Merkly Premium — Onbeperkt huisstijlen maken voor €18,95/maand",
  description:
    "Upgrade naar Merkly Premium: onbeperkt genereren, AI-logo in SVG/PNG, PDF brand guide van 19 pagina's, mockups, slogans en WCAG kleurcontrast-check. Maandelijks opzegbaar.",
  alternates: {
    canonical: "/upgrade",
  },
  openGraph: {
    title: "Merkly Premium | Volledige brand guide zonder limieten",
    description:
      "Alles voor €18,95/maand: AI-logo, PDF download, mockups, slogans en meer. Maandelijks opzegbaar.",
    url: "/upgrade",
  },
};

export default function UpgradeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
