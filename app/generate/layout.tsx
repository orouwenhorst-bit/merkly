import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Huisstijl Generator — Maak je merkidentiteit in 2 minuten",
  description:
    "Genereer jouw complete huisstijl met AI: kleurenpalet, typografie, logo, merkverhaal en tone of voice. Vul in wat je merk is en ontvang direct resultaat.",
  alternates: {
    canonical: "/generate",
  },
  openGraph: {
    title: "Huisstijl Generator | Merkly",
    description:
      "Beschrijf je merk en ontvang binnen 2 minuten een professionele brand guide. Gratis te proberen, geen account nodig.",
    url: "/generate",
  },
};

export default function GenerateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
