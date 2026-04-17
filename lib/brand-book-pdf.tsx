/* eslint-disable jsx-a11y/alt-text */
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
  pdf,
} from "@react-pdf/renderer";
import { BrandGuideResult, ColorSwatch } from "@/types/brand";
import {
  InstagramPostMockup,
  WebsiteMockup,
  LetterheadMockup,
  PresentationSlideMockup,
  MerchandiseMockup,
  CoffeeCupMockup,
  SocialBannerMockup,
  InvoiceMockup,
  type MockupProps,
} from "@/lib/pdf-mockups";

/* ─────────────────────────────────────────────────────────────
   FONT REGISTRATION
   ───────────────────────────────────────────────────────────── */

const registeredFonts = new Set<string>();

async function registerGoogleFont(fontName: string): Promise<boolean> {
  if (registeredFonts.has(fontName)) return true;
  try {
    // Google Fonts expects spaces as '+' in the family parameter
    const familyParam = fontName.replace(/\s+/g, "+");
    const cssUrl = `https://fonts.googleapis.com/css2?family=${familyParam}:ital,wght@0,400;0,700;1,400&display=swap`;
    const res = await fetch(cssUrl, {
      headers: {
        // Firefox UA to get TTF instead of WOFF2 (react-pdf needs TTF)
        "User-Agent":
          "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:27.0) Gecko/20100101 Firefox/27.0",
      },
    });
    if (!res.ok) return false;
    const css = await res.text();
    const blocks = css.split("@font-face");
    const fonts: { src: string; fontWeight?: number; fontStyle?: "italic" | "normal" }[] = [];
    for (const block of blocks) {
      const urlMatch = block.match(/url\((https:\/\/[^)]+\.(?:ttf|woff2?))\)/);
      const weightMatch = block.match(/font-weight:\s*(\d+)/);
      const styleMatch = block.match(/font-style:\s*(italic|normal)/);
      if (urlMatch) {
        const rawStyle = styleMatch?.[1];
        fonts.push({
          src: urlMatch[1],
          fontWeight: weightMatch ? parseInt(weightMatch[1], 10) : 400,
          fontStyle: rawStyle === "italic" ? "italic" : "normal",
        });
      }
    }
    if (fonts.length === 0) return false;
    Font.register({ family: fontName, fonts });
    registeredFonts.add(fontName);
    return true;
  } catch (err) {
    console.error(`Failed to register font ${fontName}:`, err);
    return false;
  }
}

/* ─────────────────────────────────────────────────────────────
   LOGO LOADER
   ───────────────────────────────────────────────────────────── */

async function svgToPngDataUri(svgInput: Buffer | string, transparentBg = true): Promise<string | null> {
  try {
    const sharp = (await import("sharp")).default;
    const inputBuf = Buffer.isBuffer(svgInput) ? svgInput : Buffer.from(String(svgInput));
    const pipeline = sharp(inputBuf, { density: 300 }).resize(512, 512, {
      fit: "contain",
      background: transparentBg
        ? { r: 255, g: 255, b: 255, alpha: 0 }
        : { r: 255, g: 255, b: 255, alpha: 255 },
    });
    const pngBuf = await pipeline.png().toBuffer();
    return `data:image/png;base64,${pngBuf.toString("base64")}`;
  } catch (err) {
    // Retry with white background (some SVGs fail with alpha channel)
    try {
      const sharp = (await import("sharp")).default;
      const inputBuf = Buffer.isBuffer(svgInput) ? svgInput : Buffer.from(String(svgInput));
      const pngBuf = await sharp(inputBuf, { density: 150 })
        .resize(512, 512, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 255 } })
        .flatten({ background: { r: 255, g: 255, b: 255 } })
        .png()
        .toBuffer();
      return `data:image/png;base64,${pngBuf.toString("base64")}`;
    } catch {
      console.error("SVG to PNG conversion failed:", err);
      return null;
    }
  }
}

async function fetchLogoDataUri(
  url: string | undefined,
  svgString?: string,
): Promise<string | null> {
  // Prefer raw SVG string (from logoVariants.fullColor) — convert to PNG for react-pdf
  if (svgString) {
    return svgToPngDataUri(svgString);
  }
  if (!url) return null;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const contentType = res.headers.get("content-type") || "image/png";
    const buf = Buffer.from(await res.arrayBuffer());
    // Convert SVG to PNG since react-pdf cannot render SVG
    if (contentType.includes("svg")) {
      return svgToPngDataUri(buf);
    }
    return `data:${contentType};base64,${buf.toString("base64")}`;
  } catch (err) {
    console.error("Logo fetch failed:", err);
    return null;
  }
}

/* ─────────────────────────────────────────────────────────────
   COLOR HELPERS
   ───────────────────────────────────────────────────────────── */

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const c = hex.replace("#", "");
  return {
    r: parseInt(c.slice(0, 2), 16),
    g: parseInt(c.slice(2, 4), 16),
    b: parseInt(c.slice(4, 6), 16),
  };
}

function isDark(hex: string): boolean {
  const { r, g, b } = hexToRgb(hex);
  return (r * 299 + g * 587 + b * 114) / 1000 < 128;
}

/* ─────────────────────────────────────────────────────────────
   DATA HELPERS — extract from new BrandGuideResult
   ───────────────────────────────────────────────────────────── */

function getColors(r: BrandGuideResult): ColorSwatch[] {
  return r.colorPalette?.colors ?? [];
}

function byCategory(r: BrandGuideResult, cat: "primary" | "secondary" | "neutral"): ColorSwatch[] {
  return getColors(r).filter(c => c.category === cat);
}

function displayFont(r: BrandGuideResult): string {
  return r.typography?.fonts?.find(f => f.category === "display")?.name ?? r.typography?.fonts?.[0]?.name ?? "Helvetica";
}

function bodyFontName(r: BrandGuideResult): string {
  return r.typography?.fonts?.find(f => f.category === "body")?.name ?? r.typography?.fonts?.[1]?.name ?? "Helvetica";
}

/* ─────────────────────────────────────────────────────────────
   STYLES
   ───────────────────────────────────────────────────────────── */

