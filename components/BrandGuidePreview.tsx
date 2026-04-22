"use client";
import { BrandGuideResult } from "@/types/brand";
import { useState, useEffect } from "react";

interface Props {
  result: BrandGuideResult;
  isPremium: boolean;
  guideId: string;
  /** True when the viewer has an active premium subscription (but this guide may still be free) */
  viewerIsPremium?: boolean;
}

/* ── Helpers ── */

/** Safely get colors array from either new nested or legacy flat structure */
function getColors(result: BrandGuideResult) {
  // New structure: result.colorPalette.colors[]
  // Legacy: result.colorPalette was ColorSwatch[] directly
  const cp = result.colorPalette as unknown;
  if (cp && typeof cp === "object" && "colors" in (cp as Record<string, unknown>)) {
    return (cp as { colors: Array<{ name: string; hex: string; rgb: string; cmyk?: string; pantone?: string; usage: string; category?: string }> }).colors;
  }
  // Legacy fallback: colorPalette was the array itself
  if (Array.isArray(cp)) return cp as Array<{ name: string; hex: string; rgb: string; cmyk?: string; pantone?: string; usage: string; category?: string }>;
  return [];
}

function getColorsByCategory(result: BrandGuideResult) {
  const colors = getColors(result);
  return {
    primary: colors.filter(c => c.category === "primary"),
    secondary: colors.filter(c => c.category === "secondary"),
    neutral: colors.filter(c => c.category === "neutral"),
    all: colors,
  };
}

function getAccessibility(result: BrandGuideResult) {
  const cp = result.colorPalette as unknown;
  if (cp && typeof cp === "object" && "accessibility" in (cp as Record<string, unknown>)) {
    return (cp as { accessibility?: Array<{ combination: string; foreground: string; background: string; contrastRatio: string; wcagAA: boolean; wcagAAA: boolean }> }).accessibility ?? [];
  }
  return [];
}

function getRatioGuideline(result: BrandGuideResult): string {
  const cp = result.colorPalette as unknown;
  if (cp && typeof cp === "object" && "ratioGuideline" in (cp as Record<string, unknown>)) {
    return (cp as { ratioGuideline?: string }).ratioGuideline ?? "";
  }
  return "";
}

/** Get display font name from new or old structure */
function getDisplayFont(result: BrandGuideResult): string {
  const t = result.typography as unknown;
  if (t && typeof t === "object" && "fonts" in (t as Record<string, unknown>)) {
    const fonts = (t as { fonts: Array<{ name: string; category: string }> }).fonts;
    return fonts.find(f => f.category === "display")?.name ?? fonts[0]?.name ?? "serif";
  }
  if (t && typeof t === "object" && "displayFont" in (t as Record<string, unknown>)) {
    return (t as { displayFont: string }).displayFont;
  }
  return "serif";
}

function getBodyFont(result: BrandGuideResult): string {
  const t = result.typography as unknown;
  if (t && typeof t === "object" && "fonts" in (t as Record<string, unknown>)) {
    const fonts = (t as { fonts: Array<{ name: string; category: string }> }).fonts;
    return fonts.find(f => f.category === "body")?.name ?? fonts[1]?.name ?? "sans-serif";
  }
  if (t && typeof t === "object" && "bodyFont" in (t as Record<string, unknown>)) {
    return (t as { bodyFont: string }).bodyFont;
  }
  return "sans-serif";
}

function getGoogleFontsUrl(result: BrandGuideResult): string {
  const t = result.typography as unknown;
  if (t && typeof t === "object" && "googleFontsUrl" in (t as Record<string, unknown>)) {
    return (t as { googleFontsUrl: string }).googleFontsUrl;
  }
  return "";
}

function getFonts(result: BrandGuideResult) {
  const t = result.typography as unknown;
  if (t && typeof t === "object" && "fonts" in (t as Record<string, unknown>)) {
    return (t as { fonts: Array<{ name: string; category: string; weights: number[]; source: string; fallback: string; usage: string }> }).fonts;
  }
  return [];
}

function getTypeScale(result: BrandGuideResult) {
  const t = result.typography as unknown;
  if (t && typeof t === "object" && "typeScale" in (t as Record<string, unknown>)) {
    return (t as { typeScale: Array<{ level: string; fontFamily: string; weight: number; sizePx: number; lineHeight: string; letterSpacing: string; usage: string }> }).typeScale;
  }
  return [];
}

function getPairingRationale(result: BrandGuideResult): string {
  const t = result.typography as unknown;
  if (t && typeof t === "object" && "pairingRationale" in (t as Record<string, unknown>)) {
    return (t as { pairingRationale: string }).pairingRationale;
  }
  return "";
}

function normalizeSvg(svg: string, fill = false): string {
  return svg.replace(/<svg([^>]*)>/, (_, attrs) => {
    const cleaned = attrs
      .replace(/\s+width="[^"]*"/g, "")
      .replace(/\s+height="[^"]*"/g, "")
      .replace(/\s+style="[^"]*"/g, "");
    const height = fill ? "100%" : "auto";
    return `<svg${cleaned} style="width:100%;height:${height};display:block;">`;
  });
}

function isDark(hex: string): boolean {
  const c = hex.replace("#", "");
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 < 128;
}

