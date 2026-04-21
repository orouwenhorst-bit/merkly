"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionReady, setSessionReady] = useState(false);

  const supabase = createBrowserClient();

  useEffect(() => {
    // Controleer of de gebruiker een actieve sessie heeft (na klikken resetlink)
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setSessionReady(true);
      } else {
        // Geen sessie — resetlink verlopen of niet gebruikt
        router.replace("/wachtwoord-vergeten?error=expired");
      }
    });
  }, [supabase, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Je wachtwoord moet minimaal 8 tekens lang zijn.");
      return;
    }
    if (password !== confirmPassword) {
      setError("De wachtwoorden komen niet overeen.");
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError("Wachtwoord bijwerken mislukt. Probeer opnieuw of vraag een nieuwe resetlink aan.");
      setLoading(false);
    } else {
      setDone(true);
      setTimeout(() => router.push("/dashboard"), 2500);
    }
  }

  if (!sessionReady) {
    return (
      <main className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-neutral-700 border-t-violet-400 rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <nav className="sticky top-0 z-50 flex items-center justify-between px-8 py-5 border-b border-neutral-900/50 bg-neutral-950/80 backdrop-blur-xl">
        <Link href="/" className="text-xl font-bold tracking-tight">
          <span className="text-white">Merk</span>
          <span className="text-violet-400">ly</span>
        </Link>
      </nav>

      <section className="max-w-md mx-auto px-6 py-20">
        <div className="absolute top-32 left-1/2 -translate-x-1/2 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
            Nieuw wachtwoord instellen
          </h1>
          <p className="text-neutral-400 text-sm">
            Kies een nieuw wachtwoord voor je Merkly-account.
          </p>
        </div>

        <div className="relative">
          {done ? (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-5 py-5 text-center">
              <p className="text-emerald-300 font-medium mb-1">Wachtwoord bijgewerkt!</p>
              <p className="text-sm text-neutral-400">
                Je wordt automatisch doorgestuurd naar je dashboard.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="password" className="block text-sm text-neutral-400 mb-1.5">
                  Nieuw wachtwoord
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimaal 8 tekens"
                  autoComplete="new-password"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm text-neutral-400 mb-1.5">
                  Wachtwoord bevestigen
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Herhaal je wachtwoord"
                  autoComplete="new-password"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !password || !confirmPassword}
                className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold rounded-xl hover:from-violet-500 hover:to-fuchsia-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Opslaan..." : "Wachtwoord opslaan"}
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