function buildStyles(df: string, bf: string) {
  return StyleSheet.create({
    /* ── base page ── */
    page: { paddingTop: 50, paddingBottom: 50, paddingHorizontal: 50, backgroundColor: "#ffffff", fontFamily: bf, fontSize: 10, color: "#1a1a1a", lineHeight: 1.5 },
    pageNoPadding: { backgroundColor: "#ffffff" },

    /* ── cover ── */
    coverPage: { backgroundColor: "#0a0a0a", paddingTop: 60, paddingBottom: 60, paddingHorizontal: 60, color: "#ffffff" },
    coverTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    coverBrand: { fontSize: 10, color: "#ffffff", letterSpacing: 2, textTransform: "uppercase", fontFamily: bf, fontWeight: 700 },
    coverDate: { fontSize: 9, color: "#888888", fontFamily: bf },
    coverCenter: { flex: 1, justifyContent: "center" },
    coverLabel: { fontSize: 10, color: "#a1a1aa", letterSpacing: 3, textTransform: "uppercase", marginBottom: 18, fontFamily: bf, fontWeight: 700 },
    coverTitle: { fontSize: 64, fontWeight: 700, color: "#ffffff", letterSpacing: -1.5, lineHeight: 1.05, fontFamily: df },
    coverTagline: { fontSize: 14, color: "#a1a1aa", marginTop: 20, maxWidth: 380, fontFamily: bf, lineHeight: 1.5 },
    coverColorStrip: { flexDirection: "row", height: 6, marginTop: 30, borderRadius: 3, overflow: "hidden" },
    coverBottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginTop: 30 },
    coverFooter: { fontSize: 9, color: "#666666", fontFamily: bf },

    /* ── section headers ── */
    sectionNum: { fontSize: 9, fontFamily: bf, color: "#a1a1aa", letterSpacing: 2, marginBottom: 4 },
    sectionTitle: { fontSize: 32, fontWeight: 700, color: "#0a0a0a", letterSpacing: -0.5, fontFamily: df, marginBottom: 16, lineHeight: 1.2 },
    sectionSubtitle: { fontSize: 11, color: "#71717a", marginBottom: 30, fontFamily: bf, maxWidth: 450 },
    sectionDivider: { height: 1, backgroundColor: "#e5e5e5", marginBottom: 30 },

    /* ── body ── */
    bodyText: { fontSize: 11, lineHeight: 1.7, color: "#3f3f46", fontFamily: bf },
    label: { fontSize: 8, fontWeight: 700, color: "#71717a", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6, fontFamily: bf },
    tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 16 },
    tag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: "#f4f4f5", fontSize: 9, color: "#3f3f46", fontWeight: 700, fontFamily: bf },

    /* ── layout ── */
    twoCol: { flexDirection: "row", gap: 24 },
    col: { flex: 1 },
    grid2: { flexDirection: "row", gap: 12, marginBottom: 12 },
    grid3: { flexDirection: "row", gap: 10, marginBottom: 10 },

    /* ── callout ── */
    callout: { backgroundColor: "#fafafa", borderLeftWidth: 3, padding: 16, marginTop: 20 },
    calloutLabel: { fontSize: 8, fontWeight: 700, color: "#52525b", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 6, fontFamily: bf },
    calloutText: { fontSize: 10, lineHeight: 1.5, color: "#52525b", fontFamily: bf },

    /* ── logo ── */
    logoBlock: { flex: 1, borderRadius: 8, padding: 24, alignItems: "center", justifyContent: "center", minHeight: 180 },
    logoImage: { width: 90, height: 90, objectFit: "contain" },
    logoImageSmall: { width: 36, height: 36, objectFit: "contain" },
    logoLabel: { fontSize: 8, marginTop: 14, color: "#a1a1aa", textTransform: "uppercase", letterSpacing: 1.2, fontFamily: bf, fontWeight: 700 },
    logoCaption: { fontSize: 14, marginTop: 10, fontWeight: 700, fontFamily: df },

    /* ── color palette ── */
    colorRow: { flexDirection: "row", marginBottom: 14, borderRadius: 8, overflow: "hidden", borderWidth: 1, borderColor: "#e5e5e5" },
    colorSwatch: { width: 120, height: 110 },
    colorInfo: { flex: 1, padding: 16, justifyContent: "center", backgroundColor: "#ffffff" },
    colorName: { fontSize: 14, fontWeight: 700, color: "#0a0a0a", fontFamily: df, marginBottom: 4 },
    colorUsage: { fontSize: 9, color: "#71717a", marginBottom: 10, fontFamily: bf, lineHeight: 1.4 },
    colorCodes: { flexDirection: "row", gap: 16 },
    colorCode: { fontSize: 8, color: "#3f3f46", fontFamily: "Courier" },
    colorCategoryLabel: { fontSize: 8, fontWeight: 700, color: "#a1a1aa", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8, marginTop: 16, fontFamily: bf },

    /* ── typography ── */
    fontShowcase: { padding: 24, borderWidth: 1, borderColor: "#e5e5e5", borderRadius: 8, marginBottom: 16 },
    fontShowcaseLabel: { fontSize: 8, color: "#a1a1aa", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 16, fontFamily: bf, fontWeight: 700 },
    fontShowcaseGiant: { fontSize: 56, fontWeight: 700, color: "#0a0a0a", marginBottom: 14, lineHeight: 1.1 },
    fontShowcaseCompany: { fontSize: 22, fontWeight: 700, color: "#0a0a0a", marginBottom: 8, lineHeight: 1.2 },
    fontShowcaseTagline: { fontSize: 11, color: "#71717a" },
    fontShowcaseParagraph: { fontSize: 10, color: "#3f3f46", lineHeight: 1.6, marginTop: 12 },
    alphabet: { fontSize: 9, color: "#71717a", marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#e5e5e5", lineHeight: 1.6 },
    fontUsage: { fontSize: 8, color: "#a1a1aa", marginTop: 10, fontFamily: bf },

    /* ── type scale table ── */
    tsRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#f4f4f5", paddingVertical: 6, alignItems: "center" },
    tsHeader: { flexDirection: "row", borderBottomWidth: 2, borderBottomColor: "#e5e5e5", paddingVertical: 6, marginBottom: 2 },
    tsCell: { fontSize: 8, color: "#3f3f46", fontFamily: bf },
    tsCellBold: { fontSize: 8, color: "#0a0a0a", fontWeight: 700, fontFamily: bf },

    /* ── voice & copy ── */
    copyBlock: { padding: 18, backgroundColor: "#fafafa", borderRadius: 8, marginBottom: 10 },
    copyBlockDark: { padding: 20, backgroundColor: "#0a0a0a", borderRadius: 8, marginBottom: 12 },
    copyLabel: { fontSize: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.2, color: "#a1a1aa", marginBottom: 8, fontFamily: bf },
    copyLabelDark: { fontSize: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.2, color: "#71717a", marginBottom: 8, fontFamily: bf },
    copyText: { fontSize: 11, color: "#1a1a1a", lineHeight: 1.5, fontFamily: bf },
    copyTextDisplay: { fontSize: 22, color: "#ffffff", lineHeight: 1.2, fontFamily: df, fontWeight: 700 },
    copyTextDarkSub: { fontSize: 10, color: "#a1a1aa", marginTop: 8, fontFamily: bf },

    /* ── guidelines ── */
    guidelineBox: { flex: 1, padding: 18, borderRadius: 8, borderWidth: 1 },
    guidelineBoxDo: { borderColor: "#86efac", backgroundColor: "#f0fdf4" },
    guidelineBoxDont: { borderColor: "#fca5a5", backgroundColor: "#fef2f2" },
    guidelineTitle: { fontSize: 11, fontWeight: 700, marginBottom: 10, fontFamily: bf },
    guidelineTitleDo: { color: "#15803d" },
    guidelineTitleDont: { color: "#b91c1c" },
    guidelineItem: { fontSize: 9, color: "#3f3f46", marginBottom: 6, lineHeight: 1.4, fontFamily: bf },

    /* ── accessibility table ── */
    accRow: { flexDirection: "row", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#f4f4f5", alignItems: "center" },
    accBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, fontSize: 7, fontWeight: 700, fontFamily: bf },
    accPass: { backgroundColor: "#dcfce7", color: "#166534" },
    accFail: { backgroundColor: "#fee2e2", color: "#991b1b" },

    /* ── back cover ── */
    backPage: { backgroundColor: "#0a0a0a", padding: 60, justifyContent: "space-between", color: "#ffffff" },
    backTitle: { fontSize: 40, fontWeight: 700, color: "#ffffff", fontFamily: df, letterSpacing: -1, maxWidth: 400 },
    backText: { fontSize: 11, color: "#a1a1aa", marginTop: 18, maxWidth: 400, lineHeight: 1.6 },
    backFooterRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", paddingTop: 30, borderTopWidth: 1, borderTopColor: "#27272a" },

    /* ── page footer ── */
    pageFooter: { position: "absolute", bottom: 25, left: 50, right: 50, flexDirection: "row", justifyContent: "space-between", fontSize: 8, color: "#a1a1aa", fontFamily: bf },
  });
}

