import type { Metadata } from "next";
import Link from "next/link";
import MerklyLogo from "@/components/MerklyLogo";

export const metadata: Metadata = {
  title: "Huisstijl Generator — Gratis AI Huisstijl in 2 Minuten | Merkly",
  description:
    "Genereer een complete huisstijl met AI: logo, kleurenpalet, typografie, merkverhaal en tone of voice. Gratis proberen, geen account nodig. Speciaal voor Nederlandse ondernemers.",
  alternates: {
    canonical: "/huisstijl-generator",
  },
  openGraph: {
    title: "Huisstijl Generator — AI Huisstijl in 2 Minuten",
    description:
      "Gratis AI huisstijl generator voor Nederlandse ondernemers. Logo, kleuren, typografie en merkverhaal in minder dan 2 minuten.",
    url: "/huisstijl-generator",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Huisstijl Generator — Merkly",
  description:
    "AI-powered huisstijl generator voor Nederlandse ondernemers. Genereer in 2 minuten een complete merkidentiteit: logo, kleurenpalet, typografie en merkverhaal.",
  url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.merkly.nl"}/huisstijl-generator`,
  mainEntity: {
    "@type": "SoftwareApplication",
    name: "Merkly Huisstijl Generator",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "EUR",
    },
  },
};

const features = [
  {
    title: "AI-logo in 5 varianten",
    desc: "Gegenereerd door Recraft V4 AI. Kleur, zwart, wit, merkkleur en transparant — in SVG en PNG.",
    icon: "✦",
    color: "text-violet-400",
  },
  {
    title: "Kleurenpalet op maat",
    desc: "7 kleuren afgestemd op jouw branche, doelgroep en stijlvoorkeur. Met hexcodes en gebruiksregels.",
    icon: "◆",
    color: "text-fuchsia-400",
  },
  {
    title: "Professionele typografie",
    desc: "Een doordacht fontduo van Google Fonts met hiërarchie en toepassingsrichtlijnen.",
    icon: "▲",
    color: "text-cyan-400",
  },
  {
    title: "Merkverhaal & missie",
    desc: "Missie, visie, kernwaarden en een authentiek merkverhaal. Geschreven door Claude AI.",
    icon: "●",
    color: "text-amber-400",
  },
  {
    title: "Tone of voice",
    desc: "Concrete do's & don'ts voor je communicatie, afgestemd op jouw doelgroep en branche.",
    icon: "■",
    color: "text-emerald-400",
  },
  {
    title: "PDF brand guide",
    desc: "19-pagina's professioneel PDF-document met alle richtlijnen voor je merk.",
    icon: "◉",
    color: "text-rose-400",
  },
];

const steps = [
  {
    number: "1",
    title: "Beschrijf je bedrijf",
    desc: "Vul je bedrijfsnaam, branche, doelgroep en gewenste uitstraling in. Duurt minder dan een minuut.",
  },
  {
    number: "2",
    title: "AI genereert jouw huisstijl",
    desc: "Claude AI bouwt je merkidentiteit op. Recraft V4 genereert je logo. Alles tegelijk, in real-time.",
  },
  {
    number: "3",
    title: "Gebruik direct",
    desc: "Bekijk je brand guide online, download als PDF en begin meteen met bouwen aan je merk.",
  },
];

const faqs = [
  {
    q: "Is de huisstijl generator echt gratis?",
    a: "Ja. Je kunt Merkly gratis gebruiken zonder account: je krijgt een volledig kleurenpalet, typografie, merkverhaal en tone of voice. Merkly Premium (€18,95/maand) voegt AI-logo's, PDF download en meer toe.",
  },
  {
    q: "Hoe lang duurt het genereren?",
    a: "Minder dan 2 minuten voor de volledige brand guide. Het logo kan iets langer duren omdat het apart door Recraft V4 AI wordt gegenereerd.",
  },
  {
    q: "Is het resultaat écht uniek?",
    a: "Ja. Merkly genereert op basis van jouw specifieke invoer — bedrijfsnaam, branche, doelgroep en stijlvoorkeur. Twee verschillende bedrijven krijgen altijd een andere huisstijl.",
  },
  {
    q: "Wat als ik niet tevreden ben?",
    a: "Met Merkly Premium kun je elk onderdeel individueel regenereren. Kleuren niet goed? Druk op vernieuwen. Logo anders? Genereer een nieuwe versie. Zo houd je altijd controle.",
  },
];

