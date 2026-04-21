"use client";

import Link from "next/link";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase";

function WachtwoordVergetenInner() {
  const params = useSearchParams();
  const isExpired = params.get("error") === "expired";
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(
    isExpired ? "Je resetlink is verlopen. Vraag hieronder een nieuwe aan." : null
  );

  const supabase = createBrowserClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError(null);

    const origin = window.location.origin;
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/callback?next=/wachtwoord-vergeten/reset`,
    });

    if (resetError) {
      setError("Er ging iets mis. Controleer je e-mailadres en probeer opnieuw.");
      setLoading(false);
    } else {
      setDone(true);
      setLoading(false);
    }
  }

  return (
    <section className="max-w-md mx-auto px-6 py-20">
      <div className="absolute top-32 left-1/2 -translate-x-1/2 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
          Wachtwoord vergeten
        </h1>
        <p className="text-neutral-400 text-sm">
          Vul je e-mailadres in en we sturen je een link om je wachtwoord opnieuw in te stellen.
        </p>
      </div>

      <div className="relative">
        {done ? (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-5 py-5 text-center">
            <p className="text-emerald-300 font-medium mb-1">Controleer je e-mail</p>
            <p className="text-sm text-neutral-400">
              Als dit adres bij ons bekend is, ontvang je een resetlink op{" "}
              <span className="text-white">{email}</span>. Klik op de link om een nieuw
              wachtwoord in te stellen.
            </p>
            <Link
              href="/login"
              className="inline-block mt-4 text-sm text-violet-400 hover:text-violet-300 transition-colors"
            >
              ← Terug naar inloggen
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm text-neutral-400 mb-1.5">
                E-mailadres
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jouw@emailadres.nl"
                autoComplete="email"
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold rounded-xl hover:from-violet-500 hover:to-fuchsia-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Bezig..." : "Resetlink versturen"}
            </button>

            <p className="text-center text-sm text-neutral-500 pt-2">
              <Link href="/login" className="text-violet-400 hover:text-violet-300 transition-colors">
                ← Terug naar inloggen
              </Link>
            </p>
          </form>
        )}
      </div>
    </section>
  );
}

export default function WachtwoordVergetenPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <nav className="sticky top-0 z-50 flex items-center justify-between px-8 py-5 border-b border-neutral-900/50 bg-neutral-950/80 backdrop-blur-xl">
        <Link href="/" className="text-xl font-bold tracking-tight">
          <span className="text-white">Merk</span>
          <span className="text-violet-400">ly</span>
        </Link>
      </nav>
      <Suspense fallback={<div className="max-w-md mx-auto px-6 py-20" />}>
        <WachtwoordVergetenInner />
      </Suspense>
    </main>
  );
}
