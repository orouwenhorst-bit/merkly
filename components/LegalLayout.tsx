import Link from "next/link";
import { ReactNode } from "react";

export function LegalLayout({
  title,
  lastUpdated,
  children,
}: {
  title: string;
  lastUpdated: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-8 py-5 border-b border-neutral-900/50 bg-neutral-950/80 backdrop-blur-xl">
        <Link href="/" className="text-xl font-bold tracking-tight">
          <span className="text-white">Merk</span>
          <span className="text-violet-400">ly</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/generate"
            className="text-sm bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-neutral-200 transition-colors"
          >
            Start nu
          </Link>
        </div>
      </nav>

      {/* Content */}
      <article className="max-w-3xl mx-auto px-6 py-16 sm:py-24">
        <header className="mb-12 pb-8 border-b border-neutral-900">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">{title}</h1>
          <p className="text-sm text-neutral-500">Laatst bijgewerkt: {lastUpdated}</p>
        </header>
        <div className="prose-legal space-y-8 text-neutral-300 leading-relaxed">{children}</div>
      </article>

      {/* Footer */}
      <footer className="border-t border-neutral-900 px-8 py-10 mt-16">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-600">
          <p>&copy; 2026 Merkly. Alle rechten voorbehouden.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-neutral-400 transition-colors">
              Privacybeleid
            </Link>
            <Link href="/voorwaarden" className="hover:text-neutral-400 transition-colors">
              Algemene voorwaarden
            </Link>
            <Link href="/cookies" className="hover:text-neutral-400 transition-colors">
              Cookies
            </Link>
            <Link href="/contact" className="hover:text-neutral-400 transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

export function LegalSection({
  heading,
  id,
  children,
}: {
  heading: string;
  id?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-28">
      <h2 className="text-xl font-semibold text-white mb-3">{heading}</h2>
      <div className="space-y-3 text-neutral-400">{children}</div>
    </section>
  );
}
