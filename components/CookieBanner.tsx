"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const STORAGE_KEY = "merkly_cookie_consent";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) setVisible(true);
    } catch {
      // localStorage not available (e.g. SSR edge case)
    }
  }, []);

  function accept() {
    try {
      localStorage.setItem(STORAGE_KEY, "all");
    } catch {}
    setVisible(false);
  }

  function functional() {
    try {
      localStorage.setItem(STORAGE_KEY, "functional");
    } catch {}
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookiemelding"
      aria-modal="false"
      className="fixed bottom-0 left-0 right-0 z-[100] p-4 sm:p-6"
    >
      <div className="max-w-3xl mx-auto bg-neutral-900 border border-neutral-800 rounded-2xl px-5 py-4 shadow-2xl shadow-black/40 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Text */}
        <div className="flex-1 text-sm text-neutral-400 leading-relaxed">
          <span className="font-semibold text-white">Cookies</span> — Merkly gebruikt functionele
          cookies voor authenticatie en veilige betalingen via Stripe. We plaatsen{" "}
          <span className="text-white">geen</span> tracking- of advertentiecookies.{" "}
          <Link href="/cookies" className="text-violet-400 hover:text-violet-300 transition-colors underline underline-offset-2">
            Meer info
          </Link>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={functional}
            className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors underline underline-offset-2"
          >
            Alleen noodzakelijk
          </button>
          <button
            onClick={accept}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Accepteren
          </button>
        </div>
      </div>
    </div>
  );
}
