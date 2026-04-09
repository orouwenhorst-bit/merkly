"use client";
import { BrandGuideResult } from "@/types/brand";
import { useState } from "react";

interface Props {
  result: BrandGuideResult;
  isPremium: boolean;
  guideId: string;
}

/* ── Helpers ── */

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

/* Logo always on white rounded container for consistent look */
function LogoMark({ result, size = "md" }: { result: BrandGuideResult; size?: "sm" | "md" | "lg" }) {
  const sizeMap = { sm: "w-10 h-10", md: "w-14 h-14", lg: "w-24 h-24" };
  const imgSize = { sm: "w-8 h-8", md: "w-11 h-11", lg: "w-20 h-20" };

  const primary = result.colorPalette[0]?.hex ?? "#111";

  if (result.iconSvg) {
    return (
      <div
        className={`${sizeMap[size]} bg-white rounded-xl shadow-sm border border-neutral-100 flex items-center justify-center flex-shrink-0 overflow-hidden`}
      >
        <div
          className={`${imgSize[size]} [&_svg]:w-full [&_svg]:h-full`}
          style={{ color: primary }}
          dangerouslySetInnerHTML={{ __html: result.iconSvg }}
        />
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
    <div
      className={`${sizeMap[size]} flex-shrink-0 [&_svg]:w-full [&_svg]:h-full`}
      dangerouslySetInnerHTML={{ __html: normalizeSvg(result.logoIconSvg) }}
    />
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
      <p className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${dark ? "text-neutral-500" : "text-neutral-400"}`}>
        {label}
      </p>
      <p className={`text-sm leading-relaxed ${dark ? "text-white" : "text-neutral-800"}`}>{value}</p>
    </div>
  );
}

/* ── Mockups ── */

function BusinessCardMockup({ result }: { result: BrandGuideResult }) {
  const primary = result.colorPalette[0]?.hex ?? "#000";
  const bg = result.colorPalette[2]?.hex ?? "#f5f5f5";
  const textColor = result.colorPalette[3]?.hex ?? "#111";
  const accent = result.colorPalette[1]?.hex ?? "#888";
  const dark = isDark(bg);

  return (
    <div>
      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-3">Visitekaartje</p>
      <div className="grid grid-cols-2 gap-4">
        {/* Front */}
        <div
          className="aspect-[1.8/1] rounded-xl shadow-lg flex flex-col justify-between p-5 relative overflow-hidden"
          style={{ backgroundColor: primary }}
        >
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
        {/* Back */}
        <div
          className="aspect-[1.8/1] rounded-xl shadow-lg flex flex-col justify-center p-5 relative overflow-hidden"
          style={{ backgroundColor: bg, border: `1px solid ${primary}15` }}
        >
          <p className="font-bold text-sm mb-0.5" style={{ color: dark ? "#fff" : textColor }}>
            Voornaam Achternaam
          </p>
          <p className="text-xs mb-3" style={{ color: accent }}>Functietitel</p>
          <div className="space-y-0.5">
            {["naam@bedrijf.nl", "+31 6 12 34 56 78", "bedrijf.nl"].map((line) => (
              <p key={line} className="text-[10px]" style={{ color: dark ? "rgba(255,255,255,0.5)" : `${textColor}80` }}>
                {line}
              </p>
            ))}
          </div>
          <div className="absolute left-0 top-0 bottom-0 w-0.5" style={{ backgroundColor: primary }} />
        </div>
      </div>
    </div>
  );
}

function SocialPostMockup({ result }: { result: BrandGuideResult }) {
  const primary = result.colorPalette[0]?.hex ?? "#000";
  const accent = result.colorPalette[4]?.hex ?? result.colorPalette[1]?.hex ?? "#888";

  return (
    <div>
      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-3">Instagram post</p>
      <div
        className="aspect-square rounded-xl shadow-lg flex flex-col justify-between p-5 relative overflow-hidden max-w-[280px]"
        style={{ backgroundColor: primary }}
      >
        {result.brandPatternSvg && (
          <div className="absolute inset-0 opacity-[0.07] [&_svg]:w-full [&_svg]:h-full"
            dangerouslySetInnerHTML={{ __html: normalizeSvg(result.brandPatternSvg, true) }} />
        )}
        <LogoMark result={result} size="sm" />
        <div className="relative space-y-3">
          <p className="text-white font-bold text-lg leading-tight">
            {result.brandVoiceExamples?.heroHeadline ?? result.tagline}
          </p>
          <span
            className="inline-block text-[10px] font-bold px-3 py-1.5 rounded-full"
            style={{ backgroundColor: accent, color: "#fff" }}
          >
            {result.brandVoiceExamples?.callToAction ?? "Meer info"}
          </span>
        </div>
      </div>
      {result.brandVoiceExamples?.instagramCaption && (
        <div className="mt-3 rounded-xl p-4 bg-neutral-50 border border-neutral-100 max-w-[280px]">
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">Caption</p>
          <p className="text-xs text-neutral-600 leading-relaxed">
            {result.brandVoiceExamples.instagramCaption}
          </p>
        </div>
      )}
    </div>
  );
}

function EmailSignatureMockup({ result }: { result: BrandGuideResult }) {
  const primary = result.colorPalette[0]?.hex ?? "#000";
  const textColor = result.colorPalette[3]?.hex ?? "#111";
  const accent = result.colorPalette[1]?.hex ?? "#888";

  return (
    <div>
      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-3">E-mailhandtekening</p>
      <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm max-w-xs">
        <div className="flex gap-3 items-start">
          <LogoMark result={result} size="sm" />
          <div className="min-w-0">
            <p className="font-bold text-sm" style={{ color: textColor }}>Voornaam Achternaam</p>
            <p className="text-xs mt-0.5" style={{ color: accent }}>
              Functietitel · {result.companyName}
            </p>
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

/* ── Main Component ── */

export default function BrandGuidePreview({ result, isPremium, guideId }: Props) {
  const [downloading, setDownloading] = useState(false);
  const primary = result.colorPalette[0]?.hex ?? "#000";
  const accent = result.colorPalette[4]?.hex ?? result.colorPalette[1]?.hex ?? "#888";

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

  return (
    <div className="space-y-16">
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href={result.typography.googleFontsUrl} />

      {/* ── HERO BANNER ── */}
      <div className="relative rounded-2xl overflow-hidden" style={{ backgroundColor: primary }}>
        {result.brandPatternSvg && (
          <div className="absolute inset-0 opacity-[0.06] [&_svg]:w-full [&_svg]:h-full"
            dangerouslySetInnerHTML={{ __html: normalizeSvg(result.brandPatternSvg, true) }} />
        )}
        <div className="relative px-8 py-10 md:px-12 md:py-14">
          {/* Top bar: logo + personality */}
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-3">
              <LogoMark result={result} size="md" />
              <div>
                <p className="text-white font-bold text-xl tracking-tight">{result.companyName}</p>
                <p className="text-white/50 text-xs">{result.tagline}</p>
              </div>
            </div>
          </div>
          {/* Headline */}
          <h1
            className="text-3xl md:text-5xl font-bold text-white leading-[1.1] max-w-lg mb-4"
            style={{ fontFamily: `'${result.typography.displayFont}', serif` }}
          >
            {result.brandVoiceExamples?.heroHeadline ?? result.tagline}
          </h1>
          <p className="text-white/60 text-base max-w-md leading-relaxed mb-6">
            {result.brandVoiceExamples?.subHeadline ?? ""}
          </p>
          {/* Personality tags */}
          <div className="flex flex-wrap gap-1.5">
            {result.brandPersonality.map((word) => (
              <span key={word} className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/10 text-white/80 border border-white/10">
                {word}
              </span>
            ))}
          </div>
          {/* Color strip at bottom */}
          <div className="flex mt-8 rounded-lg overflow-hidden h-2">
            {result.colorPalette.map((c) => (
              <div key={c.hex} className="flex-1" style={{ backgroundColor: c.hex }} />
            ))}
          </div>
        </div>
      </div>

      {/* ── LOGO SECTION ── */}
      <section>
        <SectionHeader num="01" title="Logo" subtitle="Jouw merklogo in verschillende toepassingen" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Large white */}
          <div className="col-span-2 bg-white border border-neutral-200 rounded-xl p-8 flex items-center justify-center min-h-[200px]">
            <div className="flex items-center gap-4">
              <LogoMark result={result} size="lg" />
              <div>
                <p className="text-2xl font-bold" style={{ color: primary }}>{result.companyName}</p>
                <p className="text-sm text-neutral-400">{result.tagline}</p>
              </div>
            </div>
          </div>
          {/* Dark */}
          <div className="bg-neutral-900 rounded-xl p-6 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-center">
              <LogoMark result={result} size="md" />
              <span className="text-white font-bold text-sm">{result.companyName}</span>
            </div>
          </div>
          {/* Brand color */}
          <div className="rounded-xl p-6 flex items-center justify-center" style={{ backgroundColor: primary }}>
            <div className="flex flex-col items-center gap-3 text-center">
              <LogoMark result={result} size="md" />
              <span className="text-white font-bold text-sm">{result.companyName}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          {result.logoSvg && (
            <a href={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(result.logoSvg)}`}
              download={`${result.companyName}-woordmerk.svg`}
              className="text-[10px] px-2.5 py-1 border border-neutral-200 rounded-md hover:bg-neutral-50 transition-colors font-medium text-neutral-500">
              Woordmerk SVG ↓
            </a>
          )}
          {result.logoIconSvg && (
            <a href={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(result.logoIconSvg)}`}
              download={`${result.companyName}-icoon.svg`}
              className="text-[10px] px-2.5 py-1 border border-neutral-200 rounded-md hover:bg-neutral-50 transition-colors font-medium text-neutral-500">
              Icoon SVG ↓
            </a>
          )}
        </div>
      </section>

      {/* ── KLEURENPALET ── */}
      <section>
        <SectionHeader num="02" title="Kleurenpalet" subtitle="5 kleuren die samen jouw merkidentiteit vormen" />
        <div className="grid grid-cols-5 gap-3">
          {result.colorPalette.map((color, i) => (
            <div key={color.hex} className="group">
              <div
                className={`h-24 md:h-32 rounded-xl shadow-sm border border-black/5 ${i === 0 ? "ring-2 ring-offset-2 ring-neutral-300" : ""}`}
                style={{ backgroundColor: color.hex }}
              />
              <div className="mt-2 space-y-0.5">
                <p className="text-[10px] font-mono font-bold text-neutral-700">{color.hex.toUpperCase()}</p>
                <p className="text-xs font-semibold text-neutral-900">{color.name}</p>
                <p className="text-[10px] text-neutral-400 leading-snug">{color.usage}</p>
              </div>
            </div>
          ))}
        </div>
        {result.brandPatternSvg && (
          <div className="mt-8">
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">Merkpatroon</p>
            <div className="h-24 rounded-xl overflow-hidden border border-neutral-100 [&_svg]:w-full [&_svg]:h-full"
              dangerouslySetInnerHTML={{ __html: normalizeSvg(result.brandPatternSvg, true) }} />
          </div>
        )}
      </section>

      {/* ── TYPOGRAFIE ── */}
      <section>
        <SectionHeader num="03" title="Typografie" subtitle="Lettertype-combinatie voor een consistente uitstraling" />
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white border border-neutral-200 rounded-xl p-6 space-y-4">
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
              Display — {result.typography.displayFont}
            </p>
            <div style={{ fontFamily: `'${result.typography.displayFont}', serif` }}>
              <p className="text-5xl font-bold text-neutral-900 leading-none">Aa</p>
              <p className="text-xl font-bold text-neutral-800 mt-3">{result.companyName}</p>
              <p className="text-sm text-neutral-400 mt-1">{result.tagline}</p>
            </div>
            <p className="text-[10px] text-neutral-400 border-t border-neutral-100 pt-3">
              {result.typography.displayUsage}
            </p>
          </div>
          <div className="bg-white border border-neutral-200 rounded-xl p-6 space-y-4">
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
              Body — {result.typography.bodyFont}
            </p>
            <div style={{ fontFamily: `'${result.typography.bodyFont}', sans-serif` }}>
              <p className="text-sm leading-relaxed text-neutral-700">{result.brandStory}</p>
              <p className="text-[10px] text-neutral-400 mt-3 tracking-wide font-mono">
                ABCDEFGHIJKLMNOPQRSTUVWXYZ<br />
                abcdefghijklmnopqrstuvwxyz<br />
                0123456789 !@#$%&
              </p>
            </div>
            <p className="text-[10px] text-neutral-400 border-t border-neutral-100 pt-3">
              {result.typography.bodyUsage}
            </p>
          </div>
        </div>
      </section>

      {/* ── BRAND VOICE ── */}
      {result.brandVoiceExamples && (
        <section>
          <SectionHeader num="04" title="Brand voice & copy" subtitle="Kant-en-klare teksten in jouw merkstijl" />
          <div className="space-y-3">
            {/* Hero headline */}
            <div className="bg-neutral-950 rounded-xl p-6">
              <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2">Website headline</p>
              <p className="text-2xl font-bold text-white" style={{ fontFamily: `'${result.typography.displayFont}', serif` }}>
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
                <div className="rounded-xl p-5 flex items-center justify-center flex-1" style={{ backgroundColor: accent }}>
                  <p className="text-white font-bold text-base text-center">{result.brandVoiceExamples.callToAction}</p>
                </div>
              </div>
            </div>
            <CopyBlock label="Instagram caption" value={result.brandVoiceExamples.instagramCaption} />
          </div>
        </section>
      )}

      {/* ── MERKVERHAAL & TONE OF VOICE ── */}
      <section>
        <SectionHeader num="05" title="Merkverhaal" />
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <p className="text-base text-neutral-600 leading-relaxed" style={{ fontFamily: `'${result.typography.bodyFont}', sans-serif` }}>
              {result.brandStory}
            </p>
          </div>
          <div className="rounded-xl p-5 border-l-4 bg-neutral-50" style={{ borderColor: primary }}>
            <p className="text-xs font-bold text-neutral-800 mb-1.5">Tone of voice</p>
            <p className="text-xs text-neutral-500 leading-relaxed">{result.toneOfVoice}</p>
          </div>
        </div>
      </section>

      {/* ── MERKTOEPASSING ── */}
      <section>
        <SectionHeader num="06" title="Merktoepassing" subtitle="Zo ziet jouw merk eruit in de praktijk" />
        <div className="space-y-8">
          <BusinessCardMockup result={result} />
          <div className="grid grid-cols-2 gap-6 items-start">
            <SocialPostMockup result={result} />
            <EmailSignatureMockup result={result} />
          </div>
        </div>
      </section>

      {/* ── LOGO RICHTLIJNEN ── */}
      <section>
        <SectionHeader num="07" title="Logo-richtlijnen" subtitle="Regels voor consistent logogebruik" />
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
                  <span className="text-green-400 shrink-0">—</span>{item}
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
                  <span className="text-red-300 shrink-0">—</span>{item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── DOWNLOAD / UPGRADE CTA ── */}
      <div className="border-t border-neutral-100 pt-10">
        {isPremium ? (
          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="w-full py-4 bg-neutral-900 text-white rounded-xl font-semibold hover:bg-neutral-800 transition-colors disabled:opacity-50"
          >
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
                style={{ color: primary }}
              >
                Upgrade naar Premium — eenmalig €14 →
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
