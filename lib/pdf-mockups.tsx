/* eslint-disable jsx-a11y/alt-text */
/**
 * Programmatische mockup templates voor de Brand Guide PDF.
 * Alle mockups worden gebouwd met @react-pdf/renderer primitieven
 * en nemen de merkidentiteit over (kleuren, fonts, logo, tagline).
 */
import React from "react";
import { View, Text, Image } from "@react-pdf/renderer";

export type MockupProps = {
  companyName: string;
  tagline: string;
  primary: string;
  secondary: string;
  accent: string;
  darkNeutral: string;
  lightNeutral: string;
  displayFont: string;
  bodyFont: string;
  logoDataUri: string | null;
  logoWhiteUri: string | null;
  isDark: (hex: string) => boolean;
};

/* ── Helpers ── */

function Logo({ src, size, fallbackColor, fallbackInitial, displayFont }: {
  src: string | null; size: number; fallbackColor: string; fallbackInitial: string; displayFont: string;
}) {
  if (src) return <Image src={src} style={{ width: size, height: size, objectFit: "contain" }} />;
  return (
    <View style={{ width: size, height: size, backgroundColor: fallbackColor, borderRadius: size, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ color: "#ffffff", fontSize: size * 0.5, fontWeight: 700, fontFamily: displayFont }}>{fallbackInitial}</Text>
    </View>
  );
}

/* ═══════════════════════════════════════════
   1. INSTAGRAM POST
   ═══════════════════════════════════════════ */

export function InstagramPostMockup(p: MockupProps) {
  return (
    <View style={{ width: "100%", borderRadius: 8, overflow: "hidden", borderWidth: 1, borderColor: "#e5e5e5" }}>
      {/* Phone frame header */}
      <View style={{ backgroundColor: "#ffffff", paddingHorizontal: 12, paddingVertical: 8, flexDirection: "row", alignItems: "center", gap: 8, borderBottomWidth: 1, borderBottomColor: "#f4f4f5" }}>
        <Logo src={p.logoDataUri} size={24} fallbackColor={p.primary} fallbackInitial={p.companyName[0]} displayFont={p.displayFont} />
        <Text style={{ fontSize: 9, fontWeight: 700, color: "#0a0a0a", fontFamily: p.bodyFont }}>{p.companyName.toLowerCase().replace(/\s+/g, "")}</Text>
      </View>
      {/* Post content */}
      <View style={{ backgroundColor: p.primary, aspectRatio: 1, width: "100%", padding: 30, justifyContent: "center", alignItems: "center" }}>
        <Logo src={p.isDark(p.primary) ? (p.logoWhiteUri ?? p.logoDataUri) : p.logoDataUri} size={48} fallbackColor={p.isDark(p.primary) ? "#ffffff33" : "#00000022"} fallbackInitial={p.companyName[0]} displayFont={p.displayFont} />
        <Text style={{ fontSize: 16, fontWeight: 700, color: p.isDark(p.primary) ? "#ffffff" : "#0a0a0a", fontFamily: p.displayFont, marginTop: 12, textAlign: "center" }}>
          {p.tagline}
        </Text>
        <Text style={{ fontSize: 8, color: p.isDark(p.primary) ? "#ffffff99" : "#00000066", marginTop: 8, fontFamily: p.bodyFont }}>
          {p.companyName.toLowerCase().replace(/\s+/g, "")}.nl
        </Text>
      </View>
      {/* Engagement bar */}
      <View style={{ backgroundColor: "#ffffff", paddingHorizontal: 12, paddingVertical: 8 }}>
        <View style={{ flexDirection: "row", gap: 12, marginBottom: 6 }}>
          <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: "#f4f4f5" }} />
          <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: "#f4f4f5" }} />
          <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: "#f4f4f5" }} />
        </View>
        <Text style={{ fontSize: 8, fontWeight: 700, color: "#0a0a0a", fontFamily: p.bodyFont }}>126 vind-ik-leuks</Text>
      </View>
    </View>
  );
}

/* ═══════════════════════════════════════════
   2. WEBSITE BROWSER MOCKUP
   ═══════════════════════════════════════════ */

