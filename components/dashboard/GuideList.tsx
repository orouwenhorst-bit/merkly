"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import GuideCard, { type GuideCardData } from "./GuideCard";

type Filter = "all" | "premium" | "free";

export default function GuideList({
  guides,
  viewerIsPremium,
}: {
  guides: GuideCardData[];
  viewerIsPremium: boolean;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(() => {
    let out = guides;
    if (filter === "premium") out = out.filter((g) => g.isPremium);
    if (filter === "free") out = out.filter((g) => !g.isPremium);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      out = out.filter(
        (g) =>
          g.companyName.toLowerCase().includes(q) ||
          (g.industry?.toLowerCase().includes(q) ?? false) ||
          (g.tagline?.toLowerCase().includes(q) ?? false)
      );
    }
    return out;
  }, [guides, query, filter]);

  if (guides.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-neutral-800 bg-neutral-900/30 p-12 text-center">
        <p className="text-neutral-500 mb-4">Je hebt nog geen huisstijlen gegenereerd.</p>
        <Link
          href="/generate"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:from-violet-500 hover:to-fuchsia-500 transition-all"
        >
          Genereer je eerste huisstijl →
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Filter + search bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Zoek op naam, branche of slogan..."
            className="w-full bg-neutral-900/60 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-violet-500 transition-colors"
          />
        </div>

        <div className="flex gap-1 bg-neutral-900/60 border border-neutral-800 rounded-xl p-1">
          <FilterPill active={filter === "all"} onClick={() => setFilter("all")}>
            Alle
          </FilterPill>
          <FilterPill active={filter === "premium"} onClick={() => setFilter("premium")}>
            ✦ Premium
          </FilterPill>
          <FilterPill active={filter === "free"} onClick={() => setFilter("free")}>
            Gratis
          </FilterPill>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-800 bg-neutral-900/30 p-10 text-center">
          <p className="text-neutral-500 text-sm">Geen huisstijlen gevonden die overeenkomen.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((g) => (
            <GuideCard key={g.id} guide={g} viewerIsPremium={viewerIsPremium} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
        active
          ? "bg-violet-500/20 text-violet-100 border border-violet-500/30"
          : "text-neutral-400 hover:text-white border border-transparent"
      }`}
    >
      {children}
    </button>
  );
}