/* Logo on white rounded container */
function LogoMark({ result, size = "md" }: { result: BrandGuideResult; size?: "sm" | "md" | "lg" }) {
  const sizeMap = { sm: "w-10 h-10", md: "w-14 h-14", lg: "w-24 h-24" };
  const imgSize = { sm: "w-8 h-8", md: "w-11 h-11", lg: "w-20 h-20" };
  const colors = getColors(result);
  const primary = colors[0]?.hex ?? "#111";

  // Recraft V4 SVG logo (stored in logoVariants.fullColor)
  const recraftSvg = result.logoVariants?.fullColor;
  if (recraftSvg) {
    return (
      <div className={`${sizeMap[size]} bg-white rounded-xl shadow-sm border border-neutral-100 flex items-center justify-center flex-shrink-0 overflow-hidden`}>
        <div className={`${imgSize[size]} [&_svg]:w-full [&_svg]:h-full`}
          dangerouslySetInnerHTML={{ __html: recraftSvg }} />
      </div>
    );
  }
  if (result.iconSvg) {
    return (
      <div className={`${sizeMap[size]} bg-white rounded-xl shadow-sm border border-neutral-100 flex items-center justify-center flex-shrink-0 overflow-hidden`}>
        <div className={`${imgSize[size]} [&_svg]:w-full [&_svg]:h-full`} style={{ color: primary }}
          dangerouslySetInnerHTML={{ __html: result.iconSvg }} />
      </div>
    );
  }
  if (result.logoImageUrl) {
    return (
      <div className={`${sizeMap[size]} bg-white rounded-xl shadow-sm border border-neutral-100 flex items-center justify-center flex-shrink-0 overflow-hidden`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={result.logoImageUrl} alt={result.companyName} className={`${imgSize[size]} object-contain`} />
      </div>
    );
  }
  return (
    <div className={`${sizeMap[size]} flex-shrink-0 [&_svg]:w-full [&_svg]:h-full`}
      dangerouslySetInnerHTML={{ __html: normalizeSvg(result.logoIconSvg) }} />
  );
}

function SectionHeader({ num, title, subtitle }: { num: string; title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-1">
        <span className="text-xs font-mono text-neutral-300 tabular-nums">{num}</span>
        <div className="h-px flex-1 bg-neutral-100" />
      </div>
      <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">{title}</h2>
      {subtitle && <p className="text-sm text-neutral-400 mt-1">{subtitle}</p>}
    </div>
  );
}

function CopyBlock({ label, value, dark = false }: { label: string; value: string; dark?: boolean }) {
  return (
    <div className={`rounded-2xl p-5 ${dark ? "bg-neutral-950" : "bg-neutral-50 border border-neutral-100"}`}>
      <p className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${dark ? "text-neutral-500" : "text-neutral-400"}`}>{label}</p>
      <p className={`text-sm leading-relaxed ${dark ? "text-white" : "text-neutral-800"}`}>{value}</p>
    </div>
  );
}

/* ── Mockups ── */

function BusinessCardMockup({ result }: { result: BrandGuideResult }) {
  const colors = getColors(result);
  const primary = colors.find(c => c.category === "primary")?.hex ?? colors[0]?.hex ?? "#000";
  const bg = colors.find(c => c.category === "neutral")?.hex ?? colors[2]?.hex ?? "#f5f5f5";
  const textColor = colors.find(c => c.category === "neutral" && isDark(c.hex))?.hex ?? colors[3]?.hex ?? "#111";
  const accent = colors.find(c => c.category === "secondary")?.hex ?? colors[1]?.hex ?? "#888";
  const dark = isDark(bg);

  return (
    <div>
      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-3">Visitekaartje</p>
      <div className="grid grid-cols-2 gap-4">
        <div className="aspect-[1.8/1] rounded-xl shadow-lg flex flex-col justify-between p-5 relative overflow-hidden" style={{ backgroundColor: primary }}>
          {result.brandPatternSvg && (
            <div className="absolute inset-0 opacity-[0.07] [&_svg]:w-full [&_svg]:h-full"
              dangerouslySetInnerHTML={{ __html: normalizeSvg(result.brandPatternSvg, true) }} />
          )}
          <div className="relative flex items-center gap-2.5">
            <LogoMark result={result} size="sm" />
            <span className="text-white font-bold text-sm tracking-tight">{result.companyName}</span>
          </div>
          <p className="relative text-white/50 text-[10px]">{result.tagline}</p>
        </div>
        <div className="aspect-[1.8/1] rounded-xl shadow-lg flex flex-col justify-center p-5 relative overflow-hidden"
          style={{ backgroundColor: bg, border: `1px solid ${primary}15` }}>
          <p className="font-bold text-sm mb-0.5" style={{ color: dark ? "#fff" : textColor }}>Voornaam Achternaam</p>
          <p className="text-xs mb-3" style={{ color: accent }}>Functietitel</p>
          <div className="space-y-0.5">
            {["naam@bedrijf.nl", "+31 6 12 34 56 78", "bedrijf.nl"].map((line) => (
              <p key={line} className="text-[10px]" style={{ color: dark ? "rgba(255,255,255,0.5)" : `${textColor}80` }}>{line}</p>
            ))}
          </div>
          <div className="absolute left-0 top-0 bottom-0 w-0.5" style={{ backgroundColor: primary }} />
        </div>
      </div>
    </div>
  );
}

function SocialPostMockup({ result }: { result: BrandGuideResult }) {
  const colors = getColors(result);
  const primary = colors.find(c => c.category === "primary")?.hex ?? colors[0]?.hex ?? "#000";
  const accent = colors.find(c => c.category === "secondary")?.hex ?? colors[4]?.hex ?? colors[1]?.hex ?? "#888";

  return (
    <div>
      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-3">Instagram post</p>
      <div className="aspect-square rounded-xl shadow-lg flex flex-col justify-between p-5 relative overflow-hidden max-w-[280px]"
        style={{ backgroundColor: primary }}>
        {result.brandPatternSvg && (
          <div className="absolute inset-0 opacity-[0.07] [&_svg]:w-full [&_svg]:h-full"
            dangerouslySetInnerHTML={{ __html: normalizeSvg(result.brandPatternSvg, true) }} />
        )}
        <LogoMark result={result} size="sm" />
        <div className="relative space-y-3">
          <p className="text-white font-bold text-lg leading-tight">
            {result.brandVoiceExamples?.heroHeadline ?? result.tagline}
          </p>
          <span className="inline-block text-[10px] font-bold px-3 py-1.5 rounded-full"
            style={{ backgroundColor: accent, color: "#fff" }}>
            {result.brandVoiceExamples?.callToAction ?? "Meer info"}
          </span>
        </div>
      </div>
      {result.brandVoiceExamples?.instagramCaption && (
        <div className="mt-3 rounded-xl p-4 bg-neutral-50 border border-neutral-100 max-w-[280px]">
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">Caption</p>
          <p className="text-xs text-neutral-600 leading-relaxed">{result.brandVoiceExamples.instagramCaption}</p>
        </div>
      )}
    </div>
  );
}

function EmailSignatureMockup({ result }: { result: BrandGuideResult }) {
  const colors = getColors(result);
  const primary = colors.find(c => c.category === "primary")?.hex ?? colors[0]?.hex ?? "#000";
  const textColor = colors.find(c => c.category === "neutral" && isDark(c.hex))?.hex ?? colors[3]?.hex ?? "#111";
  const accent = colors.find(c => c.category === "secondary")?.hex ?? colors[1]?.hex ?? "#888";

  return (
    <div>
      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-3">E-mailhandtekening</p>
      <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm max-w-xs">
        <div className="flex gap-3 items-start">
          <LogoMark result={result} size="sm" />
          <div className="min-w-0">
            <p className="font-bold text-sm" style={{ color: textColor }}>Voornaam Achternaam</p>
            <p className="text-xs mt-0.5" style={{ color: accent }}>Functietitel · {result.companyName}</p>
            <div className="w-8 h-0.5 my-2 rounded-full" style={{ backgroundColor: primary }} />
            <div className="space-y-0.5">
              {["naam@bedrijf.nl", "+31 6 12 34 56 78", "bedrijf.nl"].map((line) => (
                <p key={line} className="text-[10px]" style={{ color: `${textColor}80` }}>{line}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Web Mockups (matching PDF mockups) ── */

function WebsiteMockupWeb({ result }: { result: BrandGuideResult }) {
  const colors = getColors(result);
  const primary = colors.find(c => c.category === "primary")?.hex ?? colors[0]?.hex ?? "#000";
  const darkNeutral = colors.find(c => c.category === "neutral" && isDark(c.hex))?.hex ?? "#1a1a1a";
  const tagline = result.toneOfVoice?.tagline ?? result.tagline ?? "";
  const slug = result.companyName.toLowerCase().replace(/\s+/g, "");

  return (
    <div>
      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-3">Website</p>
      <div className="rounded-xl overflow-hidden border border-neutral-200 shadow-sm">
        {/* Browser chrome */}
        <div className="bg-neutral-100 px-3 py-2 flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-300" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-300" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-300" />
          <span className="flex-1 bg-white rounded text-[9px] text-neutral-400 px-2 py-0.5 ml-2">{slug}.nl</span>
        </div>
        {/* Nav */}
        <div className="bg-white px-5 py-2.5 flex justify-between items-center border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <LogoMark result={result} size="sm" />
            <span className="font-bold text-sm" style={{ fontFamily: `"${getDisplayFont(result)}", serif` }}>{result.companyName}</span>
          </div>
          <div className="flex gap-4 text-[10px] text-neutral-500">
            <span>Over ons</span><span>Aanbod</span><span>Contact</span>
          </div>
        </div>
        {/* Hero */}
        <div className="px-8 py-10" style={{ backgroundColor: darkNeutral }}>
          <p className="text-white font-bold text-lg mb-2" style={{ fontFamily: `"${getDisplayFont(result)}", serif` }}>{tagline}</p>
          <p className="text-white/50 text-xs mb-4">Ontdek wat {result.companyName} voor jou kan betekenen.</p>
          <span className="inline-block text-xs font-bold px-4 py-1.5 rounded-md text-white" style={{ backgroundColor: primary, color: isDark(primary) ? "#fff" : "#0a0a0a" }}>Ontdek meer</span>
        </div>
      </div>
    </div>
  );
}

function PresentationMockupWeb({ result }: { result: BrandGuideResult }) {
  const colors = getColors(result);
  const primary = colors.find(c => c.category === "primary")?.hex ?? colors[0]?.hex ?? "#000";
  const darkNeutral = colors.find(c => c.category === "neutral" && isDark(c.hex))?.hex ?? "#1a1a1a";
  const tagline = result.toneOfVoice?.tagline ?? result.tagline ?? "";

  return (
    <div>
      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-3">Presentatie</p>
      <div className="aspect-video rounded-xl overflow-hidden shadow-sm flex flex-col justify-between p-6" style={{ backgroundColor: darkNeutral }}>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <LogoMark result={result} size="sm" />
            <span className="text-white font-bold text-xs" style={{ fontFamily: `"${getDisplayFont(result)}", serif` }}>{result.companyName}</span>
          </div>
          <div className="w-10 h-1 rounded-full" style={{ backgroundColor: primary }} />
        </div>
        <div>
          <p className="text-white font-bold text-xl leading-tight mb-3" style={{ fontFamily: `"${getDisplayFont(result)}", serif` }}>{tagline}</p>
          <div className="w-12 h-1 rounded-full" style={{ backgroundColor: primary }} />
        </div>
        <div className="flex justify-between items-end">
          <span className="text-white/30 text-[10px]">{result.companyName} · Presentatie 2026</span>
          <span className="text-white/30 text-[10px]">01</span>
        </div>
      </div>
    </div>
  );
}

function InvoiceMockupWeb({ result }: { result: BrandGuideResult }) {
  const colors = getColors(result);
  const primary = colors.find(c => c.category === "primary")?.hex ?? colors[0]?.hex ?? "#000";

  return (
    <div>
      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-3">Factuur</p>
      <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
        <div className="flex justify-between items-start mb-5">
          <div className="flex items-center gap-2">
            <LogoMark result={result} size="sm" />
            <span className="font-bold text-sm" style={{ fontFamily: `"${getDisplayFont(result)}", serif` }}>{result.companyName}</span>
          </div>
          <div className="text-right">
            <span className="font-bold text-sm" style={{ color: primary, fontFamily: `"${getDisplayFont(result)}", serif` }}>FACTUUR</span>
            <p className="text-[10px] text-neutral-400">#2026-001</p>
          </div>
        </div>
        {/* Table */}
        <div className="rounded-md overflow-hidden text-[10px]">
          <div className="flex px-3 py-1.5 font-bold" style={{ backgroundColor: primary, color: isDark(primary) ? "#fff" : "#0a0a0a" }}>
            <span className="flex-[3]">Omschrijving</span>
            <span className="flex-1 text-right">Bedrag</span>
          </div>
          {[["Dienstverlening pakket A", "€ 1.250,00"], ["Aanvullende werkzaamheden", "€ 375,00"]].map(([desc, amount], i) => (
            <div key={i} className="flex px-3 py-1.5 border-b border-neutral-100 text-neutral-600">
              <span className="flex-[3]">{desc}</span>
              <span className="flex-1 text-right">{amount}</span>
            </div>
          ))}
          <div className="flex px-3 py-2 font-bold text-xs">
            <span className="flex-[3]">Totaal</span>
            <span className="flex-1 text-right" style={{ color: primary }}>€ 1.625,00</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function LetterheadMockupWeb({ result }: { result: BrandGuideResult }) {
  const colors = getColors(result);
  const primary = colors.find(c => c.category === "primary")?.hex ?? colors[0]?.hex ?? "#000";
  const slug = result.companyName.toLowerCase().replace(/\s+/g, "");
  const tagline = result.toneOfVoice?.tagline ?? result.tagline ?? "";

  return (
    <div>
      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-3">Briefpapier</p>
      <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm min-h-[200px] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start pb-3 mb-5" style={{ borderBottom: `2px solid ${primary}` }}>
          <div className="flex items-center gap-2">
            <LogoMark result={result} size="sm" />
            <div>
              <p className="font-bold text-sm" style={{ fontFamily: `"${getDisplayFont(result)}", serif` }}>{result.companyName}</p>
              <p className="text-[9px] text-neutral-400">{tagline}</p>
            </div>
          </div>
          <div className="text-right text-[9px] text-neutral-400">
            <p>Straatnaam 1</p>
            <p>1234 AB Amsterdam</p>
            <p style={{ color: primary }}>info@{slug}.nl</p>
          </div>
        </div>
        {/* Body lines */}
        <p className="text-xs text-neutral-600 mb-3">Geachte heer/mevrouw,</p>
        <div className="space-y-2 flex-1">
          {[200, 230, 210, 150].map((w, i) => (
            <div key={i} className="h-1 bg-neutral-100 rounded" style={{ width: w }} />
          ))}
        </div>
        {/* Footer */}
        <div className="flex justify-between text-[8px] text-neutral-300 pt-3 border-t border-neutral-100 mt-4">
          <span>KVK 12345678 · BTW NL001234567B01</span>
          <span>IBAN NL00 BANK 0123 4567 89</span>
        </div>
      </div>
    </div>
  );
}

/* ── Premium Gate — blur overlay for locked sections ── */

function PremiumTeaser({ guideId, primary, label }: { guideId: string; primary: string; label: string }) {
  return (
    <div className="relative rounded-2xl overflow-hidden">
      {/* Blurred placeholder content */}
      <div className="blur-sm opacity-40 pointer-events-none select-none p-8 space-y-4 bg-neutral-50 rounded-2xl border border-neutral-100">
        <div className="h-4 w-48 bg-neutral-200 rounded" />
        <div className="h-3 w-64 bg-neutral-200 rounded" />
        <div className="h-3 w-56 bg-neutral-200 rounded" />
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="h-20 bg-neutral-200 rounded-lg" />
          <div className="h-20 bg-neutral-200 rounded-lg" />
        </div>
        <div className="h-3 w-40 bg-neutral-200 rounded" />
        <div className="h-3 w-52 bg-neutral-200 rounded" />
      </div>
      {/* Overlay CTA */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-[2px]">
        <div className="text-center space-y-3 max-w-xs">
          <div className="w-10 h-10 rounded-full mx-auto flex items-center justify-center" style={{ backgroundColor: primary + "15" }}>
            <svg className="w-5 h-5" style={{ color: primary }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <p className="font-bold text-neutral-900 text-sm">{label}</p>
          <p className="text-xs text-neutral-500">Beschikbaar in de premium versie</p>
          <a
            href={`/upgrade?guideId=${guideId}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-5 py-2 rounded-lg text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: primary }}>
            Ontgrendel &rarr;
          </a>
        </div>
      </div>
    </div>
  );
}

