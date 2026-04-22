"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

const FEATURES_FREE = [
  "Kleurenpalet & typografie",
  "Merkverhaal & tone of voice",
  "Merkpersoonlijkheid & strategie",
  "3 generaties per dag",
  "Online brand guide bekijken",
];

const FEATURES_PREMIUM = [
  "Alles uit gratis",
  "Onbeperkt genereren",
  "Volledige brand guide direct (geen wachten)",
  "Download als PDF (11 pagina's)",
  "AI-logo SVG/PNG: 5 varianten",
  "Onbeperkt logo regenereren",
  "Slogans regenereren & bewaren",
  "Mockups: visitekaartje, social media",
  "Voorbeeldteksten & brand voice",
  "WCAG kleurcontrast-check",
  "Maandelijks opzegbaar",
];

function UpgradeInner() {
  const params = useSearchParams();
  const canceled = params.get("canceled") === "1";
  const [loading, setLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (res.status === 401) {
        window.location.href = "/login?redirect=/upgrade";
        return;
      }
      if (!res.ok || !data.url) throw new Error(data.detail || data.error || "Checkout mislukt");
      window.location.href = data.url;
    } catch (e) {
      setError(String(e instanceof Error ? e.message : e));
      setLoading(false);
    }
  }

  async function openPortal() {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || "Portal ophalen mislukt");
      window.location.href = data.url;
    } catch (e) {
      setError(String(e instanceof Error ? e.message : e));
      setPortalLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <nav className="sticky top-0 z-50 flex items-center justify-between px-8 py-5 border-b border-neutral-900/50 bg-neutral-950/80 backdrop-blur-xl">
        <Link href="/" className="text-xl font-bold tracking-tight">
          <span className="text-white">Merk</span>
          <span className="text-violet-400">ly</span>
        </Link>
        <Link href="/dashboard" className="text-sm text-neutral-400 hover:text-white transition-colors">
          ← Dashboard
        </Link>
      </nav>

      <section className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/30 rounded-full px-4 py-1.5 text-xs text-violet-300 mb-6">
            ✦ Merkly Premium
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            Onbeperkt huisstijlen maken
          </h1>
          <p className="text-neutral-400 text-lg max-w-lg mx-auto">
            Upgrade naar Premium en genereer direct volledige brand guides zonder limieten.
          </p>
        </div>

        {canceled && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 mb-8 text-sm text-neutral-400 text-center">
            Betaling geannuleerd. Je kunt het altijd opnieuw proberen.
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-8 text-sm text-red-300 text-center">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Gratis */}
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-8">
            <p className="text-sm text-neutral-400 mb-1">Gratis</p>
            <p className="text-4xl font-bold mb-1">€0</p>
            <p className="text-sm text-neutral-600 mb-6">Voor altijd gratis</p>
            <ul className="space-y-2.5 text-sm text-neutral-400 mb-8">
              {FEATURES_FREE.map((f) => (
                <li key={f} className="flex gap-2.5 items-start">
                  <svg className="w-4 h-4 text-neutral-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/generate"
              className="block text-center w-full py-3 border border-neutral-700 rounded-xl hover:border-neutral-500 transition-colors text-sm font-medium"
            >
              Gratis blijven
            </Link>
          </div>

          {/* Premium */}
          <div className="relative bg-white text-black rounded-2xl p-8">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-xs font-semibold px-4 py-1 rounded-full shadow-lg">
                Aanbevolen
              </span>
            </div>
            <p className="text-sm text-neutral-600 mb-1">Premium</p>
            <p className="text-4xl font-bold mb-1">
              €18,95<span className="text-lg font-normal text-neutral-500">/maand</span>
            </p>
            <p className="text-sm text-neutral-500 mb-6">Maandelijks opzegbaar</p>
            <ul className="space-y-2.5 text-sm text-neutral-600 mb-8">
              {FEATURES_PREMIUM.map((f) => (
                <li key={f} className="flex gap-2.5 items-start">
                  <svg className="w-4 h-4 text-violet-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>

            <button
              onClick={startCheckout}
              disabled={loading}
              className="w-full py-3 bg-black text-white rounded-xl hover:bg-neutral-900 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Doorverwijzen naar Stripe..." : "Upgrade voor €18,95/maand →"}
            </button>

            <p className="text-[11px] text-neutral-500 mt-3 text-center">
              Beveiligde betaling via Stripe · iDEAL & creditcard
            </p>
            <p className="text-[11px] text-neutral-400 mt-2 text-center leading-relaxed">
              Je hebt 14 dagen herroepingsrecht. Door direct na aankoop de dienst te gebruiken
              doe je afstand van dit recht voor reeds geleverde digitale content (art. 6:230p BW).{" "}
              <a href="/voorwaarden#herroeping" className="underline underline-offset-2 hover:text-neutral-300 transition-colors">
                Meer info
              </a>
            </p>
          </div>
        </div>

        {/* Abonnement beheren voor bestaande premium users */}
        <div className="mt-12 text-center">
          <p className="text-sm text-neutral-600 mb-3">Al een Premium abonnement?</p>
          <button
            onClick={openPortal}
            disabled={portalLoading}
            className="text-sm text-neutral-400 hover:text-white underline underline-offset-4 transition-colors disabled:opacity-50"
          >
            {portalLoading ? "Openen..." : "Beheer of zeg op via Stripe →"}
          </button>
        </div>
      </section>
    </main>
  );
}

export default function UpgradePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-950" />}>
      <UpgradeInner />
    </Suspense>
  );
}
