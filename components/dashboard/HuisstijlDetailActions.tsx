"use client";

import { useState, useEffect } from "react";
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
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  async function download(format: "svg" | "png") {
    setOpen(false);
    setBusy(format);
    try {
      const res = await fetch(
        `/api/guides/${guideId}/download-logo?variant=${variantKey}&format=${format}`
      );
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `logo-${variantKey}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Download mislukt. Probeer het opnieuw.");
    } finally {
      setBusy(null);
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
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={!!busy}
        className="text-[10px] font-semibold text-violet-300 hover:text-violet-200 transition-colors disabled:opacity-50 flex items-center gap-1"
      >
        <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        {busy ? "..." : "Download"}
      </button>
      {open && (
        <div className="absolute bottom-full right-0 mb-1.5 bg-neutral-800 border border-neutral-700 rounded-xl overflow-hidden shadow-2xl z-20 min-w-[140px]">
          <button
            onClick={() => download("svg")}
            className="flex items-center gap-2 w-full text-left px-3 py-2.5 text-[11px] text-white hover:bg-neutral-700 transition-colors whitespace-nowrap"
          >
            <span className="font-semibold">SVG</span>
            <span className="text-neutral-400">vectorafbeelding</span>
          </button>
          <div className="h-px bg-neutral-700" />
          <button
            onClick={() => download("png")}
            className="flex items-center gap-2 w-full text-left px-3 py-2.5 text-[11px] text-white hover:bg-neutral-700 transition-colors whitespace-nowrap"
          >
            <span className="font-semibold">PNG</span>
            <span className="text-neutral-400">512 × 512 px</span>
          </button>
        </div>
      )}
    </div>
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

/* ── Slogan cycler (premium) ── */
export function SloganCycler({
  guideId,
  isPremiumUser,
  initialTagline,
}: {
  guideId: string;
  isPremiumUser: boolean;
  initialTagline: string;
}) {
  const router = useRouter();
  const [phase, setPhase] = useState<"idle" | "loading" | "cycling" | "saving">("idle");
  const [slogans, setSlogans] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [activeTagline, setActiveTagline] = useState(initialTagline);

  async function generate() {
    setPhase("loading");
    try {
      const res = await fetch(`/api/guides/${guideId}/regenerate-slogans`, { method: "POST" });
      if (!res.ok) throw new Error();
      const { slogans: list } = await res.json();
      setSlogans(list);
      setIndex(0);
      setPhase("cycling");
    } catch {
      alert("Slogans genereren mislukt. Probeer het opnieuw.");
      setPhase("idle");
    }
  }

  async function applySlogan(tagline: string) {
    setPhase("saving");
    try {
      const res = await fetch(`/api/guides/${guideId}/apply-slogan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tagline }),
      });
      if (!res.ok) throw new Error();
      setActiveTagline(tagline);
      setPhase("idle");
      router.refresh();
    } catch {
      alert("Opslaan mislukt. Probeer het opnieuw.");
      setPhase("cycling");
    }
  }

  if (!isPremiumUser) {
    return (
      <div className="flex items-center gap-2 mt-1">
        {activeTagline && (
          <p className="text-neutral-400 text-sm italic">
            &ldquo;{activeTagline}&rdquo;
          </p>
        )}
        <a
          href="/upgrade"
          className="inline-flex items-center gap-1 text-[10px] text-violet-400 hover:text-violet-300 border border-violet-500/30 rounded-full px-2 py-0.5 transition-colors shrink-0"
        >
          ✦ Slogan aanpassen
        </a>
      </div>
    );
  }

  if (phase === "cycling" && slogans.length > 0) {
    return (
      <div className="mt-2 bg-neutral-900 border border-violet-500/30 rounded-xl p-3 space-y-3">
        <p className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">
          Slogan {index + 1} van {slogans.length}
        </p>
        <p className="text-white text-sm font-medium italic">
          &ldquo;{slogans[index]}&rdquo;
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIndex((i) => (i - 1 + slogans.length) % slogans.length)}
            className="text-[11px] text-neutral-400 hover:text-white border border-neutral-700 hover:border-neutral-600 rounded-lg px-2.5 py-1.5 transition-colors"
          >
            ← Vorige
          </button>
          <button
            onClick={() => setIndex((i) => (i + 1) % slogans.length)}
            className="text-[11px] text-neutral-400 hover:text-white border border-neutral-700 hover:border-neutral-600 rounded-lg px-2.5 py-1.5 transition-colors"
          >
            Volgende →
          </button>
          <button
            onClick={() => applySlogan(slogans[index])}
            className="text-[11px] font-semibold bg-violet-600 hover:bg-violet-500 text-white rounded-lg px-3 py-1.5 transition-colors"
          >
            Gebruik deze ✓
          </button>
          <button
            onClick={() => setPhase("idle")}
            className="text-[11px] text-neutral-500 hover:text-neutral-300 transition-colors ml-auto"
          >
            Annuleren
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 mt-1 flex-wrap">
      {activeTagline && (
        <p className="text-neutral-400 text-sm italic">
          &ldquo;{activeTagline}&rdquo;
        </p>
      )}
      <button
        onClick={generate}
        disabled={phase === "loading" || phase === "saving"}
        className="inline-flex items-center gap-1 text-[10px] text-violet-400 hover:text-violet-300 border border-violet-500/30 hover:border-violet-400/50 rounded-full px-2 py-0.5 transition-colors disabled:opacity-50 shrink-0"
      >
        {phase === "loading" ? (
          <>
            <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Genereren...
          </>
        ) : phase === "saving" ? (
          <>
            <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Opslaan...
          </>
        ) : (
          <>↻ Nieuwe slogans</>
        )}
      </button>
    </div>
  );
}

