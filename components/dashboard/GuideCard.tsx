"use client";

import Link from "next/link";
import { useState, useTransition, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";

export interface GuideCardData {
  id: string;
  companyName: string;
  industry: string | null;
  createdAt: string;
  isPremium: boolean;
  colors: string[]; // hex values, up to 5
  logoSvg?: string | null;
  tagline?: string | null;
}

export default function GuideCard({
  guide,
  viewerIsPremium,
}: {
  guide: GuideCardData;
  viewerIsPremium: boolean;
}) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ bottom: 0, right: 0 });
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [makingPremium, setMakingPremium] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const dateLabel = new Date(guide.createdAt).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  function openMenu(e: React.MouseEvent) {
    e.preventDefault();
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPos({
        bottom: window.innerHeight - rect.top + 4,
        right: window.innerWidth - rect.right,
      });
    }
    setMenuOpen((v) => !v);
  }

  async function handleDownload() {
    if (!viewerIsPremium) {
      router.push(`/upgrade?guideId=${guide.id}`);
      return;
    }
    setDownloading(true);
    try {
      const res = await fetch("/api/export-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guideId: guide.id }),
      });
      if (!res.ok) throw new Error("PDF mislukt");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const safeName = guide.companyName
        .replace(/[^a-zA-Z0-9-]/g, "-")
        .replace(/-+/g, "-")
        .toLowerCase();
      a.download = `${safeName}-huisstijl.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("PDF downloaden mislukt. Probeer het opnieuw.");
    } finally {
      setDownloading(false);
      setMenuOpen(false);
    }
  }

  async function handleCopy() {
    const url = `${window.location.origin}/result/${guide.id}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    setMenuOpen(false);
  }

  async function handleMakePremium() {
    setMakingPremium(true);
    setMenuOpen(false);
    try {
      const res = await fetch(`/api/guides/${guide.id}/make-premium`, { method: "POST" });
      if (!res.ok) throw new Error();
      router.push(`/result/${guide.id}`);
    } catch {
      alert("Er ging iets mis. Probeer het opnieuw.");
      setMakingPremium(false);
    }
  }

  async function handleDelete() {
    const res = await fetch(`/api/guides/${guide.id}`, { method: "DELETE" });
    if (res.ok) {
      startTransition(() => router.refresh());
    } else {
      alert("Verwijderen mislukt.");
    }
    setConfirmDelete(false);
    setMenuOpen(false);
  }

  const swatches = (guide.colors || []).slice(0, 5);
  const primaryColor = swatches[0] || "#8b5cf6";

  const dropdown = mounted && menuOpen
    ? createPortal(
        <>
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Sluit menu"
            className="fixed inset-0 z-40"
            onClick={() => setMenuOpen(false)}
          />
          <div
            className="fixed z-50 w-52 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl shadow-black/40"
            style={{ bottom: menuPos.bottom, right: menuPos.right }}
          >
            <Link
              href={`/result/${guide.id}`}
              className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-neutral-200 hover:bg-neutral-800 transition-colors rounded-t-xl"
            >
              <svg className="w-4 h-4 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Bekijken
            </Link>

            <button
              onClick={handleDownload}
              disabled={downloading}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-neutral-200 hover:bg-neutral-800 transition-colors disabled:opacity-50"
            >
              <svg className="w-4 h-4 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {downloading ? "Bezig..." : viewerIsPremium ? "Download PDF" : "PDF (Premium)"}
              {!viewerIsPremium && (
                <span className="ml-auto text-[10px] text-violet-300">✦</span>
              )}
            </button>

            <button
              onClick={handleCopy}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-neutral-200 hover:bg-neutral-800 transition-colors"
            >
              <svg className="w-4 h-4 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              {copied ? "Link gekopieerd!" : "Kopieer deel-link"}
            </button>

            {viewerIsPremium && !guide.isPremium && (
              <button
                onClick={handleMakePremium}
                disabled={makingPremium}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-violet-300 hover:bg-violet-500/10 transition-colors disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 3l14 9-14 9V3z" />
                </svg>
                {makingPremium ? "Bezig..." : "Maak Premium ✦"}
              </button>
            )}

            <div className="border-t border-neutral-800" />

            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors rounded-b-xl"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" />
                </svg>
                Verwijderen
              </button>
            ) : (
              <div className="p-2.5 bg-red-500/5 rounded-b-xl">
                <p className="text-xs text-red-300 mb-2 px-1">Zeker weten? Dit kan niet ongedaan worden gemaakt.</p>
                <div className="flex gap-1.5">
                  <button
                    onClick={handleDelete}
                    disabled={isPending}
                    className="flex-1 text-xs font-medium bg-red-500/20 text-red-200 hover:bg-red-500/30 border border-red-500/30 rounded-lg py-1.5 disabled:opacity-50"
                  >
                    Ja, verwijder
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="flex-1 text-xs font-medium bg-neutral-800 text-neutral-300 hover:bg-neutral-700 rounded-lg py-1.5"
                  >
                    Annuleer
                  </button>
                </div>
              </div>
            )}
          </div>
        </>,
        document.body
      )
    : null;

  return (
    <div className="group relative bg-neutral-900/50 border border-neutral-800 hover:border-neutral-700 rounded-2xl overflow-hidden transition-all hover:shadow-xl hover:shadow-violet-500/5 flex flex-col">
      {/* Preview header */}
      <Link
        href={`/dashboard/huisstijl/${guide.id}`}
        className="relative block h-32 overflow-hidden"
        style={{
          background: swatches.length >= 2
            ? `linear-gradient(135deg, ${swatches[0]} 0%, ${swatches[1]} 50%, ${swatches[2] ?? swatches[1]} 100%)`
            : `linear-gradient(135deg, ${primaryColor}, #111)`,
        }}
      >
        {/* Logo preview if available */}
        {guide.logoSvg && (
          <div
            className="absolute inset-0 flex items-center justify-center p-6 opacity-95 mix-blend-luminosity"
            dangerouslySetInnerHTML={{ __html: guide.logoSvg }}
          />
        )}

        {/* Darkening overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/60 via-transparent to-transparent" />

        {/* Badge */}
        <div className="absolute top-3 left-3">
          {guide.isPremium ? (
            <span className="inline-flex items-center gap-1 text-[10px] bg-black/60 backdrop-blur text-violet-200 border border-violet-400/30 rounded-full px-2 py-0.5 font-semibold">
              ✦ Premium
            </span>
          ) : (
            <span className="inline-flex items-center text-[10px] bg-black/60 backdrop-blur text-neutral-300 border border-white/10 rounded-full px-2 py-0.5">
              Gratis
            </span>
          )}
        </div>
      </Link>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <Link href={`/dashboard/huisstijl/${guide.id}`} className="min-w-0 flex-1">
            <p className="font-semibold text-white group-hover:text-violet-200 transition-colors truncate">
              {guide.companyName}
            </p>
            {guide.industry && (
              <p className="text-xs text-neutral-500 truncate">{guide.industry}</p>
            )}
          </Link>

          {/* Actions menu */}
          <div className="relative shrink-0">
            <button
              ref={buttonRef}
              onClick={openMenu}
              className="p-1.5 rounded-lg text-neutral-500 hover:text-white hover:bg-neutral-800 transition-colors"
              aria-label="Acties"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="5" cy="12" r="1.8" />
                <circle cx="12" cy="12" r="1.8" />
                <circle cx="19" cy="12" r="1.8" />
              </svg>
            </button>

            {dropdown}
          </div>
        </div>

        {guide.tagline && (
          <p className="text-xs text-neutral-400 italic line-clamp-2 mb-3">"{guide.tagline}"</p>
        )}

        {/* Color swatches */}
        {swatches.length > 0 && (
          <div className="flex -space-x-1.5 mb-3">
            {swatches.map((hex, i) => (
              <div
                key={i}
                className="w-5 h-5 rounded-full border-2 border-neutral-900 shadow-sm"
                style={{ backgroundColor: hex }}
                title={hex}
              />
            ))}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between pt-2 border-t border-neutral-800/80">
          <p className="text-[11px] text-neutral-600">{dateLabel}</p>
          <Link
            href={`/dashboard/huisstijl/${guide.id}`}
            className="text-xs font-medium text-violet-300 hover:text-violet-200 transition-colors"
          >
            Open →
          </Link>
        </div>
      </div>
    </div>
  );
}