/* ─── Reusable components ─── */

function SectionHead({ num, title, subtitle, styles }: { num: string; title: string; subtitle?: string; styles: ReturnType<typeof buildStyles> }) {
  return (
    <View>
      <Text style={styles.sectionNum}>{num}</Text>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
      <View style={styles.sectionDivider} />
    </View>
  );
}

function PageFooter({ label, num, styles }: { label: string; num: string; styles: ReturnType<typeof buildStyles> }) {
  return (
    <View style={styles.pageFooter} fixed>
      <Text>{label}</Text>
      <Text>Merkly — merkly.nl</Text>
      <Text>{num}</Text>
    </View>
  );
}

/* ─────────────────────────────────────────────────────────────
   THE DOCUMENT — all 11 sections from the spec
   ───────────────────────────────────────────────────────────── */

type PdfProps = {
  result: BrandGuideResult;
  logoDataUri: string | null;        // fullColor PNG
  logoWhiteUri: string | null;       // mono-white PNG for dark backgrounds
  logoPrimaryUri: string | null;     // mono-primary PNG for brand-colour backgrounds
  df: string; // resolved display font family
  bf: string; // resolved body font family
};

function BrandBookDocument({ result, logoDataUri, logoWhiteUri, logoPrimaryUri, df, bf }: PdfProps) {
  const styles = buildStyles(df, bf);
  const colors = getColors(result);
  const primary = byCategory(result, "primary")[0]?.hex ?? "#0a0a0a";
  const accent = byCategory(result, "secondary")[0]?.hex ?? colors[1]?.hex ?? "#888";
  const today = new Date().toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });

  const renderLogo = (size: "sm" | "lg" = "lg", overrideUri?: string | null) => {
    const uri = overrideUri !== undefined ? overrideUri : logoDataUri;
    if (uri) {
      return <Image src={uri} style={size === "lg" ? styles.logoImage : styles.logoImageSmall} />;
    }
    const initial = (result.companyName[0] ?? "M").toUpperCase();
    return (
      <View style={{ width: size === "lg" ? 90 : 36, height: size === "lg" ? 90 : 36, backgroundColor: primary, borderRadius: 100, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: "#ffffff", fontSize: size === "lg" ? 48 : 18, fontWeight: 700, fontFamily: df }}>{initial}</Text>
      </View>
    );
  };

  return (
    <Document title={`${result.companyName} — Huisstijl`} author="Merkly" subject="Brand guide">

      {/* ═══════ PAGE 1: COVER ═══════ */}
      <Page size="A4" style={[styles.pageNoPadding, styles.coverPage]}>
        <View style={styles.coverTop}>
          <Text style={styles.coverBrand}>Merkly</Text>
          <Text style={styles.coverDate}>{today}</Text>
        </View>
        <View style={styles.coverCenter}>
          <Text style={styles.coverLabel}>Huisstijl & Merkrichtlijnen</Text>
          <Text style={styles.coverTitle}>{result.companyName}</Text>
          <Text style={styles.coverTagline}>{result.toneOfVoice?.tagline ?? result.tagline}</Text>
          <View style={styles.coverColorStrip}>
            {colors.map((c) => (
              <View key={c.hex} style={{ flex: 1, height: 6, backgroundColor: c.hex }} />
            ))}
          </View>
        </View>
        <View style={styles.coverBottom}>
          <Text style={styles.coverFooter}>Gegenereerd met Merkly — merkly.nl</Text>
          <Text style={styles.coverFooter}>Vertrouwelijk</Text>
        </View>
      </Page>

      {/* ═══════ PAGE 2: MERKSTRATEGIE ═══════ */}
      <Page size="A4" style={styles.page}>
        <SectionHead num="01 — STRATEGIE" title="Merkstrategie" subtitle="De strategische basis waarop alle visuele en communicatieve keuzes rusten" styles={styles} />

        {/* Missie & Visie */}
        <View style={styles.twoCol}>
          <View style={styles.col}>
            <Text style={styles.label}>Missie</Text>
            <Text style={styles.bodyText}>{result.strategy?.mission}</Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Visie</Text>
            <Text style={styles.bodyText}>{result.strategy?.vision}</Text>
          </View>
        </View>

        {/* Kernwaarden */}
        <View style={{ marginTop: 24 }}>
          <Text style={styles.label}>Kernwaarden</Text>
          {result.strategy?.coreValues?.map((v) => (
            <View key={v.value} style={{ marginBottom: 8 }}>
              <Text style={{ fontSize: 11, fontWeight: 700, color: "#0a0a0a", fontFamily: bf }}>{v.value}</Text>
              <Text style={{ fontSize: 10, color: "#52525b", fontFamily: bf, lineHeight: 1.5 }}>{v.description}</Text>
            </View>
          ))}
        </View>

        {/* Merkverhaal */}
        <View style={[styles.callout, { borderLeftColor: primary, marginTop: 20 }]}>
          <Text style={styles.calloutLabel}>Merkverhaal</Text>
          <Text style={styles.calloutText}>{result.strategy?.brandStory}</Text>
        </View>

        {/* Merkpersoonlijkheid */}
        <View style={{ marginTop: 20 }}>
          <Text style={styles.label}>Merkpersoonlijkheid</Text>
          <View style={styles.tagRow}>
            {result.strategy?.personalityTraits?.map((t) => (
              <Text key={t} style={styles.tag}>{t}</Text>
            ))}
          </View>
          {result.strategy?.personalityDescription && (
            <Text style={{ fontSize: 10, color: "#52525b", marginTop: 8, lineHeight: 1.5, fontFamily: bf }}>
              {result.strategy.personalityDescription}
            </Text>
          )}
        </View>

        <PageFooter label="Merkstrategie" num="02" styles={styles} />
      </Page>

      {/* ═══════ PAGE 3: PERSONA'S ═══════ */}
      {result.strategy?.personas?.length > 0 && (
        <Page size="A4" style={styles.page}>
          <SectionHead num="01.1 — DOELGROEP" title="Persona's" subtitle="De mensen voor wie jullie merk bestaat" styles={styles} />
          {result.strategy.personas.map((p) => (
            <View key={p.name} style={{ marginBottom: 24, padding: 20, backgroundColor: "#fafafa", borderRadius: 8 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
                <View>
                  <Text style={{ fontSize: 16, fontWeight: 700, color: "#0a0a0a", fontFamily: df }}>{p.name}</Text>
                  <Text style={{ fontSize: 10, color: "#71717a", marginTop: 2, fontFamily: bf }}>{p.age} · {p.occupation}</Text>
                </View>
              </View>
              <Text style={{ fontSize: 10, color: "#3f3f46", lineHeight: 1.5, marginBottom: 12, fontFamily: bf }}>{p.description}</Text>
              <View style={styles.twoCol}>
                <View style={styles.col}>
                  <Text style={[styles.label, { color: "#15803d" }]}>Behoeften</Text>
                  {p.needs?.map((n, i) => (
                    <Text key={i} style={{ fontSize: 9, color: "#3f3f46", marginBottom: 4, fontFamily: bf }}>+ {n}</Text>
                  ))}
                </View>
                <View style={styles.col}>
                  <Text style={[styles.label, { color: "#b91c1c" }]}>Frustraties</Text>
                  {p.frustrations?.map((f, i) => (
                    <Text key={i} style={{ fontSize: 9, color: "#3f3f46", marginBottom: 4, fontFamily: bf }}>- {f}</Text>
                  ))}
                </View>
              </View>
            </View>
          ))}
          <PageFooter label="Persona's" num="03" styles={styles} />
        </Page>
      )}

      {/* ═══════ PAGE 4: LOGO PRIMAIR ═══════ */}
      <Page size="A4" style={styles.page}>
        <SectionHead num="02 — LOGO" title="Primair merkteken" subtitle="Het hart van jullie visuele identiteit" styles={styles} />
        <View style={[styles.logoBlock, { backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#e5e5e5", minHeight: 260 }]}>
          {renderLogo("lg")}
          <Text style={styles.logoCaption}>{result.companyName}</Text>
          <Text style={{ fontSize: 10, color: "#71717a", marginTop: 4 }}>{result.toneOfVoice?.tagline ?? result.tagline}</Text>
        </View>

        {/* Primaire kleur preview */}
        <View style={{ marginTop: 20 }}>
          <Text style={styles.label}>Primaire kleur</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginTop: 8 }}>
            <View style={{ width: 40, height: 40, backgroundColor: primary, borderRadius: 6, borderWidth: 1, borderColor: "#e5e5e5" }} />
            <Text style={{ fontSize: 11, fontFamily: "Courier", color: "#1a1a1a" }}>{primary.toUpperCase()}</Text>
          </View>
        </View>
        <PageFooter label="Logo — Primair" num="04" styles={styles} />
      </Page>

      {/* ═══════ PAGE 5: LOGO VARIATIES ═══════ */}
      <Page size="A4" style={styles.page}>
        <SectionHead num="02.1 — VARIANTEN" title="Logo-variaties" subtitle="Verschillende toepassingen voor verschillende contexten" styles={styles} />

        {/* Horizontal lockup */}
        <View style={[styles.logoBlock, { backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#e5e5e5", flexDirection: "row", gap: 16, minHeight: 130 }]}>
          {renderLogo("sm")}
          <View>
            <Text style={{ fontSize: 20, fontWeight: 700, color: primary, fontFamily: df }}>{result.companyName}</Text>
            <Text style={{ fontSize: 9, color: "#71717a", marginTop: 2 }}>{result.toneOfVoice?.tagline ?? result.tagline}</Text>
          </View>
        </View>
        <Text style={styles.logoLabel}>Horizontale lockup</Text>

        {/* 2×2 grid: vertical + wordmark + on brand + on dark */}
        <View style={[styles.grid2, { marginTop: 20 }]}>
          <View style={{ flex: 1 }}>
            <View style={[styles.logoBlock, { backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#e5e5e5", minHeight: 150 }]}>
              {renderLogo("sm")}
              <Text style={{ fontSize: 14, fontWeight: 700, color: primary, marginTop: 10, fontFamily: df }}>{result.companyName}</Text>
            </View>
            <Text style={styles.logoLabel}>Verticale lockup</Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={[styles.logoBlock, { backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#e5e5e5", minHeight: 150 }]}>
              <Text style={{ fontSize: 22, fontWeight: 700, color: primary, fontFamily: df, letterSpacing: -0.5 }}>{result.companyName}</Text>
            </View>
            <Text style={styles.logoLabel}>Woordmerk</Text>
          </View>
        </View>
        <View style={[styles.grid2, { marginTop: 20 }]}>
          <View style={{ flex: 1 }}>
            <View style={[styles.logoBlock, { backgroundColor: primary, minHeight: 150 }]}>
              {renderLogo("sm", logoPrimaryUri ?? logoWhiteUri)}
              <Text style={{ fontSize: 14, fontWeight: 700, color: "#ffffff", marginTop: 10, fontFamily: df }}>{result.companyName}</Text>
            </View>
            <Text style={styles.logoLabel}>Op merkkleur</Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={[styles.logoBlock, { backgroundColor: "#0a0a0a", minHeight: 150 }]}>
              {renderLogo("sm", logoWhiteUri)}
              <Text style={{ fontSize: 14, fontWeight: 700, color: "#ffffff", marginTop: 10, fontFamily: df }}>{result.companyName}</Text>
            </View>
            <Text style={styles.logoLabel}>Op donkere achtergrond</Text>
          </View>
        </View>
        <PageFooter label="Logo — Variaties" num="05" styles={styles} />
      </Page>

      {/* ═══════ PAGE 6: LOGO RICHTLIJNEN ═══════ */}
      <Page size="A4" style={styles.page}>
        <SectionHead num="02.2 — RICHTLIJNEN" title="Logo-richtlijnen" subtitle="Regels voor consistent logogebruik" styles={styles} />

        <View style={styles.grid2}>
          <View style={[styles.guidelineBox, styles.guidelineBoxDo]}>
            <Text style={[styles.guidelineTitle, styles.guidelineTitleDo]}>Wel doen</Text>
            {result.logoGuidelines?.doList?.map((item, i) => (
              <Text key={i} style={styles.guidelineItem}>— {item}</Text>
            ))}
          </View>
          <View style={[styles.guidelineBox, styles.guidelineBoxDont]}>
            <Text style={[styles.guidelineTitle, styles.guidelineTitleDont]}>Niet doen</Text>
            {result.logoGuidelines?.dontList?.map((item, i) => (
              <Text key={i} style={styles.guidelineItem}>— {item}</Text>
            ))}
          </View>
        </View>

        <View style={[styles.callout, { borderLeftColor: primary, marginTop: 30 }]}>
          <Text style={styles.calloutLabel}>Vrije ruimte & minimum formaat</Text>
          <Text style={styles.calloutText}>
            {result.logoGuidelines?.clearSpaceRule ?? "Bewaar altijd voldoende vrije ruimte rond het logo."}
            {"\n\n"}Minimum formaat: {result.logoGuidelines?.minimumSizes?.digitalPx ?? 24}px (digitaal) / {result.logoGuidelines?.minimumSizes?.printMm ?? 15}mm (print).
          </Text>
        </View>
        <PageFooter label="Logo — Richtlijnen" num="06" styles={styles} />
      </Page>

      {/* ═══════ PAGE 7: KLEURENPALET ═══════ */}
      <Page size="A4" style={styles.page}>
        <SectionHead num="03 — KLEUR" title="Kleurenpalet" subtitle={`${colors.length} kleuren die samen jullie merkidentiteit vormen`} styles={styles} />

        {/* Group by category */}
        {(["primary", "secondary", "neutral"] as const).map((cat) => {
          const catColors = byCategory(result, cat);
          if (!catColors.length) return null;
          const catLabel = cat === "primary" ? "Primair" : cat === "secondary" ? "Secundair" : "Neutraal";
          return (
            <View key={cat}>
              <Text style={styles.colorCategoryLabel}>{catLabel}</Text>
              {catColors.map((color) => (
                <View key={color.hex} style={styles.colorRow}>
                  <View style={[styles.colorSwatch, { backgroundColor: color.hex }]} />
                  <View style={styles.colorInfo}>
                    <Text style={styles.colorName}>{color.name}</Text>
                    <Text style={styles.colorUsage}>{color.usage}</Text>
                    <View style={styles.colorCodes}>
                      <Text style={styles.colorCode}>HEX {color.hex.toUpperCase()}</Text>
                      <Text style={styles.colorCode}>{color.rgb}</Text>
                      <Text style={styles.colorCode}>{color.cmyk}</Text>
                    </View>
                    {color.pantone && (
                      <Text style={[styles.colorCode, { marginTop: 4 }]}>{color.pantone}</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          );
        })}

        {/* Ratio guideline */}
        {result.colorPalette?.ratioGuideline && (
          <View style={[styles.callout, { borderLeftColor: primary, marginTop: 16 }]}>
            <Text style={styles.calloutLabel}>Kleurverhouding</Text>
            <Text style={styles.calloutText}>{result.colorPalette.ratioGuideline}</Text>
          </View>
        )}
        <PageFooter label="Kleurenpalet" num="07" styles={styles} />
      </Page>

      {/* ═══════ PAGE 8: WCAG TOEGANKELIJKHEID ═══════ */}
      {result.colorPalette?.accessibility?.length > 0 && (
        <Page size="A4" style={styles.page}>
          <SectionHead num="03.1 — TOEGANKELIJKHEID" title="Kleurcontrast & WCAG" subtitle="Server-side berekende contrastverhoudingen conform WCAG 2.1" styles={styles} />

          {/* Header */}
          <View style={[styles.accRow, { borderBottomWidth: 2, borderBottomColor: "#e5e5e5" }]}>
            <Text style={[styles.tsCellBold, { width: 160 }]}>Combinatie</Text>
            <Text style={[styles.tsCellBold, { width: 70 }]}>Contrast</Text>
            <Text style={[styles.tsCellBold, { width: 60 }]}>AA</Text>
            <Text style={[styles.tsCellBold, { width: 60 }]}>AAA</Text>
          </View>

          {result.colorPalette.accessibility.map((a) => (
            <View key={a.combination} style={styles.accRow}>
              <View style={{ width: 160, flexDirection: "row", alignItems: "center", gap: 8 }}>
                <View style={{ width: 14, height: 14, backgroundColor: a.foreground, borderRadius: 2, borderWidth: 1, borderColor: "#e5e5e5" }} />
                <View style={{ width: 14, height: 14, backgroundColor: a.background, borderRadius: 2, borderWidth: 1, borderColor: "#e5e5e5" }} />
                <Text style={styles.tsCell}>{a.combination}</Text>
              </View>
              <Text style={[styles.tsCellBold, { width: 70 }]}>{a.contrastRatio}</Text>
              <View style={{ width: 60 }}>
                <Text style={[styles.accBadge, a.wcagAA ? styles.accPass : styles.accFail]}>
                  {a.wcagAA ? "PASS" : "FAIL"}
                </Text>
              </View>
              <View style={{ width: 60 }}>
                <Text style={[styles.accBadge, a.wcagAAA ? styles.accPass : styles.accFail]}>
                  {a.wcagAAA ? "PASS" : "FAIL"}
                </Text>
              </View>
            </View>
          ))}

          <View style={[styles.callout, { borderLeftColor: "#16a34a", marginTop: 24 }]}>
            <Text style={styles.calloutLabel}>Over WCAG</Text>
            <Text style={styles.calloutText}>
              WCAG AA vereist een contrastratio van minimaal 4.5:1 voor normale tekst en 3:1 voor grote tekst. AAA vereist 7:1 respectievelijk 4.5:1. Alle waarden hierboven zijn server-side berekend.
            </Text>
          </View>
          <PageFooter label="Toegankelijkheid" num="08" styles={styles} />
        </Page>
      )}

      {/* ═══════ PAGE 9: TYPOGRAFIE ═══════ */}
      <Page size="A4" style={styles.page}>
        <SectionHead num="04 — TYPOGRAFIE" title="Lettertypes" subtitle="De stem van jullie merk in geschreven vorm" styles={styles} />

        {/* Font showcases */}
        {result.typography?.fonts?.map((font) => (
          <View key={font.name} style={styles.fontShowcase}>
            <Text style={styles.fontShowcaseLabel}>
              {font.category === "display" ? "Display" : font.category === "body" ? "Body" : "Accent"} — {font.name}
            </Text>
            <Text style={[styles.fontShowcaseGiant, { fontFamily: font.category === "display" ? df : bf }]}>Aa</Text>
            <Text style={[styles.fontShowcaseCompany, { fontFamily: font.category === "display" ? df : bf }]}>{result.companyName}</Text>
            <Text style={[styles.alphabet, { fontFamily: font.category === "display" ? df : bf }]}>
              ABCDEFGHIJKLMNOPQRSTUVWXYZ{"\n"}abcdefghijklmnopqrstuvwxyz{"\n"}0123456789 !@#$%&
            </Text>
            <Text style={styles.fontUsage}>{font.usage}</Text>
          </View>
        ))}

        {/* Pairing rationale */}
        {result.typography?.pairingRationale && (
          <View style={[styles.callout, { borderLeftColor: primary }]}>
            <Text style={styles.calloutLabel}>Waarom deze combinatie</Text>
            <Text style={styles.calloutText}>{result.typography.pairingRationale}</Text>
          </View>
        )}
        <PageFooter label="Typografie" num="09" styles={styles} />
      </Page>

      {/* ═══════ PAGE 10: TYPE SCALE ═══════ */}
      {result.typography?.typeScale?.length > 0 && (
        <Page size="A4" style={styles.page}>
          <SectionHead num="04.1 — TYPE SCALE" title="Typografische schaal" subtitle="Consistente hiërarchie voor alle tekstelementen" styles={styles} />

          {/* Table header */}
          <View style={styles.tsHeader}>
            <Text style={[styles.tsCellBold, { width: 50 }]}>Level</Text>
            <Text style={[styles.tsCellBold, { width: 110 }]}>Font</Text>
            <Text style={[styles.tsCellBold, { width: 50 }]}>Grootte</Text>
            <Text style={[styles.tsCellBold, { width: 50 }]}>Gewicht</Text>
            <Text style={[styles.tsCellBold, { width: 50 }]}>Hoogte</Text>
            <Text style={[styles.tsCellBold, { flex: 1 }]}>Gebruik</Text>
          </View>

          {result.typography.typeScale.map((ts) => (
            <View key={ts.level} style={styles.tsRow}>
              <Text style={[styles.tsCellBold, { width: 50 }]}>{ts.level}</Text>
              <Text style={[styles.tsCell, { width: 110 }]}>{ts.fontFamily}</Text>
              <Text style={[styles.tsCell, { width: 50 }]}>{ts.sizePx}px</Text>
              <Text style={[styles.tsCell, { width: 50 }]}>{ts.weight}</Text>
              <Text style={[styles.tsCell, { width: 50 }]}>{ts.lineHeight}</Text>
              <Text style={[styles.tsCell, { flex: 1 }]}>{ts.usage}</Text>
            </View>
          ))}

          {/* Visual preview of scale */}
          <View style={{ marginTop: 30 }}>
            <Text style={styles.label}>Visueel voorbeeld</Text>
            {result.typography.typeScale.filter(ts => ts.level.startsWith("H")).slice(0, 4).map((ts) => (
              <Text key={ts.level} style={{ fontSize: Math.min(ts.sizePx * 0.6, 36), fontWeight: ts.weight >= 600 ? 700 : 400, fontFamily: df, color: "#0a0a0a", marginBottom: 8, lineHeight: 1.2 }}>
                {ts.level} — {result.companyName}
              </Text>
            ))}
            <Text style={{ fontSize: 10, color: "#3f3f46", fontFamily: bf, lineHeight: 1.6, marginTop: 8 }}>
              Body — Dit is een voorbeeld van lopende tekst in het body-lettertype. Goed leesbaar op alle schermformaten.
            </Text>
          </View>
          <PageFooter label="Type Scale" num="10" styles={styles} />
        </Page>
      )}

      {/* ═══════ PAGE 11: TONE OF VOICE ═══════ */}
      <Page size="A4" style={styles.page}>
        <SectionHead num="05 — STEM" title="Tone of Voice" subtitle="Hoe jullie merk klinkt in alle communicatie" styles={styles} />

        {/* Voice attributes */}
        <Text style={styles.label}>Stemattributen</Text>
        <View style={styles.tagRow}>
          {result.toneOfVoice?.voiceAttributes?.map((a) => (
            <Text key={a} style={[styles.tag, { backgroundColor: primary + "15", color: primary }]}>{a}</Text>
          ))}
        </View>

        {/* Do's and don'ts */}
        <View style={[styles.grid2, { marginTop: 24 }]}>
          <View style={[styles.guidelineBox, styles.guidelineBoxDo]}>
            <Text style={[styles.guidelineTitle, styles.guidelineTitleDo]}>Wel doen</Text>
            {result.toneOfVoice?.doList?.map((item, i) => (
              <Text key={i} style={styles.guidelineItem}>— {item}</Text>
            ))}
          </View>
          <View style={[styles.guidelineBox, styles.guidelineBoxDont]}>
            <Text style={[styles.guidelineTitle, styles.guidelineTitleDont]}>Niet doen</Text>
            {result.toneOfVoice?.dontList?.map((item, i) => (
              <Text key={i} style={styles.guidelineItem}>— {item}</Text>
            ))}
          </View>
        </View>

        {/* Tagline & boilerplate */}
        <View style={{ marginTop: 24 }}>
          <Text style={styles.label}>Tagline</Text>
          <Text style={{ fontSize: 18, fontWeight: 700, color: "#0a0a0a", fontFamily: df }}>{result.toneOfVoice?.tagline}</Text>
        </View>
        {result.toneOfVoice?.boilerplate && (
          <View style={[styles.callout, { borderLeftColor: primary, marginTop: 16 }]}>
            <Text style={styles.calloutLabel}>Standaard bedrijfsbeschrijving</Text>
            <Text style={styles.calloutText}>{result.toneOfVoice.boilerplate}</Text>
          </View>
        )}

        {/* Voice examples */}
        {result.toneOfVoice?.examples?.length > 0 && (
          <View style={{ marginTop: 24 }}>
            <Text style={styles.label}>Voorbeeldzinnen</Text>
            {result.toneOfVoice.examples.map((ex) => (
              <View key={ex.context} style={{ marginBottom: 8 }}>
                <Text style={{ fontSize: 8, fontWeight: 700, color: "#a1a1aa", textTransform: "uppercase", letterSpacing: 1, fontFamily: bf }}>{ex.context}</Text>
                <Text style={{ fontSize: 10, color: "#3f3f46", fontFamily: bf, lineHeight: 1.5 }}>"{ex.example}"</Text>
              </View>
            ))}
          </View>
        )}
        <PageFooter label="Tone of Voice" num="11" styles={styles} />
      </Page>

      {/* ═══════ PAGE 12: BRAND VOICE & COPY ═══════ */}
      {result.brandVoiceExamples && (
        <Page size="A4" style={styles.page}>
          <SectionHead num="06 — COPY" title="Brand voice & copy" subtitle="Kant-en-klare teksten in jullie merkstijl" styles={styles} />

          <View style={styles.copyBlockDark}>
            <Text style={styles.copyLabelDark}>Website headline</Text>
            <Text style={styles.copyTextDisplay}>{result.brandVoiceExamples.heroHeadline}</Text>
            <Text style={styles.copyTextDarkSub}>{result.brandVoiceExamples.subHeadline}</Text>
          </View>

          <View style={styles.copyBlock}>
            <Text style={styles.copyLabel}>Over ons</Text>
            <Text style={styles.copyText}>{result.brandVoiceExamples.aboutUs}</Text>
          </View>

          <View style={styles.grid2}>
            <View style={[styles.copyBlock, { flex: 1 }]}>
              <Text style={styles.copyLabel}>Advertentietekst</Text>
              <Text style={styles.copyText}>{result.brandVoiceExamples.adCopy}</Text>
            </View>
            <View style={[styles.copyBlock, { flex: 1 }]}>
              <Text style={styles.copyLabel}>E-mail onderwerp</Text>
              <Text style={styles.copyText}>{result.brandVoiceExamples.emailSubjectLine}</Text>
            </View>
          </View>

          <View style={styles.copyBlock}>
            <Text style={styles.copyLabel}>Instagram caption</Text>
            <Text style={styles.copyText}>{result.brandVoiceExamples.instagramCaption}</Text>
          </View>

          <View style={{ padding: 18, backgroundColor: accent, borderRadius: 8, alignItems: "center", marginTop: 4 }}>
            <Text style={{ fontSize: 8, fontWeight: 700, color: isDark(accent) ? "#ffffff99" : "#00000099", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 6 }}>Call to action</Text>
            <Text style={{ fontSize: 14, fontWeight: 700, color: isDark(accent) ? "#ffffff" : "#0a0a0a", fontFamily: df }}>{result.brandVoiceExamples.callToAction}</Text>
          </View>
          <PageFooter label="Brand voice" num="12" styles={styles} />
        </Page>
      )}

      {/* ═══════ PAGE 13: BEELDTAAL & ICONOGRAFIE ═══════ */}
      <Page size="A4" style={styles.page}>
        <SectionHead num="07 — BEELD" title="Beeldtaal & Iconografie" subtitle="Richtlijnen voor fotografie, illustraties en iconen" styles={styles} />

        {/* Fotografie */}
        {result.imageryGuidelines && (
          <View style={{ marginBottom: 24 }}>
            <Text style={styles.label}>Fotografie</Text>
            <View style={styles.twoCol}>
              <View style={styles.col}>
                <Text style={{ fontSize: 9, fontWeight: 700, color: "#52525b", marginBottom: 4, fontFamily: bf }}>Stijl</Text>
                <Text style={{ fontSize: 10, color: "#3f3f46", lineHeight: 1.5, fontFamily: bf }}>{result.imageryGuidelines.photoStyle}</Text>
                <Text style={{ fontSize: 9, fontWeight: 700, color: "#52525b", marginBottom: 4, marginTop: 12, fontFamily: bf }}>Kleurbehandeling</Text>
                <Text style={{ fontSize: 10, color: "#3f3f46", lineHeight: 1.5, fontFamily: bf }}>{result.imageryGuidelines.colorTreatment}</Text>
              </View>
              <View style={styles.col}>
                <Text style={{ fontSize: 9, fontWeight: 700, color: "#52525b", marginBottom: 4, fontFamily: bf }}>Onderwerpen</Text>
                <Text style={{ fontSize: 10, color: "#3f3f46", lineHeight: 1.5, fontFamily: bf }}>{result.imageryGuidelines.subjects}</Text>
                <Text style={{ fontSize: 9, fontWeight: 700, color: "#52525b", marginBottom: 4, marginTop: 12, fontFamily: bf }}>Compositie</Text>
                <Text style={{ fontSize: 10, color: "#3f3f46", lineHeight: 1.5, fontFamily: bf }}>{result.imageryGuidelines.composition}</Text>
              </View>
            </View>

            <View style={[styles.grid2, { marginTop: 16 }]}>
              <View style={[styles.guidelineBox, styles.guidelineBoxDo]}>
                <Text style={[styles.guidelineTitle, styles.guidelineTitleDo]}>Wel</Text>
                {result.imageryGuidelines.doList?.map((item, i) => (
                  <Text key={i} style={styles.guidelineItem}>— {item}</Text>
                ))}
              </View>
              <View style={[styles.guidelineBox, styles.guidelineBoxDont]}>
                <Text style={[styles.guidelineTitle, styles.guidelineTitleDont]}>Niet</Text>
                {result.imageryGuidelines.dontList?.map((item, i) => (
                  <Text key={i} style={styles.guidelineItem}>— {item}</Text>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Iconografie */}
        {result.iconographyGuidelines && (
          <View>
            <Text style={styles.label}>Iconografie</Text>
            <View style={{ padding: 16, backgroundColor: "#fafafa", borderRadius: 8 }}>
              <View style={[styles.grid2, { marginBottom: 0 }]}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 9, fontWeight: 700, color: "#52525b", marginBottom: 4, fontFamily: bf }}>Stijl</Text>
                  <Text style={{ fontSize: 10, color: "#3f3f46", fontFamily: bf }}>{result.iconographyGuidelines.style}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 9, fontWeight: 700, color: "#52525b", marginBottom: 4, fontFamily: bf }}>Lijndikte</Text>
                  <Text style={{ fontSize: 10, color: "#3f3f46", fontFamily: bf }}>{result.iconographyGuidelines.strokeWidth}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 9, fontWeight: 700, color: "#52525b", marginBottom: 4, fontFamily: bf }}>Hoeken</Text>
                  <Text style={{ fontSize: 10, color: "#3f3f46", fontFamily: bf }}>{result.iconographyGuidelines.cornerStyle}</Text>
                </View>
              </View>
              <Text style={{ fontSize: 10, color: "#3f3f46", marginTop: 12, lineHeight: 1.5, fontFamily: bf }}>{result.iconographyGuidelines.colorUsage}</Text>
            </View>
          </View>
        )}
        <PageFooter label="Beeldtaal" num="13" styles={styles} />
      </Page>

      {/* ═══════ PAGE 14: GRAFISCHE ELEMENTEN ═══════ */}
      {result.graphicElements && (
        <Page size="A4" style={styles.page}>
          <SectionHead num="08 — GRAFISCH" title="Grafische elementen" subtitle="Visuele signature elementen die het merk herkenbaar maken" styles={styles} />

          <Text style={styles.bodyText}>{result.graphicElements.description}</Text>

          <View style={[styles.twoCol, { marginTop: 24 }]}>
            <View style={styles.col}>
              <Text style={styles.label}>Vormen</Text>
              <Text style={{ fontSize: 10, color: "#3f3f46", lineHeight: 1.5, fontFamily: bf }}>{result.graphicElements.shapes}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Patronen</Text>
              <Text style={{ fontSize: 10, color: "#3f3f46", lineHeight: 1.5, fontFamily: bf }}>{result.graphicElements.patterns}</Text>
            </View>
          </View>

          <View style={[styles.callout, { borderLeftColor: primary, marginTop: 24 }]}>
            <Text style={styles.calloutLabel}>Toepassing</Text>
            <Text style={styles.calloutText}>{result.graphicElements.usage}</Text>
          </View>
          <PageFooter label="Grafische elementen" num="14" styles={styles} />
        </Page>
      )}

      {/* ═══════ PAGE 15: MERKTOEPASSINGEN ═══════ */}
      <Page size="A4" style={styles.page}>
        <SectionHead num="09 — TOEPASSING" title="Merktoepassingen" subtitle="Zo ziet jullie merk eruit in de praktijk" styles={styles} />

        {/* Business card */}
        <Text style={styles.label}>Visitekaartje</Text>
        <View style={[styles.grid2, { marginBottom: 24 }]}>
          <View style={{ flex: 1, aspectRatio: 1.8, backgroundColor: primary, borderRadius: 8, padding: 16, justifyContent: "space-between" }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              {renderLogo("sm")}
              <Text style={{ color: "#ffffff", fontSize: 11, fontWeight: 700, fontFamily: df }}>{result.companyName}</Text>
            </View>
            <Text style={{ color: "#ffffff99", fontSize: 8 }}>{result.toneOfVoice?.tagline ?? result.tagline}</Text>
          </View>
          <View style={{ flex: 1, aspectRatio: 1.8, backgroundColor: "#fafafa", borderRadius: 8, padding: 16, borderLeftWidth: 3, borderLeftColor: primary, justifyContent: "center" }}>
            <Text style={{ fontSize: 10, fontWeight: 700, color: "#0a0a0a", marginBottom: 2 }}>Voornaam Achternaam</Text>
            <Text style={{ fontSize: 8, color: accent, marginBottom: 8 }}>Functietitel</Text>
            <Text style={{ fontSize: 7, color: "#71717a" }}>naam@bedrijf.nl</Text>
            <Text style={{ fontSize: 7, color: "#71717a" }}>+31 6 12 34 56 78</Text>
            <Text style={{ fontSize: 7, color: "#71717a" }}>bedrijf.nl</Text>
          </View>
        </View>

        {/* Email signature */}
        <Text style={styles.label}>E-mailhandtekening</Text>
        <View style={{ padding: 16, backgroundColor: "#ffffff", borderRadius: 8, borderWidth: 1, borderColor: "#e5e5e5", flexDirection: "row", gap: 14, marginBottom: 20 }}>
          {renderLogo("sm")}
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 11, fontWeight: 700, color: "#0a0a0a" }}>Voornaam Achternaam</Text>
            <Text style={{ fontSize: 9, color: accent, marginTop: 2 }}>Functietitel · {result.companyName}</Text>
            <View style={{ width: 24, height: 2, backgroundColor: primary, marginVertical: 6, borderRadius: 1 }} />
            <Text style={{ fontSize: 8, color: "#71717a" }}>naam@bedrijf.nl  ·  +31 6 12 34 56 78  ·  bedrijf.nl</Text>
          </View>
        </View>

        {/* Touchpoint descriptions */}
        {result.usageExamples && (
          <View style={{ marginTop: 8 }}>
            <Text style={styles.label}>Overige toepassingen</Text>
            {(["socialPost", "letterhead", "presentationSlide", "websiteHeader", "merchandise"] as const).map((key) => {
              const val = result.usageExamples?.[key];
              if (!val) return null;
              const labels: Record<string, string> = { socialPost: "Social media", letterhead: "Briefpapier", presentationSlide: "Presentatie", websiteHeader: "Website header", merchandise: "Merchandise" };
              return (
                <View key={key} style={{ marginBottom: 8 }}>
                  <Text style={{ fontSize: 9, fontWeight: 700, color: "#52525b", fontFamily: bf }}>{labels[key]}</Text>
                  <Text style={{ fontSize: 9, color: "#3f3f46", lineHeight: 1.4, fontFamily: bf }}>{val}</Text>
                </View>
              );
            })}
          </View>
        )}
        <PageFooter label="Toepassingen" num="15" styles={styles} />
      </Page>

      {/* ═══════ PAGE 16–17: MOCKUPS ═══════ */}
      {(() => {
        const mp: MockupProps = {
          companyName: result.companyName,
          tagline: result.toneOfVoice?.tagline ?? result.tagline ?? "",
          primary,
          secondary: byCategory(result, "secondary")[0]?.hex ?? accent,
          accent,
          darkNeutral: byCategory(result, "neutral").find(c => isDark(c.hex))?.hex ?? "#1a1a1a",
          lightNeutral: byCategory(result, "neutral").find(c => !isDark(c.hex))?.hex ?? "#f5f5f5",
          displayFont: df,
          bodyFont: bf,
          logoDataUri,
          isDark,
        };
        return (
          <>
            <Page size="A4" style={styles.page}>
              <SectionHead num="10 — MOCKUPS" title="Visuele toepassingen" subtitle="Zo komt jullie merk tot leven op verschillende touchpoints" styles={styles} />
              <View style={styles.grid2}>
                <View style={{ flex: 1 }}>
                  <InstagramPostMockup {...mp} />
                  <Text style={[styles.logoLabel, { marginBottom: 16 }]}>Instagram post</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <SocialBannerMockup {...mp} />
                  <Text style={[styles.logoLabel, { marginBottom: 16 }]}>Social media profiel</Text>
                  <CoffeeCupMockup {...mp} />
                  <Text style={styles.logoLabel}>Koffiebeker</Text>
                </View>
              </View>
              <PageFooter label="Mockups" num="16" styles={styles} />
            </Page>

            <Page size="A4" style={styles.page}>
              <SectionHead num="10.1 — MOCKUPS" title="Digitaal & print" subtitle="Website, presentatie, briefpapier en factuur in jullie huisstijl" styles={styles} />
              <WebsiteMockup {...mp} />
              <Text style={[styles.logoLabel, { marginBottom: 16 }]}>Website</Text>
              <View style={styles.grid2}>
                <View style={{ flex: 1 }}>
                  <PresentationSlideMockup {...mp} />
                  <Text style={styles.logoLabel}>Presentatie titelslide</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <MerchandiseMockup {...mp} />
                  <Text style={styles.logoLabel}>Merchandise</Text>
                </View>
              </View>
              <PageFooter label="Mockups" num="17" styles={styles} />
            </Page>

            <Page size="A4" style={styles.page}>
              <SectionHead num="10.2 — MOCKUPS" title="Zakelijke documenten" subtitle="Briefpapier en factuur in jullie huisstijl" styles={styles} />
              <View style={styles.grid2}>
                <View style={{ flex: 1 }}>
                  <LetterheadMockup {...mp} />
                  <Text style={styles.logoLabel}>Briefpapier</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <InvoiceMockup {...mp} />
                  <Text style={styles.logoLabel}>Factuur</Text>
                </View>
              </View>
              <PageFooter label="Mockups" num="18" styles={styles} />
            </Page>
          </>
        );
      })()}

      {/* ═══════ BACK COVER ═══════ */}
      <Page size="A4" style={[styles.pageNoPadding, styles.backPage]}>
        <View>
          <Text style={styles.coverBrand}>Merkly</Text>
          <Text style={{ fontSize: 9, color: "#666666", marginTop: 6, letterSpacing: 1 }}>AI-GEGENEREERDE MERKIDENTITEIT</Text>
        </View>
        <View>
          <Text style={styles.backTitle}>Dit is pas het begin van {result.companyName}.</Text>
          <Text style={styles.backText}>
            Jullie hebben nu een complete huisstijl in handen. Blijf consistent in alles wat jullie maken en jullie merk groeit vanzelf mee. Succes!
          </Text>
        </View>
        <View style={styles.backFooterRow}>
          <View>
            <Text style={{ fontSize: 9, color: "#666666" }}>Gemaakt met</Text>
            <Text style={{ fontSize: 16, fontWeight: 700, color: "#ffffff", fontFamily: df, marginTop: 2 }}>merkly.nl</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={{ fontSize: 9, color: "#666666" }}>Gegenereerd op</Text>
            <Text style={{ fontSize: 11, color: "#ffffff", marginTop: 2 }}>{today}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

/* ─────────────────────────────────────────────────────────────
   PUBLIC API
   ───────────────────────────────────────────────────────────── */

export async function generateBrandBookPDF(
  result: BrandGuideResult
): Promise<Buffer> {
  const df_name = displayFont(result);
  const bf_name = bodyFontName(result);

  const [displayOk, bodyOk] = await Promise.all([
    registerGoogleFont(df_name),
    registerGoogleFont(bf_name),
  ]);

  const df = displayOk ? df_name : "Helvetica";
  const bf = bodyOk ? bf_name : "Helvetica";

  const [logoDataUri, logoWhiteUri, logoPrimaryUri] = await Promise.all([
    fetchLogoDataUri(result.logoImageUrl, result.logoVariants?.fullColor),
    result.logoVariants?.monoWhite
      ? svgToPngDataUri(result.logoVariants.monoWhite)
      : Promise.resolve(null),
    result.logoVariants?.monoPrimary
      ? svgToPngDataUri(result.logoVariants.monoPrimary)
      : Promise.resolve(null),
  ]);

  const doc = (
    <BrandBookDocument
      result={result}
      logoDataUri={logoDataUri}
      logoWhiteUri={logoWhiteUri}
      logoPrimaryUri={logoPrimaryUri}
      df={df}
      bf={bf}
    />
  );

  const stream = await pdf(doc).toBuffer();

  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on("data", (chunk: Buffer) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
}
