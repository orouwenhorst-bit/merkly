"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import DashboardShell from "@/components/dashboard/DashboardShell";
import type { BrandGuideResult } from "@/types/brand";

/* ── helpers ── */
function normalizeSvg(svg: string): string {
  return svg.replace(/<svg([^>]*)>/, (_, attrs) => {
    const cleaned = attrs
      .replace(/\s+width="[^"]*"/g, "")
      .replace(/\s+height="[^"]*"/g, "")
      .replace(/\s+style="[^"]*"/g, "");
    return `<svg${cleaned} style="width:100%;height:100%;display:block;">`;
  });
}

function isDark(hex: string) {
  const c = hex.replace("#", "");
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 < 128;
}

type GuideData = {
  id: string;
  company_name: string;
  industry: string | null;
  created_at: string;
  is_premium: boolean;
  user_id: string | null;
  result: BrandGuideResult;
};

/* ── Logo variant preview card ── */
function LogoVariantCard({
  label,
  svgString,
  background,
  guideId,
  variantKey,
  isPremium,
}: {
  label: string;
  svgString: string;
  background: string;
  guideId: string;
  variantKey: string;
  isPremium: boolean;
}) {
  const [downloading, setDownloading] = useState(false);

  async function download() {
    if (!isPremium) return;
    setDownloading(true);
    try {
      const res = await fetch(`/api/guides/${guideId}/download-logo?variant=${variantKey}`);
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
      setDownloading(false);
    }
  }

  return (
    <div className="group relative rounded-xl border border-neutral-800 overflow-hidden flex flex-col">
      <div
        className="aspect-square flex items-center justify-center p-8"
        style={{ backgroundColor: background }}
      >
        <div
          className="w-full h-full max-w-[80px] max-h-[80px] [&_svg]:w-full [&_svg]:h-full"
          dangerouslySetInnerHTML={{ __html: normalizeSvg(svgString) }}
        />
      </div>
      <div className="p-3 bg-neutral-900 border-t border-neutral-800 flex items-center justify-between gap-2">
        <span className="text-xs text-neutral-400 truncate">{label}</span>
        {isPremium ? (
          <button
            onClick={download}
            disabled={downloading}
            className="shrink-0 text-[10px] font-semibold text-violet-300 hover:text-violet-200 transition-colors disabled:opacity-50 flex items-center gap-1"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {downloading ? "..." : "SVG"}
          </button>
        ) : (
          <span className="text-[10px] text-neutral-600 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Premium
          </span>
        )}
      </div>
    </div>
  );
}

