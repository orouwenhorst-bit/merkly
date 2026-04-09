"use client";

import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function UpgradeInner() {
  const params = useSearchParams();
  const guideId = params.get("guideId");
  const canceled = params.get("canceled") === "1";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout() {
    if (!guideId) {
      setError("Geen huisstijl geselecteerd. Genereer eerst je brand guide.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guideId }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || "Checkout mislukt");
      window.location.href = data.url;
    } catch (e) {
      setError(String(e instanceof Error ? e.message : e));
      setLoading(false);
    }
  }

  // Auto-start when guideId present and not canceled
  useEffect(() => {
    if (guideId && !canceled) startCheckout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const features = [
    "Volledige brand guide als professionele PDF (11 pagina's)",
    "Logo-varianten op wit, donker en in merkkleur",
    "Kleurenpalet met HEX, RGB en CMYK waarden",
    "Merktoepassingen: visitekaartje, social & e-mail",
    "Brand voice copy en merkverhaal",
    "Logo-richtlijnen (wel/niet doen)",
    "Direct downloaden, levenslang toegang",
  ];

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <nav className="sticky top-0 z-50 flex items-center justify-between px-8 py-5 border-b border-neutral-900/50 bg-neutral-950/80 backdrop-blur-xl">
        <Link href="/" className="text-xl font-bold tracking-tight">
          <span className="text-white">Merk</span>
          <span className="text-violet-400">ly</span>
        </Link>
        {guideId && (
          <Link
            href={`/result/${guideId}`}
            className="text-sm text-neutral-400 hover:text-white transition-colors"
          >
            ← Terug naar preview
          </Link>
        )}
      </nav>

      <section className="max-w-xl mx-auto px-6 py-20">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/30 rounded-full px-4 py-1.5 text-xs text-violet-300 mb-6">
            Premium upgrade
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            Unlock jouw complete brand guide
          </h1>
          <p className="text-neutral-400 leading-relaxed">
            Eenmalig <span className="text-white font-semibold">€14</span> — download
            direct de volledige PDF en krijg levenslang toegang tot je huisstijl.
          </p>
        </div>

        <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-8 mb-6">
          <ul className="space-y-3 mb-8">
            {features.map((f) => (
              <li key={f} className="flex gap-3 items-start text-sm text-neutral-300">
                <svg
                  className="w-5 h-5 text-violet-400 mt-0.5 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                {f}
              </li>
            ))}
          </ul>

          <button
            onClick={startCheckout}
            disabled={loading || !guideId}
            className="w-full py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold rounded-xl text-base hover:from-violet-500 hover:to-fuchsia-500 transition-all shadow-lg shadow-violet-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Bezig met doorverwijzen naar Stripe..." : "Upgrade voor €14 →"}
          </button>

          {!guideId && (
            <p className="text-xs text-amber-400 mt-3 text-center">
              Genereer eerst een huisstijl om te kunnen upgraden.{" "}
              <Link href="/generate" className="underline">Start hier</Link>.
            </p>
          )}

          {canceled && (
            <p className="text-xs text-neutral-500 mt-3 text-center">
              Betaling geannuleerd. Je kunt het opnieuw proberen.
            </p>
          )}

          {error && (
            <p className="text-xs text-red-400 mt-3 text-center">{error}</p>
          )}

          <p className="text-[11px] text-neutral-600 mt-4 text-center">
            Beveiligde betaling via Stripe · iDEAL & creditcard
          </p>
        </div>

        <p className="text-center text-xs text-neutral-600">
          Vragen? Mail ons op{" "}
          <a href="mailto:info@merkly.nl" className="text-neutral-400 hover:text-white">
            info@merkly.nl
          </a>
        </p>
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
