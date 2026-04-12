/**
 * WCAG 2.1 Contrast Ratio Utilities
 * Server-side validation — don't rely on Claude's estimates.
 */

// ── Hex → linear RGB ──

function hexToSrgb(hex: string): [number, number, number] {
  const c = hex.replace("#", "");
  return [
    parseInt(c.slice(0, 2), 16) / 255,
    parseInt(c.slice(2, 4), 16) / 255,
    parseInt(c.slice(4, 6), 16) / 255,
  ];
}

function srgbToLinear(v: number): number {
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToSrgb(hex).map(srgbToLinear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// ── Contrast ratio (WCAG 2.1 §1.4.3) ──

export function contrastRatio(hex1: string, hex2: string): number {
  const l1 = relativeLuminance(hex1);
  const l2 = relativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// ── WCAG pass/fail ──

export function wcagAA(ratio: number, largeText = false): boolean {
  return largeText ? ratio >= 3 : ratio >= 4.5;
}

export function wcagAAA(ratio: number, largeText = false): boolean {
  return largeText ? ratio >= 4.5 : ratio >= 7;
}

// ── Format ratio for display ──

export function formatRatio(ratio: number): string {
  return `${ratio.toFixed(1)}:1`;
}

// ── Validate & recalculate accessibility array from color palette ──

import type { ColorSwatch, ColorAccessibility } from "@/types/brand";

export function calculateAccessibility(colors: ColorSwatch[]): ColorAccessibility[] {
  const primary = colors.find(c => c.category === "primary");
  const secondary = colors.find(c => c.category === "secondary");
  const darkNeutral = colors.find(c => c.category === "neutral" && isLowLuminance(c.hex));
  const lightNeutral = colors.find(c => c.category === "neutral" && isHighLuminance(c.hex));

  const combos: ColorAccessibility[] = [];

  // Primary on white
  if (primary) {
    const ratio = contrastRatio(primary.hex, "#FFFFFF");
    combos.push({
      combination: "Primair op Wit",
      foreground: primary.hex,
      background: "#FFFFFF",
      contrastRatio: formatRatio(ratio),
      wcagAA: wcagAA(ratio),
      wcagAAA: wcagAAA(ratio),
    });
  }

  // White on primary
  if (primary) {
    const ratio = contrastRatio("#FFFFFF", primary.hex);
    combos.push({
      combination: "Wit op Primair",
      foreground: "#FFFFFF",
      background: primary.hex,
      contrastRatio: formatRatio(ratio),
      wcagAA: wcagAA(ratio),
      wcagAAA: wcagAAA(ratio),
    });
  }

  // Dark neutral on light neutral
  if (darkNeutral && lightNeutral) {
    const ratio = contrastRatio(darkNeutral.hex, lightNeutral.hex);
    combos.push({
      combination: "Donker op Licht neutraal",
      foreground: darkNeutral.hex,
      background: lightNeutral.hex,
      contrastRatio: formatRatio(ratio),
      wcagAA: wcagAA(ratio),
      wcagAAA: wcagAAA(ratio),
    });
  }

  // Primary on light neutral
  if (primary && lightNeutral) {
    const ratio = contrastRatio(primary.hex, lightNeutral.hex);
    combos.push({
      combination: "Primair op Licht neutraal",
      foreground: primary.hex,
      background: lightNeutral.hex,
      contrastRatio: formatRatio(ratio),
      wcagAA: wcagAA(ratio),
      wcagAAA: wcagAAA(ratio),
    });
  }

  // Secondary on white
  if (secondary) {
    const ratio = contrastRatio(secondary.hex, "#FFFFFF");
    combos.push({
      combination: "Secundair op Wit",
      foreground: secondary.hex,
      background: "#FFFFFF",
      contrastRatio: formatRatio(ratio),
      wcagAA: wcagAA(ratio),
      wcagAAA: wcagAAA(ratio),
    });
  }

  return combos;
}

// ── Helpers ──

function isLowLuminance(hex: string): boolean {
  return relativeLuminance(hex) < 0.2;
}

function isHighLuminance(hex: string): boolean {
  return relativeLuminance(hex) > 0.4;
}