/* ── Main page ── */
export default function HuisstijlDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const guideId = params.id;

  const [guide, setGuide] = useState<GuideData | null>(null);
  const [isPremiumUser, setIsPremiumUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/guides/${guideId}/detail`);
        if (res.status === 401) { router.push("/login"); return; }
        if (res.status === 403 || res.status === 404) { router.push("/dashboard/huisstijlen"); return; }
        if (!res.ok) throw new Error();
        const data = await res.json();
        setGuide(data.guide);
        setIsPremiumUser(data.isPremiumUser);
      } catch {
        setError("Kan huisstijl niet laden.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [guideId, router]);

  // Inject Google Fonts for typography preview
  useEffect(() => {
    if (!guide) return;
    const url = guide.result?.typography?.googleFontsUrl;
    if (!url) return;
    const id = `detail-fonts-${guideId}`;
    if (document.getElementById(id)) { setFontsLoaded(true); return; }
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = url;
    link.onload = () => setFontsLoaded(true);
    document.head.appendChild(link);
  }, [guide, guideId]);

  const downloadPDF = useCallback(async () => {
    if (!guide) return;
    if (!isPremiumUser && !guide.is_premium) {
      router.push(`/upgrade?guideId=${guideId}`);
      return;
    }
    setDownloading(true);
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
      a.download = `${guide.company_name.toLowerCase().replace(/[^a-z0-9]/g, "-")}-huisstijl.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("PDF downloaden mislukt. Probeer het opnieuw.");
    } finally {
      setDownloading(false);
    }
  }, [guide, isPremiumUser, guideId, router]);

  async function copyHex(hex: string) {
    await navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1500);
  }

  if (loading) {
    return (
      <DashboardShell active="huisstijlen">
        <div className="flex items-center justify-center py-32">
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-2 h-2 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      </DashboardShell>
    );
  }

  if (error || !guide) {
    return (
      <DashboardShell active="huisstijlen">
        <div className="text-center py-32 text-neutral-500">{error ?? "Niet gevonden"}</div>
      </DashboardShell>
    );
  }

  const result = guide.result;
  const colors = result?.colorPalette?.colors ?? [];
  const primary = colors.find(c => c.category === "primary")?.hex ?? colors[0]?.hex ?? "#8b5cf6";
  const fonts = result?.typography?.fonts ?? [];
  const displayFont = fonts.find(f => f.category === "display")?.name ?? fonts[0]?.name ?? "";
  const bodyFont = fonts.find(f => f.category === "body")?.name ?? fonts[1]?.name ?? "";
  const hasLogo = !!result?.logoVariants?.fullColor;
  const canDownload = isPremiumUser || guide.is_premium;

  const logoVariants = hasLogo
    ? [
        { key: "fullColor", label: "Volledig kleur", bg: "#ffffff" },
        { key: "monoBlack", label: "Zwart", bg: "#ffffff" },
        { key: "monoWhite", label: "Wit", bg: "#111111" },
        { key: "monoPrimary", label: "Merkkleur", bg: "#f4f4f5" },
        { key: "transparent", label: "Transparant", bg: "repeating-conic-gradient(#cccccc 0% 25%, #ffffff 0% 50%) 0 0 / 16px 16px" },
      ]
    : [];

  return (
    <DashboardShell active="huisstijlen">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-neutral-500 mb-6">
        <Link href="/dashboard/huisstijlen" className="hover:text-white transition-colors">
          Huisstijlen
        </Link>
        <span>/</span>
        <span className="text-white font-medium">{guide.company_name}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
        <div className="flex items-start gap-4">
          {/* Logo preview */}
          {result?.logoVariants?.fullColor ? (
            <div className="w-16 h-16 rounded-xl bg-white border border-neutral-200 flex items-center justify-center overflow-hidden shrink-0">
              <div
                className="w-12 h-12 [&_svg]:w-full [&_svg]:h-full"
                dangerouslySetInnerHTML={{ __html: normalizeSvg(result.logoVariants.fullColor) }}
              />
            </div>
          ) : (
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold text-white shrink-0"
              style={{ backgroundColor: primary }}
            >
              {guide.company_name[0]?.toUpperCase()}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {guide.company_name}
              </h1>
              {guide.is_premium && (
                <span className="inline-flex items-center gap-1 text-xs bg-violet-500/20 text-violet-300 border border-violet-500/30 rounded-full px-2.5 py-0.5 font-medium">
                  ✦ Premium
                </span>
              )}
            </div>
            {guide.industry && <p className="text-neutral-500 text-sm mt-1">{guide.industry}</p>}
            {result?.toneOfVoice?.tagline && (
              <p className="text-neutral-400 text-sm mt-1 italic">"{result.toneOfVoice.tagline}"</p>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 shrink-0 flex-wrap">
          <Link
            href={`/result/${guide.id}`}
            target="_blank"
            className="inline-flex items-center gap-2 text-sm text-neutral-300 hover:text-white bg-neutral-800/60 hover:bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2.5 transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Online bekijken
          </Link>
          <button
            onClick={downloadPDF}
            disabled={downloading}
            className={`inline-flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all disabled:opacity-50 ${
              canDownload
                ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white shadow-lg shadow-violet-500/25"
                : "bg-neutral-800/60 border border-neutral-700 text-neutral-400 hover:bg-neutral-800"
            }`}
          >
            {downloading ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            )}
            {downloading ? "Bezig..." : canDownload ? "Download PDF" : "PDF (Premium ✦)"}
          </button>
        </div>
      </div>

      {/* Premium upsell banner for free users */}
      {!canDownload && (
        <div className="relative mb-8 overflow-hidden rounded-2xl border border-violet-500/30 bg-gradient-to-r from-violet-600/10 via-fuchsia-600/10 to-neutral-900 p-5">
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-violet-500/20 blur-3xl rounded-full pointer-events-none" />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-white mb-1">✦ Upgrade naar Premium</p>
              <p className="text-xs text-neutral-400 max-w-md">
                Download je brand guide als PDF, alle logo-varianten (SVG) en gebruik de guide onbeperkt voor elk project.
              </p>
            </div>
            <Link
              href="/upgrade"
              className="shrink-0 text-sm font-semibold bg-white text-neutral-900 hover:bg-neutral-100 px-5 py-2.5 rounded-xl transition-colors"
            >
              Bekijk Premium →
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Logo variants + Colors + Fonts */}
        <div className="lg:col-span-2 space-y-6">

          {/* Logo variants */}
          {hasLogo && (
            <section className="bg-neutral-900/40 border border-neutral-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-white">Logo-varianten</h2>
                {!canDownload && (
                  <span className="text-xs text-neutral-500 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Download vereist Premium
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {logoVariants.map(({ key, label, bg }) => {
                  const svgString = result.logoVariants?.[key as keyof typeof result.logoVariants];
                  if (!svgString || typeof svgString !== "string") return null;
                  return (
                    <LogoVariantCard
                      key={key}
                      label={label}
                      svgString={svgString}
                      background={bg}
                      guideId={guide.id}
                      variantKey={key}
                      isPremium={canDownload}
                    />
                  );
                })}
              </div>
            </section>
          )}

          {/* Color palette */}
          {colors.length > 0 && (
            <section className="bg-neutral-900/40 border border-neutral-800 rounded-2xl p-6">
              <h2 className="text-base font-semibold text-white mb-4">Kleurenpalet</h2>
              <div className="space-y-3">
                {colors.map((color) => (
                  <div key={color.hex} className="flex items-center gap-4 rounded-xl border border-neutral-800 overflow-hidden">
                    <div className="w-16 h-14 shrink-0" style={{ backgroundColor: color.hex }} />
                    <div className="flex-1 min-w-0 py-2">
                      <p className="text-sm font-semibold text-white truncate">{color.name}</p>
                      <p className="text-xs text-neutral-500 truncate">{color.usage}</p>
                    </div>
                    <div className="flex items-center gap-2 pr-4 shrink-0">
                      <span className="text-xs font-mono text-neutral-400">{color.hex.toUpperCase()}</span>
                      <button
                        onClick={() => copyHex(color.hex)}
                        className="p-1.5 rounded-lg text-neutral-600 hover:text-white hover:bg-neutral-800 transition-colors"
                        title="Kopieer hex"
                      >
                        {copiedHex === color.hex ? (
                          <svg className="w-3.5 h-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        ) : (
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Typography */}
          {fonts.length > 0 && (
            <section className="bg-neutral-900/40 border border-neutral-800 rounded-2xl p-6">
              <h2 className="text-base font-semibold text-white mb-4">Typografie</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {fonts.map((font) => (
                  <div key={font.name} className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                        {font.category === "display" ? "Display" : font.category === "body" ? "Body" : "Accent"}
                      </span>
                      {font.googleFontsUrl && (
                        <a
                          href={font.googleFontsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1"
                        >
                          Google Fonts
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      )}
                    </div>
                    <div style={{ fontFamily: `'${font.name}', ${font.fallback ?? "sans-serif"}` }}>
                      <p className="text-3xl font-bold text-white leading-none">Aa</p>
                      <p
                        className="text-[11px] text-neutral-400 mt-3 leading-relaxed"
                        style={{ fontFamily: `'${font.name}', ${font.fallback ?? "sans-serif"}` }}
                      >
                        ABCDEFGHIJKLMNOPQRSTUVWXYZ<br />
                        abcdefghijklmnopqrstuvwxyz<br />
                        0123456789 !@#&
                      </p>
                    </div>
                    <div className="pt-3 border-t border-neutral-800 space-y-0.5">
                      <p className="text-xs font-semibold text-white">{font.name}</p>
                      <p className="text-[10px] text-neutral-500">{font.usage}</p>
                      <p className="text-[10px] text-neutral-600">Gewichten: {font.weights?.join(", ")}</p>
                    </div>
                  </div>
                ))}
              </div>
              {result?.typography?.pairingRationale && (
                <div className="mt-4 p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
                  <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Waarom deze combinatie</p>
                  <p className="text-xs text-neutral-400 leading-relaxed">{result.typography.pairingRationale}</p>
                </div>
              )}
            </section>
          )}
        </div>

        {/* Right column: Quick info + Merkstrategie */}
        <div className="space-y-6">

          {/* Quick stats */}
          <section className="bg-neutral-900/40 border border-neutral-800 rounded-2xl p-5 space-y-4">
            <h2 className="text-base font-semibold text-white">Overzicht</h2>
            <div className="space-y-3">
              {[
                { label: "Gegenereerd", value: new Date(guide.created_at).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" }) },
                { label: "Type", value: guide.is_premium ? "Premium guide" : "Gratis guide" },
                { label: "Branche", value: guide.industry ?? "—" },
                { label: "Kleuren", value: `${colors.length} kleuren` },
                { label: "Lettertypen", value: fonts.length > 0 ? fonts.map(f => f.name).join(" + ") : "—" },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-start justify-between gap-2">
                  <span className="text-xs text-neutral-500 shrink-0">{label}</span>
                  <span className="text-xs text-neutral-300 text-right">{value}</span>
                </div>
              ))}
            </div>
          </section>

          {/* PDF download card */}
          <section className="bg-neutral-900/40 border border-neutral-800 rounded-2xl p-5">
            <h2 className="text-base font-semibold text-white mb-3">Brand guide PDF</h2>
            <p className="text-xs text-neutral-500 leading-relaxed mb-4">
              Professionele PDF met alle merkrichtlijnen: logo, kleuren, typografie, tone of voice, mockups en meer.
            </p>
            <button
              onClick={downloadPDF}
              disabled={downloading}
              className={`w-full flex items-center justify-center gap-2 text-sm font-semibold py-3 rounded-xl transition-all disabled:opacity-50 ${
                canDownload
                  ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white shadow-lg shadow-violet-500/25"
                  : "bg-neutral-800/60 border border-neutral-700 text-neutral-500 cursor-default"
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {downloading ? "Bezig..." : canDownload ? "Download PDF" : "Vereist Premium ✦"}
            </button>
          </section>

          {/* Share */}
          <section className="bg-neutral-900/40 border border-neutral-800 rounded-2xl p-5">
            <h2 className="text-base font-semibold text-white mb-3">Deel je huisstijl</h2>
            <p className="text-xs text-neutral-500 leading-relaxed mb-4">
              Stuur de publieke link naar klanten, medewerkers of partners.
            </p>
            <CopyLinkButton guideId={guide.id} />
          </section>

          {/* Merkstrategie */}
          {result?.strategy && (
            <section className="bg-neutral-900/40 border border-neutral-800 rounded-2xl p-5">
              <h2 className="text-base font-semibold text-white mb-4">Merkstrategie</h2>
              <div className="space-y-4">
                {result.strategy.mission && (
                  <div>
                    <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Missie</p>
                    <p className="text-xs text-neutral-400 leading-relaxed">{result.strategy.mission}</p>
                  </div>
                )}
                {result.strategy.vision && (
                  <div>
                    <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Visie</p>
                    <p className="text-xs text-neutral-400 leading-relaxed">{result.strategy.vision}</p>
                  </div>
                )}
                {result.strategy.personalityTraits?.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2">Merkpersoonlijkheid</p>
                    <div className="flex flex-wrap gap-1.5">
                      {result.strategy.personalityTraits.map((t) => (
                        <span
                          key={t}
                          className="text-[10px] px-2.5 py-1 rounded-full border border-neutral-700 text-neutral-400"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}

function CopyLinkButton({ guideId }: { guideId: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    const url = `${window.location.origin}/result/${guideId}`;
    await navigator.clipboard.writeText(url);
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