export default function HuisstijlGeneratorPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Nav */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 sm:px-8 py-5 border-b border-neutral-900/50 bg-neutral-950/80 backdrop-blur-xl">
        <Link href="/" className="flex items-center gap-2">
          <MerklyLogo size={26} variant="gradient" />
          <span className="text-lg font-bold tracking-tight">
            <span className="text-white">Merk</span>
            <span className="text-violet-400">ly</span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/blog" className="hidden sm:block text-sm text-neutral-400 hover:text-white transition-colors">
            Blog
          </Link>
          <Link
            href="/generate"
            className="text-sm bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white px-4 py-2 rounded-lg font-medium hover:from-violet-500 hover:to-fuchsia-500 transition-all"
          >
            Start gratis →
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex flex-col items-center text-center px-6 pt-20 pb-24 overflow-hidden">
        <div className="absolute top-8 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-br from-violet-600/20 via-fuchsia-500/10 to-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-1.5 text-sm text-violet-300 mb-6">
          <span className="w-1.5 h-1.5 bg-violet-400 rounded-full" />
          Gratis te gebruiken &middot; Geen account nodig
        </div>

        <h1 className="relative text-4xl sm:text-6xl font-bold tracking-tight max-w-3xl leading-[1.08] mb-5">
          Huisstijl generator
          <br />
          <span className="bg-gradient-to-r from-violet-400 via-fuchsia-300 to-cyan-400 bg-clip-text text-transparent">
            met AI in 2 minuten
          </span>
        </h1>

        <p className="relative text-lg text-neutral-400 max-w-xl leading-relaxed mb-8">
          Genereer een complete merkidentiteit: logo, kleurenpalet, typografie,
          merkverhaal en tone of voice — automatisch afgestemd op jouw bedrijf
          en doelgroep.
        </p>

        <div className="relative flex flex-col sm:flex-row items-center gap-4 mb-4">
          <Link
            href="/generate"
            className="group bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold px-8 py-4 rounded-xl text-lg hover:from-violet-500 hover:to-fuchsia-500 transition-all shadow-lg shadow-violet-500/25"
          >
            Genereer mijn huisstijl gratis
            <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
          </Link>
          <Link href="/upgrade" className="text-sm text-neutral-400 hover:text-white transition-colors">
            Premium vanaf €18,95/mnd →
          </Link>
        </div>
        <p className="text-sm text-neutral-600">Geen account nodig &middot; Resultaat in minder dan 2 minuten</p>
      </section>

      {/* Hoe het werkt */}
      <section className="max-w-4xl mx-auto px-6 pb-24">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">
          Zo werkt de huisstijl generator
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {steps.map(({ number, title, desc }) => (
            <div key={number} className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-xl font-bold mb-5 shadow-lg shadow-violet-500/20">
                {number}
              </div>
              <h3 className="text-lg font-semibold mb-2">{title}</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4">
          Wat levert de generator op?
        </h2>
        <p className="text-neutral-400 text-center mb-12 max-w-lg mx-auto">
          Geen losse elementen, maar een complete, samenhangende merkidentiteit.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(({ title, desc, icon, color }) => (
            <div
              key={title}
              className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5 hover:border-neutral-700 transition-all"
            >
              <span className={`text-2xl ${color} mb-3 block`}>{icon}</span>
              <h3 className="text-base font-semibold text-white mb-2">{title}</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Vergelijking */}
      <section className="max-w-3xl mx-auto px-6 pb-24">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4">
          Merkly vs. traditionele opties
        </h2>
        <p className="text-neutral-400 text-center mb-10 max-w-lg mx-auto">
          Een grafisch bureau rekent €2.000–€10.000 voor een huisstijl.
          Merkly doet het in minder dan 2 minuten.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-left border-b border-neutral-800">
                <th className="py-3 pr-4 text-neutral-400 font-medium"></th>
                <th className="py-3 px-4 text-violet-400 font-semibold">Merkly</th>
                <th className="py-3 px-4 text-neutral-400 font-medium">Freelancer</th>
                <th className="py-3 px-4 text-neutral-400 font-medium">Bureau</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/50">
              {[
                ["Doorlooptijd", "< 2 minuten", "2–4 weken", "4–12 weken"],
                ["Kosten", "€0–€18,95/mnd", "€500–€2.500", "€3.000–€15.000"],
                ["Logo", "✓ AI SVG/PNG", "✓ Maatwerk", "✓ Maatwerk"],
                ["Merkstrategie", "✓ Ingebouwd", "Soms", "✓ Uitgebreid"],
                ["Brand guide PDF", "✓ 19 pagina's", "✓ Extra kosten", "✓ Inbegrepen"],
                ["Aanpasbaar", "✓ Per onderdeel", "Revisierondes", "Revisierondes"],
              ].map(([label, merkly, freelancer, bureau]) => (
                <tr key={label}>
                  <td className="py-3 pr-4 text-neutral-400">{label}</td>
                  <td className="py-3 px-4 text-white font-medium">{merkly}</td>
                  <td className="py-3 px-4 text-neutral-500">{freelancer}</td>
                  <td className="py-3 px-4 text-neutral-500">{bureau}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-2xl mx-auto px-6 pb-24">
        <h2 className="text-2xl font-bold text-center mb-8">
          Veelgestelde vragen
        </h2>
        <div className="space-y-3">
          {faqs.map(({ q, a }) => (
            <details
              key={q}
              className="group bg-neutral-900/50 border border-neutral-800 rounded-xl overflow-hidden"
            >
              <summary className="flex items-center justify-between px-5 py-4 cursor-pointer text-sm font-medium text-white list-none hover:bg-neutral-900 transition-colors">
                {q}
                <svg className="w-4 h-4 text-neutral-500 shrink-0 ml-4 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <p className="px-5 pb-4 text-sm text-neutral-400 leading-relaxed">{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 pb-24">
        <div className="bg-gradient-to-br from-violet-600/10 to-fuchsia-600/10 border border-violet-500/20 rounded-3xl p-10 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Klaar om te genereren?
          </h2>
          <p className="text-neutral-400 mb-8 max-w-md mx-auto">
            Probeer de huisstijl generator gratis. Geen account, geen creditcard,
            geen verplichtingen.
          </p>
          <Link
            href="/generate"
            className="inline-block bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold px-8 py-4 rounded-xl text-base hover:from-violet-500 hover:to-fuchsia-500 transition-all shadow-lg shadow-violet-500/25"
          >
            Start de generator gratis →
          </Link>
          <p className="text-sm text-neutral-600 mt-4">
            Of lees eerst meer in onze{" "}
            <Link href="/blog" className="text-violet-400 hover:text-violet-300 transition-colors">
              kennisbank over huisstijl &amp; branding
            </Link>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-900 px-8 py-10">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-700">
          <p>&copy; 2026 Merkly &middot; KvK 98654500</p>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-neutral-400 transition-colors">Home</Link>
            <Link href="/blog" className="hover:text-neutral-400 transition-colors">Blog</Link>
            <Link href="/privacy" className="hover:text-neutral-400 transition-colors">Privacy</Link>
            <Link href="/contact" className="hover:text-neutral-400 transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
