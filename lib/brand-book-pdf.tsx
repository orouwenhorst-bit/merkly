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
import { BrandGuideResult } from "@/types/brand";

/* ─────────────────────────────────────────────────────────────
   FONT REGISTRATION
   Fetches Google Fonts CSS, extracts .ttf URLs, registers them.
   Falls back silently if a font can't be loaded.
   ───────────────────────────────────────────────────────────── */

const registeredFonts = new Set<string>();

async function registerGoogleFont(fontName: string): Promise<boolean> {
  if (registeredFonts.has(fontName)) return true;
  try {
    const cssUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
      fontName
    )}:wght@400;700&display=swap`;
    // Use an old user-agent so Google serves .ttf (react-pdf can't parse woff2)
    const res = await fetch(cssUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:27.0) Gecko/20100101 Firefox/27.0",
      },
    });
    if (!res.ok) return false;
    const css = await res.text();

    // Extract each @font-face block and pair its weight with the ttf URL.
    const blocks = css.split("@font-face");
    const fonts: { src: string; fontWeight?: number }[] = [];
    for (const block of blocks) {
      const urlMatch = block.match(/url\((https:\/\/[^)]+\.ttf)\)/);
      const weightMatch = block.match(/font-weight:\s*(\d+)/);
      if (urlMatch) {
        fonts.push({
          src: urlMatch[1],
          fontWeight: weightMatch ? parseInt(weightMatch[1], 10) : 400,
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
   Fetches the logo URL and returns a data URI the PDF can use.
   ───────────────────────────────────────────────────────────── */

async function fetchLogoDataUri(url: string | undefined): Promise<string | null> {
  if (!url) return null;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const contentType = res.headers.get("content-type") || "image/png";
    // react-pdf can't render SVG via <Image>. If it's SVG, skip and return null
    // — the caller falls back to rendering the iconSvg through the <Svg> API.
    if (contentType.includes("svg")) return null;
    const buf = Buffer.from(await res.arrayBuffer());
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

function rgbString(hex: string): string {
  const { r, g, b } = hexToRgb(hex);
  return `${r}, ${g}, ${b}`;
}

function hexToCmyk(hex: string): string {
  const { r, g, b } = hexToRgb(hex);
  const rN = r / 255;
  const gN = g / 255;
  const bN = b / 255;
  const k = 1 - Math.max(rN, gN, bN);
  if (k === 1) return "0, 0, 0, 100";
  const c = (1 - rN - k) / (1 - k);
  const m = (1 - gN - k) / (1 - k);
  const y = (1 - bN - k) / (1 - k);
  return `${Math.round(c * 100)}, ${Math.round(m * 100)}, ${Math.round(
    y * 100
  )}, ${Math.round(k * 100)}`;
}

function isDark(hex: string): boolean {
  const { r, g, b } = hexToRgb(hex);
  return (r * 299 + g * 587 + b * 114) / 1000 < 128;
}

/* ─────────────────────────────────────────────────────────────
   PDF COMPONENTS
   ───────────────────────────────────────────────────────────── */

type PdfProps = {
  result: BrandGuideResult;
  logoDataUri: string | null;
  displayFont: string;
  bodyFont: string;
};

function buildStyles({ displayFont, bodyFont }: { displayFont: string; bodyFont: string }) {
  return StyleSheet.create({
    page: {
      paddingTop: 50,
      paddingBottom: 50,
      paddingHorizontal: 50,
      backgroundColor: "#ffffff",
      fontFamily: bodyFont,
      fontSize: 10,
      color: "#1a1a1a",
      lineHeight: 1.5,
    },
    pageNoPadding: {
      backgroundColor: "#ffffff",
    },
    // Cover
    coverPage: {
      backgroundColor: "#0a0a0a",
      paddingTop: 60,
      paddingBottom: 60,
      paddingHorizontal: 60,
      color: "#ffffff",
    },
    coverTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    coverBrand: {
      fontSize: 10,
      color: "#ffffff",
      letterSpacing: 2,
      textTransform: "uppercase",
      fontFamily: bodyFont,
      fontWeight: 700,
    },
    coverDate: {
      fontSize: 9,
      color: "#888888",
      fontFamily: bodyFont,
    },
    coverCenter: {
      flex: 1,
      justifyContent: "center",
    },
    coverLabel: {
      fontSize: 10,
      color: "#a1a1aa",
      letterSpacing: 3,
      textTransform: "uppercase",
      marginBottom: 18,
      fontFamily: bodyFont,
      fontWeight: 700,
    },
    coverTitle: {
      fontSize: 64,
      fontWeight: 700,
      color: "#ffffff",
      letterSpacing: -1.5,
      lineHeight: 1.05,
      fontFamily: displayFont,
    },
    coverTagline: {
      fontSize: 14,
      color: "#a1a1aa",
      marginTop: 20,
      maxWidth: 380,
      fontFamily: bodyFont,
      lineHeight: 1.5,
    },
    coverColorStrip: {
      flexDirection: "row",
      height: 6,
      marginTop: 30,
      borderRadius: 3,
      overflow: "hidden",
    },
    coverBottom: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
      marginTop: 30,
    },
    coverFooter: {
      fontSize: 9,
      color: "#666666",
      fontFamily: bodyFont,
    },
    // Section header
    sectionNum: {
      fontSize: 9,
      fontFamily: bodyFont,
      color: "#a1a1aa",
      letterSpacing: 2,
      marginBottom: 4,
    },
    sectionTitle: {
      fontSize: 32,
      fontWeight: 700,
      color: "#0a0a0a",
      letterSpacing: -0.5,
      fontFamily: displayFont,
      marginBottom: 8,
    },
    sectionSubtitle: {
      fontSize: 11,
      color: "#71717a",
      marginBottom: 30,
      fontFamily: bodyFont,
      maxWidth: 450,
    },
    sectionDivider: {
      height: 1,
      backgroundColor: "#e5e5e5",
      marginBottom: 30,
    },
    // Body text
    bodyText: {
      fontSize: 11,
      lineHeight: 1.7,
      color: "#3f3f46",
      fontFamily: bodyFont,
    },
    // Generic labels
    label: {
      fontSize: 8,
      fontWeight: 700,
      color: "#71717a",
      textTransform: "uppercase",
      letterSpacing: 1.5,
      marginBottom: 6,
      fontFamily: bodyFont,
    },
    // Personality tags
    tagRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 6,
      marginTop: 16,
    },
    tag: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
      backgroundColor: "#f4f4f5",
      fontSize: 9,
      color: "#3f3f46",
      fontWeight: 700,
      fontFamily: bodyFont,
    },
    // Two-column layout
    twoCol: {
      flexDirection: "row",
      gap: 24,
    },
    col: {
      flex: 1,
    },
    // Callout box
    callout: {
      backgroundColor: "#fafafa",
      borderLeftWidth: 3,
      padding: 16,
      marginTop: 20,
    },
    calloutLabel: {
      fontSize: 8,
      fontWeight: 700,
      color: "#52525b",
      textTransform: "uppercase",
      letterSpacing: 1.2,
      marginBottom: 6,
      fontFamily: bodyFont,
    },
    calloutText: {
      fontSize: 10,
      lineHeight: 1.5,
      color: "#52525b",
      fontFamily: bodyFont,
    },
    // Logo blocks
    logoBlock: {
      flex: 1,
      borderRadius: 8,
      padding: 24,
      alignItems: "center",
      justifyContent: "center",
      minHeight: 180,
    },
    logoImage: {
      width: 90,
      height: 90,
      objectFit: "contain",
    },
    logoImageSmall: {
      width: 36,
      height: 36,
      objectFit: "contain",
    },
    logoLabel: {
      fontSize: 8,
      marginTop: 14,
      color: "#a1a1aa",
      textTransform: "uppercase",
      letterSpacing: 1.2,
      fontFamily: bodyFont,
      fontWeight: 700,
    },
    logoCaption: {
      fontSize: 14,
      marginTop: 10,
      fontWeight: 700,
      fontFamily: displayFont,
    },
    // Grid
    grid2: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 12,
    },
    grid3: {
      flexDirection: "row",
      gap: 10,
      marginBottom: 10,
    },
    // Color palette
    colorRow: {
      flexDirection: "row",
      marginBottom: 14,
      borderRadius: 8,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: "#e5e5e5",
    },
    colorSwatch: {
      width: 120,
      height: 110,
    },
    colorInfo: {
      flex: 1,
      padding: 16,
      justifyContent: "center",
      backgroundColor: "#ffffff",
    },
    colorName: {
      fontSize: 14,
      fontWeight: 700,
      color: "#0a0a0a",
      fontFamily: displayFont,
      marginBottom: 4,
    },
    colorUsage: {
      fontSize: 9,
      color: "#71717a",
      marginBottom: 10,
      fontFamily: bodyFont,
      lineHeight: 1.4,
    },
    colorCodes: {
      flexDirection: "row",
      gap: 16,
    },
    colorCode: {
      fontSize: 8,
      color: "#3f3f46",
      fontFamily: "Courier",
    },
    // Typography showcase
    fontShowcase: {
      padding: 24,
      borderWidth: 1,
      borderColor: "#e5e5e5",
      borderRadius: 8,
      marginBottom: 16,
    },
    fontShowcaseLabel: {
      fontSize: 8,
      color: "#a1a1aa",
      textTransform: "uppercase",
      letterSpacing: 1.5,
      marginBottom: 16,
      fontFamily: bodyFont,
      fontWeight: 700,
    },
    fontShowcaseGiant: {
      fontSize: 56,
      fontWeight: 700,
      color: "#0a0a0a",
      marginBottom: 8,
    },
    fontShowcaseCompany: {
      fontSize: 22,
      fontWeight: 700,
      color: "#0a0a0a",
      marginBottom: 4,
    },
    fontShowcaseTagline: {
      fontSize: 11,
      color: "#71717a",
    },
    fontShowcaseParagraph: {
      fontSize: 10,
      color: "#3f3f46",
      lineHeight: 1.6,
      marginTop: 12,
    },
    alphabet: {
      fontSize: 9,
      color: "#71717a",
      marginTop: 14,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: "#e5e5e5",
      lineHeight: 1.6,
    },
    fontUsage: {
      fontSize: 8,
      color: "#a1a1aa",
      marginTop: 10,
      fontFamily: bodyFont,
    },
    // Voice & copy
    copyBlock: {
      padding: 18,
      backgroundColor: "#fafafa",
      borderRadius: 8,
      marginBottom: 10,
    },
    copyBlockDark: {
      padding: 20,
      backgroundColor: "#0a0a0a",
      borderRadius: 8,
      marginBottom: 12,
    },
    copyLabel: {
      fontSize: 8,
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: 1.2,
      color: "#a1a1aa",
      marginBottom: 8,
      fontFamily: bodyFont,
    },
    copyLabelDark: {
      fontSize: 8,
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: 1.2,
      color: "#71717a",
      marginBottom: 8,
      fontFamily: bodyFont,
    },
    copyText: {
      fontSize: 11,
      color: "#1a1a1a",
      lineHeight: 1.5,
      fontFamily: bodyFont,
    },
    copyTextDisplay: {
      fontSize: 22,
      color: "#ffffff",
      lineHeight: 1.2,
      fontFamily: displayFont,
      fontWeight: 700,
    },
    copyTextDarkSub: {
      fontSize: 10,
      color: "#a1a1aa",
      marginTop: 8,
      fontFamily: bodyFont,
    },
    // Guidelines
    guidelineBox: {
      flex: 1,
      padding: 18,
      borderRadius: 8,
      borderWidth: 1,
    },
    guidelineBoxDo: {
      borderColor: "#86efac",
      backgroundColor: "#f0fdf4",
    },
    guidelineBoxDont: {
      borderColor: "#fca5a5",
      backgroundColor: "#fef2f2",
    },
    guidelineTitle: {
      fontSize: 11,
      fontWeight: 700,
      marginBottom: 10,
      fontFamily: bodyFont,
    },
    guidelineTitleDo: { color: "#15803d" },
    guidelineTitleDont: { color: "#b91c1c" },
    guidelineItem: {
      fontSize: 9,
      color: "#3f3f46",
      marginBottom: 6,
      lineHeight: 1.4,
      fontFamily: bodyFont,
    },
    // Back cover
    backPage: {
      backgroundColor: "#0a0a0a",
      padding: 60,
      justifyContent: "space-between",
      color: "#ffffff",
    },
    backTitle: {
      fontSize: 40,
      fontWeight: 700,
      color: "#ffffff",
      fontFamily: displayFont,
      letterSpacing: -1,
      maxWidth: 400,
    },
    backText: {
      fontSize: 11,
      color: "#a1a1aa",
      marginTop: 18,
      maxWidth: 400,
      lineHeight: 1.6,
    },
    backFooterRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
      paddingTop: 30,
      borderTopWidth: 1,
      borderTopColor: "#27272a",
    },
    pageFooter: {
      position: "absolute",
      bottom: 25,
      left: 50,
      right: 50,
      flexDirection: "row",
      justifyContent: "space-between",
      fontSize: 8,
      color: "#a1a1aa",
      fontFamily: bodyFont,
    },
  });
}

/* ─── Reusable page-level header ─── */
function SectionHead({
  num,
  title,
  subtitle,
  styles,
}: {
  num: string;
  title: string;
  subtitle?: string;
  styles: ReturnType<typeof buildStyles>;
}) {
  return (
    <View>
      <Text style={styles.sectionNum}>{num}</Text>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
      <View style={styles.sectionDivider} />
    </View>
  );
}

function PageFooter({
  label,
  num,
  styles,
}: {
  label: string;
  num: string;
  styles: ReturnType<typeof buildStyles>;
}) {
  return (
    <View style={styles.pageFooter} fixed>
      <Text>{label}</Text>
      <Text>Merkly — merkly.nl</Text>
      <Text>{num}</Text>
    </View>
  );
}

/* ─────────────────────────────────────────────────────────────
   THE DOCUMENT
   ───────────────────────────────────────────────────────────── */

function BrandBookDocument({ result, logoDataUri, displayFont, bodyFont }: PdfProps) {
  const styles = buildStyles({ displayFont, bodyFont });
  const primary = result.colorPalette[0]?.hex ?? "#0a0a0a";
  const accent = result.colorPalette[4]?.hex ?? result.colorPalette[1]?.hex ?? "#888";
  const secondary = result.colorPalette[1]?.hex ?? "#444";
  const today = new Date().toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const renderLogo = (size: "sm" | "lg" = "lg") => {
    if (logoDataUri) {
      return (
        <Image
          src={logoDataUri}
          style={size === "lg" ? styles.logoImage : styles.logoImageSmall}
        />
      );
    }
    // Fallback: a simple circle with the company initial if no image available
    const initial = (result.companyName[0] ?? "•").toUpperCase();
    return (
      <View
        style={{
          width: size === "lg" ? 90 : 36,
          height: size === "lg" ? 90 : 36,
          backgroundColor: primary,
          borderRadius: 100,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            color: "#ffffff",
            fontSize: size === "lg" ? 48 : 18,
            fontWeight: 700,
            fontFamily: displayFont,
          }}
        >
          {initial}
        </Text>
      </View>
    );
  };

  return (
    <Document
      title={`${result.companyName} — Huisstijl`}
      author="Merkly"
      subject="Brand guide"
    >
      {/* ───── PAGE 1: COVER ───── */}
      <Page size="A4" style={[styles.pageNoPadding, styles.coverPage]}>
        <View style={styles.coverTop}>
          <Text style={styles.coverBrand}>Merkly</Text>
          <Text style={styles.coverDate}>{today}</Text>
        </View>
        <View style={styles.coverCenter}>
          <Text style={styles.coverLabel}>Huisstijl & Merkrichtlijnen</Text>
          <Text style={styles.coverTitle}>{result.companyName}</Text>
          <Text style={styles.coverTagline}>{result.tagline}</Text>
          <View style={styles.coverColorStrip}>
            {result.colorPalette.map((c) => (
              <View
                key={c.hex}
                style={{ flex: 1, height: 6, backgroundColor: c.hex }}
              />
            ))}
          </View>
        </View>
        <View style={styles.coverBottom}>
          <Text style={styles.coverFooter}>
            Gegenereerd met Merkly — merkly.nl
          </Text>
          <Text style={styles.coverFooter}>Vertrouwelijk</Text>
        </View>
      </Page>

      {/* ───── PAGE 2: MERKVERHAAL ───── */}
      <Page size="A4" style={styles.page}>
        <SectionHead
          num="01 — INTRO"
          title="Merkverhaal"
          subtitle="De kern van wie jullie zijn en waarom jullie bestaan"
          styles={styles}
        />
        <Text style={styles.bodyText}>{result.brandStory}</Text>

        <View style={[styles.callout, { borderLeftColor: primary }]}>
          <Text style={styles.calloutLabel}>Tone of Voice</Text>
          <Text style={styles.calloutText}>{result.toneOfVoice}</Text>
        </View>

        <View style={{ marginTop: 24 }}>
          <Text style={styles.label}>Merkpersoonlijkheid</Text>
          <View style={styles.tagRow}>
            {result.brandPersonality.map((word) => (
              <Text key={word} style={styles.tag}>
                {word}
              </Text>
            ))}
          </View>
        </View>
        <PageFooter label="Merkverhaal" num="02" styles={styles} />
      </Page>

      {/* ───── PAGE 3: LOGO PRIMAIR ───── */}
      <Page size="A4" style={styles.page}>
        <SectionHead
          num="02 — LOGO"
          title="Primair merkteken"
          subtitle="Het hart van jullie visuele identiteit"
          styles={styles}
        />

        <View
          style={[
            styles.logoBlock,
            {
              backgroundColor: "#ffffff",
              borderWidth: 1,
              borderColor: "#e5e5e5",
              minHeight: 260,
            },
          ]}
        >
          {renderLogo("lg")}
          <Text style={styles.logoCaption}>{result.companyName}</Text>
          <Text style={{ fontSize: 10, color: "#71717a", marginTop: 4 }}>
            {result.tagline}
          </Text>
        </View>

        <View style={{ marginTop: 20 }}>
          <Text style={styles.label}>Primaire kleur</Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              marginTop: 8,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                backgroundColor: primary,
                borderRadius: 6,
                borderWidth: 1,
                borderColor: "#e5e5e5",
              }}
            />
            <View>
              <Text
                style={{ fontSize: 11, fontFamily: "Courier", color: "#1a1a1a" }}
              >
                {primary.toUpperCase()}
              </Text>
              <Text style={{ fontSize: 9, color: "#71717a", marginTop: 2 }}>
                RGB {rgbString(primary)}  ·  CMYK {hexToCmyk(primary)}
              </Text>
            </View>
          </View>
        </View>
        <PageFooter label="Logo — Primair" num="03" styles={styles} />
      </Page>

      {/* ───── PAGE 4: LOGO VARIATIES ───── */}
      <Page size="A4" style={styles.page}>
        <SectionHead
          num="02.1 — LOGO VARIANTEN"
          title="Logo-variaties"
          subtitle="Verschillende toepassingen voor verschillende contexten"
          styles={styles}
        />

        {/* Horizontal lockup */}
        <View
          style={[
            styles.logoBlock,
            {
              backgroundColor: "#ffffff",
              borderWidth: 1,
              borderColor: "#e5e5e5",
              flexDirection: "row",
              gap: 16,
              minHeight: 130,
            },
          ]}
        >
          {renderLogo("sm")}
          <View>
            <Text
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: primary,
                fontFamily: displayFont,
              }}
            >
              {result.companyName}
            </Text>
            <Text style={{ fontSize: 9, color: "#71717a", marginTop: 2 }}>
              {result.tagline}
            </Text>
          </View>
        </View>
        <Text style={styles.logoLabel}>Horizontale lockup</Text>

        {/* Two small variations side by side */}
        <View style={[styles.grid2, { marginTop: 20 }]}>
          {/* Vertical lockup */}
          <View style={{ flex: 1 }}>
            <View
              style={[
                styles.logoBlock,
                {
                  backgroundColor: "#ffffff",
                  borderWidth: 1,
                  borderColor: "#e5e5e5",
                  minHeight: 150,
                },
              ]}
            >
              {renderLogo("sm")}
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: primary,
                  marginTop: 10,
                  fontFamily: displayFont,
                }}
              >
                {result.companyName}
              </Text>
            </View>
            <Text style={styles.logoLabel}>Verticale lockup</Text>
          </View>

          {/* Wordmark only */}
          <View style={{ flex: 1 }}>
            <View
              style={[
                styles.logoBlock,
                {
                  backgroundColor: "#ffffff",
                  borderWidth: 1,
                  borderColor: "#e5e5e5",
                  minHeight: 150,
                },
              ]}
            >
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: primary,
                  fontFamily: displayFont,
                  letterSpacing: -0.5,
                }}
              >
                {result.companyName}
              </Text>
            </View>
            <Text style={styles.logoLabel}>Woordmerk</Text>
          </View>
        </View>

        {/* Inverted on brand color + dark */}
        <View style={[styles.grid2, { marginTop: 20 }]}>
          <View style={{ flex: 1 }}>
            <View
              style={[
                styles.logoBlock,
                { backgroundColor: primary, minHeight: 150 },
              ]}
            >
              {renderLogo("sm")}
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#ffffff",
                  marginTop: 10,
                  fontFamily: displayFont,
                }}
              >
                {result.companyName}
              </Text>
            </View>
            <Text style={styles.logoLabel}>Op merkkleur</Text>
          </View>

          <View style={{ flex: 1 }}>
            <View
              style={[
                styles.logoBlock,
                { backgroundColor: "#0a0a0a", minHeight: 150 },
              ]}
            >
              {renderLogo("sm")}
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#ffffff",
                  marginTop: 10,
                  fontFamily: displayFont,
                }}
              >
                {result.companyName}
              </Text>
            </View>
            <Text style={styles.logoLabel}>Op donkere achtergrond</Text>
          </View>
        </View>

        <PageFooter label="Logo — Variaties" num="04" styles={styles} />
      </Page>

      {/* ───── PAGE 5: LOGO RICHTLIJNEN ───── */}
      <Page size="A4" style={styles.page}>
        <SectionHead
          num="02.2 — RICHTLIJNEN"
          title="Logo-richtlijnen"
          subtitle="Regels voor consistent logogebruik"
          styles={styles}
        />

        <View style={[styles.grid2]}>
          <View style={[styles.guidelineBox, styles.guidelineBoxDo]}>
            <Text style={[styles.guidelineTitle, styles.guidelineTitleDo]}>
              ✓  Wel doen
            </Text>
            {result.logoGuidelines.doList.map((item, i) => (
              <Text key={i} style={styles.guidelineItem}>
                —  {item}
              </Text>
            ))}
          </View>

          <View style={[styles.guidelineBox, styles.guidelineBoxDont]}>
            <Text style={[styles.guidelineTitle, styles.guidelineTitleDont]}>
              ✗  Niet doen
            </Text>
            {result.logoGuidelines.dontList.map((item, i) => (
              <Text key={i} style={styles.guidelineItem}>
                —  {item}
              </Text>
            ))}
          </View>
        </View>

        <View style={[styles.callout, { borderLeftColor: primary, marginTop: 30 }]}>
          <Text style={styles.calloutLabel}>Minimum formaat</Text>
          <Text style={styles.calloutText}>
            Gebruik het primaire merkteken nooit kleiner dan 24 pixels (digitaal) of
            10 mm (print). Bewaar altijd een veiligheidszone rond het logo ter
            grootte van minimaal de hoogte van het merkteken zelf.
          </Text>
        </View>

        <PageFooter label="Logo — Richtlijnen" num="05" styles={styles} />
      </Page>

      {/* ───── PAGE 6: KLEURENPALET ───── */}
      <Page size="A4" style={styles.page}>
        <SectionHead
          num="03 — KLEUR"
          title="Kleurenpalet"
          subtitle={`${result.colorPalette.length} kleuren die samen jullie merkidentiteit vormen`}
          styles={styles}
        />

        {result.colorPalette.map((color, idx) => (
          <View key={color.hex} style={styles.colorRow}>
            <View style={[styles.colorSwatch, { backgroundColor: color.hex }]} />
            <View style={styles.colorInfo}>
              <Text style={styles.colorName}>
                {idx === 0 ? "★  " : ""}
                {color.name}
              </Text>
              <Text style={styles.colorUsage}>{color.usage}</Text>
              <View style={styles.colorCodes}>
                <Text style={styles.colorCode}>HEX  {color.hex.toUpperCase()}</Text>
                <Text style={styles.colorCode}>RGB  {rgbString(color.hex)}</Text>
                <Text style={styles.colorCode}>CMYK  {hexToCmyk(color.hex)}</Text>
              </View>
            </View>
          </View>
        ))}

        <PageFooter label="Kleurenpalet" num="06" styles={styles} />
      </Page>

      {/* ───── PAGE 7: TYPOGRAFIE ───── */}
      <Page size="A4" style={styles.page}>
        <SectionHead
          num="04 — TYPOGRAFIE"
          title="Lettertypes"
          subtitle="De stem van jullie merk in geschreven vorm"
          styles={styles}
        />

        {/* Display font showcase */}
        <View style={styles.fontShowcase}>
          <Text style={styles.fontShowcaseLabel}>
            Display — {result.typography.displayFont}
          </Text>
          <Text style={[styles.fontShowcaseGiant, { fontFamily: displayFont }]}>
            Aa
          </Text>
          <Text style={[styles.fontShowcaseCompany, { fontFamily: displayFont }]}>
            {result.companyName}
          </Text>
          <Text style={styles.fontShowcaseTagline}>{result.tagline}</Text>
          <Text style={[styles.alphabet, { fontFamily: displayFont }]}>
            ABCDEFGHIJKLMNOPQRSTUVWXYZ{"\n"}
            abcdefghijklmnopqrstuvwxyz{"\n"}
            0123456789 !@#$%&
          </Text>
          <Text style={styles.fontUsage}>{result.typography.displayUsage}</Text>
        </View>

        {/* Body font showcase */}
        <View style={styles.fontShowcase}>
          <Text style={styles.fontShowcaseLabel}>
            Body — {result.typography.bodyFont}
          </Text>
          <Text style={[styles.fontShowcaseParagraph, { fontFamily: bodyFont }]}>
            {result.brandStory.length > 280
              ? result.brandStory.slice(0, 280) + "…"
              : result.brandStory}
          </Text>
          <Text style={[styles.alphabet, { fontFamily: bodyFont }]}>
            ABCDEFGHIJKLMNOPQRSTUVWXYZ{"\n"}
            abcdefghijklmnopqrstuvwxyz{"\n"}
            0123456789 !@#$%&
          </Text>
          <Text style={styles.fontUsage}>{result.typography.bodyUsage}</Text>
        </View>

        <PageFooter label="Typografie" num="07" styles={styles} />
      </Page>

      {/* ───── PAGE 8: BRAND VOICE ───── */}
      {result.brandVoiceExamples && (
        <Page size="A4" style={styles.page}>
          <SectionHead
            num="05 — VOICE"
            title="Brand voice & copy"
            subtitle="Kant-en-klare teksten in jullie merkstijl"
            styles={styles}
          />

          {/* Hero headline block */}
          <View style={styles.copyBlockDark}>
            <Text style={styles.copyLabelDark}>Website headline</Text>
            <Text style={styles.copyTextDisplay}>
              {result.brandVoiceExamples.heroHeadline}
            </Text>
            <Text style={styles.copyTextDarkSub}>
              {result.brandVoiceExamples.subHeadline}
            </Text>
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
              <Text style={styles.copyText}>
                {result.brandVoiceExamples.emailSubjectLine}
              </Text>
            </View>
          </View>

          <View style={styles.copyBlock}>
            <Text style={styles.copyLabel}>Instagram caption</Text>
            <Text style={styles.copyText}>
              {result.brandVoiceExamples.instagramCaption}
            </Text>
          </View>

          <View
            style={{
              padding: 18,
              backgroundColor: accent,
              borderRadius: 8,
              alignItems: "center",
              marginTop: 4,
            }}
          >
            <Text
              style={{
                fontSize: 8,
                fontWeight: 700,
                color: isDark(accent) ? "#ffffff99" : "#00000099",
                textTransform: "uppercase",
                letterSpacing: 1.2,
                marginBottom: 6,
              }}
            >
              Call to action
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: isDark(accent) ? "#ffffff" : "#0a0a0a",
                fontFamily: displayFont,
              }}
            >
              {result.brandVoiceExamples.callToAction}
            </Text>
          </View>

          <PageFooter label="Brand voice" num="08" styles={styles} />
        </Page>
      )}

      {/* ───── PAGE 9: TOEPASSINGEN ───── */}
      <Page size="A4" style={styles.page}>
        <SectionHead
          num="06 — TOEPASSING"
          title="Merktoepassing"
          subtitle="Zo ziet jullie merk eruit in de praktijk"
          styles={styles}
        />

        {/* Business card */}
        <Text style={styles.label}>Visitekaartje</Text>
        <View style={[styles.grid2, { marginBottom: 24 }]}>
          {/* Front */}
          <View
            style={{
              flex: 1,
              aspectRatio: 1.8,
              backgroundColor: primary,
              borderRadius: 8,
              padding: 16,
              justifyContent: "space-between",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
              }}
            >
              {renderLogo("sm")}
              <Text
                style={{
                  color: "#ffffff",
                  fontSize: 11,
                  fontWeight: 700,
                  fontFamily: displayFont,
                }}
              >
                {result.companyName}
              </Text>
            </View>
            <Text style={{ color: "#ffffff99", fontSize: 8 }}>
              {result.tagline}
            </Text>
          </View>
          {/* Back */}
          <View
            style={{
              flex: 1,
              aspectRatio: 1.8,
              backgroundColor: "#fafafa",
              borderRadius: 8,
              padding: 16,
              borderLeftWidth: 3,
              borderLeftColor: primary,
              justifyContent: "center",
            }}
          >
            <Text
              style={{ fontSize: 10, fontWeight: 700, color: "#0a0a0a", marginBottom: 2 }}
            >
              Voornaam Achternaam
            </Text>
            <Text style={{ fontSize: 8, color: secondary, marginBottom: 8 }}>
              Functietitel
            </Text>
            <Text style={{ fontSize: 7, color: "#71717a" }}>
              naam@bedrijf.nl
            </Text>
            <Text style={{ fontSize: 7, color: "#71717a" }}>+31 6 12 34 56 78</Text>
            <Text style={{ fontSize: 7, color: "#71717a" }}>bedrijf.nl</Text>
          </View>
        </View>

        {/* Email signature */}
        <Text style={styles.label}>E-mailhandtekening</Text>
        <View
          style={{
            padding: 16,
            backgroundColor: "#ffffff",
            borderRadius: 8,
            borderWidth: 1,
            borderColor: "#e5e5e5",
            flexDirection: "row",
            gap: 14,
            marginBottom: 20,
          }}
        >
          {renderLogo("sm")}
          <View style={{ flex: 1 }}>
            <Text
              style={{ fontSize: 11, fontWeight: 700, color: "#0a0a0a" }}
            >
              Voornaam Achternaam
            </Text>
            <Text style={{ fontSize: 9, color: secondary, marginTop: 2 }}>
              Functietitel · {result.companyName}
            </Text>
            <View
              style={{
                width: 24,
                height: 2,
                backgroundColor: primary,
                marginVertical: 6,
                borderRadius: 1,
              }}
            />
            <Text style={{ fontSize: 8, color: "#71717a" }}>
              naam@bedrijf.nl  ·  +31 6 12 34 56 78  ·  bedrijf.nl
            </Text>
          </View>
        </View>

        <PageFooter label="Toepassingen" num="09" styles={styles} />
      </Page>

      {/* ───── PAGE 10: BACK COVER ───── */}
      <Page size="A4" style={[styles.pageNoPadding, styles.backPage]}>
        <View>
          <Text style={styles.coverBrand}>Merkly</Text>
          <Text
            style={{
              fontSize: 9,
              color: "#666666",
              marginTop: 6,
              letterSpacing: 1,
            }}
          >
            AI-GEGENEREERDE MERKIDENTITEIT
          </Text>
        </View>

        <View>
          <Text style={styles.backTitle}>
            Dit is pas het begin van {result.companyName}.
          </Text>
          <Text style={styles.backText}>
            Jullie hebben nu een complete huisstijl in handen. Blijf consistent in
            alles wat jullie maken en jullie merk groeit vanzelf mee. Succes!
          </Text>
        </View>

        <View style={styles.backFooterRow}>
          <View>
            <Text style={{ fontSize: 9, color: "#666666" }}>Gemaakt met</Text>
            <Text
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "#ffffff",
                fontFamily: displayFont,
                marginTop: 2,
              }}
            >
              merkly.nl
            </Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={{ fontSize: 9, color: "#666666" }}>Gegenereerd op</Text>
            <Text style={{ fontSize: 11, color: "#ffffff", marginTop: 2 }}>
              {today}
            </Text>
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
  // Try to register the brand's display + body fonts. Falls back silently.
  const displayFontName = result.typography.displayFont;
  const bodyFontName = result.typography.bodyFont;

  const [displayOk, bodyOk] = await Promise.all([
    registerGoogleFont(displayFontName),
    registerGoogleFont(bodyFontName),
  ]);

  // Register built-in Helvetica as a safe fallback (always available in PDF).
  const displayFont = displayOk ? displayFontName : "Helvetica";
  const bodyFont = bodyOk ? bodyFontName : "Helvetica";

  // Fetch the logo image. PNGs/JPGs get embedded; SVGs fall back to the initial.
  const logoDataUri = await fetchLogoDataUri(result.logoImageUrl);

  const doc = (
    <BrandBookDocument
      result={result}
      logoDataUri={logoDataUri}
      displayFont={displayFont}
      bodyFont={bodyFont}
    />
  );

  const stream = await pdf(doc).toBuffer();

  // Collect stream into buffer
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on("data", (chunk: Buffer) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
}
