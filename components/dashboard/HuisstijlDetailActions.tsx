"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

/* ── Logo variant download knop ── */
export function LogoDownloadButton({
  guideId,
  variantKey,
  canDownload,
}: {
  guideId: string;
  variantKey: string;
  canDownload: boolean;
}) {
  const [busy, setBusy] = useState(false);

  async function download() {
    if (!canDownload) return;
    setBusy(true);
    try {
      const res = await fetch(
        `/api/guides/${guideId}/download-logo?variant=${variantKey}`
      );
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `logo-${variantKey}.svg`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Download mislukt. Probeer het opnieuw.");
    } finally {
      setBusy(false);
    }
  }

  if (!canDownload) {
    return (
      <span className="text-[10px] text-neutral-600 flex items-center gap-1">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        Premium
      </span>
    );
  }

  return (
    <button
      onClick={download}
      disabled={busy}
      className="text-[10px] font-semibold text-violet-300 hover:text-violet-200 transition-colors disabled:opacity-50 flex items-center gap-1"
    >
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      {busy ? "..." : "SVG"}
    </button>
  );
}

/* ── PDF download knop ── */
export function PdfDownloadButton({
  guideId,
  companyName,
  canDownload,
}: {
  guideId: string;
  companyName: string;
  canDownload: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function download() {
    if (!canDownload) {
      router.push(`/upgrade?guideId=${guideId}`);
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/export-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guideId }),
      });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${companyName.toLowerCase().replace(/[^a-z0-9]/g, "-")}-huisstijl.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("PDF downloaden mislukt. Probeer het opnieuw.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={download}
      disabled={busy}
      className={`w-full flex items-center justify-center gap-2 text-sm font-semibold py-3 rounded-xl transition-all disabled:opacity-50 ${
        canDownload
          ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white shadow-lg shadow-violet-500/25"
          : "bg-neutral-800/60 border border-neutral-700 text-neutral-500 cursor-pointer hover:bg-neutral-800"
      }`}
    >
      {busy ? (
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      )}
      {busy ? "Bezig..." : canDownload ? "Download PDF" : "Vereist Premium ✦"}
    </button>
  );
}

/* ── PDF header download knop (klein) ── */
export function PdfDownloadButtonSmall({
  guideId,
  companyName,
  canDownload,
}: {
  guideId: string;
  companyName: string;
  canDownload: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function download() {
    if (!canDownload) {
      router.push(`/upgrade?guideId=${guideId}`);
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/export-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guideId }),
      });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${companyName.toLowerCase().replace(/[^a-z0-9]/g, "-")}-huisstijl.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("PDF downloaden mislukt.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={download}
      disabled={busy}
      className={`inline-flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all disabled:opacity-50 ${
        canDownload
          ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white shadow-lg shadow-violet-500/25"
          : "bg-neutral-800/60 border border-neutral-700 text-neutral-400 hover:bg-neutral-800"
      }`}
    >
      {busy ? (
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      )}
      {busy ? "Bezig..." : canDownload ? "Download PDF" : "PDF (Premium ✦)"}
    </button>
  );
}

/* ── Kopieer hex knop ── */
export function CopyHexButton({ hex }: { hex: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(hex);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }
  return (
    <button
      onClick={copy}
      className="p-1.5 rounded-lg text-neutral-600 hover:text-white hover:bg-neutral-800 transition-colors"
      title="Kopieer hex"
    >
      {copied ? (
        <svg className="w-3.5 h-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      ) : (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )}
    </button>
  );
}

/* ── Kopieer deel-link knop ── */
export function CopyLinkButton({ guideId }: { guideId: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(`${window.location.origin}/result/${guideId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button
      onClick={copy}
      className="w-full flex items-center justify-center gap-2 text-sm font-medium py-2.5 rounded-xl border border-neutral-700 text-neutral-300 hover:text-white hover:bg-neutral-800 transition-all"
    >
      {copied ? (
        <>
          <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          Link gekopieerd!
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          Kopieer deel-link
        </>
      )}
    </button>
  );
}

/* ── Google Fonts loader ── */
export function FontLoader({ url }: { url: string }) {
  // Inject Google Fonts link on mount
  if (typeof document !== "undefined") {
    const id = "huisstijl-detail-fonts";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = url;
      document.head.appendChild(link);
    }
  }
  return null;
}