export function WebsiteMockup(p: MockupProps) {
  return (
    <View style={{ width: "100%", borderRadius: 8, overflow: "hidden", borderWidth: 1, borderColor: "#e5e5e5" }}>
      {/* Browser chrome */}
      <View style={{ backgroundColor: "#f4f4f5", paddingHorizontal: 12, paddingVertical: 8, flexDirection: "row", alignItems: "center", gap: 6 }}>
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#fca5a5" }} />
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#fde68a" }} />
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#86efac" }} />
        <View style={{ flex: 1, backgroundColor: "#ffffff", borderRadius: 4, paddingVertical: 4, paddingHorizontal: 8, marginLeft: 8 }}>
          <Text style={{ fontSize: 7, color: "#71717a", fontFamily: p.bodyFont }}>{p.companyName.toLowerCase().replace(/\s+/g, "")}.nl</Text>
        </View>
      </View>
      {/* Nav bar */}
      <View style={{ backgroundColor: "#ffffff", paddingHorizontal: 20, paddingVertical: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#f4f4f5" }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Logo src={p.logoDataUri} size={18} fallbackColor={p.primary} fallbackInitial={p.companyName[0]} displayFont={p.displayFont} />
          <Text style={{ fontSize: 10, fontWeight: 700, color: "#0a0a0a", fontFamily: p.displayFont }}>{p.companyName}</Text>
        </View>
        <View style={{ flexDirection: "row", gap: 14 }}>
          <Text style={{ fontSize: 8, color: "#71717a", fontFamily: p.bodyFont }}>Over ons</Text>
          <Text style={{ fontSize: 8, color: "#71717a", fontFamily: p.bodyFont }}>Aanbod</Text>
          <Text style={{ fontSize: 8, color: "#71717a", fontFamily: p.bodyFont }}>Contact</Text>
        </View>
      </View>
      {/* Hero section */}
      <View style={{ backgroundColor: p.darkNeutral, padding: 30 }}>
        <Text style={{ fontSize: 20, fontWeight: 700, color: "#ffffff", fontFamily: p.displayFont, marginBottom: 8 }}>
          {p.tagline}
        </Text>
        <Text style={{ fontSize: 9, color: "#ffffff99", fontFamily: p.bodyFont, marginBottom: 16, maxWidth: 250 }}>
          Ontdek wat {p.companyName} voor jou kan betekenen.
        </Text>
        <View style={{ backgroundColor: p.primary, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 4, alignSelf: "flex-start" }}>
          <Text style={{ fontSize: 8, fontWeight: 700, color: p.isDark(p.primary) ? "#ffffff" : "#0a0a0a", fontFamily: p.bodyFont }}>Ontdek meer</Text>
        </View>
      </View>
    </View>
  );
}

/* ═══════════════════════════════════════════
   3. BRIEFPAPIER / LETTERHEAD
   ═══════════════════════════════════════════ */

export function LetterheadMockup(p: MockupProps) {
  return (
    <View style={{ width: "100%", backgroundColor: "#ffffff", borderRadius: 4, borderWidth: 1, borderColor: "#e5e5e5", padding: 24, minHeight: 300 }}>
      {/* Header */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 30, paddingBottom: 12, borderBottomWidth: 2, borderBottomColor: p.primary }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Logo src={p.logoDataUri} size={28} fallbackColor={p.primary} fallbackInitial={p.companyName[0]} displayFont={p.displayFont} />
          <View>
            <Text style={{ fontSize: 12, fontWeight: 700, color: "#0a0a0a", fontFamily: p.displayFont }}>{p.companyName}</Text>
            <Text style={{ fontSize: 7, color: "#71717a", fontFamily: p.bodyFont }}>{p.tagline}</Text>
          </View>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={{ fontSize: 7, color: "#71717a", fontFamily: p.bodyFont }}>Straatnaam 1</Text>
          <Text style={{ fontSize: 7, color: "#71717a", fontFamily: p.bodyFont }}>1234 AB Amsterdam</Text>
          <Text style={{ fontSize: 7, color: p.primary, fontFamily: p.bodyFont }}>info@{p.companyName.toLowerCase().replace(/\s+/g, "")}.nl</Text>
        </View>
      </View>
      {/* Body placeholder lines */}
      <Text style={{ fontSize: 8, color: "#3f3f46", fontFamily: p.bodyFont, marginBottom: 16 }}>Geachte heer/mevrouw,</Text>
      {[220, 250, 240, 180].map((w, i) => (
        <View key={i} style={{ width: w, height: 4, backgroundColor: "#f4f4f5", borderRadius: 2, marginBottom: 8 }} />
      ))}
      <View style={{ width: 120, height: 4, backgroundColor: "#f4f4f5", borderRadius: 2, marginTop: 16, marginBottom: 8 }} />
      {/* Footer */}
      <View style={{ marginTop: "auto", paddingTop: 12, borderTopWidth: 1, borderTopColor: "#e5e5e5", flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={{ fontSize: 6, color: "#a1a1aa", fontFamily: p.bodyFont }}>KVK 12345678 · BTW NL001234567B01</Text>
        <Text style={{ fontSize: 6, color: "#a1a1aa", fontFamily: p.bodyFont }}>IBAN NL00 BANK 0123 4567 89</Text>
      </View>
    </View>
  );
}

/* ═══════════════════════════════════════════
   4. PRESENTATIE SLIDE
   ═══════════════════════════════════════════ */

export function PresentationSlideMockup(p: MockupProps) {
  return (
    <View style={{ width: "100%", aspectRatio: 16 / 9, backgroundColor: p.darkNeutral, borderRadius: 8, overflow: "hidden", padding: 30, justifyContent: "space-between" }}>
      {/* Top bar with logo */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Logo src={p.logoWhiteUri ?? p.logoDataUri} size={20} fallbackColor={p.primary} fallbackInitial={p.companyName[0]} displayFont={p.displayFont} />
          <Text style={{ fontSize: 9, fontWeight: 700, color: "#ffffff", fontFamily: p.displayFont }}>{p.companyName}</Text>
        </View>
        <View style={{ width: 40, height: 3, backgroundColor: p.primary, borderRadius: 2 }} />
      </View>
      {/* Center title */}
      <View>
        <Text style={{ fontSize: 22, fontWeight: 700, color: "#ffffff", fontFamily: p.displayFont, lineHeight: 1.1 }}>
          {p.tagline}
        </Text>
        <View style={{ width: 50, height: 3, backgroundColor: p.primary, borderRadius: 2, marginTop: 12 }} />
      </View>
      {/* Bottom */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
        <Text style={{ fontSize: 7, color: "#ffffff66", fontFamily: p.bodyFont }}>{p.companyName} · Presentatie 2026</Text>
        <Text style={{ fontSize: 7, color: "#ffffff66", fontFamily: p.bodyFont }}>01</Text>
      </View>
    </View>
  );
}

/* ═══════════════════════════════════════════
   5. T-SHIRT / MERCHANDISE
   ═══════════════════════════════════════════ */

export function MerchandiseMockup(p: MockupProps) {
  return (
    <View style={{ width: "100%", backgroundColor: p.lightNeutral, borderRadius: 8, overflow: "hidden", alignItems: "center", paddingVertical: 20 }}>
      {/* T-shirt shape */}
      <View style={{ width: 160, height: 180, backgroundColor: p.darkNeutral, borderRadius: 4, alignItems: "center", justifyContent: "center", position: "relative" }}>
        {/* Collar */}
        <View style={{ position: "absolute", top: 0, width: 40, height: 12, backgroundColor: p.lightNeutral, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 }} />
        {/* Logo on shirt */}
        <View style={{ marginTop: 10, alignItems: "center" }}>
          <Logo src={p.logoWhiteUri ?? p.logoDataUri} size={40} fallbackColor="#ffffff33" fallbackInitial={p.companyName[0]} displayFont={p.displayFont} />
          <Text style={{ fontSize: 8, fontWeight: 700, color: "#ffffff", fontFamily: p.displayFont, marginTop: 6 }}>{p.companyName}</Text>
        </View>
      </View>
      <Text style={{ fontSize: 7, color: "#71717a", marginTop: 10, fontFamily: p.bodyFont }}>Merchandise: T-shirt</Text>
    </View>
  );
}

/* ═══════════════════════════════════════════
   6. KOFFIEBEKER
   ═══════════════════════════════════════════ */

export function CoffeeCupMockup(p: MockupProps) {
  return (
    <View style={{ width: "100%", backgroundColor: p.lightNeutral, borderRadius: 8, overflow: "hidden", alignItems: "center", paddingVertical: 20 }}>
      {/* Cup shape */}
      <View style={{ width: 80, height: 100, backgroundColor: "#ffffff", borderRadius: 4, borderBottomLeftRadius: 8, borderBottomRightRadius: 8, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#e5e5e5", position: "relative" }}>
        {/* Sleeve */}
        <View style={{ position: "absolute", top: 25, left: 0, right: 0, height: 35, backgroundColor: p.primary, alignItems: "center", justifyContent: "center" }}>
          <Logo src={p.isDark(p.primary) ? (p.logoWhiteUri ?? p.logoDataUri) : p.logoDataUri} size={20} fallbackColor={p.isDark(p.primary) ? "#ffffff33" : "#00000022"} fallbackInitial={p.companyName[0]} displayFont={p.displayFont} />
        </View>
        {/* Lid */}
        <View style={{ position: "absolute", top: -8, width: 88, height: 10, backgroundColor: p.darkNeutral, borderRadius: 2 }} />
      </View>
      <Text style={{ fontSize: 7, color: "#71717a", marginTop: 10, fontFamily: p.bodyFont }}>Merchandise: Koffiebeker</Text>
    </View>
  );
}

/* ═══════════════════════════════════════════
   7. SOCIAL MEDIA HEADER / BANNER
   ═══════════════════════════════════════════ */

export function SocialBannerMockup(p: MockupProps) {
  return (
    <View style={{ width: "100%", borderRadius: 8, overflow: "hidden", borderWidth: 1, borderColor: "#e5e5e5" }}>
      {/* Banner */}
      <View style={{ width: "100%", height: 80, backgroundColor: p.primary, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ fontSize: 14, fontWeight: 700, color: p.isDark(p.primary) ? "#ffffff" : "#0a0a0a", fontFamily: p.displayFont }}>
          {p.companyName}
        </Text>
        <Text style={{ fontSize: 7, color: p.isDark(p.primary) ? "#ffffff99" : "#00000066", fontFamily: p.bodyFont, marginTop: 2 }}>
          {p.tagline}
        </Text>
      </View>
      {/* Profile area */}
      <View style={{ backgroundColor: "#ffffff", paddingHorizontal: 16, paddingVertical: 12, flexDirection: "row", alignItems: "center", gap: 10 }}>
        <View style={{ marginTop: -20, borderWidth: 2, borderColor: "#ffffff", borderRadius: 24 }}>
          <Logo src={p.logoDataUri} size={40} fallbackColor={p.primary} fallbackInitial={p.companyName[0]} displayFont={p.displayFont} />
        </View>
        <View>
          <Text style={{ fontSize: 10, fontWeight: 700, color: "#0a0a0a", fontFamily: p.bodyFont }}>{p.companyName}</Text>
          <Text style={{ fontSize: 7, color: "#71717a", fontFamily: p.bodyFont }}>@{p.companyName.toLowerCase().replace(/\s+/g, "")}</Text>
        </View>
      </View>
    </View>
  );
}

/* ═══════════════════════════════════════════
   8. FACTUUR / INVOICE
   ═══════════════════════════════════════════ */

export function InvoiceMockup(p: MockupProps) {
  return (
    <View style={{ width: "100%", backgroundColor: "#ffffff", borderRadius: 4, borderWidth: 1, borderColor: "#e5e5e5", padding: 20 }}>
      {/* Header */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Logo src={p.logoDataUri} size={24} fallbackColor={p.primary} fallbackInitial={p.companyName[0]} displayFont={p.displayFont} />
          <Text style={{ fontSize: 11, fontWeight: 700, color: "#0a0a0a", fontFamily: p.displayFont }}>{p.companyName}</Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={{ fontSize: 14, fontWeight: 700, color: p.primary, fontFamily: p.displayFont }}>FACTUUR</Text>
          <Text style={{ fontSize: 7, color: "#71717a", fontFamily: p.bodyFont }}>#2026-001</Text>
        </View>
      </View>
      {/* Table header */}
      <View style={{ flexDirection: "row", backgroundColor: p.primary, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 3 }}>
        <Text style={{ flex: 3, fontSize: 7, fontWeight: 700, color: p.isDark(p.primary) ? "#ffffff" : "#0a0a0a", fontFamily: p.bodyFont }}>Omschrijving</Text>
        <Text style={{ flex: 1, fontSize: 7, fontWeight: 700, color: p.isDark(p.primary) ? "#ffffff" : "#0a0a0a", fontFamily: p.bodyFont, textAlign: "right" }}>Bedrag</Text>
      </View>
      {/* Table rows */}
      {["Dienstverlening pakket A", "Aanvullende werkzaamheden"].map((item, i) => (
        <View key={i} style={{ flexDirection: "row", paddingHorizontal: 8, paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: "#f4f4f5" }}>
          <Text style={{ flex: 3, fontSize: 7, color: "#3f3f46", fontFamily: p.bodyFont }}>{item}</Text>
          <Text style={{ flex: 1, fontSize: 7, color: "#3f3f46", fontFamily: p.bodyFont, textAlign: "right" }}>{i === 0 ? "€ 1.250,00" : "€ 375,00"}</Text>
        </View>
      ))}
      {/* Total */}
      <View style={{ flexDirection: "row", paddingHorizontal: 8, paddingVertical: 6, marginTop: 4 }}>
        <Text style={{ flex: 3, fontSize: 8, fontWeight: 700, color: "#0a0a0a", fontFamily: p.bodyFont }}>Totaal</Text>
        <Text style={{ flex: 1, fontSize: 8, fontWeight: 700, color: p.primary, fontFamily: p.bodyFont, textAlign: "right" }}>€ 1.625,00</Text>
      </View>
    </View>
  );
}