/* ── Main Component ── */

export default function BrandGuidePreview({ result, isPremium, guideId, viewerIsPremium }: Props) {
  const [downloading, setDownloading] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [makingPremium, setMakingPremium] = useState(false);
  const colors = getColors(result);
  const { primary: primaryColors, secondary: secondaryColors, neutral: neutralColors } = getColorsByCategory(result);
  const primary = primaryColors[0]?.hex ?? colors[0]?.hex ?? "#000";
  const accent = secondaryColors[0]?.hex ?? colors[4]?.hex ?? colors[1]?.hex ?? "#888";
  const displayFont = getDisplayFont(result);
  const bodyFont = getBodyFont(result);
  const fontsUrl = getGoogleFontsUrl(result);

  // Load Google Fonts via <link> injection so specimens render correctly
  useEffect(() => {
    if (!fontsUrl) return;
    const id = "brand-guide-fonts";
    if (document.getElementById(id)) { setFontsLoaded(true); return; }
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = fontsUrl;
    link.onload = () => setFontsLoaded(true);
    document.head.appendChild(link);
    return () => {
      const el = document.getElementById(id);
      if (el) el.remove();
    };
  }, [fontsUrl]);

  async function handleDownloadPDF() {
    if (!isPremium) { window.location.href = `/upgrade?guideId=${guideId}`; return; }
    setDownloading(true);
    try {
      const res = await fetch("/api/export-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guideId }),
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${result.companyName}-huisstijl.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally { setDownloading(false); }
  }

  async function handleMakePremium() {
    setMakingPremium(true);
    try {
      const res = await fetch(`/api/guides/${guideId}/make-premium`, { method: "POST" });
      if (!res.ok) throw new Error();
      window.location.reload();
    } catch {
      alert("Er ging iets mis. Probeer het opnieuw.");
      setMakingPremium(false);
    }
  }

  return (
    <div className={`space-y-16 ${fontsLoaded ? "fonts-loaded" : ""}`}>

      {/* ── MAAK PREMIUM BANNER (premium abonnee, gratis stijl) ── */}
      {viewerIsPremium && !isPremium && (
        <div className="rounded-2xl border border-violet-200 bg-violet-50 p-5 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center bg-violet-100 shrink-0">
              <svg className="w-4 h-4 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 3l14 9-14 9V3z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-violet-900">Je hebt premium</p>
              <p className="text-xs text-violet-600">Genereer de premium versie van deze stijl om alle secties te bekijken en te downloaden.</p>
            </div>
          </div>
          <button
            onClick={handleMakePremium}
            disabled={makingPremium}
            className="shrink-0 text-sm font-semibold bg-violet-600 text-white hover:bg-violet-500 px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            {makingPremium ? "Bezig..." : "Maak Premium ✦"}
          </button>
        </div>
      )}

      {/* ── HERO BANNER ── */}
      <div className="relative rounded-2xl overflow-hidden" style={{ backgroundColor: primary }}>
        {result.brandPatternSvg && (
          <div className="absolute inset-0 opacity-[0.06] [&_svg]:w-full [&_svg]:h-full"
            dangerouslySetInnerHTML={{ __html: normalizeSvg(result.brandPatternSvg, true) }} />
        )}
        <div className="relative px-8 py-10 md:px-12 md:py-14">
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-3">
              <LogoMark result={result} size="md" />
              <div>
                <p className="text-white font-bold text-xl tracking-tight">{result.companyName}</p>
                <p className="text-white/50 text-xs">{result.tagline}</p>
              </div>
            </div>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white leading-[1.1] max-w-lg mb-4"
            style={{ fontFamily: `'${displayFont}', serif` }}>
            {result.brandVoiceExamples?.heroHeadline ?? result.tagline}
          </h1>
          <p className="text-white/60 text-base max-w-md leading-relaxed mb-6">
            {result.brandVoiceExamples?.subHeadline ?? ""}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {(result.brandPersonality ?? result.strategy?.personalityTraits ?? []).map((word) => (
              <span key={word} className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/10 text-white/80 border border-white/10">
                {word}
              </span>
            ))}
          </div>
          <div className="flex mt-8 rounded-lg overflow-hidden h-2">
            {colors.map((c) => (
              <div key={c.hex} className="flex-1" style={{ backgroundColor: c.hex }} />
            ))}
          </div>
        </div>
      </div>

      {/* ── 01 MERKSTRATEGIE ── */}
      {result.strategy && (
        <section>
          <SectionHeader num="01" title="Merkstrategie" subtitle="De strategische basis van jouw merk" />
          <div className="space-y-6">
            {/* Missie & Visie */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl p-6 border border-neutral-100 bg-neutral-50">
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">Missie</p>
                <p className="text-base font-semibold text-neutral-900" style={{ fontFamily: `'${displayFont}', serif` }}>
                  {result.strategy.mission}
                </p>
              </div>
              <div className="rounded-2xl p-6 border border-neutral-100 bg-neutral-50">
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">Visie</p>
                <p className="text-base font-semibold text-neutral-900" style={{ fontFamily: `'${displayFont}', serif` }}>
                  {result.strategy.vision}
                </p>
              </div>
            </div>

            {/* Kernwaarden */}
            {result.strategy.coreValues?.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-3">Kernwaarden</p>
                <div className="grid grid-cols-3 gap-3">
                  {result.strategy.coreValues.map((v) => (
                    <div key={v.value} className="rounded-xl p-4 border border-neutral-100">
                      <p className="font-bold text-sm text-neutral-900 mb-1" style={{ color: primary }}>{v.value}</p>
                      <p className="text-xs text-neutral-500 leading-relaxed">{v.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Merkverhaal */}
            <div className="rounded-2xl p-6 border-l-4 bg-neutral-50" style={{ borderColor: primary }}>
              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">Merkverhaal</p>
              <p className="text-base text-neutral-700 leading-relaxed" style={{ fontFamily: `'${bodyFont}', sans-serif` }}>
                {result.strategy.brandStory}
              </p>
            </div>

            {/* Merkpersoonlijkheid */}
            {result.strategy.personalityTraits?.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-3">Merkpersoonlijkheid</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {result.strategy.personalityTraits.map((trait) => (
                    <span key={trait} className="px-3 py-1.5 rounded-full text-sm font-semibold text-white" style={{ backgroundColor: primary }}>
                      {trait}
                    </span>
                  ))}
                </div>
                {result.strategy.personalityDescription && (
                  <p className="text-sm text-neutral-500 leading-relaxed">{result.strategy.personalityDescription}</p>
                )}
              </div>
            )}

            {/* Persona's — premium only */}
            {!isPremium && (!result.strategy.personas || result.strategy.personas.length === 0) && (
              <PremiumTeaser guideId={guideId} primary={primary} label="Doelgroep persona's" />
            )}
            {result.strategy.personas?.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-3">Doelgroep persona&apos;s</p>
                <div className="grid grid-cols-2 gap-4">
                  {result.strategy.personas.map((p) => (
                    <div key={p.name} className="rounded-xl p-5 border border-neutral-200 bg-white">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: accent }}>
                          {p.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-neutral-900">{p.name}</p>
                          <p className="text-xs text-neutral-400">{p.age} · {(p.occupation ?? (p as unknown as Record<string,string>).role ?? "")}</p>
                        </div>
                      </div>
                      <p className="text-xs text-neutral-600 mb-3">{p.description ?? (p as unknown as Record<string,string>).goals ?? ""}</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-[10px] font-bold text-green-600 uppercase mb-1">Behoeften</p>
                          {(p.needs ?? []).map((n) => (
                            <p key={n} className="text-[10px] text-neutral-500 flex gap-1"><span className="text-green-400">+</span>{n}</p>
                          ))}
                          {!p.needs && (p as unknown as Record<string,string>).goals && (
                            <p className="text-[10px] text-neutral-500">{(p as unknown as Record<string,string>).goals}</p>
                          )}
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-red-500 uppercase mb-1">Frustraties</p>
                          {(p.frustrations ?? []).map((f) => (
                            <p key={f} className="text-[10px] text-neutral-500 flex gap-1"><span className="text-red-300">-</span>{f}</p>
                          ))}
                          {!p.frustrations && (p as unknown as Record<string,string>).painPoints && (
                            <p className="text-[10px] text-neutral-500">{(p as unknown as Record<string,string>).painPoints}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── 02 LOGO ── */}
      <section>
        <SectionHeader num="02" title="Logo" subtitle="Jouw merklogo in verschillende toepassingen" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="col-span-2 bg-white border border-neutral-200 rounded-xl p-8 flex items-center justify-center min-h-[200px]">
            <div className="flex items-center gap-4">
              <LogoMark result={result} size="lg" />
              <div>
                <p className="text-2xl font-bold" style={{ color: primary }}>{result.companyName}</p>
                <p className="text-sm text-neutral-400">{result.tagline}</p>
              </div>
            </div>
          </div>
          <div className="bg-neutral-900 rounded-xl p-6 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-center">
              <LogoMark result={result} size="md" />
              <span className="text-white font-bold text-sm">{result.companyName}</span>
            </div>
          </div>
          <div className="rounded-xl p-6 flex items-center justify-center" style={{ backgroundColor: primary }}>
            <div className="flex flex-col items-center gap-3 text-center">
              <LogoMark result={result} size="md" />
              <span className="text-white font-bold text-sm">{result.companyName}</span>
            </div>
          </div>
        </div>
        {/* Premium download callout */}
        <div className="mt-4 rounded-xl p-4 border border-neutral-200 bg-neutral-50 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: primary + "15" }}>
              <svg className="w-4 h-4" style={{ color: primary }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold text-neutral-800">Premium: alle logo-varianten downloaden</p>
              <p className="text-[10px] text-neutral-400">Full color, zwart, wit, merkkleur: als SVG en PNG (512, 1024, 2048px)</p>
            </div>
          </div>
          {!isPremium && (
            <a href={`/upgrade?guideId=${guideId}`}
              className="shrink-0 text-[10px] font-semibold px-3 py-1.5 rounded-lg text-white whitespace-nowrap"
              style={{ backgroundColor: primary }}>
              Ontgrendel →
            </a>
          )}
        </div>

        {/* Logo color variants (from Recraft V4 SVG processing) */}
        {result.logoVariants && (
          <div className="mt-4">
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-3">Kleurvarianten</p>
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-white border border-neutral-200 rounded-xl p-4 flex items-center justify-center min-h-[100px]">
                <div className="w-16 h-16 [&_svg]:w-full [&_svg]:h-full"
                  dangerouslySetInnerHTML={{ __html: result.logoVariants.fullColor }} />
              </div>
              <div className="bg-white border border-neutral-200 rounded-xl p-4 flex items-center justify-center min-h-[100px]">
                <div className="w-16 h-16 [&_svg]:w-full [&_svg]:h-full"
                  dangerouslySetInnerHTML={{ __html: result.logoVariants.monoBlack }} />
              </div>
              {/* Wit op zwart: brightness(0)+invert(1) maakt alle fills wit zonder transparante gaten */}
              <div className="bg-neutral-900 rounded-xl p-4 flex items-center justify-center min-h-[100px]">
                <div className="w-16 h-16 [&_svg]:w-full [&_svg]:h-full" style={{ filter: "brightness(0) invert(1)" }}
                  dangerouslySetInnerHTML={{ __html: result.logoVariants.fullColor }} />
              </div>
              {/* Wit op merkkleur: zelfde aanpak, achtergrond is de primaire merkkleur */}
              <div className="rounded-xl p-4 flex items-center justify-center min-h-[100px]" style={{ backgroundColor: primary }}>
                <div className="w-16 h-16 [&_svg]:w-full [&_svg]:h-full" style={{ filter: "brightness(0) invert(1)" }}
                  dangerouslySetInnerHTML={{ __html: result.logoVariants.fullColor }} />
              </div>
            </div>
            <div className="flex gap-4 mt-2">
              <p className="text-[10px] text-neutral-400 flex-1 text-center">Full color</p>
              <p className="text-[10px] text-neutral-400 flex-1 text-center">Zwart</p>
              <p className="text-[10px] text-neutral-400 flex-1 text-center">Wit</p>
              <p className="text-[10px] text-neutral-400 flex-1 text-center">Op merkkleur</p>
            </div>
          </div>
        )}

        {/* Logo guidelines preview */}
        {result.logoGuidelines && (
          <div className="mt-4 grid grid-cols-3 gap-3">
            {result.logoGuidelines.clearSpaceRule && (
              <div className="rounded-xl p-4 bg-blue-50/50 border border-blue-100">
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">Vrije ruimte</p>
                <p className="text-xs text-neutral-600">{result.logoGuidelines.clearSpaceRule}</p>
              </div>
            )}
            {result.logoGuidelines.minimumSizes && (
              <div className="rounded-xl p-4 bg-blue-50/50 border border-blue-100">
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">Minimum formaat</p>
                <p className="text-xs text-neutral-600">
                  Digitaal: {result.logoGuidelines.minimumSizes.digitalPx}px · Print: {result.logoGuidelines.minimumSizes.printMm}mm
                </p>
              </div>
            )}
            <div className="rounded-xl p-4 bg-neutral-50 border border-neutral-100">
              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Formaten</p>
              <p className="text-xs text-neutral-600">SVG, PNG (512, 1024, 2048), PDF</p>
            </div>
          </div>
        )}
        <div className="flex gap-2 mt-3">
          {result.logoSvg && (
            <a href={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(result.logoSvg)}`}
              download={`${result.companyName}-woordmerk.svg`}
              className="text-[10px] px-2.5 py-1 border border-neutral-200 rounded-md hover:bg-neutral-50 transition-colors font-medium text-neutral-500">
              Woordmerk SVG
            </a>
          )}
          {result.logoIconSvg && (
            <a href={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(result.logoIconSvg)}`}
              download={`${result.companyName}-icoon.svg`}
              className="text-[10px] px-2.5 py-1 border border-neutral-200 rounded-md hover:bg-neutral-50 transition-colors font-medium text-neutral-500">
              Icoon SVG
            </a>
          )}
        </div>
      </section>

      {/* ── 03 KLEURENPALET ── */}
      <section>
        <SectionHeader num="03" title="Kleurenpalet" subtitle="Kleuren die jouw merkidentiteit vormen" />

        {/* Grouped by category */}
        {primaryColors.length > 0 && (
          <div className="mb-6">
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-3">Primaire kleuren</p>
            <div className="grid grid-cols-2 gap-3">
              {primaryColors.map((color, i) => (
                <div key={color.hex} className="group">
                  <div className={`h-28 rounded-xl shadow-sm border border-black/5 ${i === 0 ? "ring-2 ring-offset-2 ring-neutral-300" : ""}`}
                    style={{ backgroundColor: color.hex }} />
                  <div className="mt-2 space-y-0.5">
                    <p className="text-xs font-semibold text-neutral-900">{color.name}</p>
                    <p className="text-[10px] font-mono font-bold text-neutral-700">{color.hex.toUpperCase()}</p>
                    <p className="text-[10px] text-neutral-400">{color.rgb}</p>
                    {color.cmyk && <p className="text-[10px] text-neutral-400">{color.cmyk}</p>}
                    {color.pantone && <p className="text-[10px] text-neutral-400">{color.pantone}</p>}
                    <p className="text-[10px] text-neutral-400 leading-snug">{color.usage}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {secondaryColors.length > 0 && (
          <div className="mb-6">
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-3">Secundaire kleuren</p>
            <div className="grid grid-cols-2 gap-3">
              {secondaryColors.map((color) => (
                <div key={color.hex} className="group">
                  <div className="h-24 rounded-xl shadow-sm border border-black/5" style={{ backgroundColor: color.hex }} />
                  <div className="mt-2 space-y-0.5">
                    <p className="text-xs font-semibold text-neutral-900">{color.name}</p>
                    <p className="text-[10px] font-mono font-bold text-neutral-700">{color.hex.toUpperCase()}</p>
                    <p className="text-[10px] text-neutral-400">{color.rgb}</p>
                    {color.cmyk && <p className="text-[10px] text-neutral-400">{color.cmyk}</p>}
                    {color.pantone && <p className="text-[10px] text-neutral-400">{color.pantone}</p>}
                    <p className="text-[10px] text-neutral-400 leading-snug">{color.usage}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {neutralColors.length > 0 && (
          <div className="mb-6">
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-3">Neutrale kleuren</p>
            <div className="grid grid-cols-3 gap-3">
              {neutralColors.map((color) => (
                <div key={color.hex} className="group">
                  <div className="h-20 rounded-xl shadow-sm border border-black/5" style={{ backgroundColor: color.hex }} />
                  <div className="mt-2 space-y-0.5">
                    <p className="text-xs font-semibold text-neutral-900">{color.name}</p>
                    <p className="text-[10px] font-mono font-bold text-neutral-700">{color.hex.toUpperCase()}</p>
                    <p className="text-[10px] text-neutral-400 leading-snug">{color.usage}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fallback: if no categories, show flat */}
        {primaryColors.length === 0 && secondaryColors.length === 0 && neutralColors.length === 0 && colors.length > 0 && (
          <div className="grid grid-cols-5 gap-3 mb-6">
            {colors.map((color, i) => (
              <div key={color.hex} className="group">
                <div className={`h-24 md:h-32 rounded-xl shadow-sm border border-black/5 ${i === 0 ? "ring-2 ring-offset-2 ring-neutral-300" : ""}`}
                  style={{ backgroundColor: color.hex }} />
                <div className="mt-2 space-y-0.5">
                  <p className="text-[10px] font-mono font-bold text-neutral-700">{color.hex.toUpperCase()}</p>
                  <p className="text-xs font-semibold text-neutral-900">{color.name}</p>
                  <p className="text-[10px] text-neutral-400 leading-snug">{color.usage}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Ratio guideline */}
        {getRatioGuideline(result) && (
          <div className="rounded-xl p-4 bg-neutral-50 border border-neutral-100 mb-4">
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Kleurverhouding</p>
            <p className="text-xs text-neutral-600">{getRatioGuideline(result)}</p>
          </div>
        )}

        {/* Accessibility */}
        {getAccessibility(result).length > 0 && (
          <div>
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-3">Toegankelijkheid (WCAG)</p>
            <div className="grid grid-cols-2 gap-2">
              {getAccessibility(result).map((a) => (
                <div key={a.combination} className="flex items-center gap-3 rounded-lg p-3 border border-neutral-100">
                  <div className="w-8 h-8 rounded-md flex items-center justify-center text-[10px] font-bold"
                    style={{ backgroundColor: a.background, color: a.foreground, border: "1px solid #e5e5e5" }}>
                    Aa
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-neutral-800">{a.combination}</p>
                    <p className="text-[10px] text-neutral-400">
                      {a.contrastRatio} · AA {a.wcagAA ? "Pass" : "Fail"} · AAA {a.wcagAAA ? "Pass" : "Fail"}
                    </p>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${a.wcagAA ? "bg-green-400" : "bg-red-400"}`} />
                </div>
              ))}
            </div>
          </div>
        )}

        {result.brandPatternSvg && (
          <div className="mt-6">
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">Merkpatroon</p>
            <div className="h-24 rounded-xl overflow-hidden border border-neutral-100 [&_svg]:w-full [&_svg]:h-full"
              dangerouslySetInnerHTML={{ __html: normalizeSvg(result.brandPatternSvg, true) }} />
          </div>
        )}
      </section>

      {/* ── 04 TYPOGRAFIE ── */}
      <section>
        <SectionHeader num="04" title="Typografie" subtitle="Lettertype-combinatie voor een consistente uitstraling" />

        {/* Font specimens */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Display font */}
          <div className="bg-white border border-neutral-200 rounded-xl p-6 space-y-4">
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Display: {displayFont}</p>
            <div style={{ fontFamily: `'${displayFont}', serif` }}>
              <p className="text-5xl font-bold text-neutral-900 leading-none">Aa</p>
              <p className="text-xl font-bold text-neutral-800 mt-3">{result.companyName}</p>
              <p className="text-sm text-neutral-400 mt-1">{result.tagline}</p>
              <p className="text-[11px] text-neutral-500 mt-3 pt-3 border-t border-neutral-100 leading-relaxed" style={{ fontFamily: `'${displayFont}', serif` }}>
                ABCDEFGHIJKLMNOPQRSTUVWXYZ<br />
                abcdefghijklmnopqrstuvwxyz<br />
                0123456789 !@#&
              </p>
            </div>
            {getFonts(result).find(f => f.category === "display") && (
              <div className="text-[10px] text-neutral-400 border-t border-neutral-100 pt-3 space-y-0.5">
                <p>Gewichten: {getFonts(result).find(f => f.category === "display")?.weights.join(", ")}</p>
                <p>Fallback: {getFonts(result).find(f => f.category === "display")?.fallback}</p>
                <p>{getFonts(result).find(f => f.category === "display")?.usage}</p>
              </div>
            )}
          </div>
          {/* Body font */}
          <div className="bg-white border border-neutral-200 rounded-xl p-6 space-y-4">
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Body: {bodyFont}</p>
            <div style={{ fontFamily: `'${bodyFont}', sans-serif` }}>
              <p className="text-2xl font-bold text-neutral-900 leading-none">Aa</p>
              <p className="text-sm leading-relaxed text-neutral-700 mt-3 line-clamp-3">{result.brandStory ?? result.strategy?.brandStory}</p>
              <p className="text-[11px] text-neutral-500 mt-3 pt-3 border-t border-neutral-100 leading-relaxed" style={{ fontFamily: `'${bodyFont}', sans-serif` }}>
                ABCDEFGHIJKLMNOPQRSTUVWXYZ<br />
                abcdefghijklmnopqrstuvwxyz<br />
                0123456789 !@#&
              </p>
            </div>
            {getFonts(result).find(f => f.category === "body") && (
              <div className="text-[10px] text-neutral-400 border-t border-neutral-100 pt-3 space-y-0.5">
                <p>Gewichten: {getFonts(result).find(f => f.category === "body")?.weights.join(", ")}</p>
                <p>Fallback: {getFonts(result).find(f => f.category === "body")?.fallback}</p>
                <p>{getFonts(result).find(f => f.category === "body")?.usage}</p>
              </div>
            )}
          </div>
        </div>

        {/* Pairing rationale */}
        {getPairingRationale(result) && (
          <div className="rounded-xl p-4 bg-neutral-50 border border-neutral-100 mb-6">
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Waarom deze combinatie</p>
            <p className="text-xs text-neutral-600">{getPairingRationale(result)}</p>
          </div>
        )}

        {/* Type scale */}
        {getTypeScale(result).length > 0 && (
          <div>
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-3">Type scale</p>
            <div className="rounded-xl border border-neutral-200 overflow-hidden">
              {getTypeScale(result).map((entry) => (
                <div key={entry.level} className="flex items-baseline gap-4 px-5 py-3 border-b border-neutral-100 last:border-b-0">
                  <span className="text-[10px] font-mono font-bold text-neutral-400 w-10 shrink-0">{entry.level}</span>
                  <span className="flex-1 truncate" style={{
                    fontFamily: `'${entry.fontFamily}', sans-serif`,
                    fontSize: `${Math.min(entry.sizePx, 36)}px`,
                    fontWeight: entry.weight,
                    lineHeight: entry.lineHeight,
                  }}>
                    {result.companyName}
                  </span>
                  <span className="text-[10px] font-mono text-neutral-300 shrink-0">
                    {entry.sizePx}px / {entry.weight}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ── 05 TONE OF VOICE ── */}
      {result.toneOfVoice && typeof result.toneOfVoice === "object" && "voiceAttributes" in result.toneOfVoice && (
        <section>
          <SectionHeader num="05" title="Tone of voice" subtitle="Hoe jouw merk klinkt in tekst" />
          <div className="space-y-4">
            {/* Voice attributes */}
            {result.toneOfVoice.voiceAttributes?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {result.toneOfVoice.voiceAttributes.map((attr) => (
                  <span key={attr} className="px-3 py-1.5 rounded-full text-sm font-medium border border-neutral-200 text-neutral-700">
                    {attr}
                  </span>
                ))}
              </div>
            )}

            {/* Do's & Don'ts */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50/50 border border-green-100 rounded-xl p-5">
                <p className="text-xs font-bold text-green-700 mb-3">Wel doen</p>
                <ul className="space-y-2">
                  {result.toneOfVoice.doList?.map((item, i) => (
                    <li key={i} className="text-xs text-neutral-600 flex gap-2">
                      <span className="text-green-400 shrink-0">+</span>{item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-red-50/50 border border-red-100 rounded-xl p-5">
                <p className="text-xs font-bold text-red-700 mb-3">Niet doen</p>
                <ul className="space-y-2">
                  {result.toneOfVoice.dontList?.map((item, i) => (
                    <li key={i} className="text-xs text-neutral-600 flex gap-2">
                      <span className="text-red-300 shrink-0">-</span>{item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Boilerplate */}
            {result.toneOfVoice.boilerplate && (
              <CopyBlock label="Standaard bedrijfsbeschrijving" value={result.toneOfVoice.boilerplate} />
            )}

            {/* Voice examples per context */}
            {result.toneOfVoice.examples?.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-3">Voorbeelden per context</p>
                <div className="grid grid-cols-2 gap-3">
                  {result.toneOfVoice.examples.map((ex) => (
                    <CopyBlock key={ex.context} label={ex.context} value={ex.example} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── 06 BRAND VOICE & COPY ── */}
      {result.brandVoiceExamples && (
        <section>
          <SectionHeader num="06" title="Brand voice & copy" subtitle="Kant-en-klare teksten in jouw merkstijl" />
          <div className="space-y-3">
            <div className="bg-neutral-950 rounded-xl p-6">
              <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2">Website headline</p>
              <p className="text-2xl font-bold text-white" style={{ fontFamily: `'${displayFont}', serif` }}>
                {result.brandVoiceExamples.heroHeadline}
              </p>
              <p className="text-sm text-neutral-400 mt-2">{result.brandVoiceExamples.subHeadline}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <CopyBlock label="Advertentietekst" value={result.brandVoiceExamples.adCopy} />
              <CopyBlock label="E-mail onderwerpregel" value={result.brandVoiceExamples.emailSubjectLine} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <CopyBlock label="Over ons" value={result.brandVoiceExamples.aboutUs} />
              </div>
              <div className="flex flex-col gap-3">
                <div className="rounded-xl p-5 flex items-center justify-center flex-1" style={{ backgroundColor: primary }}>
                  <p className="font-bold text-base text-center" style={{ color: isDark(primary) ? "#fff" : "#0a0a0a" }}>{result.brandVoiceExamples.callToAction}</p>
                </div>
              </div>
            </div>
            <CopyBlock label="Instagram caption" value={result.brandVoiceExamples.instagramCaption} />
          </div>
        </section>
      )}

      {/* ── 07 BEELDTAAL & ICONOGRAFIE ── */}
      {(result.imageryGuidelines || result.iconographyGuidelines) ? (
        <section>
          <SectionHeader num="07" title="Beeldtaal & iconografie" subtitle="Richtlijnen voor fotografie en iconen" />
          <div className="grid grid-cols-2 gap-4">
            {result.imageryGuidelines && (
              <div className="rounded-xl p-5 border border-neutral-200 bg-white space-y-3">
                <p className="text-xs font-bold text-neutral-800">Fotografie</p>
                <div className="space-y-2 text-xs text-neutral-600">
                  <p><span className="font-medium text-neutral-800">Stijl:</span> {result.imageryGuidelines.photoStyle}</p>
                  <p><span className="font-medium text-neutral-800">Kleur:</span> {result.imageryGuidelines.colorTreatment}</p>
                  <p><span className="font-medium text-neutral-800">Onderwerpen:</span> {result.imageryGuidelines.subjects}</p>
                  <p><span className="font-medium text-neutral-800">Compositie:</span> {result.imageryGuidelines.composition}</p>
                </div>
              </div>
            )}
            {result.iconographyGuidelines && (
              <div className="rounded-xl p-5 border border-neutral-200 bg-white space-y-3">
                <p className="text-xs font-bold text-neutral-800">Iconografie</p>
                <div className="space-y-2 text-xs text-neutral-600">
                  <p><span className="font-medium text-neutral-800">Stijl:</span> {result.iconographyGuidelines.style}</p>
                  <p><span className="font-medium text-neutral-800">Lijndikte:</span> {result.iconographyGuidelines.strokeWidth}</p>
                  <p><span className="font-medium text-neutral-800">Hoeken:</span> {result.iconographyGuidelines.cornerStyle}</p>
                  <p><span className="font-medium text-neutral-800">Kleuren:</span> {result.iconographyGuidelines.colorUsage}</p>
                </div>
              </div>
            )}
          </div>
        </section>
      ) : !isPremium && (
        <section>
          <SectionHeader num="07" title="Beeldtaal & iconografie" subtitle="Richtlijnen voor fotografie en iconen" />
          <PremiumTeaser guideId={guideId} primary={primary} label="Beeldtaal & iconografie richtlijnen" />
        </section>
      )}

      {/* ── 08 GRAFISCHE ELEMENTEN ── */}
      {result.graphicElements ? (
        <section>
          <SectionHeader num="08" title="Grafische elementen" subtitle="Ondersteunende visuele elementen" />
          <div className="rounded-xl p-5 border border-neutral-200 bg-white space-y-2 text-sm text-neutral-600">
            <p>{result.graphicElements.description}</p>
            <div className="grid grid-cols-3 gap-3 mt-3">
              <div className="rounded-lg p-3 bg-neutral-50">
                <p className="text-[10px] font-bold text-neutral-400 uppercase mb-1">Vormen</p>
                <p className="text-xs">{result.graphicElements.shapes}</p>
              </div>
              <div className="rounded-lg p-3 bg-neutral-50">
                <p className="text-[10px] font-bold text-neutral-400 uppercase mb-1">Patronen</p>
                <p className="text-xs">{result.graphicElements.patterns}</p>
              </div>
              <div className="rounded-lg p-3 bg-neutral-50">
                <p className="text-[10px] font-bold text-neutral-400 uppercase mb-1">Toepassing</p>
                <p className="text-xs">{result.graphicElements.usage}</p>
              </div>
            </div>
          </div>
        </section>
      ) : !isPremium && (
        <section>
          <SectionHeader num="08" title="Grafische elementen" subtitle="Ondersteunende visuele elementen" />
          <PremiumTeaser guideId={guideId} primary={primary} label="Grafische elementen & patronen" />
        </section>
      )}

      {/* ── 09 LOGO RICHTLIJNEN ── */}
      {result.logoGuidelines?.doList?.length > 0 ? (
        <section>
          <SectionHeader num="09" title="Logo-richtlijnen" subtitle="Regels voor consistent logogebruik" />
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50/50 border border-green-100 rounded-xl p-5">
              <p className="text-xs font-bold text-green-700 mb-3 flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Wel doen
              </p>
              <ul className="space-y-2">
                {result.logoGuidelines.doList.map((item, i) => (
                  <li key={i} className="text-xs text-neutral-600 flex gap-2">
                    <span className="text-green-400 shrink-0">+</span>{item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-red-50/50 border border-red-100 rounded-xl p-5">
              <p className="text-xs font-bold text-red-700 mb-3 flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Niet doen
              </p>
              <ul className="space-y-2">
                {result.logoGuidelines.dontList.map((item, i) => (
                  <li key={i} className="text-xs text-neutral-600 flex gap-2">
                    <span className="text-red-300 shrink-0">-</span>{item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      ) : !isPremium && (
        <section>
          <SectionHeader num="09" title="Logo-richtlijnen" subtitle="Regels voor consistent logogebruik" />
          <PremiumTeaser guideId={guideId} primary={primary} label="Uitgebreide logo do's & don'ts" />
        </section>
      )}

      {/* ── 10 MERKTOEPASSINGEN ── */}
      <section>
        <SectionHeader num="10" title="Merktoepassing" subtitle="Zo ziet jouw merk eruit in de praktijk" />
        <div className="space-y-8">
          {/* Free: 1 mockup teaser. Premium: all mockups */}
          <BusinessCardMockup result={result} />
          {isPremium ? (
            <>
              <div className="grid grid-cols-2 gap-6 items-start">
                <SocialPostMockup result={result} />
                <EmailSignatureMockup result={result} />
              </div>
              <WebsiteMockupWeb result={result} />
              <div className="grid grid-cols-2 gap-6 items-start">
                <PresentationMockupWeb result={result} />
                <InvoiceMockupWeb result={result} />
              </div>
              <LetterheadMockupWeb result={result} />
            </>
          ) : (
            <PremiumTeaser guideId={guideId} primary={primary} label="6 extra mockup templates" />
          )}
        </div>
      </section>

      {/* ── DOWNLOAD / UPGRADE CTA ── */}
      <div className="border-t border-neutral-100 pt-10">
        {isPremium ? (
          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="w-full py-4 bg-neutral-900 text-white rounded-xl font-semibold hover:bg-neutral-800 transition-colors disabled:opacity-50">
            {downloading ? "PDF wordt gegenereerd..." : "Download volledige brand guide als PDF"}
          </button>
        ) : (
          <div className="relative rounded-2xl overflow-hidden text-white text-center" style={{ backgroundColor: primary }}>
            {result.brandPatternSvg && (
              <div className="absolute inset-0 opacity-[0.06] [&_svg]:w-full [&_svg]:h-full"
                dangerouslySetInnerHTML={{ __html: normalizeSvg(result.brandPatternSvg, true) }} />
            )}
            <div className="relative px-8 py-10 space-y-3">
              <p className="text-xl font-bold">Klaar om te lanceren?</p>
              <p className="text-white/60 text-sm max-w-sm mx-auto">
                Download alles als PDF, ontvang logo-varianten en social media templates.
              </p>
              <a
                href={`/upgrade?guideId=${guideId}`}
                className="inline-block mt-2 py-3 px-8 bg-white rounded-xl font-semibold text-sm hover:bg-neutral-100 transition-colors"
                style={{ color: primary }}>
                Upgrade naar Premium · &euro;18,95/maand &rarr;
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
