"use client";

import { useState } from "react";
import Link from "next/link";

export default function ClaimBanner({ guideId }: { guideId: string }) {
  const [claimed, setClaimed] = useState(false);
  const [loading, setLoading] = useState(false);

  async function claimGuide() {
    setLoading(true);
    const res = await fetch(`/api/guides/${guideId}/claim`, { method: "PATCH" });
    if (res.ok) {
      setClaimed(true);
    }
    setLoading(false);
  }

  if (claimed) {
    return (
      <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-2 text-sm text-emerald-700">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          Opgeslagen!{" "}
          <Link href="/dashboard" className="font-medium underline underline-offset-2 hover:text-emerald-900">
            Bekijk in je dashboard →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-violet-50 border-b border-violet-200 px-6 py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4 flex-wrap">
        <p className="text-sm text-violet-800">
          Wil je deze huisstijl bewaren? Sla hem op in je dashboard.
        </p>
        <button
          onClick={claimGuide}
          disabled={loading}
          className="text-sm font-medium text-violet-700 bg-violet-100 hover:bg-violet-200 border border-violet-300 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50 shrink-0"
        >
          {loading ? "Bewaren..." : "Bewaar in mijn dashboard →"}
        </button>
      </div>
    </div>
  );
}
