export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  updatedAt?: string;
  readingTime: number;
  category: string;
  categorySlug: string;
}

export const blogPosts: BlogPost[] = [
  {
    slug: "wat-is-een-huisstijl",
    title: "Wat is een huisstijl? De complete gids voor ondernemers",
    description:
      "Een huisstijl is meer dan een logo. In deze gids leer je wat een professionele huisstijl inhoudt, welke onderdelen erin zitten en waarom het onmisbaar is voor elk bedrijf.",
    publishedAt: "2026-04-30",
    readingTime: 5,
    category: "Branding basics",
    categorySlug: "branding",
  },
  {
    slug: "huisstijl-kosten",
    title: "Huisstijl laten maken: wat kost het in 2026?",
    description:
      "Van freelancer tot AI-tool: een eerlijk overzicht van wat een huisstijl laten maken kost in 2026, inclusief wat je voor elk budget kunt verwachten.",
    publishedAt: "2026-04-30",
    readingTime: 6,
    category: "Kosten & budgetten",
    categorySlug: "kosten",
  },
  {
    slug: "ai-huisstijl-generator",
    title: "AI huisstijl generator: zo werkt het en wat levert het op",
    description:
      "AI-tools maken het mogelijk om in minuten een volledige merkidentiteit te genereren. Hoe werkt dat precies, wat zijn de voordelen én de beperkingen?",
    publishedAt: "2026-04-30",
    readingTime: 5,
    category: "AI & technologie",
    categorySlug: "ai",
  },
  {
    slug: "merkidentiteit-opbouwen",
    title: "Merkidentiteit opbouwen: stap-voor-stap handleiding",
    description:
      "Een sterke merkidentiteit bouw je stap voor stap op. Van merkfundament en doelgroep tot visuele identiteit en brand guide — alles wat je moet weten.",
    publishedAt: "2026-04-30",
    readingTime: 6,
    category: "Branding basics",
    categorySlug: "branding",
  },
  {
    slug: "huisstijl-zzp",
    title: "Huisstijl als ZZP'er: wat heb je écht nodig?",
    description:
      "Als ZZP'er concurreer je met grotere bedrijven. Een professionele huisstijl helpt je serieus genomen te worden — ook met een klein budget.",
    publishedAt: "2026-04-30",
    readingTime: 5,
    category: "ZZP & MKB",
    categorySlug: "zzp",
  },
  {
    slug: "logo-laten-maken",
    title: "Logo laten maken: alle opties en kosten op een rij",
    description:
      "Van AI-generator tot bureau: een eerlijk overzicht van hoe je een logo laat maken, wat het kost en welke bestanden je altijd moet ontvangen.",
    publishedAt: "2026-04-30",
    readingTime: 5,
    category: "Logo & design",
    categorySlug: "logo",
  },
];

export function getAllPosts(): BlogPost[] {
  return blogPosts;
}

export function getPost(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}
