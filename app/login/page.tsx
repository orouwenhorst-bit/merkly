"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { createBrowserClient } from "@/lib/supabase";

function LoginInner() {
  const params = useSearchParams();
  const redirectTo = params.get("redirect") ?? "/dashboard";
  const hasError = params.get("error") === "auth_failed";

  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const supabase = createBrowserClient();
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  async function handleGoogle() {
    setGoogleLoading(true);
    setFormError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
      },
    });
    if (error) {
      setFormError("Inloggen via Google mislukt. Probeer het opnieuw.");
      setGoogleLoading(false);
    }
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setEmailLoading(true);
    setFormError(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
      },
    });
    if (error) {
      setFormError("Verzenden mislukt. Controleer je e-mailadres en probeer opnieuw.");
      setEmailLoading(false);
    } else {
      setEmailSent(true);
      setEmailLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-8 py-5 border-b border-neutral-900/50 bg-neutral-950/80 backdrop-blur-xl">
        <Link href="/" className="text-xl font-bold tracking-tight">
          <span className="text-white">Merk</span>
          <span className="text-violet-400">ly</span>
        </Link>
      </nav>

      <section className="max-w-md mx-auto px-6 py-20">
        {/* Glow */}
        <div className="absolute top-32 left-1/2 -translate-x-1/2 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
            Inloggen bij Merkly
          </h1>
          <p className="text-neutral-400 text-sm">
            Log in om je huisstijlen te beheren en premium te activeren.
          </p>
        </div>

        {(hasError || formError) && (
          <div className="relative bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-6 text-sm text-red-300">
            {formError ?? "Inloggen mislukt. Probeer het opnieuw."}
          </div>
        )}

        <div className="relative space-y-4">
          {/* Google */}
          <button
            onClick={handleGoogle}
            disabled={googleLoading || emailLoading}
            className="w-full flex items-center justify-center gap-3 bg-white text-neutral-900 font-semibold py-3.5 px-6 rounded-xl hover:bg-neutral-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {googleLoading ? (
              <span className="w-5 h-5 border-2 border-neutral-400 border-t-neutral-800 rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            )}
            Doorgaan met Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-neutral-800" />
            <span className="text-xs text-neutral-600">of</span>
            <div className="flex-1 h-px bg-neutral-800" />
          </div>

          {/* Email magic link */}
          {emailSent ? (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-5 py-4 text-center">
              <p className="text-emerald-300 font-medium mb-1">Controleer je inbox</p>
              <p className="text-sm text-neutral-400">
                We hebben een inloglink gestuurd naar <span className="text-white">{email}</span>.
                Klik op de link om in te loggen.
              </p>
            </div>
          ) : (
            <form onSubmit={handleEmailSubmit} className="space-y-3">
              <div>
                <label htmlFor="email" className="block text-sm text-neutral-400 mb-1.5">
                  Log in met je e-mailadres
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jouw@emailadres.nl"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={emailLoading || googleLoading || !email}
                className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold rounded-xl hover:from-violet-500 hover:to-fuchsia-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {emailLoading ? "Bezig met verzenden..." : "Stuur magische link"}
              </button>
            </form>
          )}

          <p className="text-center text-xs text-neutral-600 pt-2">
            Geen account nodig — we maken er automatisch één aan
          </p>
        </div>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-950" />}>
      <LoginInner />
    </Suspense>
  );
}
