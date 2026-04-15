"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Active = "overview" | "huisstijlen" | "account";

const links: { key: Active; href: string; label: string; icon: React.ReactNode }[] = [
  {
    key: "overview",
    href: "/dashboard",
    label: "Overzicht",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    key: "huisstijlen",
    href: "/dashboard/huisstijlen",
    label: "Huisstijlen",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
      </svg>
    ),
  },
  {
    key: "account",
    href: "/dashboard/account",
    label: "Account",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export default function DashboardNav({
  active,
  isPremium,
}: {
  active: Active;
  isPremium: boolean;
}) {
  const pathname = usePathname();

  return (
    <div className="space-y-3">
      {/* Primary nav — card on desktop, pill row on mobile */}
      <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible bg-neutral-900/40 lg:bg-neutral-900/30 border border-neutral-800/60 rounded-2xl p-1.5">
        {links.map((link) => {
          const isActive = active === link.key || pathname === link.href;
          return (
            <Link
              key={link.key}
              href={link.href}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                isActive
                  ? "bg-gradient-to-r from-violet-600/30 to-fuchsia-600/20 text-white border border-violet-500/30 shadow-lg shadow-violet-500/10"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-800/60 border border-transparent"
              }`}
            >
              <span className={isActive ? "text-violet-300" : "text-neutral-500"}>
                {link.icon}
              </span>
              {link.label}
            </Link>
          );
        })}
      </div>

      {/* Quick CTA */}
      <Link
        href="/generate"
        className="hidden lg:flex items-center justify-center gap-2 w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold text-sm py-3 rounded-xl shadow-lg shadow-violet-500/25 transition-all"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Nieuwe huisstijl
      </Link>

      {/* Upgrade card — only for free users */}
      {!isPremium && (
        <div className="hidden lg:block relative overflow-hidden rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-600/10 via-fuchsia-600/10 to-neutral-900 p-4">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-violet-500/20 blur-3xl rounded-full pointer-events-none" />
          <div className="relative">
            <p className="text-xs font-semibold text-violet-200 mb-1">✦ Upgrade naar Premium</p>
            <p className="text-xs text-neutral-400 mb-3 leading-relaxed">
              Onbeperkt genereren, PDF export en alle logo-varianten.
            </p>
            <Link
              href="/upgrade"
              className="block w-full text-center text-xs font-semibold bg-white text-neutral-900 py-2 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              Bekijk Premium →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