type LogoVariants = {
  fullColor: string;
  monoBlack: string;
  monoWhite: string;
  monoPrimary: string;
  transparent: string;
  recraftImageId?: string;
};

function normalizeSvgClient(svg: string): string {
  return svg.replace(/<svg([^>]*)>/, (_, attrs) => {
    const cleaned = attrs
      .replace(/\s+width="[^"]*"/g, "")
      .replace(/\s+height="[^"]*"/g, "")
      .replace(/\s+style="[^"]*"/g, "");
    return `<svg${cleaned} style="width:100%;height:100%;display:block;">`;
  });
}

/* ── Logo regenereer knop met vergelijking (premium) ── */
export function LogoRegenerateButton({
  guideId,
  isPremiumUser,
  currentLogoVariants,
}: {
  guideId: string;
  isPremiumUser: boolean;
  currentLogoVariants: LogoVariants | null;
}) {
  const router = useRouter();
  const [phase, setPhase] = useState<"idle" | "loading" | "comparing">("idle");
  const [saving, setSaving] = useState(false);
  const [newVariants, setNewVariants] = useState<LogoVariants | null>(null);

  async function generate() {
    setPhase("loading");
    try {
      const res = await fetch(`/api/guides/${guideId}/regenerate-logo`, { method: "POST" });
      if (!res.ok) throw new Error();
      const { logoVariants } = await res.json();
      setNewVariants(logoVariants);
      setPhase("comparing");
    } catch {
      alert("Logo genereren mislukt. Probeer het opnieuw.");
      setPhase("idle");
    }
  }

  async function applyLogo(variants: LogoVariants) {
    setSaving(true);
    try {
      const res = await fetch(`/api/guides/${guideId}/apply-logo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logoVariants: variants }),
      });
      if (!res.ok) throw new Error();
      setPhase("idle");
      router.refresh();
    } catch {
      alert("Opslaan mislukt. Probeer het opnieuw.");
    } finally {
      setSaving(false);
    }
  }

  if (!isPremiumUser) {
    return (
      <a
        href="/upgrade"
        className="inline-flex items-center gap-1 text-[10px] text-violet-400 hover:text-violet-300 border border-violet-500/30 rounded-full px-2.5 py-1 transition-colors"
      >
        ✦ Nieuw logo
      </a>
    );
  }

  if (phase === "comparing" && newVariants) {
    return (
      <div className="mt-4 bg-neutral-900 border border-violet-500/30 rounded-xl p-4 space-y-4">
        <p className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">
          Kies je logo
        </p>
        <div className="grid grid-cols-2 gap-4">
          {/* Huidig logo */}
          <div className="space-y-2">
            <p className="text-[10px] text-neutral-500 text-center">Huidig</p>
            <div className="rounded-xl border border-neutral-700 bg-white overflow-hidden aspect-square flex items-center justify-center p-6">
              {currentLogoVariants?.fullColor ? (
                <div
                  className="w-full h-full [&_svg]:w-full [&_svg]:h-full"
                  dangerouslySetInnerHTML={{
                    __html: normalizeSvgClient(currentLogoVariants.fullColor),
                  }}
                />
              ) : (
                <span className="text-neutral-300 text-xs">Geen logo</span>
              )}
            </div>
            <button
              onClick={() => currentLogoVariants && applyLogo(currentLogoVariants)}
              disabled={saving || !currentLogoVariants}
              className="w-full text-[11px] font-medium text-neutral-300 hover:text-white border border-neutral-700 hover:border-neutral-600 rounded-lg py-2 transition-colors disabled:opacity-40"
            >
              Behoud huidig
            </button>
          </div>

          {/* Nieuw logo */}
          <div className="space-y-2">
            <p className="text-[10px] text-violet-400 text-center font-semibold">Nieuw ✦</p>
            <div className="rounded-xl border border-violet-500/40 bg-white overflow-hidden aspect-square flex items-center justify-center p-6">
              <div
                className="w-full h-full [&_svg]:w-full [&_svg]:h-full"
                dangerouslySetInnerHTML={{
                  __html: normalizeSvgClient(newVariants.fullColor),
                }}
              />
            </div>
            <button
              onClick={() => applyLogo(newVariants)}
              disabled={saving}
              className="w-full text-[11px] font-semibold bg-violet-600 hover:bg-violet-500 text-white rounded-lg py-2 transition-colors disabled:opacity-50"
            >
              {saving ? (
                <span className="flex items-center justify-center gap-1.5">
                  <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Opslaan...
                </span>
              ) : (
                "Gebruik nieuw ✓"
              )}
            </button>
          </div>
        </div>
        <button
          onClick={() => setPhase("idle")}
          className="text-[11px] text-neutral-500 hover:text-neutral-300 transition-colors w-full text-center"
        >
          Annuleren
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={generate}
      disabled={phase === "loading"}
      className="inline-flex items-center gap-1.5 text-[11px] font-medium text-violet-300 hover:text-violet-200 border border-violet-500/30 hover:border-violet-400/50 rounded-full px-2.5 py-1 transition-colors disabled:opacity-50"
    >
      {phase === "loading" ? (
        <>
          <svg className="w-3 h-3 animate-spin shrink-0" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Genereren...
        </>
      ) : (
        <>↻ Nieuw logo</>
      )}
    </button>
  );
}

/* ── Google Fonts loader ── */
export function FontLoader({ url }: { url: string }) {
  useEffect(() => {
    const id = "huisstijl-detail-fonts";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = url;
      document.head.appendChild(link);
    }
  }, [url]);
  return null;
}
