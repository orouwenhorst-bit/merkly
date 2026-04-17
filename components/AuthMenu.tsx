"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function AuthMenu({
  displayName,
  email,
  isPremium,
}: {
  displayName: string;
  email: string;
  isPremium: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState({ top: 0, right: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  function toggle() {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
    }
    setOpen((v) => !v);
  }

  const dropdown =
    mounted && open
      ? createPortal(
          <>
            <button
              type="button"
              aria-label="Sluit menu"
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />
            <div
              className="fixed z-50 w-60 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl shadow-black/40 overflow-hidden"
              style={{ top: pos.top, right: pos.right }}
            >
              <div className="px-4 py-3 border-b border-neutral-800">
                <p className="text-sm font-semibold text-white truncate">{displayName}</p>
                <p className="text-xs text-neutral-500 truncate">{email}</p>
                <div className="mt-2">
                  {isPremium ? (
                    <span className="inline-flex items-center gap-1 text-[10px] bg-violet-500/20 text-violet-300 border border-violet-500/30 rounded-full px-2 py-0.5 font-medium">
                      ✦ Premium
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/20 rounded-full px-2 py-0.5 font-medium">
                      Gratis account
                    </span>
                  )}
                </div>
              </div>

              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-neutral-200 hover:bg-neutral-800 transition-colors"
              >
                <svg className="w-4 h-4 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Dashboard
              </Link>

              <Link
                href="/dashboard/huisstijlen"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-neutral-200 hover:bg-neutral-800 transition-colors"
              >
                <svg className="w-4 h-4 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
                </svg>
                Mijn huisstijlen
              </Link>

              <Link
                href="/generate"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-neutral-200 hover:bg-neutral-800 transition-colors"
              >
                <svg className="w-4 h-4 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Nieuwe huisstijl
              </Link>

              <Link
                href="/dashboard/account"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-neutral-200 hover:bg-neutral-800 transition-colors"
              >
                <svg className="w-4 h-4 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Account
              </Link>

              {!isPremium && (
                <Link
                  href="/upgrade"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-violet-300 hover:bg-violet-500/10 transition-colors border-t border-neutral-800"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Upgrade naar Premium
                </Link>
              )}

              <form action="/auth/signout" method="POST" className="border-t border-neutral-800">
                <button
                  type="submit"
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-300 hover:bg-red-500/10 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Uitloggen
                </button>
              </form>
            </div>
          </>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggle}
        className="flex items-center gap-2 bg-neutral-900/60 hover:bg-neutral-800 border border-neutral-800 rounded-full pl-1 pr-3 py-1 transition-colors"
        aria-label="Account menu"
        aria-expanded={open}
      >
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center text-xs font-bold text-white uppercase">
          {displayName[0] ?? "?"}
        </div>
        <span className="text-sm text-neutral-200 hidden sm:block max-w-[120px] truncate">
          {displayName}
        </span>
        <svg className="w-3.5 h-3.5 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {dropdown}
    </>
  );
}
